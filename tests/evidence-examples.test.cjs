const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const nodes=new Map();
const $=key=>{if(!nodes.has(key))nodes.set(key,{value:"",textContent:"",hidden:true,dataset:{},classList:{toggle(){}},setAttribute(){},removeAttribute(){}});return nodes.get(key);};
const context=vm.createContext({console,setTimeout,clearTimeout,AbortController,document:{querySelector:$,addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}}});
vm.runInContext(fs.readFileSync("app.js","utf8"),context);
const entries=JSON.parse(fs.readFileSync("data/learner-entries-v1.json","utf8"));
context.entries=entries;
const run=s=>vm.runInContext(s,context);
run('evidenceEntries=entries.map(e=>({...e,origin:"learner-ready"}));translationPurpose="everyday";');
let routes=0;
for(const entry of entries){
 context.entry=entry;
 run('sourceLanguage="es-EC";targetLanguage="en-US";');
 assert.equal(run('matchEvidenceExample(entry.exampleEs,"ec-en").evidenceExampleId'),entry.id);
 assert.equal(run('translatedText(matchPhrase(entry.exampleEs,"ec-en"),"ec-en")'),entry.exampleUs);routes++;
 assert.equal(run('matchEvidenceExample("Before. "+entry.exampleEs+" After.","ec-en")'),null,"never replace a longer passage with one example");
 run('sourceLanguage="en-US";targetLanguage="es-EC";');
 for(const english of new Set([entry.exampleUs,entry.exampleUk])){
 context.english=english;
 assert.equal(run('translatedText(matchPhrase(english,"en-ec"),"en-ec")'),entry.exampleEs);routes++;
 }
}
run('sourceLanguage="en-US";targetLanguage="es-BO";');
assert.equal(run('matchEvidenceExample(entries[0].exampleUs,"en-ec")'),null);
run('sourceLanguage="es-EC";targetLanguage="en-US";translationPurpose="academic";');
assert.equal(run('matchEvidenceExample(entries[0].exampleEs,"ec-en")'),null);
run('translationPurpose="everyday";evidenceEntries=entries.map(e=>({...e,origin:"research-lead"}));');
assert.equal(run('matchEvidenceExample(entries[0].exampleEs,"ec-en")'),null);
console.log("PASS: "+entries.length+" source-linked examples, "+routes+" exact translation routes, passage preservation, regional scope and research-mode exclusion.");
