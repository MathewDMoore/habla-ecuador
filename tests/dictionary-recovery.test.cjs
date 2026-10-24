const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const dictionary=require('../spanish-context.js'),source=fs.readFileSync('app.js','utf8'),context={HablaSpanishContext:dictionary};
vm.createContext(context);vm.runInContext(source.slice(source.indexOf('function regionalSearchRecovery('),source.indexOf('function clearRegionalSearchFilters(')),context);
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
console.log('Dictionary recovery: hidden-filter vs regional vs coverage distinction; sourced insult spelling variants, explicit uncertainty, tone/type filters and no automatic mapping passed');
