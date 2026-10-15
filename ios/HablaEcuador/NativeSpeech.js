// Installed only inside the native companion, before the existing app loads.
(() => {
  if (location.origin !== "https://mathewdmoore.github.io"
      || !location.pathname.startsWith("/habla-ecuador/")
      || !window.webkit?.messageHandlers?.hablaSpeech) return;
  let nextID = 0;
  const sessions = new Map();
  let latestError = null;
  const syncSystemAudioFlag = () => { window.__hablaSystemAudioCaptureActive = [...sessions.values()].some(instance => instance._systemAudio); };
  let detailText = "Native bridge ready. Tap the microphone and speak a short sentence first.";
  let panel, detail, modeSelect;
  function setDetail(text, failed = false) {
    detailText = text;
    if (detail) detail.textContent = text;
    if (panel && failed) panel.open = true;
  }
  // Keep the existing editors and handlers; only move their DOM nodes together.
  // Injected by the prototype so the hosted release does not need a deployment.
  function installTranslationWorkspace() {
    const inputCard = document.querySelector("#translator-input")?.closest?.(".input-card");
    const result = document.querySelector("#translation-result");
    const preview = document.querySelector("#music-live-preview");
    if (!inputCard || !result || !preview || document.querySelector("#native-translation-workspace")) return;
    const workspace = document.createElement("section");
    workspace.id = "native-translation-workspace";
    workspace.setAttribute("aria-label", "Source and translation");
    const sourceLabel = document.createElement("span");
    sourceLabel.className = "native-source-label";
    sourceLabel.textContent = "Full source text";
    inputCard.prepend(sourceLabel);
    inputCard.before(workspace);
    workspace.append(inputCard, result, preview);
    const missing = document.querySelector("#no-result");
    if (missing) workspace.append(missing);
    // Keep full-text playback/editing tools available without stretching the pair.
    const tools = document.createElement("details");
    tools.className = "native-translation-tools";
    const summary = document.createElement("summary");
    summary.textContent = "Playback & translation notes";
    tools.append(summary);
    for (const node of [...result.children]) {
      if (!node.matches(".result-label, #natural-result")) tools.append(node);
    }
    result.append(tools);
    const style = document.createElement("style");
    style.textContent = `
      #native-translation-workspace {margin:12px 0;border:1px solid var(--line);border-radius:20px;background:white;overflow:hidden;}
      #native-translation-workspace > .input-card {margin:0;border:0;border-radius:0;box-shadow:none;padding:12px 14px 50px;}
      .native-source-label {display:block;margin-bottom:6px;color:var(--green);font-size:12px;font-weight:600;}
      #native-translation-workspace #translator-input {display:block;box-sizing:border-box;height:clamp(80px,14svh,140px);min-height:80px;max-height:22svh;overflow:auto;font-size:18px;font-weight:400;}
      #native-translation-workspace > #translation-result {margin:0;border-radius:0;padding:12px 14px;}
      #native-translation-workspace #natural-result {max-height:24svh;overflow:auto;padding:4px 0;font-size:19px;font-weight:400;}
      #native-translation-workspace > .music-live-preview {margin:0;padding:12px 14px;border:0;border-top:1px solid var(--line);border-radius:0;}
      #native-translation-workspace #music-live-source {max-height:14svh;overflow:auto;margin:6px 0;padding-bottom:8px;font-size:18px;font-weight:400;line-height:1.4;}
      #native-translation-workspace #music-live-draft {display:block;box-sizing:border-box;height:14svh;min-height:80px;max-height:22svh;overflow:auto;font-size:18px;font-weight:400;line-height:1.4;}
      .native-translation-tools {margin-top:8px;}
      .native-translation-tools > summary {min-height:44px;display:list-item;align-content:center;font-size:12px;cursor:pointer;}
      #native-translation-workspace > #no-result {margin:0;border-radius:0;}
      #native-translation-workspace textarea:focus-visible, #native-translation-workspace #music-live-source:focus-visible {outline:2px solid var(--green);outline-offset:-2px;}
    `;
    document.head.append(style);
    // Scrollable captured passages remain reachable with a hardware keyboard.
    document.querySelector("#music-live-source").tabIndex = 0;
  }
  function installNativeDetails() {
    const anchor = document.querySelector("#music-listen");
    if (!anchor) return;
    panel = document.createElement("details");
    panel.style.cssText = "margin:12px 0;padding:12px;border:1px solid currentColor;border-radius:16px";
    panel.id = "native-speech-details";
    if (window.__hablaSystemAudioSupported) {
      const source = document.querySelector("#music-playback-source");
      const option = document.createElement("option");
      option.value = "system";
      option.textContent = "This iPhone's audio · experimental";
      source?.append(option);
    }
    const summary = document.createElement("summary");
    summary.textContent = "iPhone speech · native 0.1.6 (7)";
    const label = document.createElement("label");
    label.textContent = "Recognition mode ";
    modeSelect = document.createElement("select");
    modeSelect.setAttribute("aria-label", "iPhone speech recognition mode");
    for (const [value, text] of [["auto", "On-device speech (iOS 26+)"], ["dictation", "On-device dictation (alternative)"], ["legacy-on-device", "Legacy on-device speech"], ["apple-service", "Apple service (may use internet)"]]) {
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
    installTranslationWorkspace();
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
      this._systemAudio = Boolean(this.continuous && window.__hablaSystemAudioSupported
        && document.querySelector("#music-playback-source")?.value === "system");
      syncSystemAudioFlag();
      try {
        window.webkit.messageHandlers.hablaSpeech.postMessage({action:"start", id,
          lang:this.lang, mode:modeSelect?.value || "auto", interimResults:this.interimResults, continuous:this.continuous, ...(this._systemAudio ? {input:"system"} : {})});
      } catch (error) {
        sessions.delete(id);
        syncSystemAudioFlag();
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
      syncSystemAudioFlag();
      instance._id = null;
      if (modeSelect && !sessions.size) modeSelect.disabled = false;
      instance._emit("end");
    } else if (message.type === "result") {
      if (!message.final && !instance.interimResults) return;
      const result = [{transcript:message.text, confidence:message.confidence ?? 0}];
      result.isFinal = Boolean(message.final);
      const passage = typeof message.confirmedText === "string"
        ? {confirmedText:message.confirmedText, tentativeText:message.tentativeText || ""} : {};
      instance._emit("result", {resultIndex:0, results:[result], ...passage});
    } else if (message.type === "error") {
      if (message.error !== "aborted") {
        latestError = message;
        setDetail([message.message || "Native speech stopped.", message.detail].filter(Boolean).join("\n"), true);
      }
      instance._emit("error", {error:message.error});
    } else if (message.type === "status") {
      setDetail(message.text);
      if (message.reveal && panel) panel.open = true;
    } else if (message.type === "start") instance._emit("start");
  }});
  window.SpeechRecognition = NativeSpeechRecognition;
  window.webkitSpeechRecognition = NativeSpeechRecognition;
})();
