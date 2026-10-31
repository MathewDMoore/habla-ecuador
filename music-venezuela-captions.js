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
const frame=id('youtube-frame'),localVideo=id('local-video'),videoPicker=id('local-file'),
playerStart=id('player-start'),tryYoutube=id('youtube-try'),
caption=id('caption-overlay'),reading=id('caption-reading'),
lang=id('caption-language'),source=id('source-choice'),status=id('video-status'),
confidence=id('caption-confidence'),timing=id('video-time'),timeLabel=id('video-time-label'),
offsetInput=id('caption-offset'),offsetLabel=id('offset-value'),passages=id('lyric-comparison'),
list=id('caption-cue-list'),sizeSelect=id('caption-size'),
theaterButton=id('habla-theater'),theaterClose=id('theater-close'),
theaterEnglish=id('theater-english'),inVideoLanguage=id('in-video-language');
// Keep the original nodes/listeners, but reserve a caption area outside the
// embedded player's rectangle. YouTube owns its controls and their positions.
const captionDock=document.createElement('div');
captionDock.className='ve-caption-dock';
captionDock.setAttribute('aria-label','English captions and language');
const videoBox=frame.closest('.ve-video-box');
videoBox.after(captionDock);
captionDock.append(inVideoLanguage.closest('.ve-in-video-switch'),caption);
function applyCaptionSize(value){
 const next=['standard','large','extra'].includes(value)?value:'large';
 host.dataset.captionSize=next;
 sizeSelect.value=next;
 try{root.localStorage?.setItem('habla-ve-caption-size-v1',next);}catch{}
}
let savedCaptionSize='large';
try{savedCaptionSize=root.localStorage?.getItem('habla-ve-caption-size-v1') || 'large';}catch{}
applyCaptionSize(savedCaptionSize);
sizeSelect.addEventListener('change',()=>applyCaptionSize(sizeSelect.value));
let player,ready=false,manual=0,offset=0,last=-2,sourceMode='none',localUrl=null,youtubeStarted=false;
let theaterOpen=false,previousFocus=null;
const expandedStage=host.querySelector('.ve-stage');
const expandPlayer=document.createElement('button');
expandPlayer.id='ve-player-expand';expandPlayer.type='button';
expandPlayer.textContent='⛶ Expand video + English / Ampliar video + inglés';
expandPlayer.setAttribute('aria-expanded','false');
expandedStage.before(expandPlayer);
expandPlayer.addEventListener('click',()=>theaterButton.click());
function setTheater(open){
 if(Boolean(open)===theaterOpen)return;
 theaterOpen=Boolean(open);
 host.classList.toggle('ve-theater-mode',theaterOpen);
 document.body.classList.toggle('ve-theater-open',theaterOpen);
 theaterButton.setAttribute('aria-pressed',String(theaterOpen));
 expandPlayer.setAttribute('aria-expanded',String(theaterOpen));
 if(theaterOpen){
  previousFocus=document.activeElement;
  // The top layer escapes clipping/transforms injected by the signed shell,
  // keeping the same iframe and its caption nodes alive in their original DOM.
  if(typeof expandedStage.showPopover==='function'){
   expandedStage.setAttribute('popover','manual');
   try{expandedStage.showPopover();}catch{expandedStage.removeAttribute('popover');}
  }
  // The YouTube iframe stays inline, so its fullscreen view never hides
  // Habla's separately rendered English caption track.
  theaterClose.focus();
 }else{
  if(expandedStage.hasAttribute('popover')){
   try{expandedStage.hidePopover();}catch{}
   expandedStage.removeAttribute('popover');
  }
  previousFocus?.focus?.();
  previousFocus=null;
 }
 draw(true);
}
theaterButton.addEventListener('click',()=>{
 if(sourceMode==='none')tryYoutube.click();
 setTheater(true);
});
theaterClose.addEventListener('click',()=>setTheater(false));
document.addEventListener('keydown',event=>{
 if(theaterOpen && event.key==='Escape'){event.preventDefault();setTheater(false);}
});
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function position(){
 if(sourceMode==='local')return Number(localVideo.currentTime)||0;
 if(sourceMode==='youtube'){
  try{if(ready&&player&&typeof player.getCurrentTime==='function')return Number(player.getCurrentTime())||0;}catch{}
 }
 return manual;
}
function selectedCue(seconds){return cues.findIndex(c=>seconds>=c[0]&&seconds<c[1]);}
function draw(force){
 const now=position();timeLabel.textContent=fmt(now);
 if((sourceMode==='local'||ready)&&document.activeElement!==timing){timing.value=String(Math.round(now));manual=now;}
 const index=selectedCue(now+offset);
 if(index===last&&!force)return;last=index;const cue=cues[index];
 const enabled=lang.value!=='off';
 // The YouTube IFrame API must confirm the current playback time before
 // applying any time-coded words. Never pretend a guessed cue is synchronized.
 const synced=sourceMode!=='youtube'||ready;
 const text=enabled&&synced&&cue?(lang.value==='en-GB'&&cue[3]?cue[3]:cue[2]):'';
 const onVideo=sourceMode==='youtube'||sourceMode==='local';
 const waitingForSync=onVideo&&sourceMode==='youtube'&&!ready;
 const overlayText=text||(enabled&&waitingForSync?'🇺🇸 English on · connecting to video time…':'');
 caption.hidden=!(onVideo&&enabled&&overlayText);
 caption.textContent=overlayText;
 // The video itself is cross-origin; its fullscreen playback hides the page.
 // Keep an English caption strip in Habla's own viewing mode, adjacent to video.
 theaterEnglish.textContent=text||(!enabled?'English captions are off. Select English in Translation / Traducción.'
  :sourceMode==='youtube'&&!ready?'Connecting to YouTube timing. Tap Play; if text stays still, review the caption timeline below.'
  :'No verified English caption for this moment. Timing is approximate.');
 reading.textContent=text||(sourceMode==='none'
  ?'English lyric translations are ready below. Choose a saved screen recording to follow them during playback.'
  :enabled?'No caption verified for this moment.':'English captions off.');
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
 if(sourceMode==='local'){
   try{localVideo.currentTime=Math.min(sec,Number.isFinite(localVideo.duration)?localVideo.duration:sec);}catch{}
 } else if(sourceMode==='youtube'&&ready&&player&&typeof player.seekTo==='function'){
   try{player.seekTo(sec,true);}catch{}
 } else {
   status.textContent='Manual caption timeline. Choose a saved video to synchronize it here.';
 }
 draw(true);
}
for(let i=0;i<cues.length;i++){
 const cue=cues[i],button=document.createElement('button');button.type='button';
 button.textContent=fmt(cue[0])+' '+cue[2];button.addEventListener('click',()=>seek(cue[0]));list.append(button);
}
function syncInVideoLanguage(){
 inVideoLanguage.value=lang.value;
 inVideoLanguage.parentElement.hidden=!(sourceMode==='youtube'||sourceMode==='local');
 draw(true);renderPassages();
}
lang.addEventListener('change',syncInVideoLanguage);
inVideoLanguage.addEventListener('change',()=>{
 lang.value=inVideoLanguage.value;
 syncInVideoLanguage();
});
source.addEventListener('change',renderPassages);
timing.addEventListener('input',()=>{manual=Number(timing.value);timeLabel.textContent=fmt(manual);});
timing.addEventListener('change',()=>seek(Number(timing.value)));
offsetInput.addEventListener('input',()=>{offset=Number(offsetInput.value);offsetLabel.textContent=(offset>=0?'+':'')+offset.toFixed(1)+'s';draw(true);});
id('previous').addEventListener('click',()=>seek(Math.max(0,position()-10)));
id('next').addEventListener('click',()=>seek(Math.min(188,position()+10)));
function importLocalVideo(file){
 if(!file)return;
 if(!(file.type.startsWith('video/')||/\.(mp4|mov|m4v)$/i.test(file.name))){
  status.textContent='Choose an MP4, MOV or another supported video file from Photos or Files.';return;
 }
 try{
  const next=root.URL.createObjectURL(file);
  if(localUrl)root.URL.revokeObjectURL(localUrl);
  localUrl=next;
  try{if(ready&&player&&typeof player.pauseVideo==='function')player.pauseVideo();}catch{}
  sourceMode='local';ready=false;manual=0;last=-2;
  syncInVideoLanguage();
  localVideo.src=localUrl;localVideo.hidden=false;
  frame.hidden=true;playerStart.hidden=true;caption.hidden=true;
  status.textContent='Saved video loaded from this device. Tap play; Habla English captions follow the video time. Adjust caption offset if needed.';
  localVideo.load();
  draw(true);
 }catch(e){
  status.textContent='Could not open that video on this device. Please choose a playable MP4 or MOV file.';
 }
}
videoPicker.addEventListener('change',()=>importLocalVideo(videoPicker.files&&videoPicker.files[0]));
localVideo.addEventListener('loadedmetadata',()=>{
 const duration=Number(localVideo.duration)||188;
 timing.max=String(Math.max(188,Math.ceil(duration)));
 draw(true);
});
for(const event of ['timeupdate','seeked','play','pause','loadeddata']){
 localVideo.addEventListener(event,()=>{if(sourceMode==='local')draw(true);});
}
localVideo.addEventListener('error',()=>{
 if(sourceMode==='local')status.textContent='This recording could not play here. Try an MP4 or MOV saved on your iPhone.';
});
function connect(){
 if(!root.YT||!root.YT.Player||sourceMode!=='youtube')return;
 try{
  player=new root.YT.Player(frame,{events:{
   onReady:e=>{
    player=e.target;ready=true;
    status.textContent='YouTube is attempting inline playback. If it leaves Habla, use a saved video instead so English captions remain visible.';
    draw(true);
   },
   onError:e=>{
    status.textContent='YouTube refuses embedded playback (code '+e.data+'). Choose a saved recording; your English translations stay here.';
   },
   onStateChange:()=>draw(true)
  }});
 }catch{
  status.textContent='YouTube inline playback is unavailable. Choose a saved recording to keep subtitles in Habla.';
 }
}
const previousYoutubeReady=root.onYouTubeIframeAPIReady;
root.onYouTubeIframeAPIReady=function(){
 if(typeof previousYoutubeReady==='function')previousYoutubeReady();
 connect();
};
tryYoutube.addEventListener('click',()=>{
 try{localVideo.pause();}catch{}
 sourceMode='youtube';ready=false;last=-2;
 syncInVideoLanguage();
 localVideo.hidden=true;playerStart.hidden=true;frame.hidden=false;
 status.textContent='Trying YouTube inside Habla. On some iPhones YouTube may take over playback; Habla cannot keep captions over that external player.';
 if(!youtubeStarted){
  youtubeStarted=true;
  frame.src=frame.dataset.src;
  if(root.YT&&root.YT.Player)connect();
  else{
   const script=document.createElement('script');
   script.async=true;script.src='https://www.youtube.com/iframe_api';
   script.onerror=()=>{status.textContent='YouTube controls could not load. Try a saved video for captions.';};
   document.head.append(script);
  }
 } else {
  if(root.YT&&root.YT.Player&&!ready)connect();
 }
 draw(true);
});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden)return;
 if(sourceMode==='local')try{localVideo.pause();}catch{}
});
root.setInterval(()=>{if(!document.hidden&&document.getElementById('music-view')?.classList.contains('active'))draw(false);},300);
// Only the updated native shell opts in: previous iPhone builds redirected
// YouTube subframe navigations to the external app. Never auto-load in Safari.
function showNativePlayerOnMusicTab(){
 if(root.__hablaNativeInlineVideo===true && sourceMode==='none' &&
    document.getElementById('music-view')?.classList.contains('active')){
   tryYoutube.click(); // Loads the frame, never auto-plays video or audio.
   status.textContent='The video is now in the Habla Music tab. Tap its play button to start; English captions appear below the player.';
 }
}
// The native iOS Music layout moves older sections into a CLOSED
// "Explore recordings & culture" panel. Keep BYE BYE's video and caption
// companion above the translation controls, visible without expanding it.
function exposeFeaturedVideoInNativeMusic(){
 if(root.__hablaNativeInlineVideo!==true)return;
 const music=document.getElementById('music-view');
 const workspace=document.getElementById('native-music-workspace');
 if(!music||!workspace||host.parentElement===music)return;
 music.insertBefore(host,workspace); // move, never duplicate IDs or handlers
}
// The native bridge runs its own DOMContentLoaded callback. The direct-child
// observer also covers either registration order without watching caption text.
const nativeLayoutObserver=new MutationObserver(exposeFeaturedVideoInNativeMusic);
nativeLayoutObserver.observe(document.getElementById('music-view'),{childList:true});
document.addEventListener('DOMContentLoaded',exposeFeaturedVideoInNativeMusic,{once:true});
const observer=new MutationObserver(()=>{
 if(!document.getElementById('music-view')?.classList.contains('active')){
  if(theaterOpen)setTheater(false);
  if(sourceMode==='local')try{localVideo.pause();}catch{}
  if(sourceMode==='youtube'&&ready)try{player.pauseVideo();}catch{}
 } else showNativePlayerOnMusicTab();
});
observer.observe(document.getElementById('music-view'),{attributes:true,attributeFilter:['class']});
renderPassages();syncInVideoLanguage();showNativePlayerOnMusicTab();
})(window);
