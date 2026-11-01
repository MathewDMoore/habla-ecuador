/* Reproduce iPhone Photos -> Habla OCR -> translation without manually pasting Live Text. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
const spanish='Y me ha dicho: Con mi gracia tienes más que suficiente, porque mi poder se perfecciona en la debilidad. (2 Corintios 12:9)';
const english='And he said to me: My grace is sufficient for you, because my power is made perfect in weakness. (2 Corinthians 12:9)';
const tinyPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9agGUYAAAAAASUVORK5CYII=','base64');
async function test(browser,entry){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(({spanish})=>{
  localStorage.setItem('habla-tutorial-seen-v2','1');
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});
  window.__ocrCalls=[];
  window.Tesseract={createWorker:async language=>({
    recognize:async image=>{window.__ocrCalls.push({language,width:image.width,height:image.height});return {data:{text:spanish,confidence:91}};},
    terminate:async()=>{}
  })};
 },{spanish});
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='api.mymemory.translated.net')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({responseData:{translatedText:english},responseStatus:200})});
  if(url.origin!==origin||!url.pathname.startsWith('/habla-ecuador/'))return route.abort();
  const file=path.resolve(root,decodeURIComponent(url.pathname.slice('/habla-ecuador/'.length))||'index.html');
  return file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.abort();
 });
 await page.goto(origin+'/habla-ecuador/'+entry+'?start=translate&ui=en');
 await page.locator('#source-language-select').selectOption('es-EC');
 await page.locator('#target-language-select').selectOption('en-US');
 await page.waitForFunction(()=>typeof HablaScreenshot==='object'&&Boolean(document.querySelector('#quick-choose-image')));
 assert.equal(await page.locator('#quick-choose-image').isVisible(),true,'Choose photo must be visible without opening import setup');
 assert.equal(await page.locator('#quick-paste-image').isVisible(),true,'Image paste control is visible');
 // Even when iOS blocks clipboard.read(), tapping Paste image should open
 // the Photos/file picker from the same gesture instead of doing nothing.
 const chooserPromise=page.waitForEvent('filechooser');
 await page.locator('#quick-paste-image').click();
 const chooser=await chooserPromise;
 await chooser.setFiles({name:'verse.png',mimeType:'image/png',buffer:tinyPng});
 await page.waitForFunction(spanish=>document.querySelector('#translator-input').value===spanish,spanish,{timeout:10000});
 await page.waitForFunction(english=>document.querySelector('#natural-result').textContent.includes(english),english,{timeout:10000});
 assert.equal(await page.locator('#translator-input').inputValue(),spanish);
 assert.match(await page.locator('#quick-image-status').textContent(),/Image translation ready/);
 assert.equal((await page.evaluate(()=>__ocrCalls))[0].language,'spa');
 assert.equal(await page.locator('#translation-result').isVisible(),true);
 assert.ok((await page.locator('#natural-result').textContent()).includes(english),'automatically translates imported photo without extra tap');
 // Large iPhone camera photos should be scaled, not rejected for >16MP.
 const big=await page.evaluate(async()=>{
  const c=document.createElement('canvas');c.width=4800;c.height=4000;
  const context=c.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,c.width,c.height);
  const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));
  const file=new File([blob],'iphone-photo.png',{type:'image/png'});
  const recognized=await HablaScreenshot.extract(file,{language:'spa',reader:window.Tesseract});
  return {text:recognized.text,call:window.__ocrCalls.at(-1)};
 });
 assert.equal(big.text,spanish);
 assert.ok(big.call.width*big.call.height<=10000000,'24MP+ photos downscale for phone OCR');
 assert.deepEqual(errors,[],'no app JS exceptions');
 await context.close();
 console.log(entry+': visible Photos picker, denied clipboard fallback, OCR, auto English translation and large photo downscale passed');
}
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{for(const entry of ['index.html','translator.html'])await test(browser,entry);}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
