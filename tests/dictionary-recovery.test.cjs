const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const dictionary=require('../spanish-context.js'),source=fs.readFileSync('app.js','utf8'),context={HablaSpanishContext:dictionary};
vm.createContext(context);vm.runInContext(source.match(/^const normalize = .+$/m)[0]+'\n'+source.slice(source.indexOf('function englishCounterpartAlternatives('),source.indexOf('function clearRegionalSearchFilters(')),context);
const base={query:'buddy',region:'en-US',target:'es-EC',category:'slang',usage:'culture',tone:'caution'};
assert.equal(context.regionalSearchRecovery(base,dictionary.dictionary(base)).kind,'filters');
const missing={...base,query:'synthetic-unlisted-expression'};assert.equal(context.regionalSearchRecovery(missing,[]).kind,'missing');
const other={...base,query:'huerco',region:'es-EC',usage:'all',tone:'all',category:'all'};assert.equal(context.regionalSearchRecovery(other,[]).kind,'region');
for(const spelling of ['cocksucker','cock sucker','cock-sucker','COCK SUCKER'])for(const region of ['en-US','en-GB']){
 const options={query:spelling,region,target:'es-EC',category:'slang',tone:'caution'};
 const entries=dictionary.dictionary(options);assert.equal(entries.length,1);assert.equal(entries[0].id,'mamon-insult-counterpart');assert.equal(entries[0].shared,true);assert.match(entries[0].uncertainty,/unverified/);assert.match(entries[0].note,/literal reading needs a separate/);assert.equal(entries[0].usage.cities.length,0);
 assert.equal(dictionary.dictionary({...options,tone:'mild'}).length,0);
 assert.equal(dictionary.dictionary({...options,usage:'culture'}).length,0);
 assert.equal(context.regionalSearchRecovery({...options,usage:'culture'},[]).kind,'filters');
 assert.equal(dictionary.translateEnglishVulgarity(spelling),null,'dictionary addition never becomes a universal automatic translation');
}
for(const query of ['unrelated-synthetic-word','cocksuckersxyz'])assert.equal(dictionary.dictionary({region:'all',query}).length,0);
for(const region of ['en-US','en-GB']){
 const options={query:'Sexy',region,target:'es-EC',category:'slang',usage:'vocabulary',tone:'caution'};
 assert.equal(dictionary.dictionary(options).length,0,'a strict vulgar filter does not misclassify milder words');
 const recovery=context.regionalSearchRecovery(options,[]);
 assert.deepEqual(recovery.alternatives.map(entry=>entry.term),['sexi / sexy','pintero']);
 assert.match(recovery.alternatives[1].scope,/Guayaquil.*milder/);
 assert.ok(dictionary.dictionary({...options,target:'es-MX',usage:'all',tone:'mild'}).some(entry=>entry.id==='attraction-estar-bueno'));
 assert.deepEqual(context.regionalSearchRecovery({...options,query:'cock sucker',tone:'mild'},[]).alternatives,[]);
}
const cock={query:'Cock',region:'en-US',target:'es-EC',category:'slang',usage:'idiom',tone:'caution'};
assert.equal(dictionary.dictionary(cock).length,0);
assert.deepEqual(context.regionalSearchRecovery(cock,[]).alternatives.map(e=>e.term),['verga (vulgar anatomy)']);
console.log('Dictionary recovery: hidden-filter vs regional vs coverage distinction; sourced insult spelling variants, explicit uncertainty, tone/type filters and no automatic mapping passed');
