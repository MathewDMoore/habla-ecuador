/* Publisher Spanish transcripts: Orlando Kelm / COERLL, University of Texas
 * Spanish Proficiency Exercises. Publisher lists CC BY:
 * https://coerll.utexas.edu/coerll/oer/spanish-proficiency-exercises/
 * Spanish text reproduced with whitespace normalized; no timing invented.
 * English drafts are requested from Habla's existing translation engine.
 */
(function(root) {
  'use strict';
  const items = {
  "beg05d": {
    "text": "Hay cuatro cosas que me encantan… hacer. La una es leer. Me gusta mucho leer poesía o leer novelas. Y paso la mayor parte del tiempo con un libro cuando estoy haciendo la fila en el banco o la fila para comprar algo de comer; siempre tengo un libro conmigo. Pero también me gusta mucho cocinar porque uno de mis sueños es tener más adelante un restaurante de comida criolla ecuatoriana. Y siempre estoy experimentando con la comida y con nuevos ingredientes. También me gusta mucho bailar salsa. Y es algo que lo hago en los fines de semana. Me gusta salir y bailar como… y esto me ayuda a desestresarme y quitarme todo el peso que tengo de los estudios y del trabajo. Y finalmente me gusta hacer manualidades. Mi madre es artesana y por eso yo hago muchas cosas con con las manos. Puedo hacer un poco de cerámica, o de pintura, o de tejer, o de bordado. Y siempre me gusta hacer cosas para adornar la casa o la casa de las personas que quiero. Esas son las cosas que me gustan hacer.",
    "source": "https://www.laits.utexas.edu/spe/vid/beg05d.html",
    "sourceChecked": "2026-10-24",
    "textSha256": "131a3967432aa4cbc8c4f30b3b1b1552f94aa0d3d28430ac964aff44d7a4033d"
  },
  "adv06c": {
    "text": "Bueno, mi familia es boliviana por el lado de mi madre, tengo cinco primos, un tío y una tía, y una abuela. Por el lado de mi padre la familia es mexicana y tengo quince primos, siete tías y tíos, y un abuelo. Mis padres son divorciados y yo vivo con mi madre en Bolivia. Tenemos... ella está vuelta a casar, tengo un padrastro, y con él tengo dos hermanos, o sea, no, mi mamá tiene... está vuelta a casar y el señor tiene un hijo y una hija. Tenemos cinco perros, y somos una familia muy unida. Celebramos la navidad todos juntos y generalmente son como treinta personas cuando se reúnen las dos familias.",
    "source": "https://www.laits.utexas.edu/spe/vid/adv06c.html",
    "sourceChecked": "2026-10-24",
    "textSha256": "4f466b5410dcaec28de0c3a78121fd54944f33fe50c43e5798a4f4602776c04b"
  },
  "beg05a": {
    "text": "Bueno, los fines de semana me gusta dedicarlos a la familia. Después de toda una semana de trabajo y de estudio, es muy poco el tiempo que me queda para dedicarlo a la familia. Así que el fin de semana me gusta ir a algún parque o me gusta ir al cine, o simplemente jugar en el jardín con mis hijos. Y si queda algo de tiempo... bueno ver... algo de televisión, algún partido de futbol. Y si hay oportunidad en las noches, reunirse con los amigos.",
    "source": "https://www.laits.utexas.edu/spe/vid/beg05a.html",
    "sourceChecked": "2026-10-24",
    "textSha256": "0486ec9c07c9f68df2d79ed8c63a8c5f46d42a511cc996d2b2989238ab8e6df0"
  },
  "beg03c": {
    "text": "Este es el amarillo, esto es azul, rojo, verde, blanco, negro aquí adentro. Aquí tenemos un árbol, el tronco es marrón, las manzanas son rojas con puntos blancos. Las hojas son verdes. El cielo por detrás es azul. La vaca es negra con blanco. Tiene una campana amarilla. Hay una..., la grama es verde y hay una cerca roja.",
    "source": "https://www.laits.utexas.edu/spe/vid/beg03c.html",
    "sourceChecked": "2026-10-24",
    "textSha256": "5418b2bdf45b3a5cbbeefb60409f2454c55cfaa07ec35c0e1b5d55e46aa203c4"
  }
};
  const drafts = new Map();
  let cancelActive = null, refreshRoute = () => {}, selectedTarget = null;
  function cancel(message='Translation stopped. Your transcript and draft are kept.') {
    if (cancelActive) cancelActive(message);
  }
  function bind(content,item) {
    cancel();
    const source = items[item.clip];
    if (!source) return;
    const section = document.createElement('details');
    section.id='recorded-transcript';section.className='compact-info recorded-transcript';
    section.innerHTML=`<summary>Spanish transcript &amp; Habla translation</summary>
      <p>Full transcript · not synchronized captions. Exit fullscreen to read both languages here.</p>
      <label>Translate into<select id="recorded-transcript-target"><option value="en-US">U.S. English</option><option value="en-GB">U.K. English</option></select></label>
      <p id="recorded-transcript-route"></p>
      <div class="recorded-transcript-actions"><button type="button" id="recorded-transcript-translate" class="secondary-button">Translate with Habla</button><button type="button" id="recorded-transcript-cancel" class="secondary-button" hidden>Stop translation</button></div>
      <p id="recorded-transcript-status" role="status">Spanish transcript ready. Tap Translate with Habla.</p>
      <div class="recorded-transcript-pair">
        <label>Spanish · publisher transcript<textarea id="recorded-transcript-source" lang="es" rows="7" wrap="soft" readonly></textarea></label>
        <label id="recorded-transcript-output-label">English · editable Habla draft<textarea id="recorded-transcript-output" lang="en" rows="7" wrap="soft" placeholder="Your Habla translation will appear here."></textarea></label>
      </div>
      <p>Editable machine draft · review before relying on it. Edits last until this page closes or reloads.</p><details class="compact-info"><summary>Transcript source &amp; privacy</summary><p>Spanish: Orlando Kelm / COERLL / The University of Texas at Austin · CC BY. Whitespace normalized. This control sends no video or microphone audio. Public transcript text is translated only after your tap, using the selected mode.</p></details>`;
    content.querySelector('#recorded-practice-status').after(section);
    const get=id=>section.querySelector('#recorded-transcript-'+id);
    const target=get('target'), output=get('output'), status=get('status'), button=get('translate'), stop=get('cancel');
    get('source').value=source.text;
    const settings = () => root.recordedTranscriptRoute();
    target.value=selectedTarget || settings().target;
    let serial=0, pending=false;
    const key=()=>JSON.stringify([item.clip,target.value,settings().onDevice]);
    const showRoute=()=>{
      const onDevice=settings().onDevice;
      get('route').textContent=onDevice
        ? 'On-device translation selected · uses your existing downloaded pack. No online fallback.'
        : 'Online · public transcript text goes to MyMemory only when you tap Translate.';
      output.lang=target.value;
      output.setAttribute('aria-label',(target.value==='en-GB'?'U.K.':'U.S.')+' English · editable Habla transcript translation');
    };
    const remember=()=>{drafts.set(key(),output.value);};
    const idle=()=>{pending=false;button.disabled=false;stop.hidden=true;button.textContent=output.value?'Translate again with Habla':'Translate with Habla';};
    const restore=()=>{output.value=drafts.get(key())||'';showRoute();idle();status.textContent=output.value?'Previous draft restored for this example and English choice. Your edits are kept.':'Spanish transcript ready. Tap Translate with Habla.';};
    restore();
    refreshRoute=()=>{if(section.isConnected){cancel('Translation mode changed. Your previous draft is kept; translate again for this mode.');restore();}};
    target.addEventListener('change',()=>{selectedTarget=target.value;cancel('English choice changed. Your previous draft is kept.');restore();});
    output.addEventListener('input',()=>{remember();if(pending)cancel('Your edit is kept. Translation stopped so it cannot overwrite your typing.');});
    stop.addEventListener('click',()=>cancel('Translation stopped. A request already sent may finish; your transcript and draft are kept.'));
    section.addEventListener('toggle',()=>{if(section.isConnected&&!section.open)cancel();});
    button.addEventListener('click',async()=>{
      if(pending)return;
      showRoute();
      const route={source:item.locale,target:target.value,onDevice:settings().onDevice}, requestKey=key(), token=++serial;
      const same=()=>token===serial&&section.isConnected;
      const current=()=>same()&&route.target===target.value&&route.onDevice===settings().onDevice;
      const cancelRequest=message=>{serial+=1;idle();status.textContent=message;if(cancelActive===cancelRequest)cancelActive=null;};
      cancelActive=cancelRequest;pending=true;button.disabled=true;button.textContent='Translating transcript…';stop.hidden=false;
      status.textContent='Translating the full Spanish transcript into '+(route.target==='en-GB'?'U.K.':'U.S.')+' English…';
      try {
        const result=await root.requestGeneralTranslation(source.text,'ec-en',{
          purpose:'everyday',source:route.source,target:route.target,onDevice:route.onDevice,isCurrent:current,inputType:'transcript'
        });
        if(!current()) {if(same())status.textContent='Translation mode changed. Your previous draft is kept; translate again.';return;}
        if(typeof result!=='string'||!result.trim())throw root.translationFailure('service');
        output.value=result;drafts.set(requestKey,result);
        status.textContent='Full transcript translated · '+(route.target==='en-GB'?'U.K.':'U.S.')+' English · '+(route.onDevice?'on device':'online')+'. Editable draft; not timed captions.';
      } catch(error) {
        if(!same())return;
        if(!current()){status.textContent='Translation mode changed. Your previous draft is kept; translate again.';return;}
        const message=root.translationErrorMessage(error);
        status.textContent=message.title+' '+message.help+' The transcript and any previous draft are kept.';
      } finally {
        if(same()){idle();if(cancelActive===cancelRequest)cancelActive=null;}
      }
    });
  }
  const api={items,bind,cancel};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else {
    root.HablaRecordedTranscripts=api;
    document.addEventListener('change',event=>{if(event.target?.id==='offline-use')refreshRoute();});
    for(const event of ['online','offline'])root.addEventListener(event,()=>refreshRoute());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
  }
})(typeof window==='object'?window:globalThis);
