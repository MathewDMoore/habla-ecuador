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
    summary.textContent = "iPhone speech · native 0.1.5 (6)";
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
    abort() {
      if (this._id === null) return;
      const id = this._id;
      try { this._command("abort"); }
      finally {
        // WKWebView may never deliver the native end event after an aborted
        // capture. Release the JS session now so the next tap can start fresh.
        sessions.delete(id);
        this._id = null;
        if (modeSelect && !sessions.size) modeSelect.disabled = false;
      }
    }
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
  // Native-only controls. Deliberately separate from web file playback.
  function installNativeAudio() {
    if(document.querySelector('#habla-native-audio'))return;
    const anchor=document.querySelector('#whatsapp-audio-import')||document.querySelector('#music-listen');if(!anchor)return;
    const panel=document.createElement('details');panel.id='habla-native-audio';panel.className='compact-info';
    panel.innerHTML='<summary>Audio nativo / Native audio · prototype</summary><p>Notas de voz: transcripción en el iPhone. Llamadas: solo envío de voz; compatibilidad con WhatsApp no verificada. / Voice notes: on-device transcription. Calls: outgoing speech only; WhatsApp compatibility unverified. No remote-call audio capture.</p><button type="button" data-native-file>Transcribir archivo / Transcribe file</button> <button type="button" data-native-cancel>Cancelar / Cancel</button><label>Transcripción editable / Editable transcript<textarea data-native-transcript rows="4"></textarea></label><button type="button" data-native-use>Usar texto para traducir / Use text to translate</button><hr><button type="button" data-native-copy-translation>Preparar traducción / Prepare translation</button><label>Texto que enviarás / Text to send<textarea data-native-call-text rows="3"></textarea></label><button type="button" data-native-call>Activar voz saliente / Enable outgoing call speech</button><button type="button" data-native-send disabled>Enviar traducción a llamada / Speak translation into call</button><p data-native-status role="status"></p>';
    anchor.after(panel);
    const status=panel.querySelector('[data-native-status]'),transcript=panel.querySelector('[data-native-transcript]'),call=panel.querySelector('[data-native-call]'),send=panel.querySelector('[data-native-send]');
    let counter=0,enabled=false;
    const post=(action,data={})=>window.webkit.messageHandlers.hablaSpeech.postMessage({action,id:'audio-'+Date.now()+'-'+(++counter),...data});
    panel.querySelector('[data-native-file]').onclick=()=>{status.textContent='Choose a saved voice note. Audio stays on this iPhone. / Elige una nota guardada; el audio permanece en este iPhone.';post('transcribeFile',{lang:document.querySelector('#source-language-select')?.value||'es-EC'});};
    panel.querySelector('[data-native-cancel]').onclick=()=>post('cancelFile');
    panel.querySelector('[data-native-use]').onclick=()=>{const input=document.querySelector('#translator-input');if(!input||!transcript.value.trim())return;input.value=transcript.value;input.dispatchEvent(new Event('input',{bubbles:true}));status.textContent='Transcript inserted for translation; check recognized words. / Texto insertado para traducir; revisa las palabras reconocidas.';};
    call.onclick=()=>post('callSpeech',{enabled:!enabled});
    panel.querySelector('[data-native-copy-translation]').onclick=()=>{const input=document.querySelector('#translator-input'),result=document.querySelector('#natural-result');if(input?.value.trim())panel.querySelector('[data-native-call-text]').value=result?.innerText?.trim()||'';};
    send.onclick=()=>{const text=panel.querySelector('[data-native-call-text]').value.trim();if(!text){status.textContent='Translate a phrase first. / Traduce una frase primero.';return;}post('speakCall',{text,lang:document.querySelector('#target-language-select')?.value||'es-EC'});};
    window.__hablaNativeAudio=message=>{
      if(typeof message.enabled==='boolean'){enabled=message.enabled;send.disabled=!enabled;call.textContent=enabled?'Desactivar voz saliente / Disable outgoing call speech':'Activar voz saliente / Enable outgoing call speech';}
      if(typeof message.text==='string'){transcript.value=message.text;status.textContent='Transcription ready ('+(message.language||'')+'). Review, then use it to translate. / Transcripción lista; revisa antes de traducir.';}
      if(message.status||message.error)status.textContent=message.error||message.status;
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installNativeAudio);else installNativeAudio();
})();
