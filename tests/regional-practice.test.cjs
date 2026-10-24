const assert=require('node:assert/strict'),fs=require('node:fs');
const lesson=require('../regional-practice.js');
assert.equal(lesson.items.length,4);assert.equal(new Set(lesson.items.map(i=>i.id)).size,4);
assert.match(lesson.source.url,/^https:\/\/radialistas\.net\//);
assert.equal(lesson.source.license,'CC BY-SA 3.0 ES');assert.equal(lesson.source.licenseUrl,'https://creativecommons.org/licenses/by-sa/3.0/es/');
assert.ok(lesson.source.credit.includes('Radialistas')&&lesson.source.credit.includes('Catholic Relief Services'));
assert.match(lesson.source.changes,/shortened/);assert.match(lesson.source.limits,/have not been verified/);
for(const item of lesson.items){assert.ok(item.spanish&&item.us&&item.uk&&item.coaching&&item.register&&item.role&&item.context);assert.ok(['es-CO','es-EC'].includes(item.locale));}
assert.deepEqual(lesson.items.map(i=>i.locale),['es-CO','es-CO','es-EC','es-EC']);
assert.ok(lesson.items.slice(0,2).every(i=>i.role.includes('Colombian')));
assert.ok(lesson.items.slice(2).every(i=>i.role.includes('unverified')));
assert.equal(lesson.items.filter(i=>i.adapted).length,1);
assert.ok(!JSON.stringify(lesson).includes('.mp3'),'source audio is not bundled or treated as a clean reference');
for(const page of ['index.html','translator.html'])assert.ok(fs.readFileSync(page,'utf8').includes('regional-practice.js?v='));
assert.ok(fs.readFileSync('sw.js','utf8').includes('regional-practice.js?v='),'lesson data available in cached shell');
console.log('Regional practice: four bounded prompts, source credit/license, adaptation, regional uncertainty and offline asset passed');
