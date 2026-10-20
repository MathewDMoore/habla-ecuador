const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("ios/HablaEcuador/NativeSpeech.js", "utf8");
function harness(origin = "https://mathewdmoore.github.io", path = "/habla-ecuador/translator.html", systemSupport = false, sourceValue = "external", songSupport = false) {
  const messages = [];
  const nodes = [];
  const playbackSource = {value:sourceValue, children:[], append(option){this.children.push(option);}};
  const document = {readyState:"complete", querySelector:selector => selector === "#music-playback-source" ? playbackSource : ({parentElement:{after:() => {}}}),
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
  vm.runInNewContext(source, {window, document, location:{origin, pathname:path}, EventTarget, Event, DOMException});
  return {window, messages, nodes, playbackSource};
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
assert.equal(identify.disabled,true);
const songMic = new songs.window.SpeechRecognition();
songMic.start(); songEvent({id:"1",type:"start"});
assert.equal(identify.disabled,true,"ordinary dictation never identifies songs");
songEvent({id:"1",type:"end"});
const songCapture = new songs.window.SpeechRecognition();
songCapture.continuous = true;
const songWords = [];
songCapture.onresult = event => songWords.push(event.results[0][0].transcript);
songCapture.start();
assert.equal(identify.disabled,true,"wait for audio startup before identifying");
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
assert.equal(identify.disabled,true);
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
assert.equal(identify.disabled,true);
console.log("Native song identification bridge passed: opt-in, source isolation, stale requests, cancellation, safe metadata, errors and speech continuity (native matching unverified)");

const externalSongs=harness(undefined,undefined,true,"external",true);
const externalCapture=new externalSongs.window.SpeechRecognition();externalCapture.continuous=true;
externalCapture.start();externalSongs.window.__hablaNativeSpeech({id:"1",type:"start"});
assert.equal(externalSongs.nodes.find(node=>node.id==='native-identify-song').disabled,true,"song feature cannot silently switch an external/microphone capture to system input");
