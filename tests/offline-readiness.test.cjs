const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(supported=true){
 const nodes=new Map(),saved=new Map(),messages=[];let broken=false;
 const node=k=>{if(!nodes.has(k))nodes.set(k,{textContent:'',checked:false,disabled:false,events:{},addEventListener(t,f){this.events[t]=f;}});return nodes.get(k);};
 class Channel{constructor(){this.port1={close(){}};this.port2={reply:data=>queueMicrotask(()=>this.port1.onmessage({data})),close(){}};}}
 const controller={postMessage(message,ports){assert.equal(message.type,'OFFLINE_SHELL_STATUS');ports[0].reply({ready:true});}};
 const cachedWorker=/"(offline-worker\.js\?v=\d+)"/.exec(fs.readFileSync('sw.js','utf8'))[1];
 class Worker{constructor(url){assert.equal(url,cachedWorker);}postMessage(message){messages.push(message);queueMicrotask(()=>this.onmessage({data:broken?{id:message.id,error:'Cached model failed validation'}:{id:message.id,result:message.type==='validate'?{directions:2}:'Una traducción nueva.'}}));}terminate(){}}
 const navigator={onLine:true,...(supported?{serviceWorker:{ready:Promise.resolve(),controller},storage:{persist:async()=>false}}:{})};
 const context=vm.createContext({console,setTimeout,clearTimeout,WebAssembly,Worker,MessageChannel:Channel,navigator,caches:{open:async()=>({match:async()=>({ok:true})})},document:{querySelector:node},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},fetch:()=>{throw Error('No network permitted in readiness test');}});
 vm.runInContext(fs.readFileSync('offline-device.js','utf8'),context);const run=s=>vm.runInContext(s,context);
 return{node,saved,messages,run,breakValidation(){broken=true;}};
}
async function main(){
 const h=harness();h.saved.set('habla-ecuador-offline-enabled-v1','yes');await h.run('HablaOffline.bind()');
 assert.match(h.node('#offline-status').textContent,/validated in both directions/,'file presence is not a successful inference check');
 assert.equal(h.run('HablaOffline.shouldUse()'),false);
 await h.node('#offline-download').events.click();
 assert.deepEqual(h.messages.map(m=>m.type),['validate','validate']);assert.match(h.node('#offline-status').textContent,/validated in both directions/);
 assert.equal(h.node('#offline-use').checked,false);assert.equal(h.run('HablaOffline.shouldUse()'),false);
 h.run('HablaOffline.reportOnlineSuccess()');assert.match(h.node('#translation-engine-badge').textContent,/confirmed/);
 h.node('#offline-use').checked=true;h.node('#offline-use').events.change();assert.equal(h.run('HablaOffline.shouldUse()'),true);
 assert.equal(await h.run('HablaOffline.translate("New words", "en-ec")'),'Una traducción nueva.');
 h.breakValidation();await h.node('#offline-download').events.click();assert.match(h.node('#offline-status').textContent,/not ready/);
 assert.equal(h.run('HablaOffline.shouldUse()'),true,'failed validation never opts a privacy request into online translation');
 await assert.rejects(h.run('HablaOffline.translate("Private words", "en-ec")'),e=>e.code==='offline_engine');
 const unavailable=harness(false);unavailable.saved.set('habla-ecuador-offline-only-v2','yes');await unavailable.run('HablaOffline.bind()');
 assert.equal(unavailable.node('#offline-download').disabled,true);assert.match(unavailable.node('#offline-status').textContent,/offline-support update/);
 assert.equal(unavailable.run('HablaOffline.shouldUse()'),true);assert.equal(unavailable.node('#translation-engine-badge').textContent,'On-device unavailable');
 await assert.rejects(unavailable.run('HablaOffline.translate("Private words", "en-ec")'),e=>e.code==='offline_pack');
 const events={},responses=[];let missing=false;
 const sw=vm.createContext({URL,Response,self:{location:{origin:'https://test.invalid'},addEventListener:(t,f)=>events[t]=f},caches:{open:async()=>({match:async key=>({ok:!(missing&&key==='data/vocabulary.json')})})}});
 vm.runInContext(fs.readFileSync('sw.js','utf8'),sw);let pending;
 const event={data:{type:'OFFLINE_SHELL_STATUS'},ports:[{postMessage:r=>responses.push(r)}],waitUntil:p=>pending=p};
 events.message(event);await pending;assert.equal(responses.at(-1).ready,true);
 missing=true;events.message(event);await pending;assert.equal(responses.at(-1).ready,false,'missing dictionary blocks offline shell readiness');
 const assets=vm.runInContext('ASSETS',sw);for(const asset of assets){const file=asset==='./'?'index.html':asset.split('?')[0];assert.ok(fs.existsSync(file),file+' must exist for atomic precaching');}
 console.log('Offline readiness passed: actual worker validation required, failed validation/privacy lock, unsupported native state and complete app/dictionary cache checks.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
