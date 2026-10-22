// Optional full-DOM integration, including the installed native wrapper's layout.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM,VirtualConsole}=require(process.env.HABLA_JSDOM_MODULE||'jsdom');
const root=path.resolve(__dirname,'..');
async function check(file,nativeScript){
 const errors=[],payloads=[],copied=[];
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://mathewdmoore.github.io/habla-ecuador/'+file,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window,d=w.document;
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLMediaElement.prototype.pause=function(){};
 w.speechSynthesis={getVoices:()=>[],addEventListener(){},cancel(){},resume(){},speak(){}};
 w.fetch=async input=>{const u=new URL(input,w.location.href);if(u.origin!==w.location.origin)throw Error('External network blocked');return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,u.pathname.replace('/habla-ecuador/','')),'utf8'))};};
 Object.defineProperty(w.navigator,'clipboard',{configurable:true,value:{writeText:async text=>copied.push(text)}});
 if(nativeScript){
  w.__hablaSystemAudioSupported=w.__hablaSongIdentificationSupported=true;
  w.webkit={messageHandlers:{hablaSpeech:{postMessage(){}}}};
  vm.runInContext(fs.readFileSync(nativeScript,'utf8'),dom.getInternalVMContext());
 }
 for(const script of d.querySelectorAll('script[src]'))vm.runInContext(fs.readFileSync(path.join(root,script.getAttribute('src').split('?')[0]),'utf8'),dom.getInternalVMContext());
 await new Promise(resolve=>d.addEventListener('DOMContentLoaded',resolve,{once:true}));
 await new Promise(resolve=>setImmediate(resolve));
 const source=d.querySelector('#translator-input'),draft=d.querySelector('#natural-result'),button=d.querySelector('#share-result');
 source.value='Private original';
 w.setEditableTranslation(source.value,'Draft translation.');
 d.querySelector('#translation-result').hidden=false;
 draft.textContent='My edited translation.';
 assert.equal(button.disabled,false);
 w.navigator.share=async data=>payloads.push(data);
 button.click();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(payloads[0].text,'My edited translation.');
 assert.equal(payloads[0].url,undefined);
 assert.equal(draft.textContent,'My edited translation.');
 if(nativeScript){
  d.querySelector('.bottom-nav [data-open="music-view"]').click();
  assert.equal(button.closest('.view').id,'music-view');
  assert.equal(d.querySelector('#natural-result'),draft);
 }
 delete w.navigator.share;
 button.click();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(copied.at(-1),'My edited translation.');
 assert.match(d.querySelector('#translation-share-status').textContent,/copied/);
 assert.equal(source.value,'Private original');
 assert.deepEqual(errors,[]);
 dom.window.close();
}
(async()=>{await check('index.html');await check('translator.html');if(process.env.HABLA_NATIVE_SCRIPT)await check('index.html',process.env.HABLA_NATIVE_SCRIPT);console.log('Sharing DOM passed: app/standalone binding, edited text, original excluded, real button click, copy fallback and optional native Music/Translate placement.');})().catch(e=>{console.error(e);process.exitCode=1;});
