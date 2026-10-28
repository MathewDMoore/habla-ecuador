const assert=require('node:assert/strict'),fs=require('node:fs');
const batch=require('../regional-vocabulary.js'),context=require('../spanish-context.js');
assert.equal(batch.length,30);assert.equal(new Set(batch.map(e=>e.id)).size,30);assert.equal(new Set(batch.map(e=>e.headword)).size,22);
const all=context.dictionary({region:'all'});assert.equal(all.length,82);
const byId=id=>all.find(e=>e.id==='v116-'+id), ids=options=>context.dictionary(options).filter(e=>e.batch==='regional-vocabulary-116').map(e=>e.id.replace('v116-',''));
const types=new Set(['familiar','culture','vocabulary','idiom','exclamation','literal']);
for(const entry of batch){
 assert.ok(entry.term&&entry.speech&&entry.us&&entry.uk&&entry.scope&&entry.note&&entry.exampleEs&&entry.exampleUs&&entry.exampleUk);
 assert.ok(types.has(entry.usageType));assert.equal(entry.sourceChecked,'2026-10-24');assert.ok(entry.sourceSense);assert.match(entry.url,/^https:\/\/(www\.asale\.org\/damer\/|dem\.colmex\.mx\/Ver\/)/);
 assert.match(entry.uncertainty,/native-speaker review/i);assert.equal(entry.regionalSenseAttested,true);
 assert.deepEqual(byId(entry.id.replace('v116-','')).usage.cities,[],'no new city attestation inferred');
 for(const region of entry.regions){
  assert.ok(ids({region,query:entry.headword}).includes(entry.id.replace('v116-','')),'each headword is indexed in each supported country');
  for(const english of ['en-US','en-GB'])assert.ok(ids({region:english,target:region,query:entry.headword}).includes(entry.id.replace('v116-','')),'English and counterpart region can find each sense');
 }
 const caution=/vulgar|offensive|insult/i.test(entry.register);
 assert.equal(ids({region:'all',query:entry.term,tone:caution?'mild':'caution'}).includes(entry.id.replace('v116-','')),false,'register gates apply to every new sense');
 for(const source of ['es-EC','es-MX','es-BO','es-VE','es-PE','es-CO'])assert.deepEqual(context.slang(entry.headword,{source}),[],'new dictionary data does not silently add translator detection rules');
}
assert.deepEqual(ids({region:'es-BO',query:'llucho'}),['llucho-hat']);assert.deepEqual(ids({region:'es-EC',query:'llucho'}),['llucho-naked']);
assert.deepEqual(ids({region:'en-US',target:'es-BO',query:'naked'}),[],'a contrast note must not become an English counterpart match');
assert.deepEqual(ids({region:'en-US',target:'es-PE',query:'embarrassment'}),['palta-embarrassment']);assert.deepEqual(ids({region:'en-US',target:'es-PE',query:'avocado'}),['palta-avocado']);
assert.deepEqual(ids({region:'es-EC',query:'atatay'}),['atatay-disgust']);assert.deepEqual(ids({region:'es-BO',query:'atatay'}),['atatay-pain']);
assert.ok(ids({region:'es-BO',query:'chamba'}).includes('chamba'));assert.equal(ids({region:'es-BO',query:'chambear'}).length,0,'noun evidence does not validate a verb in Bolivia');
assert.equal(ids({region:'es-VE',query:'vaina',tone:'mild'}).length,0);assert.ok(ids({region:'es-EC',query:'vaina',tone:'mild'}).includes('vaina-informal'));
assert.match(byId('chingon-quality').scope,/ASALE/);assert.match(byId('chingon-skilled').register,/Vulgar/);
for(const word of ['hangover','beer','work','cash','cool','definitely','avocado','naked'])assert.ok(context.dictionary({region:'en-US',query:word}).some(e=>e.batch==='regional-vocabulary-116'),'useful ordinary English counterpart lookup: '+word);
for(const query of ['unrelated-invented-item','que ya','lluchoxyz','atatayxyz'])assert.equal(ids({region:'all',query}).length,0);
assert.equal(context.translateEnglishVulgarity('horny'),null);assert.equal(context.translateEnglishVulgarity('badass'),null);
for(const page of ['index.html','translator.html'])assert.match(fs.readFileSync(page,'utf8'),/regional-vocabulary\.js\?v=161/);assert.match(fs.readFileSync('sw.js','utf8'),/regional-vocabulary\.js\?v=161/);
console.log('Regional vocabulary: 30 senses/22 headwords; 82 total; every entry/source/example/region/type/tone, English counterparts, cross-country false friends, contrast-note exclusion, negatives and offline asset passed');

const crypto=require('node:crypto'),preserved=[];
for(const region of ['all','es-EC','es-BO','es-MX','es-VE','es-PE','es-CO','en-US','en-GB','quito','monterrey','mexico-city','bogota'])for(const category of ['all','slang','literal','clinical'])for(const tone of ['all','mild','caution'])preserved.push(context.dictionary({region,category,tone}).filter(e=>e.batch!=='regional-vocabulary-116'&&e.batch!=='cuba-154'));
assert.equal(crypto.createHash('sha256').update(JSON.stringify(preserved)).digest('hex'),'c629db51402ba8747dce5d58b76ea897bd48274d519e2289bfd071d1d30a0f6e','all 49 pre-build-116 entries, metadata and ordering preserved in 168 views');
