const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [390,320]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
  if(process.env.HABLA_NATIVE_SCRIPT)await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});
  await page.addInitScript(()=>localStorage.setItem('habla-slang-contributions-v1',JSON.stringify([{id:'legacy-report',region:'Venezuela',city:'Caracas',term:'Synthetic old report',meaning:'Synthetic meaning',example:'Synthetic original example'}])));
  await page.goto(origin+'/habla-ecuador/index.html');await page.locator('[data-open="dictionary-view"]').first().click();
  assert.equal(await page.locator('#regional-slang-region').inputValue(),'es-EC');
  const cards=page.locator('#regional-slang-results .regional-slang-card');
  await page.locator('#regional-usage-type').selectOption('idiom');assert.ok(await cards.count()>0);
  assert.match(await cards.first().textContent(),/Idiom \/ fixed expression/);assert.match(await cards.filter({hasText:'me vale verga'}).first().textContent(),/Strong vulgarity/);assert.match(await cards.first().textContent(),/Ecuador/);
  await page.locator('#regional-slang-region').selectOption('es-VE');assert.equal(await cards.count(),0);assert.match(await page.locator('#regional-slang-count').textContent(),/No entries/);
  await page.locator('#regional-usage-type').selectOption('all');await page.locator('#regional-slang-search').fill('chamo');assert.match(await cards.first().textContent(),/Caracas-specific review pending/);assert.equal(await cards.first().locator('.regional-usage-scope').count(),1);
  await page.locator('#regional-slang-search').fill('');await page.locator('#regional-slang-region').selectOption('monterrey');assert.match(await cards.first().textContent(),/City evidence: Monterrey, Nuevo León/);
  await page.locator('#regional-slang-region').selectOption('es-MX');await page.locator('#regional-usage-type').selectOption('idiom');await page.locator('#regional-slang-tone').selectOption('mild');assert.equal(await cards.count(),0,'vulgar fixed expressions stay excluded by tone');
  await page.locator('#regional-slang-tone').selectOption('all');await page.locator('#regional-usage-type').selectOption('all');await page.locator('#regional-slang-search').fill('chiro');assert.match(await cards.first().textContent(),/Ecuador: without money. Mexico: pretty/);if(width===390)await page.screenshot({path:'/tmp/habla-regional-usage.png'});
  await page.locator('#regional-slang-search').fill('');await page.locator('#regional-slang-region').selectOption('en-US');await page.locator('#regional-slang-target').selectOption('es-MX');await page.locator('#regional-usage-type').selectOption('idiom');assert.ok(await cards.count()>0);
  await page.locator('#regional-usage-type').selectOption('clinical');assert.ok(await cards.count()>0);assert.match(await cards.first().textContent(),/regional naturalness not established/);
  assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width));
  await page.locator('.review-callout').click();await page.locator('#slang-contributions summary').click();await page.locator('#slang-contribution-list button').first().click();assert.match(await page.locator('#slang-contribution-export').inputValue(),/usage: Not specified \/ unsure/,'old reports remain readable');await page.locator('[name=usage]').selectOption('Idiom / fixed expression');assert.equal(await page.locator('[name=register]').inputValue(),'Unsure','type does not imply tone');
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('Regional usage UI: independent type/region/tone/English filters, country contrasts, city uncertainty, clinical limits, contribution types and narrow layouts passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
