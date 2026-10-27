// Bilingual onboarding must be optional, non-destructive, and usable on touch
// in both the full app and standalone translator. No real microphone is used.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
// Use viewport geometry and raw touch coordinates: locator.click() can scroll
// a clipped Close/Next into view and conceal the iPhone failure.
async function controlsFit(page){
 await page.waitForFunction(()=>{
  const panel=document.querySelector('.tutorial-panel').getBoundingClientRect(),v=window.visualViewport;
  const left=v?.offsetLeft||0,top=v?.offsetTop||0,right=left+(v?.width||innerWidth),bottom=top+(v?.height||innerHeight);
  return ['#tutorial-close','#tutorial-next','#tutorial-back','#tutorial-skip','#tutorial-progress'].every(s=>{
   const r=document.querySelector(s).getBoundingClientRect();
   return r.top>=Math.max(top,panel.top)&&r.bottom<=Math.min(bottom,panel.bottom)&&r.left>=Math.max(left,panel.left)&&r.right<=Math.min(right,panel.right);
  });
 },{},{timeout:3000});
}
async function tap(page,id){
 await controlsFit(page);
 const r=await page.locator(id).boundingBox();
 await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);
}
async function highlightFits(page,selector){
 await page.waitForFunction(selector=>{
  const spot=document.querySelector('#tutorial-spotlight').getBoundingClientRect(),r=document.querySelector(selector).getBoundingClientRect();
  const panel=document.querySelector('.tutorial-panel').getBoundingClientRect();
  return spot.width>0&&spot.top<=r.top&&spot.bottom>=r.bottom&&spot.left<=r.left&&spot.right>=r.right&&spot.bottom<=panel.top;
 },selector,{timeout:3000}).catch(async e=>{console.log(await page.evaluate(selector=>Object.fromEntries([selector,"#tutorial-spotlight",".tutorial-panel"].map(s=>[s,document.querySelector(s).getBoundingClientRect().toJSON()])),selector));throw e;});
}
async function run(browser,file,width,height=844){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const u=new URL(route.request().url()),local=path.join(root,decodeURIComponent(u.pathname.replace('/habla-ecuador/',''))||'index.html');
  return u.origin===origin&&u.pathname.startsWith('/habla-ecuador/')&&
   fs.existsSync(local)&&fs.statSync(local).isFile()&&!local.endsWith('.mp3')
   ?route.fulfill({path:local}):route.abort();
 });
 // Previous versions stored v1 when the invitation was dismissed.
 // This rollout should still display the actual tour once for those visitors.
 await page.addInitScript(()=>localStorage.setItem('habla-tutorial-seen-v1','1'));
 await page.goto(origin+'/habla-ecuador/'+file);
 await page.waitForSelector('#tutorial-overlay:not([hidden])');
 assert.equal(await page.locator('button[data-tutorial-open]').count(),1,'reopenable Help icon');
 assert.equal(await page.locator('#tutorial-invitation').count(),0,'old invitation card is replaced by automatic tutorial');
 assert.equal(await page.locator('#tutorial-title').textContent(),'Welcome to Habla Ecuador');
 assert.equal(await page.locator('#tutorial-title-es').textContent(),'Bienvenido a Habla Ecuador');
 assert.equal(await page.locator('.tutorial-panel').getAttribute('aria-modal'),'true');
 assert.equal(await page.locator('#tutorial-close').isVisible(),true,'Close is visible on launch');
 assert.equal(await page.locator('#tutorial-close').textContent(),'Close / Cerrar');
 await tap(page,'#tutorial-close');
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),false,'Close dismisses immediate onboarding');
 assert.equal(await page.evaluate(()=>localStorage.getItem('habla-tutorial-seen-v2')),'1');
 await page.reload();
 await page.waitForFunction(()=>Boolean(window.HablaTutorial));
 assert.equal(await page.locator('#tutorial-overlay').count(),0,'later visit does not start onboarding again');
 if(file==='index.html')
  await page.locator('.bottom-nav [data-open="translator-view"]').click();
 else assert.equal(await page.locator('#translator-view').evaluate(el=>el.classList.contains('active')),true,
  'standalone starts on Translate with its bottom navigation intentionally hidden');
 await page.locator('#translator-input').fill('Keep this phrase intact.');
 await page.locator('#source-language-select').selectOption('en-US');
 await page.locator('#target-language-select').selectOption('es-EC');
 const sourceBefore=await page.locator('#translator-input').inputValue();
 await page.locator('button[data-tutorial-open]').click();
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),true);
 assert.equal(await page.locator('.tutorial-panel').getAttribute('role'),'dialog');
 assert.equal(await page.locator('.tutorial-panel').getAttribute('aria-modal'),'true');
 const expected=file==='index.html'?8:7;
 assert.equal(await page.evaluate(()=>HablaTutorial.count),expected);
 assert.equal(await page.locator('#tutorial-title').textContent(),'Welcome to Habla Ecuador');
 assert.equal(await page.locator('#tutorial-title-es').textContent(),'Bienvenido a Habla Ecuador');
 await tap(page,'#tutorial-next');
 assert.equal(await page.locator('#tutorial-title').textContent(),'Choose your languages');
 assert.equal(await page.locator('#tutorial-title-es').textContent(),'Elige tus idiomas');
 await highlightFits(page,'.language-picker-row');
 // Safari toolbar expansion/retraction changes the available height mid-step.
 await page.setViewportSize({width,height:Math.max(500,height-120)});
 await controlsFit(page);await highlightFits(page,'.language-picker-row');
 await page.setViewportSize({width,height});
 await controlsFit(page);await highlightFits(page,'.language-picker-row');
 // Simulate a visual viewport inset within the layout viewport. This verifies
 // our coordinate arithmetic, not physical Safari toolbar behavior.
 await page.evaluate(()=>{
  const v=window.visualViewport;
  for(const [key,value] of Object.entries({offsetLeft:10,offsetTop:40,width:innerWidth-20,height:innerHeight-100}))
   Object.defineProperty(v,key,{configurable:true,value});
  v.dispatchEvent(new Event('resize'));
 });
 await page.waitForFunction(()=>Math.abs(document.querySelector('#tutorial-overlay').getBoundingClientRect().top-40)<1);
 await controlsFit(page);await highlightFits(page,'.language-picker-row');
 await page.evaluate(()=>{
  const v=window.visualViewport;
  for(const key of ['offsetLeft','offsetTop','width','height'])delete v[key];
  v.dispatchEvent(new Event('resize'));
 });
 await controlsFit(page);await highlightFits(page,'.language-picker-row');
 // Scroll the instructions, while the Close and navigation rows stay put.
 await page.locator('.tutorial-content').evaluate(el=>el.scrollTop=el.scrollHeight);
 await controlsFit(page);
 await tap(page,'#tutorial-next');
 assert.equal(await page.locator('#tutorial-title').textContent(),'Translate words and phrases');
 await page.waitForFunction(()=>{
  const spot=document.querySelector('#tutorial-spotlight').getBoundingClientRect();
  const input=document.querySelector('#translator-input').getBoundingClientRect();
  const mic=document.querySelector('#input-mic').getBoundingClientRect();
  return spot.width>0&&spot.top<=input.top&&spot.bottom>=mic.bottom&&spot.left<=mic.left&&spot.right>=mic.right;
 },{},{timeout:3000}).catch(async error=>{console.log(await page.evaluate(()=>Object.fromEntries(['#tutorial-spotlight','#translator-input','#input-mic','.tutorial-panel','.input-card'].map(s=>[s,JSON.stringify(document.querySelector(s).getBoundingClientRect())]))));throw error;});
 assert.equal(await page.locator('#input-mic').evaluate(el=>el.classList.contains('listening')),false,'highlighting the input group never starts capture');
 assert.equal(await page.locator('#translator-input').inputValue(),sourceBefore,'tour leaves translation text untouched');
 await tap(page,'#tutorial-next');
 assert.equal(await page.locator('#tutorial-title').textContent(),'Speak and check what was heard');
 assert.match(await page.locator('#tutorial-english').textContent(),/keyboard microphone/);
 await highlightFits(page,'#input-mic');
 await tap(page,'#tutorial-back');
 assert.equal(await page.evaluate(()=>HablaTutorial.step),3,'Back returns exactly one step');
 assert.equal(await page.locator('.tutorial-content').evaluate(el=>el.scrollTop),0,'new step starts at instruction top');
 await tap(page,'#tutorial-next');
 await highlightFits(page,'#input-mic');
 assert.equal(await page.locator('#input-mic').evaluate(el=>el.classList.contains('listening')),false,'tour never activates microphone');
 await tap(page,'#tutorial-next');
 assert.equal(await page.locator('#tutorial-title').textContent(),'Explore regional meanings');
 assert.equal(await page.locator('#dictionary-view').evaluate(el=>el.classList.contains('active')),true);
 await highlightFits(page,'#regional-slang-search');
 await tap(page,'#tutorial-next');
 assert.equal(await page.locator('#tutorial-title').textContent(),'Practice speaking and listening');
 await highlightFits(page,'#lesson-language');
 if(file==='index.html'){
  await tap(page,'#tutorial-next');
  assert.equal(await page.locator('#tutorial-title').textContent(),'Learn through music');
  assert.equal(await page.locator('#music-view').evaluate(el=>el.classList.contains('active')),true);
 }
 await tap(page,'#tutorial-next');
 assert.equal(await page.locator('#tutorial-title').textContent(),'Help improve Habla Ecuador');
 assert.match(await page.locator('#tutorial-spanish').textContent(),/Nada se envía automáticamente/);
 await tap(page,'#tutorial-next');
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),false,'finish dismisses tour');
 assert.equal(await page.locator('#translator-view').evaluate(el=>el.classList.contains('active')),true,'returns to previous view');
 assert.equal(await page.locator('#translator-input').inputValue(),sourceBefore,'translation input preserved after tour');
 assert.equal(await page.evaluate(()=>localStorage.getItem('habla-tutorial-seen-v2')),'1');
 assert.equal(await page.locator('#tutorial-invitation').count(),0);
 await page.locator('button[data-tutorial-open]').click();
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),true,'Help reopens after finishing');
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),false,'Escape dismisses help');
 // Shared direct link is an intentional opt-in to the tour, even if already seen.
 await page.goto(origin+'/habla-ecuador/'+file+'?tour=1');
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),true,'tour=1 opens on demand');
 await tap(page,'#tutorial-skip');
 assert.equal(await page.locator('#tutorial-overlay').isVisible(),false);
 assert.deepEqual(errors,[],'no JavaScript exceptions');
 await context.close();
 console.log(file+' '+width+'x'+height+'px: first-launch auto-open/Close, legacy migration, no repeat, bilingual steps, routes, restore, reopen, Escape and direct link passed');
}
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 const browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{for(const [width,height] of [[320,844],[390,844],[390,650],[512,720]])for(const file of ['index.html','translator.html'])await run(browser,file,width,height);}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
