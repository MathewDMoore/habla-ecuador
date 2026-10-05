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
  document:{querySelector:element,addEventListener(){}, createElement:()=>({textContent:"", get innerHTML(){return this.textContent;}, set innerHTML(value){this.value=value;}})},
  fetch:async()=>{throw new Error('Unexpected network request');}
});
vm.runInContext(fs.readFileSync(path.join(root,'research-reference.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run = code => vm.runInContext(code,context);
context.spoken = spoken;
run('say = (text,lang) => spoken.push({text,lang});');
const flush = () => new Promise(resolve => setImmediate(resolve));
async function main() {
  // Retain interim-only dictation once; late events cannot duplicate a turn.
  context.b1=button();
  run('startConversation("english",b1)');
  const first=recordings.at(-1);
  first.emit('How are you?');
  assert.ok(element('#conversation-turns').innerHTML.includes('How are you?'));
  first.onend();
  await flush();
  assert.equal(run('turns.length'),1);
  assert.equal(run('turns[0].provisional'),true);
  assert.ok(element('#conversation-turns').innerHTML.includes('transcript needs checking'));
  assert.equal(spoken.length,0,'unconfirmed dictation is not played automatically');
  first.emit('How are you?',true);
  assert.equal(run('turns.length'),1);

  // A final local translation waits until the microphone closes, then speaks once.
  run('clearConversation(); startConversation("english",b1)');
  const finalRecording=recordings.at(-1);
  finalRecording.emit('How are you?',true);
  assert.equal(spoken.length,0);
  finalRecording.onend();
  await flush();
  assert.equal(spoken.length,1);
  assert.equal(spoken.at(-1).lang,'es-EC');
  finalRecording.onend();
  assert.equal(spoken.length,1);

  // Switching buttons keeps the old interim text and rejects old callbacks.
  context.b2=button();
  run('clearConversation(); startConversation("english",b1)');
  const old=recordings.at(-1);
  old.emit('How are you?');
  run('startConversation("spanish",b2)');
  const current=recordings.at(-1);
  old.emit('stale final result',true);
  old.onstart(); old.onend(); old.onerror({error:'network'});
  assert.equal(run('recognition === null'),false);
  context.current=current;
  assert.equal(run('recognition === current'),true);
  assert.equal(run('turns.length'),1);
  current.emit('¿Cómo estás?',true);
  current.onend();
  await flush();
  assert.equal(run('turns.length'),2);
  assert.equal(run('turns[1].source'),'¿Cómo estás?');

  // Spanish from the English role keeps Spanish text and switches direction.
  run('clearConversation(); targetLanguage="en-GB"; sourceLanguage="es-EC"; syncLanguagePair({persist:false}); startConversation("english",b1)');
  const crossLanguage=recordings.at(-1);
  assert.equal(crossLanguage.lang,'en-GB');
  crossLanguage.emit('¿Cómo estás?',true);
  crossLanguage.onend();
  await flush();
  assert.equal(run('turns[0].role'),'spanish');
  assert.equal(run('turns[0].translation'),'How are you? / You alright?');
  assert.equal(spoken.at(-1).lang,'en-GB');

  // Delayed old translations must not interrupt the new recording or cleared UI.
  const deferred=[];
  context.fetch=url=>new Promise(resolve=>deferred.push({url,resolve}));
  const resolveTranslation=(index,text)=>deferred[index].resolve({ok:true,json:async()=>({responseStatus:200,responseData:{translatedText:text}})});
  run('clearConversation(); targetLanguage="es-EC"; sourceLanguage="en-US"; syncLanguagePair({persist:false});');
  const before=spoken.length;
  const pending=run('handleConversationText("english","Mathew","An unfamiliar new sentence.",true)');
  run('startConversation("spanish",b2)');
  resolveTranslation(0,'Una oración nueva.');
  await pending;
  assert.equal(spoken.length,before,'old response cannot speak into a newer microphone');
  assert.equal(run('turns[0].pending'),false,'completed text is still retained');
  run('clearConversation()');
  const cleared=run('handleConversationText("english","Mathew","Another unfamiliar sentence.",true)');
  run('clearConversation()');
  resolveTranslation(1,'Otra oración.');
  await cleared;
  assert.equal(run('turns.length'),0);
  assert.equal(spoken.length,before);
  assert.equal(element('#conversation-status').textContent,'Conversation cleared. Nothing was stored.');

  // The turn captures its locale; later selector changes cannot swap US/UK output.
  run('sourceLanguage="es-MX"; targetLanguage="en-GB"; syncLanguagePair({persist:false}); startConversation("spanish",b2)');
  const mexico=recordings.at(-1);
  assert.equal(mexico.lang,'es-MX');
  mexico.emit('El color de esta organización.',true);
  mexico.onend();
  run('targetLanguage="en-US"; translationPurpose="academic";');
  resolveTranslation(2,'The color of this organization.');
  await flush();
  assert.equal(run('turns[0].translation'),'The colour of this organisation.');
  assert.equal(spoken.at(-1).lang,'en-GB');
  run('clearConversation(); sourceLanguage="en-US"; targetLanguage="es-BO";');
  assert.equal(run('conversationOptions("spanish",b2).lang'),'es-BO');

  // Existing editable translations persist and remain isolated by pair and purpose.
  run('sourceLanguage="en-US"; targetLanguage="es-EC"; direction="en-ec"; translationPurpose="everyday"; setEditableTranslation("How are you?","¿Cómo estás?");');
  element('#natural-result').textContent='¿Qué tal estás?';
  run('saveActiveTranslationEdit(); translationEdits=readTranslationEdits(); setEditableTranslation("How are you?","¿Cómo estás?");');
  assert.equal(element('#natural-result').textContent,'¿Qué tal estás?');
  run('targetLanguage="es-MX"; setEditableTranslation("How are you?","¿Cómo estás?");');
  assert.equal(element('#natural-result').textContent,'¿Cómo estás?');
  run('targetLanguage="es-EC"; translationPurpose="academic"; setEditableTranslation("How are you?","¿Cómo estás?");');
  assert.equal(element('#natural-result').textContent,'¿Cómo estás?');
  console.log('Conversation checks passed: interim preservation, final playback, stale events, handoffs, cross-language text, delayed/cleared responses, Mexico/Bolivia and US/UK locales, saved edits.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
