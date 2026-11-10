const assert=require('node:assert/strict');
const {catalog}=require('../quick-lessons.js');
for(const locale of ['es-EC','en-US','en-GB']){
 const items=catalog[locale];
 assert.equal(new Set(items.map(item=>item.id)).size,items.length,'stable lesson selection IDs');
 for(const id of ['already-still',locale==='es-EC'?'por-para':'purpose','future']){
  assert.ok(items.some(item=>item.id===id),'preserve the original lesson '+id);
 }
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
const videoTopics={
 'everyday-comparisons':['mejor','peor','mayor','menor'],
 'how-often':['Nunca','De vez en cuando','A menudo','Alguna vez'],
 'everyday-actions':['subir','bajar','poner','guardar'],
 'llevar-traer-tenses':['llevé','traje','llevo','traeré'],
 'cooking-actions':['saco','Pelo','Corto','Pico']
};
for(const [id,answers] of Object.entries(videoTopics)){
 const lesson=catalog['es-EC'].find(item=>item.id===id);
 assert.ok(lesson,'missing lesson '+id);
 assert.equal(lesson.inspiration,'My Daily Spanish');
 assert.equal(lesson.situations.length,answers.length);
 assert.deepEqual(lesson.checks.map(check=>check.answer),answers);
 for(const {prompt,options,answer,note} of lesson.checks){
  assert.ok(prompt.includes('_____'));
  assert.equal(new Set(options).size,4);
  assert.ok(options.includes(answer));
  assert.equal(note.split(' / ').length,2,'feedback appears in both languages');
 }
 for(const [phrase,meaning] of lesson.examples){
  assert.ok(phrase&&meaning,'both languages are included for each example');
 }
}
console.log('Short lessons: bilingual models, speaking situations, scored grammar exercises and creator credit verified.');
