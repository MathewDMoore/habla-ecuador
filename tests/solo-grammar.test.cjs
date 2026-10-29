const assert=require('node:assert/strict');
const {catalog}=require('../quick-lessons.js');
for(const locale of ['es-EC','en-US','en-GB']){
 const items=catalog[locale];
 assert.equal(items.length,4,'existing three lessons remain and solo patterns are added');
 assert.equal(new Set(items.map(item=>item.id)).size,4,'stable lesson selection IDs');
 const id=locale==='es-EC'?'solo-patterns':'only-patterns';
 const lesson=items.find(item=>item.id===id);
 assert.ok(lesson,'missing bilingual grammar lesson for '+locale);
 assert.equal(lesson.situations.length,4,'one speaking scene for each pattern');
 assert.equal(lesson.checks.length,4,'four graded fill-in exercises');
 assert.ok(lesson.examples.length>=4,'model examples are included');
 for(let i=0;i<lesson.checks.length;i++){
  const check=lesson.checks[i];
  assert.equal(check.options.length,4,'show four answer choices');
  assert.equal(new Set(check.options).size,4,'four distinct choices');
  assert.equal(check.options.filter(answer=>answer===check.answer).length,1,'one correct answer');
  assert.ok(check.prompt.includes('_____'),'missing blank');
  assert.ok(check.note.length>25,'bilingual feedback explains meaning');
  assert.ok(lesson.situations[i].phrase.length>8);
 }
}
const spanish=catalog['es-EC'].find(item=>item.id==='solo-patterns');
assert.deepEqual(spanish.checks.map(check=>check.answer),['solo','solo si','solo por','solo con']);
assert.match(spanish.explanation,/sí with an accent means “yes”/,'si/sí distinction');
assert.match(spanish.explanation,/alone/,'solo adjective meaning');
assert.match(spanish.explanation,/without an accent/,'solo current spelling guidance');
const american=catalog['en-US'].find(item=>item.id==='only-patterns');
const british=catalog['en-GB'].find(item=>item.id==='only-patterns');
assert.equal(british,american,'both English learners receive identical structure');
assert.deepEqual(american.checks.map(check=>check.answer),['only','only if','just for','only with']);
assert.match(american.explanation,/word order/,'natural English word order');
console.log('Solo patterns lesson: bilingual models, four speaking situations and scored grammar exercises verified.');
