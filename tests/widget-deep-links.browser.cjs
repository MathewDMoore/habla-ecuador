// Verify WidgetKit shortcut destinations resolve to the right hosted app tab.
const assert = require('node:assert/strict');
const fs = require('node:fs'),path = require('node:path');
const playwright = require(process.env.HABLA_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const origin = 'https://mathewdmoore.github.io';
const routes = [['translate','translator-view'],['practice','lesson-view'],['dictionary','dictionary-view']];
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 const browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{
  for(const [route,view] of routes){
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/*',req=>{
    const u=new URL(req.request().url());
    const file=path.resolve(root,decodeURIComponent(u.pathname.replace('/habla-ecuador/',''))||'index.html');
    if(u.origin===origin&&u.pathname.startsWith('/habla-ecuador/')&&file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile())return req.fulfill({path:file});
    return req.abort();
   });
   await page.addInitScript(()=>localStorage.setItem('habla-tutorial-seen-v2','1'));
   await page.goto(origin+'/habla-ecuador/index.html?start='+route);
   await page.waitForFunction(view=>document.getElementById(view)?.classList.contains('active'),view);
   assert.equal(await page.locator('.view.active').getAttribute('id'),view,route+' route');
   assert.deepEqual(errors,[],route+' has no JavaScript error');
   await context.close();
  }
  // The new widget shortcut must reopen the tutorial even after dismissal.
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',req=>{
   const u=new URL(req.request().url());
   const file=path.resolve(root,decodeURIComponent(u.pathname.replace('/habla-ecuador/',''))||'index.html');
   if(u.origin===origin&&u.pathname.startsWith('/habla-ecuador/')&&file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile())return req.fulfill({path:file});
   return req.abort();
  });
  await page.addInitScript(()=>localStorage.setItem('habla-tutorial-seen-v2','1'));
  await page.goto(origin+'/habla-ecuador/index.html?tour=1');
  await page.waitForSelector('#tutorial-overlay:not([hidden])');
  assert.equal(await page.locator('#tutorial-title').textContent(),'Welcome to Habla Ecuador');
  assert.equal(await page.locator('#tutorial-close').textContent(),'Close / Cerrar');
  await page.locator('#tutorial-close').click();
  assert.equal(await page.locator('#tutorial-overlay').isVisible(),false);
  assert.deepEqual(errors,[],'widget Tutorial route has no JS error');
  for(const file of ['index.html','translator.html']){
   await page.goto(origin+'/habla-ecuador/'+file+'?tour=home-screen&ui=es');
   await page.waitForSelector('#tutorial-overlay:not([hidden])');
   assert.equal(await page.locator('#tutorial-progress').textContent(),'1 / 2');
   assert.equal(await page.locator('#home-screen-preview img').evaluate(el=>el.complete&&el.naturalWidth>0),true);
   assert.match(await page.locator('#tutorial-spanish').textContent(),/Safari/);
   await page.locator('#tutorial-next').click();
   assert.equal(await page.locator('#tutorial-progress').textContent(),'2 / 2');
   assert.equal(await page.locator('#home-screen-preview').getAttribute('data-art'),'widget');
   assert.match(await page.locator('#tutorial-english').textContent(),/native app must be installed first/);
   assert.match(await page.locator('#tutorial-spanish').textContent(),/Todavía no hay un enlace público/);
   await page.locator('#tutorial-next').click();
   assert.equal(await page.locator('#tutorial-overlay').isVisible(),false);
   await page.locator('#home-button').click();
   await page.locator('.app-sharing summary').click();
   await page.locator('[data-home-screen-help]').click();
   assert.equal(await page.locator('#tutorial-progress').textContent(),'1 / 2');
   await page.locator('#tutorial-close').click();
   assert.deepEqual(errors,[],'shared setup guide has no JS error');
  }
  await context.close();
  console.log('Widget shortcut Translate/Practice/Dictionary/Tutorial routes passed in '+engine);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
