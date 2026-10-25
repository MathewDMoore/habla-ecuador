const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const slice=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
function node(){
 const handlers={},attributes={};
 return {handlers,attributes,dataset:{},disabled:false,hidden:false,textContent:'',isConnected:true,value:'0',
  addEventListener(type,fn){(handlers[type] ||= []).push(fn);},
  emit(type,extra={}){const event={detail:0,button:0,isPrimary:true,pointerId:1,preventDefault(){this.prevented=true;},...extra};for(const fn of handlers[type]||[])fn(event);return event;},
  setAttribute(key,value){attributes[key]=value;},setPointerCapture(id){this.capture=id;},releasePointerCapture(id){if(this.capture===id)this.capture=null;},
  replaceChildren(...children){this.children=children;},contains(other){return other===this;}
 };
}
function harness(native=false){
 const timers=new Map(),recordings=[],toasts=[];let timerID=0,now=0;
 const elements={};for(const name of ['mic','select','status','response','score','coach','heard','feedback','progress','progressLabel','target','whole'])elements[name]=node();
 const {mic}=elements,panel=node();
 class Recognition {
  start(){recordings.push(this);}
  stop(){this.stops=(this.stops||0)+1;}
  abort(){this.aborts=(this.aborts||0)+1;}
  send(type,extra={}){this['on'+type]?.(extra);}
  result(text,final=false){const result=[{transcript:text}];result.isFinal=final;this.send('result',{results:[result]});}
 }
 const context=vm.createContext({...elements,panel,console,window:{SpeechRecognition:Recognition,...native?{__hablaNativeSpeech(){}}:{}},
  document:{createElement:node},prompts:[{text:'me vale verga',lang:'es-EC'}],focusText:'',
  direction:'ec-en',recognition:null,activeRecognitionButton:null,dictionaryPracticeSession:null,
  $:()=>node(),available:()=>true,refresh(){throw Error('unexpected refresh');},
  setListeningButton(button,pressed){button.setAttribute('aria-pressed',String(pressed));},
  stopSpeechPlayback(){},showToast:text=>toasts.push(text),recognitionErrorMessage:error=>'error: '+error,
  correctSpeechRecognitionTranscript:text=>({text}),
  setTimeout(fn,delay){const id=++timerID;timers.set(id,{fn,at:now+delay});return id;},clearTimeout:id=>timers.delete(id)
 });
 vm.runInContext(slice('function startListening(','function cancelListening(')+slice('function cancelListening(','let musicListening =')+slice('function stopListening(','function claimSourceTextEdit(')+slice('function dictionaryPracticeText(','function bindDictionaryPractice('),context);
 const begin=source.indexOf('    let releaseHold = () => {};'),end=source.indexOf('\n  });\n}',begin);
 vm.runInContext(source.slice(begin,end),context);
 const advance=ms=>{const until=now+ms;while(true){const next=[...timers].filter(([,t])=>t.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;timers.delete(next[0]);now=next[1].at;next[1].fn();}now=until;};
 const current=()=>recordings.at(-1);
 const ready=()=>{current().send('start');if(!native)current().send('audiostart');};
 return {...elements,panel,context,recordings,toasts,advance,current,ready,timers};
}
for(const native of [false,true]){
 const h=harness(native),{mic,status,score}=h;
 mic.emit('pointerdown');assert.equal(h.recordings.length,1);
 assert.equal(mic.textContent,'Starting…');
 h.current().send('start');
 if(!native){assert.match(status.textContent,/Waiting for the microphone/);h.advance(6000);h.current().send('audiostart');}
 assert.match(status.textContent,/Microphone ready/);assert.equal(mic.dataset.captureReady,'true');
 h.advance(19999);assert.equal(h.current().stops,undefined,'startup time does not shorten the speaking window');
 h.current().result('me vale',false);
 mic.emit('pointerup');assert.equal(h.current().stops,1,'finger release requests a graceful stop');
 mic.emit('click',{detail:1});assert.equal(h.recordings.length,1,'release click cannot reopen the microphone');
 h.current().result('me vale verga',true);h.current().send('end');
 assert.match(score.textContent,/100%/,'final words delivered after release are scored');
 assert.equal(mic.capture,null);assert.equal(h.context.dictionaryPracticeSession,null);assert.equal(h.timers.size,0);
 // A touch cancellation does not submit a partial response or strand capture.
 mic.emit('pointerdown',{pointerId:9,pointerType:'touch'});h.ready();h.current().result('me',false);
 mic.emit('pointercancel',{pointerId:9,pointerType:'touch'});
 assert.equal(h.current().aborts,1);assert.equal(h.context.dictionaryPracticeSession,null);assert.equal(score.hidden,true);
 // Space holds; repeats cannot restart. Enter/assistive clicks toggle.
 mic.emit('keydown',{code:'Space'});const count=h.recordings.length;mic.emit('keydown',{code:'Space',repeat:true});assert.equal(h.recordings.length,count);h.ready();
 mic.emit('keyup',{code:'Space'});assert.equal(h.current().stops,1);h.current().send('end');
 mic.emit('click');h.ready();mic.emit('click');assert.equal(h.current().stops,1);h.current().send('end');
 // Detection is distinct from transcription and never awards an empty score.
 mic.emit('pointerdown');h.ready();h.current().send('speechstart');
 assert.match(status.textContent,/Speech detected/);mic.emit('pointerup');h.current().send('end');
 assert.match(status.textContent,/no transcript.*not scored/);assert.equal(score.hidden,true);
 mic.emit('pointerdown');h.ready();h.current().send('error',{error:'no-speech'});h.current().send('end');
 assert.match(status.textContent,/no transcript.*not scored/);assert.match(h.toasts.at(-1),/no transcript.*not scored/);
 // A held button is released when a provider ends by itself, allowing retry.
 mic.emit('pointerdown');h.ready();h.current().send('end');const ended=h.recordings.length;
 mic.emit('pointerdown');assert.equal(h.recordings.length,ended+1);h.ready();
 h.advance(20000);assert.equal(h.current().stops,1);h.advance(3000);
 assert.equal(h.context.dictionaryPracticeSession,null);assert.equal(h.timers.size,0);
}
{
 const h=harness();h.mic.emit('pointerdown');h.current().send('start');h.advance(8000);
 assert.match(h.status.textContent,/did not become ready.*not scored/);assert.equal(h.context.dictionaryPracticeSession,null);
 h.current().send('audiostart');assert.equal(h.context.dictionaryPracticeSession,null,'late audio events cannot revive cancelled capture');
 h.mic.emit('pointerdown');h.mic.emit('pointerup');assert.match(h.status.textContent,/still starting.*not scored/);
 assert.equal(h.context.dictionaryPracticeSession,null);assert.equal(h.mic.capture,null);
 h.mic.disabled=true;const n=h.recordings.length;h.mic.emit('pointerdown');h.mic.emit('click');assert.equal(h.recordings.length,n);
}
console.log('Practice microphone: hold/release, touch cancel, startup/audio readiness, late final words, no-transcript/no-score, keyboard/assistive toggle, stale events, timer and retry cleanup passed. Audio capture is synthetic.');
