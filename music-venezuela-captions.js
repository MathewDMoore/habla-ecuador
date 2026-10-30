/* Venezuelan BYE BYE caption companion: provisional timing and editorial translations.
   YouTube embeds cannot be given a third-party caption track by this code. */
(function(root){
'use strict';
const host=document.getElementById('ve-music-lesson');if(!host)return;
const cues=[
[3,5.4,'♪ Vocal refrain ♪'],[5.4,10.8,"I'm never going to say goodbye to you."],
[11,16.7,'As the days go by, I think of you more, girl.'],
[17,23.6,"I don't know what you did to me. You've got me at your feet."],
[24,27.1,'♪ Vocal refrain ♪'],[27.2,33.1,"I'm never going to say goodbye to you. Baby, you're right by my side."],
[33.2,37.1,"With you I'll stay on standby. I remember the day I first tasted you."],
[37.2,41.3,'We did it in bed, in that hotel room.'],
[41.4,47,"I don't know what you did to me. Your magic put a spell on me, baby."],
[47.1,52.7,'I know you lie when you talk to me, but somehow you convince me.'],
[52.8,58.1,"I can't get you out of my mind. When I think of you, I start drinking."],
[58.2,60.9,'♪ Vocal refrain ♪'],
[61,67,"I'm never going to say goodbye to you. Baby, you're right by my side."],
[67.1,72.4,"With you I'll stay on standby. ♪ Vocal refrain ♪"],
[72.5,77.4,"I'm never going to say goodbye to you."],
[77.5,81.4,"Baby, you're right by my side. With you I'll stay on standby."],
[81.5,85.2,"When I looked into your eyes, I don't know what the hell happened.",null,true],
[85.3,87,"I don't know if it was that ass of yours that left me dazed.","I don't know if it was that arse of yours that left me dazed.",true],
[87.1,91.5,'Before sleeping, I always asked God to put me in your path.',null,true],
[91.6,93.3,'And he finally granted my wish.',null,true],
[93.4,98.4,"Nothing like this has ever happened to me, certainly not with the lovers I'd had by my side.",null,true],
[98.5,105.6,"Baby, you've left my heart ice-cold, like the mountains of Colorado.",null,true],
[105.7,108.2,'♪ Vocal refrain ♪'],
[108.3,113.5,"I'm never going to say goodbye to you. Baby, you're right by my side."],
[113.6,118.3,"With you I'll stay on standby. ♪ Vocal refrain ♪"],
[118.4,125.5,"I'm never going to say goodbye to you. Baby, you're right by my side."],
[125.6,132.8,"With you I'll stay on standby. I want to make love while gazing at the stars.",null,true],
[132.9,136.3,'From a lookout in a neighborhood of Marbella.','From a viewpoint in a neighbourhood of Marbella.',true],
[136.4,140.1,"I'm your warrior, babe. You're my maiden."],
[140.2,145.2,"I've found the princess for my castle. I'm never going to say goodbye to you."],
[145.3,151.1,"Baby, you're right by my side. With you I'll stay on standby."],
[151.2,159.4,"I'm never going to say goodbye to you. Baby, you're right by my side."],
[159.5,165.7,"With you I’ll stay on standby. Between heart and reason..."],
[165.8,169.1,'...there is always a choice.'],[169.2,173.3,'And my choice, my choice is you.'],
[173.4,180.6,'[Spoken outro: words unclear]'],
[180.7,184.6,'We keep doing it again. They call it “heavy.” [uncertain]'],
[184.7,187.9,'What a rascal! [context uncertain]']
];
const verses=[
{
original:'al verte a los ojos no se que diablos pasó no se si fue ese culo que me idiotiso al irme a dormir siempre le pedí adiós que me pusiera en tu camino y ya me lo cumplió',
readable:'Al verte a los ojos, no sé qué diablos pasó. No sé si fue ese culo que me idiotizó. Al irme a dormir, siempre le pedí a Dios que me pusiera en tu camino, y ya me lo cumplió.',
us:"When I looked into your eyes, I don't know what the hell happened. I don't know if it was that ass of yours that left me dazed. Before going to sleep, I always prayed to God to put me in your path, and he finally granted my wish.",
uk:"When I looked into your eyes, I don't know what the hell happened. I don't know if it was that arse of yours that left me dazed. Before going to sleep, I always prayed to God to put me in your path, and he finally granted my wish.",
note:'“A Dios” means “to God”; “me pusiera en tu camino” means “put me in your path.”'},
{
original:'en mi vida nunca avía pasado menos por los amores q avía a mi lado  beby tú me tienes el corazón frío helado como las montañas fría de colorado',
readable:'En mi vida nunca había pasado, menos por los amores que había a mi lado. Baby, tú me tienes el corazón frío, helado como las montañas frías de Colorado.',
us:"Nothing like this has ever happened to me before, certainly not with the lovers I'd had by my side. Baby, you've left my heart cold, frozen like the mountains of Colorado.",
uk:"Nothing like this has ever happened to me before, certainly not with the lovers I'd had by my side. Baby, you've left my heart cold, frozen like the mountains of Colorado.",
note:'The phrase “menos por los amores” is unusual Spanish; its English meaning remains provisional.'},
{
original:'quiero hacer el amor mirando las estrellas en el mirador en un barrio de Marbella',
readable:'Quiero hacer el amor mirando las estrellas, en el mirador, en un barrio de Marbella.',
us:'I want to make love while gazing at the stars from a lookout in a neighborhood of Marbella.',
uk:'I want to make love while gazing at the stars from a viewpoint in a neighbourhood of Marbella.',
note:'Mirador means lookout/viewpoint. Which Marbella is intended is unconfirmed.'}
];
const id=name=>host.querySelector('#ve-'+name);
const frame=id('youtube-frame'),caption=id('caption-overlay'),reading=id('caption-reading'),
lang=id('caption-language'),source=id('source-choice'),status=id('video-status'),
confidence=id('caption-confidence'),timing=id('video-time'),timeLabel=id('video-time-label'),
offsetInput=id('caption-offset'),offsetLabel=id('offset-value'),passages=id('lyric-comparison'),
list=id('caption-cue-list');
let player,ready=false,manual=0,offset=0,last=-2;
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function position(){try{if(ready&&player&&typeof player.getCurrentTime==='function')return Number(player.getCurrentTime())||0;}catch{}return manual;}
function selectedCue(seconds){return cues.findIndex(c=>seconds>=c[0]&&seconds<c[1]);}
function draw(force){
 const now=position();timeLabel.textContent=fmt(now);
 if(ready&&document.activeElement!==timing){timing.value=String(Math.round(now));manual=now;}
 const index=selectedCue(now+offset);
 if(index===last&&!force)return;last=index;const cue=cues[index];
 const enabled=lang.value!=='off';
 const text=enabled&&cue?(lang.value==='en-GB'&&cue[3]?cue[3]:cue[2]):'';
 caption.hidden=!text;caption.textContent=text;
 reading.textContent=text||(enabled?'No caption verified for this moment.':'English captions off.');
 confidence.textContent=cue?(cue[4]?'Listener-supplied wording · approximate timing':'Provisional auto-caption-based draft · needs review'):'No timed line';
 confidence.classList.toggle('ve-reviewed',Boolean(cue&&cue[4]));
}
function renderPassages(){
 passages.replaceChildren();
 for(const v of verses){
  const section=document.createElement('article');section.className='ve-verse';
  const pair=document.createElement('div');pair.className='ve-verse-pair';
  const es=document.createElement('div'),en=document.createElement('div');
  const esTitle=document.createElement('strong'),enTitle=document.createElement('strong');
  esTitle.textContent=source.value==='original'?'🇻🇪 Exact supplied Spanish':'🇻🇪 Spanish spelling/punctuation draft';
  enTitle.textContent=lang.value==='en-GB'?'🇬🇧 British English':'🇺🇸 American English';
  const esText=document.createElement('p'),enText=document.createElement('p');
  esText.textContent=v[source.value];enText.textContent=lang.value==='en-GB'?v.uk:v.us;
  es.append(esTitle,esText);en.append(enTitle,enText);pair.append(es,en);
  const note=document.createElement('p');note.className='ve-note';note.textContent=v.note;
  section.append(pair,note);passages.append(section);
 }
}
function seek(sec){
 manual=sec;timing.value=String(Math.round(sec));
 if(ready&&player&&typeof player.seekTo==='function'){try{player.seekTo(sec,true);}catch{}}
 else status.textContent='YouTube sync unavailable here. Drag the YouTube progress bar to the same time.';
 draw(true);
}
for(let i=0;i<cues.length;i++){
 const cue=cues[i],button=document.createElement('button');button.type='button';
 button.textContent=fmt(cue[0])+' '+cue[2];button.addEventListener('click',()=>seek(cue[0]));list.append(button);
}
lang.addEventListener('change',()=>{draw(true);renderPassages();});
source.addEventListener('change',renderPassages);
timing.addEventListener('input',()=>{manual=Number(timing.value);timeLabel.textContent=fmt(manual);});
timing.addEventListener('change',()=>seek(Number(timing.value)));
offsetInput.addEventListener('input',()=>{offset=Number(offsetInput.value);offsetLabel.textContent=(offset>=0?'+':'')+offset.toFixed(1)+'s';draw(true);});
id('previous').addEventListener('click',()=>seek(Math.max(0,position()-10)));
id('next').addEventListener('click',()=>seek(Math.min(188,position()+10)));
function connect(){
 if(!root.YT||!root.YT.Player)return;
 try{
  player=new root.YT.Player(frame,{events:{
   onReady:e=>{player=e.target;ready=true;status.textContent='Captions follow playback when the video plays inside Habla. Timings are drafts.';draw(true);},
   onError:e=>{status.textContent='YouTube blocked in-app playback (code '+e.data+'). Open the original on YouTube; the English study lines remain available.';},
   onStateChange:()=>draw(true)
  }});
 }catch{status.textContent='YouTube sync unavailable; use manual time controls.';}
}
const oldCallback=root.onYouTubeIframeAPIReady;
root.onYouTubeIframeAPIReady=function(){if(typeof oldCallback==='function')oldCallback();connect();};
if(root.YT&&root.YT.Player)connect();else{
 const s=document.createElement('script');s.async=true;s.src='https://www.youtube.com/iframe_api';
 s.onerror=()=>{status.textContent='Player sync unavailable. Read the captions below or use YouTube settings.';};
 document.head.append(s);
}
root.setInterval(()=>{if(!document.hidden&&document.getElementById('music-view')?.classList.contains('active'))draw(false);},300);
const observer=new MutationObserver(()=>{if(!document.getElementById('music-view')?.classList.contains('active')&&ready){try{player.pauseVideo();}catch{}}});
observer.observe(document.getElementById('music-view'),{attributes:true,attributeFilter:['class']});
renderPassages();draw(true);
})(window);