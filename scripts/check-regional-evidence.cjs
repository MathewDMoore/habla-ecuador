'use strict';
const fs=require('node:fs'),path=require('node:path');
function validate(entries,sources,audit){
 const errors=[],sourceMap=new Map(sources.map(s=>[s.id,s])),ids=new Set(),auditMap=new Map(audit.checks.map(c=>[c.id,c]));
 const fail=(entry,message)=>errors.push(entry.id+': '+message);
 for(const e of entries){
  if(ids.has(e.id))fail(e,'duplicate ID'); ids.add(e.id);
  if(!e.id||!e.regions?.length)fail(e,'missing identity or countries');
  const attestations=e.attestations||[];
  for(const a of attestations){
   const source=sourceMap.get(a.sourceId);
   if(!source)fail(e,'unknown source '+a.sourceId);
   if(source&&!source.evidenceKinds?.includes(a.kind))fail(e,'source does not support this evidence kind');
   if(!e.regions.includes(a.country))fail(e,'attestation country is outside the sense');
   if(source&&!source.regions?.includes(a.country))fail(e,'source scope does not cover the attested country');
   if(!a.locator||!/^https:\/\//.test(a.url)||!/^\d{4}-\d{2}-\d{2}$/.test(a.checked))fail(e,'incomplete source location/date');
   const logged=auditMap.get(a.id);
   if(!logged||JSON.stringify(logged)!==JSON.stringify(a))fail(e,'attestation differs from saved source audit');
   if(a.entryId!==e.id)fail(e,'attestation belongs to a different sense');
  }
  const verification=e.verification||{};
  if(verification.dictionaryAttested&&!e.sourceSense)fail(e,'dictionary claim lacks a sense locator');
  if(verification.nationalDictionaryChecked){
   for(const country of e.regions)if(!attestations.some(a=>a.country===country&&a.kind==='national-dictionary'&&a.support==='sense'))fail(e,'national dictionary claim lacks complete sense evidence for '+country);
  }
  if(verification.corpusChecked&&!e.corpusEvidence?.some(c=>c.query&&c.sourceId&&c.country&&c.checked&&c.locator))fail(e,'unlogged corpus claim');
  if(verification.nativeSpeakerReviewed)for(const country of e.regions)if(!e.nativeReviews?.some(r=>r.reviewId&&r.country===country&&r.checked&&r.scope&&r.outcome==='approved'))fail(e,'unlogged native review for '+country);
  if(verification.cityValidated&&!e.cityReviews?.some(r=>r.city&&r.checked&&r.scope&&r.evidenceId))fail(e,'unlogged city validation');
  for(const city of e.cityEvidence||[]){
   if(!e.regions.includes(city.country)||!city.id||!city.name||!city.period)fail(e,'incomplete or mismatched city scope');
   if(!attestations.some(a=>a.city===city.id&&a.country===city.country&&a.sourceId===city.sourceId&&a.kind==='regional-study'&&a.support==='sense'))fail(e,'city label lacks matching regional source');
  }
  if(e.registerEvidence?.some(r=>r.caution)&&!/vulgar|offensive|insult/i.test(e.register))fail(e,'register caution is missing from tone filtering');
  if(e.batch==='national-regional-evidence-202'){
   if(!attestations.some(a=>a.support==='sense'))fail(e,'new sense lacks inspected evidence');
   for(const key of ['speech','us','uk','scope','note','exampleEs','exampleUs','exampleUk','uncertainty'])if(!e[key])fail(e,'missing '+key);
   if(e.pattern||e.aliases)fail(e,'dictionary batch must not install translator rules');
   if(verification.nativeSpeakerReviewed||verification.corpusChecked||verification.cityValidated)fail(e,'new batch has no logged contemporary review');
  }
 }
 for(const check of audit.checks)if(!ids.has(check.entryId))errors.push(check.id+': source audit references a missing sense');
 if(new Set(audit.checks.map(c=>c.id)).size!==audit.checks.length)errors.push('duplicate audit check ID');
 return errors;
}
if(require.main===module){
 const root=path.resolve(__dirname,'..'),entries=require(path.join(root,'regional-vocabulary.js'));
 const sources=JSON.parse(fs.readFileSync(path.join(root,'data/sources.json'),'utf8')),audit=JSON.parse(fs.readFileSync(path.join(root,'data/regional-evidence-audit-2026-11-02.json'),'utf8'));
 const errors=validate(entries,sources,audit);if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Regional evidence guard passed: '+entries.length+' senses, '+audit.checks.length+' logged checks; country/sense/date boundaries and independent review states validated.');
}
module.exports={validate};

