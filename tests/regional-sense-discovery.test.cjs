const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {discover}=require("../regional-sense-discovery.js");
const vocabulary=require("../regional-vocabulary.js");

test("discovers same-spoken-expression regional senses across existing source records",()=>{
  const result=discover(vocabulary);
  assert.equal(result.counts.records,vocabulary.length);
  assert.equal(result.counts.candidates,12);
  assert.equal(result.counts.regionalCandidates,7);
  assert.deepEqual(result.issues,[]);
  assert.ok(result.candidates.every(x=>x.publishable===false&&!x.automaticallyApproved));
  assert.deepEqual(discover(vocabulary),result,"discovery is deterministic");
});
test("distinguishes regional senses without claiming exclusivity",()=>{
  const result=discover(vocabulary),byWord=word=>result.candidates.find(x=>x.expression===word);
  for(const word of ["llucho","bacán","atatay","arrecho","dar bola"]){
    assert.equal(byWord(word).kind,"regional-sense-candidate");
    assert.ok(byWord(word).differingPairs.length);
    assert.match(byWord(word).warnings.join(" "),/not frequency or exclusivity/);
  }
  assert.equal(byWord("palta").kind,"multi-sense-overlap",
    "Peru shares both recorded meanings so do not label one Peru-exclusive");
  assert.equal(byWord("chingón").kind,"multi-sense-overlap",
    "two Mexican senses do not establish differences between countries");
  assert.ok(!result.candidates.some(x=>x.expression==="dar"),
    "same headword alone must not combine dar el avión, dar papaya and dar bola");
  assert.ok(result.candidates.some(x=>x.expression==="dar bola"));
});
test("rejects unverified source rows and never auto-promotes unsupported claims",()=>{
  const malicious=[
    {id:"unsafe",speech:"foo",us:"thing",regions:["es-EC"],url:"javascript:alert(1)"},
    {id:"a",speech:"foo",us:"one",regions:["es-EC"],url:"https://example.org/word"},
    {id:"b",speech:"foo",us:"two",regions:["es-BO"],url:"https://example.org/word"}
  ];
  const report=discover(malicious);
  assert.equal(report.issues.length,1);
  assert.equal(report.candidates.length,1);
  assert.ok(report.candidates[0].senses.every(s=>s.source.referenceOnly));
  assert.equal(report.candidates[0].evidenceLevel,"source-cited-not-freshly-verified");
});
test("generated regional sense candidates have source URLs and remain review only",()=>{
 const snapshot=JSON.parse(fs.readFileSync(require("node:path").join(__dirname,"..","data","regional-sense-candidates-v1.json"),"utf8"));
 assert.deepEqual(snapshot,discover(vocabulary));
 for(const proposal of snapshot.candidates){
   assert.equal(proposal.publishable,false);
   assert.ok(proposal.senses.every(s=>s.source.url.startsWith("https://")));
 }
});
