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
 {view:"music-view",target:"#open-music-tracks",symbol:"🎶",fullOnly:true,en:"Learn through music",es:"Aprende con música",
  body:"Explore Music for listening, pronunciation, rhythm and culture. Available recordings and translation options may vary.",
  esp:"Explora Música para practicar la escucha, la pronunciación, el ritmo y la cultura. Las grabaciones y opciones de traducción pueden variar."},
 {view:null,target:".feedback-open",symbol:"💬",en:"Help improve Habla Ecuador",es:"Ayúdanos a mejorar Habla Ecuador",
  body:"Find an incorrect translation or regional expression? Tap the speech bubble to suggest a correction. Nothing is sent automatically.",
  esp:"¿Encontraste una traducción o expresión regional incorrecta? Toca el globo de diálogo para sugerir una corrección. Nada se envía automáticamente."}
];
const $=s=>document.querySelector(s);
function targetFor(step){const target=$(step.target);return step.groupTarget?target?.closest(step.groupTarget)||target:target;}
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
 content.append(symbol,title,english,divider,spanishTitle,spanish,note);
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
function open(opener){
 if(active)return;
 make();steps=STEPS.filter(s=>!s.fullOnly||Boolean($("#music-view")));
 index=0;active=true;
 trigger=opener&&opener.isConnected?opener:document.activeElement;
 previousView=$(".view.active")?.id||"home-view";
 placeViewport();overlay.hidden=false;document.documentElement.dataset.tutorialOpen="true";
 render();trackSpotlight();
}
function finish(){
 if(!active)return;
 active=false;cancelAnimationFrame(spotFrame);cancelAnimationFrame(layoutFrame);layoutFrame=0;observer?.disconnect();overlay.hidden=true;delete document.documentElement.dataset.tutorialOpen;
 remember();$("#tutorial-invitation")?.remove();go(previousView);
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
 document.querySelectorAll("button[data-tutorial-open]").forEach(b=>b.addEventListener("click",()=>open(b)));
 document.addEventListener("keydown",keyboard);
 window.addEventListener("resize",scheduleLayout);
 window.visualViewport?.addEventListener("resize",scheduleLayout);
 window.visualViewport?.addEventListener("scroll",scheduleLayout);
 if(typeof ResizeObserver==="function")observer=new ResizeObserver(scheduleLayout);
 window.addEventListener("scroll",spotlight,{passive:true});
 // Open the actual walkthrough, not an invitation card, on first launch.
 // A shared ?tour=1 link always reopens it, even after closing before.
 const params=launchQuery||new URLSearchParams(location.search);
 if(params.get("tour")==="1"||!seen())open($("button[data-tutorial-open]"));
}
const api={bind,open,close:finish,isOpen:()=>active,get step(){return index+1;},get count(){return steps.length;}};
if(typeof module!=="undefined"&&module.exports)module.exports={STEPS,api};
root.HablaTutorial=api;
})(typeof window==="object"?window:globalThis);
