/* Six-country synthetic English voice exchange.
 * Distinct turn-taking lines, not imitation, self-training, accent certification,
 * microphone loopback, a learner repetition drill, or a real human recording.
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
  // Original, broadly comprehensible English. No invented national vocabulary.
  const SCENES = Object.freeze([
    {id:"meeting",name:"Meeting someone",turns:[
      "Hello, is this seat taken?",
      "No, you're welcome to sit here.",
      "Thanks. Is the meeting starting soon?",
      "Yes, in a few minutes."
    ]},
    {id:"coffee",name:"At a coffee shop",turns:[
      "Would you like a cup of coffee?",
      "Yes, please. Do you have anything without milk?",
      "We do. Would you like it hot or iced?",
      "Iced would be great, thank you."
    ]},
    {id:"directions",name:"Finding the library",turns:[
      "Excuse me, is the library close to here?",
      "Yes, it's a short walk down this street.",
      "Should I turn at the next corner?",
      "That's right. You'll see it on your left."
    ]},
    {id:"work",name:"Checking a schedule",turns:[
      "Have you read the new schedule?",
      "Not yet. Did the meeting time change?",
      "Yes, it starts at ten now.",
      "Thanks for letting me know."
    ]}
  ]);
  const norm = value => String(value || "").replace(/_/g,"-").toLowerCase();
  const score = voice => (/premium|enhanced|neural|natural/i.test(voice.name || "") ? 3 : 0) + (voice.localService ? 1 : 0);
  // Deliberately exact: a device's American voice cannot masquerade as Irish.
  function exactVoice(voices, locale) {
    return [...(voices || [])]
      .filter(voice => norm(voice.lang) === norm(locale))
      .sort((a,b) => score(b)-score(a) || String(a.name).localeCompare(String(b.name)))[0] || null;
  }
  function turnsFor(scene, left, right, voiceA, voiceB) {
    return scene.turns.map((text,index) => ({
      speaker:index % 2 === 0 ? "A" : "B",
      locale:index % 2 === 0 ? left : right,
      voice:index % 2 === 0 ? voiceA : voiceB,
      text
    }));
  }
  function bind({speak,stop}={}) {
    const host = root.document?.getElementById("english-voice-lab");
    if (!host || host.dataset.bound === "true") return;
    host.dataset.bound = "true";
    const q = selector => host.querySelector(selector);
    const left = q("#voice-lab-left"), right = q("#voice-lab-right");
    const scenePicker = q("#voice-lab-scene"), status = q("#voice-lab-status");
    const exchangeButton = q("#voice-lab-play-exchange"), stopButton = q("#voice-lab-stop");
    const transcript = q("#voice-lab-transcript");
    const voiceLabels = {left:q("#voice-lab-voice-left"),right:q("#voice-lab-voice-right")};
    let labPlaying = false;
    const voiceList = () => {
      try {return root.speechSynthesis?.getVoices?.() || [];}catch{return [];}
    };
    const voice = side => exactVoice(voiceList(),side === "left" ? left.value : right.value);
    const scene = () => SCENES.find(item => item.id === scenePicker.value) || SCENES[0];
    const note = value => {status.textContent = value;};
    function renderTranscript() {
      const item = scene();
      transcript.replaceChildren();
      item.turns.forEach((line,index)=>{
        const li = root.document.createElement("li");
        const speaker = index % 2 === 0 ? "A" : "B";
        const country = COUNTRIES.find(c=>c.locale === (speaker==="A"?left.value:right.value));
        const heading = root.document.createElement("strong");
        heading.textContent = speaker+" · "+country.label+": ";
        const words = root.document.createElement("span");
        words.lang = country.locale;
        words.textContent = line;
        li.append(heading,words);
        transcript.append(li);
      });
    }
    function describe(side) {
      const matching = voice(side);
      voiceLabels[side].textContent = matching
        ? "Available: "+matching.name+" · "+matching.lang
        : "Regional device voice unavailable. No substituted accent.";
      return Boolean(matching);
    }
    function refresh() {
      const a=describe("left"), b=describe("right");
      exchangeButton.disabled = !(a && b && root.SpeechSynthesisUtterance);
      renderTranscript();
      if(!root.speechSynthesis || !root.SpeechSynthesisUtterance)
        note("Speech synthesis is unavailable here. The dialogue text is still available.");
      else if(!voiceList().length)
        note("The voice list is still loading. Reopen this panel once your device exposes its voices.");
      else if(a && b)
        note("Ready: four conversational turns, automatically spoken A → B → A → B. No learner repetition.");
      else
        note("Choose two countries with installed voices. Missing voices are not silently replaced.");
    }
    function leave() {
      if(labPlaying) {
        stop?.();
        labPlaying=false;
      }
    }
    function runExchange() {
      const a=voice("left"),b=voice("right");
      if(!a || !b){refresh();return;}
      leave();
      const lines=turnsFor(scene(),left.value,right.value,a,b);
      labPlaying=true;
      note("Running a scripted synthetic voice conversation. This is a listening lab, not model training or a validated national accent test.");
      // The existing playback engine owns utterance timing/turn queue.
      // Voice objects are explicit, and no speech recognizer or microphone opens.
      speak?.(lines.map(line=>({text:line.text,lang:line.locale,voice:line.voice,requireExactVoice:true})));
    }
    exchangeButton.addEventListener("click",runExchange);
    stopButton.addEventListener("click",()=>{
      leave();
      note("Exchange stopped. Your selections and transcript are preserved.");
    });
    for(const picker of [left,right,scenePicker])picker.addEventListener("change",()=>{
      leave();
      refresh();
    });
    q("#voice-lab-swap").addEventListener("click",()=>{
      leave();
      [left.value,right.value]=[right.value,left.value];
      refresh();
    });
    host.addEventListener("toggle",()=>host.open?refresh():leave());
    root.speechSynthesis?.addEventListener?.("voiceschanged",refresh);
    root.document.addEventListener("visibilitychange",()=>{if(root.document.hidden)leave();else if(host.open)refresh();});
    root.document.addEventListener("click",event=>{if(labPlaying && !host.contains(event.target))leave();},true);
    refresh();
    root.HablaEnglishVoiceLab.leave=leave;
    root.HablaEnglishVoiceLab.isProtected=()=>labPlaying && Boolean(root.speechSynthesis?.speaking);
  }
  const api={COUNTRIES,SCENES,exactVoice,turnsFor,bind,leave:()=>{},isProtected:()=>false};
  if(typeof module!=="undefined" && module.exports)module.exports=api;
  else root.HablaEnglishVoiceLab=api;
})(typeof window==="object"?window:globalThis);
