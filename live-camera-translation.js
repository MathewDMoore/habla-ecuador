/* A continuous camera preview with local, serial OCR and text-only translation. */
const HablaLiveCamera=(()=>{
 'use strict';
 let dialog,video,stage,layer,status,detail,freeze,original,copy,use,retry;
 let options,session=null,sequence=0,showOriginal=false;
 const key=route=>JSON.stringify([route.source,route.target,route.onDevice]);
 const valid=s=>session===s&&s.active;
 const sameRoute=s=>valid(s)&&key(options.getRoute())===key(s.route);
 // Never place a changed quantity over the original label. Different number
 // formatting (4.5 / 4,5) is okay, but missing, added or changed values are not.
 const numbers=text=>(String(text).match(/\d+(?:[.,]\d+)*/g)||[]).map(n=>n.replace(/,/g,'.')).sort();
 const keepsNumbers=(source,translation)=>{
  const original=numbers(source),translated=numbers(translation);
  return original.length===translated.length&&original.every((n,i)=>n===translated[i]);
 };
 function report(message){if(status.textContent!==message)status.textContent=message;}
 function paint(){
  layer.hidden=showOriginal||!session?.positionCurrent;layer.replaceChildren();
  const s=session;if(!s)return;
  if(video.videoWidth&&video.videoHeight){
   // Match the centered object-fit: cover crop so labels follow the printed text.
   const scale=Math.max(stage.clientWidth/video.videoWidth,stage.clientHeight/video.videoHeight);
   layer.style.width=video.videoWidth*scale+'px';
   layer.style.height=video.videoHeight*scale+'px';
  }
  for(const region of s.regions){
   const text=s.cache.get(region.text);if(!text)continue;
   const label=document.createElement('button');label.type='button';label.className='photo-translation-label';
   const angle=region.angle||0;
   const sideways=Math.abs(angle)===90;
   Object.assign(label.style,{
    left:(region.x+region.width/2)*100+'%',top:(region.y+region.height/2)*100+'%',
    width:(sideways?region.height*layer.clientHeight:region.width*layer.clientWidth)+'px',
    height:(sideways?region.width*layer.clientWidth:region.height*layer.clientHeight)+'px',
    transform:'translate(-50%, -50%) rotate('+angle+'deg)',fontSize:'20px'
   });
   label.textContent=text;label.dataset.ready='true';label.setAttribute('aria-label',region.text+' → '+text);
   label.addEventListener('click',()=>{detail.textContent=region.text+'\n\n'+text;});layer.append(label);
   if(!showOriginal){let size=20;while(size>10&&(label.scrollHeight>label.clientHeight+1||label.scrollWidth>label.clientWidth+1))label.style.fontSize=--size+'px';}
  }
  copy.disabled=!s.positionCurrent||!s.regions.length||s.regions.some(region=>!s.cache.get(region.text));
  use.disabled=!s.positionCurrent||!s.text;
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
   if(delta/(32*24*3)>12){s.motion++;s.positionCurrent=false;paint();report('Hold steady to place the translation. / Mantén la cámara estable para colocar la traducción.');}}
  s.pixels=new Uint8ClampedArray(pixels);
 }
 async function translateVisible(s){
  if(s.translating)return;s.translating=true;
  try{
   while(sameRoute(s)){
    // Translate a readable first result. Requiring identical consecutive camera
    // frames prevented handheld scenes from ever reaching the translator.
    const region=s.regions.find(r=>!s.cache.has(r.text)&&!s.failed.has(r.text));
    if(!region)break;
    try{
     const text=String(await options.translate(region.text,{...s.route,forceFresh:s.fresh.has(region.text),isCurrent:()=>sameRoute(s)})).trim();
     if(!sameRoute(s))return;if(!text)throw new Error('Empty translation');
     if(!keepsNumbers(region.text,text)){
      s.numericMismatch.add(region.text);
      throw new Error('Translation altered printed numbers');
     }
     s.fresh.delete(region.text);
     s.cache.set(region.text,text);if(s.cache.size>120)s.cache.delete(s.cache.keys().next().value);
    }catch{if(!sameRoute(s))return;s.failed.add(region.text);}
    paint();
   }
   if(sameRoute(s)&&s.regions.length){
    const count=s.regions.filter(r=>s.cache.has(r.text)).length;
    report(s.regions.some(r=>s.numericMismatch.has(r.text))?'Numbers differ from the label. Original text is visible; tap Retry or Use text to check. / Los números no coinciden. Revisa el texto original.'
      :s.regions.some(r=>s.failed.has(r.text))?'Some words could not be translated. Tap Retry. / Reintenta la traducción.'
     :count===s.regions.length?(!s.positionCurrent?'Translation ready. Hold steady to place it. / Traducción lista. Mantén la cámara estable.':s.frozen?'Frozen translation / Traducción congelada':'Live translation · point at other text / Traducción en vivo')
     :'Reading and translating… Hold steady. / Leyendo y traduciendo…');
   }
  }finally{s.translating=false;}
 }
 function rotateFrame(frame,angle){
  if(!angle)return frame;
  const rotated=document.createElement('canvas');
  const sideways=Math.abs(angle)===90;
  rotated.width=sideways?frame.height:frame.width;
  rotated.height=sideways?frame.width:frame.height;
  const context=rotated.getContext('2d');
  context.translate(rotated.width/2,rotated.height/2);
  context.rotate(angle*Math.PI/180);
  context.drawImage(frame,-frame.width/2,-frame.height/2);
  return rotated;
 }
 function frameRegion(region,angle){
  const {x,y,width,height}=region;
  if(angle===90)return {...region,x:y,y:1-x-width,width:height,height:width,angle:-90};
  if(angle===-90)return {...region,x:1-y-height,y:x,width:height,height:width,angle:90};
  if(angle===180)return {...region,x:1-x-width,y:1-y-height,angle:180};
  return region;
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
   const angles=[s.angle,...[0,90,-90,180].filter(angle=>angle!==s.angle)];
   let regions=[],text='';
   for(const angle of angles){
    const result=await s.reader.recognize(rotateFrame(frame,angle));
    if(!sameRoute(s)||revision!==s.revision)return;
    if(!(result.confidence>=65))continue;
    regions=(result.regions||[]).filter(r=>r.text.length<=2000&&
     (r.confidence==null||r.confidence>=65)).slice(0,16).map(r=>frameRegion(r,angle));
    if(regions.length){text=regions.map(r=>r.text).join('\n');s.angle=angle;break;}
    if(!result.regions?.length)text=String(result.text||'').trim();
   }
   // Movement invalidates the old positions, not the recognized words. Cache
   // their translation while the next frame finds their current positions.
   s.positionCurrent=motion===s.motion;
   s.regions=regions;s.text=text.slice(0,20000);
   paint();
   if(!regions.length)report(s.text?'Text found without positions. Use text to review it. / Usa el texto para revisarlo.':'Text unclear. Move closer or hold steady. / Acércate o mantén la cámara estable.');
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
   const s={id:++sequence,active:true,route:{...options.getRoute()},controller:new AbortController(),regions:[],text:'',cache:new Map(),failed:new Set(),numericMismatch:new Set(),fresh:new Set(),motion:0,revision:0,angle:0,frozen:false,positionCurrent:false};session=s;
  report('Opening rear camera… / Abriendo cámara trasera…');
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');
   s.guard=options.begin();
   const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
   if(!valid(s)){stream.getTracks().forEach(track=>track.stop());return;}
   s.stream=stream;video.srcObject=stream;video.muted=true;await video.play();if(!valid(s))return;
   for(const track of stream.getVideoTracks())track.addEventListener('ended',()=>{if(valid(s)){stop();report('Camera stopped. Tap Retry to reopen. / Reintenta para abrir la cámara.');retry.disabled=false;}});
   paint();report('Camera live. Loading text reader… / Cámara en vivo. Preparando lector…');
   s.reader=await HablaScreenshot.openOcr({language:s.route.source.startsWith('en')?'eng':'spa',signal:s.controller.signal,logger:progress=>{
    if(valid(s)&&/loading|initializing/.test(progress.status||''))report('Preparing text reader… / Preparando lector de texto…');
   }});
   if(!valid(s)){await s.reader.close();return;}
   s.motionCanvas=document.createElement('canvas');s.motionCanvas.width=32;s.motionCanvas.height=24;
   s.motionTimer=setInterval(()=>motionSample(s),250);freeze.disabled=false;retry.disabled=false;scan(s);
  }catch(error){
   if(!valid(s))return;
   const denied=['NotAllowedError','PermissionDeniedError'].includes(error.name);stop();retry.disabled=false;
   report(denied?'Camera access denied. Allow camera access, then tap Retry. / Permite acceso a la cámara y reintenta.'
    :error.message==='unsupported'?'Live camera is unavailable here. Open Habla in Safari. / Abre Habla en Safari.'
    :'Camera or text reader could not start. '+String(error.message||'Tap Retry.'));
  }
 }
 function bind(config){
  options=config;const button=document.querySelector('#quick-live-camera');if(!button)return;
  dialog=document.createElement('dialog');dialog.id='live-camera-translator';dialog.className='photo-translator live-camera-translator';dialog.setAttribute('aria-labelledby','live-camera-title');
  dialog.innerHTML=`<div class="live-camera-controls"><div class="photo-translator-toolbar"><h2 id="live-camera-title">Live camera / Cámara en vivo</h2><button type="button" data-camera-close>Close / Cerrar</button></div>
   <div class="photo-translator-controls"><button type="button" data-camera-freeze disabled>Freeze / Congelar</button><button type="button" data-camera-original aria-pressed="false">Original</button><button type="button" data-camera-copy disabled>Copy / Copiar</button><button type="button" data-camera-use disabled>Use text / Usar texto</button><button type="button" data-camera-retry>Retry / Reintentar</button></div>
   <details class="live-camera-settings"><summary>Overlay settings / Ajustes</summary><label class="camera-overlay-control">Label background / Fondo de texto <input data-camera-opacity type="range" min="20" max="100" value="65" aria-label="Translated label background opacity / Opacidad del fondo de traducción"><output data-camera-opacity-value>65%</output></label><p class="photo-translator-note">Images stay on this device. Online translation sends recognized words. / Las imágenes quedan en el dispositivo. La traducción en línea envía el texto reconocido.</p></details>
   <p data-camera-status role="status" aria-live="polite"></p><p class="photo-translator-detail" data-camera-detail aria-live="polite"></p></div>
   <div class="photo-translator-stage live-camera-stage"><video autoplay muted playsinline aria-label="Live rear camera / Cámara trasera en vivo"></video><div class="photo-translator-labels"></div></div>`;
  document.body.append(dialog);stage=dialog.querySelector('.live-camera-stage');video=stage.querySelector('video');layer=stage.querySelector('div');
  status=dialog.querySelector('[data-camera-status]');detail=dialog.querySelector('[data-camera-detail]');freeze=dialog.querySelector('[data-camera-freeze]');original=dialog.querySelector('[data-camera-original]');copy=dialog.querySelector('[data-camera-copy]');use=dialog.querySelector('[data-camera-use]');retry=dialog.querySelector('[data-camera-retry]');
  const opacity=dialog.querySelector('[data-camera-opacity]'),opacityValue=dialog.querySelector('[data-camera-opacity-value]');
  opacity.addEventListener('input',()=>{stage.style.setProperty('--live-overlay-opacity',Number(opacity.value)/100);opacityValue.textContent=opacity.value+'%';});
  button.addEventListener('click',start);dialog.querySelector('[data-camera-close]').addEventListener('click',close);
  dialog.addEventListener('cancel',stop);dialog.addEventListener('close',stop);retry.addEventListener('click',()=>{if(session?.reader){for(const text of session.numericMismatch)session.fresh.add(text);session.failed.clear();session.numericMismatch.clear();scan(session,true);translateVisible(session);}else start();});
  new ResizeObserver(paint).observe(video);video.addEventListener('resize',()=>{
   const s=session;if(s){s.revision++;s.positionCurrent=false;s.regions=[];s.text='';s.pixels=null;paint();if(s.reader)scan(s,true);}
  });
  original.addEventListener('click',()=>{showOriginal=!showOriginal;original.setAttribute('aria-pressed',String(showOriginal));paint();});
  freeze.addEventListener('click',async()=>{
   const s=session;if(!valid(s))return;s.frozen=!s.frozen;s.revision++;s.positionCurrent=false;s.regions=[];s.text='';clearTimeout(s.timer);paint();
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
