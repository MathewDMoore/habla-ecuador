'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const source=app.slice(app.indexOf('async function loadEvidence()'),app.indexOf('function initDictionary()'));
const paths=['data/learner-entries-v1.json','data/vocabulary.json','data/candidate-lexicon.json','data/sources.json','data/review-queue.json','data/ecuador-bolivia-comparisons-v1.json'];
const fixture=new Map(paths.map(p=>[p,JSON.parse(fs.readFileSync(p))]));
function harness(){
 const status={hidden:false,textContent:''},counts={innerHTML:''};
 let broken=new Map(),renders=0,coverageRenders=0;
 const c=vm.createContext({AbortController,setTimeout,clearTimeout,evidenceSources:new Map(),evidenceCollections:new Map(),reviewQueue:new Map(),comparisonIndex:new Map(),evidenceEntries:[],
  $:selector=>selector==='#dictionary-status'?status:selector==='#evidence-counts'?counts:selector==='#translate-panel'?{hidden:true}:null,
  fetch:async(path,options)=>{assert.equal(options.cache,'no-cache');assert.ok(options.signal);const mode=broken.get(path);if(mode==='network')throw Error('unavailable');return{ok:mode!=='http',json:async()=>mode==='json'?{}:mode==='record'?[null]:fixture.get(path)};},
  renderRegionalSourceCoverage:()=>{coverageRenders++;},renderDictionary:()=>{renders++;}
 });
 vm.runInContext(source,c);
 return{c,status,counts,load:()=>c.loadEvidence(),fail:(path,mode)=>broken.set(path,mode),renderCount:()=>renders,coverageCount:()=>coverageRenders};
}
test('all six collections load and source catalogue is available',async()=>{
 const h=harness();await h.load();assert.equal(h.status.hidden,true);assert.equal(h.c.evidenceSources.size,26);assert.ok(h.c.evidenceEntries.length);assert.equal(h.renderCount(),1);
});
for(const mode of ['http','network','json','record'])for(const path of paths)test(mode+' failure in '+path+' leaves independent collections usable',async()=>{
 const h=harness();h.fail(path,mode);await h.load();assert.equal(h.status.hidden,false);assert.match(h.status.textContent,/Some reference collections could not load/);assert.equal(h.renderCount(),1);
 if(path!=='data/sources.json')assert.equal(h.c.evidenceSources.size,26);
 if(path!=='data/learner-entries-v1.json')assert.ok(h.c.evidenceEntries.some(e=>e.origin==='learner-ready'));
 assert.ok(h.coverageCount()>=1);
});
test('a failed retry retains the previously loaded evidence and sources',async()=>{
 const h=harness();await h.load();const count=h.c.evidenceEntries.length;
 for(const path of paths)h.fail(path,'network');
 await h.load();assert.equal(h.status.hidden,false);assert.equal(h.c.evidenceSources.size,26);assert.equal(h.c.evidenceEntries.length,count);assert.match(h.status.textContent,/Previously loaded information is retained/);assert.equal(h.renderCount(),2);
});
test('a first load with all collections unavailable still renders the bundled dictionary',async()=>{
 const h=harness();for(const path of paths)h.fail(path,'http');await h.load();assert.equal(h.status.hidden,false);assert.equal(h.c.evidenceSources.size,0);assert.equal(h.renderCount(),1);
});

