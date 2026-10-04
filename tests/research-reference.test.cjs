const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname,'..');
let calls = 0;
const context = vm.createContext({
  console, setTimeout, clearTimeout, AbortController,
  localStorage: {getItem:()=>null, setItem:()=>{}},
  document: {addEventListener:()=>{}, createElement:()=>({set innerHTML(value){this.value=value;}})},
  fetch: async url => {
    calls += 1;
    const source = new URL(url).searchParams.get('q');
    return {ok:true,json:async()=>({responseStatus:200,responseData:{translatedText:source}})};
  }
});
vm.runInContext(fs.readFileSync(path.join(root,'research-reference.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run = code => vm.runInContext(code,context);
async function main() {
  run('translationPurpose="academic"; sourceLanguage="es-MX"; targetLanguage="en-US"; direction="ec-en";');
  const source = run('PRAGMATICS_REFERENCE.sourceEs');
  const result = await run('requestGeneralTranslation(PRAGMATICS_REFERENCE.sourceEs)');
  assert.equal(calls,0,'matched abstract stays local');
  assert.equal((result.match(/\b30\b/g)||[]).length,2);
  for (const term of ['requests','linguistic politeness','form of address','directness of the head act','positive politeness','negative politeness','northern Mexico','power and social distance','explicit pragmatics instruction']) assert.ok(result.includes(term),term);
  for (const label of ['(1)','(2)','(3)','(4)']) assert.ok(result.includes(label));
  assert.ok(!/petitions|courtesy|Ecuador|Bolivia|significan|proves|causes/i.test(result));
  context.wrapped = source.replace(/ /g,'\n');
  assert.equal(run('findPragmaticsReference(wrapped)'),run('findPragmaticsReference(PRAGMATICS_REFERENCE.sourceEs)'));
  context.paragraphs = run('PRAGMATICS_REFERENCE.sentences').slice(0,4).map(s=>s.es).join('\n\n');
  assert.equal(run('findPragmaticsReference(paragraphs)').split('\n\n').length,4);
  context.heading = 'Resumen:\n'+source;
  context.keywords = source+'\n\n'+run('PRAGMATICS_REFERENCE.sentences[4].es');
  assert.ok(run('findPragmaticsReference(heading)').startsWith('Abstract\n'));
  assert.ok(run('findPragmaticsReference(keywords)').includes('Keywords: heritage speakers'));
  for (const change of [source.replace('30','31'),source.replace('México','Ecuador'),source+' (Smith, 2024)',source.replace('diferencias sutiles','diferencias significativas')]) {
    context.changed=change;
    assert.equal(run('findPragmaticsReference(changed)'),null,'changed facts cannot use memorized output');
  }
  run('targetLanguage="en-GB";');
  assert.ok((await run('requestGeneralTranslation(PRAGMATICS_REFERENCE.sourceEs)')).includes('analysed'));
  run('targetLanguage="en-US";');
  assert.ok(result.includes('analyzed'));
  assert.equal(run('refineAcademicEnglish("Petitions use linguistic courtesy and negative courtesy strategies.", PRAGMATICS_REFERENCE.sourceEs)'), 'Requests use linguistic politeness and negative politeness strategies.');
  assert.equal(run('refineAcademicEnglish("The petition asks the court for relief.", "La petición solicita al tribunal una medida judicial.")'),'The petition asks the court for relief.');
  assert.equal(run('refineAcademicEnglish("linguistic courtesy (Courtesy, 2017) https://example.org/petition",PRAGMATICS_REFERENCE.sourceEs)'), 'linguistic politeness (Courtesy, 2017) https://example.org/petition');
  assert.ok(run('PRAGMATICS_REFERENCE.publishedEnglish').includes('interlocuters'));
  assert.equal(run('TRANSLATOR_LANGUAGES["es-MX"].voice'),'es-MX');
  run('targetLanguage="es-EC";');
  assert.equal(run('regionalSpanishBridge("Estoy chiro.").text'),'Estoy chiro.','research does not impose Ecuadorian slang');
  run('translationPurpose="everyday"; targetLanguage="en-US";');
  await run('requestGeneralTranslation("prueba nueva","ec-en")');
  assert.equal(calls,1,'unmatched input uses existing engine');
  run('translationPurpose="academic";');
  context.long = ('Primera oración muy larga con muchos detalles. ').repeat(25)+'\n\nSegunda sección.';
  const joined=await run('requestGeneralTranslation(long,"ec-en")');
  assert.equal(joined,context.long.trim().replace(/ +\n/g,'\n'),'chunks retain word spaces and paragraph boundaries');
  assert.ok(calls>1);
  for (const file of ['index.html','translator.html']) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.equal((html.match(/value="es-MX"/g)||[]).length,2,'Mexico appears on both sides');
    assert.ok(html.indexOf('research-reference.js?v=48')<html.indexOf('app.js?v=48'));
    assert.equal((html.match(/id="load-research-reference"/g)||[]).length,1);
  }
  assert.ok(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes('research-reference.js?v=48'));
  console.log('Research reference checks passed: fidelity, variants, context isolation, fallback, citations, chunking, and input controls.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
