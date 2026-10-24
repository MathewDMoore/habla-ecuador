// DOM/native bridge simulation only. No picker, audio, server or real sharing.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),hosted=path.resolve(process.env.HABLA_HOSTED_ROOT||root),origin='https://mathewdmoore.github.io';
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [390,320]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(hosted,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
  await page.addInitScript(()=>{window.__hablaRecordingImportSupported=true;window.bridgeMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>{if(window.failBridge)throw Error('broken');window.bridgeMessages.push(m);}}}};});
  await page.addInitScript({path:path.join(root,'ios/HablaEcuador/NativeSpeech.js')});
  await page.goto(origin+'/habla-ecuador/index.html?start=translate');
  await page.evaluate(()=>{window.renderTranslation=()=>{window.translationCalls=(window.translationCalls||0)+1};document.querySelector('#translator-input').value='Original neutral source';});
  await page.locator('[data-open="music-view"]').last().click();await page.locator('#native-recording-import summary').click();
  const status=page.locator('#native-recording-status'),preview=page.locator('#native-recording-preview'),editor=page.locator('#translator-input'),apply=page.locator('#native-recording-apply');
  await page.locator('#native-recording-offset').fill('-1');await page.locator('#native-recording-files').click();assert.match(await status.textContent(),/whole-number/);assert.equal(await page.evaluate(()=>bridgeMessages.filter(m=>m.action==='import-recording').length),0);
  await page.locator('#native-recording-offset').fill('15');await page.locator('#native-recording-photos').click();
  let request=await page.evaluate(()=>bridgeMessages.filter(m=>m.action==='import-recording').at(-1));assert.equal(request.source,'photos');assert.equal(request.startSeconds,15);assert.equal(request.lang,'es-MX');assert.deepEqual(Object.keys(request).sort(),['action','id','lang','source','startSeconds']);assert.equal(await page.locator('#native-recording-files').isDisabled(),true);
  await page.evaluate(()=>{try{new SpeechRecognition().start()}catch(e){window.overlap=e.name}});assert.equal(await page.evaluate(()=>overlap),'InvalidStateError');
  await page.evaluate(()=>__hablaNativeSpeech({type:'recording-import',id:'old',status:'done',text:'stale'}));assert.equal(await preview.inputValue(),'');
  await page.evaluate(id=>__hablaNativeSpeech({type:'recording-import',id,status:'working',text:'tentative',message:'Tentative draft'}),request.id);assert.equal(await apply.isDisabled(),true);assert.equal(await preview.getAttribute('readonly'),'');assert.equal(await editor.inputValue(),'Original neutral source');assert.equal(await page.evaluate(()=>window.translationCalls||0),0);
  await page.locator('#native-recording-cancel').click();assert.equal((await page.evaluate(()=>bridgeMessages.at(-1))).action,'cancel-recording-import');
  await page.evaluate(id=>__hablaNativeSpeech({type:'recording-import',id,status:'done',text:'late'}),request.id);assert.equal(await editor.inputValue(),'Original neutral source');assert.equal(await apply.isDisabled(),true);
  await page.locator('#native-recording-files').click();request=await page.evaluate(()=>bridgeMessages.filter(m=>m.action==='import-recording').at(-1));
  await page.evaluate(id=>__hablaNativeSpeech({type:'recording-import',id,status:'error',message:'This video has no audio track.'}),request.id);assert.match(await status.textContent(),/no audio/);assert.equal(await page.locator('#native-recording-files').isDisabled(),false);
  await page.locator('#native-recording-files').click();request=await page.evaluate(()=>bridgeMessages.filter(m=>m.action==='import-recording').at(-1));
  await page.evaluate(id=>__hablaNativeSpeech({type:'recording-import',id,status:'done',text:'Una frase de prueba.',message:'On-device draft'}),request.id);assert.equal(await apply.isDisabled(),false);assert.equal(await editor.inputValue(),'Original neutral source');
  await preview.fill('Una frase revisada.');await page.evaluate(()=>document.querySelector('#translator-input').value='Newer neutral source');await apply.click();assert.match(await status.textContent(),/source changed/);assert.equal(await editor.inputValue(),'Newer neutral source');
  await apply.click();assert.equal(await editor.inputValue(),'Una frase revisada.');assert.equal(await page.locator('#source-language-select').inputValue(),'es-EC');assert.equal(await page.locator('#target-language-select').inputValue(),'en-US');
  await page.locator('#native-recording-undo').click();assert.equal(await editor.inputValue(),'Newer neutral source');assert.equal(await page.locator('#source-language-select').inputValue(),'en-US');assert.equal(await page.locator('#target-language-select').inputValue(),'es-EC');
  await page.locator('#native-recording-language').selectOption('en-US');await page.locator('#native-recording-files').click();request=await page.evaluate(()=>bridgeMessages.filter(m=>m.action==='import-recording').at(-1));assert.equal(request.lang,'en-US');
  await page.evaluate(id=>__hablaNativeSpeech({type:'recording-import',id,status:'done',text:'Another neutral draft.'}),request.id);await apply.click();await page.evaluate(()=>document.querySelector('#translator-input').value='New manual edit');await page.locator('#native-recording-undo').click();assert.equal(await editor.inputValue(),'New manual edit');assert.match(await status.textContent(),/did not overwrite/);
  await page.evaluate(()=>window.failBridge=true);await page.locator('#native-recording-files').click();assert.match(await status.textContent(),/Could not open/);assert.equal(await page.locator('#native-recording-files').isDisabled(),false);assert.equal(await editor.inputValue(),'New manual edit');
  assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width));assert.deepEqual(errors,[]);if(width===390)await page.screenshot({path:'/tmp/habla-recording-import.png'});await context.close();
 }
 console.log('Recording import UI passed: explicit pickers, bounds, busy/overlap, tentative review, stale/cancel/error isolation, edit/apply/undo, language direction and narrow layout. No native compilation/audio verification.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
