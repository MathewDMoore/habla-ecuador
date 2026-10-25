// Real lesson DOM and cleanup; publisher playback and recognition are mocked.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
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
  HTMLMediaElement.prototype.play=function(){this.mockPlaying=true;this.dispatchEvent(new Event('play'));return Promise.resolve();};
  HTMLMediaElement.prototype.pause=function(){this.mockPlaying=false;this.dispatchEvent(new Event('pause'));};
  Object.defineProperty(HTMLMediaElement.prototype,'paused',{get(){return !this.mockPlaying;}});
 });
 if(native)await page.addInitScript({path:native});
 await page.goto(origin+'/habla-ecuador/index.html?ui=es');
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 const host=page.locator('#recorded-practice');await host.locator(':scope > summary').click();
 assert.match(await host.locator(':scope > summary').textContent(),/Videolecciones de inglés/);
 assert.equal(await host.getAttribute('data-learning-language'),'en-US');
 assert.equal(await host.locator('.dictionary-practice-target').textContent(),'Nice to meet you.');
 assert.equal(await host.locator('#english-practice-video').getAttribute('src'),null);
 assert.equal(external.some(u=>/akamaized|youtube/.test(u)),false,'no provider request before Play');
 await host.locator('#english-video-play').click();
 assert.match(await host.locator('video').getAttribute('src'),/voa-video-ns/);
 assert.equal(await page.evaluate(()=>HablaRecordedPractice.isPlaying()),true);
 await host.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 assert.equal(await page.evaluate(()=>testMessages.findLast(m=>m.action==='start').lang),'en-US');
 assert.equal(await host.locator('video').evaluate(v=>v.paused),true,'practice microphone stops the English video');
 await page.locator('#lesson-language').selectOption('en-GB');
 assert.equal(await page.evaluate(()=>recognition),null,'learning change stops English practice capture');
 assert.equal(await host.getAttribute('data-learning-language'),'en-GB');
 assert.equal(await host.locator('.dictionary-practice-target').textContent(),"I'm learning English.");
 assert.equal(await host.locator('iframe').count(),0,'UK player is lazy');
 await host.locator('#english-video-play').click();
 assert.match(await host.locator('iframe').getAttribute('src'),/youtube.com\/embed\/3lzLacwh8Xc/);
 assert.equal(await page.evaluate(()=>HablaRecordedPractice.isPlaying()),true);
 await host.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 assert.equal(await page.evaluate(()=>testMessages.findLast(m=>m.action==='start').lang),'en-GB');
 assert.equal(await host.locator('iframe').count(),0,'mic removes publisher frame, stopping all embedded audio');
 await host.locator('#english-video-play').click();
 await page.locator('#interface-language').selectOption('en');
 assert.equal(await host.getAttribute('data-learning-language'),'en-GB','explicit learning setting survives UI language change');
 assert.equal(await host.locator('iframe').count(),1,'interface-only changes preserve current player');
 await page.locator('.bottom-nav [data-open="dictionary-view"]').click();assert.equal(await host.locator('iframe').count(),0,'navigation stops embedded video');
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 await host.locator('#english-video-play').click();await host.locator(':scope > summary').click();
 await page.waitForFunction(()=>!document.querySelector('#english-video-player iframe'));
 await host.locator(':scope > summary').click();await host.locator('#english-video-play').click();
 await page.locator('#lesson-language').selectOption('es-EC');
 assert.equal(await host.locator('iframe').count(),0,'direction change removes old player');
 assert.equal(await host.locator('#recorded-practice-region').inputValue(),'quito-interests');
 assert.match(await host.locator('.dictionary-practice-target').textContent(),/Hay cuatro cosas/);
 await host.locator('#recorded-practice-region').selectOption('lapaz-family');
 await page.locator('#lesson-language').selectOption('en-US');
 await page.locator('#lesson-language').selectOption('es-EC');
 assert.equal(await host.locator('#recorded-practice-region').inputValue(),'lapaz-family','Spanish regional choice survives direction changes');
 await page.locator('#lesson-language').selectOption('en-US');
 await host.locator('video').evaluate(v=>v.dispatchEvent(new Event('error')));
 assert.match(await host.locator('#english-video-status').textContent(),/could not play/);
 assert.equal(await host.locator('.dictionary-practice-target').textContent(),'Nice to meet you.');
 await page.locator('#lesson-language').selectOption('');
 assert.equal(await host.getAttribute('data-learning-language'),'es-EC');
 await page.locator('#interface-language').selectOption('es');
 assert.equal(await host.getAttribute('data-learning-language'),'en-US','automatic video language follows app language');
 await page.reload();await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 assert.equal(await host.getAttribute('data-learning-language'),'en-US','saved automatic choice survives reload');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 if(process.env.HABLA_SCREENSHOT_DIR){await host.locator(':scope > summary').click();await page.screenshot({path:path.join(process.env.HABLA_SCREENSHOT_DIR,`video-lesson-${width}.png`)});}
 console.log(`${process.env.HABLA_BROWSER_ENGINE||'chromium'} ${width}px ${native?'native bridge':'browser'}: video settings, lazy players, English capture locales, cleanup, Spanish retention and fallback passed`);
 await context.close();
 }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
