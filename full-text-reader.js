/* Full-document reader: source + output with their original line breaks.
   No external calls. Works with browser and native WKWebView shared editors. */
(function(root){
"use strict";
let dialog=null,source=null,target=null,sourceButton=null,targetButton=null,opener=null,bound=false;
let writingTarget=false,watching=null,copyField=null,copyGeneration=0,inlineSignature="";
function clearCopy(){copyGeneration++;if(copyField){copyField.value="";copyField.hidden=true;}}
const $=s=>document.querySelector(s);
function element(tag,id,className="",text=""){
 const e=document.createElement(tag);if(id)e.id=id;if(className)e.className=className;
 if(text)e.textContent=text;return e;
}
function makeButton(text,id,className=""){const e=element("button",id,className,text);e.type="button";return e;}
function titleFor(selectId,fallback){
 const control=$(selectId);return control?.selectedOptions?.[0]?.textContent.trim()||fallback;
}
function resizeInput(){
 if(!source)return;
 source.style.height="auto";
 // Scroll the enclosing dialog, not a tiny independent 140px textarea.
 // Cap only for extraordinary book-length inputs to avoid browser layout limits.
 source.style.height=Math.max(96,Math.min(source.scrollHeight+4,120000))+"px";
}
function syncTarget(){
 resizeMainInput();
 syncInlineAlternatives();
 if(!dialog?.open||writingTarget)return;
 const original=$("#natural-result"),result=$("#full-reader-result");
 if(!original||!result)return;
 const available=!$("#translation-result")?.hidden;
 const editable=available && original.getAttribute("contenteditable")==="true";
 const value=available ? original.textContent||"" : "";
 const error=$("#no-result"),warning=$("#source-language-warning");
 $("#full-reader-translation-state").textContent=editable ? "" : error && !error.hidden
  ? error.textContent.trim() : warning && !warning.hidden ? warning.textContent.trim() : available ? "Translating… / Traduciendo…" : "Tap Translate to prepare this text. / Toca Traducir para preparar este texto.";
 $("#full-reader-copy-target").disabled=!editable;
 $("#full-reader-hear").disabled=!editable;
 $("#full-reader-reverse").disabled=!editable;
 $("#full-reader-translate").disabled=available && !editable;
 for(const [id,live] of [["#full-reader-source-jump","#source-language-select"],["#full-reader-target-jump","#target-language-select"]]){
  $(id).value=$(live)?.value||"";
 }
 const liveSource=$("#translator-input");
 if(liveSource && source.value!==liveSource.value){source.value=liveSource.value;resizeInput();}
 $("#full-reader-source-title").textContent=titleFor("#source-language-select","Source / Original");
 const changed=result.textContent!==value;
 if(changed){clearCopy();result.textContent=value;}
 const alternatives=$("#full-reader-alternatives");
 if(alternatives){alternatives.hidden=!editable;if(alternatives.open && changed)refreshAlternatives();}
 result.contentEditable=editable?"true":"false";
 const label=$("#translation-result .result-label")?.textContent.trim();
 $("#full-reader-target-title").textContent=label||titleFor("#target-language-select","Translation / Traducción");
}
function render(){
 clearCopy();
 const original=$("#translator-input"),draft=$("#natural-result");
 source.value=original?.value||"";
 resizeInput();
 $("#full-reader-source-title").textContent=titleFor("#source-language-select","Source / Original");
 $("#full-reader-source-count").textContent=source.value.length+" characters / caracteres";
 $("#full-reader-translation-state").textContent=$("#translation-result")?.hidden
   ?"Translation not available yet / Traducción todavía no disponible":"";
 const targetArea=$("#full-reader-result");
 targetArea.textContent=draft?.textContent||"";
 targetArea.contentEditable=draft?.getAttribute("contenteditable")==="true"?"true":"false";
 $("#full-reader-target-title").textContent=
  $("#translation-result .result-label")?.textContent.trim()||
  titleFor("#target-language-select","Translation / Traducción");
 syncTarget();
}
function close(){
 clearCopy();
 if(!dialog)return;
 if(dialog.open&&typeof dialog.close==="function")dialog.close();
 else dialog.removeAttribute("open");
}
function open(focusSection="source",button=null){
 if(!dialog)return;
 opener=button||document.activeElement;
 render();
 if(!dialog.open){
  if(typeof dialog.showModal==="function")dialog.showModal();
  else dialog.setAttribute("open","");
 }
 // Safari/WebKit returns zero scrollHeight for a textarea inside a hidden
 // dialog. Measure only AFTER the dialog is visible, including pasted text.
 resizeInput();
 syncTarget();
 requestAnimationFrame(resizeInput);
 const section=focusSection==="target"?$("#full-reader-target-section"):$("#full-reader-source-section");
 section.scrollIntoView({block:"start",behavior:"instant"});
 (focusSection==="target"?$("#full-reader-target-jump"):$("#full-reader-source-jump")).focus({preventScroll:true});
}
function copy(value,button){
 if(!value)return;
 clearCopy();
 const token=copyGeneration,old=button.textContent,inReader=dialog.contains(button);
 function report(ok){
  if(token!==copyGeneration||(inReader&&!dialog.open))return;
  button.textContent=ok?"Copied / Copiado":"Select to copy / Selecciona para copiar";
  if(!ok){
   button.parentElement.after(copyField);
   copyField.hidden=false;copyField.value=value;
   copyField.focus();copyField.select();copyField.setSelectionRange(0,value.length);
  }
  setTimeout(()=>{if(button.isConnected)button.textContent=old;},1800);
 }
 try {
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(()=>report(true),()=>report(false));
  else report(false);
 } catch {report(false);}
}

function refreshAlternatives(box=$("#full-reader-alternatives-list")){
 if(!box)return;
 box.replaceChildren();
 const choices=typeof window.translationWordingAlternatives==="function" ? window.translationWordingAlternatives() : [];
 const compare=$("#compare-english");
 if(compare && !compare.disabled){
  const comparison=$("#english-comparison"),wasHidden=comparison?.hidden;
  compare.click();
  if(box.id==="inline-alternatives-list" && wasHidden && comparison)comparison.hidden=true;
  const note=$("#comparison-notes")?.textContent.trim()||"Regional English wording; review in context. / Variante regional del inglés; revisa el contexto.";
  for(const variant of ["us","uk"]){const text=$("#comparison-"+variant)?.value;
   if(text && text!==$("#natural-result").textContent && !choices.some(c=>c.text===text))choices.push({text,label:variant==="us"?"U.S. English / Inglés estadounidense":"U.K. English / Inglés británico",note});
  }
 }
 for(const choice of choices){
  const card=element("details",null,"full-reader-alternative-card");card.open=true;
  const summary=element("summary",null,"",choice.text);
  const label=element("strong",null,"",choice.label);
  const note=element("p",null,"",choice.note||"Review this alternative in context. / Revisa esta alternativa en contexto.");
  const actions=element("div",null,"full-reader-section-actions");
  const hear=makeButton("🔊 Hear / Escuchar");
  hear.addEventListener("click",()=>{if(typeof window.say==="function")window.say(choice.text,$("#target-language-select")?.value);});
  const copyButton=makeButton("Copy / Copiar");copyButton.addEventListener("click",()=>copy(choice.text,copyButton));
  const use=makeButton("Use this / Usar esta");
  use.addEventListener("click",()=>{
   const live=$("#natural-result");if(live?.getAttribute("contenteditable")!=="true")return;
   live.textContent=choice.text;live.dispatchEvent(new Event("input",{bubbles:true}));syncTarget();
  });
  actions.append(hear,copyButton,use);card.append(summary,label,note,actions);box.append(card);
 }
 if(choices.length){
  const toggle=makeButton("Collapse all / Contraer todas",box.id+"-toggle");
  toggle.addEventListener("click",()=>{
   const cards=[...box.querySelectorAll(".full-reader-alternative-card")],expand=cards.some(card=>!card.open);
   cards.forEach(card=>card.open=expand);toggle.textContent=expand?"Collapse all / Contraer todas":"Expand all / Ampliar todas";
  });box.prepend(toggle);
 } else box.append(element("p",null,"","No additional wording available for this draft. / No hay variantes adicionales para este texto."));
}


function resizeMainInput(){
 const input=$("#translator-input");if(!input)return;
 input.style.height="auto";
 input.style.height=Math.max(96,Math.min(input.scrollHeight+4,120000))+"px";
}
function syncInlineAlternatives(){
 const panel=$("#inline-translation-alternatives");
 if(!panel)return;
 const live=$("#natural-result");
 const editable=!$("#translation-result")?.hidden && live?.getAttribute("contenteditable")==="true";
 const signature=JSON.stringify([editable,live?.textContent,$("#translator-input")?.value,$("#source-language-select")?.value,$("#target-language-select")?.value]);
 if(signature===inlineSignature)return;
 inlineSignature=signature;
 if(panel.hidden===editable)panel.hidden=!editable;
 if(editable && panel.open)refreshAlternatives($("#inline-alternatives-list"));
}
function makeInlineAlternatives(){
 const panel=element("details","inline-translation-alternatives");
 panel.hidden=true;panel.className="inline-translation-alternatives";
 const summary=element("summary",null,"","Alternatives / Alternativas");
 summary.setAttribute("aria-label","Show alternative translations / Mostrar traducciones alternativas");
 const list=element("div","inline-alternatives-list");
 panel.append(summary,list);
 panel.addEventListener("toggle",()=>{if(panel.open)refreshAlternatives(list);});
 $("#translation-result .result-actions").after(panel);
 const speed=$("#translation-result .result-speed-control");
 const notes=$("#translation-result .result-notes");
 if(speed && notes)notes.append(speed);
}

function make(){
 dialog=element("dialog","full-text-reader","full-text-reader");
 dialog.setAttribute("aria-labelledby","full-reader-title");
 dialog.setAttribute("aria-describedby","full-reader-intro");
 dialog.setAttribute("translate","no");
 const heading=element("header",null,"full-reader-header");
 const group=element("div",null,"full-reader-heading-group");
 const title=element("h2","full-reader-title","", "Complete text / Texto completo");
 const intro=element("p","full-reader-intro","","Read every word without clipped boxes. Review or edit the text before sharing. / Lee todo el texto sin recortes. Revísalo o edítalo antes de compartirlo.");
 group.append(title,intro);
 const done=makeButton("Close / Cerrar","full-reader-close");done.addEventListener("click",close);
 heading.append(group,done);
 const jumps=element("nav",null,"full-reader-jumps");
 const js=element("select","full-reader-source-jump");
 js.setAttribute("aria-label","Source language / Idioma original");
 const jt=element("select","full-reader-target-jump");
 jt.setAttribute("aria-label","Translation language / Idioma de traducción");
 for(const [control,id] of [[js,"#source-language-select"],[jt,"#target-language-select"]]){
  control.innerHTML=$(id)?.innerHTML||"";
  control.addEventListener("change",()=>{const live=$(id);if(live){live.value=control.value;live.dispatchEvent(new Event("change",{bubbles:true}));render();}});
 }
 const translate=makeButton("Translate / Traducir","full-reader-translate");
 translate.addEventListener("click",()=>{
  const warning=$("#source-language-warning");
  if(warning && !warning.hidden){$("#correct-source-language")?.click();syncTarget();return;}
  const confirm=$("#translator-mic-confirm");
  (confirm && !confirm.hidden ? confirm : $("#retry-translation"))?.click();
  syncTarget();
 });
 const reverse=makeButton("⇄ Reverse / Invertir","full-reader-reverse");
 reverse.addEventListener("click",()=>{$("#swap-button")?.click();render();});
 reverse.textContent="⇄";reverse.setAttribute("aria-label","Reverse languages and texts / Invertir idiomas y textos");
 jumps.append(js,reverse,jt,translate);
 const original=element("section","full-reader-source-section","full-reader-section");
 const originalHeader=element("div",null,"full-reader-section-heading");
 const originalTitle=element("h3","full-reader-source-title","","Source / Original");
 const originalInfo=element("small","full-reader-source-count","","");
 originalHeader.append(originalTitle,originalInfo);
 source=element("textarea","full-reader-source","full-reader-source");
 source.spellcheck=true;source.rows=3;
 source.setAttribute("aria-label","Complete source text / Texto original completo");
 source.addEventListener("input",()=>{
  clearCopy();
  const live=$("#translator-input");
  if(live){
   live.value=source.value;
   // Use the existing debounce and cancellation, including research mode.
   live.dispatchEvent(new Event("input",{bubbles:true}));
  }
  $("#full-reader-source-count").textContent=source.value.length+" characters / caracteres";
  resizeInput();
 });
 const sourceCopy=makeButton("Copy source / Copiar original","full-reader-copy-source");
 sourceCopy.addEventListener("click",()=>copy(source.value,sourceCopy));
 const originalActions=element("div",null,"full-reader-section-actions");
 originalActions.append(sourceCopy);
 original.append(originalHeader,source,originalActions);
 const translated=element("section","full-reader-target-section","full-reader-section");
 const translationTitle=element("h3","full-reader-target-title","","Translation / Traducción");
 const translationNote=element("p","full-reader-translation-state","full-reader-status","");
 target=element("div","full-reader-result","full-reader-result","");
 target.setAttribute("role","textbox");target.setAttribute("aria-multiline","true");
 target.setAttribute("aria-label","Complete translation / Traducción completa");
 target.spellcheck=true;
 target.addEventListener("input",()=>{
  clearCopy();
  const live=$("#natural-result");
  if(!live||live.getAttribute("contenteditable")!=="true")return;
  writingTarget=true;
  live.textContent=target.innerText.replace(/\r/g,"");
  live.dispatchEvent(new Event("input",{bubbles:true}));
  writingTarget=false;
 });
 const copyTarget=makeButton("Copy translation / Copiar traducción","full-reader-copy-target");
 copyTarget.addEventListener("click",()=>copy(target.innerText,copyTarget));
 const translatedActions=element("div",null,"full-reader-section-actions");
 const hear=makeButton("🔊 Hear / Escuchar","full-reader-hear");
 hear.addEventListener("click",()=>$("#hear-result")?.click());
 translatedActions.append(hear,copyTarget);
 const alternatives=element("details","full-reader-alternatives");
 const summary=element("summary",null,"","Alternatives / Alternativas");
 const list=element("div","full-reader-alternatives-list");
 alternatives.append(summary,list);
 alternatives.addEventListener("toggle",()=>{if(alternatives.open)refreshAlternatives();});
 translated.append(translationTitle,translationNote,target,translatedActions,alternatives);
 copyField=element("textarea","full-reader-copy-field");
 copyField.readOnly=true;copyField.hidden=true;copyField.rows=8;
 copyField.setAttribute("aria-label","Select and copy this text / Selecciona y copia este texto");
 copyField.style.cssText="width:100%;font-size:16px;white-space:pre-wrap;";
 dialog.append(heading,jumps,original,translated,copyField);
 dialog.addEventListener("close",()=>{clearCopy();if(opener?.isConnected)opener.focus({preventScroll:true});});
 dialog.addEventListener("click",event=>{
  // Clicking the modal backdrop closes it; tapping a text section never does.
  if(event.target===dialog)close();
 });
 document.body.append(dialog);
 watching=new MutationObserver(syncTarget);
 for(const selector of ["#natural-result","#translation-result","#no-result","#source-language-warning"]){
  const live=$(selector);if(live)watching.observe(live,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["contenteditable","hidden"]});
 }
}
function bind(){
 if(bound)return;bound=true;
 const editor=$("#translator-input"),tools=$("#translation-text-tools");
 if(!editor||!tools)return;
 make();
 makeInlineAlternatives();
 editor.addEventListener("input",resizeMainInput);
 resizeMainInput();
 syncInlineAlternatives();
 sourceButton=makeButton("Expand source / Ampliar original","source-full-text");
 sourceButton.setAttribute("aria-haspopup","dialog");
 sourceButton.setAttribute("aria-controls","full-text-reader");
 sourceButton.addEventListener("click",()=>open("source",sourceButton));
 editor.after(sourceButton);
 targetButton=makeButton("Full text / Texto completo","translation-full-text");
 targetButton.setAttribute("aria-haspopup","dialog");
 targetButton.setAttribute("aria-controls","full-text-reader");
 targetButton.addEventListener("click",()=>open("target",targetButton));
 tools.append(targetButton);
}
const api={bind,open,close,isOpen:()=>Boolean(dialog?.open)};
if(typeof module!=="undefined"&&module.exports)module.exports={api};
root.HablaFullReader=api;
})(typeof window==="object"?window:globalThis);
