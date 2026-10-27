/* Full-document reader: source + output with their original line breaks.
   No external calls. Works with browser and native WKWebView shared editors. */
(function(root){
"use strict";
let dialog=null,source=null,target=null,sourceButton=null,targetButton=null,opener=null,bound=false;
let writingTarget=false,watching=null,copyField=null,copyGeneration=0;
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
 source.style.height=Math.max(260,Math.min(source.scrollHeight+4,120000))+"px";
}
function syncTarget(){
 if(!dialog?.open||writingTarget)return;
 const original=$("#natural-result"),result=$("#full-reader-result");
 if(!original||!result)return;
 const value=original.textContent||"";
 if(result.textContent!==value){clearCopy();result.textContent=value;}
 result.contentEditable=original.getAttribute("contenteditable")==="true"?"true":"false";
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
 requestAnimationFrame(resizeInput);
 const section=focusSection==="target"?$("#full-reader-target-section"):$("#full-reader-source-section");
 section.scrollIntoView({block:"start",behavior:"instant"});
 (focusSection==="target"?$("#full-reader-target-jump"):$("#full-reader-source-jump")).focus({preventScroll:true});
}
function copy(value,button){
 if(!value)return;
 clearCopy();
 const token=copyGeneration,old=button.textContent;
 function report(ok){
  if(token!==copyGeneration||!dialog.open)return;
  button.textContent=ok?"Copied / Copiado":"Select to copy / Selecciona para copiar";
  if(!ok){
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
 const js=makeButton("Source / Original","full-reader-source-jump");
 const jt=makeButton("Translation / Traducción","full-reader-target-jump");
 js.addEventListener("click",()=>$("#full-reader-source-section").scrollIntoView({block:"start",behavior:"instant"}));
 jt.addEventListener("click",()=>$("#full-reader-target-section").scrollIntoView({block:"start",behavior:"instant"}));
 jumps.append(js,jt);
 const original=element("section","full-reader-source-section","full-reader-section");
 const originalHeader=element("div",null,"full-reader-section-heading");
 const originalTitle=element("h3","full-reader-source-title","","Source / Original");
 const originalInfo=element("small","full-reader-source-count","","");
 originalHeader.append(originalTitle,originalInfo);
 source=element("textarea","full-reader-source");
 source.spellcheck=true;source.rows=12;
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
 translatedActions.append(copyTarget);
 translated.append(translationTitle,translationNote,target,translatedActions);
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
 const live=$("#natural-result");if(live)watching.observe(live,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["contenteditable"]});
}
function bind(){
 if(bound)return;bound=true;
 const editor=$("#translator-input"),tools=$("#translation-text-tools");
 if(!editor||!tools)return;
 make();
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
