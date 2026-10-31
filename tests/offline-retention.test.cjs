const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(supported=true, initialSaved=new Map()){
 const nodes=new Map(),saved=initialSaved,messages=[];let broken=false;
 const node=k=>{if(!nodes.has(k))nodes.set(k,{textContent:'',checked:false,disabled:false,events:{},addEventListener(t,f){this.events[t]=f;}});return nodes.get(k);};
 class Channel{constructor(){this.port1={close(){}};this.port2={reply:data=>queueMicrotask(()=>this.port1.onmessage({data})),close(){}};}}
 const controller={postMessage(message,ports){assert.equal(message.type,'OFFLINE_SHELL_STATUS');ports[0].reply({ready:true});}};
 const cachedWorker='offline-worker.js?v=194';
 class Worker{constructor(url){assert.equal(url,cachedWorker);}postMessage(message){messages.push(message);queueMicrotask(()=>this.onmessage({data:broken?{id:message.id,error:'Cached model failed validation'}:{id:message.id,result:message.type==='validate'?{directions:2}:'Una traducción nueva.'}}));}terminate(){}}
 const navigator={onLine:true,...(supported?{serviceWorker:{ready:Promise.resolve(),controller},storage:{persist:async()=>{messages.push({type:'persist'});return false;}}}:{})};
 const context=vm.createContext({console,setTimeout,clearTimeout,WebAssembly,Worker,MessageChannel:Channel,navigator,caches:{open:async()=>({match:async()=>({ok:true})})},document:{querySelector:node},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},fetch:()=>{throw Error('No network permitted in readiness test');}});
 vm.runInContext(fs.readFileSync('offline-device.js','utf8'),context);const run=s=>vm.runInContext(s,context);
 return{node,saved,messages,run,breakValidation(){broken=true;}};
}

async function main(){
 const h=harness();
 // A retained pack is checked without any Download/Validate button press.
 await h.run('HablaOffline.bind()');
 assert.equal(h.messages.filter(m=>m.type==='validate').length,1);
 assert.equal(h.messages.filter(m=>m.type==='install').length,0);
 assert.equal(h.messages.filter(m=>m.type==='persist').length,1);
 assert.equal(h.run('HablaOffline.shouldUse()'),false,'keep online preference');
 h.node('#offline-use').checked=true;h.node('#offline-use').events.change();
 // A cold reopen must wait for initialization rather than report a missing pack.
 const reopened=harness(true,h.saved);
 const startup=reopened.run('HablaOffline.bind()');
 const translation=reopened.run('HablaOffline.translate("New words","ec-en")');
 await startup;
 assert.equal(await translation,'Una traducción nueva.');
 assert.equal(reopened.run('HablaOffline.shouldUse()'),true);
 assert.equal(reopened.messages.filter(m=>m.type==='install').length,0);
 // Failed inference retains existing files and stays local.
 const failed=harness(true,h.saved);failed.breakValidation();
 await failed.run('HablaOffline.bind()');
 assert.match(failed.node('#offline-status').textContent,/Downloaded pack retained/);
 assert.equal(failed.messages.filter(m=>m.type==='install').length,0);
 await assert.rejects(failed.run('HablaOffline.translate("Private words","ec-en")'),e=>e.code==='offline_engine');
 assert.equal(failed.run('HablaOffline.shouldUse()'),true);
 console.log('PASS: retained pack auto-validation, persistence request, cold-launch translation wait, no redownload, explicit engine failure and local-mode retention.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
