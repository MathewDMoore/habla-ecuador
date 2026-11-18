const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {evaluate}=require("../regional-lesson-evaluator.js");
const data=file=>JSON.parse(fs.readFileSync(path.join(__dirname,"..","data",file),"utf8"));
const input={
 comparisons:data("ecuador-bolivia-comparisons-v1.json"),
 entries:data("learner-entries-v1.json"),
 sources:data("sources.json"),
 checks:data("regional-evidence-reviews-v1.json")
};
test("every curated comparison becomes an evidence-bearing, non-published lesson proposal",()=>{
 const report=evaluate(input);
 assert.equal(report.candidates.length,input.comparisons.length);
 assert.deepEqual(report.issues,[]);
 assert.equal(report.automaticPublication,false);
 assert.ok(report.candidates.every(row=>row.publishable===false && row.automaticallyApproved===false));
 assert.ok(report.candidates.every(row=>row.evidence.primary.url.startsWith("https://")));
 assert.ok(report.candidates.every(row=>row.warnings.some(x=>x.includes("Human editorial approval"))));
 assert.deepEqual(report.candidates.map(x=>x.priority),[...report.candidates.map(x=>x.priority)].sort((a,b)=>b-a));
 assert.deepEqual(evaluate(input),report,"identical input must produce deterministic output");
});
test("verified dictionary checks are linked to exact source URL, not universal accent claims",()=>{
 const report=evaluate(input),get=id=>report.candidates.find(x=>x.entryId===id);
 for(const id of ["atatay","guagua","pana"]){
   assert.equal(get(id).sourceStatus,"source-page-reviewed");
   assert.ok(get(id).evidence.review.reviewedOn);
   assert.match(get(id).warnings.join(" "),/No phoneme, audio or native-speaker verification/);
 }
 assert.equal(get("atatay").differenceKind,"different-meanings");
 assert.equal(get("atatay").lesson.type,"meaning-contrast");
 assert.equal(get("guagua").lesson.type,"semantic-range");
 assert.equal(get("pana").lesson.type,"shared-vocabulary");
 assert.match(get("pana").lesson.objective,/without claiming Ecuadorian exclusivity/);
});
test("unknown country coverage is a research gap, never evidence of non-use",()=>{
 const get=id=>evaluate(input).candidates.find(x=>x.entryId===id);
 assert.equal(get("acolitar").status,"needs-evidence");
 assert.equal(get("acolitar").lesson.type,"research-queue");
 assert.match(get("acolitar").warnings.join(" "),/Lack of evidence is not evidence of non-use/);
 assert.equal(get("acolitar").publishable,false);
});
test("untrusted URLs and duplicate or unsupported comparisons are rejected",()=>{
 const bad={...input,comparisons:[
   {...input.comparisons[0],sourceUrl:"javascript:alert(1)"},
   {...input.comparisons[0]},
   {...input.comparisons[0],entryId:"not-in-catalog",relationship:"shared"}
 ]};
 const result=evaluate(bad);
 assert.equal(result.candidates.length,0);
 assert.deepEqual(result.issues.map(x=>x.reason),[
   "source-url-missing-or-untrusted","duplicate-comparison","missing-learner-entry"
 ]);
});
test("review cannot be faked by an unrelated URL or missing verification",()=>{
 const suspicious={...input,checks:input.checks.map(check=>check.entryId==="atatay"?{...check,sourceUrl:"https://example.org"}:check)};
 const result=evaluate(suspicious);
 const atatay=result.candidates.find(x=>x.entryId==="atatay");
 assert.equal(atatay.sourceStatus,"reference-link-awaits-review");
 assert.equal(atatay.evidence.review,null);
});

test("generated evidence queue is review-only, complete and exposed in both entrypoints",()=>{
 const report=data("regional-lesson-proposals-v1.json");
 assert.equal(report.candidates.length,input.comparisons.length);
 assert.equal(report.counts.reviewedSources,3);
 assert.equal(report.counts.evidenceGaps,1);
 assert.ok(report.candidates.every(item=>item.publishable===false));
 for(const page of ["index.html","translator.html"]){
   const html=fs.readFileSync(path.join(__dirname,"..",page),"utf8");
   assert.match(html,/id="regional-evaluation-queue"/);
   assert.match(html,/regional-evaluation-review\.js\?v=238/);
 }
 const sw=fs.readFileSync(path.join(__dirname,"..","sw.js"),"utf8");
 assert.match(sw,/data\/regional-lesson-proposals-v1\.json/);
 assert.match(sw,/regional-evaluation-review\.js\?v=238/);
 const viewer=fs.readFileSync(path.join(__dirname,"..","regional-evaluation-review.js"),"utf8");
 assert.doesNotMatch(viewer,/innerHTML\s*=/,"source text must render without HTML injection");
 assert.match(viewer,/textContent/);
});
