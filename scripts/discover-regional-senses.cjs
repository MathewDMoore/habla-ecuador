#!/usr/bin/env node
/* Generate source-cited candidate comparisons; never write into live lessons. */
"use strict";
const fs=require("node:fs"),path=require("node:path");
const {discover}=require("../regional-sense-discovery.js");
const root=path.resolve(__dirname,"..");
const source=require("../regional-vocabulary.js");
const report=discover(source);
if(report.issues.length){console.error("Regional sense rows require repair:",report.issues);process.exitCode=1;}
const expected=JSON.stringify(report,null,2)+"\n";
if(process.argv.includes("--check")){
 const snapshot=fs.readFileSync(path.join(root,"data","regional-sense-candidates-v1.json"),"utf8");
 if(snapshot!==expected){console.error("Regional sense review snapshot is stale. Re-run with --output=data/regional-sense-candidates-v1.json");process.exitCode=1;}
 else console.log("Regional sense candidate queue matches vocabulary data.");
}else{
 const output=process.argv.find(arg=>arg.startsWith("--output="))?.slice("--output=".length);
 if(output){const target=path.resolve(output);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,expected);console.log("Wrote regional sense review queue:",target);}
 else process.stdout.write(expected);
}
