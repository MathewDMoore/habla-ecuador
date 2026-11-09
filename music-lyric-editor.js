/* Device-local corrections to music captions. A tap opens the iOS keyboard
   right beside the phrase; no audio, captions or edits are uploaded.
   Original song/transcript data remains untouched and restorable. */
(function(root){
  'use strict';
  const STORE='habla-ecuador-music-lyric-edits-v1';
  const MAX_RECORDS=160,MAX_TEXT=3000;
  let records=null,active=null;
  function load(){
    if(records)return records;
    try{
      const stored=JSON.parse(root.localStorage?.getItem(STORE)||'{}');
      records=stored&&typeof stored==='object'&&!Array.isArray(stored)?stored:{};
    }catch{records={};}
    return records;
  }
  function originalOrSaved(key,original){
    const stored=load()[key];
    return typeof stored==='string'&&stored.trim()?stored:String(original||'');
  }
  function keep(key,text,original){
    if(!key||key.length>320)return false;
    const values=load(),trimmed=String(text).trim(),base=String(original||'').trim();
    if(!trimmed||trimmed.length>MAX_TEXT) return false;
    if(trimmed===base)delete values[key];
    else{
      if(!Object.hasOwn(values,key)&&Object.keys(values).length>=MAX_RECORDS)
        delete values[Object.keys(values)[0]];
      values[key]=trimmed;
    }
    try{root.localStorage?.setItem(STORE,JSON.stringify(values));return true;}
    catch{return false;}
  }
  function restore(key){
    delete load()[key];
    try{root.localStorage?.setItem(STORE,JSON.stringify(load()));return true;}
    catch{return false;}
  }
  function node(tag,className,text){
    const element=document.createElement(tag);
    if(className)element.className=className;
    if(text!==undefined)element.textContent=text;
    return element;
  }
  function close(){
    if(!active)return;
    active.panel.remove();
    active=null;
  }
  function show({key,original='',label='Lyric / Letra',anchor,after=anchor,maxLength=MAX_TEXT,onChange,pause}={}){
    if(!key||!anchor||!after||!document.contains(anchor))return;
    if(active&&active.key===key){active.input.focus();return;}
    close();
    const base=String(original);
    const panel=node('section','music-inline-correction');
    panel.setAttribute('aria-label','Correct lyric or translation / Corregir letra o traducción');
    const heading=node('label','music-inline-correction-label',label);
    const field=node('textarea','music-inline-correction-text');
    field.id='music-correction-'+String(key).replace(/[^a-z0-9-]/gi,'-').slice(0,90);
    field.rows=3;
    field.maxLength=Math.min(MAX_TEXT,Math.max(80,Number(maxLength)||MAX_TEXT));
    field.value=originalOrSaved(key,base);
    field.setAttribute('lang',String(key.includes(':es')?'es':'en'));
    field.setAttribute('autocomplete','off');
    field.setAttribute('autocapitalize','sentences');
    heading.htmlFor=field.id;
    const actions=node('div','music-inline-correction-actions');
    const save=node('button','music-inline-correction-save','Guardar / Save');
    const cancel=node('button','music-inline-correction-cancel','Cancelar / Cancel');
    const reset=node('button','music-inline-correction-reset','Restaurar original / Restore');
    for(const button of [save,cancel,reset])button.type='button';
    const notice=node('p','music-inline-correction-notice','La corrección queda en este dispositivo. No cambia el audio ni sincroniza los tiempos. / On this device only; timing and audio are unchanged.');
    notice.setAttribute('role','status');
    actions.append(save,cancel,reset);
    panel.append(heading,field,actions,notice);
    after.insertAdjacentElement('afterend',panel);
    active={key,input:field,panel};
    // Pause before editing so the currently selected lyric does not scroll away.
    try{pause?.();}catch{}
    save.addEventListener('click',()=>{
      const value=field.value.trim();
      if(!value){notice.textContent='Escribe la corrección antes de guardar. / Enter corrected wording before saving.';field.focus();return;}
      const persisted=keep(key,value,base);
      if(value.length>MAX_TEXT){notice.textContent='La corrección es demasiado larga. / Correction is too long.';field.focus();return;}
      onChange?.(value);
      close();
      if(!persisted){
        // In private browsing, saved values may only last for this app session.
        const status=document.getElementById('ve-video-status');
        if(status)status.textContent='Correction applied for this session; device storage is unavailable.';
      }
    });
    cancel.addEventListener('click',close);
    reset.addEventListener('click',()=>{
      restore(key);
      onChange?.(base);
      close();
    });
    field.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();}
      if((event.metaKey||event.ctrlKey)&&event.key==='Enter'){event.preventDefault();save.click();}
    });
    // Focus directly within the original user tap handler: iOS Safari/WKWebView
    // permits the virtual keyboard here, unlike delayed/async programmatic focus.
    field.focus();
    try{field.setSelectionRange(field.value.length,field.value.length);}catch{}
  }
  function makeTappable(element,callback){
    if(!element)return;
    element.tabIndex=0;
    element.setAttribute('role','button');
    element.setAttribute('aria-label','Corregir letra o traducción / Tap to edit lyrics');
    element.classList.add('music-edit-tap-target');
    element.addEventListener('click',callback);
    element.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();callback();}
    });
  }
  root.HablaMusicLyricEditing={get:originalOrSaved,show,close,makeTappable,restore};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.HablaMusicLyricEditing;
})(typeof window!=='undefined'?window:globalThis);
