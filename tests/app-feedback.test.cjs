const assert=require('node:assert/strict'),fs=require('node:fs');
const api=require('../app-feedback.js'),ui=require('../interface-language.js');
const source={topic:'regional',region:'es-VE',city:'Caracas',reference:'Neutral synthetic reference',problem:'This means something else here.',correction:'Use the full sentence.',example:'Neutral original example',reviewer:'Test reviewer',includeText:false,source:'PRIVATE SOURCE',translation:'PRIVATE DRAFT',context:{screen:'dictionary-view',version:'test',sourceLocale:'en-US',targetLocale:'es-EC',privateQuery:'secret'}};
const report=api.format(source);
assert.ok(!report.includes('PRIVATE')&&!report.includes('secret'));assert.ok(report.includes('not verified')&&report.includes('Caracas'));
assert.equal(api.clean(source).source,'');assert.equal(api.clean(source).translation,'');
const included=api.format({...source,includeText:true});assert.ok(included.includes('PRIVATE SOURCE')&&included.includes('PRIVATE DRAFT'));
assert.ok(api.format(source,s=>ui.t(s,'es')).includes('INFORME DE USUARIO'));assert.equal(api.clean({topic:'__proto__',region:'constructor'}).topic,'other');
assert.equal(api.clean({problem:'x'.repeat(6000)}).problem.length,4000);assert.equal(api.clean({...source,includeText:true,source:'x'.repeat(8000)}).source.length,3000);
assert.deepEqual(api.clean(null).context,{screen:'home-view',version:'',sourceLocale:'',targetLocale:''});
for(const file of ['index.html','translator.html']){const s=fs.readFileSync(file,'utf8');for(const id of ['app-feedback','app-feedback-form','feedback-include-text','feedback-share'])assert.equal(s.split('id="'+id+'"').length-1,1);assert.ok(s.includes('app-feedback.js?v=193'));}
assert.ok(fs.readFileSync('sw.js','utf8').includes('app-feedback.js?v=193'));
assert.ok(!/fetch\(|sendBeacon|innerHTML|__hablaNativeSpeech/.test(fs.readFileSync('app-feedback.js','utf8')),'no automatic delivery, markup injection or translation bridge reuse');
console.log('Feedback schema/export: explicit text opt-in, bounded fields, canonical enums, Spanish labels, no query leakage, offline assets and no automatic delivery passed');
