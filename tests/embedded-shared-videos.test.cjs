const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const sources = JSON.parse(fs.readFileSync("data/shared-learning-links.json", "utf8"));

function iframe(id) {
  assert.match(id, /^[a-z-]+$/);
  const match = html.match(new RegExp("<iframe\\b(?=[^>]*\\bid=\"" + id + "\")[^>]*><\\/iframe>", "s"));
  assert.ok(match, "Missing independent embedded player " + id);
  return match[0];
}

test("both distinct shared videos are embedded in Music, not only links or selectable one-at-a-time", () => {
  assert.equal(html.split('id="habla-featured-youtube"').length - 1, 1);
  const a = iframe("habla-bbc-video");
  const b = iframe("habla-bolivia-video");
  assert.notEqual(a, b);
  assert.match(a, /youtube-nocookie\.com\/embed\/Z2YJDI4B-gw\?start=29&amp;playsinline=1/);
  assert.match(b, /youtube-nocookie\.com\/embed\/xko8gAlNZqY\?playsinline=1/);
  for (const frame of [a, b]) {
    assert.match(frame, /loading="lazy"/);
    assert.match(frame, /allowfullscreen/);
    assert.match(frame, /title="[^"]+"/);
    assert.doesNotMatch(frame, /autoplay(?:=|&amp;|")/i);
  }
  assert.ok(html.indexOf('id="habla-featured-youtube"') < html.indexOf('id="habla-youtube-form"'));
  assert.match(html, /No lesson required/);
});

test("source citations and actual original links remain visible next to each player", () => {
  assert.match(html, /www\.youtube\.com\/watch\?v=Z2YJDI4B-gw&amp;t=29/);
  assert.match(html, /www\.youtube\.com\/watch\?v=xko8gAlNZqY/);
  assert.match(html, /¿Dónde está exactamente la mitad del mundo en Ecuador y quién la descubrió\?/);
  assert.match(html, /La Paz Bolivia Travel Guide: 7 BEST Things to do in La Paz/);
  assert.equal(sources.length, 2);
  assert.deepEqual(new Set(sources.map(item => item.videoId)), new Set(["Z2YJDI4B-gw", "xko8gAlNZqY"]));
  assert.ok(sources.every(item => item.region === null && item.reviewStatus.includes("unverified")));
  assert.ok(sources.every(item => !item.transcript && !item.lyrics && !item.translation));
});

test("native Habla permits official YouTube frame hosts while preserving the shared single-video player", () => {
  const native = fs.readFileSync("ios/HablaEcuador/HablaEcuadorApp.swift", "utf8");
  assert.match(native, /www\.youtube-nocookie\.com/);
  assert.match(html, /id="habla-youtube-form"/);
  assert.match(html, /id="habla-youtube-iframe"/);
  assert.match(html, /src="shared-learning-links\.js\?v=266"/);
});
