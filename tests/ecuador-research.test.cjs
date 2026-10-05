const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'..');
let calls=0;
const context=vm.createContext({console,setTimeout,clearTimeout,AbortController,
 localStorage:{getItem:()=>null,setItem(){}},
 document:{addEventListener(){},createElement:()=>({set innerHTML(value){this.value=value;}})},
 fetch:async()=>{calls++;return {ok:true,json:async()=>({responseStatus:200,responseData:{translatedText:'General draft.'}})};}
});
vm.runInContext(fs.readFileSync(path.join(root,'research-reference.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
async function main(){
 run('translationPurpose="academic";sourceLanguage="es-EC";targetLanguage="en-US";direction="ec-en";');
 const source=run('ECUADOR_RESEARCH_REFERENCE.sentences.map(item=>item.es).join("\\n\\n")');
 context.sample=source;
 const translated=await run('requestGeneralTranslation(sample)');
 assert.equal(calls,0,'approved sample stays local');
 assert.equal(translated.split('\n\n').length,2);
 assert.ok(translated.includes('Cuenca'));
 assert.ok(translated.includes('buen vivir (well-being)'));
 assert.ok(translated.includes('control and mitigate'));
 assert.ok(!/cures|improves health|proves|Mexico|Bolivia|petitions/i.test(translated));
 assert.equal(run('findAcademicReference(sample).reference.id'),'sellers-espinoza-2017-cuenca-air-quality');
 for(const text of [source.replace('cuencanos','quiteños'),source.replace('gravemente','levemente'),source+' (Smith, 2024)',source+'\n\nTexto nuevo.']){
  context.changed=text;
  assert.equal(run('findAcademicReference(changed)'),null,'changed facts cannot use remembered output');
 }
 for(const item of run('ECUADOR_RESEARCH_REFERENCE.sentences')){
  context.sentence=item.es.replace(/ /g,'\n');
  assert.equal(run('findAcademicReference(sentence).text'),item.en,'PDF line wrapping preserves exact source');
  assert.notEqual(item.en,item.publishedEnglish,'editorial English is distinguished from the publication');
 }
 context.heading='Resumen:\n'+run('ECUADOR_RESEARCH_REFERENCE.sentences[0].es');
 assert.ok(run('findAcademicReference(heading).text').startsWith('Abstract\n'));
 run('targetLanguage="en-GB";');
 assert.equal(await run('requestGeneralTranslation(sample)'),translated,'this excerpt has no forced regional rewrite');
 run('translationPurpose="everyday";');
 await run('requestGeneralTranslation(sample)');
 assert.equal(calls,1,'academic memory does not leak into everyday translation');
 run('translationPurpose="academic";targetLanguage="en-US";');
 const references=run('ECUADOR_RESEARCH_REFERENCES');
 assert.equal(references.length,3);
 for(const reference of references){
  context.expanded=reference.sentences.map(item=>item.es).join('\n\n');
  const before=calls;
  const output=await run('requestGeneralTranslation(expanded)');
  assert.equal(calls,before,'all approved Ecuadorian samples stay local');
  assert.equal(output,reference.sentences.map(item=>item.en).join('\n\n'));
  assert.equal(run('findAcademicReference(expanded).reference.id'),reference.id);
  context.contiguous=reference.sentences.map(item=>item.es).join(' ');
  assert.equal(run('findAcademicReference(contiguous).text'),reference.sentences.map(item=>item.en).join(' '));
  context.altered=context.expanded.replace(/599|1998|2016/, '9999');
  if(context.altered!==context.expanded) assert.equal(run('findAcademicReference(altered)'),null,'changed counts/dates reject saved claims');
 }
 context.mixed=references[1].sentences[0].es+'\n\n'+references[2].sentences[0].es;
 assert.equal(run('findAcademicReference(mixed)'),null,'never attribute mixed-paper content to one source');
 const callsBeforeLimit=calls;
 await assert.rejects(run('requestGeneralTranslation("texto ".repeat(1400),"ec-en",{purpose:"academic",target:"en-US"})'),error=>error.code==='research_limit');
 assert.equal(calls,callsBeforeLimit,'overlong paper sections must fail locally without sending partial text');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/research-source-manifest.json'),'utf8'));
 const approved=manifest.find(item=>item.source_id==='sellers-espinoza-2017-cuenca-air-quality');
 assert.equal(approved.review_status,'approved');
 assert.equal(approved.license_code,'CC-BY-3.0');
 assert.equal(approved.role,'translation-memory');
 assert.ok(approved.source_sha256.match(/^[0-9a-f]{64}$/));
 for(const reference of references){
  const record=manifest.find(item=>item.source_id===reference.id);
  assert.equal(record.review_status,'approved');
  assert.equal(record.sentence_pairs,reference.sentences.length);
  const crypto=require('node:crypto');
  assert.equal(record.source_sha256,crypto.createHash('sha256').update(reference.sentences.map(item=>item.es).join('\n\n')).digest('hex'));
 }
 const held=manifest.find(item=>item.source_id==='aci-3736-ethylene');
 assert.equal(held.review_status,'quarantined');
 assert.equal(held.ingested,false);
 for(const name of ['index.html','translator.html']){
  const html=fs.readFileSync(path.join(root,name),'utf8');
  assert.equal((html.match(/id="load-ecuador-research-reference"/g)||[]).length,1);
  for(const reference of references) assert.ok(html.includes('value="'+reference.id+'"'));
  assert.ok(html.includes('selected excerpts · CC BY 3.0'));
 }
 console.log('Ecuadorian research checks passed: source fidelity, local retrieval, context isolation, attribution, license filtering and changed-input rejection.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
