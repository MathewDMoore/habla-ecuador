const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const entries=require('../regional-vocabulary.js'),context=require('../spanish-context.js');
const sourceRecords=JSON.parse(fs.readFileSync('data/sources.json','utf8'));
const pack=entries.filter(e=>e.batch==='bolivia-reference-252');
test('bounded original Bolivia pack with country evidence and review limitations',()=>{
 assert.equal(pack.length,3);
 for(const entry of pack){
  assert.ok(entry.id.startsWith('bo252-'));
  assert.equal(entry.regionalSenseAttested,true);
  assert.ok(entry.regions.includes('es-BO'));
  assert.equal(entry.verification.nativeSpeakerReviewed,false);
  assert.equal(entry.verification.cityValidated,false);
  assert.ok(entry.sourceChecked&&entry.url&&entry.sourceSense);
  assert.match(entry.uncertainty,/pending/i);
  assert.ok(entry.exampleEs&&entry.exampleUs&&entry.exampleUk);
 }
});
test('Bolivian dictionary searches preserve competing market meanings',()=>{
 const matches=context.dictionary({region:'es-BO',query:'caserita'}).filter(e=>e.batch==='bolivia-reference-252');
 assert.equal(matches.length,2);
 assert.ok(matches.some(e=>/customer/.test(e.us)));
 assert.ok(matches.some(e=>/seller/.test(e.us)));
 assert.equal(context.dictionary({region:'es-BO',query:'chaki'}).filter(e=>e.batch==='bolivia-reference-252').length,1);
 assert.equal(context.dictionary({region:'es-EC',query:'chaki'}).filter(e=>e.batch==='bolivia-reference-252').length,0);
 assert.ok(context.dictionary({region:'es-EC',query:'casero'}).some(e=>e.id==='bo252-casero-customer'));
});
test('Spanish to English notes describe meaning instead of rewriting speech',()=>{
 const notes=context.analyse("La caserita me dio yapa, pero tengo ch’aki.",{source:'es-BO',target:'en-US',purpose:'everyday'});
 for(const term of ['casero / casera','yapa','ch’aki'])assert.ok(notes.some(n=>n.term===term&&n.url),term);
 assert.ok(notes.every(n=>typeof n.detail==='string'));
 const ecuador=context.analyse('La caserita vino.',{source:'es-EC',target:'en-US',purpose:'everyday'});
 assert.ok(!ecuador.some(n=>n.term==='casero / casera'),'Bolivian contextual cue is source-locale gated');
 assert.equal(context.prepare('La caserita me dio yapa.',{source:'es-BO'}),'La caserita me dio yapa.');
});
test('all three research sources appear with clear license and engine limitations',()=>{
 for(const id of ['asale_damer','wikcionario_bo','rla_es_bo','lostiempos_bo'])assert.ok(sourceRecords.some(s=>s.id===id),'missing '+id);
 const rla=sourceRecords.find(s=>s.id==='rla_es_bo');
 assert.match(rla.limits,/No Hunspell engine/);
 const asale=sourceRecords.find(s=>s.id==='asale_damer');
 assert.ok(asale.url.startsWith('https://www.asale.org/'));
 const wik=sourceRecords.find(s=>s.id==='wikcionario_bo');
 assert.match(wik.limits,/CC BY-SA 4.0/);
 const app=fs.readFileSync('app.js','utf8');
 assert.match(app,/regional-ambiguity/);
 assert.match(app,/renderRegionalSourceCoverage/);
 for(const page of ['index.html','translator.html']){
  const html=fs.readFileSync(page,'utf8');
  assert.match(html,/regional-vocabulary\.js\?v=253/);
  assert.match(html,/spanish-context\.js\?v=267/);
 }
 const shell=fs.readFileSync('sw.js','utf8');
 assert.match(shell,/regional-vocabulary\.js\?v=253/);
 assert.match(shell,/spanish-context\.js\?v=267/);
});
