'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {validate}=require('../scripts/check-regional-evidence.cjs');
const entries=require('../regional-vocabulary.js'),dictionary=require('../spanish-context.js');
const sources=JSON.parse(fs.readFileSync('data/sources.json')),audit=JSON.parse(fs.readFileSync('data/regional-evidence-audit-2026-11-02.json'));
assert.deepEqual(validate(entries,sources,audit),[]);
const clone=value=>JSON.parse(JSON.stringify(value));
function rejects(change,pattern){const changed=clone(entries);change(changed);assert.match(validate(changed,sources,audit).join('\n'),pattern);}
const find=(all,id)=>all.find(e=>e.id===id);
rejects(all=>find(all,'p201-meter-floro').verification.nationalDictionaryChecked=true,/national dictionary claim lacks complete sense evidence/);
rejects(all=>find(all,'p201-dar-avion').verification.nativeSpeakerReviewed=true,/unlogged native review/);
rejects(all=>find(all,'p201-dar-avion').verification.corpusChecked=true,/unlogged corpus claim/);
rejects(all=>find(all,'p202-yaaaa').verification.cityValidated=true,/unlogged city validation/);
rejects(all=>find(all,'p202-yaaaa').cityEvidence[0].country='es-MX',/mismatched city scope/);
rejects(all=>find(all,'p202-yaaaa').attestations[0].kind='national-dictionary',/source does not support this evidence kind/);
rejects(all=>find(all,'p201-echar-hueva').register='Mild informal',/register caution is missing/);
rejects(all=>find(all,'p201-dar-avion').attestations[0].locator='',/incomplete source location/);
rejects(all=>find(all,'p201-dar-avion').attestations[0].country='es-VE',/country is outside/);
rejects(all=>find(all,'p202-floro-excuse').attestations[0].entryId='p202-floro-compliment',/belongs to a different sense/);
const newer=entries.filter(e=>e.batch==='national-regional-evidence-202');
assert.equal(newer.length,10);
assert.equal(entries.filter(e=>e.verification?.nationalDictionaryChecked).length,10);
assert.equal(dictionary.dictionary({region:'all'}).length,121);
assert.equal(dictionary.dictionary({region:'es-MX',query:'echar la hueva',tone:'mild'}).length,0);
assert.equal(dictionary.dictionary({region:'es-MX',query:'echar la hueva',tone:'caution'}).length,1);
assert.equal(dictionary.evidenceSummary(find(entries,'p201-meter-floro')).nationalCountries.length,0);
assert.deepEqual(dictionary.evidenceSummary(find(entries,'p201-meter-floro')).componentOnlyCountries,['es-PE']);
assert.deepEqual(dictionary.evidenceSummary(find(entries,'p201-dar-avion'),'es-VE').nationalCountries,[]);
assert.equal(dictionary.dictionary({region:'la-paz'}).length,3);
for(const e of dictionary.dictionary({region:'la-paz'})){assert.deepEqual(e.usage.cities,['La Paz']);assert.equal(e.verification.cityValidated,false);assert.match(e.uncertainty,/contemporary local review remain pending/);}
assert.equal(dictionary.dictionary({region:'es-PE',query:'floro'}).filter(e=>e.batch==='national-regional-evidence-202').length,3);
assert.equal(dictionary.dictionary({region:'en-GB',target:'es-PE',query:'flattering compliment'}).filter(e=>e.id==='p202-floro-compliment').length,1);
assert.equal(dictionary.dictionary({region:'en-GB',target:'es-MX',query:'parrots'}).length,0);
assert.equal(dictionary.dictionary({region:'en-US',target:'es-PE',query:'parrots'}).length,0,'literal aid is not an equivalent');
for(const e of newer)assert.deepEqual(dictionary.slang(e.speech,{source:e.regions[0]}),[],'new data does not create automatic replacement rules');
console.log('PASS: exact national sense checks; 10 new senses; three documented La Paz usages; register disagreement; partial-component limits; negative metadata-tampering cases; country-isolated evidence and search.');

