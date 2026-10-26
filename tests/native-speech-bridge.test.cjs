const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("ios/HablaEcuador/NativeSpeech.js", "utf8");
function harness(origin = "https://mathewdmoore.github.io", path = "/habla-ecuador/translator.html") {
  const messages = [];
  const nodes = [];
  const document = {readyState:"complete", querySelector:() => ({parentElement:{after:() => {}}}),
    createElement:tag => {
      const node = {tag, style:{}, children:[], setAttribute:() => {}, append(...children) { this.children.push(...children); }};
      nodes.push(node);
      return node;
    }};
  const window = {recognitionErrorMessage:error => "browser " + error,
    webkit:{messageHandlers:{hablaSpeech:{postMessage:message => messages.push(structuredClone(message))}}}};
  vm.runInNewContext(source, {window, document, location:{origin, pathname:path}, EventTarget, Event, DOMException});
  return {window, messages, nodes};
}
assert.equal(harness("https://example.com").window.SpeechRecognition, undefined);
assert.equal(harness(undefined, "/unrelated/").window.SpeechRecognition, undefined);
assert.equal(typeof harness(undefined, "/habla-ecuador/index.html").window.__hablaNativeSpeech, "function");
// Exercise the actual startup boundary: native standalone redirects before any
// binding, while the full app and ordinary web translator initialize normally.
const appSource = fs.readFileSync("app.js", "utf8");
// The installed system-audio companion loads this hosted page. Switching to a
// playback app must not trigger the page's ordinary microphone cleanup.
let visibilityHandler, visibilityCancels = 0, practiceVisibilityCancels = 0;
const visibilityLine = appSource.split("\n").find(line => line.includes('document.addEventListener("visibilitychange"'));
const visibilityContext = {
  document:{hidden:true,addEventListener:(name,handler)=>{visibilityHandler=handler;}},
  window:{__hablaSystemAudioCaptureActive:true},cancelMusicListening:()=>visibilityCancels++,
  cancelDictionaryPractice:()=>practiceVisibilityCancels++
};
vm.runInNewContext(visibilityLine,visibilityContext);
visibilityHandler();
assert.equal(practiceVisibilityCancels,1,"dictionary microphone always stops when hidden");
assert.equal(visibilityCancels,0,"hosted page preserves an explicitly active native system-audio session");
visibilityContext.window.__hablaSystemAudioCaptureActive=false;
visibilityHandler();assert.equal(visibilityCancels,1,"ordinary microphone capture still ends when hidden");
visibilityContext.document.hidden=false;
visibilityHandler();assert.equal(visibilityCancels,1,"returning to the page never cancels capture");
assert.equal(practiceVisibilityCancels,2,"returning to the page does not cancel dictionary practice");
const initPrefix = appSource.slice(appSource.indexOf("function init() {"), appSource.indexOf('  localStorage.removeItem("habla-ecuador-ios-voice-correction-v1")'));
function launch(path, native) {
  const url = new URL(path, "https://mathewdmoore.github.io");
  const redirects = [];
  let bindings = 0;
  vm.runInNewContext(initPrefix + "}\ninit();", {
    URL, URLSearchParams,
    location:{href:url.href, pathname:url.pathname, search:url.search, replace:target => redirects.push(target)},
    window:native ? {__hablaNativeSpeech:() => {}} : {},
    initializeOptionalFeature:(_,setup)=>setup(),
    $$:()=>[], $:()=>({addEventListener(){}}),
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
assert.equal(modeSelect.disabled, false, "abort unlocks recognition mode without waiting for a missing native end");
assert.equal(recognition._id, null, "the aborted session releases its bridge identity immediately");
const beforeLateEvents = events.length;
receive({id:"2", type:"error", error:"aborted"});
receive({id:"2", type:"result", text:"stale", final:true});
receive({id:"2", type:"end"});
assert.equal(events.length, beforeLateEvents, "late events from an aborted session are ignored");
// The next separately created recognizer may reuse the bridge without any
// terminal callback from the canceled instance.
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
