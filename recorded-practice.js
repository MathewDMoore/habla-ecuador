/* Native-speaker reference pilot. Audio stays on the publisher's host.
 * Spanish excerpts: Orlando Kelm / COERLL, University of Texas at Austin,
 * Spanish Proficiency Exercises (publisher lists CC BY). English meanings and
 * practice cues added by Habla Ecuador. No regional/acoustic score is claimed.
 */
(function(root) {
  'use strict';
  const catalog = {
    publisher:'Orlando Kelm · COERLL · The University of Texas at Austin',
    license:'CC BY', licenseUrl:'https://coerll.utexas.edu/coerll/oer/spanish-proficiency-exercises/',
    checkedOn:'2026-10-24',
    items:[
      {id:'quito-interests',region:'Ecuador · Quito',speaker:'Alejandra Z.',locale:'es-EC',clip:'beg05d',
       spanish:'Hay cuatro cosas que me encantan… hacer.',us:'There are four things I love to do.',uk:'There are four things I love to do.',
       cue:'Listen for the pause before hacer. Practise the phrase slowly, then at a comfortable conversational pace.'},
      {id:'lapaz-family',region:'Bolivia · La Paz',speaker:'Mónica V.',locale:'es-BO',clip:'adv06c',
       spanish:'Bueno, mi familia es boliviana por el lado de mi madre.',us:"Well, my family is Bolivian on my mother's side.",uk:"Well, my family is Bolivian on my mother's side.",
       cue:'Keep the stress in fa-MI-lia and bo-li-VIA-na. This speaker describes both Bolivian and Mexican family backgrounds.'},
      {id:'monterrey-weekend',region:'Mexico · Monterrey',speaker:'Alfredo C.',locale:'es-MX',clip:'beg05a',
       spanish:'Bueno, los fines de semana me gusta dedicarlos a la familia.',us:'Well, I like to spend my weekends with my family.',uk:'Well, I like to spend my weekends with my family.',
       cue:'Listen to how fines de semana joins together. Keep the stress in se-MA-na and fa-MI-lia.'},
      {id:'caracas-colors',region:'Venezuela · Caracas',speaker:'Deyanira H.',locale:'es-VE',clip:'beg03c',
       spanish:'Las hojas son verdes.',us:'The leaves are green.',uk:'The leaves are green.',
       cue:'Listen for HO-jas and VER-des. This phrase occurs later in the full example; use the player controls to replay it.'}
    ]
  };
  // Original Habla teaching content; device voices and existing recognition.
  const originalEnglishLessons = [
  {
    "id": "introductions",
    "title": "Conocer a alguien",
    "scene": "Conoces a una persona nueva en el trabajo. Quieres responder con amabilidad.",
    "explanation": "Después de conocer a alguien, esta frase expresa que te da gusto conocerlo. Aprende la expresión completa y escucha cómo se unen las palabras.",
    "context": "Hi, I'm Ana.",
    "contextMeaning": "Hola, soy Ana.",
    "phrase": "Nice to meet you.",
    "meaning": "Mucho gusto.",
    "chunks": [
      "Nice",
      "to meet you"
    ],
    "task": "Ana se acaba de presentar. Responde que te da gusto conocerla."
  },
  {
    "id": "repeat",
    "title": "Pedir que repitan",
    "scene": "Una persona habla muy rápido y no alcanzas a entender. Quieres escuchar el mensaje otra vez.",
    "explanation": "Puedes pedir que la otra persona repita usando una pregunta cortés. Al final, agrega por favor. No necesitas disculparte por estar aprendiendo.",
    "context": "The meeting starts at nine.",
    "contextMeaning": "La reunión empieza a las nueve.",
    "phrase": "Could you say that again, please?",
    "meaning": "¿Podrías repetir eso, por favor?",
    "chunks": [
      "Could you",
      "say that again",
      "please"
    ],
    "task": "No entendiste bien la hora de la reunión. Pide que repitan el mensaje."
  },
  {
    "id": "coffee",
    "title": "Pedir un café",
    "scene": "Estás en una cafetería y te preguntan qué deseas. Pide un café de forma cortés.",
    "explanation": "Esta expresión sirve para pedir algo que te gustaría recibir. Apréndela como un bloque y cambia el producto cuando lo necesites. La palabra final añade cortesía.",
    "context": "What would you like?",
    "contextMeaning": "¿Qué te gustaría pedir?",
    "phrase": "I'd like a coffee, please.",
    "meaning": "Quisiera un café, por favor.",
    "chunks": [
      "I'd like",
      "a coffee",
      "please"
    ],
    "task": "La persona que atiende espera tu pedido. Pide un café y di por favor."
  },
  {
    "id": "hungry",
    "title": "Decir que tienes hambre",
    "scene": "Estás caminando con una amistad y quieres parar para comer. Explica cómo te sientes.",
    "explanation": "En español dices que tienes hambre. En inglés describes cómo estás, usando el verbo ser o estar y un adjetivo. Escucha la forma corta que se usa en la conversación cotidiana.",
    "context": "Would you like to stop for lunch?",
    "contextMeaning": "¿Te gustaría parar para almorzar?",
    "phrase": "I'm hungry.",
    "meaning": "Tengo hambre.",
    "chunks": [
      "I'm",
      "hungry"
    ],
    "task": "Tu amistad propone parar para almorzar. Di que tienes hambre."
  }
];
  const englishCatalog = {'en-US':originalEnglishLessons,'en-GB':originalEnglishLessons};
  let learningLocale = 'es-EC', englishStage = 1;
  const selectedEnglish = {};
  let selected = catalog.items[0].id, player = null, generation = 0, spanishSubtitles = true;
  function pause() {
    generation += 1;
    if (player) player.pause();
    if (learningLocale !== 'es-EC') root.stopSpeechPlayback();

  }
  function leave() {
    pause();
    if (root.HablaRecordedTranscripts) root.HablaRecordedTranscripts.cancel();
  }
  function setLearningLanguage(locale) {
    const next = englishCatalog[locale] ? locale : 'es-EC';
    const host = document.getElementById('recorded-practice');
    if (!host || (next === learningLocale && host.dataset.learningLanguage === next)) return;
    root.cancelDictionaryPractice(host);
    learningLocale = next;
    render();
  }
  function renderEnglish(host) {
    const items=englishCatalog[learningLocale], locale=learningLocale;
    const item=items.find(i=>i.id===selectedEnglish[locale]) || items[0];
    selectedEnglish[locale]=item.id;englishStage=1;player=null;
    const content=document.getElementById('recorded-practice-content'), escape=value=>root.escapeHtml(value);
    content.innerHTML=`
      <label>Choose a speaking lesson<select id="english-lesson-select">${items.map(i=>`<option value="${i.id}" ${i.id===item.id?'selected':''}>${escape(i.title)}</option>`).join('')}</select></label>
      <h3 lang="es" data-ui-content>${escape(item.title)}</h3>
      <p>Understand, listen, then speak.</p>
      <div class="english-mini-steps" role="group" aria-label="Mini lesson steps"><button type="button" data-mini-step="1">1 · Understand</button><button type="button" data-mini-step="2">2 · Listen</button><button type="button" data-mini-step="3">3 · Speak</button></div>
      <section id="english-mini-understand" data-mini-panel="1">
        <p class="english-mini-scene" lang="es" data-ui-content>${escape(item.scene)}</p>
        <p lang="es" data-ui-content>${escape(item.explanation)}</p>
        <button type="button" id="english-explanation-hear" class="secondary-button">🔊 Hear Spanish explanation</button>
        <button type="button" class="primary-button" data-mini-next="2">Hear the English example →</button>
      </section>
      <section id="english-mini-listen" data-mini-panel="2" hidden>
        <div class="english-mini-dialogue">
          <p><small>The other person</small><br><span lang="${locale}" data-ui-content>${escape(item.context)}</span><br><span lang="es" data-ui-content>${escape(item.contextMeaning)}</span></p>
          <button type="button" id="english-context-hear" class="secondary-button">🔊 Hear the other person</button>
          <p class="english-mini-reply"><small>You</small><br><strong lang="${locale}" data-ui-content>${escape(item.phrase)}</strong><br><span lang="es" data-ui-content>${escape(item.meaning)}</span></p>
        </div>
        <button type="button" id="english-model-hear" class="secondary-button">🔊 Hear your reply</button>
        <p>Listen to each part, then hear the whole reply again.</p>
        <div class="english-mini-chunks">${item.chunks.map(chunk=>`<button type="button" data-english-chunk="${escape(chunk)}" lang="${locale}" data-ui-content>🔊 ${escape(chunk)}</button>`).join('')}</div>
        <button type="button" class="primary-button" data-mini-next="3">Now practise speaking →</button>
      </section>
      <section id="english-mini-speak" data-mini-panel="3" hidden>
        <p lang="es" data-ui-content>${escape(item.task)}</p>
        <article class="expression-card" data-practice-text="${escape(item.phrase)}" data-practice-lang="${locale}">
          <h3>Your reply</h3><p lang="${locale}" data-ui-content>${escape(item.phrase)}</p><p lang="es" data-ui-content>${escape(item.meaning)}</p>
        </article>
        <button type="button" id="english-mini-finish" class="primary-button">Done practising</button>
      </section>
      <p id="english-mini-status" role="status"></p>
      <p>Device voices provide the model. Available voices depend on your device; recognized-word feedback is not an accent score.</p>`;
    const stage = next => {
      root.cancelDictionaryPractice(host);root.stopSpeechPlayback();englishStage=next;
      content.querySelectorAll('[data-mini-panel]').forEach(el=>{el.hidden=Number(el.dataset.miniPanel)!==next;});
      content.querySelectorAll('[data-mini-step]').forEach(el=>{el.setAttribute('aria-pressed',String(Number(el.dataset.miniStep)===next));});
      content.dataset.stage=String(next);
    };
    content.querySelectorAll('[data-mini-step],[data-mini-next]').forEach(button=>button.addEventListener('click',()=>stage(Number(button.dataset.miniStep||button.dataset.miniNext))));
    content.querySelector('#english-explanation-hear').addEventListener('click',()=>{root.cancelDictionaryPractice(host);root.say(item.explanation,'es-EC');});
    content.querySelector('#english-context-hear').addEventListener('click',()=>{root.cancelDictionaryPractice(host);root.say(item.context,locale);});
    content.querySelector('#english-model-hear').addEventListener('click',()=>{root.cancelDictionaryPractice(host);root.say(item.phrase,locale);});
    content.querySelectorAll('[data-english-chunk]').forEach(button=>button.addEventListener('click',()=>{root.cancelDictionaryPractice(host);root.say(button.dataset.englishChunk,locale);}));
    content.querySelector('#english-lesson-select').addEventListener('change',event=>{
      root.cancelDictionaryPractice(host);leave();selectedEnglish[locale]=event.target.value;renderEnglish(host);
    });
    content.querySelector('#english-mini-finish').addEventListener('click',()=>{
      root.cancelDictionaryPractice(host);root.stopSpeechPlayback();englishStage=1;
      content.querySelector('#english-mini-status').textContent='Practice finished. Repeat this lesson or choose another situation.';
    });
    root.bindDictionaryPractice(host);content.querySelector('.dictionary-practice').open=true;stage(1);
  }
  function render() {
    const host = document.getElementById('recorded-practice');
    if (!host) return;
    leave();
    host.hidden = false;
    host.dataset.learningLanguage = learningLocale;
    host.querySelector(':scope > summary').textContent = learningLocale === 'es-EC' ? 'Native voices · regional speaking pilot' : 'English lessons · listen and speak';
    if (!host.dataset.recordedBound) {
      host.dataset.recordedBound='true';
      host.addEventListener('toggle',()=>{if(!host.open){leave();root.cancelDictionaryPractice(host);}});
    }
    if (learningLocale !== 'es-EC') { renderEnglish(host); return; }
    const item = catalog.items.find(i=>i.id === selected) || catalog.items[0];
    const content = document.getElementById('recorded-practice-content');
    const escape = value => root.escapeHtml(value);
    const meaning = typeof englishVariant !== 'undefined' && englishVariant === 'uk' ? item.uk : item.us;
    content.innerHTML = `
      <label>Regional example<select id="recorded-practice-region" aria-label="Regional native-speaker example">${catalog.items.map(i=>`<option value="${i.id}" ${i.id === item.id?'selected':''}>${escape(i.region)} · ${escape(i.speaker)}</option>`).join('')}</select></label>
      <p>${escape(item.speaker)} · ${escape(item.region)}<br><small>Region as identified by the source. One speaker is an example, not a standard for an entire region.</small></p>
      <article class="expression-card" data-practice-text="${escape(item.spanish)}" data-practice-lang="${item.locale}">
        <h3>Listen, then practise this phrase</h3><p lang="es" data-ui-content>${escape(item.spanish)}</p><p data-ui-content>${escape(meaning)}</p>
        <button type="button" id="recorded-practice-play" class="secondary-button" aria-pressed="false">▶ Play native recording</button>
        <button type="button" id="recorded-spanish-subtitles" class="secondary-button" aria-pressed="${spanishSubtitles}">Spanish subtitles: ${spanishSubtitles?'on':'off'}</button>
        <video id="recorded-practice-video" lang="es" controls playsinline preload="none" hidden aria-label="${escape(item.speaker)} · full original recording"><track kind="subtitles" label="Español (tiempos automáticos)" srclang="es" src="captions/${item.clip}.es.vtt?v=120" default></video>
        <p id="recorded-subtitle-status" class="status">Spanish text from the publisher · automatic timing, pending human review.</p>
        <p id="recorded-practice-status" role="status">Full original example · streams from the university when you tap Play. Internet required; no automatic download.</p>
        <p>${escape(item.cue)}</p>
      </article>
      <details class="compact-info"><summary>Source &amp; assessment limits</summary>
        <p>${escape(catalog.publisher)} · Spanish Proficiency Exercises · ${escape(catalog.license)}.</p>
        <a href="https://www.laits.utexas.edu/spe/vid/${item.clip}.html" target="_blank" rel="noreferrer">Original recording &amp; full transcript</a> · <a href="${catalog.licenseUrl}" target="_blank" rel="license noreferrer">Publisher &amp; license</a>
        <p>Spanish text selected and reproduced with whitespace normalized; English meaning and practice cues added by Habla Ecuador. The original recording is unedited. Text and cues can be available offline; the university recording is streamed.</p>
        <p>Feedback below checks recognized words, not individual sounds, stress or accent. Regional pronunciation scoring and human calibration are not yet implemented. Your practice uses the app's current speech-recognition mode.</p>
      </details>`;
    player = content.querySelector('video');
    const video = player, button = content.querySelector('#recorded-practice-play'), status = content.querySelector('#recorded-practice-status');
    const current = () => player === video && video.isConnected;
    const subtitle = video.querySelector('track'), subtitleButton = content.querySelector('#recorded-spanish-subtitles'), subtitleStatus = content.querySelector('#recorded-subtitle-status');
    const syncSubtitles = () => {
      if (!current()) return;
      spanishSubtitles = subtitle.track.mode === 'showing';
      subtitleButton.setAttribute('aria-pressed',String(spanishSubtitles));
      subtitleButton.textContent = 'Spanish subtitles: '+(spanishSubtitles?'on':'off');
    };
    subtitle.track.mode = spanishSubtitles?'showing':'disabled';
    subtitleButton.addEventListener('click',() => {
      subtitle.track.mode = subtitle.track.mode === 'showing'?'disabled':'showing';
      syncSubtitles();
    });
    video.textTracks.addEventListener?.('change',syncSubtitles);
    subtitle.addEventListener('load',() => {if(current())subtitleStatus.textContent='Spanish subtitles ready · automatically timed from this recording; corrections may be needed.';});
    subtitle.addEventListener('error',() => {if(current())subtitleStatus.textContent='Spanish subtitles could not load. The full Spanish transcript remains available below.';});
    const visible = () => host.open && host.closest('.view')?.classList.contains('active') && !document.hidden;
    const idle = () => {button.setAttribute('aria-pressed','false');button.textContent = '▶ Play native recording';};
    let pending = false;
    button.addEventListener('click',async () => {
      if (pending) return;
      if (!video.paused) {pause();return;}
      root.cancelDictionaryPractice();root.cancelMusicListening();root.stopSpeechPlayback();
      video.hidden = false;
      if (!video.getAttribute('src')) video.src = `https://media.coerll.utexas.edu/spe/mp4/${item.clip}.mp4`;
      const token = ++generation; pending = true;
      button.textContent = 'Loading recording…';status.textContent = 'Loading the full native-speaker example…';
      try {await video.play();if (!current() || token !== generation || !visible()) video.pause();}
      catch (error) {if(error?.name === 'AbortError') return; if(current() && token === generation){idle();status.textContent='Recording could not play. Check your connection or open the original recording below. Your practice text is kept.';}}
      finally {pending = false;}
    });
    video.addEventListener('play',() => {
      if (!current() || !visible()) {video.pause();return;}
      root.cancelDictionaryPractice();root.cancelMusicListening();root.stopSpeechPlayback();
      document.querySelectorAll('audio,video').forEach(other=>{if(other!==video)other.pause();});
      button.setAttribute('aria-pressed','true');button.textContent='Ⅱ Pause native recording';
      status.textContent='Playing the full original example. Listen, pause, then practise the visible phrase.';
    });
    video.addEventListener('pause',()=>{if(current()){idle();status.textContent='Recording paused. Your phrase stays visible; hold the microphone to practise.';}});
    video.addEventListener('ended',()=>{if(current()){idle();status.textContent='Recording finished. Practise the visible phrase or replay the example.';}});
    video.addEventListener('error',()=>{if(current()){generation+=1;idle();status.textContent='Recording unavailable. Open the original recording below or practise the visible text.';}});
    content.querySelector('select').addEventListener('change',event=>{root.cancelDictionaryPractice(host);selected=event.target.value;render();});
    if (root.HablaRecordedTranscripts) root.HablaRecordedTranscripts.bind(content,item);
    root.bindDictionaryPractice(host);
    const practice = content.querySelector('.dictionary-practice');
    practice.open = true;
    practice.querySelector('.dictionary-practice-hear').textContent='🔊 Hear device voice';
  }
  const api = {catalog,englishCatalog,render,setLearningLanguage,pause,leave,isPlaying:()=>Boolean(player && !player.paused),isProtected:()=>Boolean(learningLocale!=='es-EC' && englishStage>1 && document.getElementById('recorded-practice')?.open && document.getElementById('recorded-practice')?.closest('.view')?.classList.contains('active'))};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.HablaRecordedPractice = api;
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
    document.addEventListener('play',event=>{if(event.target !== player)pause();},true);
  }
})(typeof window === 'object' ? window : globalThis);
