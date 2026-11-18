#!/usr/bin/env node
/* Deterministic, offline regional lesson evaluation from reviewed source tables.
 * Usage: node scripts/evaluate-regional-lessons.cjs [--output=path]
 * Only writes proposed/review-needed lessons. Never modifies curriculum files.
 */
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const {evaluate}=require("../regional-lesson-evaluator.js");
const root=path.resolve(__dirname,"..");
const load=filename=>JSON.parse(fs.readFileSync(path.join(root,"data",filename),"utf8"));
const report=evaluate({
  comparisons:load("ecuador-bolivia-comparisons-v1.json"),
  entries:load("learner-entries-v1.json"),
  sources:load("sources.json"),
  checks:load("regional-evidence-reviews-v1.json")
});
if(!report.candidates.length || report.issues.length){
  console.error("Regional evaluation has missing or malformed evidence:",report.issues);
  process.exitCode=1;
}
const destination=process.argv.find(a=>a.startsWith("--output="))?.slice("--output=".length);
if(process.argv.includes("--check")){
  const snapshot=path.join(root,"data","regional-lesson-proposals-v1.json");
  const actual=fs.readFileSync(snapshot,"utf8");
  const expected=JSON.stringify(report,null,2)+"\n";
  if(actual!==expected){
    console.error("Regional lesson proposal snapshot is out of date. Regenerate with --output=data/regional-lesson-proposals-v1.json");
    process.exitCode=1;
  } else console.log("Regional lesson proposals match the reviewed source files.");
} else if(destination){
  const target=path.resolve(process.cwd(),destination);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,JSON.stringify(report,null,2)+"\n");
  console.log("Created review-only regional lesson proposals:",target);
  console.log(JSON.stringify(report.counts));
} else process.stdout.write(JSON.stringify(report,null,2)+"\n");
