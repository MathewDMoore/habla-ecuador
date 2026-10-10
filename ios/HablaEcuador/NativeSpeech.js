// Installed only inside the native companion, before the existing app loads.
(() => {
  if (location.origin !== "https://mathewdmoore.github.io"
      || !location.pathname.startsWith("/habla-ecuador/")
      || !window.webkit?.messageHandlers?.hablaSpeech) return;
  let nextID = 0;
  const sessions = new Map();
  let latestError = null;
  let detailText = "Native bridge ready. Tap the microphone and speak a short sentence first.";
  let panel, detail, modeSelect;
  function setDetail(text, failed = false) {
    detailText = text;
    if (detail) detail.textContent = text;
    if (panel && failed) panel.open = true;
  }
  function installNativeDetails() {
    const anchor = document.querySelector("#music-listen");
    if (!anchor) return;
    panel = document.createElement("details");
    panel.style.cssText = "margin:12px 0;padding:12px;border:1px solid currentColor;border-radius:16px";
    panel.id = "native-speech-details";
    const summary = document.createElement("summary");
    summary.textContent = "iPhone speech · native 0.1.1 (2)";
    const label = document.createElement("label");
    label.textContent = "Recognition mode ";
    modeSelect = document.createElement("select");
    modeSelect.setAttribute("aria-label", "iPhone speech recognition mode");
    for (const [value, text] of [["auto", "Prefer on-device if supported"], ["on-device", "On-device only"], ["apple-service", "Apple service (may use internet)"]]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      modeSelect.append(option);
    }
    modeSelect.value = "auto";
    label.append(modeSelect);
    detail = document.createElement("p");
    detail.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere";
    detail.setAttribute("role", "status");
    detail.textContent = detailText;
    panel.append(summary, label, detail);
    anchor.parentElement.after(panel);
    // The build-80 hosted UI has a browser-only error formatter. Adapt that
    // formatter within this native wrapper; leave the website source untouched.
    const browserMessage = window.recognitionErrorMessage;
    if (typeof browserMessage === "function") window.recognitionErrorMessage = error =>
      latestError?.error === error && latestError.message
        ? latestError.message : browserMessage(error);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installNativeDetails, {once:true});
  else installNativeDetails();
  class NativeSpeechRecognition extends EventTarget {
    constructor() {
      super();
      this.lang = "es-EC";
      this.interimResults = false;
      this.continuous = false;
      this.maxAlternatives = 1;
      this._id = null;
    }
    start() {
      if (this._id !== null) throw new DOMException("Already listening", "InvalidStateError");
      const id = String(++nextID);
      this._id = id;
      sessions.set(id, this);
      latestError = null;
      if (modeSelect) modeSelect.disabled = true;
      setDetail("Starting native iPhone recognition…");
      try {
        window.webkit.messageHandlers.hablaSpeech.postMessage({action:"start", id,
          lang:this.lang, mode:modeSelect?.value || "auto", interimResults:this.interimResults, continuous:this.continuous});
      } catch (error) {
        sessions.delete(id);
        this._id = null;
        if (modeSelect) modeSelect.disabled = false;
        throw error;
      }
    }
    stop() { this._command("stop"); }
    abort() { this._command("abort"); }
    _command(action) {
      if (this._id !== null) window.webkit.messageHandlers.hablaSpeech.postMessage({action, id:this._id});
    }
    _emit(type, properties = {}) {
      const event = new Event(type);
      Object.assign(event, properties);
      this.dispatchEvent(event);
      this["on" + type]?.(event);
    }
  }
  Object.defineProperty(window, "__hablaNativeSpeech", {value:message => {
    const instance = sessions.get(message.id);
    if (!instance) return;
    if (message.type === "end") {
      sessions.delete(message.id);
      instance._id = null;
      if (modeSelect && !sessions.size) modeSelect.disabled = false;
      instance._emit("end");
    } else if (message.type === "result") {
      if (!message.final && !instance.interimResults) return;
      const result = [{transcript:message.text, confidence:message.confidence ?? 0}];
      result.isFinal = Boolean(message.final);
      instance._emit("result", {resultIndex:0, results:[result]});
    } else if (message.type === "error") {
      if (message.error !== "aborted") {
        latestError = message;
        setDetail([message.message || "Native speech stopped.", message.detail].filter(Boolean).join("\n"), true);
      }
      instance._emit("error", {error:message.error});
    } else if (message.type === "status") {
      setDetail(message.text);
    } else if (message.type === "start") instance._emit("start");
  }});
  window.SpeechRecognition = NativeSpeechRecognition;
  window.webkitSpeechRecognition = NativeSpeechRecognition;
})();
