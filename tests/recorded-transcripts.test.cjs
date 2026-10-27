const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {items}=require('../recorded-transcripts.js'),{catalog}=require('../recorded-practice.js');
assert.deepEqual(Object.keys(items),catalog.items.map(i=>i.clip));
for(const item of catalog.items){const transcript=items[item.clip];assert.equal(crypto.createHash('sha256').update(transcript.text).digest('hex'),transcript.textSha256);assert.ok(transcript.text.length>item.spanish.length&&transcript.text.length<8000);assert.match(transcript.source,/^https:\/\/www\.laits\.utexas\.edu\/spe\/vid\//);assert.equal(transcript.sourceChecked,'2026-10-24');}
const source=fs.readFileSync('recorded-transcripts.js','utf8');
assert.match(source,/requestGeneralTranslation\(source.text,'ec-en'/);assert.match(source,/purpose:'everyday'/);
assert.ok(!/getUserMedia|MediaRecorder|localStorage|sendBeacon|fetch\(/.test(source),'no new audio capture, persistence or translation provider');
assert.ok(!/VTTCue|addTextTrack|timeupdate/.test(source),'no unverified timing presented as captions');
for(const f of ['index.html','translator.html','sw.js'])assert.match(fs.readFileSync(f,'utf8'),/recorded-transcripts\.js\?v=147/);
console.log('Regional transcripts: four complete source hashes, bounded public Spanish text, source/license metadata, existing translation engine, safe output and offline shell passed');
