const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const bridge = fs.readFileSync('ios/HablaEcuador/NativeSpeech.js', 'utf8');
const swift = fs.readFileSync('ios/HablaEcuador/HablaEcuadorApp.swift', 'utf8');
const plist = fs.readFileSync('ios/HablaEcuador/Info.plist', 'utf8');

function harness() {
  const calls = [], images = [], translations = [], nodes = new Map();
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
    HablaOffline: {shouldUse() { return false; }},
    requestGeneralTranslation: async (text, way, options) => {
      translations.push({text, way, options});
      return 'Traducción de prueba';
    },
  };
  vm.runInNewContext(bridge, context);
  assert.ok(button, 'camera shortcut is installed beside current image actions');
  return {window, nodes, calls, images, translations, button,
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


test('live camera overlay is opt-in, accurate, debounced, and rejects stale responses', () => {
  assert.match(swift, /qualityLevel: \.accurate/);
  assert.match(swift, /@objc private func toggleCameraLiveTranslation\(\)/);
  assert.match(swift, /Recognized text may be sent to an online translation service/);
  assert.match(swift, /cameraPreviewText != cameraPreviewInFlightText/);
  assert.match(swift, /cameraPreviewWork\?\.cancel\(\)/);
  assert.match(swift, /case "camera-live-result": receiveCameraLiveResult\(body\)/);
});

test('live preview uses chosen regional language pair and never sends camera pixels', async () => {
  const h = harness();
  h.nodes.get('#source-language-select').value = 'en-US';
  h.nodes.get('#target-language-select').value = 'es-MX';
  assert.equal(h.translations.length, 0, 'nothing translates without an explicit camera preview request');
  await h.window.__hablaCameraLiveRequest({
    id: 'camera-7', token: 'fresh-token', text: 'Vote against Proposition 1'
  });
  assert.equal(h.translations.length, 1);
  assert.equal(h.translations[0].way, 'en-ec');
  assert.equal(h.translations[0].options.source, 'en-US');
  assert.equal(h.translations[0].options.target, 'es-MX');
  assert.equal(h.translations[0].options.inputType, 'image');
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].action, 'camera-live-result');
  assert.equal(h.calls[0].token, 'fresh-token');
  assert.equal(h.calls[0].target, 'es-MX');
  assert.equal(h.calls[0].translation, 'Traducción de prueba');
  assert.equal(h.calls[0].image, undefined, 'no camera frame passes into the hosted translator');
});

test('invalid live-preview OCR text is never translated', async () => {
  const h = harness();
  await h.window.__hablaCameraLiveRequest({id:'camera-1',token:'x',text:''});
  assert.equal(h.translations.length, 0);
  assert.match(h.calls[0].error, /not ready/);
});

test('camera overlay installer is syntactically valid and protects signed local edits', () => {
  const {spawnSync} = require('node:child_process');
  const path = 'scripts/install-live-camera-preview-safely.sh';
  const script = fs.readFileSync(path, 'utf8');
  const result = spawnSync('bash', ['-n', path], {encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.match(script, /HablaCameraBackups/);
  assert.match(script, /git merge-file -p/);
  assert.doesNotMatch(script, /git reset --hard|git clean -f|git restore/);
});
