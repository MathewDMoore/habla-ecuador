// Bilingual onboarding must be optional, non-destructive, and usable on touch
// in both the full app and standalone translator. No real microphone is used.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,file,width){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const u=new URL(route.request().url()),local=path.join(root,decodeURIComponent(u.pathname.replace('/habla-ecuador/',''))||'index.html');
  return u.origin===origin&&u.pathname.startsWith('/habla-ecuador/')&&
   fs.existsSync(local)&&fs.statSync(local).isFile()&&!local.endsWith('.mp3')
   ?route.fulfill({path:local}):route.abort();
 });
 await page.goto(origin+'/habla-ecuador/'+file);
 await page.waitForSelector('#tutorial-invitation');
 assert.equal(await page.locator('#tutorial-overlay').count(),0,'tour never automatically blocks the app');
 assert.equal(await page.locator('[data-tutorial-open]').count(),1,'reopenable Help icon');
 assert.equal(await page.locator('#tutorial-invite-start').isVisible(),true,'first-visit invitation');
 if(file==='index.html') // Standalone translator already lands on Translate and hides bottom navigation.
 if(await page.locator('#translator-view').evaluate(el=>!el.classList.contains('active')))
  await page.locator('.bottom-nav [data-open="translator-view"]').click();
 else assert.equal(await page.locator('#translator-view').evaluate(el=>el.classList.contains('active')),true,
  'standalone starts on Translate with its bottom navigation intentionally hidden');
 await page.locator('#translator-input').fill('Keep this phrase intact.');
 await page.locator('#source-language-select').selectOption('en-US');
 await page.locator('#target-language-select').selectOption('es-EC');
 const sourceBefore=await page.locator('#translator-input').inputValue();
 await page.locator('[data-tutorial-open]').click();
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),true);
 assert.equal(await page.locator('.tutorial-panel').getAttribute('role'),'dialog');
 assert.equal(await page.locator('.tutorial-panel').getAttribute('aria-modal'),'true');
 const expected=file==='index.html'?8:7;
 assert.equal(await page.evaluate(()=>HablaTutorial.count),expected);
 assert.equal(await page.locator('#tutorial-title').textContent(),'Welcome to Habla Ecuador');
 assert.equal(await page.locator('#tutorial-title-es').textContent(),'Bienvenido a Habla Ecuador');
 await page.locator('#tutorial-next').click();
 assert.equal(await page.locator('#tutorial-title').textContent(),'Choose your languages');
 assert.equal(await page.locator('#tutorial-title-es').textContent(),'Elige tus idiomas');
 await page.locator('#tutorial-next').click();
 assert.equal(await page.locator('#tutorial-title').textContent(),'Translate words and phrases');
 assert.equal(await page.locator('#translator-input').inputValue(),sourceBefore,'tour leaves translation text untouched');
 await page.locator('#tutorial-next').click();
 assert.equal(await page.locator('#tutorial-title').textContent(),'Speak and check what was heard');
 assert.match(await page.locator('#tutorial-english').textContent(),/keyboard microphone/);
 assert.equal(await page.locator('#input-mic').evaluate(el=>el.classList.contains('listening')),false,'tour never activates microphone');
 await page.locator('#tutorial-next').click();
 assert.equal(await page.locator('#tutorial-title').textContent(),'Explore regional meanings');
 assert.equal(await page.locator('#dictionary-view').evaluate(el=>el.classList.contains('active')),true);
 await page.locator('#tutorial-next').click();
 assert.equal(await page.locator('#tutorial-title').textContent(),'Practice speaking and listening');
 if(file==='index.html'){
  await page.locator('#tutorial-next').click();
  assert.equal(await page.locator('#tutorial-title').textContent(),'Learn through music');
  assert.equal(await page.locator('#music-view').evaluate(el=>el.classList.contains('active')),true);
 }
 await page.locator('#tutorial-next').click();
 assert.equal(await page.locator('#tutorial-title').textContent(),'Help improve Habla Ecuador');
 assert.match(await page.locator('#tutorial-spanish').textContent(),/Nada se envía automáticamente/);
 await page.locator('#tutorial-next').click();
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),false,'finish dismisses tour');
 assert.equal(await page.locator('#translator-view').evaluate(el=>el.classList.contains('active')),true,'returns to previous view');
 assert.equal(await page.locator('#translator-input').inputValue(),sourceBefore,'translation input preserved after tour');
 assert.equal(await page.evaluate(()=>localStorage.getItem('habla-tutorial-seen-v1')),'1');
 assert.equal(await page.locator('#tutorial-invitation').count(),0);
 await page.locator('[data-tutorial-open]').click();
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),true,'Help reopens after finishing');
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),false,'Escape dismisses help');
 // Shared direct link is an intentional opt-in to the tour, even if already seen.
 await page.goto(origin+'/habla-ecuador/'+file+'?tour=1');
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),true,'tour=1 opens on demand');
 await page.locator('#tutorial-skip').click();
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),false);
 assert.deepEqual(errors,[],'no JavaScript exceptions');
 await context.close();
 console.log(file+' '+width+'px: invitation, bilingual steps, real routes, restore, no mic activation, reopen, Escape and direct tutorial link passed');
}
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 const browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{for(const width of [320,390])for(const file of ['index.html','translator.html'])await run(browser,file,width);}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
