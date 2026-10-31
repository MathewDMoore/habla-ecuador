const assert=require('node:assert/strict'),fs=require('node:fs');
const {catalog}=require('../recorded-practice.js');
assert.equal(catalog.items.length,4);assert.equal(new Set(catalog.items.map(i=>i.id)).size,4);
assert.equal(catalog.items[0].locale,'es-EC');
assert.deepEqual(catalog.items.map(i=>i.locale),['es-EC','es-BO','es-MX','es-VE']);
assert.equal(catalog.license,'CC BY');assert.match(catalog.licenseUrl,/coerll\.utexas\.edu/);
for(const i of catalog.items){assert.ok(i.spanish&&i.us&&i.uk&&i.speaker&&i.region&&i.cue);assert.match(i.clip,/^(beg|adv)\d\d[a-z]$/);assert.ok(i.spanish.split(/\s+/).length<25);}
const source=fs.readFileSync('recorded-practice.js','utf8');
assert.match(source,/preload="none"/);assert.match(source,/not individual sounds/);
assert.ok(!/getUserMedia|MediaRecorder|localStorage|sendBeacon|fetch\(/.test(source),'reuse existing recognition, no new user recording persistence or upload');
for(const f of ['index.html','translator.html'])assert.match(fs.readFileSync(f,'utf8'),/recorded-practice\.js\?v=194/);
assert.match(fs.readFileSync('sw.js','utf8'),/recorded-practice\.js\?v=194/);
console.log('Recorded-practice data: four explicit regions, Ecuador default, native speaker sources, CC BY credit, short excerpts, honest score and offline shell passed');
