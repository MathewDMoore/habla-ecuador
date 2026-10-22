const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("ios/HablaEcuador/NativeSpeech.js", "utf8");
function harness(origin = "https://mathewdmoore.github.io", path = "/habla-ecuador/translator.html", systemSupport = false, sourceValue = "external", songSupport = false) {
  const messages = [];
  const nodes = [];
  const timers = new Map();
  let nextTimer = 0;
  const musicListen = {disabled:false, clicks:0, pressed:"false", style:{}, parentElement:{after(){},before(){}},
    setAttribute(name,value){if(name==="aria-pressed")this.pressed=value;},
    getAttribute(){return this.pressed;}, click(){if (!this.disabled) {this.clicks++;this.onClick?.();}}};
  const playbackSource = {value:sourceValue, children:[], append(option){this.children.push(option);}};
  const document = {readyState:"complete", querySelector:selector => selector === "#music-playback-source" ? playbackSource : selector === "#music-listen" ? musicListen : ({parentElement:{after:() => {}}, addEventListener(){}}),
    createElement:tag => {
      const listeners = {};
      const node = {tag, style:{}, children:[], setAttribute:() => {}, append(...children) { this.children.push(...children); },
        addEventListener(type, callback) { listeners[type] = callback; },
        click() { if (!this.disabled) listeners.click?.(); }};
      nodes.push(node);
      return node;
    }};
  const window = {__hablaSongIdentificationSupported:songSupport, __hablaSystemAudioSupported:systemSupport, recognitionErrorMessage:error => "browser " + error,
    webkit:{messageHandlers:{hablaSpeech:{postMessage:message => messages.push(structuredClone(message))}}}};
  vm.runInNewContext(source, {window, document, location:{origin, pathname:path}, EventTarget, Event, DOMException,
    setTimeout(fn){const id=++nextTimer;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}});
  return {window, document, messages, nodes, playbackSource, musicListen, timers};
}
assert.equal(harness("https://example.com").window.SpeechRecognition, undefined);
assert.equal(harness(undefined, "/unrelated/").window.SpeechRecognition, undefined);
assert.equal(typeof harness(undefined, "/habla-ecuador/index.html").window.__hablaNativeSpeech, "function");
// Exercise the actual startup boundary: native standalone redirects before any
// binding, while the full app and ordinary web translator initialize normally.
const appSource = fs.readFileSync("app.js", "utf8");
const initPrefix = appSource.slice(appSource.indexOf("function init() {"), appSource.indexOf('  localStorage.removeItem("habla-ecuador-ios-voice-correction-v1")'));
function launch(path, native) {
  const url = new URL(path, "https://mathewdmoore.github.io");
  const redirects = [];
  let bindings = 0;
  vm.runInNewContext(initPrefix + "}\ninit();", {
    URL, URLSearchParams,
    location:{href:url.href, pathname:url.pathname, search:url.search, replace:target => redirects.push(target)},
    window:native ? {__hablaNativeSpeech:() => {}} : {},
    HablaOffline:{bind:() => bindings++}, HablaScreenshot:{bind:() => bindings++},
    beginScreenshotImport:() => {}, previewScreenshotText:() => {}
  });
  return {redirects, bindings};
}
assert.deepEqual(launch("/habla-ecuador/translator.html", true), {
  redirects:["https://mathewdmoore.github.io/habla-ecuador/index.html?start=translate"], bindings:0
});
assert.deepEqual(launch("/habla-ecuador/index.html?start=translate", true), {redirects:[], bindings:2});
assert.deepEqual(launch("/habla-ecuador/translator.html", false), {redirects:[], bindings:2});
assert.deepEqual(launch("/habla-ecuador/index.html?standalone=translator", true), {
  redirects:["https://mathewdmoore.github.io/habla-ecuador/index.html?start=translate"], bindings:0
});
const {window, messages, nodes} = harness();
const panel = nodes.find(node => node.tag === "details");
const modeSelect = nodes.find(node => node.tag === "select");
const detail = nodes.find(node => node.tag === "p");
const receive = window.__hablaNativeSpeech;
const recognition = new window.SpeechRecognition();
const events = [];
recognition.lang = "es-EC";
recognition.interimResults = true;
recognition.continuous = true;
recognition.onstart = () => events.push("start");
recognition.onresult = event => events.push([event.results[0][0].transcript, event.results[0].isFinal]);
recognition.onerror = event => events.push(event.error);
recognition.onend = () => events.push("end");
recognition.start();
assert.deepEqual(messages[0], {action:"start", id:"1", lang:"es-EC", mode:"auto", interimResults:true, continuous:true});
assert.equal(modeSelect.disabled, true);
assert.throws(() => recognition.start(), {name:"InvalidStateError"});
receive({id:"1", type:"start"});
receive({id:"1", type:"result", text:"hola", final:false});
receive({id:"1", type:"result", text:"hola de nuevo", final:true});
recognition.stop();
assert.deepEqual(messages.at(-1), {action:"stop", id:"1"});
receive({id:"1", type:"end"});
assert.equal(modeSelect.disabled, false);
receive({id:"1", type:"result", text:"stale", final:true});
receive({id:"1", type:"end"});
assert.deepEqual(events, ["start", ["hola", false], ["hola de nuevo", true], "end"]);
recognition.start();
recognition.abort();
assert.deepEqual(messages.at(-1), {action:"abort", id:"2"});
receive({id:"2", type:"error", error:"aborted"});
receive({id:"2", type:"end"});
assert.deepEqual(events.slice(-2), ["aborted", "end"]);
const finalOnly = new window.webkitSpeechRecognition();
let results = 0;
let listenerEnds = 0;
finalOnly.onresult = () => results++;
finalOnly.addEventListener("end", () => listenerEnds++);
finalOnly.start();
receive({id:"3", type:"result", text:"partial", final:false});
receive({id:"3", type:"result", text:"complete", final:true});
receive({id:"3", type:"error", error:"not-allowed"});
receive({id:"3", type:"end"});
assert.equal(results, 1);
assert.equal(listenerEnds, 1);
// Full-song restart can start a new instance from onend without retaining stale ownership.
const restart = new window.SpeechRecognition();
restart.onend = () => restart.start();
restart.start();
receive({id:"4", type:"end"});
assert.equal(messages.at(-1).id, "5");
receive({id:"4", type:"end"});
assert.equal(messages.at(-1).id, "5");
restart.onend = null;
receive({id:"5", type:"end"});
// A failed transport must release the instance so a later retry can start.
const failed = new window.SpeechRecognition();
const transport = window.webkit.messageHandlers.hablaSpeech;
const postMessage = transport.postMessage;
transport.postMessage = () => { throw new Error("Unavailable"); };
assert.throws(() => failed.start(), /Unavailable/);
transport.postMessage = postMessage;
assert.doesNotThrow(() => failed.start());
receive({id:messages.at(-1).id, type:"end"});
// Native failures retain the real cause and route status, not a blanket browser network label.
const diagnostic = new window.SpeechRecognition();
modeSelect.value = "dictation";
diagnostic.lang = "es-EC";
diagnostic.start();
const diagnosticID = messages.at(-1).id;
assert.equal(messages.at(-1).mode, "dictation");
assert.equal(messages.at(-1).lang, "es-EC");
receive({id:diagnosticID, type:"status", text:"Downloading model…", reveal:true});
assert.equal(panel.open, true);
receive({id:diagnosticID, type:"status", text:"Microphone started; output BluetoothA2DP; recognition es-MX"});
assert.match(detail.textContent, /BluetoothA2DP/);
receive({id:diagnosticID, type:"error", error:"native-recognition", message:"Apple local recognition failed", detail:"TestDomain / 123"});
assert.equal(panel.open, true);
assert.match(detail.textContent, /TestDomain \/ 123/);
assert.equal(window.recognitionErrorMessage("native-recognition"), "Apple local recognition failed");
receive({id:diagnosticID, type:"end"});
assert.match(detail.textContent, /TestDomain \/ 123/);
assert.equal(modeSelect.disabled, false);
receive({id:diagnosticID, type:"error", error:"network", message:"stale error"});
assert.match(detail.textContent, /TestDomain \/ 123/);
diagnostic.start();
assert.equal(window.recognitionErrorMessage("native-recognition"), "browser native-recognition");
assert.equal(diagnostic.lang, "es-EC");
// A finalized passage must not end a still-running native song session.
const finalized = new window.SpeechRecognition();
finalized.interimResults = true;
const finalizedEvents = [];
finalized.onresult = event => finalizedEvents.push({text:event.results[0][0].transcript,
  sessionFinal:event.results[0].isFinal, confirmed:event.confirmedText, tentative:event.tentativeText});
