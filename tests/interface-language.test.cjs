const assert=require('node:assert/strict'),fs=require('node:fs');
const ui=require('../interface-language.js'),es=require('../interface-es.js');
assert.equal(ui.resolve('?ui=es','en'),'es');assert.equal(ui.resolve('?ui=en','es'),'en');
assert.equal(ui.resolve('?ui=bad','es'),'es');assert.equal(ui.resolve('',null),'en');
assert.equal(ui.t('Practice','es'),'Práctica');assert.equal(ui.t('Practice','en'),'Practice');
assert.equal(ui.t('Private synthetic phrase','es'),'Private synthetic phrase');
assert.match(ui.t('Recognized-word score: 100% · 7 matched, 7 expected, 7 heard. This is not a pronunciation score.','es'),/No es una puntuación de pronunciación/);
const entries=require('../spanish-context.js').dictionary({region:'all'});
const missing=entries.flatMap(entry=>[entry.register,entry.scope,entry.note,entry.uncertainty,entry.usage?.label].filter(value=>typeof value==='string'&&value.trim()&&!Object.hasOwn(es,value)&&ui.t(value,'es')===value));
assert.deepEqual(missing,[],'Missing untranslated Spanish-interface metadata: '+missing.join(' | '));
for(const name of ['index.html','translator.html','sw.js'])for(const [asset,version] of [['interface-es.js',261],['interface-language.js',218]])assert.ok(fs.readFileSync(name,'utf8').includes(asset+'?v='+version));
console.log('Interface language: allowlisted preference, independent language, score qualification and dictionary metadata passed');

assert.equal(ui.t('Share with Mathew','es'),'Compartir con Mateo');assert.equal(ui.t('Share with Mathew','en'),'Share with Mathew');assert.equal(ui.t('Mathew','es'),'Mateo');
