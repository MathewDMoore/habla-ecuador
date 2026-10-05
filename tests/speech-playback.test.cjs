const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const elements = new Map(), timers = [], spoken = [];
const element = selector => {
  if (!elements.has(selector)) elements.set(selector, {dataset:{},textContent:'',disabled:false,attrs:{},setAttribute(n,v){this.attrs[n]=v;}});
  return elements.get(selector);
};
const synth = {
  paused:false,cancel(){this.last?.onerror?.({error:'interrupted'});},
  // Deliberately stale flag: the old implementation lost its Resume label.
  pause(){this.paused=false;},resume(){this.paused=false;},
  getVoices:()=>[{name:'Google US English',lang:'en-US',voiceURI:'en',localService:true}],
  speak(u){this.last=u;spoken.push(u);}
};
const context=vm.createContext({console,setTimeout:fn=>timers.push(fn),clearTimeout(){},
 localStorage:{getItem:()=>null,setItem(){}},window:{speechSynthesis:synth},speechSynthesis:synth,
 SpeechSynthesisUtterance:class {constructor(text){this.text=text;}},
 document:{querySelector:element,addEventListener(){},documentElement:{dataset:{}}}
});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
run('populateVoiceSelectors=()=>{};showToast=()=>{};');
const drain=()=>{while(timers.length) timers.shift()();};
const controls=['#pause-result','#pause-conversation'].map(element);
const paused=()=>assert.ok(controls.every(b=>b.textContent==='▶ Resume' && !b.disabled && b.attrs['aria-pressed']==='true'));
const playing=()=>assert.ok(controls.every(b=>b.textContent==='⏸ Pause' && !b.disabled));
run('updateSpeechPauseControls()');assert.ok(controls.every(b=>b.disabled));

run('say("First translation.","en-US");toggleSpeechPause();');drain();
assert.equal(spoken.length,0,'paused during loading must not enqueue audio');paused();
run('toggleSpeechPause()');drain();playing();assert.equal(spoken.length,1);
const first=spoken.at(-1);
first.onboundary({charIndex:6});
run('toggleSpeechPause()');paused();
first.onend();first.onerror({error:'interrupted'});first.onboundary({charIndex:17});
assert.equal(run('activeSpeechPlayback.offset'),6,'canceled events cannot skip unread words');
paused();assert.equal(synth.paused,false,'Resume label must ignore the unreliable native flag');
run('toggleSpeechPause()');drain();
assert.equal(spoken.at(-1).text,'translation.','resume starts at remembered word instead of restarting whole text');
playing();
spoken.at(-1).onend();drain();assert.ok(controls.every(b=>b.disabled));

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
run('say("Never start.","en-US");stopSpeechPlayback();');drain();assert.equal(spoken.length,before);
run('say("Error example.","en-US")');drain();spoken.at(-1).onerror({error:'audio-busy'});
assert.ok(controls.every(b=>b.disabled));
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
