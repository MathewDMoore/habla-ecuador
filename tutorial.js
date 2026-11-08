/* Habla Ecuador guided bilingual help. Original content, runs without network. */
(function(root){
"use strict";
// New one-time onboarding rollout. People who dismissed the former invitation
// will see the real guided tour once after updating; future visits respect Close.
const KEY="habla-tutorial-seen-v2";
const STEPS=[
 {view:"home-view",target:"#home-title",symbol:"🇪🇨",en:"Welcome to Habla Ecuador",es:"Bienvenido a Habla Ecuador",
  body:"Learn Ecuadorian Spanish and English through translation, listening, speaking and everyday expressions.",
  esp:"Aprende español ecuatoriano e inglés mediante traducciones, ejercicios de escucha, práctica oral y expresiones cotidianas."},
 {view:"translator-view",target:".language-picker-row",symbol:"🌐",en:"Choose your languages",es:"Elige tus idiomas",
  body:"Choose the language you speak or write under From and the translation language under To. Tap the arrows to switch.",
  esp:"Elige en De el idioma que hablas o escribes y en A el idioma al que quieres traducir. Toca las flechas para intercambiarlos."},
 {view:"translator-view",target:"#translator-input",groupTarget:".input-card",symbol:"✍️",en:"Translate words and phrases",es:"Traduce palabras y frases",
  body:"Type, paste or dictate a word, phrase or sentence. Review the translation, then use Copy or Share. Context changes meaning.",
  esp:"Escribe, pega o dicta una palabra, frase u oración. Revisa la traducción y usa Copiar o Compartir. El contexto cambia el significado."},
 {view:"translator-view",target:"#input-mic",symbol:"🎙️",en:"Speak and check what was heard",es:"Habla y comprueba lo que se escuchó",
  body:"Tap the microphone to speak. Tap again to finish. Check the recognized words. If recognition fails, retry or use the keyboard microphone.",
  esp:"Toca el micrófono para hablar y vuelve a tocarlo para terminar. Comprueba las palabras reconocidas. Si falla, vuelve a intentarlo o usa el micrófono del teclado."},
 {view:"dictionary-view",target:"#regional-slang-search",symbol:"📖",en:"Explore regional meanings",es:"Explora significados regionales",
  body:"Find words, examples and expressions. Compare Ecuador with Bolivia, Mexico and other countries. Always check context.",
  esp:"Encuentra palabras, ejemplos y expresiones. Compara Ecuador con Bolivia, México y otros países. Comprueba siempre el contexto."},
 {view:"lesson-view",target:"#lesson-language",symbol:"🗣️",en:"Practice speaking and listening",es:"Practica la expresión oral y la escucha",
  body:"Choose the language you want to learn, then try short listening and speaking activities. Review what the phone understood.",
  esp:"Elige el idioma que quieres aprender y prueba actividades breves de escucha y conversación. Revisa lo que entendió el teléfono."},
 {view:"lesson-view",target:"#quick-lessons",symbol:"📚",en:"Open a short lesson",es:"Abre una lección corta",
  body:"Open Short lessons to learn one useful idea at a time. Choose a topic, listen to the example, and try the exercise.",
  esp:"Abre Lecciones cortas para aprender una idea útil a la vez. Elige un tema, escucha el ejemplo y prueba el ejercicio."},
 {view:"lesson-view",target:"#lesson-title",symbol:"🎯",en:"Listen, respond, and review",es:"Escucha, responde y revisa",
  body:"Follow each activity's instructions. Listen, select or speak your response, and review the feedback. Retry when you need more practice.",
  esp:"Sigue las instrucciones de cada actividad. Escucha, selecciona o di tu respuesta y revisa los comentarios. Vuelve a intentarlo cuando necesites más práctica."},
 {view:"music-view",target:"#music-song-lesson h2",symbol:"🎶",fullOnly:true,en:"Learn through music",es:"Aprende con música",
  body:"Explore Music for listening, pronunciation, rhythm and culture. Available recordings and translation options may vary.",
  esp:"Explora Música para practicar la escucha, la pronunciación, el ritmo y la cultura. Las grabaciones y opciones de traducción pueden variar."},
 {view:null,target:".feedback-open",symbol:"💬",en:"Help improve Habla Ecuador",es:"Ayúdanos a mejorar Habla Ecuador",
  body:"Find an incorrect translation or regional expression? Tap the speech bubble to suggest a correction. Nothing is sent automatically.",
  esp:"¿Encontraste una traducción o expresión regional incorrecta? Toca el globo de diálogo para sugerir una corrección. Nada se envía automáticamente."}
];
const HOME_SCREEN_STEPS=[
 {view:"home-view",target:"#home-title",symbol:"🇪🇨",en:"Keep Habla on your Home Screen",es:"Lleva Habla a tu pantalla de inicio",art:"icon",
 body:"On iPhone, open this link in Safari. Tap Share, then Add to Home Screen (you may need to scroll or tap More). Confirm the name and tap Add. Look for our mountain, sun and pink flower. If this link opened inside WhatsApp, first choose Open in Safari. On Android, use your browser menu and choose Install app or Add to Home screen.",
 esp:"En iPhone, abre este enlace en Safari. Toca Compartir y luego Agregar a pantalla de inicio (quizá debas desplazarte o tocar Más). Confirma el nombre y toca Agregar. Busca nuestra montaña, sol y flor rosada. Si abriste el enlace en WhatsApp, elige primero Abrir en Safari. En Android, usa el menú del navegador y elige Instalar aplicación o Agregar a pantalla de inicio."},
 {view:"home-view",target:"#home-title",symbol:"🧩",en:"Add the iPhone widget",es:"Agrega el widget del iPhone",art:"widget",
 body:"With the native Habla Ecuador iPhone app installed, open it once. Hold an empty area of your Home Screen, tap Edit → Add Widget, and search Habla Ecuador. Choose small or medium, then Add Widget → Done. The medium widget opens Translate, Practice, Dictionary and Tutorial. This link includes the guide and artwork; adding the website icon does not install the native widget. If Habla is missing from the widget list, the native app must be installed first. A public native-app install link is not available yet.",
 esp:"Con la aplicación nativa Habla Ecuador instalada en tu iPhone, ábrela una vez. Mantén pulsada una zona vacía de la pantalla de inicio, toca Editar → Agregar widget y busca Habla Ecuador. Elige pequeño o mediano y toca Agregar widget → Listo. El widget mediano abre Traducir, Practicar, Diccionario y Tutorial. Este enlace incluye la guía y el diseño; agregar el icono del sitio web no instala el widget nativo. Si Habla no aparece en la lista de widgets, primero debes instalar la aplicación nativa. Todavía no hay un enlace público para instalarla."}
];
// Each guide stays beside its feature and opens only the question the learner chooses.
const FEATURE_GUIDES={
 translate:[
  ["Translate guide","Guía de traducción"],
  [["How do I translate or reverse a phrase?","¿Cómo traduzco una frase o invierto los idiomas?"],
   ["Choose From and To. Select Ecuadorian Spanish or the English variety you want.","Elige De y A. Selecciona español ecuatoriano o la variedad de inglés que quieras."],
   ["Type or paste your phrase. Check the original and the translation together.","Escribe o pega tu frase. Revisa el original junto con la traducción."],
   ["Tap the arrows to swap the languages. Tap again to return to the original direction.","Toca las flechas para intercambiar los idiomas. Tócalas otra vez para volver a la dirección original."]],
  [["How do I dictate or share a translation?","¿Cómo dicto o comparto una traducción?"],
   ["Tap the microphone, speak, then tap again to finish. Check what Habla heard and correct any missing words.","Toca el micrófono, habla y tócalo otra vez para terminar. Revisa lo que entendió Habla y corrige las palabras que falten."],
   ["Use Copy for the translation, or open Copy / share text to choose the original, the translation or both.","Usa Copiar para la traducción, o abre Copiar / compartir texto para elegir el original, la traducción o ambos."]]
 ],
 research:[
  ["Research guide","Guía de investigación"],
  [["How do I import a PDF or Word paper?","¿Cómo importo un artículo en PDF o Word?"],
   ["Set From to the paper’s language and To to the variety you want, such as U.S. or U.K. English.","En De, selecciona el idioma del artículo. En A, elige la variedad que quieras, como inglés estadounidense o británico."],
   ["Tap Choose paper · PDF / Word / text. Select the file in Files and check the extracted text.","Toca Elegir artículo · PDF / Word / texto. Selecciona el archivo en Archivos y revisa el texto extraído."]],
  [["How do I save the paper or reopen it?","¿Cómo guardo o vuelvo a abrir el artículo?"],
   ["After importing, tap Save document for later. This saves the extracted text on your device without starting translation.","Después de importarlo, toca Guardar documento para después. El texto extraído se guarda en tu dispositivo sin iniciar la traducción."],
   ["To reopen it, go to Saved papers & progress, choose it under Saved document progress, then tap Open saved document.","Para volver a abrirlo, ve a Artículos guardados y progreso, elígelo en Progreso de documentos guardados y toca Abrir documento guardado."],
   ["Use Open Habla paper backup (.json) for a Habla backup that already contains the original and both English drafts.","Usa Abrir copia de Habla (.json) para una copia que ya contiene el original y ambos borradores en inglés."]],
  [["How do I translate and export the whole paper?","¿Cómo traduzco y exporto el artículo completo?"],
   ["Tap Translate entire document. You can pause and reopen your saved progress to continue later.","Toca Traducir documento completo. Puedes pausar y volver a abrir el progreso guardado para continuar después."],
   ["When it finishes, review the combined draft and any flagged PDF pages. Tap Share translated paper for a text attachment, or Print / Save as PDF to make a PDF.","Al terminar, revisa el borrador completo y las páginas señaladas del PDF. Toca Compartir documento traducido para adjuntar un archivo de texto, o Imprimir / Guardar como PDF para crear un PDF."]]
 ],
 music:[
  ["Music listening guide","Guía para escuchar música"],
  [["How do I capture words from a song?","¿Cómo capto las palabras de una canción?"],
   ["In Music playback, choose where the song is playing. On iPhone, look under Listening options & help if the controls are collapsed.","En Reproducción de música, elige dónde suena la canción. En iPhone, busca en Opciones y ayuda de escucha si los controles están cerrados."],
   ["Set From to the song’s language. Try Short passage first, then tap Listen to music. Tap Stop listening when you have a sample.","En De, elige el idioma de la canción. Prueba primero con Fragmento corto, toca Escuchar música y luego toca Detener escucha cuando tengas una muestra."]],
  [["How do I review or translate the words?","¿Cómo reviso o traduzco las palabras?"],
   ["Open Review captured passages. Compare the heard words with the song and correct the passage before translating it.","Abre Revisar fragmentos captados. Compara las palabras reconocidas con la canción y corrige el fragmento antes de traducirlo."],
   ["Use Translate captured words for the collected text. If little comes through, try a clearer section or use a screenshot with visible lyrics.","Usa Traducir palabras captadas para el texto recopilado. Si se reconocen pocas palabras, prueba un fragmento más claro o usa una captura con la letra visible."]]
 ],
 musicLessons:[
  ["Music lessons guide","Guía de lecciones con música"],
  [["How do I follow the English captions?","¿Cómo sigo los subtítulos en inglés?"],
   ["Open a captioned lesson, then choose Watch with English captions to keep Habla’s captions with the video.","Abre una lección con subtítulos y elige Ver con subtítulos en inglés para ver los subtítulos de Habla junto al video."],
   ["Pause on one line, compare it with the Spanish where available, and replay it before saying it aloud.","Pausa en una línea, compárala con el español si está disponible y vuelve a escucharla antes de repetirla en voz alta."]],
  [["Where do I listen to my own song?","¿Dónde puedo escuchar mi propia canción?"],
   ["Find Listen to music in Music on the iPhone app or under Translate on the web.","Busca Escuchar música en Música dentro de la app para iPhone o en Traducir en la web."],
   ["Open Music listening guide beside that button for audio setup, capture and review steps.","Abre la Guía para escuchar música junto a ese botón para ver cómo configurar el audio, captar palabras y revisarlas."]]
 ],
 conversation:[
  ["Conversation guide","Guía de conversación"],
  [["How do I set up two speakers?","¿Cómo configuro a dos personas?"],
   ["Under Who is speaking?, pick or enter each person’s name, then select each person’s spoken language and region.","En ¿Quién habla?, elige o escribe el nombre de cada persona y selecciona su idioma y región."],
   ["Choose whether Habla should read each translation aloud or display it in Text only mode.","Elige si Habla debe leer cada traducción en voz alta o mostrarla en modo Solo texto."]],
  [["How do we take turns or type a message?","¿Cómo tomamos turnos o escribimos un mensaje?"],
   ["Tap the current speaker’s microphone, say one short turn, and tap again to finish. Check what Habla heard before switching speakers.","Toca el micrófono de la persona que habla, di una frase breve y tócalo otra vez para terminar. Revisa lo que entendió Habla antes de cambiar de persona."],
   ["For a typed turn, open Write a turn. Choose the speaker and language, write the message and tap Translate turn.","Para escribir, abre Escribir un turno. Elige la persona y el idioma, escribe el mensaje y toca Traducir turno."]]
 ],
 dictionary:[
  ["Dictionary guide","Guía del diccionario"],
  [["How do I find a regional expression?","¿Cómo encuentro una expresión regional?"],
   ["Search for a Spanish term, English meaning or city. Start with Ecuador or choose another region for comparison.","Busca un término en español, un significado en inglés o una ciudad. Empieza con Ecuador o elige otra región para comparar."],
   ["Use Category, Usage type and Tone to narrow the results. If a word seems missing, clear a filter and search again.","Usa Categoría, Tipo de uso y Tono para acotar los resultados. Si no encuentras una palabra, quita un filtro y vuelve a buscar."]],
  [["How do I know where or when to use a word?","¿Cómo sé dónde o cuándo usar una palabra?"],
   ["Read the example and the tone label. Open Context & sources to see where that meaning is documented.","Lee el ejemplo y la indicación de tono. Abre Contexto y fuentes para ver dónde está documentado ese significado."],
   ["Use the audio controls to hear the term or example. Compare the U.S. and U.K. English meanings when both are shown.","Usa los controles de audio para escuchar el término o el ejemplo. Compara los significados en inglés estadounidense y británico cuando aparezcan los dos."]]
 ],
 practice:[
  ["Practice questions","Preguntas sobre la práctica"],
  [["How do I start a short lesson?","¿Cómo empiezo una lección corta?"],
   ["Use I want to learn to select Ecuadorian Spanish, U.S. English or U.K. English.","En Quiero aprender, elige español ecuatoriano, inglés estadounidense o inglés británico."],
   ["Open Short lessons, pick a topic, and listen to the example before answering.","Abre Lecciones cortas, elige un tema y escucha el ejemplo antes de responder."]],
  [["How do I use speaking feedback?","¿Cómo aprovecho los comentarios de práctica oral?"],
   ["Play the example first. Record a short attempt, finish it, then check which words Habla heard.","Primero escucha el ejemplo. Graba un intento breve, termínalo y comprueba qué palabras reconoció Habla."],
   ["Repeat the part you missed, then try the full phrase again. A recognized-word score tells you about the words detected.","Repite la parte que faltó y luego intenta la frase completa. La puntuación de coincidencia indica qué palabras se detectaron."]]
 ]
};
function mountFeatureGuides(){
 const localized=[];
 const write=(element,text)=>localized.push([element,text]);
 document.querySelectorAll("[data-feature-guide]").forEach((guide,index)=>{
  const feature=FEATURE_GUIDES[guide.dataset.featureGuide];
  if(!feature)return;
  const [title,...topics]=feature;
  write(guide.querySelector("summary"),title);
  for(const [question,...steps] of topics){
   const topic=document.createElement("details");
   topic.className="feature-guide-topic";
   topic.setAttribute("name","habla-feature-guide-"+index);
   const heading=document.createElement("summary");
   write(heading,question);
   const list=document.createElement("ol");
   for(const step of steps){
    const item=document.createElement("li");
    write(item,step);
    list.append(item);
   }
   topic.append(heading,list);
   guide.append(topic);
  }
 });
 const renderLanguage=language=>{
  const index=language==="es"?1:0;
  for(const [element,text] of localized)element.textContent=text[index];
 };
 renderLanguage(root.HablaUI?.language);
 document.addEventListener("habla-ui-language-change",event=>renderLanguage(event.detail.language));
}
const $=s=>document.querySelector(s);
function targetFor(step){const target=$(step.target);return step.groupTarget?target?.closest(step.groupTarget)||target:target;}
let currentMode="full";
let steps=[],index=0,active=false,previousView="home-view",navigate=null,trigger=null,overlay=null,panel=null,bound=false,layoutFrame=0,spotFrame=0,observer=null;
function seen(){try{return localStorage.getItem(KEY)==="1";}catch{return false;}}
function remember(){try{localStorage.setItem(KEY,"1");}catch{}}
function button(text,id){const b=document.createElement("button");b.type="button";b.textContent=text;b.id=id;return b;}
function make(){
 if(overlay)return;
 overlay=document.createElement("div");overlay.id="tutorial-overlay";overlay.hidden=true;overlay.setAttribute("translate","no");
 for(const edge of ["top","left","right","bottom"]){
  const shade=document.createElement("div");shade.className="tutorial-shade";shade.dataset.edge=edge;overlay.append(shade);
 }
 const spot=document.createElement("div");spot.id="tutorial-spotlight";spot.setAttribute("aria-hidden","true");overlay.append(spot);
 panel=document.createElement("section");panel.className="tutorial-panel";panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");
 panel.setAttribute("aria-labelledby","tutorial-title");panel.setAttribute("aria-describedby","tutorial-english tutorial-spanish");
 panel.tabIndex=-1;
 const top=document.createElement("div");top.className="tutorial-panel-top";
 const progress=document.createElement("span");progress.id="tutorial-progress";
 const close=button("Close / Cerrar","tutorial-close");close.setAttribute("aria-label","Close tutorial / Cerrar tutorial");close.addEventListener("click",finish);
 top.append(progress,close);
 const symbol=document.createElement("div");symbol.id="tutorial-symbol";symbol.setAttribute("aria-hidden","true");
 const title=document.createElement("h2");title.id="tutorial-title";
 const english=document.createElement("p");english.id="tutorial-english";
 const divider=document.createElement("div");divider.className="tutorial-divider";
 const spanishTitle=document.createElement("h3");spanishTitle.id="tutorial-title-es";spanishTitle.lang="es";
 const spanish=document.createElement("p");spanish.id="tutorial-spanish";spanish.lang="es";
 const note=document.createElement("p");note.className="tutorial-step-note";
 note.textContent="Follow the highlighted part of the app. / Sigue la parte resaltada de la app.";
 const controls=document.createElement("div");controls.className="tutorial-controls";
 const skip=button("Skip / Omitir","tutorial-skip"),back=button("Back / Atrás","tutorial-back"),next=button("Next / Siguiente","tutorial-next");
 skip.addEventListener("click",finish);back.addEventListener("click",()=>move(-1));
 next.addEventListener("click",()=>index===steps.length-1?finish():move(1));
 controls.append(skip,back,next);
 const content=document.createElement("div");content.className="tutorial-content";content.tabIndex=0;
 const preview=document.createElement("figure");preview.id="home-screen-preview";preview.hidden=true;
 preview.innerHTML='<div class="home-brand-preview"><img src="app-icon-192.png?brand=20261031" width="72" height="72" alt="Habla Ecuador: mountain, sun and pink flower"><div><strong>Habla Ecuador 🇪🇨</strong><p>¿Cómo estás?<br>How are you?</p></div><div class="home-widget-shortcuts" aria-hidden="true">Translate · Traducir<br>Practice · Practicar<br>Dictionary · Diccionario<br>Tutorial</div></div><figcaption></figcaption>';
 content.append(symbol,title,preview,english,divider,spanishTitle,spanish,note);
 panel.append(top,content,controls);
 overlay.append(panel);document.body.append(overlay);
}
function go(view){if(view&&!$("#"+view)?.classList.contains("active"))navigate?.(view);}
// Fixed elements use the layout viewport; Safari's bars and zoom change the
// smaller visual viewport. Keep all overlay coordinates in that visible area.
function viewport(){
 const v=window.visualViewport;
 return {left:v?.offsetLeft||0,top:v?.offsetTop||0,width:v?.width||window.innerWidth,height:v?.height||window.innerHeight};
}
function placeViewport(){
 const v=viewport();
 Object.assign(overlay.style,{left:v.left+"px",top:v.top+"px",width:v.width+"px",height:v.height+"px"});
 return v;
}
function spotlight(){
 if(!active||!overlay)return;
 const v=placeViewport(),origin=overlay.getBoundingClientRect();
 const element=targetFor(steps[index]),frame=$("#tutorial-spotlight");
 const panelTop=panel.getBoundingClientRect().top-origin.top-10;
 const r=element&&element.getClientRects().length?element.getBoundingClientRect():null;
 // Intersect edges, rather than moving the top while retaining the old height.
 // The latter drew an empty frame above an offscreen microphone on iPhone.
 const x=r?Math.max(5,r.left-origin.left-5):0,y=r?Math.max(5,r.top-origin.top-5):0;
 const right=r?Math.min(v.width-5,r.right-origin.left+5):0;
 const bottom=r?Math.min(panelTop,r.bottom-origin.top+5):0;
 const w=Math.max(0,right-x),h=Math.max(0,bottom-y),valid=w>0&&h>0;
 frame.style.display=valid?"block":"none";
 if(valid)Object.assign(frame.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px"});
 const regions=valid?{
  top:[0,0,v.width,y],left:[0,y,x,h],
  right:[x+w,y,Math.max(0,v.width-x-w),h],
  bottom:[0,y+h,v.width,Math.max(0,v.height-y-h)]
 }:{top:[0,0,v.width,v.height],left:[0,0,0,0],right:[0,0,0,0],bottom:[0,0,0,0]};
 for(const shade of overlay.querySelectorAll(".tutorial-shade")){
  const [left,top,width,height]=regions[shade.dataset.edge];
  Object.assign(shade.style,{left:left+"px",top:top+"px",width:width+"px",height:height+"px"});
 }
}
function layout(){
 layoutFrame=0;if(!active)return;
 const v=placeViewport(),el=targetFor(steps[index]);
 panel.dataset.compact=String(v.width<300);
 // A tall input card gets more room; the instructions scroll between controls
 // that remain visible. Never shrink the actual user's input to fit the tour.
 const height=el?.getBoundingClientRect().height||0;
 const bottomGap=v.height-(panel.getBoundingClientRect().bottom-overlay.getBoundingClientRect().top);
 // Reserve a readable instruction area after measuring wrapped controls.
 panel.style.maxHeight=(v.height-24)+"px";
 const chrome=panel.querySelector(".tutorial-panel-top").offsetHeight+panel.querySelector(".tutorial-controls").offsetHeight+32;
 panel.style.maxHeight=Math.min(v.height-24,Math.max(chrome+(v.width<300?240:140),Math.min(v.height*.56,v.height-height-bottomGap-26)))+"px";
 if(el&&el.getClientRects().length){
  const rect=el.getBoundingClientRect(),origin=overlay.getBoundingClientRect();
  const available=panel.getBoundingClientRect().top-origin.top-12;
  const inset=Math.max(10,Math.min(80,available-rect.height-5));
  const top=rect.top-origin.top;
  if(top<inset||top+rect.height>available)
   window.scrollTo({top:Math.max(0,window.scrollY+top-inset),behavior:"instant"});
 }
 spotlight();
}
function scheduleLayout(){if(active&&!layoutFrame)layoutFrame=requestAnimationFrame(layout);}
function trackSpotlight(){if(active){spotlight();spotFrame=requestAnimationFrame(trackSpotlight);}}
function render(){
 if(!active)return;
 const step=steps[index];go(step.view);
 const preview=$("#home-screen-preview");preview.hidden=!step.art;
 preview.dataset.art=step.art||"";
 preview.querySelector("figcaption").textContent=step.art==="widget" ? "Widget preview · Vista previa del widget" : "Our Home Screen icon · Nuestro icono de inicio";
 $("#tutorial-progress").textContent=(index+1)+" / "+steps.length;
 $("#tutorial-symbol").textContent=step.symbol;
 $("#tutorial-title").textContent=step.en;$("#tutorial-english").textContent=step.body;
 $("#tutorial-title-es").textContent=step.es;$("#tutorial-spanish").textContent=step.esp;
 $("#tutorial-back").disabled=index===0;
 $("#tutorial-next").textContent=index===steps.length-1?"Finish / Terminar":"Next / Siguiente";
 panel.querySelector(".tutorial-content").scrollTop=0;
 // Keep focus on a permanently visible control; it must not scroll the card.
 $("#tutorial-next").focus({preventScroll:true});
 if(observer){observer.disconnect();observer.observe(panel);const el=targetFor(step);if(el)observer.observe(el);}
 scheduleLayout();
}
function move(n){if(active){index=Math.max(0,Math.min(steps.length-1,index+n));render();}}
function open(opener,mode="full"){
 if(active)return;
 make();
 currentMode=mode;
 steps=mode==="home-screen" ? HOME_SCREEN_STEPS : mode==="lessons"
  ? STEPS.filter(s=>s.view==="lesson-view")
  : STEPS.filter(s=>!s.fullOnly||Boolean($("#music-view")));
 index=0;active=true;
 trigger=opener&&opener.isConnected?opener:document.activeElement;
 previousView=$(".view.active")?.id||"home-view";
 placeViewport();overlay.hidden=false;document.documentElement.dataset.tutorialOpen="true";
 render();trackSpotlight();
}
function finish(){
 if(!active)return;
 active=false;cancelAnimationFrame(spotFrame);cancelAnimationFrame(layoutFrame);layoutFrame=0;observer?.disconnect();overlay.hidden=true;delete document.documentElement.dataset.tutorialOpen;
 if(currentMode!=="home-screen")remember();$("#tutorial-invitation")?.remove();go(previousView);
 if(trigger?.isConnected)trigger.focus({preventScroll:true});else $("button[data-tutorial-open]")?.focus({preventScroll:true});
}
function keyboard(event){
 if(!active)return;
 if(event.key==="Escape"){event.preventDefault();finish();}
 else if(event.key==="Tab"){
  const controls=[...panel.querySelectorAll("button:not([disabled]),[tabindex=\"0\"]")];if(!controls.length)return;
  const first=controls[0],last=controls[controls.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
}
function bind({navigate:route,launchQuery}={}){
 if(bound)return;bound=true;navigate=route;
 mountFeatureGuides();
 document.querySelectorAll("button[data-tutorial-open]").forEach(b=>b.addEventListener("click",()=>open(b)));
 document.querySelectorAll("button[data-lesson-tutorial-open]").forEach(b=>b.addEventListener("click",()=>open(b,"lessons")));
 document.querySelectorAll("button[data-home-screen-help]").forEach(b=>b.addEventListener("click",()=>open(b,"home-screen")));
 document.addEventListener("keydown",keyboard);
 window.addEventListener("resize",scheduleLayout);
 window.visualViewport?.addEventListener("resize",scheduleLayout);
 window.visualViewport?.addEventListener("scroll",scheduleLayout);
 if(typeof ResizeObserver==="function")observer=new ResizeObserver(scheduleLayout);
 window.addEventListener("scroll",spotlight,{passive:true});
 // Open the actual walkthrough, not an invitation card, on first launch.
 // A shared ?tour=1 link always reopens it, even after closing before.
 const params=launchQuery||new URLSearchParams(location.search);
 if(params.get("tour")==="home-screen")open($("button[data-home-screen-help]"),"home-screen");
 else if(params.get("tour")==="lessons")open($("button[data-lesson-tutorial-open]"),"lessons");
 else if(params.get("tour")==="1"||!seen())open($("button[data-tutorial-open]"));
}
const api={bind,open,openLessons:opener=>open(opener,"lessons"),close:finish,isOpen:()=>active,get step(){return index+1;},get count(){return steps.length;}};
if(typeof module!=="undefined"&&module.exports)module.exports={STEPS,HOME_SCREEN_STEPS,FEATURE_GUIDES,api};
root.HablaTutorial=api;
})(typeof window==="object"?window:globalThis);
