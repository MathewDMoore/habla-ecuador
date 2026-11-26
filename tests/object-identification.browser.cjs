const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const playwright = require(process.env.HABLA_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const engine=process.env.HABLA_BROWSER_ENGINE || 'chromium';
  const browser = await playwright[engine].launch(engine==='chromium'?{executablePath: process.env.HABLA_BROWSER_PATH || undefined, args:['--no-sandbox']}:{});
  try {
    for (const entry of ['index.html', 'translator.html']) {
      const page = await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        localStorage.setItem('habla-tutorial-seen-v2','1');
        window.mobilenet={load:async()=>({classify:async()=>[{className:"jack-o'-lantern",probability:window.uncertainPhoto?.1:.94}]})};
        window.tf = {ready:async()=>{}};
        window.cocoSsd = {load:async()=>({detect:async()=>{
          if(window.delayDetection) await new Promise(resolve=>{window.finishDetection=resolve;});
          if(window.noDetections)return [];
          return [{class:'bottle',score:.92,bbox:[10,20,60,100]}];
        }})};
      });
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.protocol === 'blob:' || url.protocol === 'data:') return route.continue();
        if(url.hostname === 'api.mymemory.translated.net') return route.fulfill({json:{responseData:{translatedText:'botella'},responseStatus:200}});
        if(url.origin !== 'https://habla.test') return route.abort();
        const file = path.resolve(root, url.pathname.slice(1) || 'index.html');
        if(!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.abort();
        return route.fulfill({path:file});
      });
      await page.goto('https://habla.test/'+entry+'?start=translate&ui=en');
      await page.locator('#quick-identify-objects').click();
      const dialog = page.locator('.object-identifier');
      await dialog.waitFor({state:'visible'});
      const png = await page.evaluate(()=>{const c=document.createElement('canvas');c.width=200;c.height=200;return c.toDataURL().split(',')[1];});
      const file = {name:'objects.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')};
      await dialog.locator('[data-objects-file]').setInputFiles(file);
      await page.waitForFunction(()=>document.querySelector('[data-objects-results]').textContent.includes('botella'));
      assert.equal(await dialog.locator('.object-detection-box').count(),1);
      assert.match(await dialog.locator('.object-detection-box').innerText(),/bottle — botella · 92%/);
      assert.equal(await dialog.locator('.object-detection-box').evaluate(e=>e.style.left),'5%');
      // Camera and saved images use the same recognition entry point.
      await dialog.locator('[data-objects-camera-file]').setInputFiles(file);
      await page.waitForFunction(()=>document.querySelector('[data-objects-status]').textContent.includes('Detection complete'));
      await page.evaluate(()=>{window.noDetections=true;});
      await dialog.locator('[data-objects-file]').setInputFiles(file);
      await page.waitForFunction(()=>document.querySelector('[data-objects-results]').textContent.includes('carved pumpkin'));
      assert.equal(await dialog.locator('.object-detection-box').count(),0,'whole-photo classifier does not invent an object location');
      assert.match(await dialog.locator('[data-objects-status]').innerText(),/whole photo/);
      await page.evaluate(()=>{window.uncertainPhoto=true;});
      await dialog.locator('[data-objects-file]').setInputFiles(file);
      await page.waitForFunction(()=>document.querySelector('[data-objects-status]').textContent.includes('No reliable match'));
      assert.equal(await dialog.locator('[data-objects-results]').innerText(),'');
      await page.evaluate(()=>{window.noDetections=false;window.delayDetection=true;});
      await dialog.locator('[data-objects-file]').setInputFiles(file);
      await page.waitForFunction(()=>typeof window.finishDetection === 'function');
      await dialog.locator('[data-objects-close]').click();
      await page.evaluate(()=>window.finishDetection());
      await page.locator('#quick-identify-objects').click();
      assert.equal(await dialog.locator('.object-detection-box').count(),0);
      assert.equal(await dialog.locator('[data-objects-results]').innerText(),'');
      assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log('Object identification passed on both entry pages: saved/camera images, bilingual boxes, scores, and closed-session cancellation. Detector and translation responses were stubbed.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
