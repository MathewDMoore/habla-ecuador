/* Pointer and keyboard acknowledgement; does not claim the action succeeded. */
(() => {
  let pressed=null, releaseTimer;
  const clear=()=>{clearTimeout(releaseTimer);pressed?.classList.remove('is-pressed');pressed=null;};
  const start=target=>{
    const button=target?.closest?.('button');
    if(!button||button.disabled)return;
    clear();pressed=button;button.classList.add('is-pressed');
  };
  const release=()=>{clearTimeout(releaseTimer);releaseTimer=setTimeout(clear,160);};
  document.addEventListener('pointerdown',event=>{if(event.isPrimary!==false&&event.button===0)start(event.target);});
  document.addEventListener('pointerup',release);
  document.addEventListener('pointercancel',clear);
  document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.repeat)start(event.target);});
  document.addEventListener('keyup',event=>{if(event.key==='Enter'||event.key===' ')release();});
  window.addEventListener('blur',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
})();
