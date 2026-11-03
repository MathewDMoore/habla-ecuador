const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// A "downloaded" pack can still be unable to translate. Verify that the
// repair path is offered and touches only model/runtime caches, not documents.
test('invalid cached pack offers explicit repair and rebuilds without sending source online', async () => {
  const nodes = new Map();
  const node = key => {
    if (!nodes.has(key)) nodes.set(key, {
      textContent:'', checked:false, disabled:false, events:{},
      addEventListener(event, callback) {this.events[event] = callback;}
    });
    return nodes.get(key);
  };
  const cacheData = new Map();
  const deletions = [], onlineTexts = [];
  const getStore = name => {
    if (!cacheData.has(name)) cacheData.set(name, new Map());
    return cacheData.get(name);
  };
  const caches = {
    open: async name => ({
      match: async url => getStore(name).get(typeof url === 'string' ? url : url.url),
      put: async (url, response) => getStore(name).set(url, response)
    }),
    delete: async name => {deletions.push(name);return cacheData.delete(name);}
  };
  let repaired = false, originalTranslations = 0;
  let context;
  class FakeWorker {
    constructor() {this.onmessage = null;}
    postMessage({id,type,text}) {
      queueMicrotask(() => {
        if (type === 'install') {
          // The test simulates an actual installer filling the named model cache.
          const urls = vm.runInContext(
            'Object.values(HablaOffline.MODELS).flatMap(m=>HablaOffline.FILES.map(f=>"https://huggingface.co/"+m.id+"/resolve/"+m.revision+"/"+f))',context);
          for (const url of urls) getStore('habla-ecuador-offline-models-v1').set(url,{ok:true});
          repaired = true;
          this.onmessage({data:{id, result:true}});
        } else if (type === 'validate') {
          this.onmessage({data: repaired
            ? {id,result:{directions:2}}
            : {id,error:'The model cannot translate a test sentence.'}});
        } else if (type === 'translate') {
          originalTranslations++;
          this.onmessage({data:{id,result:'La casa es pequeña.'}});
        }
      });
    }
    terminate() {}
  }
  class FakeMessageChannel {
    constructor() {this.port1 = {onmessage:null,close(){}}; this.port2={peer:this.port1,close(){}};}
  }
  const controller = {postMessage(message, ports) {
    queueMicrotask(() => ports[0].peer.onmessage({data:{ready:true}}));
  }};
  context = vm.createContext({
    console, setTimeout, clearTimeout, queueMicrotask, Worker:FakeWorker,
    WebAssembly, MessageChannel:FakeMessageChannel,
    document:{currentScript:{src:'/offline-device.js?v=201'},querySelector:node},
    navigator:{onLine:true, serviceWorker:{controller,ready:Promise.resolve(),addEventListener(){},removeEventListener(){}},storage:{persist:async()=>true}},
    caches,
    localStorage:{getItem:()=>null,setItem(){}},
    fetch:async url=>{
      if (url.includes('q=')) onlineTexts.push(url);
      return {ok:true,clone(){return this;}};
    },
    addEventListener(){}
  });
  vm.runInContext(fs.readFileSync('offline-device.js','utf8'),context);
  const run = code => vm.runInContext(code,context);
  const runtime = run('HablaOffline.RUNTIME');
  const models = run('Object.values(HablaOffline.MODELS).flatMap(m=>HablaOffline.FILES.map(f=>"https://huggingface.co/"+m.id+"/resolve/"+m.revision+"/"+f))');
  for (const url of runtime) getStore('habla-ecuador-offline-runtime-v1').set(url,{ok:true});
  for (const url of models) getStore('habla-ecuador-offline-models-v1').set(url,{ok:true});
  getStore('habla-ecuador-personal-document-drafts').set('paper-1', {text:'A private research paper'});
  getStore('other-app').set('other', {text:'do not delete'});
  await run('HablaOffline.bind()');
  assert.equal(run('HablaOffline.repairNeeded'),true);
  assert.match(node('#offline-status').textContent,/did not pass validation/);
  assert.match(node('#offline-download').textContent,/Repair offline pack/);
  assert.equal(repaired,false);
  await node('#offline-download').events.click();
  assert.equal(run('HablaOffline.repairNeeded'),false);
  assert.match(node('#offline-status').textContent,/both produced usable text/);
  assert.equal(node('#offline-download').textContent,'Validate offline pack');
  assert.deepEqual(deletions.sort(),[
    'habla-ecuador-offline-models-v1','habla-ecuador-offline-runtime-v1'
  ].sort());
  assert.equal(getStore('habla-ecuador-personal-document-drafts').get('paper-1').text,'A private research paper');
  assert.equal(getStore('other-app').get('other').text,'do not delete');
  node('#offline-use').checked=true;
  node('#offline-use').events.change();
  assert.equal(await run('HablaOffline.translate("The house is small.", "en-ec")'),'La casa es pequeña.');
  assert.equal(originalTranslations,1);
  assert.deepEqual(onlineTexts,[]);
});

test('offline translation does not silently use the web when pack unavailable', () => {
  const source=fs.readFileSync('offline-device.js','utf8');
  assert.match(source,/function shouldUse\(\) \{ return enabled \|\| \(ready && navigator.onLine === false\); \}/);
  assert.match(source,/if \(!ready\) throw fail\("offline_pack"/);
});
