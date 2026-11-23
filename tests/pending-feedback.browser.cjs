// A correction mark is a local unverified report, never a dictionary edit or
// automatic network submission. Exercise real in-app buttons in WebKit/Chromium.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const origin='https://mathewdmoore.github.io';
const root=path.resolve(__dirname,'..');
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'webkit';
 const browser=await playwright[engine].launch({headless:true});
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   const local=path.join(root,decodeURIComponent(url.pathname.replace('/habla-ecuador/',''))||'index.html');
   return url.origin===origin&&url.pathname.startsWith('/habla-ecuador/')
    &&fs.existsSync(local)&&fs.statSync(local).isFile()
    ?route.fulfill({path:local}):route.abort();
  });
  await page.addInitScript(()=>{
   localStorage.setItem('habla-tutorial-seen-v2','1');
   window.feedbackShares=[];
   Object.defineProperty(navigator,'share',{configurable:true,value:async data=>feedbackShares.push(data)});
  });
  await page.goto(origin+'/habla-ecuador/index.html?start=translate');
  await page.evaluate(()=>{
   document.querySelector('#translator-input').value='Confidential synthetic example';
   const result=document.querySelector('#translation-result');
   result.hidden=false;
   document.querySelector('#natural-result').textContent='Synthetic draft';
  });
  await page.locator('[data-feedback-topic="translation"][data-feedback-flag="true"]').click();
  assert.equal(await page.locator('#app-feedback').isVisible(),true);
  assert.match(await page.locator('#app-feedback-form [name="problem"]').inputValue(),/Please check this item/);
  assert.equal(await page.locator('#feedback-details').getAttribute('open'),'');
  await page.locator('#app-feedback-form [name="speakerRole"]').selectOption('native');
  await page.locator('#app-feedback-form [name="reference"]').fill('Synthetic translation to review');
  await page.locator('#app-feedback-form [name="correction"]').fill('Proposed sense needs independent support');
  await page.locator('#feedback-mark-pending').click();
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('habla-feedback-pending-review-v1')));
  assert.equal(saved.length,1,'one marked correction is saved locally');
  assert.equal(saved[0].report.speakerRole,'native');
  assert.equal(saved[0].report.includeText,false,'private text requires opt-in');
  assert.equal(saved[0].report.source,'');
  assert.equal(saved[0].report.translation,'');
  assert.equal(await page.evaluate(()=>feedbackShares.length),0,'marking never sends the report');
  assert.match(await page.locator('#feedback-pending-count').textContent(),/1 pending/);
  assert.match(await page.locator('#feedback-preview').inputValue(),/Native speaker \(self-reported\)/);
  assert.match(await page.locator('#feedback-preview').inputValue(),/PENDING RESEARCH REVIEW/);
  await page.locator('#feedback-share').click();
  assert.equal(await page.evaluate(()=>feedbackShares.length),1,'only explicit Share sends to the system share sheet');
  await page.locator('#feedback-close').click();
  await page.reload();
  await page.locator('.feedback-open').click();
  assert.equal(await page.locator('.feedback-pending-row').count(),1,'flag survives reload on the same device');
  await page.locator('.feedback-pending-row button').first().click();
  assert.equal(await page.locator('#app-feedback-form [name="speakerRole"]').inputValue(),'native');
  await page.locator('#app-feedback-form [name="correction"]').fill('Revised proposal still unverified');
  await page.locator('#feedback-mark-pending').click();
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('habla-feedback-pending-review-v1')));
  assert.equal(saved.length,1,'editing an existing flag updates rather than duplicates');
  assert.match(saved[0].report.correction,/Revised proposal/);
  await page.locator('.feedback-pending-row button').last().click();
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('habla-feedback-pending-review-v1')));
  assert.equal(saved.length,0,'explicit remove deletes only the selected flag');
  assert.deepEqual(errors,[],'no browser JavaScript exceptions');
  await ctx.close();
  console.log(engine+': native-speaker correction flags, local pending queue, opt-in privacy and explicit sharing passed');
 } finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
