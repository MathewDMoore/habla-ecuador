/* Explicit, device-only saved music translations and conversations.
   The ordinary text Translation History remains a separate store.
   Never save microphone audio, raw video, or private conversations automatically. */
(function(root){
"use strict";
const KEY="habla-ecuador-saved-sessions-v1";
const CAP=15,MAX_SONG=38000,MAX_CONVERSATION=85000;
// The trash is never silently purged. If the device runs out of storage,
// saving fails clearly rather than discarding an older or deleted entry.
let state=null,callbacks=null;
const ids=kind=>kind==="song"?"saved-music":"saved-conversations";
const limit=kind=>kind==="song"?MAX_SONG:MAX_CONVERSATION;
const id=()=>("s"+Date.now().toString(36)+Math.random().toString(36).slice(2,9));
const text=x=>typeof x==="string"?x:"";
const trim=x=>text(x).trim();
function sanitize(raw){
 if(!raw||!["song","conversation"].includes(raw.kind))return null;
 const kind=raw.kind;
 const record={kind,id:text(raw.id).slice(0,90)||id(),
   date:text(raw.date)||new Date().toISOString(),
   title:text(raw.title).slice(0,140),artist:text(raw.artist).slice(0,140)};
 if(kind==="song"){
  record.source=text(raw.source);
  record.target=text(raw.target);
  record.sourceLanguage=text(raw.sourceLanguage).slice(0,16);
  record.targetLanguage=text(raw.targetLanguage).slice(0,16);
  record.passages=Array.isArray(raw.passages)?raw.passages.slice(0,20).map(p=>({
   source:text(p.source).slice(0,3000),draft:text(p.draft).slice(0,4000),
   language:text(p.language).slice(0,16),target:text(p.target).slice(0,16)
  })):[];
  if(!trim(record.source)||!trim(record.target))return null;
 }else{
  record.turns=Array.isArray(raw.turns)?raw.turns.slice(0,120).map(t=>({
   speaker:text(t.speaker).slice(0,90),
   source:text(t.source).slice(0,8000),
   translation:text(t.translation).slice(0,8000),
   sourceLocale:text(t.sourceLocale).slice(0,16),
   target:text(t.target).slice(0,16),
   role:text(t.role).slice(0,16),
   slot:text(t.slot).slice(0,16),
   languageLabel:text(t.languageLabel).slice(0,90),
   failed:Boolean(t.failed),faceToFace:Boolean(t.faceToFace),
   languageUncertain:Boolean(t.languageUncertain)
  })):[];
  if(!record.turns.length||!record.turns.some(t=>trim(t.source)))return null;
 }
 return JSON.stringify(record).length<=limit(kind)?record:null;
}
function read(){
 try{
  const parsed=JSON.parse(root.localStorage?.getItem(KEY)||"{}");
  // Upgrade the earlier archive without removing anything already saved.
  const items=Array.isArray(parsed.items)?parsed.items:[];
  const trash=Array.isArray(parsed.trash)?parsed.trash:[];
  return {
   items:items.map(sanitize).filter(Boolean),
   trash:trash.map(raw=>{
    const item=sanitize(raw);
    return item?{...item,deletedAt:text(raw.deletedAt)||new Date().toISOString()}:null;
   }).filter(Boolean)
  };
 }catch{return {items:[],trash:[]};}
}
function getState(){return state||(state=read());}
function write(next){
 try{
  if(!root.localStorage)return false;
  root.localStorage.setItem(KEY,JSON.stringify({version:2,items:next.items,trash:next.trash}));
  state=next;return true;
 }catch{return false;}
}
function matches(item,query){
 const words=trim(query).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 return !words||JSON.stringify(item).normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").toLowerCase().includes(words);
}
function list(kind,query="",trashed=false){
 return (trashed?getState().trash:getState().items)
  .filter(row=>row.kind===kind&&matches(row,query));
}
function add(kind,data){
 const record=sanitize({...data,kind,id:id(),date:new Date().toISOString()});
 if(!record)return {ok:false,reason:"Nothing complete to save, or the text is too long. / No hay traducción completa o el texto es demasiado largo."};
 if(list(kind).length>=CAP)return {ok:false,reason:
   "15 saved entries reached. Move an older one to Trash before saving. / Máximo de 15; mueve una entrada a la papelera."};
 const current=getState();
 if(!write({items:[record,...current.items],trash:current.trash}))
  return {ok:false,reason:"Device storage unavailable. / No se pudo guardar en este dispositivo."};
 draw(kind);return {ok:true,item:record};
}
function remove(idValue){
 // Soft-delete only: move the entire entry to a recoverable trash.
 const current=getState();
 const item=current.items.find(x=>x.id===idValue);
 if(!item)return false;
 if(!write({items:current.items.filter(x=>x.id!==idValue),
   trash:[{...item,deletedAt:new Date().toISOString()},...current.trash]}))return false;
 draw(item.kind);return true;
}
function restoreTrash(idValue){
 const current=getState();
 const item=current.trash.find(x=>x.id===idValue);
 if(!item)return {ok:false,reason:"Item not found in Trash / No está en la papelera"};
 if(list(item.kind).length>=CAP)return {ok:false,reason:
  "Saved archive full. Move another entry to Trash first. / Archivo lleno; mueve otra entrada a la papelera."};
 const {deletedAt,...restored}=item;
 if(!write({items:[restored,...current.items],
   trash:current.trash.filter(x=>x.id!==idValue)}))
  return {ok:false,reason:"Could not restore this item / No se pudo restaurar"};
 draw(item.kind);return {ok:true,item:restored};
}
function purge(idValue){
 // Irreversible path, called only after a separate user confirmation.
 const current=getState(),item=current.trash.find(x=>x.id===idValue);
 if(!item)return false;
 if(!write({items:current.items,trash:current.trash.filter(x=>x.id!==idValue)}))return false;
 draw(item.kind);return true;
}
const byId=(idValue,trashed=false)=>
 (trashed?getState().trash:getState().items).find(x=>x.id===idValue)||null;
function element(tag,cls,content){
 const el=document.createElement(tag);if(cls)el.className=cls;
 if(content!==undefined)el.textContent=content;
 return el;
}
function status(kind,message){
 const el=document.getElementById(ids(kind)+"-status");
 if(el)el.textContent=message;
}
function draw(kind){
 const rootEl=document.getElementById(ids(kind)+"-results");
 if(!rootEl)return;
 const search=document.getElementById(ids(kind)+"-search");
 const entries=list(kind,search?.value);
 const count=document.getElementById(ids(kind)+"-count");
 if(count)count.textContent=String(list(kind).length);
 const trashCount=document.getElementById(ids(kind)+"-trash-count");
 if(trashCount)trashCount.textContent=String(list(kind,"",true).length);
 rootEl.replaceChildren();
 if(!entries.length){
  rootEl.append(element("p","saved-session-empty",
    list(kind).length?"No matching saved entries / Sin coincidencias":
    "Nothing saved yet / Todavía no hay nada guardado"));
  return;
 }
 for(const item of entries){
  const card=element("article","saved-session-entry");
  const title=element("strong","saved-session-title",
    item.title||(kind==="song"?"Untitled song / Canción sin título":"Saved conversation / Conversación guardada"));
  const detail=element("p","saved-session-meta",kind==="song"
    ?[item.artist,item.sourceLanguage+" → "+item.targetLanguage].filter(Boolean).join(" · ")
    :item.turns.length+" turns / intervenciones");
  const date=element("small","saved-session-date",new Date(item.date).toLocaleString());
  const preview=element("p","saved-session-preview",kind==="song"
    ?item.source.slice(0,210)+"\n"+item.target.slice(0,210)
    :item.turns.slice(0,2).map(t=>t.speaker+": "+t.source+"\n"+t.translation).join("\n"));
  const actions=element("div","saved-session-actions");
  for(const [label,action] of [["Abrir / Open","open"],["Copiar / Copy","copy"],["Papelera / Trash","delete"]]){
   const button=element("button","saved-session-action",label);
   button.type="button";button.dataset.savedAction=action;button.dataset.savedId=item.id;actions.append(button);
  }
  card.append(title,detail,date,preview,actions);rootEl.append(card);
 }
 drawTrash(kind);
}
function drawTrash(kind){
 const node=document.getElementById(ids(kind)+"-trash-results");
 if(!node)return;
 node.replaceChildren();
 const items=list(kind,"",true);
 for(const item of items){
  const card=element("article","saved-session-entry saved-session-trashed");
  const heading=element("strong","saved-session-title",
    item.title|| (kind==="song"?"Untitled song / Canción sin título":"Saved conversation / Conversación guardada"));
  const when=element("p","saved-session-meta","Moved to Trash / En la papelera: "+new Date(item.deletedAt).toLocaleString());
  const actions=element("div","saved-session-actions");
  for(const [label,action] of [["♻️ Restaurar / Restore","restore"],["Eliminar definitivamente / Delete forever","purge"]]){
   const button=element("button","saved-session-action",label);
   button.type="button";button.dataset.savedAction=action;button.dataset.savedId=item.id;actions.append(button);
  }
  card.append(heading,when,actions);node.append(card);
 }
 if(!items.length)node.append(element("p","saved-session-empty","Trash is empty / Papelera vacía"));
}
function format(item){
 if(item.kind==="song"){
  return [item.title||"Song",item.artist||"",item.sourceLanguage+" → "+item.targetLanguage,
   "Original / Original",item.source,"Translation / Traducción",item.target].join("\n\n");
 }
 return [item.title||"Conversation",...item.turns.map(t=>
  (t.speaker||"Speaker")+": "+t.source+"\n"+(t.translation||"[translation unavailable]"))].join("\n\n");
}
async function copy(item){
 try{await root.navigator.clipboard.writeText(format(item));
  status(item.kind,"Copied to clipboard / Copiado");}
 catch{status(item.kind,"Copy unavailable; open the entry to select the text. / No se pudo copiar.");}
}
function saveSong(){
 const item=callbacks?.getSong?.();
 if(!item)return status("song","Finish translating the song first, then save it. / Primero termina la traducción.");
 const title=document.getElementById("saved-music-title");
 const artist=document.getElementById("saved-music-artist");
 const result=add("song",{...item,title:title?.value.trim()||"",artist:artist?.value.trim()||""});
 status("song",result.ok?"Saved on this device, not synced. / Guardada en este dispositivo.":result.reason);
 if(result.ok)document.getElementById("saved-music").open=true;
}
function saveConversation(faceOnly=false){
 const item=callbacks?.getConversation?.(faceOnly);
 if(!item)return status("conversation","Finish the conversation turn first; no completed conversation is available. / Termina el turno primero.");
 const field=document.getElementById("saved-conversations-title");
 const result=add("conversation",{...item,title:trim(field?.value)});
 status("conversation",result.ok?"Conversation saved only on this device. / Conversación guardada en este dispositivo.":result.reason);
 if(result.ok)document.getElementById("saved-conversations").open=true;
 const faceStatus=document.getElementById("face-save-status");
 if(faceStatus&&faceOnly)faceStatus.textContent=result.ok?"💾 Saved / Guardada":result.reason;
}
function bind(options){
 if(callbacks)return;
 callbacks=options;
 document.getElementById("save-music-translation")?.addEventListener("click",saveSong);
 document.getElementById("save-conversation-now")?.addEventListener("click",()=>saveConversation(false));
 document.getElementById("save-face-conversation")?.addEventListener("click",()=>saveConversation(true));
 for(const kind of ["song","conversation"]){
  document.getElementById(ids(kind)+"-search")?.addEventListener("input",()=>draw(kind));
  for(const container of [ids(kind)+"-results",ids(kind)+"-trash-results"]){
   document.getElementById(container)?.addEventListener("click",event=>{
    const target=event.target.closest("[data-saved-action]");
    if(!target)return;
    const action=target.dataset.savedAction;
    const item=byId(target.dataset.savedId,action==="restore"||action==="purge");
    if(!item||item.kind!==kind)return;
    switch(action){
     case "open":
      if(callbacks[kind==="song"?"restoreSong":"restoreConversation"]?.(item)!==false){
       status(kind,"Opened without retranslating. / Abierto sin volver a traducir.");
      }else status(kind,"Finish current capture before opening saved text. / Termina la grabación primero.");
      break;
     case "copy":void copy(item);break;
     case "delete":
      status(kind,remove(item.id)
       ?"Moved to Trash. You can restore it. / En la papelera; puedes restaurarlo."
       :"Could not move to Trash. / No se pudo mover a la papelera.");
      break;
     case "restore":{
      const result=restoreTrash(item.id);
      status(kind,result.ok?"Restored from Trash. / Restaurado.":result.reason);
      break;
     }
     case "purge":
      if(typeof root.confirm!=="function"||!root.confirm(
       "PERMANENTLY delete this item? It cannot be recovered. / ¿BORRAR DEFINITIVAMENTE esta entrada? No se puede recuperar."
      ))return;
      status(kind,purge(item.id)
       ?"Permanently deleted. / Eliminada definitivamente."
       :"Unable to delete permanently. / No se pudo eliminar.");
      break;
    }
   });
  }
  draw(kind);
 }
 root.addEventListener?.("storage",event=>{
  if(event.key===KEY){state=null;for(const kind of ["song","conversation"])draw(kind);}
 });
}
const api={sanitize,read,list,add,remove,restoreTrash,purge,bind,format};
root.HablaSavedSessions=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
