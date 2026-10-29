// Regression: authentic Spanish typed under an English selector must not
// be translated as English. Switching directions never promotes the previous
// machine result to new source text.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const htmlFiles=['index.html','translator.html'];
test('Both translator pages show a bilingual corrective action',()=>{
  for(const file of htmlFiles){
    const html=fs.readFileSync(file,'utf8');
    assert.match(html,/id="source-language-warning"[^>]*role="alert"/);
    assert.match(html,/id="source-language-warning-message"/);
    assert.match(html,/id="correct-source-language"/);
  }
});

test('Detect strong Spanish-English source mismatch, preserving uncertain short phrases',()=>{
 const elements=new Map();
 const select=key=>{
  if(!elements.has(key))elements.set(key,{value:'',textContent:'',hidden:false,dataset:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},removeAttribute(){}});
  return elements.get(key);
 };
 const storage=new Map();
 const ctx=vm.createContext({console,window:{},setTimeout,clearTimeout,AbortController,
  document:{body:{classList:{toggle(){}}},addEventListener(){},querySelector:select,querySelectorAll:()=>[],createElement:()=>({value:'',set innerHTML(v){this.value=v;},get innerHTML(){return this.value;}})},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  navigator:{onLine:true},
  fetch:()=>{throw Error('Wrong-direction translation must not call network');}
 });
 vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
 const run=script=>vm.runInContext(script,ctx);
 run('sourceLanguage="en-US";targetLanguage="es-CU";syncLanguagePair();');
 const original="Disculpe en caso de que si estoy tarde.";
 select('#translator-input').value=original;
 assert.equal(run('translationInputLanguageMismatch('+JSON.stringify(original)+')'),'es');
 assert.equal(run('translationInputLanguageMismatch("Please excuse me if I am late.")'),null);
 assert.equal(run('translationInputLanguageMismatch("No")'),null);
 assert.equal(run('translationInputLanguageMismatch("Hello!")'),null);
 // Stop before submitting to the service and present a one-tap correction.
 run('renderTranslation=async()=>{};showTranslationLanguageWarning("es")');
 assert.equal(select('#source-language-warning').hidden,false);
 assert.match(select('#source-language-warning-message').textContent,/Spanish/);
 run('correctTranslationSourceLanguage()');
 assert.equal(run('sourceLanguage'),'es-CU');
 assert.equal(run('targetLanguage'),'en-US');
 assert.equal(select('#translator-input').value,original);
 assert.equal(run('translationInputLanguageMismatch('+JSON.stringify(original)+')'),null);
 // A perfectly valid completed machine translation must NOT become the next
 // source on swap. The original typed sentence remains untouched.
 run('lastCompletedTranslation={source:'+JSON.stringify(original)+',target:"Sorry if I am late.",sourceLanguage:"es-CU",targetLanguage:"en-US"}');
 run('swapDirection()');
 assert.equal(run('sourceLanguage'),'en-US');
 assert.equal(run('targetLanguage'),'es-CU');
 assert.equal(select('#translator-input').value,original,'reversing must retain the actual source, not translation output');
 assert.equal(run('translationInputLanguageMismatch('+JSON.stringify(original)+')'),'es');
});
