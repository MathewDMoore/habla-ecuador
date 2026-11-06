/* Habla Ecuador: small, device-local, searchable text translation history.
   Successful everyday text only. No cloud sync, audio, photos or research papers. */
(function(root){
"use strict";
const KEY="habla-ecuador-translation-history-v1";
const LIMIT=30,MAX_SOURCE=4000,MAX_TARGET=6000;
const $=s=>typeof document!=="undefined"?document.querySelector(s):null;
const storage=()=>{try{return localStorage;}catch{return null;}};
const clean=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().trim();
const validLocale=s=>/^(?:en|es)-[A-Z]{2}$/.test(s);
function sanitize(item){
 if(!item||typeof item!=="object")return null;
 const {source,target,sourceLanguage,targetLanguage}=item;
 if(typeof source!=="string"||typeof target!=="string"||!source.trim()||!target.trim()
   ||source.length>MAX_SOURCE||target.length>MAX_TARGET
   ||!validLocale(sourceLanguage)||!validLocale(targetLanguage))return null;
 return {id:typeof item.id==="string"&&item.id.length<90?item.id:"",
   source,target,sourceLanguage,targetLanguage,
   date:typeof item.date==="string"&&!Number.isNaN(Date.parse(item.date))?item.date:new Date().toISOString()};
}
function read(store=storage()){
 try{
  const json=JSON.parse(store?.getItem(KEY)||"null");
  if(!json||json.version!==1||!Array.isArray(json.items))return {enabled:true,items:[]};
  return {enabled:json.enabled!==false,items:json.items.map(sanitize).filter(Boolean).slice(0,LIMIT)};
 }catch{return {enabled:true,items:[]};}
}
function write(state,store=storage()){
 try{store?.setItem(KEY,JSON.stringify({version:1,enabled:state.enabled,items:state.items}));return Boolean(store);}
 catch{return false;}
}
function add(state,item){
 const value=sanitize(item);
 if(!value)return false;
 const found=state.items.find(entry=>entry.source===value.source&&
   entry.sourceLanguage===value.sourceLanguage&&entry.targetLanguage===value.targetLanguage);
 value.id=found?.id||("h"+Date.now().toString(36)+Math.random().toString(36).slice(2,9));
 value.date=new Date().toISOString();
 state.items=[value,...state.items.filter(entry=>entry.id!==value.id)].slice(0,LIMIT);
 return true;
}
function search(items,query){
 const value=clean(query);
 if(!value)return items;
 return items.filter(item=>clean([item.source,item.target,item.sourceLanguage,item.targetLanguage].join(" ")).includes(value));
}
function create(tag,cls,text){
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined)el.textContent=text;
 return el;
}
function button(text,action){
 const el=create("button","history-action",text);el.type="button";
 if(action)el.dataset.historyAction=action;
 return el;
}
let state=read(),panel=null,list=null,searchBox=null,count=null,status=null,enabledControl=null,
  getCurrent=null,restore=null,languageLabel=x=>x,queued=null,saveTimer=0,bound=false;
function signal(message){
 if(status)status.textContent=message;
}
function commit(){
 if(!write(state)){signal("Could not save on this device. Check browser storage settings. / No se pudo guardar en este dispositivo.");return false;}
 return true;
}
function addCurrent(entry,explicit=false){
 if(!entry||entry.purpose!=="everyday"||entry.music||entry.document||entry.incomplete){
  if(explicit)signal("Only completed everyday text translations can be saved here. / Solo se pueden guardar traducciones completas de texto cotidiano.");
  return false;
 }
 if(!add(state,entry)){
  if(explicit)signal("This passage is too long for recent history. / Este texto es demasiado largo para el historial reciente.");
  return false;
 }
 if(!commit())return false;
 redraw();
 if(explicit)signal("Saved on this device. / Guardado en este dispositivo.");
 return true;
}
function queue(get){
 if(!state.enabled)return;
 clearTimeout(saveTimer);
 queued=get;saveTimer=setTimeout(()=>{
  saveTimer=0;const callback=queued;queued=null;
  if(!state.enabled)return;
  try{addCurrent(callback?.(),false);}catch{}
 },1600);
}
function dateLabel(date){
 try{return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(date));}
 catch{return date;}
}
async function copyItem(item){
 const text=item.source+"\n\n"+item.target;
 try{
  await navigator.clipboard.writeText(text);
  signal("Source and translation copied. / Original y traducción copiados.");
 }catch{
  signal("Copy unavailable. Open this entry to select the text. / No se pudo copiar. Abre la entrada para seleccionar el texto.");
 }
}
function redraw(){
 if(!panel)return;
 enabledControl.checked=state.enabled;
 count.textContent=String(state.items.length);
 list.replaceChildren();
 const filtered=search(state.items,searchBox.value);
 if(!filtered.length){
  list.append(create("p","history-empty",state.items.length
   ?"No matching translations. / No hay traducciones que coincidan."
   :"No saved translations yet. / Todavía no hay traducciones guardadas."));
  return;
 }
 for(const item of filtered){
  const article=create("article","history-entry");
  const top=create("div","history-entry-top");
  top.append(create("span","history-route",languageLabel(item.sourceLanguage)+" → "+languageLabel(item.targetLanguage)));
  top.append(create("time","history-date",dateLabel(item.date)));
  const original=create("p","history-original",item.source);
  const translation=create("p","history-translation",item.target);
  const actions=create("div","history-entry-actions");
  for(const [name,action] of [
    ["Open / Abrir","open"],["Copy both / Copiar ambos","copy"],["Delete / Borrar","delete"]]){
    const control=button(name,action);control.dataset.historyId=item.id;actions.append(control);
  }
  article.append(top,original,translation,actions);list.append(article);
 }
}
function bind(options={}){
 if(bound||!$("#shared-translation-workspace"))return;
 bound=true;
 state=read();
 getCurrent=options.getCurrent||(()=>null);
 restore=options.restore||(()=>{});
 languageLabel=options.languageLabel||languageLabel;
 panel=create("details","compact-info recent-history");
 panel.id="translation-history";
 const heading=create("summary","history-summary");
 heading.append(create("span",null,"🕘 History / Historial "));
 count=create("span","history-count","0");heading.append(count);
 const body=create("div","history-body");
 const caption=create("p","history-privacy",
  "Up to 30 recent everyday translations are saved only in this browser on this device, not synced. Research papers, music and audio are excluded. / Hasta 30 traducciones cotidianas solo en este navegador, sin sincronización. No se guardan artículos académicos, música ni audio.");
 const controls=create("div","history-controls");
 const switchLabel=create("label","history-toggle");
 enabledControl=document.createElement("input");enabledControl.type="checkbox";
 enabledControl.id="history-auto-save";enabledControl.checked=state.enabled;
 switchLabel.append(enabledControl,document.createTextNode(" Auto-save / Guardar automáticamente"));
 const save=button("Save current / Guardar actual","save");
 save.id="history-save-current";
 const clear=button("Clear all / Borrar todo","clear");clear.id="history-clear";
 const confirm=button("Confirm delete / Confirmar borrado","confirm");
 confirm.id="history-confirm-clear";confirm.hidden=true;
 const cancel=button("Cancel / Cancelar","cancel");cancel.id="history-cancel-clear";cancel.hidden=true;
 controls.append(switchLabel,save,clear,confirm,cancel);
 const searchLabel=create("label","history-search-label","Search / Buscar");
 searchBox=document.createElement("input");searchBox.id="history-search";
 searchBox.type="search";searchBox.autocomplete="off";
 searchBox.placeholder="Words in either language / Palabras en ambos idiomas";
 searchBox.setAttribute("aria-label","Search saved translations / Buscar traducciones guardadas");
 searchLabel.append(searchBox);
 status=create("p","history-status");status.id="history-status";status.setAttribute("role","status");
 list=create("div","history-list");list.id="history-results";
 body.append(caption,controls,searchLabel,status,list);
 panel.append(heading,body);
 $("#shared-translation-workspace").after(panel);
 searchBox.addEventListener("input",redraw);
 enabledControl.addEventListener("change",()=>{
  state.enabled=enabledControl.checked;
  if(!state.enabled){clearTimeout(saveTimer);queued=null;}
  commit();signal(state.enabled
   ?"Automatic local saving enabled. / Guardado automático activado."
   :"Automatic saving disabled. Existing entries remain. / Guardado automático desactivado; se conservan las entradas.");
 });
 body.addEventListener("click",event=>{
  const target=event.target.closest("[data-history-action]");
  if(!target)return;
  const action=target.dataset.historyAction;
  if(action==="save"){const entry=getCurrent();addCurrent(entry,true);return;}
  if(action==="clear"){
   confirm.hidden=false;cancel.hidden=false;clear.hidden=true;
   signal("This permanently deletes all saved translations on this device. / Esto borra todas las traducciones guardadas en este dispositivo.");return;
  }
  if(action==="cancel"){confirm.hidden=true;cancel.hidden=true;clear.hidden=false;signal("");return;}
  if(action==="confirm"){
   clearTimeout(saveTimer);queued=null;state.items=[];
   if(commit()){redraw();signal("History cleared. / Historial borrado.");}
   confirm.hidden=true;cancel.hidden=true;clear.hidden=false;return;
  }
  const item=state.items.find(row=>row.id===target.dataset.historyId);
  if(!item)return;
  if(action==="delete"){
   state.items=state.items.filter(row=>row.id!==item.id);
   if(commit()){redraw();signal("Entry deleted. / Entrada borrada.");}
  }else if(action==="copy")void copyItem(item);
  else if(action==="open"){
   clearTimeout(saveTimer);queued=null;
   restore(item);
   panel.open=false;
   signal("Saved translation restored without a network request. / Traducción recuperada sin conexión.");
  }
 });
 window.addEventListener("storage",event=>{
  if(event.key===KEY){state=read();redraw();}
 });
 redraw();
}
const api={read,write,add,search,bind,queue,get count(){return state.items.length;}};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.HablaTranslationHistory=api;
})(typeof window==="object"?window:globalThis);
