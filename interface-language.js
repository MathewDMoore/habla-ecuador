/* A reversible, local UI layer. Never rebuild editors or translate their values. */
(function(root){
 'use strict';
 const KEY='habla-ui-language-v1',allowed=new Set(['en','es']);
 const strings=typeof module==='object'&&module.exports?require('./interface-es.js'):root.HablaInterfaceSpanish;
 function resolve(search,stored){const requested=new URLSearchParams(search).get('ui');return allowed.has(requested)?requested:allowed.has(stored)?stored:'en';}
 let language='en';
 const normalize=s=>s.replace(/\s+/g,' ').trim();
 function translateOne(text){
  const s=normalize(text);
  if(Object.hasOwn(strings,s))return strings[s];
  const patterns=[
   [/^(\d+) of (\d+) reviewed · entry (\d+)$/,(_,a,b,c)=>`${a} de ${b} revisadas · entrada ${c}`],
   [/^Entry (\d+) of (\d+)$/,(_,a,b)=>`Entrada ${a} de ${b}`],
   [/^Phrase (\d+) of (\d+)$/,(_,a,b)=>`Frase ${a} de ${b}`],
   [/^(\d+) saved contributions · all pending verification$/,(_,a)=>`${a} aportes guardados · todos pendientes de verificación`],
   [/^(\d+) entr(?:y|ies) · (.+)$/,(_,a,b)=>`${a} entradas · ${t(b,'es')}`],
   [/^Entry covers: (.+)$/,(_,a)=>`Esta entrada abarca: ${t(a,'es')}`],
   [/^Active filters: (.+)$/,(_,a)=>`Filtros activos: ${a}`],
   [/^No entries match these filters\. (\d+) indexed matches are hidden by the usage, category or tone filters\.$/,(_,a)=>`No hay entradas con estos filtros. Hay ${a} coincidencias ocultas por los filtros de uso, categoría o tono.`],
   [/^No entries match this regional view\. (\d+) indexed matches are available in other regional views\.$/,(_,a)=>`No hay entradas en esta región. Hay ${a} coincidencias en otras regiones.`],
   [/^Recognized-word score: (\d+)% · (\d+) matched, (\d+) expected, (\d+) heard\. This is not a pronunciation score\.$/,(_,a,b,c,d)=>`Coincidencia de palabras: ${a}% · ${b} coinciden, ${c} esperadas, ${d} reconocidas. No es una puntuación de pronunciación.`],
   [/^Full prompt: (.+)$/,(_,a)=>`Frase completa: ${a}`],
   [/^Focus: (.+)$/,(_,a)=>`Practicar: ${a}`],
   [/^Try this part: (.+)\. Hear it, say it on its own, then return to the full prompt\.$/,(_,a)=>`Prueba esta parte: ${a}. Escúchala, repítela sola y vuelve a la frase completa.`],
   [/^Translating the full Spanish transcript into (U\.K\.|U\.S\.) English…$/,(_,a)=>`Traduciendo la transcripción completa al inglés ${a==='U.K.'?'británico':'estadounidense'}…`],
   [/^Full transcript translated · (U\.K\.|U\.S\.) English · (on device|online)\. Editable draft; not timed captions\.$/,(_,a,b)=>`Transcripción completa traducida · inglés ${a==='U.K.'?'británico':'estadounidense'} · ${b==='online'?'en línea':'en el dispositivo'}. Borrador editable; no son subtítulos sincronizados.`],
   [/^iPhone speech · native (.+)$/,(_,a)=>`Voz del iPhone · versión nativa ${a}`],
   [/^Hear (Spanish word|Spanish example|U\.S\. meaning|U\.K\. meaning)$/,(_,a)=>`Escuchar ${t(a,'es').toLowerCase()}`],
   [/^Source sense: (.+) · checked (.+)$/,(_,a,b)=>`Acepción de la fuente: ${a} · comprobada ${b}`],
   [/^Delete contribution: (.+)$/,(_,a)=>`Eliminar aporte: ${a}`],
   [/^(U\.K\.|U\.S\.) English · editable Habla transcript translation$/,(_,a)=>`Inglés ${a==='U.K.'?'británico':'estadounidense'} · traducción editable de Habla`]
  ];
  for(const [pattern,replacement]of patterns)if(pattern.test(s))return s.replace(pattern,replacement);
  return s;
 }
 function t(text,lang=language){
  if(lang!=='es'||typeof text!=='string')return text;
  const clean=normalize(text),direct=translateOne(clean);
  if(direct!==clean)return direct;
  const decorated=clean.match(/^([^\p{L}\p{N}]+)(.+)$/u);
  if(decorated)return decorated[1]+t(decorated[2],lang);
  if(clean.startsWith('Source: '))return 'Fuente: '+clean.slice(8);
  if(clean.startsWith('Literal English: '))return 'Inglés literal: '+clean.slice(17);
  if(clean.includes(' — '))return clean.split(' — ').map(part=>t(part,lang)).join(' — ');
  if(clean.includes(' · '))return clean.split(' · ').map(translateOne).join(' · ');
  const sentences=clean.split(/(?<=[.!?])\s+(?=[A-Z])/);
  return sentences.length>1?sentences.map(translateOne).join(' '):text;
 }
 const api={t,resolve,get language(){return language;},set};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 root.HablaUI=api;
 const originals=new WeakMap(),attrs=new WeakMap();
 const protectedSelector='script,style,textarea,input,[translate="no"],[data-ui-content],#suggestion-list,#natural-result,#literal-result,#conversation-status,.turn p,.translated,.translation-text,.heard p:first-of-type,.expression-spanish,.lyric-en,.lyric-es,.rhythm-definition>strong,#slang-index-list li>div>span,.english-gloss,.expression-english,.regional-gloss,.review-gloss,.expression-example,.evidence-example,.dictionary-practice-target,.dictionary-practice-heard,.dictionary-practice-whole,.dictionary-practice-progress,.spanish,.english,.source-practice-meaning,#regional-slang-results h3,#dictionary-results h2,#expression-results h3,#review-card h2';
 function protectedText(element){return !element||Boolean(element.closest(protectedSelector));}
 function textNode(node){
  if(protectedText(node.parentElement)||!node.nodeValue?.trim())return;
  const previous=originals.get(node),current=node.nodeValue;
  const source=previous&&current===previous.output?previous.source:current;
  const translated=t(source),prefix=source.match(/^\s*/)[0],suffix=source.match(/\s*$/)[0];
  const output=translated===source?source:prefix+translated.trim()+suffix;
  originals.set(node,{source,output});
  if(output!==current){
   if(node.parentElement.tagName==='OPTION'&&!node.parentElement.hasAttribute('value'))node.parentElement.setAttribute('value',node.parentElement.value);
   node.nodeValue=output;
  }
 }
 function attributes(element){
  if(element.id!=='interface-language'&&element.closest('[translate="no"],[data-ui-content],script,style'))return;
  for(const name of ['aria-label','placeholder','title','label']){
   if(!element.hasAttribute(name)||(name==='label'&&element.tagName!=='OPTGROUP'))continue;
   const values=attrs.get(element)||{},previous=values[name],current=element.getAttribute(name);
   const source=previous&&current===previous.output?previous.source:current;
   const output=t(source);values[name]={source,output};attrs.set(element,values);
   if(output!==current)element.setAttribute(name,output);
  }
 }
 function apply(node){
  if(node.nodeType===3){textNode(node);return;}
  if(node.nodeType!==1)return;
  attributes(node);
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let child;while((child=walker.nextNode())){if(child.nodeType===3)textNode(child);else attributes(child);}
 }
 function set(next){
  if(!allowed.has(next))return;
  language=next;try{localStorage.setItem(KEY,next);}catch{}
  document.documentElement.lang=next;
  const selector=document.getElementById('interface-language');if(selector)selector.value=next;
  apply(document.body);
  document.dispatchEvent(new CustomEvent('habla-ui-language-change',{detail:{language:next}}));
 }
 let saved=null;try{saved=localStorage.getItem(KEY);}catch{}
 language=resolve(location.search,saved);document.documentElement.lang=language;
 if(allowed.has(new URLSearchParams(location.search).get('ui')))try{localStorage.setItem(KEY,language);}catch{}
 function bind(){
  const selector=document.getElementById('interface-language');if(selector){selector.value=language;selector.addEventListener('change',()=>set(selector.value));}
  apply(document.body);
  const observer=new MutationObserver(records=>{
   const roots=new Set();for(const r of records){if(r.type==='characterData')roots.add(r.target);else if(r.type==='attributes')roots.add(r.target);else for(const n of r.addedNodes)roots.add(n);}
   for(const n of roots)if(n.isConnected)apply(n);
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','label']});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})(typeof window==='object'?window:globalThis);
