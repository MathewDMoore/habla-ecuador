// Real DOM and source files, with delayed/failed evidence and an optional-widget
// exception. The bundled expression buttons must remain independent of both.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,mode,width){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('crash',()=>console.error(`Dictionary startup page crashed: ${mode} ${width}px`));
 let release;const gate=new Promise(resolve=>release=resolve);
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url()),file=path.join(root,url.pathname.replace('/habla-ecuador/',''));
  if(url.origin!==origin||!fs.existsSync(file)||!fs.statSync(file).isFile()||file.endsWith('.mp3'))return route.abort();
  if(url.pathname.includes('/data/')){
   if(mode==='failure')return route.abort();
   if(mode==='delayed')await gate;
  }
  // A timed-out fetch may already have been cancelled when its test gate opens.
  return route.fulfill({path:file}).catch(error=>{if(!route.request().failure())throw error;});
 });
 if(mode==='optional-error')await page.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{
  window.HablaRecordedPractice.render=()=>{throw Error('Injected optional recording widget failure');};
 }));
 await page.goto(origin+'/habla-ecuador/index.html');
 for(const view of ['translator-view','dictionary-view','music-view','lesson-view','home-view','dictionary-view']){
  await page.locator('.bottom-nav [data-open="'+view+'"]').click();
  assert.equal(await page.locator('#'+view).evaluate(el=>el.classList.contains('active')),true,'navigation works despite '+mode);
 }
 await page.locator('#dictionary-view .review-callout').click();
 assert.equal(await page.locator('#review-view').evaluate(el=>el.classList.contains('active')),true,'review/suggest button remains operational');
 await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
 if(mode==='delayed'){
  assert.match(await page.locator('#dictionary-status').textContent(),/Loading/);
  assert.ok(await page.locator('#expression-results .expression-card').count()>0,'bundled cards render before evidence arrives');
  // Release the source gate after checking pending startup. Keeping it closed
  // through every slow mobile click can intentionally exceed the app timeout.
  release();
 }
 const counts=await page.evaluate(()=>Object.fromEntries(['all','idiom','slang','culture','personal'].map(category=>[category,culturalExpressions.filter(entry=>category==='all'||entry.category===category).length])));
 for(const category of Object.keys(counts)){
  await page.locator('[data-expression-filter="'+category+'"]').click();
  assert.equal(await page.locator('#expression-results .expression-card').count(),counts[category],mode+': '+category+' filters bundled cards');
  assert.equal(await page.locator('[data-expression-filter="'+category+'"]').evaluate(el=>el.classList.contains('active')),true);
  assert.equal(await page.locator('.slang-index').isVisible(),['all','slang','idiom'].includes(category),'quick index follows the selected category');
  if(['slang','idiom'].includes(category))assert.equal(await page.locator('#slang-index-list li').count(),counts[category]);
 }
 await page.locator('[data-expression-filter="all"]').click();
 await page.locator('#dictionary-search').fill('chuta');
 assert.equal(await page.locator('#expression-results .expression-card').count(),1);
 await page.locator('[data-expression-filter="culture"]').click();
 assert.equal(await page.locator('#expression-results .expression-card').count(),0,'search and category compose');
 await page.locator('#dictionary-search').fill('');await page.locator('[data-expression-filter="all"]').click();
 await page.evaluate(()=>{window.testSpoken=[];window.say=(text,lang)=>testSpoken.push({text,lang});});
 const audio=page.locator('#expression-results [data-dictionary-audio]').first();
 const expectedAudio=await audio.getAttribute('data-dictionary-audio');await audio.click();
 assert.deepEqual(await page.evaluate(()=>testSpoken),[{text:expectedAudio,lang:'es-EC'}],'bundled expression audio button is bound independently');
 if(mode==='failure')await page.waitForFunction(()=>document.querySelector('#dictionary-status').textContent.startsWith('Source files could not load.'));
 else{
  await page.waitForFunction(()=>document.querySelector('#dictionary-results .evidence-card')||document.querySelector('#dictionary-status').textContent.startsWith('Source files could not load.'));
  assert.ok(await page.locator('#dictionary-results .evidence-card').count()>0,mode+': '+await page.locator('#dictionary-status').textContent());
 }
 assert.equal(await page.locator('#expression-results .expression-card').count(),counts.all);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[],'optional failures must not escape or strand unrelated controls');
 await context.close();console.log('Dictionary startup '+mode+' '+width+'px: bundled categories/search/index work independently of evidence and optional media');
}
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 // Isolate every failure/recovery scenario as well as its browser context.
 // WebKit media/process state must not leak from a prior closed context.
 for(const width of [320,390])for(const mode of ['delayed','failure','optional-error']){
  const browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
  try{await run(browser,mode,width);}finally{await browser.close();}
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
