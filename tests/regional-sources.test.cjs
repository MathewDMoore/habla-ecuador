const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const dictionary = require('../spanish-context.js');
const batch = require('../regional-vocabulary.js').filter(e => e.batch === 'regional-phraseology-201');
const sources = JSON.parse(fs.readFileSync('data/sources.json','utf8'));
const sourceIds = new Set(sources.map(s => s.id));
assert.equal(batch.length,24);
assert.equal(new Set(batch.map(e => e.id)).size,24);
assert.equal(sourceIds.size,sources.length);
assert.equal(sources.length,26);
const ids = options => dictionary.dictionary(options).filter(e => e.batch === 'regional-phraseology-201').map(e => e.id.replace('p201-',''));
for (const e of batch) {
  for (const key of ['id','term','headword','speech','us','uk','scope','note','exampleEs','exampleUs','exampleUk','sourceSense','sourceChecked','uncertainty']) assert.ok(e[key],e.id+' '+key);
  assert.equal(e.sourceChecked,'2026-11-02');
  assert.deepEqual(e.verification,{dictionaryAttested:true,nationalDictionaryChecked:false,corpusChecked:false,nativeSpeakerReviewed:false,cityValidated:false});
  assert.equal(e.regionalSenseAttested,true);
  assert.equal(e.searchNotes,false);
  assert.ok(e.sourceIds.every(id => sourceIds.has(id)));
  assert.match(e.url,/^https:\/\/www\.asale\.org\/damer\//);
  const indexed = dictionary.dictionary({region:'all',query:e.speech}).find(x => x.id === e.id);
  assert.ok(indexed);
  assert.deepEqual(indexed.usage.cities,[]);
  for (const region of e.regions) {
    assert.ok(ids({region,query:e.speech}).includes(e.id.replace('p201-','')));
    for (const english of ['en-US','en-GB']) assert.ok(ids({region:english,target:region,query:e.speech}).includes(e.id.replace('p201-','')));
  }
  // Dictionary enrichment does not install a phrase-replacement translator.
  assert.equal(Object.hasOwn(e,'pattern'),false);
  assert.equal(Object.hasOwn(e,'aliases'),false);
}
for(const country of ['es-EC','es-BO','es-MX','es-VE','es-PE','es-CO','es-CU']) {
  assert.ok(ids({region:country}).length >= 3,'source-attested pilot for '+country);
  assert.ok(sources.some(s => s.dictionaryReference && ['national','regional-research'].includes(s.coverageRole) && s.regions.includes(country)));
}
assert.deepEqual(ids({region:'es-CU',query:'dar bola'}),['dar-bola-ride']);
assert.deepEqual(ids({region:'es-EC',query:'dar bola'}),['dar-bola-attention']);
assert.deepEqual(new Set(ids({region:'es-BO',query:'dar bola'})),new Set(['dar-bola-attention','dar-bola-romance']));
assert.deepEqual(ids({region:'en-GB',target:'es-CU',query:'lift'}),['dar-bola-ride']);
assert.deepEqual(ids({region:'en-GB',target:'es-BO',query:'lift'}),[]);
assert.deepEqual(ids({region:'es-VE',query:'mamar gallo'}),['mamar-gallo-tease']);
assert.deepEqual(ids({region:'en-US',target:'es-VE',query:'false promises'}),[]);
assert.deepEqual(ids({region:'en-US',target:'es-PE',query:'alert'}),[]);
assert.deepEqual(ids({region:'en-US',target:'es-PE',query:'needle'}),[],'literal aid is not an English meaning');
assert.deepEqual(ids({region:'es-BO',query:'tacho colorado'}),['tacho-colorado']);
assert.deepEqual(batch.find(e=>e.id==='p201-tacho-colorado').subregions,[{country:'es-BO',label:'Eastern Bolivia / Oriente boliviano',sourceCode:'Bo:E'}]);
assert.equal(ids({region:'all',usage:'metaphor'}).length,23);
assert.ok(ids({region:'es-MX',usage:'idiom'}).includes('frito-sin-manteca'));
assert.ok(ids({region:'es-MX',usage:'metaphor'}).includes('frito-sin-manteca'),'idiom and figurative filters may overlap');
for(const city of ['quito','bogota','monterrey','mexico-city']) assert.equal(ids({region:city}).length,0);
for(const query of ['dar bolaxyz','unknown-made-up-expression']) assert.deepEqual(ids({region:'all',query}),[]);
const app = fs.readFileSync('app.js','utf8'), nodes = new Map();
const node = selector => nodes.get(selector);
nodes.set('#regional-source-coverage',{innerHTML:''});
nodes.set('#regional-slang-region',{value:'es-PE',selectedOptions:[{textContent:'Peru'}]});
nodes.set('#regional-slang-target',{value:'es-CU',selectedOptions:[{textContent:'Cuba'}]});
const context = vm.createContext({$:node,HablaSpanishContext:dictionary,evidenceSources:new Map(sources.map(s=>[s.id,s])),escapeHtml:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))});
vm.runInContext(app.slice(app.indexOf('function renderRegionalSourceCoverage()'),app.indexOf('function renderRegionalSlang()')),context);
function coverage(region,label){nodes.get('#regional-slang-region').value=region;nodes.get('#regional-slang-region').selectedOptions[0].textContent=label;context.renderRegionalSourceCoverage();return nodes.get('#regional-source-coverage').innerHTML;}
assert.match(coverage('es-PE','Peru'),/DiPerú/);
assert.doesNotMatch(coverage('es-PE','Peru'),/Diccionario del español de México/);
assert.match(coverage('es-MX','Mexico'),/Diccionario del español de México/);
assert.match(coverage('es-CU','Cuba'),/Atlas lingüístico de Cuba/);
assert.match(coverage('es-CO','Colombia'),/Access limited/);
assert.match(coverage('es-GQ','Equatorial Guinea'),/National-source review pending/);
assert.match(coverage('en-GB','U.K. English'),/Atlas lingüístico de Cuba/);
assert.doesNotMatch(coverage('en-GB','U.K. English'),/DiPerú/);
assert.match(coverage('quito','Quito'),/do not establish use in this city/);
assert.match(coverage('all','All'),/DiPerú/);
context.evidenceSources.clear();
assert.match(coverage('es-PE','Peru'),/unavailable or loading/);
for(const file of ['index.html','translator.html']) {
  const text=fs.readFileSync(file,'utf8');
  assert.match(text,/id="regional-source-coverage"/);
  assert.match(text,/value="metaphor"/);
}
assert.match(fs.readFileSync('sw.js','utf8'),/"data\/sources.json"/);
console.log('PASS: 24 documented senses; seven-country source coverage; country false friends; figurative/idiom overlap; no city inference; honest reference/access states; English counterpart isolation; offline catalogue.');

