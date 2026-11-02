/* Retain the real controls and handlers when the result is empty or pending. */
const HablaTranslationControls=(()=>{
 function bind(){
  const result=document.querySelector('#translation-result'),input=document.querySelector('#translator-input');
  if(!result||!input||document.querySelector('#translation-action-dock'))return;
  // Language mistakes need to remain beside the source, not push a hidden
  // element between the original and its result.
  const sourceCard=input.closest('.input-card');
  const warning=document.querySelector('#source-language-warning');
  if(sourceCard&&warning)sourceCard.append(warning);
  // Existing controls keep their IDs and listeners. Only their presentation
  // changes: four frequent actions stay beside the draft; the rest fold away.
  const quick=document.createElement('div');quick.id='translation-quick-actions';quick.setAttribute('role','group');quick.setAttribute('aria-label','Quick translation actions');
  for(const id of ['hear-result','copy-result','translation-expand','translation-full-text','pause-result']){
   const button=document.getElementById(id);if(button)quick.append(button);
  }
  const more=document.createElement('details');more.id='translation-more-actions';
  const summary=document.createElement('summary');summary.textContent='More · Photos & settings / Fotos y ajustes';
  const moreBody=document.createElement('div');moreBody.className='translation-more-content';
  more.append(summary,moreBody);
  for(const selector of ['#translation-text-tools','#translation-result .result-actions','#translation-result .native-translation-tools','#translation-result .result-notes','#translation-edit-status','#shared-translation-workspace .translation-export']){
   const node=document.querySelector(selector);if(node)moreBody.append(node);
  }
  // Photo buttons remain immediately reachable (including before any output),
  // but no longer split the original text from its translation.
  const photos=document.querySelector('#image-quick-actions');
  const photoStatus=document.querySelector('#quick-image-status');
  if(photos)result.after(photos);
  if(photoStatus && photos)photos.after(photoStatus);
  const nodes=[quick,more,...['#inline-translation-alternatives','#translation-speaking-practice','#translation-copy-status','#translation-copy-fallback','#translation-share-status'].map(s=>document.querySelector(s)).filter(Boolean)];
  const dock=document.createElement('section');dock.id='translation-action-dock';dock.setAttribute('aria-label','Translation actions');
  const translate=document.createElement('button');translate.type='button';translate.id='translate-now';translate.textContent='Retry translation / Reintentar traducción';
  const hint=document.createElement('p');hint.setAttribute('role','status');hint.textContent='Type, paste or finish speaking to translate automatically. / Escribe, pega o termina de hablar para traducir automáticamente.';
  dock.append(translate,hint);result.after(dock);
  translate.addEventListener('click',()=>{if(typeof retryTranslation==='function')retryTranslation();});
  const targetButtons=['copy-result','share-result','hear-result','translation-full-text','translation-expand','translation-text-smaller','translation-text-larger','translation-text-reset','translation-select-all'];
  let wasEmpty=null;
  function sync(){
   const empty=result.hidden||document.querySelector('#natural-result')?.getAttribute('contenteditable')!=='true';
   const failed=document.querySelector('#no-result')?.hidden===false;
   translate.hidden=!failed;translate.disabled=!input.value.trim();hint.hidden=!empty;
   hint.textContent=failed ? 'Translation could not finish. Your text is kept; retry when ready. / No se pudo terminar la traducción. Tu texto se conserva; puedes reintentar.' : 'Type, paste or finish speaking to translate automatically. / Escribe, pega o termina de hablar para traducir automáticamente.';
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
  const failure=document.querySelector('#no-result');
  if(failure)new MutationObserver(sync).observe(failure,{attributes:true,attributeFilter:['hidden']});
  input.addEventListener('input',sync);sync();
 }
 return{bind};
})();
