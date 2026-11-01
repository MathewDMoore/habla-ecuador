const assert=require('node:assert/strict');
const ctx=require('../spanish-context.js');
for(const word of ['culo','verga','panocha','puta','afeminado','mal parido']){
 assert.ok(ctx.wordMeanings(word,{source:'es-EC',target:'en-US'}).length,word);
 assert.ok(ctx.dictionary({query:word,region:'es-EC'}).length,word);
 assert.ok(ctx.analyse(word,{source:'es-EC',target:'en-US'}).some(e=>e.choices?.some(c=>c.startsWith('contributed-'))),word);
}
assert.match(ctx.wordMeanings('culo',{source:'es-EC',target:'en-GB'})[0].text,/arse/);
assert.match(ctx.wordMeanings('culo',{source:'es-EC',target:'en-US'})[0].text,/ass/);
assert.equal(ctx.dictionary({query:'verga',region:'es-EC'}).filter(e=>e.term==='verga (vulgar anatomy)').length,1);
assert.equal(ctx.wordMeanings('afeminada')[0].text,'effeminate');
assert.equal(ctx.wordMeanings('mal parida')[0].text,'bastard (insult)');
assert.deepEqual(ctx.wordMeanings('panocha',{source:'es-BO'}),[],'do not impose anatomical sense on documented food usage in Bolivia');
assert.deepEqual(ctx.wordMeanings('El culo de la botella.'),[],'do not apply a headword to an object sentence');
assert.deepEqual(ctx.wordMeanings('La panocha es un alimento.'),[]);
assert.deepEqual(ctx.wordMeanings('culo',{purpose:'academic'}),[]);
assert.equal(ctx.translateIndifferenceExpression('Me vale verga').text,"I don't give a fuck");
assert.equal(ctx.dictionary({query:'bastard',region:'es-EC'}).some(e=>e.contributionId==='2026-11-01-user-vocabulary'),true);
assert.equal(ctx.dictionary({query:'afeminado',region:'es-EC'})[0].register.includes('Vulgar'),false);
console.log('PASS: six contributed headwords, sense choices, UK wording, alias spellings, no duplicate verga, regional/context boundaries and existing idiom preservation.');
