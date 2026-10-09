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
  setTimeout(fn) { const id=++nextTimer; timers.set(id,fn); return id; },
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
  assert.equal(musicButton.textContent,'Listen to music');
  assert.equal(element('#translate-music').disabled,false);
  assert.match(element('#music-listening-status').textContent,/Check the words/);
  await run('renderTranslation()'); // No fetch until the explicit translate action.
  first.emit('stale words',true);
  assert.equal(element('#translator-input').value,'Caminando aterrorizando la cuadra otra frase');

  // Starting another passage and then a regular microphone rejects old events.
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
  const limit=run('musicListening.timer'); timers.get(limit)();
  assert.equal(timeout.stopped,true);
  const fallback=run('musicListening.finishTimer'); timers.get(fallback)();
  assert.equal(timeout.aborted,true);
  assert.equal(run('recognition'),null);
  assert.equal(run('musicListening'),null);
  assert.equal(musicButton.disabled,false);
  assert.equal(element('#translator-input').value,'timed capture');
  timeout.onend(); timeout.emit('late timeout result',true);
  assert.equal(element('#translator-input').value,'timed capture');

  run('startMusicListening()');
  const cancelled=recordings.at(-1); cancelled.emit('before edit');
  element('#translator-input').value='user edited words';
  run('cancelListening(false)');
  cancelled.emit('overwrite attempt',true);
  assert.equal(element('#translator-input').value,'user edited words');

  // Unsupported browsers do not clear text or imported document state.
  context.window.SpeechRecognition=null;
  run('documentImportActive=true; startMusicListening()');
  assert.equal(run('documentImportActive'),true);
  assert.equal(element('#translator-input').value,'user edited words');
  assert.match(element('#music-listening-status').textContent,/unavailable/);
  console.log('Music listening tests passed');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
