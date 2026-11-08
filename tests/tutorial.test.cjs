const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const {STEPS,FEATURE_GUIDES,api}=require("../tutorial.js");
assert.equal(typeof api.openLessons,"function","Practice has its own guided tutorial entry point");
assert.equal(STEPS.length,10);
assert.equal(STEPS.filter(step=>step.fullOnly).length,1);
assert.equal(STEPS.filter(step=>step.view==="lesson-view").length,3);
for(const step of STEPS){
 for(const key of ["symbol","en","es","body","esp","target"])
  assert.equal(typeof step[key],"string","all screens have bilingual copy and a real target");
 assert.ok(step.en.length>6&&step.es.length>6&&step.body.length>25&&step.esp.length>25);
}
const ids=STEPS.map(s=>s.target);
for(const selector of ["#home-title",".language-picker-row","#translator-input","#input-mic",
 "#regional-slang-search","#lesson-language","#quick-lessons","#lesson-title","#music-song-lesson h2",".feedback-open"])
 assert.ok(ids.includes(selector));
for(const file of ["index.html","translator.html"]){
 const html=fs.readFileSync(file,"utf8");
 assert.ok(html.includes('data-tutorial-open'));
 assert.ok(html.includes('data-lesson-tutorial-open'));
 assert.ok(html.includes('tutorial.js?v=210'),"tour ships on both entry pages");
 assert.ok(!html.includes('id="tutorial-overlay"'),"not inserted until needed");
 for(const id of Object.keys(FEATURE_GUIDES)){
  const matches=html.match(new RegExp('data-feature-guide="'+id+'"',"g"))||[];
  assert.equal(matches.length,id==="musicLessons"&&file==="translator.html"?0:1);
 }
}
const sw=fs.readFileSync("sw.js","utf8");
assert.ok(sw.includes('"tutorial.js?v=210"'),"tutorial remains available offline in app cache");
const app=fs.readFileSync("app.js","utf8");
assert.ok(app.includes('HablaTutorial.bind({navigate:openView,launchQuery})'));
assert.ok(app.includes("HablaTutorial.isOpen()"));
// Mount the actual disclosure tree and switch interface languages without resetting open questions.
function element(tagName){
 const children=[],attributes={};
 return {tagName,children,attributes,dataset:{},textContent:"",open:false,
  append(...nodes){children.push(...nodes);},
  querySelector(tag){return children.find(child=>child.tagName===tag);},
  setAttribute(name,value){attributes[name]=value;}};
}
const guides=Object.keys(FEATURE_GUIDES).map(id=>{
 const guide=element("details");
 guide.dataset.featureGuide=id;
 guide.append(element("summary"));
 return guide;
});
const handlers={};
const window={HablaUI:{language:"es"},addEventListener(){}};
const context={window,localStorage:{getItem:()=>"1"},
 document:{createElement:element,querySelectorAll:selector=>selector==="[data-feature-guide]"?guides:[],
  addEventListener:(event,handler)=>{handlers[event]=handler;}}};
vm.runInNewContext(fs.readFileSync("tutorial.js","utf8"),context);
window.HablaTutorial.bind({launchQuery:new URLSearchParams()});
for(const guide of guides){
 const [title,...topics]=FEATURE_GUIDES[guide.dataset.featureGuide];
 assert.equal(guide.querySelector("summary").textContent,title[1]);
 const disclosures=guide.children.slice(1);
 assert.equal(disclosures.length,topics.length);
 assert.equal(new Set(disclosures.map(topic=>topic.attributes.name)).size,1);
 disclosures.forEach((topic,index)=>{
  const [question,...steps]=topics[index];
  assert.equal(topic.open,false);
  assert.equal(topic.querySelector("summary").textContent,question[1]);
  assert.deepEqual(topic.querySelector("ol").children.map(item=>item.textContent),steps.map(step=>step[1]));
 });
}
const research=guides.find(guide=>guide.dataset.featureGuide==="research");
const saveQuestion=research.children[2];
research.open=true;
saveQuestion.open=true;
handlers["habla-ui-language-change"]({detail:{language:"en"}});
assert.equal(research.open,true);
assert.equal(saveQuestion.open,true);
assert.match(saveQuestion.querySelector("summary").textContent,/save the paper/);
assert.match(saveQuestion.querySelector("ol").children[0].textContent,/Save document for later/);
console.log("Bilingual tutorial: English and Spanish steps, real controls, replay buttons, local cache and update protection passed");