finalized.start();
const finalizedID = messages.at(-1).id;
receive({id:finalizedID,type:"result",text:"Una frase completa. Un borrador",final:false,
  confirmedText:"Una frase completa.",tentativeText:"Un borrador"});
assert.deepEqual(finalizedEvents,[{text:"Una frase completa. Un borrador",sessionFinal:false,
  confirmed:"Una frase completa.",tentative:"Un borrador"}]);
receive({id:finalizedID,type:"result",text:"Una frase completa.",final:false,
  confirmedText:"Una frase completa.",tentativeText:""});
assert.equal(finalizedEvents.at(-1).tentative, "");
receive({id:finalizedID,type:"end"});

console.log("Native speech bridge: passed (JavaScript behavior; no physical iPhone audio test)");

// Direct device capture is explicitly available only in a capable native build.
const direct = harness(undefined, undefined, true, "system");
assert.equal(direct.playbackSource.children[0].value, "system");
const directMic = new direct.window.SpeechRecognition();
directMic.start();
assert.equal(direct.messages.at(-1).input, undefined, "ordinary voice input remains microphone input");
direct.window.__hablaNativeSpeech({id:"1",type:"end"});
const deviceAudio = new direct.window.SpeechRecognition();
deviceAudio.continuous = true;
deviceAudio.start();
assert.equal(direct.messages.at(-1).input, "system");
assert.equal(direct.window.__hablaSystemAudioCaptureActive, true);
// Replacement capture must not lose the background flag when the old end arrives.
const newerAudio = new direct.window.SpeechRecognition();
newerAudio.continuous = true;
newerAudio.start();
direct.window.__hablaNativeSpeech({id:"2",type:"end"});
assert.equal(direct.window.__hablaSystemAudioCaptureActive, true);
direct.window.__hablaNativeSpeech({id:"3",type:"end"});
assert.equal(direct.window.__hablaSystemAudioCaptureActive, false);
const unsupported = harness(undefined, undefined, false, "system");
const unsupportedCapture = new unsupported.window.SpeechRecognition();
unsupportedCapture.continuous = true;
unsupportedCapture.start();
assert.equal(unsupported.messages.at(-1).input, undefined);
assert.equal(unsupported.playbackSource.children.length, 0);

