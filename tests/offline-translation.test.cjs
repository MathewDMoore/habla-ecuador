const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();
const node=key=>{if(!nodes.has(key))nodes.set(key,{textContent:'',checked:false,disabled:false,events:{},addEventListener(type,fn){this.events[type]=fn;}});return nodes.get(key);};
const saved=new Map(),stored=new Map();let networkCalls=0;
const cache={match:async key=>stored.get(typeof key==='string'?key:key.url),put:async(key,response)=>stored.set(key,response)};
const context=vm.createContext({console,document:{querySelector:node},navigator:{onLine:true},localStorage:{getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value)},caches:{open:async()=>cache},fetch:async()=>{networkCalls++;throw new Error('Network forbidden');}});
vm.runInContext(fs.readFileSync('offline-device.js','utf8'),context);
const run=code=>vm.runInContext(code,context);
async function main(){
  assert.equal(await run('HablaOffline.checkPack()'),false);
  await run('HablaOffline.bind()');
  node('#offline-use').checked=true;node('#offline-use').events.change();
  assert.equal(run('HablaOffline.shouldUse()'),true);
  await assert.rejects(run('HablaOffline.translate("New text", "en-ec")'),e=>e.code==='offline_pack');
  assert.equal(networkCalls,0,'missing pack never silently sends text online');
  const urls=run('[...HablaOffline.RUNTIME,...Object.values(HablaOffline.MODELS).flatMap(m=>HablaOffline.FILES.map(f=>`https://huggingface.co/${m.id}/resolve/${m.revision}/${f}`))]');
  for(const url of urls)stored.set(url,{ok:true});
  assert.equal(await run('HablaOffline.checkPack()'),true);
  stored.set(urls.at(-1),{ok:false});
  assert.equal(await run('HablaOffline.checkPack()'),false,'failed model response cannot mark pack ready');
  // App integration: entire passage/paragraphs preserved and zero online requests.
  const elements=new Map();const element=k=>{if(!elements.has(k))elements.set(k,{value:'',textContent:'',hidden:false,dataset:{},classList:{toggle(){}},setAttribute(){},removeAttribute(){}});return elements.get(k);};
  const app=vm.createContext({console,setTimeout,clearTimeout,AbortController,document:{querySelector:element,addEventListener(){},createElement:()=>({set innerHTML(v){this.value=v;}})},localStorage:{getItem:()=>null,setItem(){}},navigator:{onLine:false},HablaOffline:{shouldUse:()=>true,translate:async text=>text},fetch:async()=>{throw new Error('Must not fetch user text');}});
  for(const file of ['research-reference.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8'),app);
  app.source='Texto nuevo sobre la investigación y el agua. '.repeat(50).trim()+'\n\nÚltima oración completa.';
  assert.equal(await vm.runInContext('requestGeneralTranslation(source,"ec-en",{purpose:"everyday",target:"en-GB"})',app),app.source);
  app.HablaOffline.translate=async()=>{throw Object.assign(new Error('Local failure'),{code:'offline_engine'});};
  await assert.rejects(vm.runInContext('requestGeneralTranslation("texto nuevo","ec-en")',app),e=>e.code==='offline_engine');
  // Activation preserves model/runtime and unrelated caches across app upgrades.
  const events={},deleted=[],puts=[];let onlineRequests=0;
  const sw=vm.createContext({URL,Response,self:{location:{origin:'https://example.test'},clients:{claim(){}},skipWaiting(){},addEventListener:(type,fn)=>events[type]=fn},caches:{keys:async()=>['habla-ecuador-v62','habla-ecuador-v63','habla-ecuador-offline-models-v1','habla-ecuador-offline-runtime-v1','other-app'],delete:async key=>deleted.push(key),open:async()=>({match:async()=>({ok:true,body:'cached'}),put:async(...args)=>puts.push(args)})},fetch:async()=>{onlineRequests++;throw new Error('offline');}});
  vm.runInContext(fs.readFileSync('sw.js','utf8'),sw);
  let task;events.activate({waitUntil:value=>task=value});await task;
  assert.deepEqual(deleted,['habla-ecuador-v62']);
  let response;events.fetch({request:{method:'GET',url:urls[0]},respondWith:value=>response=value});assert.equal((await response).body,'cached');assert.equal(onlineRequests,0);
  response=null;events.fetch({request:{method:'GET',url:'https://api.mymemory.translated.net/get?q=private'},respondWith:value=>response=value});assert.equal(response,null,'third-party translation requests are not cached');
  console.log('Offline checks passed: complete pack validation, failed download rejection, private local routing, full paragraphs, no silent online fallback, runtime offline cache and upgrade retention.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
