const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io',items=require('../recorded-practice.js').catalog.items;
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [390,320]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[],mediaRequests=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url());
   if(u.hostname==='media.coerll.utexas.edu'){mediaRequests.push(u.href);return r.fulfill({path:'/tmp/habla-'+path.basename(u.pathname,'.mp4')+'.webm',contentType:'video/webm'});}
   const file=path.join(root,u.pathname.replace('/habla-ecuador/',''));
   return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();
  });
  await page.addInitScript(()=>{window.testMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>window.testMessages.push(m)}}};class Recognition{start(){window.testRecognition=this;}stop(){}abort(){this.onend?.()}}window.SpeechRecognition=Recognition;});
  if(process.env.HABLA_NATIVE_SCRIPT)await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});
  await page.goto(origin+'/habla-ecuador/index.html');
  await page.locator('.bottom-nav [data-open="lesson-view"]').click();
  const host=page.locator('#recorded-practice');await host.locator(':scope > summary').click();
  assert.equal(mediaRequests.length,0,'no network media until explicit play');
  const target=host.locator('.dictionary-practice-target');
  assert.equal(await target.textContent(),items[0].spanish);
  assert.match(await host.textContent(),/Quito/);assert.match(await host.textContent(),/not individual sounds/);
  for(const item of items){
   await host.locator('select#recorded-practice-region').selectOption(item.id);
   assert.equal(await target.textContent(),item.spanish);
   assert.equal(await host.locator('video').getAttribute('src'),null);
   await host.locator('#recorded-practice-play').click();
   try {await page.waitForFunction(()=>{const v=document.querySelector('#recorded-practice-video');return v.readyState>=2&&!v.paused},{},{timeout:8000});} catch(error) { console.log(await host.locator('video').evaluate(v=>({src:v.src,error:v.error?.message,paused:v.paused,ready:v.readyState,support:v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')})),await host.locator('#recorded-practice-status').textContent(),mediaRequests,errors);throw error;}
   assert.equal(await host.locator('#recorded-practice-play').getAttribute('aria-pressed'),'true');
   assert.equal(await host.locator('video').evaluate(v=>v.duration>30),true,'publisher content decoded via WebM test fixture');
   await host.locator('.dictionary-practice-mic').evaluate(el=>el.click());
   assert.equal(await host.locator('video').evaluate(v=>v.paused),true,'mic pauses native recording');
   assert.equal(await target.textContent(),item.spanish,'mic keeps phrase visible');
   await page.evaluate(({text,native})=>{
    if(native){const m=testMessages.findLast(m=>m.action==='start');window.__hablaNativeSpeech({id:m.id,type:'result',text,final:true});window.__hablaNativeSpeech({id:m.id,type:'end'});}
    else{const r=testRecognition,result=[{transcript:text}];result.isFinal=true;r.onresult({results:[result]});r.onend?.();}
   },{text:item.spanish,native:Boolean(process.env.HABLA_NATIVE_SCRIPT)});
   assert.match(await host.locator('.dictionary-practice-score').textContent(),/100%/);
   assert.match(await host.locator('.dictionary-practice-score').textContent(),/not a pronunciation score/);
  }
  await host.locator('#recorded-practice-play').click();await page.waitForFunction(()=>!document.querySelector('#recorded-practice-video').paused);
  await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
  assert.equal(await host.locator('video').evaluate(v=>v.paused),true,'tab change pauses original');
  await page.locator('.bottom-nav [data-open="lesson-view"]').click();
  await host.locator('#recorded-practice-play').click();await page.waitForFunction(()=>!document.querySelector('#recorded-practice-video').paused);
  await host.locator(':scope > summary').click();await page.waitForFunction(()=>document.querySelector('#recorded-practice-video').paused);
  await host.locator(':scope > summary').click();
  await host.locator('video').evaluate(v=>v.dispatchEvent(new Event('error')));
  assert.match(await host.locator('#recorded-practice-status').textContent(),/unavailable/);
  assert.equal(await target.textContent(),items[3].spanish);
  assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width));
  assert.deepEqual(errors,[]);
  if(width===390)await page.screenshot({path:'/tmp/habla-recorded-practice.png'});
  await context.close();
 }
 console.log('Recorded practice: four publisher-derived WebM test fixtures played (production H.264/AAC verified separately), no autoplay/preload, four visible prompts, mic feedback and playback exclusion, tab/close cleanup, error fallback and 390/320px passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
