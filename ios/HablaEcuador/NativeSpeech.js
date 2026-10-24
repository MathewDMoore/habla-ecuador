// Installed only inside the native companion, before the existing app loads.
(() => {
  if (location.origin !== "https://mathewdmoore.github.io"
      || !location.pathname.startsWith("/habla-ecuador/")
      || !window.webkit?.messageHandlers?.hablaSpeech) return;
  function installTypingDiagnostics() {
    if (window.__hablaTypingDiagnostics !== true) return;
    const input = document.querySelector("#translator-input");
    if (!input?.addEventListener) return;
    let sequence = 0;
    const inputTypes = new Set(["insertText", "insertReplacementText", "insertCompositionText",
      "insertFromComposition", "insertFromPaste", "deleteContentBackward", "deleteCompositionText", "historyUndo", "historyRedo"]);
    const report = (event, phase) => {
      // Do not send event.data, key, clipboard contents or input.value itself.
      const record = {action:"typing-diagnostic", id:"typing", event:event.type, phase,
        sequence:++sequence, milliseconds:Math.round(performance.now()),
        inputType:event.inputType ? (inputTypes.has(event.inputType) ? event.inputType : "other") : "none",
        textUnits:input.value.length, selectionStart:input.selectionStart, selectionEnd:input.selectionEnd,
        dataUnits:typeof event.data === "string" ? event.data.length : -1,
        focused:document.activeElement === input, composing:Boolean(event.isComposing),
        cancelable:event.cancelable, defaultPrevented:event.defaultPrevented};
      try { window.webkit.messageHandlers.hablaSpeech.postMessage(record); } catch {}
    };
    for (const type of ["focus", "blur", "select", "paste", "cut", "keydown", "keyup",
      "beforeinput", "input", "compositionstart", "compositionupdate", "compositionend"]) {
      input.addEventListener(type, event => {
        report(event, "before");
        queueMicrotask(() => report(event, "after"));
      }, {capture:true});
    }
    document.addEventListener("selectionchange", event => {
      if (document.activeElement === input) report(event, "after");
    });
  }
  let recordingImportRequest = null, recordingImportUI = null, nextRecordingImport = 0;
  const recordingDocumentID = globalThis.crypto?.randomUUID?.() || String(Date.now());
  function cancelRecordingImport(message = "Import cancelled. Existing text is unchanged.") {
    const id = recordingImportRequest;
    recordingImportRequest = null;
    if (id) try { window.webkit.messageHandlers.hablaSpeech.postMessage({action:"cancel-recording-import",id}); } catch {}
    if (recordingImportUI) {
      recordingImportUI.busy(false);
      recordingImportUI.status.textContent = message;
      recordingImportUI.apply.disabled = true;
    }
  }
  function receiveRecordingImport(message) {
    if (!recordingImportUI || !recordingImportRequest || message.id !== recordingImportRequest) return;
    const ui = recordingImportUI;
    ui.status.textContent = String(message.message || "Processing recording…");
    if (typeof message.text === "string") { ui.preview.value = message.text.slice(0,100000); ui.preview.hidden = false; }
    if (message.status === "working") return;
    recordingImportRequest = null;
    ui.busy(false);
    ui.ready = message.status === "done" && Boolean(ui.preview.value.trim());
    ui.preview.readOnly = !ui.ready;
    ui.apply.disabled = !ui.ready;
  }
  function installRecordingImport() {
    if (window.__hablaRecordingImportSupported !== true) return;
    const music = document.querySelector("#music-view");
    if (!music || document.querySelector("#native-recording-import")) return;
    const box = document.createElement("details");
    box.id = "native-recording-import";
    box.className = "compact-info";
    box.style.cssText = "margin:12px 0;padding:12px;border:1px solid currentColor;border-radius:16px";
    box.innerHTML = `<summary>Import a recording · Photos / Files</summary>
      <p>Choose a video, including a screen recording. Import one segment of up to 60 seconds; change the start time for the next segment. Maximum file size: 500 MB.</p>
      <label style="display:block">Recognition language<select id="native-recording-language" style="width:100%;font:inherit"><option value="es-MX">Spanish · es-MX recognizer</option><option value="en-US">English · en-US recognizer</option></select></label>
      <label style="display:block;margin-top:12px">Start at (seconds)<input id="native-recording-offset" type="number" min="0" max="86400" step="1" value="0" style="width:100%;box-sizing:border-box;font:inherit"></label>
      <p>Choose the dominant language; automatic bilingual recognition is not included. Audio stays on this iPhone. iCloud video downloads may need internet. On-device recognition must be available for the chosen language.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px"><button id="native-recording-photos" type="button" class="secondary-button">Choose from Photos</button><button id="native-recording-files" type="button" class="secondary-button">Choose from Files</button><button id="native-recording-cancel" type="button" class="secondary-button" hidden>Cancel import</button></div>
      <p id="native-recording-status" role="status">Ready to import. No microphone or live screen capture is started.</p>
      <label style="display:block">Recording draft · review and edit<textarea id="native-recording-preview" rows="5" readonly hidden style="width:100%;box-sizing:border-box;white-space:pre-wrap;overflow-wrap:anywhere;font:inherit"></textarea></label>
      <p>Singing, overlap and mixed languages can produce missing or inaccurate words. Applying replaces the source text and translates through your current translation provider; that may send the reviewed text online. The video/audio is never uploaded by this feature.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px"><button id="native-recording-apply" type="button" class="secondary-button" disabled>Replace source &amp; translate</button><button id="native-recording-undo" type="button" class="secondary-button" hidden>Undo source replacement</button></div>`;
    const style = document.createElement("style");
    style.textContent = "#native-recording-import label{display:grid;gap:6px;margin:12px 0;font-weight:700}#native-recording-import :is(input,select,textarea){padding:12px;border:1px solid var(--line,#ddd);border-radius:12px;background:white;color:var(--ink,#163a30);font-size:16px!important;min-width:0;max-width:100%;box-sizing:border-box}#native-recording-import button{min-height:44px;padding:10px 12px;max-width:100%;overflow-wrap:anywhere}#native-recording-import textarea{font-weight:400}";
    box.append(style);
    music.append(box);
    const get = suffix => box.querySelector("#native-recording-" + suffix);
    const ui = recordingImportUI = {status:get("status"),preview:get("preview"),apply:get("apply"),ready:false};
    let beforeImport = "", draftLanguage = "es-MX", undo = null, armed = null;
    ui.busy = working => {
      box.setAttribute("aria-busy", String(working));
      for (const name of ["photos","files","language","offset"]) get(name).disabled = working;
      get("cancel").hidden = !working;
      ui.preview.readOnly = working || !ui.ready;
    };
    for (const source of ["photos","files"]) get(source).addEventListener("click", () => {
      if (recordingImportRequest) return;
      if (sessions.size || reviewRequest) { ui.status.textContent = "Stop live listening or the recognition retry before importing."; return; }
      const startSeconds = Number(get("offset").value);
      if (!Number.isFinite(startSeconds) || !Number.isInteger(startSeconds) || startSeconds < 0 || startSeconds > 86400) { ui.status.textContent = "Enter a whole-number start time between 0 and 86400 seconds."; return; }
      recordingImportRequest = `recording-${recordingDocumentID}-${++nextRecordingImport}`;
      beforeImport = document.querySelector("#translator-input")?.value || "";
      draftLanguage = get("language").value;
      armed = null; ui.ready = false; ui.apply.disabled = true; ui.apply.textContent = "Replace source & translate";
      ui.preview.value = ""; ui.preview.hidden = true;
      ui.busy(true); ui.status.textContent = "Opening video picker…";
      try { window.webkit.messageHandlers.hablaSpeech.postMessage({action:"import-recording",id:recordingImportRequest,source,lang:draftLanguage,startSeconds}); }
      catch { cancelRecordingImport("Could not open the importer. Your text is unchanged."); }
    });
    get("cancel").addEventListener("click", () => cancelRecordingImport());
    ui.preview.addEventListener("input", () => { ui.apply.disabled = !ui.ready || !ui.preview.value.trim(); });
    function replaceSource(text, pair) {
      // Existing hosted functions own translation state/history; no new provider.
      cancelReview("Recording import clears the old live-audio retry buffer.");
      if (reviewEnabled) { reviewEnabled.checked = false; reviewCommand("configure-music-review", {enabled:false}); }
      window.newMusicSong();
      sourceLanguage = pair.source;
      targetLanguage = pair.target;
      window.syncLanguagePair();
      const editor = document.querySelector("#translator-input");
      editor.value = text;
      editor.dispatchEvent(new Event("input", {bubbles:true}));
    }
    ui.apply.addEventListener("click", () => {
      const editor = document.querySelector("#translator-input"), text = ui.preview.value.trim();
      if (recordingImportRequest || !ui.ready || !text || sessions.size || !editor) return;
      if (typeof window.newMusicSong !== "function" || typeof window.syncLanguagePair !== "function" || typeof sourceLanguage === "undefined" || typeof targetLanguage === "undefined") { ui.status.textContent = "Reopen Habla online to load the compatible translator before applying this draft."; return; }
      if (editor.value !== beforeImport && armed !== editor.value) {
        armed = editor.value;
        ui.apply.textContent = "Replace updated source & translate";
        ui.status.textContent = "Your source changed during import. Review it first; tap again only if you want to replace the newer text.";
        return;
      }
      const oldPair = {source:sourceLanguage,target:targetLanguage};
      const family = draftLanguage.split("-")[0];
      const pair = {source:sourceLanguage.startsWith(family) ? sourceLanguage : (family === "es" ? "es-EC" : "en-US"),target:targetLanguage};
      if (pair.target.startsWith(family)) pair.target = family === "es" ? "en-US" : "es-EC";
      undo = {before:editor.value,applied:text,pair:oldPair};
      replaceSource(text,pair);
      get("undo").hidden = false;
      ui.apply.disabled = true; ui.ready = false;
      ui.status.textContent = "Reviewed draft applied. From/To reflects its selected language. Undo restores previous source text and languages, not an earlier capture session.";
    });
    get("undo").addEventListener("click", () => {
      const editor = document.querySelector("#translator-input");
      if (!undo || !editor || sessions.size || recordingImportRequest) return;
      if (editor.value !== undo.applied) { ui.status.textContent = "Source text changed after applying. Undo did not overwrite your edits."; return; }
      replaceSource(undo.before,undo.pair); undo = null; get("undo").hidden = true;
      ui.status.textContent = "Previous source text and language pair restored.";
    });
    window.addEventListener("pagehide", () => { if (recordingImportRequest) cancelRecordingImport(); });
  }

  let shareRequest = null, nextShare = 0, shareButton, shareStatus;
  // Per-document IDs prevent a dismissed old page's sheet from finishing a new request.
  const shareDocument = Math.random().toString(36).slice(2);
  function finishShare(message) {
    if (!shareRequest || message.id !== shareRequest) return;
    shareRequest = null;
    shareButton.removeAttribute("aria-busy");
    shareButton.textContent = "Share translation";
    shareStatus.hidden = false;
    shareStatus.textContent = message.status === "completed" ? "Share action completed."
      : message.status === "cancelled" ? "Sharing cancelled."
      : message.message || "Could not share. Close any open sheet and try again.";
  }
  function installNativeSharing() {
    shareButton = document.querySelector("#share-result");
    shareStatus = document.querySelector("#translation-share-status");
    if (!shareButton || !shareStatus) return;
    // Keep Share visible alongside the translation, outside the notes disclosure.
    const actions = document.createElement("div");
    actions.className = "native-share-actions";
    actions.style.cssText = "margin:8px 0";
    actions.append(shareButton, shareStatus);
    document.querySelector("#translation-result")?.append(actions);
    shareButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation(); // Own this tap; do not also run hosted Copy fallback.
      if (shareRequest) return;
      const result = document.querySelector("#translation-result");
      const target = document.querySelector("#natural-result");
      const text = (target?.innerText ?? target?.textContent ?? "").trim();
      if (!result || result.hidden || target?.getAttribute("contenteditable") !== "true" || !text) return;
      if (text.length > 100000) {
        shareStatus.hidden = false;
        shareStatus.textContent = "Choose a translation of at most 100,000 characters.";
        return;
      }
      shareRequest = `share-${shareDocument}-${++nextShare}`;
      shareButton.textContent = "Sharing…";
      shareButton.setAttribute("aria-busy", "true");
      shareStatus.hidden = false;
      shareStatus.textContent = "Choose Messages, Mail or another app in the share sheet.";
      try { window.webkit.messageHandlers.hablaSpeech.postMessage({action:"share-translation", id:shareRequest, text}); }
      catch { finishShare({id:shareRequest, status:"error", message:"Could not open sharing. Try again."}); }
    }, {capture:true});
  }
  let reviewEnabled, reviewStatus, reviewPreview, reviewApply, reviewUndo, reviewCancel;
  let reviewRequest = null, reviewTimer, nextReview = 0, reviewText = "", undoText = null;
  function reviewCommand(action, extra = {}) {
    window.webkit.messageHandlers.hablaSpeech.postMessage({action, id:"review", ...extra});
  }
  function cancelReview(message = "Recognition cancelled. Captured words are unchanged.") {
    if (reviewRequest) reviewCommand("cancel-music-review");
    reviewRequest = null;
    clearTimeout(reviewTimer);
    if (reviewCancel) reviewCancel.hidden = true;
    if (reviewStatus) reviewStatus.textContent = message;
  }
  function installMultilingualReview() {
    const box = document.createElement("details");
    box.id = "native-multilingual-review";
    const title = document.createElement("summary");
    title.textContent = "Try multilingual recognition · experimental";
    const label = document.createElement("label");
    reviewEnabled = document.createElement("input");
    reviewEnabled.id = "native-review-enable";
    reviewEnabled.type = "checkbox";
    const explanation = document.createElement("span");
    explanation.textContent = " Retain the last 30 seconds in memory for a recognition retry. Audio stays on this iPhone; a new capture or turning this off clears it.";
    label.append(reviewEnabled, explanation);
    reviewEnabled.addEventListener("change", () => {
      cancelReview();
      reviewCommand("configure-music-review", {enabled:reviewEnabled.checked});
      reviewStatus.textContent = reviewEnabled.checked ? "Ready. Start listening, then stop and retry. First retry downloads a large model and tokenizer; Wi-Fi recommended. This is separate from the translation pack." : "Retry audio cleared. Existing captured words are unchanged.";
      reviewPreview.hidden = reviewApply.hidden = true;
    });
    const retry = document.createElement("button");
    retry.id = "native-review-retry";
    retry.type = "button";
    retry.textContent = "Retry last 30 seconds · download model if needed";
    retry.addEventListener("click", () => {
      if (reviewRequest) return;
      if (recordingImportRequest) { reviewStatus.textContent = "Finish or cancel recording import before retrying live audio."; return; }
      if (!reviewEnabled.checked) { reviewStatus.textContent = "Enable the retry buffer before starting a new capture."; return; }
      if (sessions.size) { reviewStatus.textContent = "Stop listening first, then retry."; return; }
      reviewRequest = `review-${++nextReview}`;
      reviewPreview.hidden = reviewApply.hidden = true;
      reviewCancel.hidden = false;
      reviewStatus.textContent = "Starting multilingual recognition… Audio stays on this iPhone.";
      try { reviewCommand("retry-music", {id:reviewRequest}); }
      catch { cancelReview("Could not start recognition. Try again."); return; }
      reviewTimer = setTimeout(() => cancelReview("Recognition timed out. Captured words are unchanged; retry when the model download is ready."), 180000);
    });
    reviewStatus = document.createElement("p");
    reviewStatus.id = "native-review-status";
    reviewStatus.setAttribute("role", "status");
    reviewStatus.textContent = "Compare a second recognizer without changing your words. Automatic language detection does not guarantee accurate singing or bilingual text.";
    reviewCancel = document.createElement("button");
    reviewCancel.type = "button";
    reviewCancel.textContent = "Cancel recognition";
    reviewCancel.hidden = true;
    reviewCancel.addEventListener("click", () => cancelReview());
    reviewPreview = document.createElement("p");
    reviewPreview.id = "native-review-preview";
    reviewPreview.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere";
    reviewPreview.hidden = true;
    reviewApply = document.createElement("button");
    reviewApply.id = "native-review-apply";
    reviewApply.type = "button";
    reviewApply.textContent = "Replace captured words with this 30-second draft";
    reviewApply.hidden = true;
    reviewUndo = document.createElement("button");
    reviewUndo.id = "native-review-undo";
    reviewUndo.type = "button";
    reviewUndo.textContent = "Undo draft replacement";
    reviewUndo.hidden = true;
    reviewApply.addEventListener("click", () => {
      if (!reviewEnabled.checked || !reviewText || sessions.size) return;
      const editor = document.querySelector("#translator-input");
      if (!editor) return;
      undoText = {before:editor.value, applied:reviewText};
      editor.value = reviewText;
      editor.dispatchEvent(new Event("input", {bubbles:true}));
      reviewUndo.hidden = false;
      reviewApply.hidden = true;
      reviewStatus.textContent = "Draft placed in the existing text box. Review it, then translate the captured words. Undo restores the previous text.";
    });
    reviewUndo.addEventListener("click", () => {
      const editor = document.querySelector("#translator-input");
      if (!undoText || !editor) return;
      if (editor.value !== undoText.applied) { reviewStatus.textContent = "Text has changed since replacement; undo did not overwrite your edits."; return; }
      editor.value = undoText.before;
      editor.dispatchEvent(new Event("input", {bubbles:true}));
      undoText = null;
      reviewUndo.hidden = true;
    });
    box.append(title, label, retry, reviewStatus, reviewCancel, reviewPreview, reviewApply, reviewUndo);
    panel.append(box);
    document.querySelector("#new-music-song")?.addEventListener("click", () => {
      cancelReview("New song clears the retained retry audio.");
      reviewCommand("configure-music-review", {enabled:false});
      reviewText = "";
      undoText = null;
      reviewPreview.hidden = reviewApply.hidden = reviewUndo.hidden = true;
    });
  }
  function receiveReview(message) {
    if (!reviewRequest || message.id !== reviewRequest) return;
    reviewStatus.textContent = String(message.message || "Recognition is working…");
    if (message.status === "working") return;
    reviewRequest = null;
    clearTimeout(reviewTimer);
    reviewCancel.hidden = true;
    if (message.status === "done" && typeof message.text === "string" && message.text.trim()) {
      reviewText = message.text;
      reviewPreview.textContent = reviewText;
      reviewPreview.hidden = reviewApply.hidden = false;
    }
  }
  let nextID = 0;
  const sessions = new Map();
  let latestError = null;
  let songButton, songStatus, songResult;
  let songRequest = null;
  let songStartup = null;
  let nextSongRequest = 0;
  const songSession = () => [...sessions.values()].reverse().find(instance =>
    instance.continuous && instance._systemAudio && instance._started && !instance._finishing);
  function updateSongButton() {
    if (songButton) songButton.disabled = Boolean(songRequest || songStartup);
  }
  function clearSongStartup() {
    if (songStartup) clearTimeout(songStartup.timer);
    songStartup = null;
  }
  function requestSong(instance) {
    clearSongStartup();
    songRequest = {id:instance._id, requestId:`song-${++nextSongRequest}`};
    songResult.textContent = "";
    songStatus.textContent = "Identifying the song with Shazam… Listening and translation continue.";
    updateSongButton();
    try {
      window.webkit.messageHandlers.hablaSpeech.postMessage({action:"identify-song", ...songRequest});
    } catch {
      songRequest = null;
      songStatus.textContent = "Could not start song identification. Try again.";
      updateSongButton();
    }
  }
  function finishSongRequest(id) {
    if (songRequest?.id !== id && songStartup?.id !== id) return;
    clearSongStartup();
    songRequest = null;
    if (songStatus) songStatus.textContent = "Identification stopped. Your captured words are unchanged.";
  }
  function installSongIdentification(anchor) {
    if (!window.__hablaSongIdentificationSupported) return;
    const card = document.createElement("section");
    card.id = "native-song-identification";
    card.setAttribute("aria-label", "Song identification");
    card.style.cssText = "margin:12px 0;padding:12px;border:1px solid currentColor;border-radius:16px";
    songButton = document.createElement("button");
    songButton.id = "native-identify-song";
    songButton.type = "button";
    songButton.textContent = "Identify this song";
    songButton.style.cssText = "min-height:44px;width:100%";
    songStatus = document.createElement("p");
    songStatus.id = "native-song-status";
    songStatus.setAttribute("role", "status");
    songStatus.textContent = "Choose This iPhone's audio, then tap Identify this song. Paused capture resumes after you approve screen sharing. Uses Shazam's online catalog; no lyrics are fetched.";
    songResult = document.createElement("div");
    songResult.id = "native-song-result";
    songButton.addEventListener("click", () => {
      const instance = songSession();
      if (songRequest || songStartup) return;
      if (instance) { requestSong(instance); return; }
      // Paused capture is a normal state, not a reason for an inert button.
      // Reuse the app's Continue listening action so it retains captured words.
      const pending = [...sessions.values()].find(session => !session._finishing);
      if (pending && (!pending.continuous || !pending._systemAudio)) {
        songStatus.textContent = "Stop the current microphone capture, choose This iPhone's audio, then tap Identify this song.";
        return;
      }
      if (document.querySelector("#music-playback-source")?.value !== "system") {
        songStatus.textContent = "Choose This iPhone's audio under Music playback, then tap Identify this song. Other audio inputs are not supported for song identification yet.";
        return;
      }
      if (!pending && anchor.disabled) {
        songStatus.textContent = "Capture is finishing. Wait for Continue listening, then tap Identify this song again.";
        return;
      }
      const startup = {id:pending?._id ?? null};
      songStartup = startup;
      startup.timer = setTimeout(() => {
        if (songStartup !== startup) return;
        clearSongStartup();
        songStatus.textContent = "Audio capture has not started. Approve screen sharing or check iPhone speech below, then tap Identify this song again.";
        updateSongButton();
      }, 45000);
      songStatus.textContent = "Starting this iPhone's audio… approve screen sharing if asked. Song identification begins when capture starts.";
      updateSongButton();
      try {
        // Do not toggle an already-starting/restarting capture off.
        if (!pending && anchor.getAttribute("aria-pressed") !== "true") anchor.click();
      } catch {
        clearSongStartup();
        songStatus.textContent = "Could not start audio capture. Check iPhone speech below, then try again.";
        updateSongButton();
      }
    });
    card.append(songButton, songStatus, songResult);
    anchor.parentElement.after(card);
    updateSongButton();
  }
  function receiveSong(message) {
    if (!songRequest || message.id !== songRequest.id || message.requestId !== songRequest.requestId) return;
    songRequest = null;
    if (message.status === "matched" && typeof message.title === "string" && message.title.trim()) {
      songStatus.textContent = "Song identified by Shazam. This match does not verify captured words or translation.";
      const title = document.createElement("p");
      title.textContent = message.title;
      const artist = document.createElement("p");
      artist.textContent = typeof message.artist === "string" ? message.artist : "Artist unavailable";
      songResult.append(title, artist);
      // Native metadata never becomes HTML or an unrestricted navigable URL.
      if (typeof message.url === "string" && /^https:\/\/(?:www\.)?shazam\.com\//i.test(message.url)) {
        const link = document.createElement("a");
        link.href = message.url;
        link.textContent = "View on Shazam";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        songResult.append(link);
      }
    } else {
      songStatus.textContent = typeof message.message === "string" ? message.message : "No song identified. Try another passage.";
    }
    updateSongButton();
  }
  const syncSystemAudioFlag = () => { window.__hablaSystemAudioCaptureActive = [...sessions.values()].some(instance => instance._systemAudio); };
  let detailText = "Native bridge ready. Tap the microphone and speak a short sentence first.";
  let panel, detail, modeSelect;
  function setDetail(text, failed = false) {
    detailText = text;
    if (detail) detail.textContent = text;
    if (panel && failed) {
      panel.open = true;
      const options = panel.closest?.("#native-music-options");
      if (options) options.open = true;
    }
  }
  let captureStatus, captureHint, captureButton, captureOwner = null;
  function paintCapture(state, text, hint = "") {
    if (!captureStatus) return;
    if (captureStatus.textContent !== text) captureStatus.textContent = text;
    captureStatus.setAttribute("data-state", state);
    captureHint.textContent = hint;
    captureStatus.style.color = state === "error" || state === "silent" || state === "gaps" ? "#8e342a" : "var(--green)";
    if (captureButton) {
      const busy = state === "waiting" || state === "starting";
      captureButton.textContent = busy ? "Cancel startup" : state === "stopping" ? "Stopping…"
        : ["listening", "silent", "words", "gaps"].includes(state) ? "Stop listening"
        : document.querySelector("#translator-input")?.value?.trim() ? "Continue listening" : "Start listening";
      captureButton.setAttribute("aria-pressed", ["listening", "silent", "words", "gaps"].includes(state) ? "true" : "false");
    }
  }
  function installCaptureControls(anchor) {
    captureButton = anchor;
    const card = document.createElement("section");
    card.id = "native-capture-controls";
    card.setAttribute("aria-label", "Music capture");
    card.style.cssText = "position:sticky;top:0;z-index:5;background:var(--cream,#fffaf0);border:2px solid var(--green);border-radius:16px;padding:12px;margin:10px 0;box-shadow:0 3px 12px #0002";
    const musicWorkspace = document.querySelector("#native-music-workspace");
    if (musicWorkspace?.prepend) musicWorkspace.prepend(card);
    else anchor.parentElement.before?.(card);
    // Keep source choice in sight; advanced recognition options stay collapsed.
    const sourceLabel = document.querySelector("#music-playback-source")?.closest?.("label");
    if (sourceLabel) card.append(sourceLabel);
    captureStatus = document.createElement("p");
    captureStatus.id = "native-capture-status";
    captureStatus.setAttribute("role", "status");
    captureStatus.setAttribute("aria-live", "polite");
    captureStatus.style.cssText = "font-size:18px;font-weight:700;margin:8px 0";
    captureHint = document.createElement("p");
    captureHint.id = "native-capture-hint";
    captureHint.style.cssText = "font-size:14px;margin:6px 0";
    anchor.style.cssText = "width:100%;min-height:52px";
    card.append(captureStatus, captureHint, anchor);
    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.textContent = "Capture details";
    detailsButton.addEventListener("click", () => {
      const options = panel?.closest?.("#native-music-options");
      if (options) options.open = true;
      if (panel) { panel.open = true; panel.scrollIntoView?.({block:"nearest"}); }
    });
    card.append(detailsButton);
    const setup = document.querySelector(".native-music-hint");
    if (setup) setup.textContent = "Choose the audio source, then Start listening. Captured words appear above; no audio file is saved.";
    paintCapture("ready", "Ready to listen", "This captures words for translation. It does not save an audio recording.");
  }
  function captureProgress(instance, text) {
    if (captureOwner !== instance._id || instance._finishing || !instance._started) return;
    const sample = String(text).match(/(?:Input|Microphone) audio: ([\d.]+) s · input peak (-?[\d.]+) dBFS/);
    if (!sample) return;
    const seconds = Number(sample[1]), level = Number(sample[2]);
    if (level <= -90) instance._quietReadings = (instance._quietReadings || 0) + 1;
    else instance._quietReadings = 0;
    const elapsed = `${Math.floor(seconds)} s received`;
    const drops = Number(String(text).match(/Capture backlog drops: (\d+)/)?.[1] || 0);
    if (drops > 0) {
      paintCapture("gaps", "Listening · audio gaps detected", `${elapsed}. Capture dropped ${drops} audio buffers; words may be missing. Stop and retry if this keeps increasing.`);
    } else if (instance._quietReadings >= 3) {
      paintCapture("silent", "Listening · no audio detected", `${elapsed}. Play audio and check the selected source. Screen recording may interrupt capture; use a screenshot instead.`);
    } else if (level > -90) {
      paintCapture(instance._hasWords ? "words" : "listening", instance._hasWords ? "Listening · words received" : "Listening · audio detected",
        `${elapsed}. ${instance._hasWords ? "Check the captured words above; accuracy is not verified." : "No words yet; audio presence does not prove recognition."}`);
    } else {
      paintCapture("listening", "Listening · waiting for audio", `${elapsed}. Play audio from the selected source.`);
    }
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
    const emptyTarget = document.createElement("section");
    emptyTarget.id = "native-empty-translation";
    emptyTarget.setAttribute("aria-label", "Translation");
    const targetLabel = document.createElement("p");
    targetLabel.className = "result-label";
    targetLabel.textContent = "Translation";
    const targetHint = document.createElement("p");
    targetHint.className = "native-empty-hint";
    targetHint.textContent = "Your translation will appear here.";
    emptyTarget.append(targetLabel, targetHint);
    workspace.append(inputCard, emptyTarget, result, preview);
    // The hosted app hides empty results. Reserve the target area until a real
    // full translation or paired live passage takes its place; never fake output.
    const syncEmptyTarget = () => { emptyTarget.hidden = !result.hidden || !preview.hidden; };
    syncEmptyTarget();
    const targetObserver = new MutationObserver(syncEmptyTarget);
    targetObserver.observe(result, {attributes:true, attributeFilter:["hidden"]});
    targetObserver.observe(preview, {attributes:true, attributeFilter:["hidden"]});
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
      #native-empty-translation {box-sizing:border-box;min-height:140px;min-height:18svh;padding:12px 14px;background:var(--green);color:white;}
      #native-empty-translation[hidden] {display:none;}
      #native-empty-translation .native-empty-hint {margin:12px 0 0;font-size:18px;font-weight:400;line-height:1.4;opacity:.8;}
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
  function installMusicWorkspace() {
    const music = document.querySelector("#music-view");
    const translate = document.querySelector("#translate-panel");
    const capture = document.querySelector(".music-capture");
    const workspace = document.querySelector("#native-translation-workspace");
    const languages = document.querySelector(".language-picker-row");
    const openView = window.openView;
    // Older/standalone pages keep their working layout if a required hook is absent.
    if (!music || !translate || !capture || !workspace || !languages
        || typeof openView !== "function" || typeof window.setMode !== "function"
        || typeof window.renderMusic !== "function" || document.querySelector("#native-music-workspace")) return;
    const musicWorkspace = document.createElement("section");
    musicWorkspace.id = "native-music-workspace";
    musicWorkspace.setAttribute("aria-label", "Listen and translate music");
    const editors = document.createElement("div");
    musicWorkspace.append(editors);
    const musicTitle = document.querySelector("#music-title");
    if (musicTitle) musicTitle.textContent = "Listen & translate";

    // Retain every original player, source/license link and culture section.
    const explore = document.createElement("details");
    explore.id = "native-music-explore";
    explore.className = "compact-info";
    const exploreTitle = document.createElement("summary");
    exploreTitle.textContent = "Explore recordings & culture";
    explore.append(exploreTitle);
    for (const child of [...music.children]) {
      if (!child.matches(".view-heading")) explore.append(child);
    }
    music.append(musicWorkspace, explore);

    // Only settings/help collapse. Stop, Identify and live status remain visible.
    const options = document.createElement("details");
    options.id = "native-music-options";
    options.className = "compact-info";
    const optionsTitle = document.createElement("summary");
    optionsTitle.textContent = "Listening options & help";
    options.append(optionsTitle);
    for (const child of [...capture.children]) {
      if (child.matches("label, details")) options.append(child);
    }
    const setup = document.createElement("p");
    setup.textContent = "Choose your audio source and live translation preferences in Listening options.";
    setup.className = "native-music-hint";
    capture.prepend(setup);
    capture.append(options);
    musicWorkspace.append(capture);

    // Move the same editors rather than cloning IDs, handlers or editable drafts.
    const shared = [languages, workspace, document.querySelector("#spanish-context"),
      document.querySelector(".english-comparison")].filter(Boolean).map(node => {
      const home = document.createComment("shared translation editor");
      node.before(home);
      return {node, home};
    });
    const restoreEditors = () => shared.forEach(({node, home}) => home.after(node));
    window.openView = id => {
      if (id !== "music-view") {
        if (id === "translator-view") restoreEditors();
        return openView(id);
      }
      // The hosted router cancels capture on every non-Translate destination.
      // Enter through its existing Translate route to retain the current session,
      // then select Music. Other destinations retain their normal stop behavior.
      window.setMode("translate");
      openView("translator-view");
      shared.forEach(({node}) => editors.append(node));
      document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view === music));
      document.querySelectorAll(".bottom-nav button").forEach(button =>
        button.classList.toggle("active", button.dataset.open === "music-view"));
      window.renderMusic();
    };
    const shortcuts = document.createElement("div");
    shortcuts.id = "native-translate-shortcuts";
    const musicLink = document.createElement("button");
    musicLink.type = "button";
    musicLink.textContent = "Music listening →";
    musicLink.addEventListener("click", () => window.openView("music-view"));
    const speechLink = document.createElement("button");
    speechLink.type = "button";
    speechLink.textContent = "Speech settings";
    speechLink.addEventListener("click", () => {
      window.openView("music-view");
      options.open = true;
      panel.open = true;
      options.scrollIntoView({block:"start"});
    });
    shortcuts.append(musicLink, speechLink);
    workspace.after(shortcuts);

    // Keep imports close at hand without several help panels above the editors.
    const imports = document.querySelector('[aria-label="Document translation"]');
    if (imports) {
      const importTools = document.createElement("details");
      importTools.id = "native-import-tools";
      importTools.className = "compact-info";
      const importTitle = document.createElement("summary");
      importTitle.textContent = "Import document or image";
      importTools.append(importTitle);
      imports.before(importTools);
      importTools.append(imports);
    }
    const style = document.createElement("style");
    style.textContent = `
      #native-translate-shortcuts {display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;}
      #native-translate-shortcuts button {min-height:44px;padding:8px 12px;border:1px solid var(--line);border-radius:12px;background:white;color:var(--green);font:inherit;}
      #native-music-workspace .music-capture {padding:12px;}
      #native-music-options {margin-top:12px;}
      .native-music-hint {font-size:14px;line-height:1.4;margin:0 0 10px;}
      #native-music-explore {margin-top:16px;}
      #native-import-tools > .document-tools {margin:0;border:0;padding:8px 0;}
    `;
    document.head.append(style);
  }
  function installNativeDetails() {
    installTypingDiagnostics();
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
    summary.textContent = "iPhone speech · native 0.1.16 (17)"
      + (window.__hablaTypingDiagnostics === true ? " · input diagnostics" : "");
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
    installMultilingualReview();
    anchor.parentElement.after(panel);
    installTranslationWorkspace();
    installNativeSharing();
    installSongIdentification(anchor);
    installMusicWorkspace();
    installRecordingImport();
    installCaptureControls(anchor);
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
      if (recordingImportRequest) throw new DOMException("Finish or cancel recording import first", "InvalidStateError");
      if (this._id !== null) throw new DOMException("Already listening", "InvalidStateError");
      cancelReview("New capture clears the previous retry audio. Captured text is kept.");
      if (reviewPreview) reviewPreview.hidden = reviewApply.hidden = true;
      const id = String(++nextID);
      this._id = id;
      this._started = false;
      this._finishing = false;
      sessions.set(id, this);
      latestError = null;
      if (modeSelect) modeSelect.disabled = true;
      setDetail("Starting native iPhone recognition…");
      this._systemAudio = Boolean(this.continuous && window.__hablaSystemAudioSupported
        && document.querySelector("#music-playback-source")?.value === "system");
      if (!this.continuous && captureOwner !== null) {
        captureOwner = null;
        paintCapture("stopped", "Music capture stopped", "Speech mode is using the microphone. Captured music words are kept.");
      }
      if (this.continuous) {
        captureOwner = id;
        this._quietReadings = 0;
        this._hasWords = false;
        paintCapture(this._systemAudio ? "waiting" : "starting",
          this._systemAudio ? "Waiting for screen-sharing approval" : "Starting microphone…",
          this._systemAudio ? "Choose Habla Ecuador and Share Entire Screen in Apple's picker. Then play your audio. Capture has not started yet." : "Allow microphone access if asked. Capture has not started yet.");
      }
      for (const other of sessions.values()) {
        if (other !== this) { other._finishing = true; finishSongRequest(other._id); }
      }
      if (songStartup && songStartup.id === null) {
        songStartup.id = id;
        if (!this._systemAudio) finishSongRequest(id);
      }
      updateSongButton();
      syncSystemAudioFlag();
      try {
        window.webkit.messageHandlers.hablaSpeech.postMessage({action:"start", id,
          lang:this.lang, mode:modeSelect?.value || "auto", interimResults:this.interimResults, continuous:this.continuous, ...(this._systemAudio ? {input:"system"} : {}), ...(this.continuous && reviewEnabled?.checked ? {retainForReview:true} : {})});
      } catch (error) {
        sessions.delete(id);
        finishSongRequest(id);
        updateSongButton();
        syncSystemAudioFlag();
        if (captureOwner === id) { captureOwner = null; paintCapture("error", "Could not start capture", "Tap Start listening to retry. Your words are kept."); }
        this._id = null;
        if (modeSelect) modeSelect.disabled = false;
        throw error;
      }
    }
    stop() { this._command("stop"); }
    abort() { this._command("abort"); }
    _command(action) {
      if (this._id !== null) {
        this._finishing = true;
        if (captureOwner === this._id) paintCapture("stopping", "Stopping capture…", "Keeping your captured words.");
        finishSongRequest(this._id);
        updateSongButton();
        window.webkit.messageHandlers.hablaSpeech.postMessage({action, id:this._id});
      }
    }
    _emit(type, properties = {}) {
      const event = new Event(type);
      Object.assign(event, properties);
      this.dispatchEvent(event);
      this["on" + type]?.(event);
    }
  }
  Object.defineProperty(window, "__hablaNativeSpeech", {value:message => {
    if (message.type === "recording-import") { receiveRecordingImport(message); return; }
    if (message.type === "share") { finishShare(message); return; }
    if (message.type === "music-review") { receiveReview(message); return; }
    const instance = sessions.get(message.id);
    if (!instance) return;
    if (message.type === "song") { receiveSong(message); return; }
    if (message.type === "end") {
      sessions.delete(message.id);
      finishSongRequest(message.id);
      updateSongButton();
      syncSystemAudioFlag();
      const ownsCapture = captureOwner === message.id;
      instance._id = null;
      if (modeSelect && !sessions.size) modeSelect.disabled = false;
      instance._emit("end");
      if (ownsCapture) {
        captureOwner = null;
        paintCapture(instance._captureError ? "error" : "stopped", instance._captureError ? "Capture stopped · check source" : "Capture stopped",
          instance._captureError || "Your captured words are kept. Tap Start or Continue listening to resume.");
      }
    } else if (message.type === "result") {
      if (!message.final && !instance.interimResults) return;
      if (captureOwner === message.id && !instance._finishing && message.text?.trim()) {
        instance._hasWords = true;
        paintCapture("words", "Listening · words received", "Check the captured words above; accuracy is not verified.");
      }
      const result = [{transcript:message.text, confidence:message.confidence ?? 0}];
      result.isFinal = Boolean(message.final);
      const passage = typeof message.confirmedText === "string"
        ? {confirmedText:message.confirmedText, tentativeText:message.tentativeText || ""} : {};
      instance._emit("result", {resultIndex:0, results:[result], ...passage});
    } else if (message.type === "error") {
      instance._finishing = true;
      finishSongRequest(message.id);
      updateSongButton();
      if (captureOwner === message.id) {
        instance._captureError = message.error === "aborted" ? "" : message.message || "Capture ended unexpectedly. Check the selected source and retry.";
        paintCapture(instance._captureError ? "error" : "stopped", instance._captureError ? "Capture stopped · check source" : "Capture cancelled", instance._captureError || "Your captured words are kept.");
      }
      if (message.error !== "aborted") {
        latestError = message;
        setDetail([message.message || "Native speech stopped.", message.detail].filter(Boolean).join("\n"), true);
      }
      instance._emit("error", {error:message.error});
    } else if (message.type === "status") {
      setDetail(message.text);
      captureProgress(instance, message.text);
      if (message.reveal && panel) panel.open = true;
    } else if (message.type === "start") {
      instance._started = true;
      updateSongButton();
      instance._emit("start");
      if (captureOwner === message.id && !instance._finishing) paintCapture("listening", "Listening · waiting for audio", instance._systemAudio ? "Play your audio now. Capture is active; no audio file is saved." : "Play audio near the microphone. Capture is active; no audio file is saved.");
      if (songStartup?.id === message.id && songSession() === instance) requestSong(instance);
    }
  }});
  window.SpeechRecognition = NativeSpeechRecognition;
  window.webkitSpeechRecognition = NativeSpeechRecognition;
})();
