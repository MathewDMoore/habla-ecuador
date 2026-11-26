// Regression: ordinary photo controls must identify objects, not run OCR.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright'),root=path.resolve(__dirname,'..');
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 const browser=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.HABLA_BROWSER_PATH||undefined,args:['--no-sandbox']}:{});
 try{for(const entry of ['index.html','translator.html']){
  const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   localStorage.setItem('habla-tutorial-seen-v2','1');window.ocrCalls=0;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{}});
   window.mobilenet={load:async()=>({classify:async()=>[{className:'mouse',probability:.95}]})};
   window.tf={ready:async()=>{}};
   window.cocoSsd={load:async()=>({detect:async()=>[{class:'mouse',score:.96,bbox:[10,10,100,80]}]})};
   window.Tesseract={createWorker:async()=>({recognize:async()=>{window.ocrCalls++;return {data:{text:'MA NN 4 MN AZ',confidence:24}};},terminate:async()=>{}})};
  });
  await page.route('**/*',r=>{
   const u=new URL(r.request().url());if(['blob:','data:'].includes(u.protocol))return r.continue();
   if(u.hostname==='api.mymemory.translated.net')return r.fulfill({json:{responseData:{translatedText:'ratón de computadora'},responseStatus:200}});
   if(u.origin!=='https://habla.test')return r.abort();
   const f=path.resolve(root,u.pathname.slice(1)||'index.html');return f.startsWith(root+path.sep)&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.abort();
  });
  await page.goto('https://habla.test/'+entry+'?start=translate&ui=en');
  const countries=page.locator('#spanish-country-coverage');
  await countries.locator('summary').click();assert.match(await countries.innerText(),/Venezuela/);
  await page.locator('#source-language-select').selectOption('en-US');await page.locator('#target-language-select').selectOption('es-EC');
  assert.equal(await countries.isVisible(),true);
  await page.locator('#source-language-select').selectOption('es-VE');await page.locator('#target-language-select').selectOption('en-US');assert.equal(await countries.isVisible(),true);
  assert.equal(await page.locator('#image-task').inputValue(),'objects');
  const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=200;c.height=200;return c.toDataURL().split(',')[1];});
  const file={name:'mouse.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')};
  for(const button of ['#quick-choose-image','#quick-camera-image','#quick-paste-image']){
   const pending=page.waitForEvent('filechooser');await page.locator(button).click();await (await pending).setFiles(file);
   const dialog=page.locator('.object-identifier');await dialog.waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('[data-objects-results]').textContent.includes('ratón'));
   assert.match(await dialog.locator('.object-detection-box').innerText(),/computer mouse — ratón de computadora/);
   assert.equal(await page.evaluate(()=>ocrCalls),0);assert.equal(await page.locator('#photo-translator').isVisible(),false);
   await dialog.locator('[data-objects-close]').click();
  }
  await page.locator('#translator-input').fill('Keep my original text.');
  await page.locator('#image-task').selectOption('text');
  async function readUncertain(){const pending=page.waitForEvent('filechooser');await page.locator('#quick-choose-image').click();await (await pending).setFiles(file);await page.locator('#image-text-review').waitFor({state:'visible'});}
  await readUncertain();assert.equal(await page.locator('#translator-input').inputValue(),'Keep my original text.');assert.equal(await page.locator('#photo-translator').isVisible(),false);
  await page.locator('#image-text-draft').fill('Reviewed wording.');await page.locator('#use-reviewed-image-text').click();assert.equal(await page.locator('#translator-input').inputValue(),'Reviewed wording.');
  await readUncertain();await page.locator('#translator-input').fill('Newer source.');await page.locator('#use-reviewed-image-text').click();assert.equal(await page.locator('#translator-input').inputValue(),'Newer source.');
  await readUncertain();await page.locator('#identify-reviewed-image').click();await page.waitForFunction(()=>document.querySelector('[data-objects-results]').textContent.includes('ratón'));
  assert.equal(await page.locator('#image-text-review').isVisible(),false);
  assert.deepEqual(errors,[]);await page.close();
 }}finally{await browser.close();}
 console.log('Both pages passed: Spanish countries in both directions; saved/camera/paste object routing; mouse label; uncertain OCR review, source protection and object retry. Detection/OCR/translation responses stubbed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
