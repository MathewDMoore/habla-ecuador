const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [390,320]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
  if(process.env.HABLA_NATIVE_SCRIPT)await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});
  await page.goto(origin+'/habla-ecuador/index.html');await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
  await page.evaluate(()=>{window.testSpoken=[];window.say=(text,lang)=>window.testSpoken.push({text,lang});});
  const region=page.locator('#regional-slang-region'),search=page.locator('#regional-slang-search'),cards=page.locator('#regional-slang-results .regional-slang-card');
  assert.equal(await region.inputValue(),'es-EC');await search.fill('llucho');assert.equal(await cards.count(),1);assert.match(await cards.first().textContent(),/naked \/ without clothes/);assert.match(await cards.first().textContent(),/native-speaker review/);
  assert.equal(await cards.first().locator('.expression-example').count(),1);assert.match(await cards.first().locator('.expression-example').textContent(),/U.S.:.*U.K.:/s);await cards.first().locator('.expression-example button').click();assert.equal((await page.evaluate(()=>testSpoken.at(-1))).lang,'es-EC');
  await cards.first().locator('.dictionary-practice summary').click();
  // Inspect whichever select the existing practice controller exposes.
  const selects=cards.first().locator('.dictionary-practice select');assert.ok(await selects.locator('option').count()>=2,'headword and full original example are practice options');
  await region.selectOption('es-BO');assert.equal(await cards.count(),1);assert.match(await cards.first().textContent(),/wool hat with earflaps/);assert.match(await cards.first().textContent(),/Entry covers: Bolivia/);
  await search.fill('atatay');assert.match(await cards.first().textContent(),/ow \/ ouch/);await region.selectOption('es-EC');assert.match(await cards.first().textContent(),/yuck \/ ugh/);
  await region.selectOption('es-VE');await search.fill('vaina');await page.locator('#regional-slang-tone').selectOption('mild');assert.equal(await cards.count(),0);await page.locator('#regional-slang-tone').selectOption('all');assert.match(await cards.first().textContent(),/Vulgar \/ context-sensitive/);
  await region.selectOption('en-US');await page.locator('#regional-slang-target').selectOption('es-EC');await search.fill('hangover');assert.ok(await cards.count()>0);assert.match(await cards.first().textContent(),/chuchaqui/);
  await page.locator('#regional-slang-target').selectOption('es-MX');await search.fill('cash');assert.match(await cards.first().textContent(),/lana/);
  await search.fill('chingon');assert.equal(await cards.count(),2);assert.match(await cards.allTextContents().then(x=>x.join(' ')),/ASALE labels this sense popular/);
  await page.locator('#regional-slang-target').selectOption('es-PE');await search.fill('embarrassment');assert.equal(await cards.count(),1);assert.match(await cards.first().textContent(),/palta/);await search.fill('avocado');assert.equal(await cards.count(),1);assert.match(await cards.first().textContent(),/Literal meaning/);
  await page.locator('#regional-slang-target').selectOption('es-BO');await search.fill('naked');assert.equal(await cards.count(),0,'a warning about another country must not become a counterpart');
  await region.selectOption('es-EC');await search.fill('chuchaqui');if(width===390)await page.screenshot({path:'/tmp/habla-vocabulary-batch.png'});
  assert.deepEqual(errors,[]);assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width));await context.close();
 }
 console.log('Vocabulary browser: new country senses, examples/voice/practice options, English counterparts, register differences, literal/slang separation, contrast-note negatives and narrow/native layout passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
