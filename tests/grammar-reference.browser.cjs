// Native browser check for the bilingual grammar sheet on both Habla entrypoints.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
(async()=>{
 const browser=await playwright[process.env.HABLA_BROWSER_ENGINE||'chromium'].launch();
 try{
  for(const file of ['index.html','translator.html']){
   const context=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,serviceWorkers:'block'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    const filename=path.join(root,url.pathname.replace('/habla-ecuador/',''));
    return url.origin===origin&&fs.existsSync(filename)&&fs.statSync(filename).isFile()?route.fulfill({path:filename}):route.abort();
   });
   await page.addInitScript(()=>localStorage.setItem('habla-tutorial-seen-v2','1'));
   await page.goto(origin+'/habla-ecuador/'+file+'?ui=en');
   await page.evaluate(()=>openView('translator-view'));
   await page.locator('#translator-input').fill('Quiero hablar contigo.');
   const trigger=page.locator('#translation-text-tools .grammar-reference-trigger');
   await trigger.click();
   const sheet=page.locator('#grammar-popout');
   assert.equal(await sheet.isVisible(),true,'grammar opens as a modal');
   await sheet.locator('#grammar-topic').selectOption('verbs');
   await sheet.locator('#grammar-verb').selectOption('tener');
   await sheet.locator('#grammar-tense').selectOption('subjunctive');
   assert.deepEqual(await sheet.locator('.grammar-form').allTextContents(),['tenga','tengas','tenga','tengamos','tengáis','tengan']);
   await sheet.locator('.grammar-close').click();
   assert.equal(await sheet.isVisible(),false,'grammar closes');
   assert.equal(await page.locator('#translator-input').inputValue(),'Quiero hablar contigo.','preserves translation source');
   await page.evaluate(()=>openView('lesson-view'));
   await page.locator('.grammar-practice-entry .grammar-reference-trigger').click();
   await sheet.locator('#grammar-topic').selectOption('questions');
   assert.match(await sheet.locator('#grammar-content').textContent(),/¿Dónde está/);
   await page.keyboard.press('Escape');
   assert.equal(await sheet.isVisible(),false,'Escape dismisses the reference');
   assert.deepEqual(errors,[],'no JavaScript crashes');
   await context.close();
   console.log(file+': grammar table, modal, lesson entry, Escape and text preservation passed');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
