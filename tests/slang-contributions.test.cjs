const assert=require('node:assert/strict'),fs=require('node:fs');
for(const file of ['index.html','translator.html']){
 const page=fs.readFileSync(file,'utf8');
 for(const id of ['slang-contribution-form','slang-contribution-prompt','slang-contribution-list','slang-contribution-export','slang-contribution-share'])assert.equal(page.split('id="'+id+'"').length-1,1);
 assert.match(page,/slang-contributions\.js\?v=193/);
 assert.match(page,/Contributions remain unverified/);
 assert.ok(page.includes('<option>Venezuela</option>')&&page.includes('Monterrey, Nuevo León / Caracas'));
}
assert.match(fs.readFileSync('sw.js','utf8'),/"slang-contributions\.js\?v=193"/);
const source=fs.readFileSync('slang-contributions.js','utf8');
assert.ok(!/fetch\(|innerHTML|sendBeacon|__hablaNativeSpeech/.test(source),'no automatic submission, markup injection or native bridge reuse');
console.log('Slang contribution pages: matching UI, explicit uncertainty, regional input, offline shell and no automatic submission passed');
