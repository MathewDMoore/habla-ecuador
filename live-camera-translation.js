/* A continuous camera preview with local, serial OCR and text-only translation. */
const HablaLiveCamera=(()=>{
 'use strict';
 let dialog,video,stage,layer,status,detail,freeze,original,copy,use,retry;
 let options,session=null,sequence=0,showOriginal=false;
 const key=route=>JSON.stringify([route.source,route.target,route.onDevice]);
 const valid=s=>session===s&&s.active;
 const sameRoute=s=>valid(s)&&key(options.getRoute())===key(s.route);
 function report(message){status.textContent=message;}
 function paint(){
  layer.hidden=showOriginal;layer.replaceChildren();
  const s=session;if(!s)return;
  if(video.videoWidth&&video.videoHeight){
   stage.style.width=Math.min(dialog.clientWidth-28,innerHeight*.52*video.videoWidth/video.videoHeight)+'px';
  }
  for(const region of s.regions){
   const text=s.cache.get(region.text);if(!text)continue;
   const label=document.createElement('button');label.type='button';label.className='photo-translation-label';
   Object.assign(label.style,{left:region.x*100+'%',top:region.y*100+'%',width:region.width*100+'%',height:region.height*100+'%',fontSize:'20px'});
   label.textContent=text;label.dataset.ready='true';label.setAttribute('aria-label',region.text+' → '+text);
   label.addEventListener('click',()=>{detail.textContent=region.text+'\n\n'+text;});layer.append(label);
   if(!showOriginal){let size=20;while(size>10&&(label.scrollHeight>label.clientHeight+1||label.scrollWidth>label.clientWidth+1))label.style.fontSize=--size+'px';}
  }
  copy.disabled=!s.regions.length||s.regions.some(region=>!s.cache.get(region.text));
  use.disabled=!s.text;
 }
 function stop(){
  const s=session;session=null;if(!s)return;
  s.active=false;clearTimeout(s.timer);clearInterval(s.motionTimer);s.controller.abort();
  s.stream?.getTracks().forEach(track=>track.stop());
  s.reader?.close().catch(()=>{});video.pause();video.srcObject=null;
  layer.replaceChildren();copy.disabled=true;use.disabled=true;
 }
 function close(){stop();if(dialog.open)dialog.close();}
 function motionSample(s){
  if(!valid(s)||s.frozen||video.readyState<2)return;
  const ctx=s.motionCanvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(video,0,0,32,24);const pixels=ctx.getImageData(0,0,32,24).data;
  if(s.pixels){let delta=0;for(let i=0;i<pixels.length;i+=4)delta+=Math.abs(pixels[i]-s.pixels[i])+Math.abs(pixels[i+1]-s.pixels[i+1])+Math.abs(pixels[i+2]-s.pixels[i+2]);
   if(delta/(32*24*3)>12){s.motion++;s.regions=[];s.text='';s.seen.clear();paint();report('Hold steady while text updates. / Mantén la cámara estable.');}}
  s.pixels=new Uint8ClampedArray(pixels);
 }
 async function translateVisible(s){
  if(s.translating)return;s.translating=true;
  try{
   while(sameRoute(s)){
    const region=s.regions.find(r=>(s.seen.get(r.text)||0)>=2&&!s.cache.has(r.text)&&!s.failed.has(r.text));
    if(!region)break;
    try{
     const text=String(await options.translate(region.text,{...s.route,isCurrent:()=>sameRoute(s)})).trim();
     if(!sameRoute(s))return;if(!text)throw new Error('Empty translation');
     s.cache.set(region.text,text);if(s.cache.size>120)s.cache.delete(s.cache.keys().next().value);
    }catch{if(!sameRoute(s))return;s.failed.add(region.text);}
    paint();
   }
   if(sameRoute(s)&&s.regions.length){
    const count=s.regions.filter(r=>s.cache.has(r.text)).length;
    report(s.regions.some(r=>s.failed.has(r.text))?'Some words could not be translated. Tap Retry. / Reintenta la traducción.'
     :count===s.regions.length?(s.frozen?'Frozen translation / Traducción congelada':'Live translation · point at other text / Traducción en vivo')
     :'Reading and translating… Hold steady. / Leyendo y traduciendo…');
   }
  }finally{s.translating=false;}
 }
 async function scan(s,force=false){
  if(!valid(s)||!s.reader)return;
  if(!sameRoute(s)){report('Languages changed. Close and reopen Live camera. / Reabre Cámara en vivo.');return;}
  if(s.scanning){s.scanAgain=s.scanAgain||force;return;}
  if(s.frozen&&!force)return;
  s.scanning=true;
  try{
   if(video.readyState<2||!video.videoWidth)return;
   const factor=Math.min(1,1500/Math.max(video.videoWidth,video.videoHeight));
   const frame=document.createElement('canvas');frame.width=Math.round(video.videoWidth*factor);frame.height=Math.round(video.videoHeight*factor);
   frame.getContext('2d').drawImage(video,0,0,frame.width,frame.height);
   const motion=s.motion,revision=s.revision;
   const result=await s.reader.recognize(frame);
   if(!sameRoute(s)||motion!==s.motion||revision!==s.revision)return;
   const regions=(result.regions||[]).filter(r=>r.text.length<=2000).slice(0,16);
   const previous=s.seen;s.seen=new Map(regions.map(r=>[r.text,s.frozen?2:Math.min(2,(previous.get(r.text)||0)+1)]));
   s.regions=regions;s.text=String(result.text||'').trim().slice(0,20000);
   paint();
   if(!regions.length)report(s.text?'Text found without positions. Use text to review it. / Usa el texto para revisarlo.':'Point at clear text. / Apunta a un texto claro.');
   else {report('Reading and translating… Hold steady. / Leyendo y traduciendo…');translateVisible(s);}
  }catch(error){if(valid(s)&&!s.controller.signal.aborted)report('Text could not be read. Hold steady or tap Retry. / Mantén la cámara estable o reintenta.');}
  finally{
   s.scanning=false;
   if(valid(s)){const again=s.scanAgain;s.scanAgain=false;clearTimeout(s.timer);if(again||!s.frozen)s.timer=setTimeout(()=>scan(s,again),again?0:650);}
  }
 }
 async function start(){
  stop();if(!dialog.open)dialog.showModal();
  showOriginal=false;original.setAttribute('aria-pressed','false');freeze.textContent='Freeze / Congelar';freeze.disabled=true;retry.disabled=true;detail.textContent='';
  const s={id:++sequence,active:true,route:{...options.getRoute()},controller:new AbortController(),regions:[],text:'',seen:new Map(),cache:new Map(),failed:new Set(),motion:0,revision:0,frozen:false};session=s;
  report('Opening rear camera… / Abriendo cámara trasera…');
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');
   s.guard=options.begin();
   const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
   if(!valid(s)){stream.getTracks().forEach(track=>track.stop());return;}
   s.stream=stream;video.srcObject=stream;video.muted=true;await video.play();if(!valid(s))return;
   for(const track of stream.getVideoTracks())track.addEventListener('ended',()=>{if(valid(s)){stop();report('Camera stopped. Tap Retry to reopen. / Reintenta para abrir la cámara.');retry.disabled=false;}});
   paint();report('Camera live. Loading text reader… / Cámara en vivo. Preparando lector…');
   s.reader=await HablaScreenshot.openOcr({language:s.route.source.startsWith('en')?'eng':'spa',signal:s.controller.signal});
   if(!valid(s)){await s.reader.close();return;}
   s.motionCanvas=document.createElement('canvas');s.motionCanvas.width=32;s.motionCanvas.height=24;
   s.motionTimer=setInterval(()=>motionSample(s),250);freeze.disabled=false;retry.disabled=false;scan(s);
  }catch(error){
   if(!valid(s))return;
   const denied=['NotAllowedError','PermissionDeniedError'].includes(error.name);stop();retry.disabled=false;
   report(denied?'Camera access denied. Allow camera access, then tap Retry. / Permite acceso a la cámara y reintenta.'
    :error.message==='unsupported'?'Live camera is unavailable here. Open Habla in Safari. / Abre Habla en Safari.'
    :'Camera or text reader could not start. Tap Retry. / No se pudo iniciar. Reintenta.');
  }
 }
 function bind(config){
  options=config;const button=document.querySelector('#quick-live-camera');if(!button)return;
  dialog=document.createElement('dialog');dialog.id='live-camera-translator';dialog.className='photo-translator live-camera-translator';dialog.setAttribute('aria-labelledby','live-camera-title');
  dialog.innerHTML=`<div class="photo-translator-toolbar"><h2 id="live-camera-title">Live camera / Cámara en vivo</h2><button type="button" data-camera-close>Close / Cerrar</button></div>
   <div class="photo-translator-controls"><button type="button" data-camera-freeze disabled>Freeze / Congelar</button><button type="button" data-camera-original aria-pressed="false">Original</button><button type="button" data-camera-copy disabled>Copy / Copiar</button><button type="button" data-camera-use disabled>Use text / Usar texto</button><button type="button" data-camera-retry>Retry / Reintentar</button></div>
   <p class="photo-translator-note">Point at text and hold steady. Images stay on this device; online translation sends recognized words. / Apunta al texto y mantén la cámara estable.</p><p data-camera-status role="status" aria-live="polite"></p>
   <div class="photo-translator-stage live-camera-stage"><video autoplay muted playsinline aria-label="Live rear camera / Cámara trasera en vivo"></video><div class="photo-translator-labels"></div></div><p class="photo-translator-detail" data-camera-detail aria-live="polite"></p>`;
  document.body.append(dialog);stage=dialog.querySelector('.live-camera-stage');video=stage.querySelector('video');layer=stage.querySelector('div');
  status=dialog.querySelector('[data-camera-status]');detail=dialog.querySelector('[data-camera-detail]');freeze=dialog.querySelector('[data-camera-freeze]');original=dialog.querySelector('[data-camera-original]');copy=dialog.querySelector('[data-camera-copy]');use=dialog.querySelector('[data-camera-use]');retry=dialog.querySelector('[data-camera-retry]');
  button.addEventListener('click',start);dialog.querySelector('[data-camera-close]').addEventListener('click',close);
  dialog.addEventListener('cancel',stop);dialog.addEventListener('close',stop);retry.addEventListener('click',()=>{if(session?.reader){session.failed.clear();scan(session,true);translateVisible(session);}else start();});
  new ResizeObserver(paint).observe(video);video.addEventListener('resize',()=>{
   const s=session;if(s){s.revision++;s.regions=[];s.text='';s.seen.clear();s.pixels=null;paint();if(s.reader)scan(s,true);}
  });
  original.addEventListener('click',()=>{showOriginal=!showOriginal;original.setAttribute('aria-pressed',String(showOriginal));paint();});
  freeze.addEventListener('click',async()=>{
   const s=session;if(!valid(s))return;s.frozen=!s.frozen;s.revision++;s.regions=[];s.text='';s.seen.clear();clearTimeout(s.timer);paint();
   freeze.textContent=s.frozen?'Resume / Continuar':'Freeze / Congelar';
   if(s.frozen){video.pause();report('Reading frozen view… / Leyendo imagen congelada…');scan(s,true);}
   else {s.pixels=null;await video.play().catch(()=>{});if(valid(s))scan(s);}
  });
  copy.addEventListener('click',async()=>{
   const s=session;if(!s)return;const text=s.regions.map(r=>s.cache.get(r.text)||'').filter(Boolean).join('\n\n');if(!text)return;
   try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else{const field=document.createElement('textarea');field.value=text;dialog.append(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw new Error('copy');}report('Translation copied / Traducción copiada');}
   catch{detail.textContent=text;report('Select the translation below to copy. / Selecciona la traducción para copiar.');}
  });
  use.addEventListener('click',()=>{const s=session;if(!s?.text)return;const result={text:s.text,regions:s.regions,name:'Live camera'};const accepted=options.commit(result,s.guard);close();if(!accepted)document.querySelector('#quick-image-status').textContent='Your source changed; it was kept. / Tu texto se conservó.';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)close();});window.addEventListener('pagehide',close);
 }
 return {bind,close};
})();
