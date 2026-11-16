/* Habla Ecuador: on-demand bilingual grammar reference. No learner text is stored. */
(function (root) {
"use strict";

const PRONOUNS=["yo","tú","él / ella / usted","nosotros/as","vosotros/as","ellos / ellas / ustedes"];
const GLOSSES=["I","you (informal)","he / she / you (formal)","we","you all (Spain)","they / you all"];
const VERBS={
 hablar:{en:"speak",group:"ar"},
 comer:{en:"eat",group:"er"},
 vivir:{en:"live",group:"ir"},
 tener:{en:"have",group:"ir",future:"tendr"},
 ser:{en:"be (identity)",group:"er"},
 estar:{en:"be (state/location)",group:"ar"},
 ir:{en:"go",group:"ir"},
 hacer:{en:"do / make",group:"er",future:"har"}
};
const IRREGULAR={
 tener:{present:["tengo","tienes","tiene","tenemos","tenéis","tienen"],preterite:["tuve","tuviste","tuvo","tuvimos","tuvisteis","tuvieron"],subjunctive:["tenga","tengas","tenga","tengamos","tengáis","tengan"],imperfectSubjunctive:["tuviera","tuvieras","tuviera","tuviéramos","tuvierais","tuvieran"]},
 ser:{present:["soy","eres","es","somos","sois","son"],preterite:["fui","fuiste","fue","fuimos","fuisteis","fueron"],imperfect:["era","eras","era","éramos","erais","eran"],subjunctive:["sea","seas","sea","seamos","seáis","sean"],imperfectSubjunctive:["fuera","fueras","fuera","fuéramos","fuerais","fueran"]},
 estar:{present:["estoy","estás","está","estamos","estáis","están"],preterite:["estuve","estuviste","estuvo","estuvimos","estuvisteis","estuvieron"],subjunctive:["esté","estés","esté","estemos","estéis","estén"],imperfectSubjunctive:["estuviera","estuvieras","estuviera","estuviéramos","estuvierais","estuvieran"]},
 ir:{present:["voy","vas","va","vamos","vais","van"],preterite:["fui","fuiste","fue","fuimos","fuisteis","fueron"],imperfect:["iba","ibas","iba","íbamos","ibais","iban"],subjunctive:["vaya","vayas","vaya","vayamos","vayáis","vayan"],imperfectSubjunctive:["fuera","fueras","fuera","fuéramos","fuerais","fueran"]},
 hacer:{present:["hago","haces","hace","hacemos","hacéis","hacen"],preterite:["hice","hiciste","hizo","hicimos","hicisteis","hicieron"],subjunctive:["haga","hagas","haga","hagamos","hagáis","hagan"],imperfectSubjunctive:["hiciera","hicieras","hiciera","hiciéramos","hicierais","hicieran"]}
};
const TENSES=[
 ["present","Presente · Present"],
 ["preterite","Pretérito · Completed past"],
 ["imperfect","Imperfecto · Habitual past"],
 ["future","Futuro · Future"],
 ["conditional","Condicional · Would"],
 ["subjunctive","Presente de subjuntivo"],
 ["imperfectSubjunctive","Imperfecto de subjuntivo"]
];
const TOPICS=[
 ["structure","Sentence structure · Orden de las palabras"],
 ["nouns","Nouns & articles · Sustantivos"],
 ["adjectives","Adjectives · Adjetivos"],
 ["verbs","Verb tables · Conjugaciones"],
 ["ser-estar","Ser vs. estar"],
 ["pronouns","Pronouns & address · Pronombres"],
 ["questions","Questions & negation · Preguntas"],
 ["commands","Commands · Mandatos"],
 ["demonstratives","This / that · Demostrativos"],
 ["conditionals","If clauses & subjunctive · Si / subjuntivo"]
];
const LESSONS={
 structure:'<p><strong>Typical order:</strong> subject + verb + object. <span lang="es">Elena lee un libro.</span> = Elena reads a book. Spanish may change word order for emphasis.</p><p><strong>Subject pronouns may be omitted:</strong> <span lang="es">Quiero aprender.</span> = I want to learn. The verb often makes the subject clear.</p>',
 nouns:'<p>Spanish nouns have grammatical gender, not always biological gender. <span lang="es">el libro</span> (the book) and <span lang="es">la mesa</span> (the table). Endings -o and -a are useful clues, not guarantees: <span lang="es">el día, la mano</span>.</p><p><strong>Singular feminine nouns with stressed initial a-:</strong> <span lang="es">el agua fría, el águila blanca</span>. They remain feminine; plural: <span lang="es">las aguas frías</span>.</p><p><strong>Plural:</strong> generally add -s after a vowel (<span lang="es">casas</span>), -es after a consonant (<span lang="es">papeles</span>), with additional spelling exceptions.</p>',
 adjectives:'<p>Adjectives generally agree with nouns in gender and number: <span lang="es">un libro rojo, una casa roja, libros rojos, casas rojas</span>.</p><p>They often follow the noun, but some appear before it or change nuance with position: <span lang="es">un viejo amigo</span> (a longtime friend) vs. <span lang="es">un amigo viejo</span> (an elderly friend).</p>',
 "ser-estar":'<p><strong>Ser</strong> commonly expresses identity, origin, classification and characteristics: <span lang="es">Soy estudiante. Es de Quito.</span></p><p><strong>Estar</strong> commonly expresses location and condition: <span lang="es">Estoy cansada. El banco está cerca.</span></p><p>“Permanent vs. temporary” is only a shortcut, not a reliable complete rule. Some adjectives change meaning: <span lang="es">es listo</span> (clever) vs. <span lang="es">está listo</span> (ready).</p>',
 pronouns:'<p><strong>Ways to address people:</strong> <span lang="es">tú</span> (informal singular), <span lang="es">usted</span> (formal or socially preferred singular), <span lang="es">ustedes</span> (plural), <span lang="es">vos</span> (used in various voseo systems) and <span lang="es">vosotros/as</span> (informal plural in much of Spain).</p><p><span lang="es">Tú hablas, usted habla, ustedes hablan, vosotros habláis.</span> Some voseo systems use <span lang="es">vos hablás</span>. Exact usage varies by community, setting and individual; do not assume a form is uniquely Ecuadorian or Bolivian without evidence.</p>',
 questions:'<p><strong>Questions:</strong> Spanish uses both opening and closing marks: <span lang="es">¿Dónde está la clase? ¿A qué hora empieza?</span></p><p>Question words take written accents: <span lang="es">qué, quién, cuál, cómo, cuándo, dónde, adónde, por qué, cuántos/as</span>.</p><p><strong>Negation:</strong> put <span lang="es">no</span> before the conjugated verb: <span lang="es">No hablo inglés.</span> Negative concord is natural: <span lang="es">No veo a nadie.</span></p>',
 commands:'<p><strong>Formal commands:</strong> <span lang="es">Hable</span> (usted), <span lang="es">hablen</span> (ustedes); <span lang="es">No hable / No hablen</span>. They use present subjunctive forms.</p><p><strong>Reflexive pronouns:</strong> <span lang="es">Siéntese</span> (sit down); <span lang="es">No se siente</span> (do not sit down). Positive commands attach pronouns; negative commands place them before the verb.</p><p><strong>Let’s:</strong> <span lang="es">Hablemos.</span> = Let’s speak. <span lang="es">No salgamos.</span> = Let’s not leave.</p>',
 demonstratives:'<p><strong>Near me:</strong> <span lang="es">este libro / esta casa</span> (this). <strong>That:</strong> <span lang="es">ese libro / esa casa</span>. <strong>Farther away:</strong> <span lang="es">aquel libro / aquella casa</span>.</p><p>Match gender and number: <span lang="es">estos libros, esas casas, aquellos edificios</span>. Neuter forms <span lang="es">esto, eso, aquello</span> refer to unspecified ideas or things, not nouns directly.</p><p>Modern standard orthography normally writes demonstrative pronouns without accents: <span lang="es">prefiero este</span>. Older coursework may show <span lang="es">éste</span>; the usage has changed.</p>',
 conditionals:'<p><strong>Likely future:</strong> <span lang="es">Si tengo tiempo, estudiaré.</span> = If I have time, I will study. Use present indicative after <span lang="es">si</span>, not the future tense.</p><p><strong>Hypothetical:</strong> <span lang="es">Si tuviera tiempo, estudiaría.</span> = If I had time, I would study. This uses imperfect subjunctive + conditional.</p><p><strong>Wish / uncertainty:</strong> <span lang="es">Espero que vengas.</span> = I hope you come. <span lang="es">Quiero estudiar</span> does not need subjunctive when the subject stays the same.</p>'
};
const ENDS={
 present:{ar:["o","as","a","amos","áis","an"],er:["o","es","e","emos","éis","en"],ir:["o","es","e","imos","ís","en"]},
 preterite:{ar:["é","aste","ó","amos","asteis","aron"],er:["í","iste","ió","imos","isteis","ieron"],ir:["í","iste","ió","imos","isteis","ieron"]},
 imperfect:{ar:["aba","abas","aba","ábamos","abais","aban"],er:["ía","ías","ía","íamos","íais","ían"],ir:["ía","ías","ía","íamos","íais","ían"]},
 subjunctive:{ar:["e","es","e","emos","éis","en"],er:["a","as","a","amos","áis","an"],ir:["a","as","a","amos","áis","an"]},
 imperfectSubjunctive:{ar:["ara","aras","ara","áramos","arais","aran"],er:["iera","ieras","iera","iéramos","ierais","ieran"],ir:["iera","ieras","iera","iéramos","ierais","ieran"]}
};
function forms(verb,tense){
 const definition=VERBS[verb];if(!definition||!TENSES.some(t=>t[0]===tense))return null;
 if(IRREGULAR[verb]?.[tense])return [...IRREGULAR[verb][tense]];
 if(tense==="future"||tense==="conditional"){
  const suffixes=tense==="future"?["é","ás","á","emos","éis","án"]:["ía","ías","ía","íamos","íais","ían"];
  return suffixes.map(end=>(definition.future||verb)+end);
 }
 const ending=ENDS[tense]?.[definition.group];if(!ending)return null;
 return ending.map(end=>verb.slice(0,-2)+end);
}
function make(tag,cls,text){
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(text!==undefined)element.textContent=text;
 return element;
}
let dialog, opener=null, selectedText="";
function selectedFragment(){
 const focus=document.activeElement;
 if(focus && (focus.tagName==="TEXTAREA"||focus.tagName==="INPUT") && typeof focus.selectionStart==="number"){
  if(focus.selectionEnd>focus.selectionStart)return focus.value.slice(focus.selectionStart,focus.selectionEnd).trim().slice(0,120);
 }
 const sel=window.getSelection?.();
 return (sel?.toString()||"").trim().slice(0,120);
}
function topicContent(topic){return LESSONS[topic]||"";}
function option(value,label){
 const element=document.createElement("option");element.value=value;element.textContent=label;return element;
}
function inferredVerb(fragment){
 const word=(fragment||"").trim().toLocaleLowerCase("es").normalize("NFC");
 if(!/^[a-záéíóúüñ]+$/i.test(word))return "";
 const possibilities=Object.keys(VERBS).filter(verb=>verb===word || TENSES.some(t=>forms(verb,t[0])?.includes(word)));
 return possibilities.length===1?possibilities[0]:"";
}
function ensureDialog(){
 if(dialog)return dialog;
 dialog=make("dialog","grammar-popout");
 dialog.id="grammar-popout";
 dialog.setAttribute("aria-labelledby","grammar-title");
 dialog.setAttribute("aria-describedby","grammar-intro");
 const shell=make("section","grammar-sheet");
 const head=make("header","grammar-heading");
 const title=make("h2","", "📖 Gramática / Grammar");title.id="grammar-title";
 const close=make("button","grammar-close","×");close.type="button";close.setAttribute("aria-label","Close grammar reference / Cerrar la gramática");
 close.addEventListener("click",()=>dialog.close());
 head.append(title,close);
 const intro=make("p","grammar-intro","Quick bilingual reference. These are general Spanish rules, not unsupported claims of regional exclusivity.");intro.id="grammar-intro";
 const selection=make("p","grammar-selection");selection.id="grammar-selection";selection.hidden=true;
 const selectorLabel=make("label","grammar-label","Topic / Tema");
 const selector=make("select","grammar-topic");selector.id="grammar-topic";
 TOPICS.forEach(t=>selector.add(option(t[0],t[1])));
 selectorLabel.append(selector);
 const article=make("article","grammar-content");article.id="grammar-content";
 const foot=make("p","grammar-footnote","Choose a topic, then close to continue right where you were. No selected text is stored.");
 shell.append(head,intro,selection,selectorLabel,article,foot);
 dialog.append(shell);document.body.append(dialog);
 close.addEventListener("keydown",e=>{if(e.key==="Tab"&&e.shiftKey){e.preventDefault();const items=dialog.querySelectorAll("button, select");items[items.length-1]?.focus();}});
 dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener("close",()=>{opener?.focus?.({preventScroll:true});opener=null;selectedText="";});
 selector.addEventListener("change",render);
 return dialog;
}
function makeVerbTable(host){
 const controls=make("div","grammar-verb-controls");
 const verbLabel=make("label","grammar-label","Verb / Verbo");
 const verbSelect=make("select","");verbSelect.id="grammar-verb";
 Object.keys(VERBS).forEach(verb=>verbSelect.add(option(verb,verb+" · "+VERBS[verb].en)));
 const tenseLabel=make("label","grammar-label","Tense / Tiempo");
 const tenseSelect=make("select","");tenseSelect.id="grammar-tense";
 TENSES.forEach(t=>tenseSelect.add(option(t[0],t[1])));
 verbLabel.append(verbSelect);tenseLabel.append(tenseSelect);controls.append(verbLabel,tenseLabel);
 host.append(controls,make("div","grammar-table-scroll"));
 const out=host.querySelector(".grammar-table-scroll");
 const note=make("p","grammar-note","Table uses standard tú, usted, ustedes and vosotros forms. Voseo patterns vary across communities.");
 host.append(note);
 if(inferredVerb(selectedText))verbSelect.value=inferredVerb(selectedText);
 const populate=()=>{
  out.replaceChildren();
  const table=make("table","grammar-table"),thead=document.createElement("thead"),tr=document.createElement("tr");
  ["Pronoun / Pronombre","Spanish / Español","English / Inglés"].forEach(c=>tr.append(make("th","",c)));thead.append(tr);table.append(thead);
  const body=document.createElement("tbody"),values=forms(verbSelect.value,tenseSelect.value);
  values.forEach((value,i)=>{
   const row=document.createElement("tr");
   row.append(make("td","",PRONOUNS[i]),make("td","grammar-form",value),make("td","",GLOSSES[i]));
   body.append(row);
  });table.append(body);out.append(table);
  note.textContent=tenseSelect.value==="subjunctive"||tenseSelect.value==="imperfectSubjunctive"
   ?"These are subjunctive forms, often used after expressions of wishes, doubt or emotion. Their English translations depend on context."
   :"Person labels are English glosses, not a word-for-word tense translation. Voseo patterns vary across communities.";
 };
 verbSelect.addEventListener("change",populate);tenseSelect.addEventListener("change",populate);populate();
}
function render(){
 const host=dialog?.querySelector("#grammar-content");
 if(!host)return;
 const topic=dialog.querySelector("#grammar-topic").value;
 host.innerHTML=topicContent(topic);
 if(topic==="verbs"){
  host.innerHTML='<p>Choose a verb and tense. Regular -ar, -er and -ir patterns appear alongside common irregular verbs. <strong>Examples:</strong> <span lang="es">yo hablo, tú comes, ella vive</span>.</p>';
  makeVerbTable(host);
 }
}
function open(trigger,topic=""){
 opener=trigger||document.activeElement;
 const fragment=selectedFragment()||selectedText;
 selectedText=fragment;
 ensureDialog();
 const selection=dialog.querySelector("#grammar-selection");
 selection.textContent=fragment?"Selected text / Texto seleccionado: "+fragment:"";
 selection.hidden=!fragment;
 const chosen=TOPICS.some(t=>t[0]===topic)?topic:inferredVerb(fragment)?"verbs":"structure";
 dialog.querySelector("#grammar-topic").value=chosen;
 render();
 if(!dialog.open)dialog.showModal();
 dialog.querySelector("#grammar-topic").focus({preventScroll:true});
}
function bind(){
 const result=document.getElementById("translation-text-tools");
 const practice=document.querySelector("#lesson-view .lesson-tutorial-button");
 const attach=(host,context)=>{
  if(!host||host.querySelector(".grammar-reference-trigger"))return;
  const button=make("button","grammar-reference-trigger secondary-button","📖 Gramática / Grammar");
  button.type="button";
  button.setAttribute("aria-haspopup","dialog");
  button.setAttribute("aria-controls","grammar-popout");
  button.addEventListener("pointerdown",()=>{selectedText=selectedFragment();},{passive:true});
  button.addEventListener("click",()=>open(button,context));
  host.append(button);
 };
 attach(result,"");
 if(practice) {
  const wrap=make("div","grammar-practice-entry");
  practice.insertAdjacentElement("afterend",wrap);
  attach(wrap,"structure");
 }
}
const api={forms,bind,open,topics:TOPICS.map(t=>t[0])};
if(typeof module==="object"&&module.exports){module.exports=api;}
else {
 root.HablaGrammarReference=api;
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
 else bind();
}
})(typeof window==="object"?window:globalThis);
