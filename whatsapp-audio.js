/* Local user-selected voice notes. No audio upload or call capture. */
(function(){
'use strict';
function bind(){
 const file=document.querySelector('#whatsapp-audio-file'),player=document.querySelector('#whatsapp-audio-player'),status=document.querySelector('#whatsapp-audio-status');if(!file||!player)return;
 let objectUrl=null;
 function clear(){player.pause();player.removeAttribute('src');player.load();player.hidden=true;file.value='';if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;status.textContent='';}
 file.addEventListener('change',()=>{
  const selected=file.files?.[0];if(!selected)return;clear();
  if(!/^audio\//.test(selected.type)&&! /\.(opus|ogg|oga|m4a|mp3|wav|aac)$/i.test(selected.name)){status.textContent='Selecciona un archivo de audio. / Select an audio file.';return;}
  if(selected.size>50*1024*1024){status.textContent='Elige una nota de menos de 50 MB. / Choose a note under 50 MB.';return;}
  const chosen=selected;objectUrl=URL.createObjectURL(chosen);player.src=objectUrl;player.hidden=false;
  status.textContent=chosen.name+' · Audio local; pega la transcripción para traducir. / Local audio; paste its transcript to translate.';
 });
 player.addEventListener('error',()=>{if(objectUrl)status.textContent='Formato no reproducible aquí. Prueba otro formato de audio. / This audio format could not play here. Try another audio format.';});
 document.querySelector('#whatsapp-audio-clear').addEventListener('click',clear);
 window.addEventListener('pagehide',clear);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
