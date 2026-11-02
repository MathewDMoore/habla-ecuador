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
 // Completed pairs switch together and round-trip verbatim without a service call.
 const raw="  ¿Qué haces?\n\n¡Hola! 😁  ";
 select('#translator-input').value=raw;
 run('setEditableTranslation('+JSON.stringify(raw.trim())+',"What are you doing?\\n\\nHello! 😁");');
 select('#translation-result').hidden=false;
 const english=select('#natural-result').textContent;
 run('swapDirection()');
 assert.equal(run('sourceLanguage'),'en-US');
 assert.equal(select('#translator-input').value,english);
 assert.equal(select('#natural-result').textContent,raw);
 run('swapDirection()');
 assert.equal(run('sourceLanguage'),'es-CU');
 assert.equal(select('#translator-input').value,raw);
 assert.equal(select('#natural-result').textContent,english);
 // Previously reported iPhone error: Reverse must not promote a stale,
 // automatically generated "Vol." for the exact term "Caldo" into source text.
 run('sourceLanguage="es-EC";targetLanguage="en-US";syncLanguagePair({persist:false});');
 select('#translator-input').value='Caldo';
 run('setEditableTranslation("Caldo","Vol.")');
 select('#translation-result').hidden=false;
 run('swapDirection()');
 assert.equal(select('#translator-input').value,'broth','known bad machine result is repaired before Reverse');
 assert.equal(select('#natural-result').textContent,'Caldo','the genuine original is preserved');
 assert.match(select('#translation-result .result-label').textContent,/preserved pair/);
 run('swapDirection()');
 assert.equal(select('#translator-input').value,'Caldo');
 assert.equal(select('#natural-result').textContent,'broth');
 // Explicit user edits are never silently overwritten, even when they conflict
 // with a dictionary-backed suggestion. The screen identifies them as such.
 select('#translator-input').value='Caldo';
 run('sourceLanguage="es-EC";targetLanguage="en-US";syncLanguagePair({persist:false});');
 run('setEditableTranslation("Caldo","broth")');
 select('#natural-result').textContent='Vol.';
 run('saveActiveTranslationEdit()');
 run('swapDirection()');
 assert.equal(select('#translator-input').value,'Vol.','personal edit preserved as personal edit');
 assert.match(select('#translation-result .result-label').textContent,/personal edit/);
 // An edited source invalidates the old pair; never promote its stale translation.
 select('#translator-input').value='New text';
 run('swapDirection()');
 assert.equal(select('#translator-input').value,'New text');
 assert.equal(select('#translation-result').hidden,true);
});
