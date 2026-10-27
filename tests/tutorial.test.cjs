const assert=require("node:assert/strict");
const fs=require("node:fs");
const {STEPS}=require("../tutorial.js");
assert.equal(STEPS.length,8);
assert.equal(STEPS.filter(step=>step.fullOnly).length,1);
for(const step of STEPS){
 for(const key of ["symbol","en","es","body","esp","target"])
  assert.equal(typeof step[key],"string","all screens have bilingual copy and a real target");
 assert.ok(step.en.length>6&&step.es.length>6&&step.body.length>25&&step.esp.length>25);
}
const ids=STEPS.map(s=>s.target);
for(const selector of ["#home-title",".language-picker-row","#translator-input","#input-mic",
 "#regional-slang-search","#lesson-language","#music-song-lesson h2",".feedback-open"])
 assert.ok(ids.includes(selector));
for(const file of ["index.html","translator.html"]){
 const html=fs.readFileSync(file,"utf8");
 assert.ok(html.includes('data-tutorial-open'));
 assert.ok(html.includes('tutorial.js?v=153'),"tour ships on both entry pages");
 assert.ok(!html.includes('id="tutorial-overlay"'),"not inserted until needed");
}
const sw=fs.readFileSync("sw.js","utf8");
assert.ok(sw.includes('"tutorial.js?v=153"'),"tutorial remains available offline in app cache");
const app=fs.readFileSync("app.js","utf8");
assert.ok(app.includes('HablaTutorial.bind({navigate:openView,launchQuery})'));
assert.ok(app.includes("HablaTutorial.isOpen()"));
console.log("Bilingual tutorial: English and Spanish steps, real controls, replay buttons, local cache and update protection passed");
