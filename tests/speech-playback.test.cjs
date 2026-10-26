const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const elements = new Map(), timers = new Map(), spoken = [];
const element = selector => {
  if (!elements.has(selector)) elements.set(selector, {dataset:{},textContent:'',disabled:false,attrs:{},setAttribute(n,v){this.attrs[n]=v;}});
  return elements.get(selector);
};
let timerID=0;
const synth = {
  paused:false,cancels:0,resumes:0,cancel(){this.cancels++;this.last?.onerror?.({error:'interrupted'});},
  // Deliberately stale flag: the old implementation lost its Resume label.
  pause(){this.paused=false;},resume(){this.resumes++;this.paused=false;},
  getVoices:()=>[{name:'Google US English',lang:'en-US',voiceURI:'en',localService:true}],
  speak(u){this.last=u;spoken.push(u);this.modeAtSpeak=audioSession.type;u.onstart?.();}
};
const routeChanges=[];
const audioSession={_type:'auto',get type(){return this._type;},set type(value){this._type=value;routeChanges.push(value);}};
const context=vm.createContext({console,navigator:{audioSession},setTimeout:(fn,ms)=>{const id=++timerID;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),
 localStorage:{getItem:()=>null,setItem(){}},window:{speechSynthesis:synth},speechSynthesis:synth,
 SpeechSynthesisUtterance:class {constructor(text){this.text=text;}},
 document:{querySelector:element,addEventListener(){},documentElement:{dataset:{}}}
});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
run('populateVoiceSelectors=()=>{};showToast=()=>{};');
const drain=()=>{let entry;while((entry=[...timers].find(([,t])=>t.ms<1000))){timers.delete(entry[0]);entry[1].fn();}};
const controls=['#pause-result','#pause-conversation'].map(element);
const paused=()=>assert.ok(controls.every(b=>b.textContent==='▶ Resume' && !b.disabled && b.attrs['aria-pressed']==='true'));
const playing=()=>assert.ok(controls.every(b=>b.textContent==='⏸ Pause' && !b.disabled));
run('updateSpeechPauseControls()');assert.ok(controls.every(b=>b.disabled));
run('stopSpeechPlayback();stopSpeechPlayback()');
assert.equal(synth.cancels,0,'idle cleanup must not claim the speech audio session');
assert.equal(synth.resumes,0,'idle cleanup must not resume speech while another app plays music');
assert.deepEqual(routeChanges,[],'startup/idle cleanup must not claim media audio');

run('say("First translation.","en-US");toggleSpeechPause();');drain();
assert.equal(spoken.length,1,'first speech starts in the tap before any timer');paused();
assert.equal(synth.modeAtSpeak,'playback','request media playback before speech');
assert.equal(audioSession.type,'auto','pause releases exclusive playback mode');
assert.equal(synth.cancels,1,'pause cancels the immediately started utterance');
assert.equal(synth.resumes,1,'the direct tap activates speech once');
run('toggleSpeechPause()');drain();playing();assert.equal(spoken.length,2);assert.equal(audioSession.type,'playback','resume reacquires playback mode');
const first=spoken.at(-1);
first.onboundary({charIndex:6});
run('toggleSpeechPause()');paused();
first.onend();first.onerror({error:'interrupted'});first.onboundary({charIndex:17});
assert.equal(run('activeSpeechPlayback.offset'),6,'canceled events cannot skip unread words');
paused();assert.equal(synth.paused,false,'Resume label must ignore the unreliable native flag');
run('toggleSpeechPause()');drain();
assert.equal(spoken.at(-1).text,'translation.','resume starts at remembered word instead of restarting whole text');
playing();
spoken.at(-1).onend();drain();assert.ok(controls.every(b=>b.disabled));assert.equal(audioSession.type,'auto','completion restores mode');

// No word-boundary events: replay only the current sentence, preserving the rest.
run('say("One sentence. Second sentence. Last sentence.","en-US")');drain();
assert.equal(spoken.at(-1).text,'One sentence.');spoken.at(-1).onend();drain();
const second=spoken.at(-1);assert.equal(second.text,'Second sentence.');
run('toggleSpeechPause()');second.onend();paused();
run('toggleSpeechPause()');drain();assert.equal(spoken.at(-1).text,'Second sentence.');
spoken.at(-1).onend();drain();assert.equal(spoken.at(-1).text,'Last sentence.');
spoken.at(-1).onend();drain();assert.ok(controls.every(b=>b.disabled));

