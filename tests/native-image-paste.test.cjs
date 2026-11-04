const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {File} = require('node:buffer');
const bridge = fs.readFileSync('ios/HablaEcuador/NativeSpeech.js', 'utf8');
const recognized = {kind:'image',text:'CHICKEN\nSOUP BASE',confidence:95,excludedLines:0,engine:'apple-vision'};
function harness({native=true, origin='https://mathewdmoore.github.io'}={}) {
  const handlers={}, calls=[], images=[], nodes=new Map();
  for (const id of ['translator-input','full-reader-source','source-language-select','target-language-select','screenshot-status','quick-image-status','full-reader-image-status'])
    nodes.set('#'+id,{value:id==='source-language-select'?'es-EC':id==='target-language-select'?'en-US':'',textContent:''});
  const document={readyState:'complete',querySelector:id=>nodes.get(id)||null,
    addEventListener:(type,fn,capture)=>{assert.equal(capture,true);handlers[type]=fn;}};
  const confirmations=[];
  const window={confirm:() => {confirmations.push(true);return true;},webkit:{messageHandlers:{hablaSpeech:{postMessage(){}}}}};
  if(native)window.webkit.messageHandlers.hablaClipboard={postMessage:message=>new Promise((resolve,reject)=>calls.push({message,resolve,reject}))};
  const context={window,document,location:{origin,pathname:'/habla-ecuador/index.html'},EventTarget,Event,DOMException,File,Uint8Array,atob,
    HablaScreenshot:{clear(){}},beginScreenshotImport:()=>({token:1}),previewScreenshotText:(image,guard)=>{assert.equal(guard.token,1);images.push(image);return true;}};
  vm.runInNewContext(bridge,context);
  function click(id='quick-paste-image') {
    const event={target:{closest:selector=>selector.split(', ').includes('#'+id)?{}:null},preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};
    const done=handlers.click?.(event);
    return {event,done};
  }
  return {handlers,calls,images,nodes,click,confirmations,window};
}
test('native paste reads only on a tap, delivers native recognized text to the importer, and blocks duplicate browser handling',async()=>{
  const h=harness();assert.equal(h.calls.length,0);
  for(const id of ['quick-paste-image','paste-screenshot']){
    const {event,done}=h.click(id);
    assert.equal(event.prevented,true);assert.equal(event.stopped,true);
    assert.equal(h.calls.at(-1).message.action,'pasteToTranslate');
    h.calls.at(-1).resolve(recognized);await done;
  }
  assert.equal(h.images.length,2);assert.equal(h.images[0].text,recognized.text);
  const {event}=h.click('choose-screenshot');assert.equal(event.prevented,undefined);
});
test('denial, empty clipboard and malformed responses show a retry message without changing input',async()=>{
  const h=harness();h.nodes.get('#translator-input').value='Keep my original';
  let pending=h.click();h.calls[0].reject(new Error('Allow Paste, then try again.'));await pending.done;
  assert.match(h.nodes.get('#quick-image-status').textContent,/Allow Paste/);
  pending=h.click();h.calls[1].resolve({base64:'',type:'image/png'});await pending.done;
  assert.match(h.nodes.get('#quick-image-status').textContent,/no usable text/);
  assert.equal(h.nodes.get('#translator-input').value,'Keep my original');assert.equal(h.images.length,0);
});
test('edits, language changes, cancellation and later taps supersede pending clipboard results',async()=>{
  for(const cancel of [h=>h.handlers.input(),h=>h.handlers.change(),h=>h.click('cancel-screenshot'),h=>{h.nodes.get('#target-language-select').value='en-GB';}]){
    const h=harness(),pending=h.click();cancel(h);
    h.calls[0].resolve(recognized);await pending.done;
    assert.equal(h.images.length,0);
  }
  const h=harness(),first=h.click(),second=h.click();
  h.calls[1].resolve(recognized);await second.done;
  h.calls[0].resolve(recognized);await first.done;
  assert.equal(h.images.length,1);
});
test('ordinary browser and older native builds keep their existing image controls',()=>{
  assert.equal(harness({native:false}).handlers.click,undefined);
  assert.equal(harness({origin:'https://example.com'}).handlers.click,undefined);
});

test('weak recognition never reaches the importer or replaces existing text',async()=>{
  for(const result of [{...recognized,confidence:25},{...recognized,text:''},{...recognized,confidence:NaN}]){
    const h=harness();h.nodes.get('#translator-input').value='Keep original';
    const pending=h.click();h.calls[0].resolve(result);await pending.done;
    assert.equal(h.images.length,0);assert.equal(h.nodes.get('#translator-input').value,'Keep original');
    assert.match(h.nodes.get('#quick-image-status').textContent,/not clear enough|no usable text/);
  }
});

test('copied article text translates through the same automatic source-import path',async()=>{
  const h=harness();
  const copied='An entire sentence from the copied article.';
  const {done}=h.click();
  h.calls[0].resolve({kind:'text',text:copied});await done;
  assert.equal(h.images.length,1);
  assert.equal(h.images[0].text,copied);
  assert.equal(h.images[0].kind,'text');
  assert.match(h.nodes.get('#quick-image-status').textContent,/Translating automatically/);
});
test('text paste never silently replaces a different existing source',async()=>{
  const h=harness();
  h.nodes.get('#translator-input').value='Keep my original story';
  h.window.confirm=() => {h.confirmations.push(false);return false;};
  const {done}=h.click();
  h.calls[0].resolve({kind:'text',text:'Different clipboard article'});await done;
  assert.equal(h.images.length,0);
  assert.deepEqual(h.confirmations,[false]);
  assert.equal(h.nodes.get('#translator-input').value,'Keep my original story');
  assert.match(h.nodes.get('#quick-image-status').textContent,/cancelled/);
});
test('text paste with nonempty source asks before replacement',async()=>{
  const h=harness();
  h.nodes.get('#translator-input').value='Old story';
  const {done}=h.click();
  h.calls[0].resolve({kind:'text',text:'New story'});await done;
  assert.deepEqual(h.confirmations,[true]);
  assert.equal(h.images.length,1);
});
test('unrecognized clipboard type is reported rather than claiming success',async()=>{
  const h=harness();const {done}=h.click();
  h.calls[0].resolve({kind:'unknown',text:'Hello'});await done;
  assert.equal(h.images.length,0);
  assert.match(h.nodes.get('#quick-image-status').textContent,/not recognized/);
});
