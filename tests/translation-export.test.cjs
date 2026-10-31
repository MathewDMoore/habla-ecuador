const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const code=source.slice(source.indexOf('function buildTranslationExport('),source.indexOf('function bindTranslationPractice()'));
function harness(navigator={}){
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,{value:'',hidden:false,textContent:'',events:{},addEventListener(t,fn){this.events[t]=fn;},getAttribute:()=> 'true',focus(){},select(){}});return nodes.get(id);};
 get('#translator-input').value='Original\n\nSecond paragraph.';get('#translation-export-scope').value='both';
 const context=vm.createContext({navigator,$:get,activeTranslationEdit:{source:get('#translator-input').value,sourceLanguage:'en-US',targetLanguage:'es-EC'},sourceLanguage:'en-US',targetLanguage:'es-EC',renderedTranslationText:()=> 'Traducción editada.\n\nOtro párrafo.',languageLabel:x=>x,legacyCopyTranslation:()=>false});
 vm.runInContext(code+'\nbindTranslationExport();',context);
 return{context,get,copy:()=>get('#copy-selected-text').events.click(),share:()=>get('#share-selected-text').events.click()};
}
(async()=>{
 const copied=[];const h=harness({clipboard:{writeText:async text=>copied.push(text)}});
 await h.copy();assert.equal(copied[0],'Original (en-US):\nOriginal\n\nSecond paragraph.\n\nTranslation (es-EC):\nTraducción editada.\n\nOtro párrafo.');
 h.get('#translation-export-scope').value='translation';await h.copy();assert.equal(copied.at(-1),'Traducción editada.\n\nOtro párrafo.');
 h.get('#translation-export-scope').value='input';vm.runInContext('activeTranslationEdit=null',h.context);await h.copy();assert.equal(copied.at(-1),'Original\n\nSecond paragraph.','input can be copied before translation');
 h.get('#translation-export-scope').value='both';const before=copied.length;await h.copy();assert.equal(copied.length,before);
 vm.runInContext('activeTranslationEdit={source:"older input"}',h.context);await h.copy();assert.match(h.get('#translation-export-status').textContent,/input changed/);assert.equal(copied.length,before);
 const shares=[];let finish;const direct=harness({share:data=>{shares.push(data);return new Promise(r=>finish=r);}});const pending=direct.share();assert.equal(shares.length,1,'share opens during the button gesture');await direct.share();assert.equal(shares.length,1);finish();await pending;assert.ok(!shares[0].url,'no app URL, history or metadata added');
 const cancelled=harness({share:async()=>{throw {name:'AbortError'};},clipboard:{writeText:()=>assert.fail('cancel must not copy')}});await cancelled.share();assert.match(cancelled.get('#translation-export-status').textContent,/cancelled/);
 const manual=harness();await manual.copy();assert.equal(manual.get('#translation-export-fallback').hidden,false);assert.match(manual.get('#translation-export-fallback').value,/Original/);
 for(const file of ['index.html','translator.html'])for(const id of ['translation-export-scope','copy-selected-text','share-selected-text'])assert.equal(fs.readFileSync(file,'utf8').split('id="'+id+'"').length-1,1);
 console.log('Translation export: all scopes, edited text, paragraph preservation, input without translation, stale-pair guard, synchronous share, duplicates, cancel and manual fallback passed');
})().catch(e=>{console.error(e);process.exitCode=1});
