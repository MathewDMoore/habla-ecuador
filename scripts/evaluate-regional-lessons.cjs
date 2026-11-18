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
if(destination){
  const target=path.resolve(process.cwd(),destination);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,JSON.stringify(report,null,2)+"\n");
  console.log("Created review-only regional lesson proposals:",target);
  console.log(JSON.stringify(report.counts));
} else process.stdout.write(JSON.stringify(report,null,2)+"\n");
