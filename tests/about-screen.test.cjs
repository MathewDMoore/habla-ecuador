const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');

test('Home keeps its existing version display and provides About entry points', () => {
  const home = html.split('<section id="home-view"')[1]?.split('<section id="about-view"')[0];
  assert.ok(home, 'Home view is present');
  assert.match(html, /class="version-pill" data-app-version/);
  assert.match(home, /class="about-entry" data-open="about-view"/);
  assert.match(html, /class="about-top-button" data-open="about-view"/);
});

test('About mirrors the same dynamically bound web version and has working navigation hooks', () => {
  const about = html.split('<section id="about-view"')[1]?.split('<section id="music-view"')[0];
  assert.ok(about, 'About view is present');
  assert.match(about, /data-app-version/);
  assert.match(about, /data-open="home-view"/);
  assert.match(about, /Development timeline/);
  assert.match(about, /Acknowledgments/);
  assert.match(read('app.js'), /\$\$\('\[data-app-version\]'\)/);
});

test('Hosted release version matches service worker and both HTML entry points', () => {
  const {metadata} = require('../scripts/write-release.cjs');
  const {version, build} = metadata(root);
  assert.equal(version, '0.26.70');
  assert.equal(build, 180);
});

test('Web icon is a square vector asset with Ecuador colors', () => {
  const icon = read('app-icon.svg');
  assert.match(icon, /viewBox="0 0 512 512"/);
  for (const color of ['#f5d844', '#245caa', '#df3e49']) assert.ok(icon.includes(color));
  assert.match(read('manifest.webmanifest'), /"src": "app-icon.svg"/);
});

test('About is translated for Spanish interface without translating app version', () => {
  const map = require('../interface-es.js');
  assert.equal(map['About Habla Ecuador'], 'Acerca de Habla Ecuador');
  assert.equal(map['Web version & build'], 'Versión web y compilación');
});