// Exercise the hosted visibility handler, not a duplicate test implementation.
let visibilityHandler, visibilityCancels = 0;
const visibilityLine = appSource.split("\n").find(line => line.includes('document.addEventListener("visibilitychange"'));
const visibilityContext = {
  document:{hidden:true,addEventListener:(name,handler)=>{visibilityHandler=handler;}},
  window:{__hablaSystemAudioCaptureActive:false}, cancelMusicListening:()=>visibilityCancels++
};
vm.runInNewContext(visibilityLine,visibilityContext);
visibilityHandler(); assert.equal(visibilityCancels,1);
visibilityContext.window.__hablaSystemAudioCaptureActive=true;
visibilityHandler(); assert.equal(visibilityCancels,1,"explicit device capture survives switching to the playback app");
visibilityContext.document.hidden=false;
visibilityHandler(); assert.equal(visibilityCancels,1);


// Song ID is opt-in, same-iPhone-only, and never creates a second capture.
assert.equal(harness().nodes.some(node => node.id === "native-identify-song"), false);
const songs = harness(undefined, undefined, true, "system", true);
const identify = songs.nodes.find(node => node.id === "native-identify-song");
const songStatus = songs.nodes.find(node => node.id === "native-song-status");
const songResult = songs.nodes.find(node => node.id === "native-song-result");
const songEvent = songs.window.__hablaNativeSpeech;
assert.equal(identify.disabled,false,"paused capture keeps identification actionable");
const songMic = new songs.window.SpeechRecognition();
songMic.start(); songEvent({id:"1",type:"start"});
identify.click();
assert.match(songStatus.textContent,/Stop the current microphone/);
assert.equal(songs.messages.filter(message=>message.action==='identify-song').length,0,"ordinary dictation never identifies songs");
songEvent({id:"1",type:"end"});
const songCapture = new songs.window.SpeechRecognition();
songCapture.continuous = true;
const songWords = [];
songCapture.onresult = event => songWords.push(event.results[0][0].transcript);
songCapture.start();
assert.equal(identify.disabled,false,"a tap can queue identification while audio starts");
songEvent({id:"2",type:"start"});
assert.equal(identify.disabled,false);
assert.equal(songs.messages.filter(message=>message.action==='identify-song').length,0,"no automatic catalog requests");
identify.click();
const songRequest = songs.messages.at(-1);
assert.deepEqual(songRequest,{action:"identify-song",id:"2",requestId:"song-1"});
identify.click();
assert.equal(songs.messages.filter(message=>message.action==='identify-song').length,1,"double tap makes one request");
songEvent({id:"2",type:"song",requestId:"old",status:"matched",title:"Stale title"});
assert.equal(identify.disabled,true,"wrong request cannot finish the active lookup");
songEvent({id:"2",type:"song",requestId:"song-1",status:"matched",title:"<img src=x onerror=alert(1)>",artist:"Test artist",url:"javascript:alert(1)"});
assert.equal(songResult.children[0].textContent,"<img src=x onerror=alert(1)>","metadata is assigned as text");
assert.equal(songResult.children.some(node=>node.tag==='a'),false,"untrusted URLs never become links");
assert.equal(identify.disabled,false);
songEvent({id:"2",type:"result",text:"Recognition continues",final:false});
// Default recognition only reports final results, as before.
songEvent({id:"2",type:"result",text:"Recognition continues",final:true});
assert.deepEqual(songWords,["Recognition continues"]);
assert.equal(songs.messages.filter(message=>message.action==='start').length,2,"song ID starts no extra capture");
identify.click();
songEvent({id:"2",type:"song",requestId:"song-2",status:"unavailable",message:"Service unavailable; listening continues."});
assert.match(songStatus.textContent,/Service unavailable/);
assert.equal(songCapture._id,"2","service error leaves recognition alive");
assert.equal(identify.disabled,false);
identify.click();
songCapture.stop();
assert.equal(identify.disabled,false,"stopped capture can be resumed by an explicit tap");
const afterStop = songStatus.textContent;
songEvent({id:"2",type:"song",requestId:"song-3",status:"matched",title:"Too late"});
assert.equal(songStatus.textContent,afterStop,"late result after stop is rejected");
songEvent({id:"2",type:"end"});
const replacement = new songs.window.SpeechRecognition(); replacement.continuous=true;
replacement.start();songEvent({id:"3",type:"start"});identify.click();
const newer = new songs.window.SpeechRecognition();newer.continuous=true;newer.start();
const replacementStatus = songStatus.textContent;
songEvent({id:"3",type:"song",requestId:"song-4",status:"matched",title:"Replaced capture"});
assert.equal(songStatus.textContent,replacementStatus,"replacement invalidates the old song request before old end");
songEvent({id:"3",type:"end"});songEvent({id:"4",type:"start"});
identify.click();
songEvent({id:"4",type:"song",requestId:"song-5",status:"not-found",message:"No song identified."});
assert.equal(songStatus.textContent,"No song identified.");
assert.equal(identify.disabled,false,"no-match allows an explicit retry");
identify.click();
songEvent({id:"4",type:"song",requestId:"song-6",status:"matched",title:"An original test song",artist:"Example artist",url:"https://www.shazam.com/song/123/test"});
assert.equal(songResult.children.at(-1).href,"https://www.shazam.com/song/123/test");
songEvent({id:"4",type:"end"});
assert.equal(identify.disabled,false);
console.log("Native song identification bridge passed: opt-in, source isolation, stale requests, cancellation, safe metadata, errors and speech continuity (native matching unverified)");

