const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Pasted images reach local OCR from both source editors; ordinary and unrelated paste stay untouched',async()=>{
 const nodes=new Map(),events={},reads=[],commits=[];
 const node=id=>{if(id==='#screenshot-review')return null;if(!nodes.has(id))nodes.set(id,{id:id.slice(1),value:id==='#source-language-select'?'es-EC':'',events:{},addEventListener(type,fn){this.events[type]=fn;},click(){this.events.click?.();}});return nodes.get(id);};
 const context=vm.createContext({console,AbortController,setTimeout,clearTimeout,document:{querySelector:node,addEventListener:(t,f)=>events[t]=f},navigator:{},Tesseract:{createWorker:async()=>({recognize:async file=>{reads.push(file);return{data:{text:'Texto de prueba.',confidence:98}};},terminate:async()=>{}})}});
 vm.runInContext(fs.readFileSync('screenshot-import.js','utf8'),context);
 context.begin=()=>({original:'Keep original'});context.commit=(text,guard)=>{commits.push({text,guard});return true;};
 vm.runInContext('HablaScreenshot.bind({begin,commit})',context);
 const file={type:'image/png',size:100,name:'synthetic.png'};
 function paste(id,clipboardData){let prevented=false;events.paste({target:{id},clipboardData,preventDefault(){prevented=true;}});return prevented;}
 for(const id of ['translator-input','full-reader-source']){
  assert.equal(paste(id,{files:[file]}),true);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(commits.at(-1).text.text,'Texto de prueba.');
  assert.match(node('#full-reader-image-status').textContent,/translation is being prepared/);
 }
 assert.equal(reads.length,2);
 assert.equal(paste('translator-input',{items:[{kind:'string',type:'text/plain'}]}),false);
 assert.equal(paste('conversation-text',{files:[file]}),false);
 assert.equal(reads.length,2);
 await node('#paste-screenshot').events.click();
 assert.match(node('#full-reader-image-status').textContent,/Opening Photos/);
});
