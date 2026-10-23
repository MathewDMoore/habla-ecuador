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
    children:[], replaceChildren(){this.children=[];}, append(child){this.children.push(child);},
    classList:{add(){},remove(){},toggle(){}}, setAttribute(){},removeAttribute(){},
    lastElementChild:{scrollIntoView(){}}, querySelector(){return null;}, addEventListener(){}
  });
  return elements.get(selector);
};
class Recognition {
  constructor() { recordings.push(this); }
  start() { this.onstart?.(); }
  stop() { this.stopped = true; }
  abort() { this.aborted = true; }
  emit(text, final=false, metadata={}) {
    const result = [{transcript:text}];
    result.isFinal = final;
    this.onresult({results:[result], ...metadata});
  }
}
const context = vm.createContext({
  console, AbortController,
  setTimeout(fn,delay) { const id=++nextTimer; timers.set(id,fn); timerDelays.set(id,delay); return id; },
  clearTimeout(id) { timers.delete(id); },
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
  window:{SpeechRecognition:Recognition, speechSynthesis:{}},
  speechSynthesis:{cancel(){context.speechCancels=(context.speechCancels||0)+1;},resume(){context.speechResumes=(context.speechResumes||0)+1;}},
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
  assert.equal(context.audioPaused,0,'starting Listen keeps the existing song playing');
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
  const speechCancelsBefore=context.speechCancels||0,speechResumesBefore=context.speechResumes||0;
  run('startMusicListening()');
  assert.equal(context.audioPaused,pausesBefore,'Bluetooth mode does not pause the source song');
  assert.equal(context.speechCancels||0,speechCancelsBefore,'idle Listen does not call speech cancel');
  assert.equal(context.speechResumes||0,speechResumesBefore,'idle Listen does not activate speech resume');
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
  assert.equal(context.audioPaused,pausesBefore,'Listen never explicitly pauses music, including the default playback selection');
  const external=recordings.at(-1);
  run('handleMusicPlayerPlay(activePlayer,[activePlayer])');
  assert.equal(external.aborted,undefined,'playing a song keeps music capture active regardless of source selection');
  assert.equal(run('musicListening !== null'),true);
  run('newMusicSong()');
  run('activeSpeechPlayback={utterance:{}};startMusicListening()');
  assert.equal(context.speechCancels||0,speechCancelsBefore+1,'Listen still stops an actual Habla translation voice once');
  assert.equal(context.speechResumes||0,speechResumesBefore,'stopping a voice for capture does not resume speech');
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
  assert.equal(timerDelays.get(firstTimer),3000);
  liveRecognition.emit('Hola amiga estamos bailando juntos');
  assert.equal(run('musicListening.live.timer'),firstTimer,'interim bursts share one scheduled request');
  timers.get(firstTimer)();
  assert.equal(drafts.length,1);
  assert.equal(drafts[0].options.target,'en-GB');
  assert.equal(drafts[0].options.source,'es-MX');
  assert.equal(drafts[0].options.inputType,'music');
  liveRecognition.emit('Hola amiga estamos bailando juntos esta noche');
  assert.equal(run('musicListening.live.timer'),null,'only one translation is in flight');
  settle('Hello friend, we are dancing together.'); await flush();
  assert.equal(element('#music-live-draft').value,'Hello friend, we are dancing together.');
  assert.equal(element('#music-live-source').textContent,'Hola amiga estamos bailando juntos');
  assert.match(element('#music-live-label').textContent,/U.K. English/);
  assert.equal(element('#music-live-draft').readOnly,true);
  assert.equal(run('musicPassages.length'),1,'live drafts retain their paired source and translation');
  assert.equal(element('#music-review-source').value,'Hola amiga estamos bailando juntos');
  assert.equal(element('#music-review-draft').value,'Hello friend, we are dancing together.');
  assert.equal(element('#music-review-source').readOnly,true);
  const secondTimer=run('musicListening.live.timer');
  assert.ok(secondTimer,'new words schedule the next draft after the first completes');
  timers.get(secondTimer)();
  assert.equal(drafts.length,2);
  run('stopMusicListening()');liveRecognition.onend();
  element('#music-live-draft').value='My corrected draft';
  settle('Late stale translation');await flush();
  assert.equal(element('#music-live-draft').value,'My corrected draft','late responses after Stop cannot overwrite edits');
  assert.equal(element('#music-live-draft').readOnly,false);
  assert.equal(element('#music-review-source').readOnly,false);
  assert.equal(element('#music-review-translate').disabled,false);
  run('newMusicSong()');
  assert.equal(element('#music-live-draft').value,'');
  assert.equal(element('#music-live-preview').hidden,true);
  assert.equal(element('#music-review').hidden,true);
  assert.equal(run('musicPassages.length'),0);

  // Native passage finalization is separate from ending the microphone session.
  // Rough guesses remain visible, but neither route translates them automatically.
  run('startMusicListening()');
  const finalizedRecognition=recordings.at(-1);
  const beforeFinalized=drafts.length;
  finalizedRecognition.emit('Palabras mal reconocidas',false,{confirmedText:'',tentativeText:'Palabras mal reconocidas'});
  timers.get(run('musicListening.live.timer'))(); await flush();
  assert.equal(drafts.length,beforeFinalized,'tentative recognition spends no live request');
  assert.equal(run('musicListening.live.requests'),0);
  assert.match(element('#music-live-pending').textContent,/Tentative recognition/);
  assert.equal(element('#translator-input').value,'Palabras mal reconocidas');
  finalizedRecognition.emit('',false,{confirmedText:'',tentativeText:''});
  assert.equal(element('#translator-input').value,'','an empty native revision clears withdrawn guesses');
  finalizedRecognition.emit('Una frase completa. Otra conjetura',false,
    {confirmedText:'Una frase completa.',tentativeText:'Otra conjetura'});
  timers.get(run('musicListening.live.timer'))();
  assert.equal(drafts.at(-1).text,'Una frase completa.','only the finalized source reaches translation');
  assert.ok(run('musicListening'),'passage finalization does not end the song');
  finalizedRecognition.emit('Una frase completa. Otra revisión tentativa',false,
    {confirmedText:'Una frase completa.',tentativeText:'Otra revisión tentativa'});
  settle('A complete sentence.'); await flush();
  assert.equal(element('#music-live-source').textContent,'Una frase completa.');
  assert.match(element('#music-live-pending').textContent,/Otra revisión tentativa/);
  assert.equal(run('musicListening.live.timer'),null,'tentative-only revisions do not repeat the confirmed translation');
  finalizedRecognition.emit('Una frase completa. La segunda frase.',false,
    {confirmedText:'Una frase completa. La segunda frase.',tentativeText:''});
  timers.get(run('musicListening.live.timer'))();
  assert.equal(drafts.at(-1).text,'La segunda frase.');
  settle('The second sentence.'); await flush();
  assert.equal(element('#music-live-pending').hidden,true);
  assert.match(element('#music-live-status').textContent,/Finalized words can still be wrong/);
  finalizedRecognition.emit('Una frase completa. La segunda frase. Última conjetura',false,
    {confirmedText:'Una frase completa. La segunda frase.',tentativeText:'Última conjetura'});
  run('stopMusicListening()'); finalizedRecognition.onend();
  assert.match(element('#translator-input').value,/Última conjetura/,'Stop retains unconfirmed words for manual review');
  assert.equal(element('#translate-music').disabled,false);
  assert.match(element('#music-live-pending').textContent,/Unconfirmed words kept for review/);
  run('newMusicSong()');

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
  assert.equal(timerDelays.get(run('musicListening.live.timer')),1000);
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
  context.earlier='Las palabras de la primera estrofa quedan guardadas sin repetirse demasiado pronto.';
  context.extended=context.earlier+' Ahora llegan palabras nuevas';
  const incremental=run('nextMusicLivePassage(extended,earlier)');
  assert.equal(incremental,'Ahora llegan palabras nuevas');
  assert.ok(!incremental.startsWith('Las palabras'),'stable earlier verses are not repeatedly translated');
  assert.equal(run('nextMusicLivePassage("Por favor, no le digas que ya volvió.","Por favor, no le digas que ya")'), 'Por favor, no le digas que ya volvió.','a revised connected clause retains its beginning');
  assert.equal(run('nextMusicLivePassage(longPassage,"")'), '', 'an oversized unpunctuated clause is not chopped into a misleading tail');
  assert.match(run('musicFragmentReason("Por favor, no le digas que ya…","es-MX")'), /mid-clause/);
  assert.match(run('musicFragmentReason("Vamos para la","es-EC")'), /mid-clause/);
  assert.match(run('musicFragmentReason("Please do not tell her because","en-US")'), /mid-clause/);
  assert.equal(run('musicFragmentReason("Por favor, no le digas que ya volvió.","es-MX")'), '');
  assert.equal(run('musicFragmentReason("Vamos para allá ya.","es-MX")'), '');
  assert.equal(element('#translator-input').value,'');

  // Recording regression: incomplete "que ya" must not spend the free quota or
  // publish "you're already" as a finished translation. Later words recover it.
  run('startMusicListening()'); const fragmentRecognition=recordings.at(-1);
  const beforeFragment=drafts.length;
  fragmentRecognition.emit('Por favor, no le digas que ya');
  timers.get(run('musicListening.live.timer'))(); await flush();
  assert.equal(drafts.length,beforeFragment);
  assert.equal(run('musicListening.live.requests'),0);
  assert.equal(element('#music-live-preview').hidden,true);
  assert.equal(element('#music-live-pending').hidden,false);
  assert.match(element('#music-live-pending').textContent,/Por favor, no le digas que ya/);
  assert.match(element('#music-live-status').textContent,/mid-clause/);
  fragmentRecognition.emit('Por favor, no le digas que ya volvió.');
  timers.get(run('musicListening.live.timer'))(); await flush();
  assert.equal(drafts.length,beforeFragment+1);
  assert.equal(drafts.at(-1).text,'Por favor, no le digas que ya volvió.');
  assert.equal(element('#music-live-pending').hidden,true);
  assert.equal(element('#music-live-source').textContent,'Por favor, no le digas que ya volvió.');
  run('cancelMusicListening(); newMusicSong()');

  // Review retains paired passages; corrected Spanish can be translated through
  // its original route without silently editing the full captured transcript.
  context.HablaOffline={shouldUse:()=>true};
  context.liveTranslate=(text,way,options)=>{
    drafts.push({text,way,options});
    return new Promise(resolve=>{settle=resolve;});
  };
  run('requestGeneralTranslation=liveTranslate; sourceLanguage="es-MX"; targetLanguage="en-GB"; syncLanguagePair(); startMusicListening()');
  const reviewRecognition=recordings.at(-1);
  reviewRecognition.emit('Vamos a la pista para bailar');
  timers.get(run('musicListening.live.timer'))();
  settle('We are going to the runway to dance');await flush();
  reviewRecognition.emit('Vamos a la pista para bailar todos juntos esta noche');
  timers.get(run('musicListening.live.timer'))();
  settle('We are dancing together tonight');await flush();
  assert.equal(run('musicPassages.length'),2);
  assert.equal(element('#music-review-draft').value,'We are going to the runway to dance','earlier draft remains reviewable after a new live draft');
  run('stopMusicListening()');reviewRecognition.onend();
  const fullCapture=element('#translator-input').value;
  element('#music-review-source').value='Vamos a la pista de baile';
  element('#music-review-draft').value='My previous English edit';
  run('editMusicPassage(); targetLanguage="en-US"; syncLanguagePair(); translateReviewedMusicPassage()');
  assert.equal(drafts.at(-1).text,'Vamos a la pista de baile');
  assert.equal(drafts.at(-1).options.target,'en-GB','paired passage keeps its recorded target when the main selector changes');
  assert.equal(drafts.at(-1).options.source,'es-MX','paired passage keeps its recorded regional source');
  assert.equal(drafts.at(-1).options.onDevice,true);
  assert.equal(drafts.at(-1).options.inputType,'music');
  settle('Let’s go to the dance floor');await flush();
  assert.equal(element('#music-review-draft').value,'Let’s go to the dance floor');
  assert.equal(element('#translator-input').value,fullCapture,'passage correction does not silently replace the full capture');
  run('selectedMusicPassage=musicPassages[0].id; musicReviewRequest+=1; syncMusicReview()');
  assert.equal(element('#music-review-draft').value,'We are dancing together tonight');
  run('selectedMusicPassage=musicPassages[1].id; musicReviewRequest+=1; syncMusicReview()');
  assert.equal(element('#music-review-source').value,'Vamos a la pista de baile');
  assert.equal(element('#music-review-draft').value,'Let’s go to the dance floor','edits survive changing the reviewed passage');

  // An English edit, new capture or new song owns its content over delayed replies.
  run('translateReviewedMusicPassage()');
  element('#music-review-draft').value='Keep my newest wording';
  run('editMusicPassage()');
  settle('Stale server wording');await flush();
  assert.equal(element('#music-review-draft').value,'Keep my newest wording');
  assert.equal(element('#music-review-translate').disabled,false);
  run('translateReviewedMusicPassage(); startMusicListening()');
  settle('Late wording after capture starts');await flush();
  assert.equal(element('#music-review-draft').value,'Keep my newest wording');
  assert.equal(element('#music-review-translate').disabled,true);
  run('cancelMusicListening(); translateReviewedMusicPassage(); newMusicSong()');
  settle('Late wording after New song');await flush();
  assert.equal(run('musicPassages.length'),0);
  assert.equal(element('#music-review').hidden,true);
  assert.equal(element('#music-review-draft').value,'');

  // Free-route failure keeps both corrected source and prior draft. Oversized
  // source edits and empty passages never send a request.
  run('keepMusicPassage("Palabras del tema musical","Kept draft",{lang:"es-MX",live:{target:"en-GB",way:"ec-en",purpose:"general"}})');
  context.liveTranslate=async()=>{const e=new Error('quota');e.code='quota';throw e;};
  run('requestGeneralTranslation=liveTranslate; translateReviewedMusicPassage()');await flush();
  assert.equal(element('#music-review-draft').value,'Kept draft');
  assert.match(element('#music-review-status').textContent,/previous draft are kept/);
  const beforeLongReview=drafts.length;
  element('#music-review-source').value='á'.repeat(300);
  run('editMusicPassage(); translateReviewedMusicPassage()');await flush();
  assert.match(element('#music-review-status').textContent,/450 UTF-8/);
  assert.equal(drafts.length,beforeLongReview);
  element('#music-review-source').value='';run('editMusicPassage()');
  assert.equal(element('#music-review-translate').disabled,true);
  run('newMusicSong()');
  for(let i=0;i<25;i++)run(`keepMusicPassage("Passage ${i} source words","Draft ${i}",{lang:"es-MX",live:{target:"en-GB",way:"ec-en",purpose:"general"}})`);
  assert.equal(run('musicPassages.length'),20,'session history remains bounded');
  assert.equal(element('#music-review-passage').children.length,20);
  assert.equal(run('musicPassages.at(-1).id'),6,'older entries are evicted without reconstructing lyrics');
  run('newMusicSong()');
  // Quick previews remain provisional until the exact source is finalized.
  context.HablaOffline={shouldUse:()=>true};
  context.liveTranslate=(text,way,options)=>{
    drafts.push({text,way,options});
    return new Promise(resolve=>{settle=resolve;});
  };
  element('#music-live-translation').checked=true;
  run('requestGeneralTranslation=liveTranslate; setMusicLiveUpdateMode("quick"); startMusicListening()');
  const quick=recordings.at(-1);
  quick.emit('Una frase completa.',false,{confirmedText:'',tentativeText:'Una frase completa.'});
  timers.get(run('musicListening.live.timer'))();
  settle('A complete phrase.');await flush();
  assert.equal(run('musicListening.live.lastProvisional'),true);
  assert.equal(run('musicPassages.length'),0);
  assert.match(element('#music-live-label').textContent,/unconfirmed quick preview/);
  const previewRequests=drafts.length;
  quick.emit('Una frase completa.',true,{confirmedText:'Una frase completa.',tentativeText:''});
  timers.get(run('musicListening.live.timer'))();await flush();
  assert.equal(drafts.length,previewRequests,'confirmation promotes the existing draft without another request');
  assert.equal(run('musicListening.live.lastProvisional'),false);
  assert.equal(run('musicPassages.length'),1);
  run('cancelMusicListening(); newMusicSong(); startMusicListening()');
  const withdrawn=recordings.at(-1);
  withdrawn.emit('Otra frase completa.',false,{confirmedText:'',tentativeText:'Otra frase completa.'});
  timers.get(run('musicListening.live.timer'))();settle('Another complete phrase.');await flush();
  withdrawn.emit('',false,{confirmedText:'',tentativeText:''});
  timers.get(run('musicListening.live.timer'))();await flush();
  assert.equal(element('#music-live-preview').hidden,true,'withdrawn tentative recognition clears its preview');
  assert.equal(run('musicPassages.length'),0);
  run('cancelMusicListening(); newMusicSong(); setMusicLiveUpdateMode("confirmed")');

  // Retry preserves the microphone, captured words and consumed online budget.
  context.HablaOffline={shouldUse:()=>false};
  context.liveTranslate=async()=>{const error=new Error('network');error.code='network';throw error;};
  run('requestGeneralTranslation=liveTranslate; startMusicListening()');
  const retryRecognition=recordings.at(-1);
  retryRecognition.emit('Una frase para traducir.',true);
  timers.get(run('musicListening.live.timer'))();await flush();
  assert.equal(run('musicListening.live.failed'),true);
  assert.equal(element('#music-live-retry').hidden,false);
  const consumed=run('musicListening.live.characters');
  assert.equal(run('musicListening.live.requests'),1);
  context.liveTranslate=async()=> 'A phrase to translate.';
  run('requestGeneralTranslation=liveTranslate; retryMusicLiveDraft()');
  assert.equal(run('musicListening.live.characters'),consumed);
  assert.equal(run('musicListening.live.requests'),1);
  assert.equal(element('#translator-input').value,'Una frase para traducir.');
  assert.equal(retryRecognition.aborted,undefined);
  assert.equal(retryRecognition.stopped,undefined);
  timers.get(run('musicListening.live.timer'))();await flush();
  assert.equal(run('musicListening.live.requests'),2);
  assert.equal(run('musicListening.live.characters'),consumed*2);
  assert.equal(element('#music-live-draft').value,'A phrase to translate.');
  assert.equal(element('#music-live-retry').hidden,true);
  run('stopMusicListening()');retryRecognition.onend();
  assert.equal(element('#music-live-retry').hidden,true);
  for(const page of ['index.html','translator.html']) {
    const html=fs.readFileSync(path.join(root,page),'utf8');
    for(const id of ['music-live-update-mode','music-live-retry'])
      assert.equal(html.split(`id="${id}"`).length-1,1,`${page} exposes ${id} once`);
  }
  // Connect the real native button to the real hosted Continue listening path.
  // A paused capture must retain earlier words, use system input, and wait for
  // native start before submitting the user's identification request.
  const nativeMessages=[], nativeNodes=[];
  Object.assign(context,{EventTarget,Event,DOMException,location:{origin:'https://mathewdmoore.github.io',pathname:'/habla-ecuador/index.html'}});
  Object.assign(context.window,{__hablaSongIdentificationSupported:true,__hablaSystemAudioSupported:true,
    webkit:{messageHandlers:{hablaSpeech:{postMessage:message=>nativeMessages.push(structuredClone(message))}}}});
  context.document.readyState='complete';
  context.document.createElement=tag=>{
    const node={tag,style:{},children:[],setAttribute(){},append(...children){this.children.push(...children);},
      addEventListener(type,handler){this[type]=handler;},click(){if(!this.disabled)this.clickHandler?.();}};
    node.addEventListener=(type,handler)=>{node[`${type}Handler`]=handler;};
    nativeNodes.push(node);return node;
  };
  const attributes={};
  musicButton.style={};
  musicButton.parentElement={after(){},before(){}};
  musicButton.setAttribute=(name,value)=>{attributes[name]=value;};
  musicButton.getAttribute=name=>attributes[name];
  musicButton.click=()=>{if(!musicButton.disabled)run('startMusicListening()');};
  element('#music-playback-source').value='system';
  element('#music-live-translation').checked=false;
  vm.runInContext(fs.readFileSync(path.join(root,'ios/HablaEcuador/NativeSpeech.js'),'utf8'),context);
  const identifySong=nativeNodes.find(node=>node.id==='native-identify-song');
  const keptSource=element('#translator-input').value;
  assert.equal(musicButton.textContent,'Continue listening');
  identifySong.click();
  assert.equal(nativeMessages.length,1);
  assert.equal(nativeMessages[0].action,'start');
  assert.equal(nativeMessages[0].input,'system');
  assert.equal(element('#translator-input').value,keptSource);
  context.window.__hablaNativeSpeech({id:'1',type:'start'});
  assert.equal(nativeMessages[1].action,'identify-song');
  context.window.__hablaNativeSpeech({id:'1',type:'song',requestId:'song-1',status:'matched',title:'Example song',artist:'Example artist'});
  assert.equal(element('#translator-input').value,keptSource,'song metadata never replaces captured text');
  context.window.__hablaNativeSpeech({id:'1',type:'result',text:'Siguiente frase.',final:false});
  assert.equal(element('#translator-input').value,keptSource+'\nSiguiente frase.','resumed speech appends to the paused passage');
  run('stopMusicListening()');context.window.__hablaNativeSpeech({id:'1',type:'end'});
  assert.equal(musicButton.textContent,'Continue listening');
  console.log('Music listening tests passed: live draft throttling, route ownership, stale responses, offline/online limits and mic independence');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