const externalSongs=harness(undefined,undefined,true,"external",true);
const externalCapture=new externalSongs.window.SpeechRecognition();externalCapture.continuous=true;
externalCapture.start();externalSongs.window.__hablaNativeSpeech({id:"1",type:"start"});
externalSongs.nodes.find(node=>node.id==='native-identify-song').click();
assert.match(externalSongs.nodes.find(node=>node.id==='native-song-status').textContent,/Stop the current microphone/);
assert.equal(externalSongs.messages.filter(message=>message.action==='identify-song').length,0,"song feature cannot silently switch an external/microphone capture to system input");

// Reproduce the device recording: a paused session showing Continue listening.
const paused = harness(undefined,undefined,true,"system",true);
const pausedButton=paused.nodes.find(node=>node.id==='native-identify-song');
const pausedStatus=paused.nodes.find(node=>node.id==='native-song-status');
const pausedEvent=paused.window.__hablaNativeSpeech;
let resumed;
paused.musicListen.onClick=()=>{
  resumed=new paused.window.SpeechRecognition();resumed.continuous=true;resumed.start();
};
pausedButton.click();pausedButton.click();
assert.equal(paused.musicListen.clicks,1,"one Identify tap invokes Continue listening exactly once");
assert.equal(paused.messages.length,1);
assert.deepEqual(paused.messages[0],{action:"start",id:"1",lang:"es-EC",mode:"auto",interimResults:false,continuous:true,input:"system"});
assert.equal(pausedButton.disabled,true,"duplicate taps are blocked while awaiting screen permission");
assert.match(pausedStatus.textContent,/approve screen sharing/);
assert.equal(paused.timers.size,1);
pausedEvent({id:"1",type:"start"});
assert.deepEqual(paused.messages.at(-1),{action:"identify-song",id:"1",requestId:"song-1"});
assert.equal(paused.timers.size,0,"capture startup cancels the startup deadline");
pausedEvent({id:"1",type:"start"});
assert.equal(paused.messages.filter(message=>message.action==='identify-song').length,1);
resumed.stop();pausedEvent({id:"1",type:"end"});
assert.equal(pausedButton.disabled,false);
pausedButton.click(); // Resume another paused passage; cancel in Apple's picker.
pausedEvent({id:"2",type:"error",error:"aborted"});
assert.equal(pausedButton.disabled,false,"picker cancellation releases the queued action");
pausedEvent({id:"2",type:"start"}); // Even a delayed start must not submit the cancelled query.
assert.equal(paused.messages.filter(message=>message.action==='identify-song').length,1);
pausedEvent({id:"2",type:"end"});
pausedButton.click();
assert.equal(paused.timers.size,1);
[...paused.timers.values()][0]();
assert.equal(pausedButton.disabled,false,"no startup callback cannot strand the button");
assert.match(pausedStatus.textContent,/has not started/);
pausedEvent({id:"3",type:"start"});
assert.equal(paused.messages.filter(message=>message.action==='identify-song').length,1,"a timed-out action never submits later");

