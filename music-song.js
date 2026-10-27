/* First vocal lesson. Recording and lyric adaptation: CC BY-SA 3.0.
   Source: https://commons.wikimedia.org/wiki/File:La_Cucaracha.ogg */
(function(root){
'use strict';
const source='https://commons.wikimedia.org/wiki/File:La_Cucaracha.ogg';
const audio='https://upload.wikimedia.org/wikipedia/commons/transcoded/a/af/La_Cucaracha.ogg/La_Cucaracha.ogg.mp3';
const lines=[['La cucaracha, la cucaracha','The cockroach, the cockroach'],['Ya no puede caminar','It can’t walk anymore'],['Porque no tiene, porque le falta','Because it doesn’t have, because it’s missing'],['La patita principal','Its main little leg']];
const phrases=[['Ya no puedo caminar.','I can’t walk anymore.','Después de una caminata larga. / After a long walk.'],['Me falta una cuchara.','I’m missing a spoon.','En la mesa. / At the table.'],['No tiene agua.','It has no water.','Una botella vacía. / An empty bottle.']];
let options;
function render(config=options){
 options=config;const host=document.querySelector('#music-song-lesson');if(!host||!config)return;
 const locale=config.locale(),english=locale.startsWith('en');
 host.innerHTML=`<p class="eyebrow">Canción con voz / Song with vocals · 43 s</p><h2>La Cucaracha</h2>
 <p>Canción tradicional mexicana · Mexican traditional song. Español cantado con guitarra / Spanish vocals with guitar.</p>
 <p><b>${english?'English practice: read the meaning, then hear and use the English examples below. The song itself is sung in Spanish.':'Práctica de español: escucha el coro, sigue la letra y usa las frases en una situación real.'}</b></p>
 <audio controls preload="none" aria-label="La Cucaracha — sung Spanish chorus" ><source src="${audio}" type="audio/mpeg"><source src="https://upload.wikimedia.org/wikipedia/commons/a/af/La_Cucaracha.ogg" type="audio/ogg"></audio>
 <p data-song-status role="status">Toca reproducir para escuchar. / Tap play to listen. Requires internet / Requiere conexión.</p>
 <button type="button" data-song-replay>↺ Repetir coro / Replay chorus</button>
 <h3>Letra y significado / Lyrics and meaning</h3><p>El coro se canta dos veces. / The chorus is sung twice.</p>
 <div class="song-lyrics">${lines.map(([es,en])=>`<p><strong lang="es">${es}</strong><br><span lang="en">${en}</span></p>`).join('')}</div>
 <p>“Ya no” = no longer / anymore. “Le falta” = it is missing something. “Patita” is a diminutive of “pata” (an animal’s leg). The song’s image is playful; use “pierna” for a person’s leg.</p>
 <h3>Del coro a la conversación / From chorus to conversation</h3>
 ${phrases.map(([es,en,context],i)=>`<article class="song-phrase"><p>${context}</p><p lang="${english?'en':'es'}"><strong>${english?en:es}</strong></p><p>${english?es:en}</p><button type="button" data-song-phrase="${i}">🔊 ${english?'Hear spoken English':'Escuchar español hablado'}</button></article>`).join('')}
 <p>Prueba con tu situación: “Me falta…” / Try your own situation: “I’m missing…”</p>
 <details><summary>Créditos / Credits</summary><p>Elisa: vocals; Sean Buss: guitar; Kenmayer: mix (2008). Recording unchanged. Bilingual lyric companion adapted by Habla Ecuador under <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>. <a href="${source}" target="_blank" rel="noreferrer">Recording and exact sung lyrics / Grabación y letra</a>.</p></details>`;
 const player=host.querySelector('audio'),status=host.querySelector('[data-song-status]');
 const start=()=>{document.querySelectorAll('audio').forEach(p=>{if(p!==player)p.pause()});config.stop?.();};
 player.addEventListener('play',start);
 player.addEventListener('playing',()=>status.textContent='Reproduciendo coro cantado / Playing sung chorus');
 player.addEventListener('ended',()=>status.textContent='Escucha otra vez o practica una frase. / Replay or practice a phrase.');
 player.addEventListener('error',()=>status.textContent='No se pudo cargar el audio. Revisa la conexión o abre la fuente en Créditos. / Audio could not load. Check the connection or open the source under Credits.');
 host.querySelector('[data-song-replay]').addEventListener('click',()=>{player.currentTime=0;const p=player.play();p?.catch(()=>status.textContent='No se pudo iniciar el audio. Usa el control de reproducción. / Playback could not start. Use the audio play control.');});
 host.querySelectorAll('[data-song-phrase]').forEach(b=>b.addEventListener('click',()=>{player.pause();config.say(phrases[Number(b.dataset.songPhrase)][english?1:0],locale);}));
}
root.HablaSongLesson={render};
})(window);
