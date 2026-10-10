const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const elements = new Map();
const storage = new Map();
const recordings = [];
const spoken = [];
const timers = new Map();
const timerDelays = new Map();
let nextTimer = 0;
const button = () => ({dataset:{}, classList:{toggle(){}}, setAttribute(){}, querySelector(){return null;}});
const element = selector => {
  if (!elements.has(selector)) elements.set(selector, {
    textContent:'', value:'', hidden:false, innerHTML:'',
    classList:{add(){},remove(){},toggle(){}}, setAttribute(){},removeAttribute(){},
    lastElementChild:{scrollIntoView(){}}, querySelector(){return null;}
  });
  return elements.get(selector);
};
class Recognition {
  constructor() { recordings.push(this); }
  start() { this.onstart?.(); }
  stop() { this.stopped = true; }
  abort() { this.aborted = true; }
  emit(text, final=false) {
    const result = [{transcript:text}];
    result.isFinal = final;
    this.onresult({results:[result]});
  }
}
const context = vm.createContext({
  console, AbortController,
  setTimeout(fn,delay) { const id=++nextTimer; timers.set(id,fn); timerDelays.set(id,delay); return id; },
  clearTimeout(id) { timers.delete(id); },
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
  window:{SpeechRecognition:Recognition, speechSynthesis:{}},
  speechSynthesis:{cancel(){}},
  document:{querySelector:element,querySelectorAll:selector=>selector === 'audio' ? [{pause(){context.audioPaused++;}}] : [],addEventListener(){}, createElement:()=>({textContent:"", get innerHTML(){return this.textContent;}, set innerHTML(value){this.value=value;}})},
  fetch:async()=>{throw new Error('Unexpected network request');}
});
vm.runInContext(fs.readFileSync(path.join(root,'research-reference.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run = code => vm.runInContext(code,context);
context.spoken = spoken;
run('say = (text,lang) => spoken.push({text,lang});');
const flush = () => new Promise(resolve => setImmediate(resolve));
context.audioPaused=0;
const musicButton=element('#music-listen');
musicButton.dataset={};
async function main() {
  element("#music-capture-length").value="clip";
  run('sourceLanguage="es-MX"; startMusicListening()');
  const first=recordings.at(-1);
  assert.equal(first.continuous,true);
  assert.equal(first.lang,'es-MX');
  assert.equal(context.audioPaused,1);
  assert.equal(musicButton.textContent,'Stop listening');
  first.emit('Caminando aterrorizando la cuadra',true);
  assert.equal(element('#translator-input').value,'Caminando aterrorizando la cuadra','music preserves words instead of applying speech-dictation corrections');
  const secondResult=[{transcript:'otra frase'}]; secondResult.isFinal=false;
  const firstResult=[{transcript:'Caminando aterrorizando la cuadra'}]; firstResult.isFinal=true;
  first.onresult({results:[firstResult,secondResult]});
  assert.equal(element('#translator-input').value,'Caminando aterrorizando la cuadra otra frase','keeps all results, not just the first final');
  await run('renderTranslation()'); // No fetch while capture is awaiting review.
  assert.equal(run('musicListening.heard'),true);
  run('stopMusicListening()');
  assert.equal(first.stopped,true);
  assert.equal(musicButton.disabled,true);
  first.onend();
  assert.equal(musicButton.disabled,false);
  assert.equal(musicButton.textContent,'Continue listening');
  assert.equal(element('#translate-music').disabled,false);
  assert.match(element('#music-listening-status').textContent,/Check the words/);
  await run('renderTranslation()'); // No fetch until the explicit translate action.
  first.emit('stale words',true);
  assert.equal(element('#translator-input').value,'Caminando aterrorizando la cuadra otra frase');

  // Continuing a passage and then a regular microphone rejects old events.
  run('startMusicListening()');
  const old=recordings.at(-1);
  old.emit('New captured passage');
  context.normalButton=button();
  run('startListening({button:normalButton,onText:text=>{document.querySelector("#translator-input").value=text;}})');
  const normal=recordings.at(-1);
  assert.equal(old.aborted,true);
  assert.equal(run('musicListening'),null);
  old.emit('old lyrics',true); old.onend(); old.onerror({error:'network'});
  normal.emit('ordinary dictation',true);
  assert.equal(element('#translator-input').value,'ordinary dictation');
  normal.onend();

  // A browser that ends by itself keeps an interim-only passage.
  run('startMusicListening()');
  const interim=recordings.at(-1);
  interim.emit('unconfirmed words'); interim.onend();
  assert.equal(element('#translator-input').value,'unconfirmed words');
  assert.equal(element('#translate-music').disabled,false);

  // Failed capture doesn't destroy the previous text or enable an old clip.
  run('newMusicSong()');
  element('#translator-input').value='unconfirmed words';
  run('startMusicListening()');
  const noSpeech=recordings.at(-1);
  noSpeech.onerror({error:'no-speech'}); noSpeech.onend();
  assert.equal(element('#translator-input').value,'unconfirmed words');
  assert.equal(element('#translate-music').disabled,true);
  assert.match(element('#music-listening-status').textContent,/No words detected/);

  run('startMusicListening()');
  const failed=recordings.at(-1);
  failed.emit('words before a network failure');
  failed.onerror({error:'network'}); failed.onend();
  assert.match(element('#music-listening-status').textContent,/network|service/);
  assert.match(element('#music-listening-status').textContent,/kept above/);
  assert.equal(element('#translate-music').disabled,false);

  // Timeout stops after 30 seconds; a missing end event cannot strand the UI.
  run('startMusicListening()');
  const timeout=recordings.at(-1);
  timeout.emit('timed capture');
  const limit=run('musicListening.timer');
  assert.equal(timerDelays.get(limit),30000);
  timers.get(limit)();
  assert.equal(timeout.stopped,true);
  const fallback=run('musicListening.finishTimer'); timers.get(fallback)();
  assert.equal(timeout.aborted,true);
  assert.equal(run('recognition'),null);
  assert.equal(run('musicListening'),null);
  assert.equal(musicButton.disabled,false);
  assert.equal(element('#translator-input').value,'words before a network failure\ntimed capture');
  timeout.onend(); timeout.emit('late timeout result',true);
  assert.equal(element('#translator-input').value,'words before a network failure\ntimed capture');

  run('startMusicListening()');
  const cancelled=recordings.at(-1); cancelled.emit('before edit');
  element('#translator-input').value='user edited words';
  run('cancelListening(false)');
  cancelled.emit('overwrite attempt',true);
  assert.equal(element('#translator-input').value,'user edited words');

  // Whole song keeps each session's words, even repeated choruses, once.
  run('newMusicSong()');
  element('#music-capture-length').value='song';
  run('startMusicListening()');
  const whole=recordings.at(-1);
  assert.equal(timerDelays.get(run('musicListening.timer')),600000);
  whole.emit('First verse',true); whole.onend();
  assert.ok(run('musicListening'),'a normal end keeps the whole-song session active');
  assert.equal(element('#translate-music').disabled,true);
  const restart=run('musicListening.restartTimer'); timers.get(restart)();
  const next=recordings.at(-1);
  assert.notEqual(next,whole);
  whole.emit('late first verse',true);
  next.emit('The chorus'); next.emit('The chorus repeated',true);
  assert.equal(element('#translator-input').value,'First verse\nThe chorus repeated','interim is replaced rather than duplicated');
  next.onend();
  const restart2=run('musicListening.restartTimer'); timers.get(restart2)();
  const third=recordings.at(-1);
  third.emit('The chorus repeated',true);
  assert.equal(element('#translator-input').value,'First verse\nThe chorus repeated\nThe chorus repeated','repeated song lines are not deduplicated');
  run('stopMusicListening()'); third.onend();
  assert.equal(run('musicListening'),null);
  assert.equal(element('#translate-music').disabled,false);
  await run('renderTranslation()'); // Still requires an explicit translation action.

  // A pause can append to the reviewed transcript without erasing user edits.
  element('#translator-input').value='Edited first verse';
  run('musicCapturedText="Edited first verse"; startMusicListening()');
  const continued=recordings.at(-1); continued.emit('Last verse');
  run('stopMusicListening()'); continued.onend();
  assert.equal(element('#translator-input').value,'Edited first verse\nLast verse');
  run('musicTranscriptReview=false; startMusicListening()'); // Continue after translating, too.
  const afterTranslation=recordings.at(-1); afterTranslation.emit('Outro');
  run('stopMusicListening()'); afterTranslation.onend();
  assert.equal(element('#translator-input').value,'Edited first verse\nLast verse\nOutro');

  // Cancel during the restart gap prevents a new microphone starting later.
  run('startMusicListening()');
  const gap=recordings.at(-1); gap.emit('Gap verse',true); gap.onend();
  const queued=timers.get(run('musicListening.restartTimer'));
  const before=recordings.length;
  run('cancelMusicListening()'); queued();
  assert.equal(recordings.length,before);
  assert.equal(run('musicListening'),null);
  assert.equal(musicButton.disabled,false);

  // Errors do not start an endless retry loop; existing lyrics remain usable.
  run('startMusicListening()');
  const interrupted=recordings.at(-1); interrupted.onerror({error:'network'}); interrupted.onend();
  assert.equal(run('musicListening'),null);
  assert.equal(element('#translate-music').disabled,false);
  assert.match(element('#music-listening-status').textContent,/kept above/);

  // A new song clears capture; a different source locale cannot append old words.
  run('sourceLanguage="es-CO"; startMusicListening()');
  const changed=recordings.at(-1); changed.emit('Different song language',true);
  run('stopMusicListening()'); changed.onend();
  assert.equal(element('#translator-input').value,'Different song language');
  run('newMusicSong()');
  assert.equal(element('#translator-input').value,'');
  assert.equal(element('#translate-music').disabled,true);
  assert.equal(musicButton.textContent,'Listen to music');
  element('#translator-input').value='user edited words';

  // Same-phone Bluetooth attempts must keep Habla's song audible, while
  // retaining single-track playback and every transcript/session safeguard.
  element('#music-playback-source').value='phone-bluetooth';
  run('updateMusicSourceHelp()');
  assert.equal(element('#bluetooth-music-help').hidden,false);
  const pausesBefore=context.audioPaused;
  run('startMusicListening()');
  assert.equal(context.audioPaused,pausesBefore,'Bluetooth mode does not pause the source song');
  assert.equal(run('musicListening.phoneBluetooth'),true);
  assert.equal(element('#music-playback-source').disabled,true);
  const bluetooth=recordings.at(-1);
  assert.match(element('#music-listening-status').textContent,/Bluetooth speaker is still playing/);
  context.activePlayer={paused:false,pause(){throw new Error('The active track should keep playing');}};
  let otherPauses=0;
  context.otherPlayer={paused:false,pause(){otherPauses++;}};
  run('handleMusicPlayerPlay(activePlayer,[activePlayer,otherPlayer])');
  assert.equal(otherPauses,1,'only one track remains audible');
  assert.equal(bluetooth.aborted,undefined,'starting a track does not cancel Bluetooth capture');
  bluetooth.emit('Words from the speaker');
  bluetooth.onerror({error:'no-speech'}); bluetooth.onend();
  assert.equal(element('#music-playback-source').disabled,false);
  assert.equal(element('#translate-music').disabled,false);
  assert.match(element('#music-listening-status').textContent,/iOS may pause/);
  assert.match(element('#music-listening-status').textContent,/kept above/);
  assert.equal(element('#translator-input').value,'Words from the speaker');

  element('#music-playback-source').value='external';
  run('updateMusicSourceHelp(); startMusicListening()');
  assert.equal(element('#bluetooth-music-help').hidden,true);
  assert.equal(context.audioPaused,pausesBefore+1,'external-source mode still prevents feedback from app music');
  const external=recordings.at(-1);
  run('handleMusicPlayerPlay(activePlayer,[activePlayer])');
  assert.equal(external.aborted,true,'ordinary playback still interrupts external capture');
  assert.equal(run('musicListening'),null);
  run('newMusicSong()');
  element('#translator-input').value='user edited words';

  // Unsupported browsers do not clear text or imported document state.
  context.window.SpeechRecognition=null;
  run('documentImportActive=true; startMusicListening()');
  assert.equal(run('documentImportActive'),true);
  assert.equal(element('#translator-input').value,'user edited words');
  assert.match(element('#music-listening-status').textContent,/unavailable/);
  // Live drafts run independently of the mic and are bounded to a recent passage.
  context.window.SpeechRecognition=Recognition;
  element('#music-live-translation').checked=true;
  const drafts=[];
  let settle;
  context.liveTranslate=(text,way,options)=>{
    drafts.push({text,way,options});
    return new Promise(resolve=>{settle=resolve;});
  };
  run('requestGeneralTranslation=liveTranslate; sourceLanguage="es-MX"; targetLanguage="en-GB"; syncLanguagePair(); newMusicSong(); startMusicListening()');
  const liveRecognition=recordings.at(-1);
  liveRecognition.emit('Hola amiga estamos bailando');
  const firstTimer=run('musicListening.live.timer');
  assert.equal(timerDelays.get(firstTimer),8000);
  liveRecognition.emit('Hola amiga estamos bailando juntos');
  assert.equal(run('musicListening.live.timer'),firstTimer,'interim bursts share one scheduled request');
  timers.get(firstTimer)();
  assert.equal(drafts.length,1);
  assert.equal(drafts[0].options.target,'en-GB');
  assert.equal(drafts[0].options.inputType,'music');
  liveRecognition.emit('Hola amiga estamos bailando juntos esta noche');
  assert.equal(run('musicListening.live.timer'),null,'only one translation is in flight');
  settle('Hello friend, we are dancing together.'); await flush();
  assert.equal(element('#music-live-draft').value,'Hello friend, we are dancing together.');
  assert.equal(element('#music-live-source').textContent,'Hola amiga estamos bailando juntos');
  assert.match(element('#music-live-label').textContent,/U.K. English/);
  assert.equal(element('#music-live-draft').readOnly,true);
  const secondTimer=run('musicListening.live.timer');
  assert.ok(secondTimer,'new words schedule the next draft after the first completes');
  timers.get(secondTimer)();
  assert.equal(drafts.length,2);
  run('stopMusicListening()');liveRecognition.onend();
  element('#music-live-draft').value='My corrected draft';
  settle('Late stale translation');await flush();
  assert.equal(element('#music-live-draft').value,'My corrected draft','late responses after Stop cannot overwrite edits');
  assert.equal(element('#music-live-draft').readOnly,false);
  run('newMusicSong()');
  assert.equal(element('#music-live-draft').value,'');
  assert.equal(element('#music-live-preview').hidden,true);

  // Toggling off/on during a request invalidates it and schedules a fresh draft.
  run('startMusicListening()');const toggled=recordings.at(-1);
  toggled.emit('Ahora escuchamos una nueva canción');
  timers.get(run('musicListening.live.timer'))();
  const beforeToggle=element('#music-live-draft').value;
  run('setMusicLiveEnabled(false); setMusicLiveEnabled(true)');
  settle('Ignored while mode changed');await flush();
  assert.equal(element('#music-live-draft').value,beforeToggle);
  assert.ok(run('musicListening.live.timer'));
  // A target change cannot display the previous target's delayed draft.
  timers.get(run('musicListening.live.timer'))();
  run('targetLanguage="en-US"; syncLanguagePair(); refreshMusicLiveRoute()');
  settle('Old UK draft');await flush();
  assert.equal(element('#music-live-preview').hidden,true);
  timers.get(run('musicListening.live.timer'))();
  assert.equal(drafts.at(-1).options.target,'en-US');
  settle('New US draft');await flush();
  assert.equal(element('#music-live-draft').value,'New US draft');
  const requestsBefore=drafts.length;
  toggled.emit('Ahora escuchamos una nueva canción');
  timers.get(run('musicListening.live.timer'))();await flush();
  assert.equal(drafts.length,requestsBefore,'unchanged passage makes no repeated request');
  run('cancelMusicListening(); newMusicSong()');

  // A service failure pauses only the preview; text and microphone stay usable.
  context.liveTranslate=async()=>{const e=new Error('quota');e.code='quota';throw e;};
  run('requestGeneralTranslation=liveTranslate; startMusicListening()');
  const quotaRecognition=recordings.at(-1);
  quotaRecognition.emit('Guardamos las palabras de esta canción');
  timers.get(run('musicListening.live.timer'))();await flush();
  assert.ok(run('musicListening'));
  assert.equal(quotaRecognition.aborted,undefined);
  assert.match(element('#music-live-status').textContent,/Live draft paused/);
  assert.equal(element('#translator-input').value,'Guardamos las palabras de esta canción');
  assert.equal(run('musicListening.live.failed'),true);
  run('cancelMusicListening()');
  assert.match(element('#music-live-status').textContent,/Capture stopped/);
  assert.doesNotMatch(element('#music-live-status').textContent,/Capturing words continues/);
  run('newMusicSong()');

  // Online preview budget does not limit on-device translation or stop capture.
  context.liveTranslate=async(text,way,options)=>{drafts.push({text,way,options});return 'Offline draft';};
  run('requestGeneralTranslation=liveTranslate; startMusicListening(); musicListening.live.requests=30');
  const budgetRecognition=recordings.at(-1);
  budgetRecognition.emit('Seguimos escuchando con nuestro teléfono');
  const beforeBudget=drafts.length;
  timers.get(run('musicListening.live.timer'))();await flush();
  assert.equal(drafts.length,beforeBudget);
  assert.match(element('#music-live-status').textContent,/protect the free allowance/);
  assert.ok(run('musicListening'));
  context.HablaOffline={shouldUse:()=>true};
  run('refreshMusicLiveRoute()');
  assert.equal(timerDelays.get(run('musicListening.live.timer')),3000);
  timers.get(run('musicListening.live.timer'))();await flush();
  assert.equal(drafts.at(-1).options.onDevice,true);
  assert.equal(element('#music-live-draft').value,'Offline draft');
  run('cancelMusicListening(); newMusicSong(); startMusicListening()');
  const deniedLive=recordings.at(-1);
  deniedLive.onerror({error:'not-allowed'});deniedLive.onend();
  assert.match(element('#music-live-status').textContent,/Capture stopped before a live draft was ready/);
  assert.equal(element('#music-capture-length').disabled,false);
  run('newMusicSong()');
  context.longPassage='ámbito ecuatoriano y boliviano '.repeat(60);
  const bounded=run('recentMusicPassage(longPassage)');
  assert.ok(Buffer.byteLength(bounded,'utf8')<=450);
  assert.ok(bounded.endsWith('boliviano'));
  context.earlier='Las palabras de la primera estrofa quedan guardadas sin repetirse demasiado pronto';
  context.extended=context.earlier+' y ahora llegan palabras nuevas';
  const incremental=run('nextMusicLivePassage(extended,earlier)');
  assert.ok(incremental.endsWith('y ahora llegan palabras nuevas'));
  assert.ok(!incremental.startsWith('Las palabras'),'stable earlier verses are not repeatedly translated');
  assert.equal(element('#translator-input').value,'');
  console.log('Music listening tests passed: live draft throttling, route ownership, stale responses, offline/online limits and mic independence');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
