// Optional real-DOM integration check; see docs/TRANSLATION_SCREEN_CLEANUP.md.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM, VirtualConsole} = require(process.env.HABLA_JSDOM_MODULE || 'jsdom');
const root = path.resolve(__dirname, '..');
const hostedRoot = path.resolve(process.env.HABLA_HOSTED_ROOT || root);
async function main() {
  const errors=[], messages=[];
  const virtualConsole=new VirtualConsole();
  virtualConsole.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(fs.readFileSync(path.join(hostedRoot,'index.html'),'utf8'),{
    url:'https://mathewdmoore.github.io/habla-ecuador/index.html?start=translate',
    runScripts:'outside-only',pretendToBeVisual:true,virtualConsole
  });
  const w=dom.window, d=w.document, $=selector=>d.querySelector(selector);
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.HTMLMediaElement.prototype.pause=function(){};
  w.speechSynthesis={getVoices:()=>[],addEventListener(){},cancel(){},resume(){},speak(){}};
  w.__hablaSystemAudioSupported=w.__hablaSongIdentificationSupported=true;
  w.webkit={messageHandlers:{hablaSpeech:{postMessage:message=>messages.push(structuredClone(message))}}};
  w.fetch=async input=>{
    const url=new URL(input,w.location.href);
    if(url.origin!==w.location.origin) throw new Error('Network disabled for layout test');
    const file=path.join(hostedRoot,url.pathname.replace('/habla-ecuador/',''));
    return {ok:true,json:async()=>JSON.parse(fs.readFileSync(file,'utf8'))};
  };
  vm.runInContext(fs.readFileSync(path.join(root,'ios/HablaEcuador/NativeSpeech.js'),'utf8'),dom.getInternalVMContext());
  for(const script of d.querySelectorAll('script[src]')) {
    vm.runInContext(fs.readFileSync(path.join(hostedRoot,script.getAttribute('src').split('?')[0]),'utf8'),dom.getInternalVMContext());
  }
  await new Promise(resolve=>d.addEventListener('DOMContentLoaded',resolve,{once:true}));
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(errors,[]);
  const capture=$('.music-capture'), editor=$('#translator-input'), target=$('#natural-result');
  const workspace=$('#native-translation-workspace'), source=$('#source-language-select');
  assert.equal(capture.closest('.view').id,'music-view');
  assert.equal(workspace.closest('.view').id,'translator-view');
  assert.equal($('#native-import-tools').open,false);
  assert.equal($('#choose-document').closest('details').id,'native-import-tools');
  assert.equal($('#native-speech-details').closest('#native-music-options').open,false);
  assert.ok($('#native-music-explore #open-music-tracks'));
  assert.equal($('#music-listen').closest('#native-capture-controls').id,'native-capture-controls');
  assert.equal($('#music-playback-source').closest('#native-capture-controls').id,'native-capture-controls');
  assert.equal($('#native-capture-controls').closest('details'),null,'primary controls never hide in a disclosure');
  assert.equal($('#native-music-workspace').firstElementChild.id,'native-capture-controls','Start/Stop appears before the growing transcript');
  assert.match($('#native-capture-status').textContent,/Ready to listen/);
  assert.match($('#music-listen').textContent,/Start listening|Listen to music/);
  const idCounts=()=>{const counts={};for(const node of d.querySelectorAll('[id]'))counts[node.id]=(counts[node.id]||0)+1;return counts;};
  assert.ok(Object.values(idCounts()).every(count=>count===1),'no duplicate editor/control IDs');
  editor.value='Texto editado para conservar.';target.textContent='An edited translation.';
  let sourceEvents=0;editor.addEventListener('input',()=>sourceEvents++);
  $('#native-translate-shortcuts button').click();
  assert.equal($('.view.active').id,'music-view');
  assert.equal($('.bottom-nav button.active').dataset.open,'music-view');
  assert.equal(workspace.closest('.view').id,'music-view');
  assert.equal(source.closest('.view').id,'music-view');
  assert.equal($('#translator-input'),editor);assert.equal($('#natural-result'),target);
  assert.equal(editor.value,'Texto editado para conservar.');
  editor.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(sourceEvents,1);
  // Explicit same-iPhone request uses the existing capture and native bridge.
  $('#music-live-translation').checked=false;$('#music-playback-source').value='system';
  $('#native-identify-song').click();
  assert.match($('#native-capture-status').textContent,/Waiting for screen-sharing approval/);
  const start=messages.at(-1);assert.equal(start.action,'start');assert.equal(start.input,'system');
  w.__hablaNativeSpeech({id:start.id,type:'start'});
  assert.match($('#native-capture-status').textContent,/Listening/);
  assert.equal(messages.at(-1).action,'identify-song');
  w.__hablaNativeSpeech({id:start.id,type:'result',text:'Una frase de prueba.',final:false});
  assert.match(editor.value,/Una frase de prueba/);
  const currentText=editor.value, commandCount=messages.length;
  const mode=$('#native-speech-details select');
  // Tabs move existing editors; neither direction stops an active capture.
  $('.bottom-nav [data-open="translator-view"]').click();
  assert.equal(workspace.closest('.view').id,'translator-view');
  assert.equal($('.view.active').id,'translator-view');
  assert.equal(editor.value,currentText);assert.equal(mode.disabled,true);
  $('.bottom-nav [data-open="music-view"]').click();
  assert.equal(messages.length,commandCount,'Music/Translate transitions do not stop/restart capture');
  assert.equal(workspace.closest('.view').id,'music-view');
  assert.ok($('#music-listen').getAttribute('aria-pressed')==='true');
  $('#music-listen').click();
  assert.equal(messages.at(-1).action,'stop');
  w.__hablaNativeSpeech({id:start.id,type:'end'});
  assert.equal(editor.value,currentText);
  assert.equal($('#music-listen').disabled,false);
  $('.bottom-nav [data-open="translator-view"]').click();
  const speechShortcut=[...$('#native-translate-shortcuts').children][1];speechShortcut.click();
  assert.equal($('.view.active').id,'music-view');assert.equal($('#native-music-options').open,true);
  assert.equal($('#native-speech-details').open,true);
  // Other destinations retain hosted capture-stop behavior and edited text.
  $('#music-listen').click();const next=messages.at(-1);assert.equal(next.action,'start');
  w.__hablaNativeSpeech({id:next.id,type:'start'});
  $('.bottom-nav [data-open="dictionary-view"]').click();
  assert.equal(messages.at(-1).action,'abort');
  w.__hablaNativeSpeech({id:next.id,type:'end'});
  assert.equal(editor.value,currentText);
  $('.bottom-nav [data-open="translator-view"]').click();
  $('.mode[data-mode="conversation"]').click();assert.equal($('#conversation-panel').hidden,false);
  $('.bottom-nav [data-open="music-view"]').click();assert.equal($('#conversation-panel').hidden,true);
  assert.equal($('.view.active').id,'music-view');
  $('.bottom-nav [data-open="translator-view"]').click();assert.equal($('#translate-panel').hidden,false);
  assert.equal($('#translator-input'),editor);assert.equal(editor.value,currentText);
  assert.ok(Object.values(idCounts()).every(count=>count===1));
  assert.deepEqual(errors,[]);
  dom.window.close();
  console.log('Native layout DOM checks passed: paired editors, import disclosure, Music placement, tab routing, captured text, listeners, source isolation, stop/cancel and conversation handoff. Hosted source: '+hostedRoot);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