// Replacement, rapid toggles and cancellation invalidate all queued callbacks.
run('say("Old playback.","en-US")');drain();const old=spoken.at(-1);
run('toggleSpeechPause();say("New playback.","en-US")');drain();
old.onend();old.onerror({error:'interrupted'});playing();
assert.equal(spoken.at(-1).text,'New playback.');
run('toggleSpeechPause();toggleSpeechPause();toggleSpeechPause();');
const before=spoken.length;drain();assert.equal(spoken.length,before);paused();
run('stopSpeechPlayback()');drain();assert.ok(controls.every(b=>b.disabled));
run('say("Start then cancel.","en-US");stopSpeechPlayback();');const afterCancel=spoken.length;drain();assert.equal(spoken.length,afterCancel,'cancel cannot enqueue another utterance');
run('say("Error example.","en-US")');drain();spoken.at(-1).onerror({error:'audio-busy'});
assert.ok(controls.every(b=>b.disabled));
// Empty enumeration still submits the requested locale synchronously.
const getVoices=synth.getVoices;synth.getVoices=()=>[];
const beforeEmpty=spoken.length;run('say("Ya terminé.","es-EC")');
assert.equal(spoken.length,beforeEmpty+1);assert.equal(spoken.at(-1).lang,'es-EC');
synth.getVoices=getVoices;run('stopSpeechPlayback()');
// A missing browser start/error event must clear busy state with actionable feedback.
synth.speak=function(u){this.last=u;spoken.push(u);};
run('say("Silent provider.","en-US")');
const watchdog=[...timers].find(([,t])=>t.ms===6000);assert.ok(watchdog);timers.delete(watchdog[0]);watchdog[1].fn();
assert.equal(run('activeSpeechPlayback'),null);assert.equal(audioSession.type,'auto','silent-provider watchdog releases mode');
// Never overwrite a newer microphone/media owner, including late callbacks.
synth.speak=function(u){this.last=u;spoken.push(u);u.onstart?.();};
run('say("Route owner test.","en-US")');audioSession.type='play-and-record';
run('stopSpeechPlayback()');assert.equal(audioSession.type,'play-and-record');
audioSession.type='auto';
// Unsupported/throwing API cannot break ordinary speech.
Object.defineProperty(context.navigator,'audioSession',{configurable:true,get(){throw Error('unsupported');}});
const beforeUnsupported=spoken.length;run('say("Safe fallback.","en-US")');assert.equal(spoken.length,beforeUnsupported+1);run('stopSpeechPlayback()');
context.decimals='The value is 1.5 mg. Dr. Smith reports 0.05 units.';
assert.equal(run('splitSpeechPlaybackText(decimals).join(" ")'),context.decimals,'scientific numbers and punctuation survive speech segmentation');
for(const name of ['index.html','translator.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 for(const id of ['pause-result','pause-conversation','read-ecuador-paper'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 assert.ok(html.includes('two abstract sentences, not a full article'));
}
context.reference={id:'anaguano-2017-sangay-fishes',title:'Sangay fish paper',url:'https://example.com/fish'};
// Use the same source catalog as the real translator to verify selection changes.
vm.runInContext(fs.readFileSync(path.join(root,'research-reference.js'),'utf8'),context);
element('#ecuador-research-source').value='anaguano-2017-sangay-fishes';
run('updateEcuadorResearchPaperLink()');
assert.ok(element('#read-ecuador-paper').href.includes('/294/2468'));
element('#ecuador-research-source').value='fernandez-2017-morona-bat';run('updateEcuadorResearchPaperLink()');
assert.ok(element('#read-ecuador-paper').href.includes('/770/2471'));
console.log('Speech checks passed: stale native flags, cancel/end races, remembered words, sentence fallback, long passage progression, rapid toggles and paper links.');
