/* Check public release metadata only. Never serialize or replace user work. */
(function(root){
 'use strict';
 function buildNumber(version){const m=/build (\d+)$/.exec(version||'');return m?Number(m[1]):0;}
 function release(value){return value&&Number.isSafeInteger(value.build)&&value.build>0&&typeof value.version==='string'&&/^\d+\.\d+\.\d+$/.test(value.version)?{build:value.build,version:value.version}:null;}
 if(typeof module==='object'&&module.exports){module.exports={buildNumber,release};return;}
 function start({version,registration=Promise.resolve(null),isProtected=()=>false,idleMs=6000,pollMs=300000}){
  const current=buildNumber(version);if(!current)return;
  const status=document.getElementById('app-update-status'),button=document.getElementById('app-update-check');
  let checking=false,newest=null,ready=false,reloading=false,timer=null,lastActivity=Date.now(),composing=false;
  const baseline=new WeakMap();
  document.querySelectorAll('input,textarea,select').forEach(el=>baseline.set(el,el.type==='checkbox'?el.checked:el.value));
  const message=text=>{if(status)status.textContent=text;};
  const activity=()=>{lastActivity=Date.now();clearTimeout(timer);timer=null;if(newest&&ready)schedule();};
  for(const event of ['pointerdown','keydown','input','change'])document.addEventListener(event,activity,{capture:true,passive:true});
  document.addEventListener('compositionstart',()=>{composing=true;activity();});document.addEventListener('compositionend',()=>{composing=false;activity();});
  function workOpen(){
   if(document.getElementById('translator-input')?.value.trim())return true;
   if(composing||document.querySelector('dialog[open]')||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return true;
   if([...document.querySelectorAll('audio,video')].some(el=>!el.ended&&(!el.paused||el.currentTime>0)))return true;
   if(root.speechSynthesis?.speaking||root.speechSynthesis?.pending)return true;
   if([...document.querySelectorAll('[contenteditable="true"],.dictionary-practice-heard')].some(el=>el.textContent.trim()))return true;
   for(const el of document.querySelectorAll('input,textarea,select')){
    if(el.type==='file'){if(el.files?.length)return true;continue;}
    if(el.type==='hidden'||el.type==='button'||el.type==='submit')continue;
    const value=el.type==='checkbox'?el.checked:el.value;
    if(!baseline.has(el)&&el.tagName==='SELECT')baseline.set(el,value);
    if(baseline.has(el)?value!==baseline.get(el):Boolean(value)&&value!==el.defaultValue)return true;
   }
   try{return Boolean(isProtected());}catch{return true;}
  }
  function attempted(){try{return sessionStorage.getItem('habla-update-attempt-v1')===String(newest.build);}catch{return true;}}
  function schedule(){
   clearTimeout(timer);timer=null;if(!ready||!newest||reloading||document.hidden||navigator.onLine===false)return;
   if(workOpen()){message('An update is ready. Your work stays open; it will load when you reopen Habla.');return;}
   if(attempted()){message('An update is ready. Reopen Habla when convenient; automatic reload was already attempted.');return;}
   timer=setTimeout(()=>{
    timer=null;
    if(document.hidden||navigator.onLine===false||workOpen()||Date.now()-lastActivity<idleMs){schedule();return;}
    try{sessionStorage.setItem('habla-update-attempt-v1',String(newest.build));}catch{message('An update is ready. Reopen Habla when convenient; automatic reload is unavailable.');return;}
    reloading=true;location.reload();
   },Math.max(idleMs,100));
  }
  function bounded(promise,ms){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Update timed out')),ms);Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});}
  async function shellReady(reg,target){
   if(!reg)return true; // Native web views without workers still use fresh navigation.
   try{await bounded(reg.update(),8000);}catch{return false;}
   for(let i=0;i<8;i++){
    const worker=reg.active;
    if(worker){const info=await new Promise(resolve=>{
     const channel=new MessageChannel(),timeout=setTimeout(()=>{channel.port1.close();resolve(null);},1000);
     channel.port1.onmessage=event=>{clearTimeout(timeout);channel.port1.close();resolve(event.data);};
     try{worker.postMessage({type:'OFFLINE_SHELL_STATUS'},[channel.port2]);}catch{clearTimeout(timeout);channel.port1.close();resolve(null);}
    });
    if(info?.ready&&info.cache==='habla-ecuador-v'+target)return true;
    }
    if(i<7)await new Promise(resolve=>setTimeout(resolve,700));
   }
   return false;
  }
  async function check(){
   if(checking||document.hidden||navigator.onLine===false)return;
   checking=true;if(button)button.disabled=true;
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
   try{
    const url=new URL('app-version.json',location.href);url.searchParams.set('check',String(Date.now()));
    const response=await fetch(url,{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('release unavailable');
    const available=release(await response.json());if(!available)throw Error('invalid release');
    if(available.build<=current){message('Habla is up to date. Automatic checks are on.');return;}
    newest=available;message('A new version is downloading. Your work stays open.');
    ready=await shellReady(await bounded(registration,8000),available.build);
    if(ready)schedule();else message('An update is available. Download could not finish; Habla will retry while online.');
   }catch{message('Update check could not finish. Your current app and work are kept; Habla will retry while online.');}
   finally{clearTimeout(timeout);checking=false;if(button)button.disabled=false;}
  }
  button?.addEventListener('click',check);
  root.addEventListener('online',check);root.addEventListener('focus',check);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else check();});
  setInterval(check,pollMs);
  setInterval(()=>{if(newest&&ready&&!timer)schedule();},2000);
  check();return {check,workOpen};
 }
 root.HablaUpdates={start};
})(typeof window==='object'?window:globalThis);
