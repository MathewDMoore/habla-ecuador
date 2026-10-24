const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io',items=require('../recorded-transcripts.js').items;
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [390,320]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async r=>{const u=new URL(r.request().url());
   if(u.hostname==='api.mymemory.translated.net'){requests.push(u.searchParams.get('q'));return r.fulfill({json:{responseStatus:200,responseData:{translatedText:'The color of the center is my favorite.'}}});}
   const file=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();
  });
  if(process.env.HABLA_NATIVE_SCRIPT)await page.addInitScript(()=>{window.webkit={messageHandlers:{hablaSpeech:{postMessage(){}}}};});
  if(process.env.HABLA_NATIVE_SCRIPT)await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});
  await page.goto(origin+'/habla-ecuador/index.html');
  await page.evaluate(()=>{window.testOffline=false;HablaOffline.shouldUse=()=>testOffline;window.offlineCalls=[];HablaOffline.translate=async(text,way)=>{offlineCalls.push({text,way});return 'The color of the center is my favorite.'};document.querySelector('#translator-input').value='Private synthetic editor must remain unchanged';sourceLanguage='en-US';targetLanguage='es-EC';direction='en-ec';englishVariant='uk';HablaRecordedPractice.render();});
  await page.locator('.bottom-nav [data-open="lesson-view"]').click();
  const host=page.locator('#recorded-practice');await host.locator(':scope > summary').click();
  const panel=page.locator('#recorded-transcript');await panel.locator(':scope > summary').click();
  const source=panel.locator('#recorded-transcript-source'),output=panel.locator('#recorded-transcript-output'),button=panel.locator('#recorded-transcript-translate'),status=panel.locator('#recorded-transcript-status'),target=panel.locator('#recorded-transcript-target');
  assert.equal(requests.length,0,'no translation request before tap');assert.equal(await source.inputValue(),items.beg05d.text);assert.equal(await target.inputValue(),'en-GB','uses current U.K. preference');
  await button.click();await page.waitForFunction(()=>document.querySelector('#recorded-transcript-status').textContent.includes('Full transcript translated'));
  assert.match(await output.inputValue(),/colour/);assert.match(await output.inputValue(),/favourite/);assert.ok(requests.length>1,'full transcript goes through existing chunk splitter');
  await output.fill('Keep my edited UK draft');
  await target.selectOption('en-US');assert.equal(await output.inputValue(),'');await button.click();await page.waitForFunction(()=>document.querySelector('#recorded-transcript-status').textContent.includes('Full transcript translated'));
  assert.match(await output.inputValue(),/color/);await target.selectOption('en-GB');assert.equal(await output.inputValue(),'Keep my edited UK draft');
  await page.locator('#recorded-practice-region').selectOption('caracas-colors');await panel.locator(':scope > summary').click();assert.equal(await source.inputValue(),items.beg03c.text);
  // Exercise the real translation pipeline's on-device branch without a network fallback.
  await page.evaluate(()=>{testOffline=true;document.querySelector('#offline-use').dispatchEvent(new Event('change',{bubbles:true}));});
  const before=requests.length;await button.click();await page.waitForFunction(()=>document.querySelector('#recorded-transcript-status').textContent.includes('Full transcript translated'));
  assert.equal(requests.length,before);assert.ok(await page.evaluate(()=>offlineCalls.length>0));assert.match(await status.textContent(),/on device/);
  const goodDraft=await output.inputValue();
  await page.evaluate(()=>{HablaOffline.translate=async()=>{throw Object.assign(new Error('Synthetic missing pack'),{code:'offline_pack'})}});
  await button.click();await page.waitForFunction(()=>document.querySelector('#recorded-transcript-status').textContent.includes('Download the offline pack'));
  assert.equal(await output.inputValue(),goodDraft);assert.equal(requests.length,before,'missing pack never goes online');
  // Delayed engine result must not overwrite an edit, switched region or canceled view.
  await page.evaluate(()=>{HablaOffline.translate=()=>new Promise(resolve=>{window.resolveTranscript=resolve});});
  await button.click();await output.fill('Typing must survive pending translation');await page.evaluate(()=>resolveTranscript('STALE TEXT'));assert.equal(await output.inputValue(),'Typing must survive pending translation');
  await button.click();await page.locator('#recorded-transcript-cancel').click();await page.evaluate(()=>resolveTranscript('STALE CANCELED'));assert.equal(await output.inputValue(),'Typing must survive pending translation');
  await button.click();await page.locator('.bottom-nav [data-open="dictionary-view"]').click();await page.evaluate(()=>resolveTranscript('STALE NAVIGATION'));assert.equal(await output.inputValue(),'Typing must survive pending translation');
  await page.locator('.bottom-nav [data-open="lesson-view"]').click();
  await button.click();await page.locator('#recorded-practice-region').selectOption('monterrey-weekend');await page.evaluate(()=>resolveTranscript('STALE REGION'));await panel.locator(':scope > summary').click();assert.equal(await source.inputValue(),items.beg05a.text);assert.equal(await output.inputValue(),'');
  await page.locator('#recorded-practice-region').selectOption('quito-interests');await panel.locator(':scope > summary').click();
  await page.evaluate(()=>{HablaOffline.translate=async()=>'<img src=x onerror="window.transcriptInjected=true">';});
  await button.click();await page.waitForFunction(()=>document.querySelector('#recorded-transcript-status').textContent.includes('Full transcript translated'));
  assert.match(await output.inputValue(),/<img/);assert.equal(await panel.locator('img').count(),0);assert.equal(await page.evaluate(()=>window.transcriptInjected),undefined,'provider text is not rendered as HTML');
  // Online and offline drafts have separate route keys; earlier edits remain.
  await page.evaluate(()=>{testOffline=false;document.querySelector('#offline-use').dispatchEvent(new Event('change',{bubbles:true}));});await target.selectOption('en-GB');assert.equal(await output.inputValue(),'Keep my edited UK draft');
  assert.deepEqual(await page.evaluate(()=>({text:document.querySelector('#translator-input').value,source:sourceLanguage,target:targetLanguage})),{text:'Private synthetic editor must remain unchanged',source:'en-US',target:'es-EC'});
  assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width));assert.deepEqual(errors,[]);
  if(width===390)await page.screenshot({path:'/tmp/habla-recorded-transcript.png'});
  await context.close();
 }
 console.log('Transcript UI: complete source, real translation chunking, US/UK conversion, isolated editor, route-specific editable drafts, offline/no fallback, failure preservation, typing/cancel/navigation/region stale guards and 390/320px passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
