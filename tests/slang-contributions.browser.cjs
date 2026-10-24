const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io',url=origin+'/habla-ecuador/index.html';
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [390,320]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
  await page.addInitScript(()=>{window.copies=[];window.shares=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.copies.push(text)}});Object.defineProperty(navigator,'share',{configurable:true,writable:true,value:async data=>window.shares.push(data)});});
  if(process.env.HABLA_NATIVE_SCRIPT)await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});
  await page.goto(url);await page.locator('[data-open="dictionary-view"]').first().click();await page.locator('.review-callout').click();await page.locator('#slang-contributions summary').click();
  const form=page.locator('#slang-contribution-form');
  await form.locator('[name=region]').selectOption({label:'Venezuela'});await form.locator('[name=city]').fill('Caracas');await page.locator('#slang-prompt-next').click();assert.match(await page.locator('#slang-contribution-prompt').textContent(),/Venezuela · Caracas/);
  await form.locator('[name=term]').fill('<img src=x onerror=alert(1)>');await form.locator('[name=meaning]').fill('Synthetic test meaning');await form.locator('[name=example]').fill('An original synthetic test sentence.');await form.locator('[name=assessment]').selectOption({label:'I use or hear this locally'});await form.locator('[name=evidence]').fill('Self-reported example only, source not checked.');
  await form.locator('[type=submit]').click();assert.match(await page.locator('#slang-contribution-status').textContent(),/Saved on this device/);assert.equal(await page.locator('#slang-contribution-list img').count(),0);
  await page.evaluate(()=>{document.querySelector('#translator-input').value='Synthetic private source';localStorage.setItem('private-test','do not share');});
  await page.locator('#slang-contribution-copy').click();const copied=await page.evaluate(()=>copies.at(-1));assert.match(copied,/UNVERIFIED USER REPORT/);assert.match(copied,/Caracas/);assert.ok(!copied.includes('Synthetic private source')&&!copied.includes('do not share'));
  await page.locator('#slang-contribution-share').click();assert.equal(await page.evaluate(()=>shares.length),1);assert.equal((await page.evaluate(()=>shares[0])).text,copied);
  await page.evaluate(()=>navigator.share=async()=>{throw {name:'AbortError'}});await page.locator('#slang-contribution-share').click();assert.match(await page.locator('#slang-contribution-status').textContent(),/cancelled/);assert.equal(await page.evaluate(()=>copies.length),1);
  await page.reload();await page.locator('[data-open="dictionary-view"]').first().click();await page.locator('.review-callout').click();await page.locator('#slang-contributions summary').click();
  await page.locator('#slang-contribution-list button').first().click();assert.equal(await form.locator('[name=city]').inputValue(),'Caracas');
  await form.locator('[name=task]').selectOption('check');await form.locator('[name=meaning]').fill('Corrected test meaning');await form.locator('[type=submit]').click();assert.equal(await page.locator('#slang-contribution-list button').count(),2,'edit updates existing record');
  await page.locator('#slang-contribution-new').click();assert.equal(await form.locator('[name=term]').inputValue(),'');await page.locator('#slang-contribution-list button').first().click();
  await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('full')}});await form.locator('[name=meaning]').fill('Unsaved edit');await form.locator('[type=submit]').click();assert.match(await page.locator('#slang-contribution-status').textContent(),/Not saved/);assert.equal(await form.locator('[name=meaning]').inputValue(),'Unsaved edit');
  await page.evaluate(()=>navigator.clipboard.writeText=async()=>{throw Error('blocked')});await page.locator('#slang-contribution-copy').click();assert.match(await page.locator('#slang-contribution-status').textContent(),/selected/);assert.match(await page.locator('#slang-contribution-export').inputValue(),/Corrected test meaning/,'exports last saved version');
  assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width),'no horizontal overflow');assert.deepEqual(errors,[]);
  if(width===390)await page.screenshot({path:'/tmp/habla-slang-contributions.png'});
  await page.locator('#slang-contribution-list button').nth(1).click();assert.match(await page.locator('#slang-contribution-status').textContent(),/Not saved/,'deletion reports storage failure');
  await page.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);await page.locator('#slang-contribution-list button').nth(1).click();assert.equal(await page.locator('#slang-contribution-list button').count(),0);assert.equal(await page.locator('#slang-contribution-export').inputValue(),'');
  await context.close();
 }
 console.log('Slang contributions: regional prompts, local save/reload/edit, escaped rendering, public-review uncertainty, explicit sharing/cancel, private-data exclusion, storage failure and narrow layout passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
