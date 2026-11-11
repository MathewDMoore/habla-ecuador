/* Actual Tesseract + actual video frames; only the camera and provider are synthetic. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright'),root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const page=await context.newPage(),failures=[];let requests=0;
 page.on('requestfailed',request=>failures.push({url:request.url(),error:request.failure()?.errorText}));
 await page.addInitScript(()=>{
  localStorage.setItem('habla-tutorial-seen-v2','1');
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{
   const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=600;const ctx=canvas.getContext('2d');
   const draw=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,1000,600);ctx.fillStyle='#101010';ctx.font='bold 68px sans-serif';ctx.fillText('OPEN DAILY',100,220);};draw();
   const timer=setInterval(draw,120),stream=canvas.captureStream(12),track=stream.getVideoTracks()[0],stop=track.stop.bind(track);
   track.stop=()=>{clearInterval(timer);stop();};window.__realOcrStream=stream;return stream;
  }}});
 });
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(['blob:','data:'].includes(url.protocol)||['cdn.jsdelivr.net','tessdata.projectnaptha.com','raw.githubusercontent.com'].includes(url.hostname))return route.continue();
  if(url.hostname==='api.mymemory.translated.net'){requests++;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({responseData:{translatedText:'Abierto todos los días.'},responseStatus:200})});}
  if(url.origin!==origin||!url.pathname.startsWith('/habla-ecuador/'))return route.abort();
  const file=path.resolve(root,url.pathname.slice('/habla-ecuador/'.length)||'index.html');
  return file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.abort();
 });
 try{
  await page.goto(origin+'/habla-ecuador/index.html?start=translate&ui=en');
  await page.locator('#source-language-select').selectOption('en-US');await page.locator('#target-language-select').selectOption('es-EC');
  await page.locator('#quick-live-camera').click();
  await page.waitForFunction(()=>document.querySelector('#live-camera-translator .photo-translation-label')?.textContent.includes('Abierto'),{},{timeout:90000});
  const label=page.locator('#live-camera-translator .photo-translation-label').first();
  assert.match(await label.getAttribute('aria-label'),/OPEN\s+DAILY/,'actual OCR recognizes the text from the running video');
  const style=await label.evaluate(el=>({background:getComputedStyle(el).backgroundColor,opacity:Number(getComputedStyle(el).opacity)}));
  assert.equal(style.background,'rgba(0, 0, 0, 0)');assert.equal(style.opacity,.65);
  assert.ok(await label.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=14),'short translations remain legible over the original');
  assert.ok(requests>0,'recognized camera words reach the translator');
  assert.equal(await page.locator('#live-camera-translator video').evaluate(video=>video.paused),false);
  if(process.env.HABLA_CAMERA_REAL_SCREENSHOT)await page.screenshot({path:process.env.HABLA_CAMERA_REAL_SCREENSHOT});
  await page.locator('[data-camera-close]').click();assert.equal(await page.evaluate(()=>__realOcrStream.getTracks().every(t=>t.readyState==='ended')),true);
  console.log(engine+': actual Tesseract recognizes OPEN DAILY from continuous video, obtains a translation and renders it translucently over the original');
 }catch(error){
  console.error('Camera state:',await page.locator('[data-camera-status]').textContent().catch(()=>''));console.error('Failed network requests:',failures.slice(-12));
  if(process.env.HABLA_CAMERA_REAL_SCREENSHOT)await page.screenshot({path:process.env.HABLA_CAMERA_REAL_SCREENSHOT}).catch(()=>{});throw error;
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
