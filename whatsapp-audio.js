/* Local user-selected voice notes. No audio upload or call capture. */
(function(){
'use strict';
function bind(){
 const file=document.querySelector('#whatsapp-audio-file'),player=document.querySelector('#whatsapp-audio-player'),status=document.querySelector('#whatsapp-audio-status');if(!file||!player)return;
 let objectUrl=null;
 function clear(){player.pause();player.removeAttribute('src');player.load();player.hidden=true;file.value='';if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;status.textContent='';}
 function open(selected){
  if(!selected)return false;
  if(!/^audio\//.test(selected.type)&&! /\.(opus|ogg|oga|m4a|mp3|wav|aac|aif|aiff|caf)$/i.test(selected.name)){status.textContent='Selecciona un archivo de audio. / Select an audio file.';return false;}
  if(!selected.size||selected.size>50*1024*1024){status.textContent='Elige una nota de 1 byte a 50 MB. / Choose a note between 1 byte and 50 MB.';return false;}
  document.querySelector('[data-open="translator-view"]')?.click();
  clear();objectUrl=URL.createObjectURL(selected);player.src=objectUrl;player.preload='metadata';player.hidden=false;player.load();
  const section=document.querySelector('#whatsapp-audio-import');if(section)section.open=true;
  section?.scrollIntoView?.({block:'center',behavior:'smooth'});
  status.textContent=selected.name+' · Audio local; pega la transcripción para traducir. / Local audio; paste its transcript to translate.';
  return true;
 }
 file.addEventListener('change',()=>open(file.files?.[0]));
 player.addEventListener('error',()=>{if(objectUrl)status.textContent='Formato no reproducible aquí. Prueba otro formato de audio. / This audio format could not play here. Try another audio format.';});
 document.querySelector('#whatsapp-audio-clear').addEventListener('click',clear);
 window.HablaWhatsAppAudio={open,clear};
 window.addEventListener('pagehide',clear);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
