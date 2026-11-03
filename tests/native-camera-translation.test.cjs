const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const bridge = fs.readFileSync('ios/HablaEcuador/NativeSpeech.js', 'utf8');
const swift = fs.readFileSync('ios/HablaEcuador/HablaEcuadorApp.swift', 'utf8');
const plist = fs.readFileSync('ios/HablaEcuador/Info.plist', 'utf8');

function harness() {
  const calls = [], images = [], nodes = new Map();
  for (const selector of ['#translator-input','#source-language-select','#target-language-select',
                          '#quick-image-status','#screenshot-status','#full-reader-image-status']) {
    nodes.set(selector, {value: selector === '#source-language-select' ? 'es-EC' :
                          selector === '#target-language-select' ? 'en-US' : '', textContent:''});
  }
  const actions = {prepend(button) { nodes.set('#native-scan-camera', button); }};
  nodes.set('#image-quick-actions', actions);
  let button;
  const document = {
    readyState: 'complete',
    querySelector: selector => nodes.get(selector) || null,
    createElement: type => {
      assert.equal(type, 'button');
      button = {disabled:false, listeners:{}, setAttribute(){}, addEventListener(type,fn){this.listeners[type]=fn;}};
      return button;
    },
    addEventListener(){},
  };
  const window = {webkit:{messageHandlers:{hablaSpeech:{
    postMessage(message) { calls.push(message); }
  }}}};
  const context = {
    window, document, location:{origin:'https://mathewdmoore.github.io',pathname:'/habla-ecuador/translator.html'},
    EventTarget, Event, DOMException,
    HablaScreenshot:{clear(){}},
    beginScreenshotImport: () => ({token:1,text:nodes.get('#translator-input').value}),
    previewScreenshotText: (image,guard) => {
      assert.equal(guard.token,1);
      images.push(image);
      return true;
    },
  };
  vm.runInNewContext(bridge, context);
  assert.ok(button, 'camera shortcut is installed beside current image actions');
  return {window, nodes, calls, images, button,
    click() {button.listeners.click(); return calls.at(-1);},
    status() {return nodes.get('#quick-image-status').textContent;}};
}

test('live camera uses a native tap, never a silent camera start', () => {
  const h=harness();
  assert.equal(h.calls.length,0);
  const msg=h.click();
  assert.equal(msg.action,'scan-camera');
  assert.match(msg.id,/^camera-/);
  assert.equal(h.button.disabled,true);
  h.click();
  assert.equal(h.calls.length,1,'duplicate taps do not open another camera');
});

test('recognized text is committed only for the correct request', () => {
  const h=harness(), msg=h.click();
  h.window.__hablaCameraScan({id:'camera-wrong',status:'ok',text:'Wrong'});
  assert.equal(h.images.length,0);
  h.window.__hablaCameraScan({id:msg.id,status:'ok',text:'Hola, ¿cómo estás?'});
  assert.deepEqual(h.images.map(x=>x.text),['Hola, ¿cómo estás?']);
  assert.equal(h.button.disabled,false);
});

test('cancel, unavailable scanner, and no detected text keep existing words', () => {
  for (const result of [{status:'cancelled'}, {status:'error',message:'Camera restricted'},
                       {status:'ok',text:''}]) {
    const h=harness();
    h.nodes.get('#translator-input').value='Original stays';
    const msg=h.click();
    h.window.__hablaCameraScan({id:msg.id,...result});
    assert.equal(h.images.length,0);
    assert.equal(h.nodes.get('#translator-input').value,'Original stays');
    assert.equal(h.button.disabled,false);
  }
});

test('edited source or changed direction cannot be replaced by late scan', () => {
  for (const change of [
    h=>h.nodes.get('#translator-input').value='I edited the source',
    h=>h.nodes.get('#target-language-select').value='en-GB',
  ]) {
    const h=harness(), msg=h.click();
    change(h);
    h.window.__hablaCameraScan({id:msg.id,status:'ok',text:'New camera text'});
    assert.equal(h.images.length,0);
    assert.match(h.status(),/changed/);
  }
});

test('native scanner requires permission and taps or explicit confirmation', () => {
  assert.match(swift,/import VisionKit/);
  assert.match(swift,/DataScannerViewController\.isSupported && DataScannerViewController\.isAvailable/);
  assert.match(swift,/case "scan-camera": startCameraScan\(id: id\)/);
  assert.match(swift,/func dataScanner\(_ scanner: DataScannerViewController, didTapOn item: RecognizedItem\)/);
  assert.match(swift,/#selector\(useCameraText\)/);
  assert.match(swift,/scanner\.stopScanning\(\)/);
  assert.match(plist,/<key>NSCameraUsageDescription<\/key>/);
});
