/* Retain the real controls and handlers when the result is empty or pending. */
const HablaTranslationControls=(()=>{
 function bind(){
  const result=document.querySelector('#translation-result'),input=document.querySelector('#translator-input');
  if(!result||!input||document.querySelector('#translation-action-dock'))return;
  const nodes=['#translation-text-tools','#translation-copy-status','#translation-copy-fallback','#translation-result .result-actions','#translation-share-status','#translation-edit-status'].map(s=>document.querySelector(s)).filter(Boolean);
  const dock=document.createElement('section');dock.id='translation-action-dock';dock.setAttribute('aria-label','Translation actions');
  const translate=document.createElement('button');translate.type='button';translate.id='translate-now';translate.textContent='Translate / Traducir';
  const hint=document.createElement('p');hint.setAttribute('role','status');hint.textContent='Translate to enable Copy, Hear and Share.';
  dock.append(translate,hint);result.after(dock);
  translate.addEventListener('click',()=>{if(typeof retryTranslation==='function')retryTranslation();});
  const targetButtons=['copy-result','share-result','hear-result','translation-full-text','translation-expand','translation-text-smaller','translation-text-larger','translation-text-reset','translation-select-all'];
  let wasEmpty=null;
  function sync(){
   const empty=result.hidden||document.querySelector('#natural-result')?.getAttribute('contenteditable')!=='true';
   translate.disabled=!input.value.trim();hint.hidden=!empty;
   if(empty===wasEmpty)return;
   wasEmpty=empty;
   if(empty){for(const node of nodes)dock.append(node);for(const id of targetButtons){const b=document.getElementById(id);if(b){b.dataset.emptyWasDisabled=String(b.disabled);b.disabled=true;}}}
   else{
    const draft=document.querySelector('#natural-result');let anchor=draft;
    for(const node of nodes){anchor.after(node);anchor=node;}
    for(const id of targetButtons){const b=document.getElementById(id);if(b&&b.dataset.emptyWasDisabled!==undefined){b.disabled=b.dataset.emptyWasDisabled==='true';delete b.dataset.emptyWasDisabled;}}
    for(const id of ['copy-result','share-result','hear-result','translation-full-text','translation-expand','translation-select-all']){const b=document.getElementById(id);if(b)b.disabled=false;}
   }
   if(typeof updateSpeechPauseControls==='function')updateSpeechPauseControls();
  }
  new MutationObserver(sync).observe(result,{attributes:true,subtree:true,attributeFilter:['hidden','contenteditable']});
  input.addEventListener('input',sync);sync();
 }
 return{bind};
})();
