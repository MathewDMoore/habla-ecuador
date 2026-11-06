const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');

test('music tab presents official 2017 Latin American Spanish song with verified artist credit',()=>{
  const card=html.match(/<article id="music-beauty-and-the-beast"[\s\S]*?<\/article>/)?.[0];
  assert.ok(card,'Disney song discovery must be present in Music');
  assert.match(card,/La Bella y la Bestia/);
  assert.match(card,/Irasema Terrazas/);
  assert.match(card,/Español latinoamericano/);
  assert.match(card,/https:\/\/music\.apple\.com\/us\/song\/1443143694/);
  assert.match(card,/2017 · 3:19/);
  assert.match(html,/id="music-view"[\s\S]*?id="music-beauty-and-the-beast"/);
});

test('credits distinguish classic Spanish version and English original',()=>{
  const card=html.match(/<article id="music-beauty-and-the-beast"[\s\S]*?<\/article>/)?.[0];
  assert.match(card,/Mijares y Rocío Banquells/);
  assert.match(card,/https:\/\/music\.apple\.com\/us\/song\/1444046551/);
  assert.match(card,/1991/);
  assert.match(card,/Beauty and the Beast/);
  assert.match(card,/Alan Menken y Howard Ashman/);
});

test('copyrighted audio is not bundled, scraped, autoplayed or falsely marked playable',()=>{
  const card=html.match(/<article id="music-beauty-and-the-beast"[\s\S]*?<\/article>/)?.[0];
  assert.ok(card);
  assert.doesNotMatch(card,/<audio\b|<video\b|<iframe\b|<source\b/i);
  assert.doesNotMatch(card,/(autoplay|\.mp3|\.m4a|\.wav|\.ogg|\.vtt)/i);
  assert.match(card,/plataformas oficiales/);
  assert.match(card,/no reproducen la letra/);
  const anchors=[...card.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)];
  assert.equal(anchors.length,3);
  for(const [,url] of anchors){
    assert.ok(url.startsWith('https://music.apple.com/us/song/') || url==='https://www.youtube.com/watch?v=OcAUg-i0T5I');
  }
  assert.equal((card.match(/target="_blank"/g)||[]).length,3);
  assert.equal((card.match(/rel="noopener noreferrer"/g)||[]).length,3);
});

test('music lesson is compact, optional, and uses original practice rather than printed lyrics',()=>{
  const card=html.match(/<article id="music-beauty-and-the-beast"[\s\S]*?<\/article>/)?.[0];
  assert.ok(card);
  assert.match(card,/<details class="music-discovery-details">/);
  assert.doesNotMatch(card,/<details[^>]+open/);
  assert.match(card,/Significado y práctica/);
  assert.match(card,/la belleza interior/i);
  assert.match(card,/La verdadera belleza está en cómo tratamos a los demás/);
  assert.match(css,/\.music-discovery-details\s*\{/);
  assert.match(css,/\.music-discovery-link\s*\{/);
  assert.match(css,/\.music-discovery-details summary:focus-visible/);
});

test('free-listening option is the verified classic artist-channel YouTube recording, not an app distribution license',()=>{
  const card=html.match(/<article id="music-beauty-and-the-beast"[\s\S]*?<\/article>/)?.[0];
  assert.ok(card);
  assert.match(card,/https:\/\/www\.youtube\.com\/watch\?v=OcAUg-i0T5I/);
  assert.match(card,/Gratis · Mijares y Rocío Banquells \(1991\)/);
  assert.match(card,/puede incluir anuncios/);
  assert.match(card,/No autoriza guardar el audio o la letra dentro de Habla/);
  assert.ok(card.indexOf('youtube.com/watch')<card.indexOf('music.apple.com/us/song'),
    'Free listening must be the first offered link');
});
