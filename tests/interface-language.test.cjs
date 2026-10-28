const assert=require('node:assert/strict'),fs=require('node:fs');
const ui=require('../interface-language.js'),es=require('../interface-es.js');
assert.equal(ui.resolve('?ui=es','en'),'es');assert.equal(ui.resolve('?ui=en','es'),'en');
assert.equal(ui.resolve('?ui=bad','es'),'es');assert.equal(ui.resolve('',null),'en');
assert.equal(ui.t('Practice','es'),'Práctica');assert.equal(ui.t('Practice','en'),'Practice');
assert.equal(ui.t('Private synthetic phrase','es'),'Private synthetic phrase');
assert.match(ui.t('Recognized-word score: 100% · 7 matched, 7 expected, 7 heard. This is not a pronunciation score.','es'),/No es una puntuación de pronunciación/);
const entries=require('../spanish-context.js').dictionary({region:'all'});
for(const entry of entries)for(const s of [entry.register,entry.scope,entry.note,entry.uncertainty,entry.usage?.label].filter(s=>typeof s==='string'&&s.trim()))assert.ok(Object.hasOwn(es,s)||ui.t(s,'es')!==s,'Missing metadata: '+s);
for(const name of ['index.html','translator.html','sw.js'])for(const asset of ['interface-es.js','interface-language.js'])assert.ok(fs.readFileSync(name,'utf8').includes(asset+'?v=163'));
console.log('Interface language: allowlisted preference, independent language, score qualification and dictionary metadata passed');

assert.equal(ui.t('Share with Mathew','es'),'Compartir con Mateo');assert.equal(ui.t('Share with Mathew','en'),'Share with Mathew');assert.equal(ui.t('Mathew','es'),'Mateo');
