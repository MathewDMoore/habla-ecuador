// Real lesson DOM, synthetic recognition and publisher-player boundaries.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
const {englishCatalog}=require('../recorded-practice.js');
(async()=>{
 for(const [width,native] of [[390,null],[320,null],...(process.env.HABLA_NATIVE_SCRIPT?[[390,process.env.HABLA_NATIVE_SCRIPT]]:[])]){
 const browser=await playwright[process.env.HABLA_BROWSER_ENGINE||'chromium'].launch();
 try{
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const u=new URL(route.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  if(u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()&&!f.endsWith('.mp3'))return route.fulfill({path:f});
  external.push(u.href);if(u.hostname==='www.youtube.com')return route.fulfill({body:'<!doctype html><title>Publisher player fixture</title>',contentType:'text/html'});
  return route.abort();
 });
 await page.addInitScript(()=>{
  window.testMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>testMessages.push(m)}}};
  class Recognition{start(){window.testRecognition=this;testMessages.push({action:'start',lang:this.lang});}stop(){}abort(){}}
  window.SpeechRecognition=Recognition;
 });
 if(native)await page.addInitScript({path:native});
 await page.goto(origin+'/habla-ecuador/index.html?ui=es');
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 const host=page.locator('#recorded-practice');await host.locator(':scope > summary').click();
 assert.match(await host.locator(':scope > summary').textContent(),/Videolecciones de inglés/);
 assert.equal(external.some(u=>/youtube/.test(u)),false,'no provider request before Play');
 for(const locale of ['en-US','en-GB']){
  await page.locator('#lesson-language').selectOption(locale);
  assert.equal(await host.getAttribute('data-learning-language'),locale);
  assert.equal(await host.locator('#english-video-select option').count(),2);
  for(const item of englishCatalog[locale]){
   await host.locator('#english-video-select').selectOption(item.id);
   assert.equal(await host.locator('.dictionary-practice-target').textContent(),item.phrase);
   assert.match(await host.locator('#english-video-duration').textContent(),new RegExp(item.seconds+' s'));
   assert.equal(await host.locator('#english-video-guide [lang="es"]').textContent(),item.guide);
   assert.equal(await host.locator('iframe').count(),0,'clip selection never autoplays');
   if(native){
    assert.match(await host.locator('#english-video-play').getAttribute('href'),new RegExp(item.videoId));
    assert.match(await host.locator('#english-video-status').textContent(),/navegador/);
   }else{
    await host.locator('#english-video-play').click();
    assert.match(await host.locator('iframe').getAttribute('src'),new RegExp('/embed/'+item.videoId));
    assert.equal(await page.evaluate(()=>HablaRecordedPractice.isPlaying()),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'portrait player fits phone');
   }
   await host.locator('.dictionary-practice-mic').evaluate(el=>el.click());
   assert.equal(await page.evaluate(()=>testMessages.findLast(m=>m.action==='start').lang),locale);
   assert.equal(await host.locator('iframe').count(),0,'microphone stops publisher audio');
  }
 }
 // A different clip cancels old recognition and uses its own prompt.
 await host.locator('#english-video-select').selectOption(englishCatalog['en-GB'][0].id);
 assert.equal(await page.evaluate(()=>recognition),null);
 if(!native){
  await host.locator('#english-video-play').click();
  await page.locator('#interface-language').selectOption('en');
  assert.equal(await host.getAttribute('data-learning-language'),'en-GB');
  assert.equal(await host.locator('iframe').count(),1,'interface-only changes preserve current player');
  await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
  assert.equal(await host.locator('iframe').count(),0,'navigation stops embedded video');
  await page.locator('.bottom-nav [data-open="lesson-view"]').click();
  await host.locator('#english-video-play').click();await host.locator(':scope > summary').click();
  await page.waitForFunction(()=>!document.querySelector('#english-video-player iframe'));
  await host.locator(':scope > summary').click();
 }
 await page.locator('#lesson-language').selectOption('es-EC');
 assert.equal(await host.locator('#recorded-practice-region').inputValue(),'quito-interests');
 await host.locator('#recorded-practice-region').selectOption('lapaz-family');
 await page.locator('#lesson-language').selectOption('en-US');
 assert.equal(await host.locator('#english-video-select').inputValue(),englishCatalog['en-US'][1].id,'English choice retained independently');
 await page.locator('#lesson-language').selectOption('es-EC');
 assert.equal(await host.locator('#recorded-practice-region').inputValue(),'lapaz-family');
 await page.locator('#interface-language').selectOption('en');
 await page.locator('#lesson-language').selectOption('');
 assert.equal(await host.getAttribute('data-learning-language'),'es-EC');
 await page.locator('#interface-language').selectOption('es');
 assert.equal(await host.getAttribute('data-learning-language'),'en-US');
 await page.reload();await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 assert.equal(await host.getAttribute('data-learning-language'),'en-US','saved automatic choice survives reload');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 if(process.env.HABLA_SCREENSHOT_DIR){await host.locator(':scope > summary').click();await page.screenshot({path:path.join(process.env.HABLA_SCREENSHOT_DIR,`short-video-lesson-${width}${native?'-native':''}.png`)});}
 console.log(`${process.env.HABLA_BROWSER_ENGINE||'chromium'} ${width}px ${native?'native bridge':'browser'}: four short lessons, Spanish guides, durations, capture locales, lazy players/native source links, cleanup and retained choices passed`);
 await context.close();
 }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
