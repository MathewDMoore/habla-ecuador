const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const elements = new Map();
const timers = [];
const spoken = [];
const element = selector => {
  if (!elements.has(selector)) elements.set(selector, {
    dataset:{}, textContent:'', disabled:false, attrs:{},
    setAttribute(name,value){this.attrs[name]=value;}
  });
  return elements.get(selector);
};
const synth = {
  paused:false, cancel(){}, pause(){this.paused=true;}, resume(){this.paused=false;},
  getVoices:()=>[{name:'Google US English',lang:'en-US',voiceURI:'en',localService:true}],
  speak(utterance){spoken.push(utterance);}
};
const context = vm.createContext({console,
  setTimeout:fn=>timers.push(fn), clearTimeout(){},
  localStorage:{getItem:()=>null,setItem(){}},
  window:{speechSynthesis:synth}, speechSynthesis:synth,
  SpeechSynthesisUtterance:class {constructor(text){this.text=text;}},
  document:{querySelector:element,addEventListener(){},documentElement:{dataset:{}}}
});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run = code=>vm.runInContext(code,context);
// Voice selectors are outside this playback test.
run('populateVoiceSelectors = () => {};');
const drain = ()=>{while(timers.length) timers.shift()();};
const controls = ['#pause-result','#pause-conversation'].map(element);
run('updateSpeechPauseControls()');
assert.ok(controls.every(b=>b.disabled),'pause is disabled without playback');

// A fast pause during the voice-loading delay holds the pending utterance.
run('say("First translation.","en-US"); toggleSpeechPause();');
assert.equal(synth.paused,true);
drain();
assert.equal(spoken.length,1);
assert.ok(controls.every(b=>b.textContent==='▶ Resume' && !b.disabled));
run('toggleSpeechPause()');
assert.equal(synth.paused,false);
assert.equal(spoken.length,1,'resume does not restart or duplicate the utterance');
run('toggleSpeechPause()');
assert.equal(synth.paused,true);
const old = spoken[0];

// Replacement speech must clear the globally paused state.
run('say("Second translation.","en-US")');
assert.equal(synth.paused,false);
drain();
old.onend(); old.onerror({error:'interrupted'}); old.onpause();
assert.ok(controls.every(b=>!b.disabled && b.textContent==='⏸ Pause'),'stale callbacks cannot disable current playback');
spoken[1].onend();
assert.ok(controls.every(b=>b.disabled && b.attrs['aria-pressed']==='false'));

// Microphone/clear paths use this reset: delayed speech must never reappear.
run('say("Canceled before starting.","en-US"); toggleSpeechPause(); stopSpeechPlayback();');
drain();
assert.equal(spoken.length,2);
assert.equal(synth.paused,false);
assert.ok(controls.every(b=>b.disabled));

run('say("Error example.","en-US")'); drain();
spoken[2].onerror({error:'interrupted'});
assert.ok(controls.every(b=>b.disabled));
for(const name of ['index.html','translator.html']){
  const html=fs.readFileSync(path.join(root,name),'utf8');
  for(const id of ['pause-result','pause-conversation']) assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
}
console.log('Speech playback checks passed: pause/resume, queued speech, replacement, stale events, completion, errors and reset.');
