const test=require('node:test');
const assert=require('node:assert/strict');
const grammar=require('../grammar-reference.js');

test('regular verb tables cover the core tenses',()=>{
 assert.deepEqual(grammar.forms('hablar','present'),['hablo','hablas','habla','hablamos','habláis','hablan']);
 assert.deepEqual(grammar.forms('comer','preterite'),['comí','comiste','comió','comimos','comisteis','comieron']);
 assert.deepEqual(grammar.forms('vivir','imperfect'),['vivía','vivías','vivía','vivíamos','vivíais','vivían']);
 assert.deepEqual(grammar.forms('hablar','subjunctive'),['hable','hables','hable','hablemos','habléis','hablen']);
 assert.deepEqual(grammar.forms('comer','imperfectSubjunctive'),['comiera','comieras','comiera','comiéramos','comierais','comieran']);
});

test('irregular and future/conditional stems are correct',()=>{
 assert.deepEqual(grammar.forms('ser','present'),['soy','eres','es','somos','sois','son']);
 assert.deepEqual(grammar.forms('ir','preterite'),['fui','fuiste','fue','fuimos','fuisteis','fueron']);
 assert.deepEqual(grammar.forms('estar','subjunctive'),['esté','estés','esté','estemos','estéis','estén']);
 assert.deepEqual(grammar.forms('tener','future'),['tendré','tendrás','tendrá','tendremos','tendréis','tendrán']);
 assert.deepEqual(grammar.forms('hacer','conditional'),['haría','harías','haría','haríamos','haríais','harían']);
});

test('unknown or unsafe verb keys are not conjugated',()=>{
 assert.equal(grammar.forms('__proto__','present'),null);
 assert.equal(grammar.forms('hablar','nonexistent'),null);
 assert.ok(grammar.topics.includes('conditionals'));
});
