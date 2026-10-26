const assert=require('node:assert/strict');
const {lookup,refine,normalizedTerm}=require('../language-community-terms.js');
assert.equal(normalizedTerm(' Spanish–speaking '),'spanish-speaking');
const directions=[
 ['Spanish-speaking','hispanohablante'],
 ['Spanish speaking','hispanohablante'],
 ['Spanish speaker','hispanohablante'],
 ['Spanish speakers','hispanohablantes'],
 ['A Spanish-speaking person','una persona hispanohablante'],
 ['Spanish-speaking people','personas hispanohablantes'],
 ['Spanish-speaking country','país hispanohablante'],
 ['A Spanish-speaking country','un país hispanohablante'],
 ['Spanish-speaking countries','países hispanohablantes'],
 ['Spanish-speaking community','comunidad hispanohablante'],
 ['Spanish-speaking communities','comunidades hispanohablantes'],
 ['Spanish-speaking population','población hispanohablante']
];
for(const source of ['en-US','en-GB'])for(const target of ['es-EC','es-BO','es-MX','es-CO']){
 for(const [phrase,translation] of directions){
  assert.equal(lookup(phrase,{source,target}),translation,`${source}/${target}: ${phrase}`);
 }
 assert.equal(lookup('Spanish-speaking.',{source,target}),'hispanohablante.');
 assert.equal(lookup('Spanish-speaking!',{source,target}),'hispanohablante!');
 assert.equal(lookup('SPANISH-SPEAKING',{source,target}),'HISPANOHABLANTE');
}
for(const source of ['es-EC','es-BO','es-MX','es-CO'])for(const target of ['en-US','en-GB']){
 for(const variant of ['hispanohablante','hispanoparlante','de habla hispana']){
  assert.equal(lookup(variant,{source,target}),'Spanish-speaking');
 }
 for(const variant of ['hispanohablantes','hispanoparlantes']){
  assert.equal(lookup(variant,{source,target}),'Spanish speakers');
 }
 for(const variant of ['países hispanohablantes','países hispanoparlantes','países de habla hispana']){
  assert.equal(lookup(variant,{source,target}),'Spanish-speaking countries');
 }
 assert.equal(lookup('persona hispanoparlante',{source,target}),'Spanish-speaking person');
 assert.equal(lookup('comunidad de habla hispana',{source,target}),'Spanish-speaking community');
 assert.equal(lookup('Hispanoparlante.',{source,target}),'Spanish-speaking.');
}
for(const [input,source,target] of [
 ['Spanish','en-US','es-EC'],['Spanish language','en-US','es-EC'],
 ['Spanish nationality','en-US','es-EC'],['A Spanish citizen','en-GB','es-EC'],
 ['Español','es-EC','en-US'],['española','es-EC','en-US'],
 ['Spain','en-US','es-EC'],['Hispanic','en-US','es-EC'],
 ['Spanish-speaking','en-US','en-GB'],
 ['hispanohablante','es-EC','es-BO'],
 ['Spanish-speaking person is Spanish','en-US','es-EC']
])assert.equal(lookup(input,{source,target}),null,`do not conflate ${input}`);
assert.equal(refine('Español','Spanish-speaking',{source:'en-US',target:'es-EC'}),'hispanohablante');
assert.equal(refine('La comunidad española','The Spanish-speaking community',{source:'en-GB',target:'es-EC'}),'La comunidad hispanohablante');
assert.equal(refine('Muchos países españoles','Many Spanish-speaking countries',{source:'en-US',target:'es-BO'}),'Muchos países hispanohablantes');
assert.equal(refine('Son españoles','They are Spanish-speaking',{source:'en-US',target:'es-EC'}),'Son hispanohablantes');
assert.equal(refine('La población hispanoparlante','The Spanish-speaking population',{source:'en-US',target:'es-EC'}),'La población hispanoparlante');
assert.equal(refine('Ella habla español','She is Spanish-speaking',{source:'en-US',target:'es-EC'}),'Ella habla español','preserve natural paraphrase');
assert.equal(refine('Es una persona que habla español','She is a Spanish-speaking person',{source:'en-US',target:'es-EC'}),'Es una persona que habla español');
assert.equal(refine('La lengua española','The Spanish-speaking language',{source:'en-US',target:'es-EC'}),'La lengua española','avoid language adjective');
assert.equal(refine('Habló español y alemán','The Spanish-speaking student spoke Spanish and German',{source:'en-US',target:'es-EC'}),'Habló español y alemán','other Spanish use rules out automatic rewrite');
assert.equal(refine('Español','Spanish-speaking',{source:'es-EC',target:'en-US'}),'Español','no wrong-way rewrite');
assert.equal(refine('Español','Spanish-speaking',{source:'en-US',target:'en-GB'}),'Español','no same-language rewrite');
console.log('Language community: Spanish-speaking, hispanohablante, hispanoparlante, de habla hispana, plurality and nationality safeguards passed.');
