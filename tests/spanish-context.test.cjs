const assert=require('node:assert/strict');
const {analyse,refine,workSense}=require('../spanish-context.js');
assert.equal(refine('Come, heart, listen.','Ven, corazón, escucha.').text,'Come, sweetheart, listen.');
assert.equal(refine('The heart is an organ.','El corazón es un órgano.').text,'The heart is an organ.');
assert.equal(refine('Come, heart, listen.','Ven, corazón, escucha.',{purpose:'academic'}).text,'Come, heart, listen.');
assert.equal(refine('"Come, heart, listen."','"Ven, corazón, escucha."').text,'"Come, heart, listen."');
assert.equal(refine('A kiss (how rich).','Un beso (qué rico).').text,'A kiss (that feels so good).');
assert.equal(refine('The soup (how rich).','La sopa (qué rico).').text,'The soup (how rich).');
assert.equal(refine('A kiss and chocolate (how rich).','Un beso y chocolate (qué rico).').text,'A kiss and chocolate (how rich).');
assert.equal(refine('No hugs (how rich).','No hay abrazos (qué rico).').text,'No hugs (how rich).');
assert.equal(refine('A kiss (how nice).','Un beso (qué rico).').text,'A kiss (how nice).','acceptable pleasure wording is retained');
assert.equal(refine('"A kiss (how rich)."','Un beso (qué rico).').text,'"A kiss (how rich)."');
assert.equal(refine('I want you.','Te quiero.').text,'I want you.','ambiguous wanting versus affection stays editable');
for(const source of ['es-EC','es-BO','es-MX']) {
 const notes=analyse('Ven, corazón, escucha. Te quiero.',{source});
 assert.equal(notes.length,2);assert.match(notes[0].detail,/does not identify a country/);
 assert.equal(analyse('guagua',{source})[0].term,'guagua');
}
assert.equal(analyse('ñaño',{source:'es-BO'})[0].term,'ñaño / ñaña');
assert.equal(analyse('Ven, corazón, escucha.',{purpose:'academic'}).length,0);
assert.equal(analyse('Ven, corazón, escucha.',{source:'en-US'}).length,0);
assert.equal(analyse('Una oración entre',{image:true}).at(-1).term,'Incomplete ending');
assert.equal(analyse('Una oración entre',{image:false}).length,0);
assert.equal(workSense('Ya voy al camello.'),true);
assert.equal(workSense('El camello tiene una joroba.'),false);
assert.equal(workSense('El camello de la zapatería.'),false);
assert.equal(workSense('El camello es grande.'),false);
console.log('Spanish context checks passed: affection, pleasure, ambiguity, regional clues, research/quote protection and incomplete images.');
