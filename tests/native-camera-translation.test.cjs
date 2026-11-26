const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const bridge = fs.readFileSync('ios/HablaEcuador/NativeSpeech.js', 'utf8');
const swift = fs.readFileSync('ios/HablaEcuador/HablaEcuadorApp.swift', 'utf8');
const plist = fs.readFileSync('ios/HablaEcuador/Info.plist', 'utf8');

function harness(translate = async text => text) {
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
    requestGeneralTranslation: translate,
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
  assert.match(swift,/cameraScanner\?\.stopScanning\(\)/);
  assert.match(plist,/<key>NSCameraUsageDescription<\/key>/);
});


test('native AR rejects changed numbers and stale or changed-language requests', async () => {
  const h=harness(async text => text === '4 g' ? '40 g' : text === 'Hello' ? 'Hola' : text);
  const {id}=h.click();
  await h.window.__hablaCameraLiveRequest({id,token:'a',items:[{text:'4 g'},{text:'5 g'},{text:'Hello'}]});
  const result=h.calls.at(-1);
  assert.equal(result.action,'camera-live-result');
  assert.equal(result.translations[0].translation,undefined);
  assert.ok(result.translations[0].error);
  assert.equal(result.translations[1].translation,'5 g');
  assert.equal(result.translations[2].translation,'Hola');
  await h.window.__hablaCameraLiveRequest({id:'wrong',token:'b',items:[{text:'Hello'}]});
  assert.ok(h.calls.at(-1).error);
  h.nodes.get('#target-language-select').value='en-GB';
  await h.window.__hablaCameraLiveRequest({id,token:'c',items:[{text:'Hello'}]});
  assert.ok(h.calls.at(-1).error);
});
test('native AR uses continuously updated geometry without dismissing on a live tap', () => {
  assert.match(swift,/qualityLevel: \.accurate/);
  assert.match(swift,/isHighFrameRateTrackingEnabled: true/);
  assert.match(swift,/overlayContainerView/);
  assert.match(swift,/CGAffineTransform\(rotationAngle: line\.angle\)/);
  assert.match(swift,/guard !cameraLiveEnabled else \{ return \}/);
  assert.match(swift,/UIColor\.black\.withAlphaComponent\(0\.60\)/);
});


test('iOS 26 camera translates natively with the selected pair and explicit pack error', () => {
  const h=harness(), msg=h.click();
  assert.equal(msg.source,'es-EC');
  assert.equal(msg.target,'en-US');
  assert.match(swift,/import Translation/);
  assert.match(swift,/TranslationSession\(installedSource:/);
  assert.match(swift,/try await session\.translate\(item\.source\)/);
  assert.match(swift,/Download English and Spanish in Apple Translate/);
  assert.match(swift,/isHighlightingEnabled: false/);
  assert.match(swift,/cameraNumbers\(item\.source\) != self\.cameraNumbers\(output\)/);
});
