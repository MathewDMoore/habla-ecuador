const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function environment(){
 const events={},revoked=[],messages=[],opened=[];let serial=0;
 const nodes={};
 for(const id of ['whatsapp-audio-file','whatsapp-audio-player','whatsapp-audio-status','whatsapp-audio-clear','whatsapp-audio-import'])nodes[id]={
  events:{},hidden:true,value:'',textContent:'',addEventListener(t,f){this.events[t]=f;},pause(){},load(){},removeAttribute(k){delete this[k];},scrollIntoView(){},append(button){this.button=button;}};
 const context={console,Uint8Array,File:class extends Blob{constructor(parts,name,options){super(parts,options);this.name=name;}},atob,
  location:{origin:'https://mathewdmoore.github.io',pathname:'/habla-ecuador/index.html'},
  document:{readyState:'complete',querySelector(q){return q.startsWith('#')?nodes[q.slice(1)]:{click(){opened.push(q);}};},getElementById:id=>nodes[id],addEventListener:(t,f)=>events[t]=f,
   createElement:()=>({addEventListener(t,f){this[t]=f;}})},
  URL:{createObjectURL:()=>`blob:${++serial}`,revokeObjectURL:u=>revoked.push(u)},
  window:{addEventListener:(t,f)=>events[t]=f,webkit:{messageHandlers:{hablaAudio:{postMessage:m=>messages.push(m)}}}}};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('whatsapp-audio.js','utf8'),context);
 vm.runInContext(fs.readFileSync('ios/HablaEcuador/SharedAudio.js','utf8'),context);
 return {context,nodes,revoked,messages,opened,events};
}
test('incoming audio is reconstructed, opens Translate, and replaces/revokes local playback only on success',()=>{
 const e=environment(),receive=e.context.window.__hablaSharedAudio;
 const send=m=>receive(JSON.parse(JSON.stringify(m)));
 assert.equal(send({action:'begin',id:'a',name:'WhatsApp.m4a',type:'audio/mp4'}),true);
 assert.equal(send({action:'chunk',id:'old',data:'YQ=='}),false,'stale chunks are rejected');
 assert.equal(send({action:'chunk',id:'a',data:'YXVkaW8='}),true);
 assert.equal(send({action:'end',id:'a'}),true);
 assert.equal(e.nodes['whatsapp-audio-player'].src,'blob:1');
 assert.equal(e.nodes['whatsapp-audio-import'].open,true);
 assert.match(e.nodes['whatsapp-audio-status'].textContent,/WhatsApp.m4a/);
 assert.equal(e.opened.length,1);
 assert.equal(send({action:'end',id:'a'}),false,'a note is finalized only once');
 const open=e.context.window.HablaWhatsAppAudio.open;
 assert.equal(open({name:'bad.pdf',type:'application/pdf',size:10}),false);
 assert.equal(open({name:'empty.m4a',type:'audio/mp4',size:0}),false);
 assert.equal(open({name:'huge.m4a',type:'audio/mp4',size:51*1024*1024}),false);
 assert.equal(e.nodes['whatsapp-audio-player'].src,'blob:1','failed selection preserves the existing audio');
 assert.equal(open({name:'note.opus',type:'',size:10}),true);
 assert.deepEqual(e.revoked,['blob:1']);
 e.nodes['whatsapp-audio-clear'].events.click();
 assert.deepEqual(e.revoked,['blob:1','blob:2']);
 assert.equal(e.nodes['whatsapp-audio-player'].hidden,true);
});
test('saved-note chooser uses native inbox and a new transfer rejects old chunks',()=>{
 const e=environment(),receive=e.context.window.__hablaSharedAudio;
 e.events.DOMContentLoaded();e.nodes['whatsapp-audio-import'].button.click();
 assert.equal(e.messages[0].action,'inbox');
 receive({action:'begin',id:'first',name:'one.m4a',type:'audio/mp4'});
 receive({action:'begin',id:'second',name:'two.m4a',type:'audio/mp4'});
 assert.equal(receive({action:'chunk',id:'first',data:'YQ=='}),false);
 assert.equal(receive({action:'end',id:'first'}),false);
 assert.equal(receive({action:'chunk',id:'second',data:'YQ=='}),true);
 assert.equal(receive({action:'end',id:'second'}),true);
 assert.match(e.nodes['whatsapp-audio-status'].textContent,/two.m4a/);
});
test('native receiver is not installed on an external origin',()=>{
 const e=environment();delete e.context.window.__hablaSharedAudio;
 e.context.location.origin='https://example.com';
 vm.runInContext(fs.readFileSync('ios/HablaEcuador/SharedAudio.js','utf8'),e.context);
 assert.equal(e.context.window.__hablaSharedAudio,undefined);
});
