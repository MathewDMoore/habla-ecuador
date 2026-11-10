/* Swipe only between the five main app tabs. Never steal horizontal gestures
   from edit controls, lyrics, media, scrollers, dialogs or iOS edge navigation. */
(function(root){
 'use strict';
 const TABS=['home-view','translator-view','dictionary-view','music-view','lesson-view'];
 const UNSAFE='button,a,input,textarea,select,label,summary,[contenteditable],[role="slider"],[role="button"],[data-swipe-block],audio,video,iframe,.lyric-lines,.ve-caption-list,.translation-history-list,.subtitle-switch,.face-to-face-panels';
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
 function isSwipe(dx,dy){
  return Math.abs(dx)>=68 && Math.abs(dx)>Math.abs(dy)*1.65;
 }
 function bind({navigate,enabled=()=>true}={}){
  if(typeof navigate!=='function')return;
  if(document.documentElement.dataset.hablaSwipeBound==='true')return;
  document.documentElement.dataset.hablaSwipeBound='true';
  let start=null;
  document.addEventListener('touchstart',event=>{
   start=null;
   if(event.touches.length!==1||!enabled())return;
   if(document.querySelector('dialog[open], [popover]:popover-open, #tutorial-overlay:not([hidden])'))return;
   const target=event.target;
   const view=target?.closest?.('.view.active');
   if(!view||!TABS.includes(view.id)||inBlockedTarget(target)||scrollsHorizontally(target))return;
   const touch=event.touches[0];
   const width=root.innerWidth||document.documentElement.clientWidth;
   if(touch.clientX<28||touch.clientX>width-28)return; // respect OS back gestures
   start={x:touch.clientX,y:touch.clientY,view:view.id,target};
  },{passive:true});
  document.addEventListener('touchend',event=>{
   if(!start||event.changedTouches.length!==1){start=null;return;}
   const first=start;start=null;
   if(!enabled()||document.querySelector('dialog[open], [popover]:popover-open, #tutorial-overlay:not([hidden])'))return;
   if(document.querySelector('.view.active')?.id!==first.view)return;
   const touch=event.changedTouches[0];
   const dx=touch.clientX-first.x,dy=touch.clientY-first.y;
   if(!isSwipe(dx,dy))return;
   // Swipe left means next tab, swipe right previous tab.
   const to=nextTab(first.view,dx<0?1:-1);
   if(to)navigate(to);
  },{passive:true});
  document.addEventListener('touchcancel',()=>{start=null;},{passive:true});
 }
 root.HablaSwipeNavigation={TABS,nextTab,isSwipe,bind};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.HablaSwipeNavigation;
})(typeof window!=='undefined'?window:globalThis);
