/* Manually saved song translations and conversation sessions.
 * Stored only in this browser/device. No audio, media files, uploads or sync.
 * Existing everyday translation history and academic papers remain separate. */
(function(root){
'use strict';
const KEY='habla-ecuador-saved-sessions-v1',LIMIT=20,MAX_TEXT=36000,MAX_TURNS=100,MAX_PASSAGES=40;
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
  source,translation,
  sourceLanguage:clamp(item.sourceLanguage,12),targetLanguage:clamp(item.targetLanguage,12),
  turns,passages
 };
}
function read(store=root.localStorage){
 try{
  const data=JSON.parse(store?.getItem(KEY)||'null');
  if(!data||data.version!==1||!Array.isArray(data.items))return [];
  return data.items.map(sanitize).filter(Boolean).slice(0,LIMIT);
 }catch{return [];}
}
function write(items,store=root.localStorage){
 try{
  if(!store)return false;
  store.setItem(KEY,JSON.stringify({version:1,items:items.slice(0,LIMIT)}));
  return true;
 }catch{return false;}
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
let records=read(),binds={},ui={};
function status(kind,message){
 if(ui[kind]?.status)ui[kind].status.textContent=message;
}
function save(kind,value,title='',artist=''){
 const candidate=sanitize({...value,kind,title,artist,date:new Date().toISOString()});
 if(!candidate)return {ok:false,error:kind==='music'
  ?'No hay letra capturada para guardar. / No captured song text to save.'
  :'No hay turnos para guardar. / No conversation turns to save.'};
 candidate.id='s'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
 const next=[candidate,...records].slice(0,LIMIT);
 if(!write(next))return {ok:false,error:'Device storage is unavailable or full. / Almacenamiento no disponible o lleno.'};
 records=next;
 refresh();
 return {ok:true,item:candidate};
}
function remove(id){
 const next=records.filter(r=>r.id!==id);
 if(next.length===records.length)return false;
 if(!write(next))return false;
 records=next;refresh();return true;
}
function refresh(){
 for(const kind of TYPES){
  const parts=ui[kind];if(!parts)continue;
  const found=search(records,kind,parts.query.value);
  parts.count.textContent=String(records.filter(r=>r.kind===kind).length);
  parts.list.replaceChildren();
  if(!found.length){parts.list.append(make('p','saved-sessions-empty',
   parts.query.value?'No results / Sin resultados':'Nothing saved here yet / Todavía no hay sesiones guardadas'));continue;}
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
   for(const [text,action] of [['Abrir / Open','open'],['Copiar / Copy','copy'],['Borrar / Delete','delete']]){
    const button=make('button','',text);
    button.type='button';button.dataset.savedAction=action;button.dataset.savedId=item.id;
    controls.append(button);
   }
   card.append(heading,time,excerpt,controls);parts.list.append(card);
  }
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
  'Manual save only. Text and translation stay in this browser/device; no recording, upload, sync or automatic saving. Clearing site data can erase entries. / Guardado manual, sin audio ni sincronización. Borrar datos del sitio puede eliminarlo.');
 details.append(summary,filterLabel,note,list);
 outer.append(row,save,feedback,details);host.append(outer);
 ui[kind]={outer,title,artist,save,status:feedback,details,query,list,count};
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
  const item=records.find(x=>x.id===button.dataset.savedId&&x.kind===kind);if(!item)return;
  if(button.dataset.savedAction==='delete'){
   // A visible deletion step prevents a stray tap from destroying a conversation.
   if(button.dataset.confirm!=='yes'){
    button.dataset.confirm='yes';button.textContent='Confirmar borrado / Confirm delete';return;
   }
   if(remove(item.id))status(kind,'Entry deleted / Entrada borrada.');
   else status(kind,'Could not delete / No se pudo borrar.');
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
}
function saveSession(kind,data,title='',artist=''){
 if(!data)return {ok:false,error:'Nothing ready to save / Nada para guardar.'};
 return save(kind,data,title,artist);
}
function bind({getMusic,getConversation,openMusic,openConversation}={}){
 mount('music',{getCurrent:getMusic,open:openMusic});
 mount('conversation',{getCurrent:getConversation,open:openConversation});
 refresh();
}
root.HablaSavedSessions={read,write,search,sanitize,saveSession,exportText,bind,remove,refresh};
if(typeof module!=='undefined'&&module.exports)module.exports=root.HablaSavedSessions;
})(typeof window!=='undefined'?window:globalThis);
