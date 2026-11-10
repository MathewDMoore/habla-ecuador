/* Photo OCR geometry stays local; translation follows the selected app route. */
const HablaPhotoTranslation=(()=>{
 'use strict';
 let dialog,stage,image,layer,status,toggle,copy,reopen,detail,translate,getRoute;
 let session=null,generation=0,original=false;
 const routeKey=route=>JSON.stringify([route.source,route.target,route.onDevice]);
 function current(token,route){return generation===token&&session&&routeKey(getRoute())===routeKey(route);}
 function paint(){
  layer.replaceChildren();
  if(!session)return;
  const width=stage.clientWidth,height=image.clientHeight;
  for(const [index,region] of session.regions.entries()){
   const label=document.createElement('button');label.type='button';label.className='photo-translation-label';
   label.style.left=region.x*100+'%';label.style.top=region.y*100+'%';
   label.style.width=region.width*100+'%';label.style.height=region.height*100+'%';
   const text=region.translation||region.text;
   const lines=Math.max(1,Math.ceil(text.length/Math.max(1,region.width*width/7)));
   label.style.fontSize=Math.min(20,Math.max(10,region.height*height/lines/1.2))+'px';
   label.textContent=text;label.dataset.ready=String(Boolean(region.translation));
   label.setAttribute('aria-label',`${index+1}. ${region.text} → ${region.translation||'…'}`);
   label.addEventListener('click',()=>{detail.textContent=region.text+'\n\n'+(region.translation||'Translation pending / Traducción pendiente');});
   layer.append(label);
  }
  layer.hidden=original;
 }
 async function run(){
  if(!session||!dialog.open)return;
  const token=++generation,route={...getRoute()};
  if(session.route!==routeKey(route)){
   session.route=routeKey(route);session.regions.forEach(region=>{delete region.translation;});
   session.fallback='';detail.textContent='';
  }
  original=false;toggle.setAttribute('aria-pressed','false');paint();copy.disabled=true;
  if(session.regions.length>40||(!session.regions.length&&session.text.length>8000)){
   status.textContent='This photo has too much text for an overlay. Close to use the full text translator. / Cierra para traducir el texto completo.';return;
  }
  const items=session.regions.length?session.regions:[{text:session.text}];
  let failed=0;
  for(const [index,item] of items.entries()){
   if(!current(token,route))return;
   status.textContent=`Translating photo / Traduciendo foto… ${index+1}/${items.length}`;
   try{
    if(!item.translation)item.translation=await translate(item.text,{...route,isCurrent:()=>current(token,route)});
    if(!current(token,route))return;
    if(!String(item.translation||'').trim())throw new Error('Empty translation');
    if(!session.regions.length)session.fallback=item.translation;
   }catch{if(!current(token,route))return;failed++;delete item.translation;}
   paint();
  }
  if(!current(token,route))return;
  copy.disabled=Boolean(failed)||!items.every(item=>item.translation);
  if(failed)status.textContent='Some text could not be translated. Tap Retry; untranslated areas still show the original. / Reintenta: algunas áreas siguen en el idioma original.';
  else if(!session.regions.length){
   status.textContent='Text translated; image positions were unavailable. / Texto traducido; posiciones no disponibles.';
   detail.textContent=session.text+'\n\n'+session.fallback;
  }else status.textContent='Photo translated. Tap a label to read it fully. / Toca una etiqueta para leerla completa.';
 }
 function bind(options){
  translate=options.translate;getRoute=options.getRoute;
  reopen=document.querySelector('#quick-photo-overlay');if(!reopen)return;
  dialog=document.createElement('dialog');dialog.id='photo-translator';dialog.className='photo-translator';
  dialog.setAttribute('aria-labelledby','photo-translator-title');
  dialog.innerHTML=`<div class="photo-translator-toolbar"><h2 id="photo-translator-title">Photo translation / Traducción de foto</h2><button type="button" data-photo-close>Close / Cerrar</button></div>
   <div class="photo-translator-controls"><button type="button" data-photo-original aria-pressed="false">Show original / Ver original</button><button type="button" data-photo-retry>Retry / Reintentar</button><button type="button" data-photo-copy disabled>Copy translation / Copiar</button><button type="button" data-photo-edit>Edit text / Editar texto</button></div>
   <p class="photo-translator-note">Uses your From → To languages. Check recognized words. Online mode sends text for translation. / Usa tus idiomas de origen y destino; revisa el texto reconocido.</p>
   <p data-photo-status role="status" aria-live="polite"></p><div class="photo-translator-stage"><img alt="Your photo / Tu foto"><div class="photo-translator-labels"></div></div>
   <p data-photo-detail class="photo-translator-detail" aria-live="polite"></p>`;
  document.body.append(dialog);
  stage=dialog.querySelector('.photo-translator-stage');image=stage.querySelector('img');layer=stage.querySelector('div');
  status=dialog.querySelector('[data-photo-status]');detail=dialog.querySelector('[data-photo-detail]');
  toggle=dialog.querySelector('[data-photo-original]');copy=dialog.querySelector('[data-photo-copy]');
  image.addEventListener('load',paint);new ResizeObserver(paint).observe(stage);
  const close=()=>{generation++;dialog.close();};
  dialog.querySelector('[data-photo-close]').addEventListener('click',close);
  dialog.addEventListener('cancel',()=>{generation++;});
  dialog.addEventListener('close',()=>{generation++;});
  toggle.addEventListener('click',()=>{original=!original;toggle.setAttribute('aria-pressed',String(original));paint();});
  dialog.querySelector('[data-photo-retry]').addEventListener('click',run);
  dialog.querySelector('[data-photo-edit]').addEventListener('click',()=>{close();document.querySelector('#translator-input')?.focus();});
  copy.addEventListener('click',async()=>{
   const text=session.regions.length?session.regions.map(region=>region.translation).join('\n\n'):session.fallback;
   try{
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
    else {const field=document.createElement('textarea');field.value=text;dialog.append(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw new Error('Copy unavailable');}
    status.textContent='Translation copied / Traducción copiada';
   }catch{detail.textContent=text;status.textContent='Select the text below to copy. / Selecciona el texto de abajo para copiar.';}
  });
  reopen.addEventListener('click',()=>{if(session){dialog.showModal();run();}});
  document.querySelector('#translator-input')?.addEventListener('input',clear);
 }
 function clear(){
  generation++;if(dialog?.open)dialog.close();
  if(session)URL.revokeObjectURL(session.url);session=null;
  if(reopen)reopen.hidden=true;
  if(image)image.removeAttribute('src');if(layer)layer.replaceChildren();if(detail)detail.textContent='';
 }
 function open(file,result){
  if(!dialog)return;
  clear();session={url:URL.createObjectURL(file),text:result.text,regions:(result.regions||[]).map(region=>({...region}))};
  image.src=session.url;reopen.hidden=false;dialog.showModal();run();
 }
 return {bind,open,clear};
})();
