const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {items}=require('../recorded-transcripts.js'),meta=require('../captions/spanish-subtitles.json');
assert.deepEqual(Object.keys(meta.videos),Object.keys(items));
assert.equal(meta.reviewStatus,'automatic-timing-human-review-pending');
const seconds=s=>{const [h,m,t]=s.split(':').map(Number);return h*3600+m*60+t;};
for(const [clip,source] of Object.entries(items)){
 const text=fs.readFileSync('captions/'+clip+'.es.vtt','utf8');assert.ok(text.startsWith('WEBVTT\n'));
 const cues=text.trim().split(/\n\n/).filter(b=>b.includes(' --> ')).map(block=>{
  const [id,time,...lines]=block.split('\n');assert.match(id,/^\d+$/);
  const match=time.match(/^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})$/);assert.ok(match);
  assert.ok(lines.length>=1&&lines.length<=2);assert.ok(lines.every(l=>l.length<=42));
  return {start:seconds(match[1]),end:seconds(match[2]),text:lines.join(' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')};
 });
 assert.equal(cues.length,meta.videos[clip].cues);assert.ok(cues.length>=8);
 let previous=0;for(const c of cues){assert.ok(c.start>=previous);assert.ok(c.end>c.start&&c.end<=meta.videos[clip].duration+.001);previous=c.end;}
 assert.equal(cues.map(c=>c.text).join(' '),source.text,'full publisher transcript, no recognized-word substitutions');
 assert.equal(meta.videos[clip].sourceTextSha256,crypto.createHash('sha256').update(source.text).digest('hex'));
 assert.ok(meta.videos[clip].anchorCoverage>=.95);
 assert.ok(fs.readFileSync('sw.js','utf8').includes('captions/'+clip+'.es.vtt?v=194'));
}
const controller=fs.readFileSync('recorded-practice.js','utf8');
assert.match(controller,/<track kind="subtitles"[^>]+srclang="es"[^>]+default>/);
assert.match(controller,/subtitle\.track\.mode = spanishSubtitles\?'showing':'disabled'/);
console.log('Spanish subtitles: all four complete transcripts, source hashes, audio-anchor evidence, finite ordered bounds, two-line cues, default Spanish track and offline VTT assets passed');
