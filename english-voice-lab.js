/* Habla Ecuador: six-country synthetic English voice comparison pilot.
 * No model training, human speaker recordings, microphone loopback, or
 * claims of verified accent accuracy. Voice availability is device-local.
 */
(function(root) {
  "use strict";

  const COUNTRIES = Object.freeze([
    {locale:"en-US",label:"🇺🇸 United States"},
    {locale:"en-GB",label:"🇬🇧 United Kingdom"},
    {locale:"en-CA",label:"🇨🇦 Canada"},
    {locale:"en-AU",label:"🇦🇺 Australia"},
    {locale:"en-NZ",label:"🇳🇿 New Zealand"},
    {locale:"en-IE",label:"🇮🇪 Ireland"}
  ]);
  const PHRASES = Object.freeze([
    {id:"meet",text:"Nice to meet you.",spanish:"Mucho gusto."},
    {id:"repeat",text:"Could you say that again, please?",spanish:"¿Podrías repetir eso, por favor?"},
    {id:"coffee",text:"I'd like a coffee, please.",spanish:"Quisiera un café, por favor."},
    {id:"thanks",text:"Thank you for your help.",spanish:"Gracias por tu ayuda."}
  ]);
  const norm = value => String(value || "").replace(/_/g,"-").toLowerCase();
  const voiceScore = voice =>
    (/premium|enhanced|neural|natural/i.test(voice.name || "") ? 3 : 0) +
    (voice.localService ? 1 : 0);

  // Deliberately exact: never silently impersonate a requested country accent.
  function exactVoice(voices, locale) {
    return [...(voices || [])]
      .filter(voice => norm(voice.lang) === norm(locale))
      .sort((a,b) => voiceScore(b)-voiceScore(a) || String(a.name).localeCompare(String(b.name)))[0] || null;
  }

  function bind({speak, stop, bindPractice, cancelPractice}={}) {
    const host = root.document?.getElementById("english-voice-lab");
    if (!host || host.dataset.bound === "true") return;
    host.dataset.bound = "true";
    const q = selector => host.querySelector(selector);
    const left = q("#voice-lab-left"), right = q("#voice-lab-right");
    const phrase = q("#voice-lab-phrase"), status = q("#voice-lab-status");
    const practice = q("#voice-lab-practice"), practiceText = q("#voice-lab-practice-text");
    const help = q("#voice-lab-spanish");
    const buttons = {left:q("#voice-lab-play-left"),right:q("#voice-lab-play-right"),pair:q("#voice-lab-play-pair")};
    const voiceLabels = {left:q("#voice-lab-voice-left"),right:q("#voice-lab-voice-right")};
    const cancelButton = q("#voice-lab-stop");
    let labPlaying = false;

    function voices() {
      try { return root.speechSynthesis?.getVoices?.() || []; } catch { return []; }
    }
    function currentPhrase() {
      return PHRASES.find(item => item.id === phrase.value) || PHRASES[0];
    }
    function get(side) {
      return exactVoice(voices(), side === "left" ? left.value : right.value);
    }
    function note(message) { status.textContent = message; }
    function describe(side) {
      const available = get(side);
      const label = side === "left" ? voiceLabels.left : voiceLabels.right;
      label.textContent = available
        ? "Available: " + available.name + " (" + available.lang + (available.localService ? ", device" : ", service") + ")"
        : "No matching voice installed or exposed by this browser. No substituted accent.";
      buttons[side].disabled = !available;
      return Boolean(available);
    }
    function refresh() {
      const a = describe("left"), b = describe("right");
      buttons.pair.disabled = !(a && b);
      if (!root.speechSynthesis || !root.SpeechSynthesisUtterance) {
        note("Synthetic speech is unavailable in this browser.");
      } else if (!voices().length) {
        note("The browser has not supplied its voice list. Open this panel or retry after voices load.");
      } else {
        note(a && b
          ? "Both selected voices are available. Listen and compare, then try speaking."
          : "Choose another country or install a matching device voice. The missing accent will not be faked.");
      }
    }
    function pause() {
      if (labPlaying) {
        stop?.();
        labPlaying = false;
      }
    }
    function rebuildPractice() {
      cancelPractice?.(practice);
      practice.querySelector(".dictionary-practice")?.remove();
      const item = currentPhrase();
      practice.dataset.practiceText = item.text;
      practice.dataset.practiceLang = left.value;
      practiceText.textContent = item.text;
      practiceText.lang = left.value;
      help.textContent = item.spanish;
      bindPractice?.(practice);
    }
    function play(side) {
      const voice = get(side);
      if (!voice) { refresh(); return; }
      pause();
      cancelPractice?.(practice);
      labPlaying = true;
      note("Playing a synthesized " + voice.lang + " voice. This is not a native-speaker recording.");
      speak?.([{text:currentPhrase().text,lang:voice.lang,voice,requireExactVoice:true}]);
    }
    function playPair() {
      const a = get("left"), b = get("right");
      if (!a || !b) { refresh(); return; }
      pause();
      cancelPractice?.(practice);
      labPlaying = true;
      note("Playing the same words with voice A, then voice B. Listening comparison only; no automatic voice training.");
      speak?.([
        {text:currentPhrase().text,lang:a.lang,voice:a,requireExactVoice:true},
        {text:currentPhrase().text,lang:b.lang,voice:b,requireExactVoice:true}
      ]);
    }
    buttons.left.addEventListener("click",()=>play("left"));
    buttons.right.addEventListener("click",()=>play("right"));
    buttons.pair.addEventListener("click",playPair);
    cancelButton.addEventListener("click",()=>{pause();note("Playback stopped. Your lesson choices are preserved.");});
    for (const select of [left,right]) select.addEventListener("change",()=>{
      pause();
      rebuildPractice();
      refresh();
    });
    phrase.addEventListener("change",()=>{
      pause();
      rebuildPractice();
      refresh();
    });
    host.addEventListener("toggle",()=>{
      if (host.open) refresh();
      else leave();
    });
    root.speechSynthesis?.addEventListener?.("voiceschanged",refresh);
    root.document.addEventListener("visibilitychange",()=>{if(root.document.hidden)leave();else if(host.open)refresh();});
    // Switching to another Habla lesson must not leave our sample speaking.
    root.document.addEventListener("click",event=>{
      if (labPlaying && !host.contains(event.target)) pause();
      if (labPlaying && event.target.closest?.(".dictionary-practice")) pause();
    },true);
    function leave() {
      pause();
      cancelPractice?.(practice);
    }
    rebuildPractice();
    refresh();
    root.HablaEnglishVoiceLab.leave = leave;
    root.HablaEnglishVoiceLab.isProtected = () => labPlaying && Boolean(root.speechSynthesis?.speaking);
  }

  const api = {COUNTRIES,PHRASES,exactVoice,bind,leave:()=>{},isProtected:()=>false};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HablaEnglishVoiceLab = api;
})(typeof window === "object" ? window : globalThis);
