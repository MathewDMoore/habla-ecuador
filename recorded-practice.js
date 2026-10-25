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
  // Curated short lessons, with an independent Spanish study guide.
  // Publisher video lengths and embed availability checked 2026-10-25.
  const englishCatalog = {
    'en-US': [
      {id:'us-clarify',title:'Pedir que te repitan',publisher:'Inglés con el Güero',videoId:'tvK67-n34C8',seconds:54,
       phrase:"I didn't catch that.",meaning:'No alcancé a entender lo que dijiste.',
       guide:'Si no entendiste lo que alguien dijo, puedes pedir que lo repita. “I didn’t catch that” se refiere a no haber captado el mensaje; no es atrapar algo con las manos.',
       task:'Escucha la explicación en español y el modelo en inglés. Después pausa y practica la frase de abajo.'},
      {id:'us-polite-request',title:'Pedir ayuda con cortesía',publisher:'Inglés con el Güero',videoId:'sXOmujeV3LI',seconds:56,
       phrase:'I was wondering if you could help me.',meaning:'Quería saber si me podrías ayudar.',
       guide:'“I was wondering if…” permite suavizar una petición. Aunque empieza en pasado, aquí puede introducir algo que quieres pedir ahora.',
       task:'Escucha cómo empieza la petición. Después practica la frase completa, sin traducir cada palabra por separado.'}
    ],
    'en-GB': [
      {id:'uk-repeat',title:'Pedir que repitan algo',publisher:'Amigos Ingleses · Phillip e Isabel',videoId:'aDZPOgdF_8Y',seconds:44,
       phrase:'Could you repeat that, please?',meaning:'¿Podrías repetir eso, por favor?',
       guide:'Para pedir que repitan lo que dijeron, usa “repeat that” o “say that again”. No traduzcas literalmente “¿me repites?” como “repeat me”.',
       task:'Mira la corrección en el video. Después practica esta petición cortés relacionada con el mismo tema.'},
      {id:'uk-hungry',title:'Decir que tienes hambre',publisher:'Amigos Ingleses · Phillip e Isabel',videoId:'T0be2na0mOM',seconds:27,
       phrase:"I'm hungry.",meaning:'Tengo hambre.',
       guide:'En español dices “tengo hambre”; en inglés usas “I am hungry”. “I’m” es la forma corta y cotidiana de “I am”.',
       task:'Escucha el ejemplo corto. Después di “I’m hungry” y fíjate en la diferencia entre “hungry” y “angry” (enojado).'}
    ]
  };
  let learningLocale = 'es-EC', embeddedPlayer = null;
  const selectedEnglish = {};
  let selected = catalog.items[0].id, player = null, generation = 0, spanishSubtitles = true;
  function pause() {
    generation += 1;
    if (player) player.pause();
    if (embeddedPlayer) {
      embeddedPlayer.remove(); embeddedPlayer = null;
      const button = document.getElementById('english-video-play');
      if (button) { button.textContent = '▶ Play English video'; button.setAttribute('aria-pressed','false'); }
    }
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
    selectedEnglish[locale]=item.id;
    const content=document.getElementById('recorded-practice-content'), escape=value=>root.escapeHtml(value);
    const native=typeof root.__hablaNativeSpeech === 'function';
    const source='https://www.youtube.com/watch?v='+item.videoId;
    player=null;
    content.innerHTML=`
      <label>Choose a short lesson<select id="english-video-select">${items.map(i=>`<option value="${i.id}" ${i.id===item.id?'selected':''}>${escape(i.title)} · ${i.seconds} s</option>`).join('')}</select></label>
      <h3 data-ui-content>${escape(item.title)}</h3>
      <p id="english-video-duration">${item.seconds} s · <span>Short video + Spanish study guide</span></p>
      <details id="english-video-guide" class="compact-info" open><summary>Before watching · Spanish guide</summary><p lang="es" data-ui-content>${escape(item.guide)}</p></details>
      ${native?`<a id="english-video-play" class="secondary-button" href="${source}" target="_blank" rel="noreferrer">▶ Watch short video</a>`:`<button type="button" id="english-video-play" class="secondary-button" aria-pressed="false">▶ Play English video</button>`}
      <div id="english-video-player" class="short-video-player"></div>
      <p id="english-video-status" role="status">${native?'The video opens in your browser. Return here for speaking practice.':'Video loads only when you tap Play. Internet required.'}</p>
      <article class="expression-card" data-practice-text="${escape(item.phrase)}" data-practice-lang="${locale}">
        <h3>Your turn · say it aloud</h3><p lang="${locale}" data-ui-content>${escape(item.phrase)}</p><p lang="es" data-ui-content>${escape(item.meaning)}</p><p lang="es" data-ui-content>${escape(item.task)}</p>
      </article>
      <p data-ui-content>${escape(item.publisher)}</p>
      <p>Habla's study guide and speaking prompt are separate from the creator's video. These phrases are useful in both English varieties; the selected variety controls the device voice and microphone.</p>
      <a href="${source}" target="_blank" rel="noreferrer">Original English video &amp; learning resources</a>`;
    const container=content.querySelector('#english-video-player'), button=content.querySelector('#english-video-play'), status=content.querySelector('#english-video-status');
    const visible=()=>button.isConnected && locale===learningLocale && host.open && host.closest('.view')?.classList.contains('active') && !document.hidden;
    button.addEventListener('click',()=>{
      if(!visible())return;
      if(embeddedPlayer){pause();return;}
      root.cancelListening(false);root.cancelDictionaryPractice();root.cancelMusicListening();root.stopSpeechPlayback();
      document.querySelectorAll('audio,video').forEach(other=>other.pause());
      if(native)return; // The signed companion opens external links; do not create a blocked subframe.
      const iframe=document.createElement('iframe');iframe.title=item.title;
      iframe.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      iframe.src='https://www.youtube.com/embed/'+item.videoId+'?rel=0&playsinline=1&cc_load_policy=1&autoplay=1';
      container.append(iframe);embeddedPlayer=iframe;
      button.textContent='■ Stop English video';button.setAttribute('aria-pressed','true');
      status.textContent='Watch the short video, stop playback, then practise below. If it cannot play, open the original video link.';
    });
    content.querySelector('#english-video-select').addEventListener('change',event=>{
      root.cancelDictionaryPractice(host);root.stopSpeechPlayback();leave();selectedEnglish[locale]=event.target.value;renderEnglish(host);
    });
    root.bindDictionaryPractice(host);
    content.querySelector('.dictionary-practice').open=true;
  }
  function render() {
    const host = document.getElementById('recorded-practice');
    if (!host) return;
    leave();
    host.hidden = false;
    host.dataset.learningLanguage = learningLocale;
    host.querySelector(':scope > summary').textContent = learningLocale === 'es-EC' ? 'Native voices · regional speaking pilot' : 'English video lessons';
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
  const api = {catalog,englishCatalog,render,setLearningLanguage,pause,leave,isPlaying:()=>Boolean(embeddedPlayer || (player && !player.paused))};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.HablaRecordedPractice = api;
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
    document.addEventListener('play',event=>{if(event.target !== player)pause();},true);
  }
})(typeof window === 'object' ? window : globalThis);
