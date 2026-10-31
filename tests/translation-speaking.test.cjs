const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
let observer,listener,cancelled=0,bound=[];
const panel={open:false,scrollIntoView(){}};
const host={hidden:true,children:[],replaceChildren(){this.children=[];},append(card){this.children.push(card);}};
const button={disabled:true,addEventListener(type,fn){listener=fn;}};
const text={innerText:'Voy al trabajo.',getAttribute:()=> 'true'};
const result={hidden:false};
const nodes={'#translation-result':result,'#natural-result':text,'#practice-translation':button,'#translation-speaking-practice':host};
const context=vm.createContext({$:key=>nodes[key],activeTranslationEdit:{targetLanguage:'es-EC'},targetLanguage:'es-EC',
 document:{createElement:()=>({dataset:{},querySelector:()=>panel})},
 cancelDictionaryPractice:()=>cancelled++,bindDictionaryPractice:h=>bound.push(h.children[0].dataset),
 MutationObserver:class{constructor(fn){observer=fn;}observe(){}}});
vm.runInContext(source.slice(source.indexOf('function bindTranslationPractice()'),source.indexOf('function bindDictionaryAudio()')),context);
vm.runInContext('bindTranslationPractice()',context);
assert.equal(button.disabled,false);listener();assert.equal(panel.open,true);
assert.equal(bound.at(-1).practiceText,'Voy al trabajo.');assert.equal(bound.at(-1).practiceLang,'es-EC');
text.innerText='I am going to work.';context.activeTranslationEdit={targetLanguage:'en-US'};observer();
assert.equal(host.hidden,true,'changing the translation clears stale practice');assert.equal(host.children.length,0);
listener();assert.equal(bound.at(-1).practiceLang,'en-US');assert.equal(bound.at(-1).practiceText,text.innerText);
context.activeTranslationEdit={targetLanguage:'en-GB'};observer();listener();assert.equal(bound.at(-1).practiceLang,'en-GB');
text.innerText='<script>literal learning text</script>';observer();listener();assert.equal(bound.at(-1).practiceText,text.innerText,'text is passed as data');
result.hidden=true;observer();assert.equal(button.disabled,true);assert.equal(host.hidden,true);const before=bound.length;listener();assert.equal(bound.length,before);
result.hidden=false;context.activeTranslationEdit=null;observer();assert.equal(button.disabled,true,'unfinished translation cannot start practice');
assert.ok(cancelled>0);
console.log('Translation practice: current target text, English/Spanish locale, model-ready panel, edits, changed variety, hidden/pending state and safe text passed');
