/* Manually saved song translations and conversation sessions.
 * Stored only in this browser/device. No audio, media files, uploads or sync.
 * Existing everyday translation history and academic papers remain separate. */
(function(root){
'use strict';
const KEY='habla-ecuador-saved-sessions-v1',LIMIT=20,TRASH_LIMIT=40,MAX_TEXT=36000,MAX_TURNS=100,MAX_PASSAGES=40;
const TYPES=['music','conversation'];
const $=selector=>typeof document!=='undefined'?document.querySelector(selector):null;
const norm=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
function clamp(text,max=MAX_TEXT){return typeof text==='string'?text.slice(0,max):'';}
function sanitize(item){
 if(!item||!TYPES.includes(item.kind))return null;
 const source=clamp(item.source),translation=clamp(item.translation);
 const turns=Array.isArray(item.turns)?item.turns.slice(0,MAX_TURNS).map(turn=>{
  if(!turn||typeof turn!=='object')return null;
  return {
   speaker:clamp(turn.speaker,90),source:clamp(turn.source,2400),
   translation:clamp(turn.translation,3600),sourceLocale:clamp(turn.sourceLocale,12),
   target:clamp(turn.target,12),slot:clamp(turn.slot,12),role:clamp(turn.role,12),
   languageLabel:clamp(turn.languageLabel,100),faceToFace:Boolean(turn.faceToFace),
   failed:Boolean(turn.failed),languageUncertain:Boolean(turn.languageUncertain)
  };
 }).filter(t=>t&&t.source.trim()):[];
 const passages=Array.isArray(item.passages)?item.passages.slice(0,MAX_PASSAGES).map(p=>{
  if(!p||typeof p!=='object')return null;
  return {
   source:clamp(p.source,2000),draft:clamp(p.draft,4000),
   language:clamp(p.language,12),target:clamp(p.target,12)
  };
 }).filter(p=>p&&p.source.trim()):[];
 if(item.kind==='music'&&!source.trim()&&!passages.length)return null;
 if(item.kind==='conversation'&&!turns.length)return null;
 return {
  id:typeof item.id==='string'&&item.id.length<80?item.id:'',
  kind:item.kind,
  title:clamp(item.title,100).trim(),
  artist:clamp(item.artist,120).trim(),
  date:typeof item.date==='string'&&!Number.isNaN(Date.parse(item.date))?item.date:new Date().toISOString(),
  deletedAt:typeof item.deletedAt==='string'&&!Number.isNaN(Date.parse(item.deletedAt))?item.deletedAt:'',
  source,translation,
  sourceLanguage:clamp(item.sourceLanguage,12),targetLanguage:clamp(item.targetLanguage,12),
  turns,passages
 };
}
function readState(store=root.localStorage){
 try{
  const data=JSON.parse(store?.getItem(KEY)||'null');
  if(!data||data.version!==1||!Array.isArray(data.items))return {items:[],trash:[]};
  return {
   items:data.items.map(sanitize).filter(Boolean),
   trash:Array.isArray(data.trash)?data.trash.map(sanitize).filter(Boolean):[]
  };
 }catch{return {items:[],trash:[]};}
}
function read(store=root.localStorage){return readState(store).items;}
function writeState(next,store=root.localStorage){
 try{
  if(!store||next.items.length>LIMIT||next.trash.length>TRASH_LIMIT)return false;
  store.setItem(KEY,JSON.stringify({version:1,items:next.items,trash:next.trash}));
  return true;
 }catch{return false;}
}
function write(items,store=root.localStorage){
 // Preserve the existing trash if a caller uses the legacy write API.
 return writeState({items,trash:readState(store).trash},store);
}
function search(items,kind,query=''){
 const q=norm(query.trim());
 return items.filter(item=>item.kind===kind&&(!q||norm([
  item.title,item.artist,item.source,item.translation,
  ...item.turns.flatMap(turn=>[turn.speaker,turn.source,turn.translation]),
  ...item.passages.flatMap(p=>[p.source,p.draft])
 ].join(' ')).includes(q)));
}
function label(item){
 if(item.title)return item.title;
 return item.kind==='music'?'Canción guardada / Saved song':'Conversación guardada / Saved conversation';
}
function exportText(item){
 const head=[label(item),item.artist&&'Artist / Artista: '+item.artist,item.date].filter(Boolean).join('\n');
 if(item.kind==='music'){
  const passes=item.passages.map((p,i)=>'\n'+(i+1)+'. '+p.source+'\n'+p.draft).join('\n');
  return head+'\n\nOriginal / Fuente:\n'+item.source+'\n\nTranslation / Traducción:\n'+item.translation+
   (passes?'\n\nReviewed passages / Pasajes revisados:\n'+passes:'');
 }
 return head+'\n\n'+item.turns.map(turn=>
  (turn.speaker||'Speaker')+' ('+(turn.sourceLocale||'')+' → '+(turn.target||'')+'):\n'+
  turn.source+'\n'+(turn.failed?'[Translation unavailable]':turn.translation)).join('\n\n');
}
function make(tag,cls,text){
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined)el.textContent=text;
 return el;
}
const config={
 music:{host:'#music-save-host',heading:'🎶 Canciones guardadas / Saved songs',
  action:'💾 Guardar canción / Save song',label:'Título / Title (optional)',
  fallback:'Canción sin título / Untitled song'},
 conversation:{host:'#conversation-save-host',heading:'💬 Conversaciones guardadas / Saved conversations',
  action:'💾 Guardar conversación / Save conversation',label:'Nombre / Title (optional)',
  fallback:'Conversación / Conversation'}
};
let state=readState(),binds={},ui={},lastSaved={};
function status(kind,message){
 if(ui[kind]?.status)ui[kind].status.textContent=message;
}
function commit(next){
 if(!writeState(next))return false;
 state=next;refresh();return true;
}
function save(kind,value,title='',artist=''){
 const candidate=sanitize({...value,kind,title,artist,date:new Date().toISOString()});
 if(!candidate)return {ok:false,error:kind==='music'
  ?'No hay letra capturada para guardar. / No captured song text to save.'
  :'No hay turnos para guardar. / No conversation turns to save.'};
 // Do not silently evict an older saved conversation or song.
 if(state.items.length>=LIMIT)return {ok:false,
  error:'20 saved sessions reached. Move an old entry to Trash first. / Límite de 20 sesiones. Mueve una a la Papelera para continuar.'};
 candidate.id='s'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
 if(!commit({items:[candidate,...state.items],trash:state.trash}))
  return {ok:false,error:'Device storage is unavailable or full. / Almacenamiento no disponible o lleno.'};
 return {ok:true,item:candidate};
}
function remove(id){
 const item=state.items.find(row=>row.id===id);
 if(!item||state.trash.length>=TRASH_LIMIT)return false;
 return commit({items:state.items.filter(row=>row.id!==id),
  trash:[{...item,deletedAt:new Date().toISOString()},...state.trash]});
}
function restoreDeleted(id){
 const item=state.trash.find(row=>row.id===id);
 if(!item||state.items.length>=LIMIT)return false;
 const {deletedAt,...restored}=item;
 return commit({items:[restored,...state.items],
  trash:state.trash.filter(row=>row.id!==id)});
}
function permanentlyDelete(id){
 if(!state.trash.some(item=>item.id===id))return false;
 return commit({items:state.items,trash:state.trash.filter(row=>row.id!==id)});
}
function refresh(){
 for(const kind of TYPES){
  const parts=ui[kind];if(!parts)continue;
  const found=search(state.items,kind,parts.query.value);
  parts.count.textContent=String(state.items.filter(r=>r.kind===kind).length);
  parts.list.replaceChildren();
  if(!found.length)parts.list.append(make('p','saved-sessions-empty',
   parts.query.value?'No results / Sin resultados':'Nothing saved here yet / Todavía no hay sesiones guardadas'));
  for(const item of found){
   const card=make('article','saved-session-entry');
   const heading=make('strong','saved-session-title',label(item));
   const time=make('time','saved-session-date',
    new Date(item.date).toLocaleString());
   time.dateTime=item.date;
   const excerpt=make('p','saved-session-excerpt',item.kind==='music'
    ?(item.artist?'🎤 '+item.artist+' · ':'')+(item.source||item.passages[0]?.source||'')
    :(item.turns[0]?.speaker||'')+': '+(item.turns[0]?.source||''));
   const controls=make('div','saved-session-actions');
   for(const [text,action] of [['Abrir / Open','open'],['Copiar / Copy','copy'],['Papelera / Trash','delete']]){
    const button=make('button','',text);
    button.type='button';button.dataset.savedAction=action;button.dataset.savedId=item.id;
    controls.append(button);
   }
   card.append(heading,time,excerpt,controls);parts.list.append(card);
  }
  parts.trashCount.textContent=String(state.trash.filter(r=>r.kind===kind).length);
  parts.trashList.replaceChildren();
  for(const item of search(state.trash,kind,parts.query.value)){
   const card=make('article','saved-session-entry saved-session-deleted');
   card.append(make('strong','saved-session-title',label(item)),
    make('p','saved-session-date','En Papelera desde / In Trash since: '+
      (item.deletedAt?new Date(item.deletedAt).toLocaleString():'unknown')));
   const controls=make('div','saved-session-actions');
   for(const [text,action] of [['Recuperar / Restore','restore'],['Eliminar definitivamente / Delete forever','permanent']]){
    const button=make('button','',text);button.type='button';
    button.dataset.savedAction=action;button.dataset.savedId=item.id;
    controls.append(button);
   }
   card.append(controls);parts.trashList.append(card);
  }
  if(!parts.trashList.children.length)
   parts.trashList.append(make('p','saved-sessions-empty','Papelera vacía / Trash empty'));
 }
}
function mount(kind,options){
 const conf=config[kind],host=$(conf.host);
 if(!host||ui[kind])return;
 const outer=make('section','saved-session-tools'),row=make('div','saved-session-save-row');
 const title=make('input','saved-session-name'),nameLabel=make('label','saved-session-name-label',conf.label);
 title.type='text';title.maxLength=100;title.placeholder=conf.fallback;
 nameLabel.append(title);
 row.append(nameLabel);
 let artist;
 if(kind==='music'){
  artist=make('input','saved-session-artist');artist.type='text';artist.maxLength=120;
  artist.placeholder='If known / Si lo sabes';
  const artistLabel=make('label','saved-session-name-label','Artista / Artist (optional)');
  artistLabel.append(artist);row.append(artistLabel);
 }
 const save=make('button','saved-session-save',conf.action);save.type='button';
 const feedback=make('p','saved-session-status');feedback.setAttribute('role','status');
 const details=make('details','saved-sessions-list'),
  summary=make('summary','','🕘 '+conf.heading+' ');
 const count=make('span','saved-session-count','0');summary.append(count);
 const filterLabel=make('label','saved-session-query-label','Buscar / Search');
 const query=make('input','saved-session-query');query.type='search';query.autocomplete='off';
 query.placeholder='Search names, lyrics, translations / Buscar palabras y nombres';
 filterLabel.append(query);
 const list=make('div','saved-session-list');
 const note=make('p','saved-session-privacy',
  'Manual save only. Stored text stays on this device; no audio, uploads or sync. Trash can restore deleted entries, but clearing app/site data may erase everything. / Guardado manual, sin audio ni sincronización. La Papelera permite recuperar entradas; borrar datos de la app puede eliminarlas.');
 const trashPanel=make('details','saved-session-trash');
 const trashHeading=make('summary','','🗑️ Papelera / Trash ');
 const trashCount=make('span','saved-session-count','0');trashHeading.append(trashCount);
 const trashList=make('div','saved-session-trash-list');
 trashPanel.append(trashHeading,trashList);
 details.append(summary,filterLabel,note,list,trashPanel);
 outer.append(row,save,feedback,details);host.append(outer);
 ui[kind]={outer,title,artist,save,status:feedback,details,query,list,count,trashPanel,trashList,trashCount};
 binds[kind]=options;
 save.addEventListener('click',()=>{
  const data=options.getCurrent?.();
  const result=saveSession(kind,data,title.value,artist?.value||'');
  if(result.ok){
   status(kind,'Saved on this device / Guardado en este dispositivo.');
   details.open=true;
  }else status(kind,result.error);
 });
 query.addEventListener('input',refresh);
 list.addEventListener('click',event=>{
  const button=event.target.closest('[data-saved-action]');if(!button)return;
  const item=state.items.find(x=>x.id===button.dataset.savedId&&x.kind===kind);if(!item)return;
  if(button.dataset.savedAction==='delete'){
   if(remove(item.id))status(kind,'Moved to Trash. You can restore it. / En la Papelera; puedes recuperarla.');
   else status(kind,'Trash is full or storage failed; no entry was removed. / Papelera llena o error; no se ha borrado nada.');
  }else if(button.dataset.savedAction==='copy'){
   try{
    const value=exportText(item);
    const promise=root.navigator?.clipboard?.writeText(value);
    if(promise?.then)promise.then(
      ()=>status(kind,'Copied / Copiado'),
      ()=>status(kind,'Copy blocked; open the entry to select the text / Copia bloqueada'));
    else status(kind,'Copy unavailable / Copia no disponible.');
   }catch{status(kind,'Copy unavailable / Copia no disponible.');}
  }else if(button.dataset.savedAction==='open'){
   const ok=options.open?.(item);
   if(ok!==false)status(kind,'Restored without retranslating / Recuperado sin volver a traducir.');
  }
 });
 trashList.addEventListener('click',event=>{
  const button=event.target.closest('[data-saved-action]');if(!button)return;
  const item=state.trash.find(x=>x.id===button.dataset.savedId&&x.kind===kind);if(!item)return;
  if(button.dataset.savedAction==='restore'){
   if(restoreDeleted(item.id))status(kind,'Restored from Trash / Recuperado de la Papelera.');
   else status(kind,'Saved library is full or device storage failed. Item stays in Trash. / La biblioteca está llena; sigue en la Papelera.');
  }else if(button.dataset.savedAction==='permanent'){
   if(button.dataset.confirm!=='yes'){
    button.dataset.confirm='yes';
    button.textContent='Confirmar eliminación definitiva / Confirm permanent delete';
    status(kind,'This action cannot be undone. / Esta acción no se puede deshacer.');
    return;
   }
   if(permanentlyDelete(item.id))status(kind,'Permanently deleted / Eliminado definitivamente.');
   else status(kind,'Could not delete / No se pudo eliminar.');
  }
 });
}
function saveSession(kind,data,title='',artist=''){
 if(!data)return {ok:false,error:'Nothing ready to save / Nada para guardar.'};
 const result=save(kind,data,title,artist);
 if(result.ok)lastSaved[kind]=JSON.stringify(data);
 return result;
}
function trashDraft(kind,data,title='',artist=''){
 const candidate=sanitize({...data,kind,title,artist,
   date:new Date().toISOString(),deletedAt:new Date().toISOString()});
 if(!candidate)return false;
 if(state.trash.length>=TRASH_LIMIT)return false;
 candidate.id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
 return commit({items:state.items,trash:[candidate,...state.trash]});
}
// Called only when someone explicitly chooses New song or Clear conversation.
// The user gets three reversible choices. It never runs on page unload
// or on simply changing tabs.
function askBeforeClear(kind,proceed){
 const options=binds[kind],part=ui[kind];
 if(!options||!part||typeof proceed!=='function')return true;
 const snapshot=options.getCurrent?.();
 if(!snapshot||JSON.stringify(snapshot)===lastSaved[kind])return true;
 if(part.prompt){part.prompt.remove();part.prompt=null;}
 const panel=make('section','saved-session-decision');
 panel.setAttribute('role','group');
 panel.setAttribute('aria-label','Guardar o descartar / Save or discard');
 panel.append(make('p','saved-session-decision-title',kind==='music'
  ?'¿Guardar la canción antes de empezar otra? / Save this song before starting another?'
  :'¿Guardar la conversación antes de borrarla? / Save this conversation before clearing?'));
 const actions=make('div','saved-session-actions');
 for(const [label,action] of [
   ['💾 Guardar / Save','save'],
   ['🗑️ A Papelera / Trash (recuperable)','trash'],
   ['Cancelar / Cancel','cancel']
 ]){
  const control=make('button','saved-session-decision-button',label);
  control.type='button';control.dataset.decision=action;actions.append(control);
 }
 panel.append(actions);
 part.save.after(panel);part.prompt=panel;
 panel.addEventListener('click',event=>{
  const button=event.target.closest('[data-decision]');if(!button)return;
  const action=button.dataset.decision;
  if(action==='cancel'){panel.remove();part.prompt=null;return;}
  const current=options.getCurrent?.();
  if(!current){status(kind,'Capture is still in progress; finish first. / Termina la captura primero.');return;}
  let ok=false;
  if(action==='save'){
   const result=saveSession(kind,current,part.title.value,part.artist?.value||'');
   ok=result.ok;
   if(!ok)status(kind,result.error);
  }else if(action==='trash'){
   ok=trashDraft(kind,current,part.title.value,part.artist?.value||'');
   if(!ok)status(kind,'Trash is full or storage unavailable. Nothing was discarded. / Papelera llena o error; no se descartó nada.');
  }
  if(!ok)return;
  panel.remove();part.prompt=null;
  proceed();
 });
 panel.scrollIntoView?.({block:'nearest',behavior:'smooth'});
 return false;
}
function bind({getMusic,getConversation,openMusic,openConversation}={}){
 mount('music',{getCurrent:getMusic,open:openMusic});
 mount('conversation',{getCurrent:getConversation,open:openConversation});
 refresh();
}
root.HablaSavedSessions={read,readState,write,writeState,search,sanitize,saveSession,exportText,bind,remove,restoreDeleted,permanentlyDelete,refresh,askBeforeClear,trashDraft};
if(typeof module!=='undefined'&&module.exports)module.exports=root.HablaSavedSessions;
})(typeof window!=='undefined'?window:globalThis);
