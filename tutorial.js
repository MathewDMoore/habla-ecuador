/* Habla Ecuador guided bilingual help. Original content, runs without network. */
(function(root){
"use strict";
const KEY="habla-tutorial-seen-v1";
const STEPS=[
 {view:"home-view",target:"#home-title",symbol:"🇪🇨",en:"Welcome to Habla Ecuador",es:"Bienvenido a Habla Ecuador",
  body:"Learn Ecuadorian Spanish and English through translation, listening, speaking and everyday expressions.",
  esp:"Aprende español ecuatoriano e inglés mediante traducciones, ejercicios de escucha, práctica oral y expresiones cotidianas."},
 {view:"translator-view",target:".language-picker-row",symbol:"🌐",en:"Choose your languages",es:"Elige tus idiomas",
  body:"Choose the language you speak or write under From and the translation language under To. Tap the arrows to switch.",
  esp:"Elige en De el idioma que hablas o escribes y en A el idioma al que quieres traducir. Toca las flechas para intercambiarlos."},
 {view:"translator-view",target:"#translator-input",symbol:"✍️",en:"Translate words and phrases",es:"Traduce palabras y frases",
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
 {view:"music-view",target:"#open-music-tracks",symbol:"🎶",fullOnly:true,en:"Learn through music",es:"Aprende con música",
  body:"Explore Music for listening, pronunciation, rhythm and culture. Available recordings and translation options may vary.",
  esp:"Explora Música para practicar la escucha, la pronunciación, el ritmo y la cultura. Las grabaciones y opciones de traducción pueden variar."},
 {view:null,target:".feedback-open",symbol:"💬",en:"Help improve Habla Ecuador",es:"Ayúdanos a mejorar Habla Ecuador",
  body:"Find an incorrect translation or regional expression? Tap the speech bubble to suggest a correction. Nothing is sent automatically.",
  esp:"¿Encontraste una traducción o expresión regional incorrecta? Toca el globo de diálogo para sugerir una corrección. Nada se envía automáticamente."}
];
const $=s=>document.querySelector(s);
let steps=[],index=0,active=false,previousView="home-view",navigate=null,trigger=null,overlay=null,panel=null,bound=false;
function seen(){try{return localStorage.getItem(KEY)==="1";}catch{return false;}}
function remember(){try{localStorage.setItem(KEY,"1");}catch{}}
function button(text,id){const b=document.createElement("button");b.type="button";b.textContent=text;b.id=id;return b;}
function invite(){
 if(seen()||$("#tutorial-invitation"))return;
 const intro=$("#home-view .intro");if(!intro)return;
 const card=document.createElement("section");card.id="tutorial-invitation";card.className="tutorial-invitation";card.setAttribute("translate","no");
 const heading=document.createElement("h2");heading.textContent="New here? / ¿Es tu primera vez?";
 const english=document.createElement("p");english.textContent="Take a quick tour of Habla Ecuador. No explanation needed.";
 const spanish=document.createElement("p");spanish.lang="es";spanish.textContent="Haz un recorrido breve por Habla Ecuador. No necesitas que nadie te lo explique.";
 const actions=document.createElement("div");actions.className="tutorial-invitation-actions";
 const start=button("Start tutorial / Comenzar","tutorial-invite-start");
 const later=button("Not now / Ahora no","tutorial-invite-later");
 start.addEventListener("click",()=>open(start));later.addEventListener("click",()=>{remember();card.remove();});
 actions.append(start,later);card.append(heading,english,spanish,actions);intro.after(card);
}
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
 const close=button("×","tutorial-close");close.setAttribute("aria-label","Close tutorial / Cerrar tutorial");close.addEventListener("click",finish);
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
 panel.append(top,symbol,title,english,divider,spanishTitle,spanish,note,controls);
 overlay.append(panel);document.body.append(overlay);
}
function go(view){if(view&&!$("#"+view)?.classList.contains("active"))navigate?.(view);}
function spotlight(){
 if(!active||!overlay)return;
 const step=steps[index],element=$(step.target),frame=$("#tutorial-spotlight");
 const panelTop=Math.max(95,panel.getBoundingClientRect().top-10);
 const r=element&&element.getClientRects().length?element.getBoundingClientRect():null;
 const valid=r&&r.width>0&&r.height>0&&r.top<panelTop-12&&r.bottom>0;
 const x=valid?Math.max(5,r.left-5):0,y=valid?Math.max(5,r.top-5):0;
 const w=valid?Math.min(window.innerWidth-x-5,r.width+10):0;
 const h=valid?Math.min(panelTop-y,r.height+10):0;
 frame.style.display=valid?"block":"none";
 if(valid)Object.assign(frame.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px"});
 const regions=valid?{
  top:[0,0,window.innerWidth,y],left:[0,y,x,h],
  right:[x+w,y,Math.max(0,window.innerWidth-x-w),h],
  bottom:[0,y+h,window.innerWidth,Math.max(0,window.innerHeight-y-h)]
 }:{top:[0,0,window.innerWidth,window.innerHeight],left:[0,0,0,0],right:[0,0,0,0],bottom:[0,0,0,0]};
 for(const shade of overlay.querySelectorAll(".tutorial-shade")){
  const [left,top,width,height]=regions[shade.dataset.edge];
  Object.assign(shade.style,{left:left+"px",top:top+"px",width:width+"px",height:height+"px"});
 }
}
function render(){
 if(!active)return;
 const step=steps[index];go(step.view);
 $("#tutorial-progress").textContent=(index+1)+" / "+steps.length+" · Getting started / Primeros pasos";
 $("#tutorial-symbol").textContent=step.symbol;
 $("#tutorial-title").textContent=step.en;$("#tutorial-english").textContent=step.body;
 $("#tutorial-title-es").textContent=step.es;$("#tutorial-spanish").textContent=step.esp;
 $("#tutorial-back").disabled=index===0;
 $("#tutorial-next").textContent=index===steps.length-1?"Finish / Terminar":"Next / Siguiente";
 const el=$(step.target);
 if(el&&el.getClientRects().length){
  const rect=el.getBoundingClientRect(),top=rect.top+window.scrollY;
  const available=Math.max(140,window.innerHeight-panel.offsetHeight-22);
  if(rect.top<64||rect.bottom>available-10)window.scrollTo({top:Math.max(0,top-96),behavior:"instant"});
 }
 requestAnimationFrame(()=>requestAnimationFrame(spotlight));
 $("#tutorial-next").focus({preventScroll:true});
}
function move(n){if(active){index=Math.max(0,Math.min(steps.length-1,index+n));render();}}
function open(opener){
 if(active)return;
 make();steps=STEPS.filter(s=>!s.fullOnly||Boolean($("#music-view")));
 index=0;active=true;
 trigger=opener&&opener.isConnected?opener:document.activeElement;
 previousView=$(".view.active")?.id||"home-view";
 overlay.hidden=false;document.documentElement.dataset.tutorialOpen="true";
 render();
}
function finish(){
 if(!active)return;
 active=false;overlay.hidden=true;delete document.documentElement.dataset.tutorialOpen;
 remember();$("#tutorial-invitation")?.remove();go(previousView);
 if(trigger?.isConnected)trigger.focus({preventScroll:true});else $("[data-tutorial-open]")?.focus({preventScroll:true});
}
function keyboard(event){
 if(!active)return;
 if(event.key==="Escape"){event.preventDefault();finish();}
 else if(event.key==="Tab"){
  const controls=[...panel.querySelectorAll("button:not([disabled])")];if(!controls.length)return;
  const first=controls[0],last=controls[controls.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
}
function bind({navigate:route,launchQuery}={}){
 if(bound)return;bound=true;navigate=route;
 document.querySelectorAll("[data-tutorial-open]").forEach(b=>b.addEventListener("click",()=>open(b)));
 document.addEventListener("keydown",keyboard);
 window.addEventListener("resize",spotlight);
 window.addEventListener("scroll",spotlight,{passive:true});
 invite();
 const params=launchQuery||new URLSearchParams(location.search);
 if(params.get("tour")==="1")open($("[data-tutorial-open]"));
}
const api={bind,open,close:finish,isOpen:()=>active,get step(){return index+1;},get count(){return steps.length;}};
if(typeof module!=="undefined"&&module.exports)module.exports={STEPS,api};
root.HablaTutorial=api;
})(typeof window==="object"?window:globalThis);