const starting=harness(undefined,undefined,true,"system",true);
const startupCapture=new starting.window.SpeechRecognition();startupCapture.continuous=true;startupCapture.start();
starting.nodes.find(node=>node.id==='native-identify-song').click();
assert.equal(starting.musicListen.clicks,0,"already-starting capture must not be toggled off");
starting.window.__hablaNativeSpeech({id:"1",type:"start"});
assert.equal(starting.messages.filter(message=>message.action==='identify-song').length,1);

const sourceChoice=harness(undefined,undefined,true,"external",true);
sourceChoice.nodes.find(node=>node.id==='native-identify-song').click();
assert.match(sourceChoice.nodes.find(node=>node.id==='native-song-status').textContent,/Choose This iPhone/);
assert.equal(sourceChoice.playbackSource.value,"external");
assert.equal(sourceChoice.musicListen.clicks,0);
assert.equal(sourceChoice.messages.length,0);

const finishing=harness(undefined,undefined,true,"system",true);
finishing.musicListen.disabled=true;
finishing.nodes.find(node=>node.id==='native-identify-song').click();
assert.match(finishing.nodes.find(node=>node.id==='native-song-status').textContent,/Capture is finishing/);
assert.equal(finishing.messages.length,0);
console.log("Paused song identification: passed (resume, startup gate, duplicate taps, cancellation, timeout and explicit source choice)");

