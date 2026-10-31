const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const begin=source.indexOf('function dictionaryPracticeText('),end=source.indexOf('function cancelDictionaryPractice(');
const context={};vm.createContext(context);vm.runInContext(source.slice(begin,end),context);
const compare=(a,b)=>context.dictionaryPracticeComparison(a,b);
assert.equal(compare('¡Qué frío!','que frio').exact,true);
assert.equal(compare('ñaño','nano').exact,false,'ñ is distinct from n');
assert.equal(compare('camello','camino').exact,false);
assert.equal(compare('pana','mi pana').exact,false,'extra words do not earn a match');
assert.equal(compare('no no','no').matched.size,1,'one word cannot match two repeated targets');
let result=compare('Voy al partido con un pana del trabajo.','Voy al partido con un del trabajo');
assert.equal(result.focus,'pana del trabajo');assert.equal(result.matched.has(5),false);assert.equal(result.matched.size,7);
assert.equal(compare('hola pana','pana hola').exact,false,'word order matters');
assert.equal(compare('camello','').focus,'camello');
assert.equal(compare('¿Cómo estás?','COMO ESTAS').exact,true);
assert.equal(compare('pana','<script>pana</script>').exact,false);
assert.ok(compare('pana '.repeat(300),'pana '.repeat(300)).words.length<=200,'alignment work is bounded');
console.log('Dictionary practice: accent/ñ, ordered word alignment, repetition, focus, extra words and bounded comparison passed');
assert.equal(compare('uno dos tres cuatro','uno dos tres').wordScore,75);
assert.equal(compare('uno dos tres','uno dos tres extra').wordScore,75,'extra words reduce the score');
assert.equal(compare('no no','no').wordScore,50,'repeated-word omission reduces score');
assert.equal(compare('uno dos','dos uno').wordScore,50,'order affects word score');
assert.equal(compare('hola','hola').wordScore,100);
assert.equal(compare('hola','').wordScore,0);
assert.equal(compare('','').wordScore,null,'empty target has no percentage');
assert.equal(compare('hola '.repeat(201),'hola '.repeat(201)).wordScore,null,'bounded alignment never reports a percentage for truncated input');
console.log('Recognized-word percentage: omissions, extras, repeated words, order, empty and oversized input passed');

const cuba=require('../spanish-context.js').dictionary({region:'es-CU'});
for(const entry of cuba){
 assert.ok(entry.speech&&!entry.speech.includes('(Cuba)'));
 assert.ok(entry.exampleEs&&entry.exampleUs&&entry.exampleUk,'regional words have sentence practice');
}
assert.equal(cuba.find(e=>e.term==='guagua (Cuba)').speech,'guagua');
assert.equal(cuba.find(e=>e.term==='jaba (Cuba)').speech,'jaba');
