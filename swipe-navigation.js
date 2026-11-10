/* Swipe between the five main app tabs, including from idle Face to Face. */
(function(root){
 'use strict';
 const TABS=['home-view','translator-view','dictionary-view','music-view','lesson-view'];
 const UNSAFE='input,textarea,select,[contenteditable],[role="slider"],[data-swipe-block],.push-to-talk,[data-face-mic],.face-to-face-actions,audio,video,iframe,.lyric-lines,.ve-caption-list,.translation-history-list,.subtitle-switch';
 const SURFACE='.app-shell main, .bottom-nav';
 const OVERLAY='dialog[open]:not(#face-to-face), :is([popover]:popover-open), #tutorial-overlay:not([hidden])';
 const SWIPE_DISTANCE=28, DRAG_START_DISTANCE=6, HORIZONTAL_RATIO=1.3;
 function inBlockedTarget(target){
  return Boolean(target?.closest?.(UNSAFE));
 }
 function scrollsHorizontally(target){
  let node=target;
  while(node&&node!==document.body){
   if(node.scrollWidth>node.clientWidth+12){
    const style=typeof root.getComputedStyle==='function'?root.getComputedStyle(node):null;
    if(style&&/(auto|scroll)/.test(style.overflowX))return true;
   }
   node=node.parentElement;
  }
  return false;
 }
 function nextTab(current,delta){
  const at=TABS.indexOf(current);
  return at>=0&&TABS[at+delta]?TABS[at+delta]:null;
 }
 function isSwipe(dx,dy,duration=Infinity){
  const distance=Math.abs(dx);
  return (distance>=SWIPE_DISTANCE || (distance>=18&&duration>=0&&duration<=260))
   && distance>Math.abs(dy)*HORIZONTAL_RATIO;
 }
 function bind({navigate,enabled=()=>true}={}){
  if(typeof navigate!=='function')return;
  if(document.documentElement.dataset.hablaSwipeBound==='true')return;
  document.documentElement.dataset.hablaSwipeBound='true';
  let start=null;
  const currentScreen=()=>enabled()&&!document.querySelector(OVERLAY)
   ? document.querySelector('#face-to-face[open]')||document.querySelector('.view.active')
   : null;
  document.addEventListener('touchstart',event=>{
   start=null;
   if(event.touches.length!==1)return;
   const screen=currentScreen();
   if(!screen)return;
   const target=event.target;
   const inFace=screen.id==='face-to-face';
   if(!target?.closest?.(inFace?'#face-to-face':SURFACE))return;
   const tab=inFace?'translator-view':screen.id;
   if(!TABS.includes(tab)||inBlockedTarget(target)||scrollsHorizontally(target))return;
   const touch=event.touches[0];
   const width=root.innerWidth||document.documentElement.clientWidth;
   if(touch.clientX<28||touch.clientX>width-28)return; // respect OS back gestures
   start={x:touch.clientX,y:touch.clientY,time:event.timeStamp,screen,tab,horizontal:false};
  },{passive:true});
  // Claim a sideways drag before WebKit takes it over or taps the start target.
  // Leave vertical scrolling, ordinary taps and pinch gestures to the browser.
  document.addEventListener('touchmove',event=>{
   if(!start)return;
   if(event.touches.length!==1||currentScreen()!==start.screen){start=null;return;}
   const touch=event.touches[0];
   const dx=Math.abs(touch.clientX-start.x),dy=Math.abs(touch.clientY-start.y);
   if(!start.horizontal){
    if(dy>=12&&dy>dx*1.15){start=null;return;}
    if(dx<DRAG_START_DISTANCE||dx<=dy*HORIZONTAL_RATIO)return;
    start.horizontal=true;
   }
   if(event.cancelable)event.preventDefault();
  },{passive:false});
  document.addEventListener('touchend',event=>{
   if(!start||event.changedTouches.length!==1){start=null;return;}
   const first=start;start=null;
   if(!first.horizontal||currentScreen()!==first.screen)return;
   const touch=event.changedTouches[0];
   const dx=touch.clientX-first.x,dy=touch.clientY-first.y;
   if(!isSwipe(dx,dy,event.timeStamp-first.time))return;
   // Swipe left means next tab, swipe right previous tab.
   const to=nextTab(first.tab,dx<0?1:-1);
   if(to){if(event.cancelable)event.preventDefault();navigate(to);}
  },{passive:false});
  document.addEventListener('touchcancel',()=>{start=null;},{passive:true});
 }
 root.HablaSwipeNavigation={TABS,nextTab,isSwipe,bind};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.HablaSwipeNavigation;
})(typeof window!=='undefined'?window:globalThis);