// Primary capture state comes from actual native lifecycle events, not the tap.
const controls=harness(undefined,undefined,true,"system");
const ui=controls.nodes.find(node=>node.id==='native-capture-status');
const hint=controls.nodes.find(node=>node.id==='native-capture-hint');
const send=controls.window.__hablaNativeSpeech;
const musicCapture=new controls.window.SpeechRecognition();
musicCapture.continuous=true;musicCapture.interimResults=true;musicCapture.start();
const firstID=controls.messages.at(-1).id;
assert.match(ui.textContent,/Waiting for screen-sharing approval/);
assert.equal(controls.musicListen.textContent,'Cancel startup');
send({id:firstID,type:'status',text:'Input audio: 8.0 s · input peak -12 dBFS'});
assert.match(ui.textContent,/Waiting for screen-sharing approval/,'meter alone cannot mark startup as successful');
send({id:firstID,type:'start'});
assert.match(ui.textContent,/Listening · waiting for audio/);
assert.equal(controls.musicListen.textContent,'Stop listening');
for(let i=1;i<=3;i++)send({id:firstID,type:'status',text:`Input audio: ${i}.0 s · input peak -120 dBFS`});
assert.match(ui.textContent,/no audio detected/);
assert.match(hint.textContent,/screenshot instead/);
send({id:firstID,type:'status',text:'Input audio: 4.0 s · input peak -12 dBFS'});
assert.match(ui.textContent,/audio detected/);assert.match(hint.textContent,/No words yet/);
send({id:firstID,type:'result',text:'Palabras de prueba.',final:false});
assert.match(ui.textContent,/words received/);
send({id:firstID,type:'status',text:'Input audio: 5.0 s · input peak -12 dBFS\nCapture backlog drops: 2 buffers'});
assert.match(ui.textContent,/audio gaps detected/);
send({id:firstID,type:'error',error:'native-recognition',message:'The capture stream stopped.'});
send({id:firstID,type:'end'});
assert.match(ui.textContent,/Capture stopped/);assert.match(hint.textContent,/stream stopped/);
musicCapture.start();const retryID=controls.messages.at(-1).id;
send({id:firstID,type:'status',text:'Input audio: 10.0 s · input peak -12 dBFS'});
send({id:firstID,type:'start'});assert.match(ui.textContent,/Waiting for screen-sharing approval/);
musicCapture.stop();assert.match(ui.textContent,/Stopping capture/);
send({id:retryID,type:'start'});assert.match(ui.textContent,/Stopping capture/,'late start cannot revive a cancelled picker');
send({id:retryID,type:'end'});assert.match(ui.textContent,/Capture stopped/);
const micControls=harness();const mic=new micControls.window.SpeechRecognition();mic.continuous=true;mic.start();
assert.match(micControls.nodes.find(node=>node.id==='native-capture-status').textContent,/Starting microphone/);
console.log('Capture controls passed: permission gate, real start, silence/recovery, word receipt, input gaps, errors, stale sessions and cancellation.');

