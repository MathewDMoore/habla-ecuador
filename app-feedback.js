/* Private, explicit feedback sharing. No automatic transmission or dictionary edits. */
(function(root){
 'use strict';
 const KEY='habla-feedback-draft-v1';
 const PENDING_KEY='habla-feedback-pending-review-v1';
 const MAX_PENDING=40;
 const speakerRoles={unspecified:'Not specified',native:'Native speaker (self-reported)',other:'Other speaker or learner'};
 const topics={translation:'Translation',regional:'Regional meaning or usage',dictionary:'Dictionary entry',pronunciation:'Pronunciation or speaking practice',lesson:'Lesson or subtitles',interface:'App behavior or layout',other:'Something else'};
 const regions={'es-EC':'Ecuador','es-MX':'Mexico','es-VE':'Venezuela','es-BO':'Bolivia','es-PE':'Peru','es-CO':'Colombia','en-US':'U.S. English','en-GB':'U.K. English','en-CA':'Canadian English','en-AU':'Australian English','en-NZ':'New Zealand English','en-IE':'Irish English',"es-CU":"Cuban Spanish","es-AR":"Argentina \\u00b7 Spanish","es-CL":"Chile \\u00b7 Spanish","es-CR":"Costa Rica \\u00b7 Spanish","es-DO":"Dominican Republic / Rep\\u00fablica Dominicana \\u00b7 Spanish","es-SV":"El Salvador \\u00b7 Spanish","es-GT":"Guatemala \\u00b7 Spanish","es-HN":"Honduras \\u00b7 Spanish","es-NI":"Nicaragua \\u00b7 Spanish","es-PA":"Panama / Panam\\u00e1 \\u00b7 Spanish","es-PY":"Paraguay \\u00b7 Spanish","es-PR":"Puerto Rico \\u00b7 Spanish","es-ES":"Spain / Espa\\u00f1a \\u00b7 Spanish","es-UY":"Uruguay \\u00b7 Spanish","es-GQ":"Equatorial Guinea / Guinea Ecuatorial \\u00b7 Spanish",other:'Other / uncertain'};
 const languages={'es-EC':'Ecuadorian Spanish','es-MX':'Mexican Spanish','es-VE':'Venezuelan Spanish','es-BO':'Bolivian Spanish','es-PE':'Peruvian Spanish','es-CO':'Colombian Spanish','en-US':'U.S. English','en-GB':'U.K. English',"es-CU":"Cuban Spanish","es-AR":"Argentina \\u00b7 Spanish","es-CL":"Chile \\u00b7 Spanish","es-CR":"Costa Rica \\u00b7 Spanish","es-DO":"Dominican Republic / Rep\\u00fablica Dominicana \\u00b7 Spanish","es-SV":"El Salvador \\u00b7 Spanish","es-GT":"Guatemala \\u00b7 Spanish","es-HN":"Honduras \\u00b7 Spanish","es-NI":"Nicaragua \\u00b7 Spanish","es-PA":"Panama / Panam\\u00e1 \\u00b7 Spanish","es-PY":"Paraguay \\u00b7 Spanish","es-PR":"Puerto Rico \\u00b7 Spanish","es-ES":"Spain / Espa\\u00f1a \\u00b7 Spanish","es-UY":"Uruguay \\u00b7 Spanish","es-GQ":"Equatorial Guinea / Guinea Ecuatorial \\u00b7 Spanish"};
 const screens={'home-view':'Today','translator-view':'Translate','dictionary-view':'Dictionary','review-view':'Community usage review','music-view':'Music','lesson-view':'Practice'};
 const limits={city:100,reference:500,problem:4000,correction:2000,example:2000,reviewer:80};
 const clip=(v,n)=>typeof v==='string'?v.slice(0,n):'';
 function clean(value){
  const v=value&&typeof value==='object'?value:{},out={topic:Object.hasOwn(topics,v.topic)?v.topic:'other',region:Object.hasOwn(regions,v.region)?v.region:'other',
   speakerRole:Object.hasOwn(speakerRoles,v.speakerRole)?v.speakerRole:'unspecified'};
  for(const [k,n]of Object.entries(limits))out[k]=clip(v[k],n);
  const c=v.context&&typeof v.context==='object'?v.context:{};
  out.context={screen:Object.hasOwn(screens,c.screen)?c.screen:'home-view',version:clip(c.version,80),sourceLocale:Object.hasOwn(regions,c.sourceLocale)?c.sourceLocale:'',targetLocale:Object.hasOwn(regions,c.targetLocale)?c.targetLocale:''};
  out.includeText=v.includeText===true;
  out.source=out.includeText?clip(v.source,3000):'';out.translation=out.includeText?clip(v.translation,3000):'';
  return out;
 }
 function format(value,t=s=>s){
  const d=clean(value),line=(label,text)=>text?t(label)+': '+text:null;
  return [t('Habla Ecuador — feedback report'),t('PENDING RESEARCH REVIEW · not verified; self-report only; not added to lessons, translations or dictionary'),
   line('Topic',t(topics[d.topic])),line('Country / variety',t(regions[d.region])),line('City / area',d.city),line('Word, sentence or feature',d.reference),
   line('What seems wrong?',d.problem),line('Suggested correction',d.correction),line('Example or evidence',d.example),line('Speaker background',t(speakerRoles[d.speakerRole])),line('Name / initials',d.reviewer),
   line('Screen',t(screens[d.context.screen])),line('App version',d.context.version),line('From',t(languages[d.context.sourceLocale]||'')),line('To',t(languages[d.context.targetLocale]||'')),
   d.includeText?t('Text included with permission · up to 3000 characters per box'):t('Source and translation text not included.'),
   d.includeText?line('Source text',d.source):null,d.includeText?line('Translation draft',d.translation):null
  ].filter(Boolean).join('\n\n');
 }
 if(typeof module==='object'&&module.exports){module.exports={clean,format,topics,regions,speakerRoles};return;}
 function bind(){
  const dialog=document.getElementById('app-feedback'),form=document.getElementById('app-feedback-form');if(!dialog||!form)return;
  const el=id=>document.getElementById('feedback-'+id),ui=s=>root.HablaUI?root.HablaUI.t(s):s;
  let context={},source='',translation='',dirty=false,pending=false,opener=null,editingPendingId=null,items=[];
  function readPending(){
   try{
    const decoded=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');
    if(!Array.isArray(decoded))throw Error('Invalid saved queue');
    return decoded.slice(0,MAX_PENDING).filter(item=>item&&typeof item.id==='string')
      .map(item=>({id:clip(item.id,100),createdAt:clip(item.createdAt,32),report:clean(item.report)}));
   }catch{status('Pending flags could not be read. Your current report is still available.');return [];}
  }
  function persistPending(){
   try{localStorage.setItem(PENDING_KEY,JSON.stringify(items));return true;}
   catch{status('Unable to save pending flags on this device. Copy or share your report instead.');return false;}
  }
  function renderPending(){
   const list=el('pending-list'),count=el('pending-count');
   if(!list||!count)return;
   count.textContent=items.length+' pending on this device · not yet verified or submitted automatically';
   list.replaceChildren();
   for(const item of items){
    const row=document.createElement('div');row.className='feedback-pending-row';
    const description=document.createElement('p');
    description.textContent=(item.report.reference||topics[item.report.topic])+' · '+(regions[item.report.region]||'Unknown region')+' · Pending research review';
    const actions=document.createElement('div');actions.className='feedback-actions';
    const edit=document.createElement('button');edit.type='button';edit.textContent='Open / edit';
    edit.addEventListener('click',()=>{
     restore(item.report);editingPendingId=item.id;dirty=true;
     el('details').open=true;el('review').open=true;
     status('Pending report loaded. Edit it, then Save pending to update this device copy. Share separately for researcher review.');
    });
    const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove pending flag: '+(item.report.reference||topics[item.report.topic]));
    remove.addEventListener('click',()=>{
     const revised=items.filter(other=>other.id!==item.id);
     try{localStorage.setItem(PENDING_KEY,JSON.stringify(revised));items=revised;}
     catch{status('Could not remove the flag. Your pending list was kept.');return;}
     if(editingPendingId===item.id)editingPendingId=null;
     renderPending();status('Flag removed from this device. No app vocabulary was changed.');
    });
    actions.append(edit,remove);row.append(description,actions);list.append(row);
   }
  }
  const status=s=>{el('status').textContent=s;};
  const read=()=>clean(Object.assign(Object.fromEntries(Object.keys(limits).concat(['topic','region','speakerRole']).map(k=>[k,form.elements[k].value])),{context,source,translation,includeText:el('include-text').checked}));
  const preview=()=>{el('preview').value=format(read(),ui);};
  function restore(d){for(const k of Object.keys(limits).concat(['topic','region','speakerRole']))form.elements[k].value=d[k];context=d.context;source=d.source;translation=d.translation;el('include-text').checked=d.includeText;preview();}
  let loadError=false;
  try{const raw=localStorage.getItem(KEY);if(raw){const d=clean(JSON.parse(raw));restore(d);dirty=true;}}
  catch{loadError=true;}
  items=readPending();renderPending();
  function captureContext(){
   context={screen:document.querySelector('.view.active')?.id||'home-view',version:typeof APP_VERSION==='string'?APP_VERSION:'',sourceLocale:document.getElementById('source-language-select')?.value||'',targetLocale:document.getElementById('target-language-select')?.value||''};
  }
  function open(button){
   opener=button;
   const reference=button.dataset.feedbackReference||'';
   if(!dirty){
    captureContext();
    const current=context.screen==='dictionary-view'?document.getElementById('regional-slang-region')?.value:context.targetLocale.startsWith('es-')?context.targetLocale:context.sourceLocale;
    let city={monterrey:['es-MX','Monterrey, Nuevo León'],quito:['es-EC','Quito'],'mexico-city':['es-MX','Ciudad de México'],bogota:['es-CO','Bogotá']}[current];
    if(current==='es-VE'&&new URLSearchParams(location.search).get('city')==='caracas')city=['es-VE','Caracas'];
    form.elements.region.value=city?.[0]||(Object.hasOwn(regions,current)?current:'other');form.elements.city.value=city?.[1]||'';
    form.elements.topic.value=button.dataset.feedbackTopic||'other';form.elements.reference.value=reference;
    if(button.dataset.feedbackFlag==='true'){
     form.elements.problem.value='Please check this item for accuracy before updating Habla.';
     dirty=true;
     el('details').open=true;
    }
    if(reference)dirty=true;
    preview();status(loadError?'Saved feedback could not be read. Your form remains available.':'Choose Mathew in your messaging or email app. Nothing is sent automatically.');
   }else status(reference&&reference!==form.elements.reference.value?'Your current draft is kept. Clear it before reporting a different item.':'Your draft is kept. Review it before sharing.');
   if(!dialog.open){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-feedback-open]');if(button)open(button);});
  el('close').addEventListener('click',()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');opener?.focus();});
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('input',()=>{dirty=true;preview();});form.addEventListener('change',()=>{dirty=true;preview();});
  el('include-text').addEventListener('change',()=>{
   source=el('include-text').checked?(document.getElementById('translator-input')?.value||'').slice(0,3000):'';
   translation=el('include-text').checked?(document.getElementById('natural-result')?.textContent||'').slice(0,3000):'';
   if(el('include-text').checked)el('review').open=true;
   preview();
  });
  el('save').addEventListener('click',()=>{if(!form.reportValidity())return;try{localStorage.setItem(KEY,JSON.stringify(read()));status('Draft saved on this device. It has not been sent.');}catch{status('Not saved: device storage is unavailable. Your form is kept; you can still copy or share it.');}});
  el('mark-pending').addEventListener('click',()=>{
   if(!form.reportValidity())return;
   const report=read();
   const item={id:editingPendingId||String(Date.now())+'-'+Math.random().toString(36).slice(2,8),
     createdAt:new Date().toISOString(),report};
   const updated=editingPendingId?items.map(entry=>entry.id===editingPendingId?item:entry):[item,...items];
   if(updated.length>MAX_PENDING){status('40 pending flags are saved. Remove one before marking another.');return;}
   try{localStorage.setItem(PENDING_KEY,JSON.stringify(updated));items=updated;editingPendingId=item.id;}
   catch{status('Could not save this pending flag. Your draft remains available for copying or sharing.');return;}
   renderPending();el('pending').open=true;
   status('Flag marked pending on this device. It has NOT been sent or verified. Share the report explicitly for research-backed review.');
  });
  el('clear').addEventListener('click',()=>{if(pending)return;try{localStorage.removeItem(KEY);}catch{status('Could not clear the saved draft. Your form is kept.');return;}form.reset();source=translation='';dirty=false;editingPendingId=null;loadError=false;captureContext();preview();status('Draft cleared from this device.');});
  async function copy(text){
   try{await navigator.clipboard.writeText(text);status('Report copied. Paste it into a message to Mathew.');}
   catch{el('review').open=true;el('preview').focus();el('preview').select();status('Copy is unavailable. Select the report below and copy it with your device.');}
  }
  async function send(share){
   if(pending||!form.reportValidity())return;
   preview();const text=el('preview').value;pending=true;el('fields').disabled=true;
   for(const k of ['save','clear','copy','share'])el(k).disabled=true;
   try{
    if(share&&typeof navigator.share==='function'){
     try{await navigator.share({title:ui('Habla Ecuador — feedback report'),text});status('Share action completed. Habla cannot confirm delivery to Mathew. Your draft is kept.');}
     catch(error){if(error?.name==='AbortError')status('Sharing cancelled. Your draft is kept.');else await copy(text);}
    }else await copy(text);
   }finally{pending=false;el('fields').disabled=false;for(const k of ['save','clear','copy','share'])el(k).disabled=false;}
  }
  el('copy').addEventListener('click',()=>send(false));el('share').addEventListener('click',()=>send(true));
  document.addEventListener('habla-ui-language-change',preview);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})(typeof window==='object'?window:globalThis);
