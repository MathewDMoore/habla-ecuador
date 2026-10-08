const assert=require('node:assert/strict');
const helper=require('../screenshot-import.js');
const file={type:'image/png',size:300,name:'test.png'};
async function main(){
 assert.equal(helper.validate(file),file);
 assert.throws(()=>helper.validate({type:'image/heic',size:1}),/HEIC/);
 assert.throws(()=>helper.validate({type:'image/png',size:11*1024*1024}),/10 MB/);
 const imageItem={kind:'file',type:'image/png',getAsFile:()=>file};
 assert.equal(helper.imageFromClipboard({items:[imageItem]}),file);
 assert.equal(helper.imageFromClipboard({items:[{kind:'string',type:'text/plain'}]}),null);
 assert.equal(helper.imageFromClipboard({files:[file]}),file);
 let terminated=0,calls=0;
 const worker={recognize:async image=>{assert.equal(image,file,'original image only goes to local worker');return {data:{text:'El agua está limpia.\r\n\r\nSegunda línea.',confidence:95}};},terminate:async()=>{terminated++;}};
 const reader={createWorker:async(language,mode,options)=>{calls++;assert.equal(language,'spa');assert.equal(mode,1);assert.match(options.workerPath,/6\.0\.1/);return worker;}};
 const extracted=await helper.extract(file,{reader});assert.equal(extracted.text,'El agua está limpia.\n\nSegunda línea.');assert.equal(terminated,1);
 let current=true;reader.createWorker=async()=>{current=false;return worker;};
 assert.equal(await helper.extract(file,{reader,isCurrent:()=>current}),null);assert.equal(terminated,2,'superseded startup still releases worker');
 reader.createWorker=async()=>worker;worker.recognize=async()=>({data:{text:''}});
 await assert.rejects(helper.extract(file,{reader}),/No readable/);assert.equal(terminated,3);
 worker.recognize=async()=>{throw new Error('bad image');};
 await assert.rejects(helper.extract(file,{reader}),/bad image/);assert.equal(terminated,4);
 console.log('Screenshot checks passed: file/clipboard validation, local-worker routing, paragraph fidelity, stale results and worker release on failures.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
