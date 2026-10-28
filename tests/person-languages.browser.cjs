// Real UI, profile storage and microphone handlers; only OS recognition is simulated.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
try{for(const file of ['index.html','translator.html'])for(const width of [320,390]){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  localStorage.setItem('habla-tutorial-seen-v2','1');
  window.SpeechRecognition=class{start(){window.personTestRecognition=this;this.onstart?.();this.onaudiostart?.();}stop(){this.stopped=true;this.onend?.();}abort(){this.aborted=true;this.onend?.();}};
 });
 await page.route('**/*',r=>{const u=new URL(r.request().url()),p=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(p)&&fs.statSync(p).isFile()?r.fulfill({path:p}):r.abort()});
 await page.goto('https://mathewdmoore.github.io/habla-ecuador/'+file+'?ui=en');
 if(file==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').tap();
 await page.locator('[data-mode="conversation"]').tap();
 await page.locator('.conversation-more-names summary').tap();
 for(const name of ['Mathew','Mateo','Ayssel'])for(const role of ['english','spanish']){
  await page.locator(`[data-speaker-preset="${role}"]`).selectOption(name);
  assert.match(await page.locator(`[data-speaker-role="${role}"]`).getAttribute('aria-label'),new RegExp(name));
  const language=page.locator('#conversation-'+role+'-language');
  const options=await language.locator('option').evaluateAll(options=>options.map(o=>o.value));
  assert.ok(options.includes('en-US')&&options.includes('en-GB')&&options.includes('es-MX')&&options.includes('es-EC'));
  for(const locale of ['es-MX','en-GB']){
   await language.selectOption(locale);
   assert.equal(await page.locator('#'+role+'-speaker-name').inputValue(),name);
   const mic=page.locator(`[data-speaker-role="${role}"]`);await mic.tap();
   assert.equal(await page.evaluate(()=>personTestRecognition.lang),locale,name+' microphone language');
   await mic.tap();
  }
 }
 await page.locator('[data-speaker-preset="english"]').selectOption('Mathew');
 await page.locator('#conversation-english-language').selectOption('es-MX');
 await page.locator('[data-speaker-role="english"]').tap();
 await page.locator('#conversation-english-language').selectOption('en-GB');
 assert.equal(await page.evaluate(()=>Boolean(personTestRecognition.stopped||personTestRecognition.aborted)),true,'changing language closes the previous microphone session');
 assert.equal(await page.evaluate(()=>recognition===null),true);
 await page.locator('[data-speaker-role="english"]').tap();
 assert.equal(await page.evaluate(()=>personTestRecognition.lang),'en-GB');
 await page.locator('[data-speaker-role="english"]').tap();
 await page.locator('#conversation-english-language').selectOption('es-MX');
 // Clear and re-add locations through the real country and region controls.
 for(const role of ['english','spanish']){
  const country=page.locator(`[data-person-country="${role}"]`),region=page.locator(`[data-person-region="${role}"]`),choices=page.locator(`[data-person-region-choice="${role}"]`);
  const spoken=await page.locator('#conversation-'+role+'-language').inputValue();
  await country.selectOption('');await region.fill('');await region.press('Tab');
  const countries=await country.locator('option').evaluateAll(opts=>opts.map(o=>o.value).filter(Boolean));
  assert.equal(countries.length,23,'clearing a country leaves all country choices available');
  for(const code of countries){
   await country.selectOption(code);
   assert.ok(await choices.locator('option').count()>2,code+' has region suggestions');
  }
  for(const [code,value] of [['en-US','Wyoming'],['es-MX','Jalisco'],['es-EC','Guayas']]){
   await country.selectOption(code);await choices.selectOption(value);
   assert.equal(await region.inputValue(),value);
   await choices.selectOption({label:'Clear region / Borrar región'});
   assert.equal(await region.inputValue(),'');
   assert.ok((await choices.locator('option').allTextContents()).includes(value),'clearing region keeps suggestions');
   await choices.selectOption(value);
  }
  await region.fill('My custom region');await region.press('Tab');
  assert.equal(await choices.inputValue(),'My custom region','custom region remains editable');
  assert.equal(await page.locator('#conversation-'+role+'-language').inputValue(),spoken,'location choices preserve language');
 }
 for(const country of ['en-US','es-MX','es-CO']){
  await page.locator('[data-person-country="english"]').selectOption(country);
  assert.equal(await page.locator('#conversation-english-language').inputValue(),'es-MX','country cannot set spoken language');
 }
 await page.locator('[data-person-region="english"]').fill('Test region');await page.locator('[data-person-region="english"]').press('Tab');
 await page.reload();if(file==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').tap();await page.locator('[data-mode="conversation"]').tap();
 assert.equal(await page.locator('#conversation-english-language').inputValue(),'es-MX');
 assert.equal(await page.locator('[data-person-country="english"]').inputValue(),'es-CO');
 assert.equal(await page.locator('[data-person-region="english"]').inputValue(),'Test region');
 await page.locator('#interface-language').selectOption('es');
 assert.equal(await page.locator('[data-speaker-label="english"]').textContent(),'Mathew','interface language preserves the chosen name');
 await page.locator('.conversation-composer summary').tap();
 await page.locator('#conversation-text-speaker').selectOption('english::Mathew');
 await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth,{},{timeout:2000});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'long person and language labels fit the screen');
 assert.deepEqual(errors,[]);
 await context.close();console.log(`${engine} ${file} ${width}px: Mathew/Mateo/Ayssel, both person slots, Spanish/English microphone settings, independent country and reload passed`);
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
