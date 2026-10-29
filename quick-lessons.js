/* Original Habla micro-lessons, inspired by user-supplied teaching examples.
 * No third-party footage, presenter likeness, recording or transcript is bundled.
 */
(function(root){
'use strict';
const spanish=[
 {id:'solo-patterns',title:'Solo · solo si · solo por · solo con',
  explanation:'Solo means “only” or “just” when it limits something. Solo si introduces a condition (“only if”); solo por can introduce a reason or the thing someone came for (“just for”); solo con points to a required resource or condition (“only with”). Solo also means “alone” as an adjective. In a condition, si has no accent; sí with an accent means “yes”. Normally write solo without an accent.',
  examples:[['Solo necesito unos minutos.','I only need a few minutes.'],['Salgo contigo solo si deja de llover.','I will go out with you only if it stops raining.'],['Vine solo por la música.','I came just for the music.'],['Solo con paciencia vamos a aprender.','Only with patience are we going to learn.'],['Hoy quiero estar solo.','Today I want to be alone.']],
  situations:[{scene:'Tu amiga pregunta cuánto tiempo necesitas. Solo necesitas unos minutos.',phrase:'Solo necesito unos minutos.',meaning:'I only need a few minutes.'},{scene:'Te invitan a salir, pero afuera está lloviendo. Acepta con una condición.',phrase:'Salgo contigo solo si deja de llover.',meaning:'I will go out with you only if it stops raining.'},{scene:'Fuiste al festival para escuchar música y por ninguna otra razón.',phrase:'Vine solo por la música.',meaning:'I came just for the music.'},{scene:'Explícale a un amigo qué se necesita para aprender algo difícil.',phrase:'Solo con paciencia vamos a aprender.',meaning:'Only with patience are we going to learn.'}],
  checks:[
   {prompt:'_____ necesito unos minutos.',answer:'solo',options:['solo','solo si','solo por','solo con'],note:'Solo limits the amount of time. / Solo limita el tiempo.'},
   {prompt:'Salgo contigo _____ deja de llover.',answer:'solo si',options:['solo','solo si','solo por','solo con'],note:'Solo si introduces a condition. / Solo si introduce una condición.'},
   {prompt:'Vine _____ la música.',answer:'solo por',options:['solo','solo si','solo por','solo con'],note:'Solo por points to the reason for coming. / Solo por expresa el motivo.'},
   {prompt:'_____ paciencia vamos a aprender.',answer:'solo con',options:['solo','solo si','solo por','solo con'],note:'Solo con indicates what is needed. / Solo con indica lo necesario.'}
  ]},
 {id:'already-still',title:'Ya · todavía · todavía no',
  explanation:'Start with the situation: finished, continuing, or not finished yet. In these examples, ya marks completion, todavía marks something continuing, and todavía no means not yet. These words have other uses too.',
  examples:[['Ya terminé.','I already finished.'],['Todavía estoy trabajando.','I am still working.'],['Todavía no he terminado.','I have not finished yet.']],
  situations:[{scene:'A friend asks if you are ready. Your work is finished.',phrase:'Ya terminé.',meaning:'I already finished.'},{scene:'Your friend is ready to leave, but you are continuing to work.',phrase:'Todavía estoy trabajando.',meaning:'I am still working.'},{scene:'Someone asks if you have eaten. You have not eaten yet.',phrase:'Todavía no he comido.',meaning:'I have not eaten yet.'}]},
 {id:'por-para',title:'Por · para: follow the meaning',
  explanation:'For these situations, para points to a recipient, destination or purpose. Por can give a cause or describe a route through a place. English “for” does not choose the Spanish word for you. This is a starting point, not every use of por and para.',
  examples:[['Este café es para Ana.','This coffee is for Ana.'],['Voy para Quito.','I am heading to Quito.'],['Estudio para aprender.','I study in order to learn.'],['Gracias por tu ayuda.','Thank you for your help.'],['Camino por el parque.','I walk through the park.']],
  situations:[{scene:'You bought a coffee for Ana. Tell the server who will receive it.',phrase:'Este café es para Ana.',meaning:'This coffee is for Ana.'},{scene:'A friend helped you. Thank them for their help.',phrase:'Gracias por tu ayuda.',meaning:'Thank you for your help.'},{scene:'Describe your route: you walk through the park.',phrase:'Camino por el parque.',meaning:'I walk through the park.'}]},
 {id:'future',title:'Future plans: voy a · comeré',
  explanation:'For a plan, use voy a + the basic verb: voy a comer. Spanish also has future endings: comeré. Both can refer to the future; the choice depends on context. Learn the whole pattern, then change the activity.',
  examples:[['Voy a comer.','I am going to eat.'],['Voy a beber agua.','I am going to drink water.'],['Comeré más tarde.','I will eat later.']],
  situations:[{scene:'You have a plan to eat soon. Tell your friend what you are going to do.',phrase:'Voy a comer.',meaning:'I am going to eat.'},{scene:'You have your water bottle ready. Say you are going to drink water.',phrase:'Voy a beber agua.',meaning:'I am going to drink water.'},{scene:'You are busy now. Say that you will eat later.',phrase:'Comeré más tarde.',meaning:'I will eat later.'}]}
];
const english=[
 {id:'only-patterns',title:'Only · only if · just for · only with',
  explanation:'Only limits an amount or action. Only if introduces a condition, just for gives the reason or purpose, and only with says what is required. Pay attention to word order: “Only with patience can we improve.” In Spanish these often correspond to solo, solo si, solo por and solo con; translate the full meaning, not each word separately.',
  examples:[['I only need a few minutes.','Solo necesito unos minutos.'],['I will join you only if it stops raining.','Te acompaño solo si deja de llover.'],['I came just for the music.','Vine solo por la música.'],['Only with patience can we improve.','Solo con paciencia podemos mejorar.']],
  situations:[{scene:'Solo necesitas unos minutos. Díselo a tu amigo en inglés.',phrase:'I only need a few minutes.',meaning:'Solo necesito unos minutos.'},{scene:'Está lloviendo. Dile a tu amiga que irás con ella únicamente si deja de llover.',phrase:'I will join you only if it stops raining.',meaning:'Te acompaño solo si deja de llover.'},{scene:'Fuiste al festival únicamente por la música. Explícalo en inglés.',phrase:'I came just for the music.',meaning:'Vine solo por la música.'},{scene:'Explica en inglés que la paciencia es necesaria para mejorar.',phrase:'Only with patience can we improve.',meaning:'Solo con paciencia podemos mejorar.'}],
  checks:[
   {prompt:'I _____ need a few minutes.',answer:'only',options:['only','only if','just for','only with'],note:'Only limits how much time is needed. / Only limita el tiempo.'},
   {prompt:'I will join you _____ it stops raining.',answer:'only if',options:['only','only if','just for','only with'],note:'Only if gives a condition. / Only if expresa una condición.'},
   {prompt:'I came _____ the music.',answer:'just for',options:['only','only if','just for','only with'],note:'Just for identifies the reason. / Just for indica el motivo.'},
   {prompt:'_____ patience can we improve.',answer:'only with',options:['only','only if','just for','only with'],note:'Only with introduces what is necessary. / Only with indica lo necesario.'}
  ]},
 {id:'already-still',title:'Already · still · not yet',
  explanation:'Piensa en la situación: algo ya terminó, continúa o todavía no ha ocurrido. Already indica que algo ya pasó; still indica que continúa; not yet significa todavía no. Aprende las expresiones completas.',
  examples:[["I've already eaten.",'Ya he comido.'],["I'm still eating.",'Todavía estoy comiendo.'],["I haven't eaten yet.",'Todavía no he comido.']],
  situations:[{scene:'Te ofrecen comida, pero ya comiste. Explica por qué no necesitas comer.',phrase:"I've already eaten.",meaning:'Ya he comido.'},{scene:'Tu amistad quiere salir, pero sigues comiendo. Explica qué pasa.',phrase:"I'm still eating.",meaning:'Todavía estoy comiendo.'},{scene:'Te preguntan si ya comiste. Todavía no lo has hecho.',phrase:"I haven't eaten yet.",meaning:'Todavía no he comido.'}]},
 {id:'purpose',title:'For · to: destinatario y propósito',
  explanation:'Para indicar quién recibe algo, usa for: this is for Ana. Para expresar un propósito con una acción, usa to y el verbo: to learn. No traduzcas cada por o para con la misma palabra; fíjate en lo que quieres comunicar.',
  examples:[['This coffee is for Ana.','Este café es para Ana.'],['I study to learn English.','Estudio para aprender inglés.'],['Thank you for your help.','Gracias por tu ayuda.']],
  situations:[{scene:'Compraste un café para Ana. Indica quién lo recibirá.',phrase:'This coffee is for Ana.',meaning:'Este café es para Ana.'},{scene:'Explica tu propósito al estudiar: aprender inglés.',phrase:'I study to learn English.',meaning:'Estudio para aprender inglés.'},{scene:'Una amistad te ayudó. Dale las gracias por su ayuda.',phrase:'Thank you for your help.',meaning:'Gracias por tu ayuda.'}]},
 {id:'future',title:'Planes: going to · will',
  explanation:'Para comunicar un plan, practica I am going to y un verbo. Will también sirve para hablar del futuro, por ejemplo al tomar una decisión en ese momento. Estas formas tienen más usos: practica el contexto además de la estructura.',
  examples:[["I'm going to eat.",'Voy a comer.'],["I'm going to drink some water.",'Voy a beber agua.'],["I'll have tea, please.",'Tomaré té, por favor.']],
  situations:[{scene:'Ya tienes un plan para comer pronto. Cuenta qué vas a hacer.',phrase:"I'm going to eat.",meaning:'Voy a comer.'},{scene:'Tienes tu botella lista. Di que vas a beber agua.',phrase:"I'm going to drink some water.",meaning:'Voy a beber agua.'},{scene:'Te ofrecen café o té. Decides pedir té en ese momento.',phrase:"I'll have tea, please.",meaning:'Tomaré té, por favor.'}]}
];
const catalog={'es-EC':spanish,'en-US':english,'en-GB':english};
let locale='es-EC',selected={},situation=0,recall=false;
function leave(){const host=document.getElementById('quick-lessons');if(host){root.cancelDictionaryPractice(host);root.stopSpeechPlayback();}}
function setLearningLanguage(next){
 const host=document.getElementById('quick-lessons');if(!host)return;
 next=catalog[next]?next:'es-EC';
 if(host.dataset.learningLanguage===next)return;
 leave();locale=next;situation=0;recall=false;host.dataset.learningLanguage=next;render();
 if(!host.dataset.bound){host.dataset.bound='true';host.addEventListener('toggle',()=>{if(!host.open)leave();});}
}
function render(){
 const host=document.getElementById('quick-lessons'),content=document.getElementById('quick-lessons-content');if(!host||!content)return;
 const items=catalog[locale],item=items.find(i=>i.id===selected[locale])||items[0],cue=item.situations[situation],esc=root.escapeHtml;
 selected[locale]=item.id;
 const support=locale==='es-EC'?'en':'es-EC';
 content.innerHTML=`<label>Choose a short lesson<select id="quick-lesson-select">${items.map(i=>`<option value="${i.id}" ${i.id===item.id?'selected':''} data-ui-content>${esc(i.title)}</option>`).join('')}</select></label>
 <p lang="${support}" data-ui-content>${esc(item.explanation)}</p>
 <button type="button" id="quick-explanation-hear" class="secondary-button">🔊 Hear explanation</button>
 <div class="quick-lesson-examples">${item.examples.map(([phrase,meaning])=>`<div><strong lang="${locale}" data-ui-content>${esc(phrase)}</strong><p lang="${support}" data-ui-content>${esc(meaning)}</p><button type="button" class="secondary-button" data-quick-hear="${esc(phrase)}">🔊 Hear example</button></div>`).join('')}</div>
 <h3>Use it in a situation</h3><p lang="${support}" data-ui-content>${esc(cue.scene)}</p>
 <button type="button" id="quick-recall" class="secondary-button" aria-pressed="${recall}">${recall?'Show me the phrase':'Try without reading'}</button>
 <div id="quick-lesson-model" ${recall?'hidden':''}><article class="expression-card" data-practice-text="${esc(cue.phrase)}" data-practice-lang="${locale}"><p lang="${locale}" data-ui-content><strong>${esc(cue.phrase)}</strong></p><p lang="${support}" data-ui-content>${esc(cue.meaning)}</p></article></div>
 ${item.checks?(()=>{const check=item.checks[situation%item.checks.length];return `<section class="quick-grammar-check" aria-labelledby="quick-grammar-check-title"><h3 id="quick-grammar-check-title">Fill in the blank / Completa la frase</h3><p id="quick-grammar-prompt" lang="${locale}" data-ui-content>${esc(check.prompt)}</p><div id="quick-grammar-choices" role="group" aria-label="Choose the missing expression / Elige la expresión que falta">${check.options.map(choice=>`<button type="button" class="quick-grammar-choice" data-quick-answer="${esc(choice)}" aria-pressed="false" lang="${locale}">${esc(choice)}</button>`).join('')}</div><p id="quick-grammar-feedback" role="status" aria-live="polite"></p></section>`;})():''}
 <p>Different replies can work. Speaking feedback below compares recognized words with this model; it does not judge whether another reply communicates your meaning.</p>
 <button type="button" id="quick-next" class="primary-button">Try another situation →</button>
 <p>Original Habla lesson · device voices</p>`;
 content.querySelector('#quick-lesson-select').addEventListener('change',event=>{leave();selected[locale]=event.target.value;situation=0;recall=false;render();});
 content.querySelector('#quick-explanation-hear').addEventListener('click',event=>{root.cancelDictionaryPractice();root.say(item.explanation,support==='en'?(typeof englishVariant!=='undefined'&&englishVariant==='uk'?'en-GB':'en-US'):support,event.currentTarget);});
 content.querySelectorAll('[data-quick-hear]').forEach(button=>button.addEventListener('click',()=>{root.cancelDictionaryPractice();root.say(button.dataset.quickHear,locale,button);}));
 content.querySelector('#quick-recall').addEventListener('click',()=>{
  leave();recall=!recall;
  content.querySelector('#quick-lesson-model').hidden=recall;
  content.querySelector('.quick-lesson-examples').hidden=recall;
  const button=content.querySelector('#quick-recall');button.setAttribute('aria-pressed',String(recall));button.textContent=recall?'Show me the phrase':'Try without reading';
 });
 if(item.checks){
  const check=item.checks[situation%item.checks.length],feedback=content.querySelector('#quick-grammar-feedback');
  content.querySelectorAll('[data-quick-answer]').forEach(button=>button.addEventListener('click',()=>{
   const correct=button.dataset.quickAnswer===check.answer;
   content.querySelectorAll('[data-quick-answer]').forEach(choice=>{choice.setAttribute('aria-pressed',String(choice===button));choice.classList.toggle('is-correct',correct&&choice===button);choice.classList.toggle('is-incorrect',!correct&&choice===button);});
   feedback.dataset.correct=String(correct);
   feedback.textContent=correct?'✓ Correct / ¡Correcto! '+check.note:'Try again / Inténtalo de nuevo. Revisa el significado de cada expresión.';
  }));
 }
 content.querySelector('#quick-next').addEventListener('click',()=>{leave();situation=(situation+1)%item.situations.length;render();});
 root.bindDictionaryPractice(host);content.querySelector('.dictionary-practice').open=true;
 content.querySelector('.quick-lesson-examples').hidden=recall;
}
const api={catalog,setLearningLanguage,leave,isProtected:()=>Boolean(document.getElementById('quick-lessons')?.open&&document.getElementById('quick-lessons')?.closest('.view')?.classList.contains('active'))};
if(typeof module==='object'&&module.exports)module.exports=api;else root.HablaQuickLessons=api;
})(typeof window==='object'?window:globalThis);
