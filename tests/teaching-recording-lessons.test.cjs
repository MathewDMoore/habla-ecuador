const assert=require('node:assert/strict');
const {catalog}=require('../quick-lessons.js');
const ids=['meaning-dar-igual','commands-polarity','hacer-in-context','register-indifference'];
for(const locale of ['es-EC','en-US','en-GB']){
 const items=catalog[locale];
 assert.equal(new Set(items.map(i=>i.id)).size,items.length);
 for(const id of ids){
  const lesson=items.find(i=>i.id===id);
  assert.ok(lesson,`${locale}: ${id}`);
  assert.ok(lesson.sources.length);
  assert.equal(lesson.explanation.split('|').length%2,1,'balanced target-language speech passages');
  for(const scene of lesson.situations){
   assert.ok(lesson.examples.some(([p,m])=>p===scene.phrase&&m===scene.meaning),'speaking model and bilingual meaning match');
  }
  if(locale!=='es-EC'){
   const es=catalog['es-EC'].find(i=>i.id===id);
   assert.deepEqual(lesson.examples,es.examples.map(([p,m])=>[m,p]),'English practice uses the same meanings');
  }
 }
}
const lesson=id=>catalog['es-EC'].find(i=>i.id===id);
assert.ok(lesson('meaning-dar-igual').examples.some(([p,m])=>p.startsWith('No me das igual')&&m.startsWith('You matter to me')),'negation must preserve caring');
assert.ok(lesson('meaning-dar-igual').examples.some(([p,m])=>p.startsWith('Ya da igual')&&m.includes('anymore')),'ya expresses change');
assert.ok(lesson('commands-polarity').examples.some(([p,m])=>p.startsWith('No vengas')&&m.startsWith('Do not come')));
assert.ok(lesson('hacer-in-context').examples.some(([p,m])=>p.startsWith('Estaba haciendo')&&m.startsWith('I was making')),'progressive must retain aspect');
assert.match(lesson('register-indifference').explanation,/vulgar/);
assert.ok(lesson('register-indifference').examples.some(([p,m])=>p.startsWith('Me importa un carajo')&&m.includes('do not give a fuck')),'idiom must not reverse polarity');
console.log('PASS: contextual meaning, polarity, aspect, register and bilingual speaking models');
