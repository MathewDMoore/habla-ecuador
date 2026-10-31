const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const helper=require('../recording-import.js');
test('video clipboard selection prefers the actual video over its still thumbnail',()=>{
 const video={name:'screen.MOV',type:'',size:120};
 assert.equal(helper.isVideo(video),true);
 assert.equal(helper.isVideo({name:'document.pdf',type:'application/pdf'}),false);
 assert.equal(helper.videoFromClipboard({files:[{type:'image/png'},video]}),video);
 assert.equal(helper.videoFromClipboard({items:[{kind:'file',type:'video/mp4',getAsFile:()=>video}]}),video);
 assert.equal(helper.videoFromClipboard({files:[{type:'image/png'}]}),null);
});
test('recording preview, seek readiness, explicit frame OCR, replacement and stale callback cleanup',async()=>{
 const nodes={},events={},reads=[],revoked=[],blobs=[];
 const setup={open:false};let next=0;
 function node(id){return nodes[id]||=( {id,hidden:false,disabled:false,events:{},value:'',readyState:0,videoWidth:512,videoHeight:1108,currentTime:6.2,seeking:false,
  addEventListener(t,f){this.events[t]=f;},pause(){},load(){},removeAttribute(n){delete this[n];},closest(){return setup;},click(){return this.events.click?.();}});}
 class File{constructor(bytes,name,options){this.bytes=bytes;this.name=name;Object.assign(this,options);}}
 const context=vm.createContext({console,File,document:{readyState:'complete',getElementById:node,addEventListener:(t,f)=>events[t]=f,
  createElement:()=>({getContext:()=>({drawImage(){}}),toBlob:fn=>blobs.push(fn)})},window:{addEventListener(){}},navigator:{},
  URL:{createObjectURL:()=>`blob:${++next}`,revokeObjectURL:url=>revoked.push(url)},HablaScreenshot:{read:file=>reads.push(file)}});
 vm.runInContext(fs.readFileSync('recording-import.js','utf8'),context);
 const open=file=>{context.file=file;vm.runInContext('HablaRecording.open(file)',context);};
 const video=node('recording-preview'),read=node('read-recording-frame');
 open({type:'video/mp4',name:'screen.mp4',size:1000});
 assert.equal(setup.open,true,'import preview opens the collapsed import controls');
 assert.equal(node('recording-review').hidden,false);assert.equal(read.disabled,true);
 video.readyState=2;video.events.loadedmetadata();video.events.loadeddata();
 assert.equal(read.disabled,false);assert.match(node('recording-status').textContent,/Audio is not transcribed/);
 video.seeking=true;video.events.seeking();assert.equal(read.disabled,true);
 video.seeking=false;video.events.seeked();assert.equal(read.disabled,false);
 read.click();assert.equal(read.disabled,true);blobs.shift()({type:'image/png'});
 assert.equal(reads.length,1);assert.equal(reads[0].type,'image/png');assert.equal(read.disabled,false);
 read.click();open({type:'video/quicktime',name:'new.mov',size:1000});blobs.shift()({type:'image/png'});
 assert.equal(reads.length,1,'a late frame from a replaced video cannot overwrite source text');
 assert.deepEqual(revoked,['blob:1']);
 open({type:'video/mp4',size:501*1024*1024});assert.match(node('recording-status').textContent,/500 MB/);
 let prevented=false;
 events.paste({target:{id:'translator-input'},clipboardData:{files:[{type:'video/mp4',size:100}]},preventDefault(){prevented=true;}});
 assert.equal(prevented,true);
 prevented=false;events.paste({target:{id:'conversation-text'},clipboardData:{files:[{type:'video/mp4'}]},preventDefault(){prevented=true;}});assert.equal(prevented,false);
 await node('paste-recording').click();assert.match(node('recording-status').textContent,/choose Photo Library/);
 node('clear-recording').click();assert.equal(node('recording-review').hidden,true);assert.equal(read.disabled,true);
});