// Second-pass recognition runs after capture ends, independently of the hosted
// three-second capture watchdog. It cannot silently replace text or accept old results.
{
  const h = harness();
  const enabled = h.nodes.find(n => n.id === 'native-review-enable');
  const retry = h.nodes.find(n => n.id === 'native-review-retry');
  const status = h.nodes.find(n => n.id === 'native-review-status');
  const preview = h.nodes.find(n => n.id === 'native-review-preview');
  const apply = h.nodes.find(n => n.id === 'native-review-apply');
  retry.click();
  assert.match(status.textContent, /Enable the retry buffer/);
  assert.equal(h.messages.length, 0);
  enabled.checked = true;
  const r = new h.window.SpeechRecognition();
  r.continuous = true;
  r.interimResults = true;
  r.start();
  assert.equal(h.messages.at(-1).retainForReview, true);
  retry.click();
  assert.match(status.textContent, /Stop listening first/);
  h.window.__hablaNativeSpeech({id:r._id, type:'end'});
  retry.click();
  const first = h.messages.at(-1);
  assert.equal(first.action, 'retry-music');
  const count = h.messages.length;
  retry.click();
  assert.equal(h.messages.length, count);
  h.window.__hablaNativeSpeech({type:'music-review', id:'stale', status:'done', text:'ignored'});
  assert.equal(preview.hidden, true);
  h.window.__hablaNativeSpeech({type:'music-review', id:first.id, status:'done', text:'Hola, hello.', message:'Review this draft'});
  assert.equal(preview.textContent, 'Hola, hello.');
  assert.equal(preview.hidden, false);
  assert.equal(apply.hidden, false);
  const edits = [];
  const editor = {value:'previous captured words', dispatchEvent:e => edits.push(e.type)};
  const query = h.document.querySelector;
  h.document.querySelector = s => s === '#translator-input' ? editor : query(s);
  apply.click();
  assert.equal(editor.value, 'Hola, hello.');
  assert.deepEqual(edits, ['input']);
  const undo = h.nodes.find(n => n.id === 'native-review-undo');
  undo.click();
  assert.equal(editor.value, 'previous captured words');
  retry.click();
  const second = h.messages.at(-1);
  h.window.__hablaNativeSpeech({type:'music-review', id:second.id, status:'done', text:'Another draft'});
  apply.click();
  editor.value = 'user changed it';
  undo.click();
  assert.equal(editor.value, 'user changed it');
  assert.match(status.textContent, /did not overwrite/);
  retry.click();
  const pending = h.messages.at(-1);
  const cancel = h.nodes.find(n => n.textContent === 'Cancel recognition');
  cancel.click();
  assert.equal(h.messages.at(-1).action, 'cancel-music-review');
  h.window.__hablaNativeSpeech({type:'music-review', id:pending.id, status:'done', text:'late output'});
  assert.notEqual(preview.textContent, 'late output');
  retry.click();
  const timer = [...h.timers.values()].at(-1);
  timer();
  assert.match(status.textContent, /timed out/);
  const speech = new h.window.SpeechRecognition();
  speech.start();
  assert.equal(h.messages.at(-1).retainForReview, undefined); // no speech-practice retention
}
console.log('Multilingual retry bridge passed: explicit opt-in, stop gate, duplicate/stale/cancel/timeout isolation, review, undo and speech isolation. Native/model accuracy unverified.');
