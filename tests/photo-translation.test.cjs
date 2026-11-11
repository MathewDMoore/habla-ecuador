const test=require('node:test'),assert=require('node:assert/strict');
const {photoRegions}=require('../screenshot-import.js');
test('OCR paragraphs map from a downscaled crop back to full-photo positions',()=>{
 const blocks=[{paragraphs:[{text:'First line\nSecond line',bbox:{x0:100,y0:50,x1:900,y1:150}}]}];
 const [region]=photoRegions(blocks,{width:1000,height:500,hablaCrop:{top:.2,height:.5}});
 assert.equal(region.text,'First line\nSecond line');
 for(const [key,value]of Object.entries({x:.1,y:.25,width:.8,height:.1}))assert.ok(Math.abs(region[key]-value)<1e-10,key);
 assert.deepEqual(photoRegions([{paragraphs:[{text:'bad',bbox:{x0:NaN,y0:0,x1:4,y1:4}}]}],{width:100,height:100}),[]);
 assert.deepEqual(photoRegions(undefined,{width:100,height:100}),[]);
});

test('replacing a photo discards late translations; source edits release its image',async()=>{
 const vm=require('node:vm'),fs=require('node:fs');
 class Element{
  constructor(){this.children=[];this.events={};this.attributes={};this.style={};this.dataset={};this.open=false;this.clientWidth=300;this.clientHeight=200;this.textContent='';this.nodes={};}
  querySelector(selector){return this.nodes[selector]??=new Element();}
  append(child){this.children.push(child);}
  replaceChildren(){this.children=[];}
  setAttribute(key,value){this.attributes[key]=value;}
  removeAttribute(key){delete this.attributes[key];}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  emit(type){for(const fn of this.events[type]||[])fn();}
  showModal(){this.open=true;}
  close(){this.open=false;this.emit('close');}
 }
 const body=new Element(),reopen=new Element(),input=new Element(),revoked=[],pending=[];
 const document={body,createElement:()=>new Element(),querySelector:s=>s==='#quick-photo-overlay'?reopen:s==='#translator-input'?input:null};
 const context=vm.createContext({document,URL:{createObjectURL:file=>file.name,revokeObjectURL:url=>revoked.push(url)},ResizeObserver:class{observe(){}},navigator:{}});
 vm.runInContext(fs.readFileSync('photo-translation.js','utf8')+';globalThis.photo=HablaPhotoTranslation',context);
 context.photo.bind({getRoute:()=>({source:'en-US',target:'es-EC',onDevice:false}),translate:text=>new Promise(resolve=>pending.push({text,resolve}))});
 const region=text=>({text,x:.1,y:.2,width:.7,height:.1});
 context.photo.open({name:'first'},{text:'First.',regions:[region('First.')]});
 context.photo.open({name:'second'},{text:'Second.',regions:[region('Second.')]});
 pending[0].resolve('ANTIGUO');await new Promise(resolve=>setImmediate(resolve));
 const dialog=body.children[0],stage=dialog.querySelector('.photo-translator-stage'),layer=stage.querySelector('div');
 assert.equal(layer.children[0].textContent,'Second.','late result cannot replace the newer image label');
 pending[1].resolve('SEGUNDO');await new Promise(resolve=>setImmediate(resolve));
 assert.equal(layer.children[0].textContent,'SEGUNDO');
 input.emit('input');assert.equal(dialog.open,false);assert.equal(reopen.hidden,true);
 assert.deepEqual(revoked,['first','second'],'replaced and edited photos release object URLs');
});
