// Original lesson DOM; device speech and recognition boundaries are simulated.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
const {englishCatalog}=require('../recorded-practice.js');
(async()=>{
 for(const [width,native] of [[390,null],[320,null],...(process.env.HABLA_NATIVE_SCRIPT?[[390,process.env.HABLA_NATIVE_SCRIPT]]:[])]){
 const browser=await playwright[process.env.HABLA_BROWSER_ENGINE||'chromium'].launch();
 try{
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const u=new URL(route.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  if(u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()&&!f.endsWith('.mp3'))return route.fulfill({path:f});
  external.push(u.href);return route.abort();
 });
 await page.addInitScript(()=>{
  window.testMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>testMessages.push(m)}}};
  class Recognition{start(){window.testRecognition=this;testMessages.push({action:'start',lang:this.lang});}stop(){}abort(){}}
  window.SpeechRecognition=Recognition;
 });
 if(native)await page.addInitScript({path:native});
 await page.addInitScript(() => localStorage.setItem("habla-tutorial-seen-v2","1"));
 await page.goto(origin+'/habla-ecuador/index.html?ui=es');
 await page.evaluate(()=>{window.spoken=[];window.say=(text,lang)=>{HablaRecordedPractice.pause();spoken.push({text,lang});};});
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 const host=page.locator('#recorded-practice');await host.locator(':scope > summary').click();
 assert.match(await host.locator(':scope > summary').textContent(),/Lecciones de inglés · escucha y habla/);
 for(const locale of ['en-US','en-GB']){
  await page.locator('#lesson-language').selectOption(locale);
  assert.equal(await host.getAttribute('data-learning-language'),locale);
  assert.equal(await host.locator('#english-lesson-select option').count(),4);
  for(const item of englishCatalog[locale]){
   await host.locator('#english-lesson-select').selectOption(item.id);
   assert.equal(await host.locator('#recorded-practice-content').getAttribute('data-stage'),'1');
   assert.equal(await host.locator('#english-mini-understand').isVisible(),true);
   assert.equal(await host.locator('#english-mini-speak').isVisible(),false);
   assert.match(await host.locator('#english-mini-understand').textContent(),new RegExp(item.scene.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
   await host.locator('#english-explanation-hear').click();
   assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:item.explanation,lang:'es-EC'});
   await host.locator('[data-mini-next="2"]').click();
   assert.equal(await page.evaluate(()=>HablaRecordedPractice.isProtected()),true);
   await host.locator('#english-think-first').click();
   assert.equal(await host.locator('#english-think-first').getAttribute('aria-pressed'),'true');
   assert.equal(await host.locator('#english-context-meaning').isVisible(),false,'challenge hides Spanish gloss');
   assert.equal(await host.locator('.english-mini-reply').isVisible(),false,'challenge hides the model reply');
   assert.equal(await host.locator('#english-model-hear').isVisible(),false,'no answer audio before reveal');
   assert.equal(await host.locator('.english-mini-chunks').isVisible(),false,'no answer chunks before reveal');
   await host.locator('#english-context-hear').click();
   assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:item.context,lang:locale},'context remains audible in the chosen variety');
   await host.locator('#english-think-first').click();
   assert.equal(await host.locator('#english-think-first').getAttribute('aria-pressed'),'false');
   assert.equal(await host.locator('#english-context-meaning').isVisible(),true);
   assert.equal(await host.locator('.english-mini-reply').isVisible(),true);
   await host.locator('#english-context-hear').click();assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:item.context,lang:locale});
   await host.locator('#english-model-hear').click();assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:item.phrase,lang:locale});
   for(const button of await host.locator('[data-english-chunk]').all()){
    const text=await button.getAttribute('data-english-chunk');await button.click();assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text,lang:locale});
   }
   await host.locator('[data-mini-next="3"]').click();
   assert.equal(await host.locator('.dictionary-practice-target').textContent(),item.phrase);
   await host.locator('.dictionary-practice-mic').evaluate(el=>el.click());
   assert.equal(await page.evaluate(()=>testMessages.findLast(m=>m.action==='start').lang),locale);
   await page.evaluate(({text,native})=>{
    if(native){const id=testMessages.findLast(m=>m.action==='start').id;__hablaNativeSpeech({id,type:'result',text,final:true});__hablaNativeSpeech({id,type:'end'});}
    else{const result=[{transcript:text}];result.isFinal=true;testRecognition.onresult({results:[result]});testRecognition.onend?.();}
   },{text:item.phrase,native:Boolean(native)});
   assert.match(await host.locator('.dictionary-practice-score').textContent(),/100%/);
   await host.locator('#english-mini-finish').click();
   assert.equal(await page.evaluate(()=>recognition),null);
   assert.equal(await page.evaluate(()=>HablaRecordedPractice.isProtected()),false);
   assert.match(await host.locator('#english-mini-status').textContent(),/Práctica terminada/);
  }
 }
 await host.locator('[data-mini-step="3"]').click();await host.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 await host.locator('[data-mini-step="1"]').click();assert.equal(await page.evaluate(()=>recognition),null,'step changes stop prior capture');
 await host.locator('[data-mini-step="3"]').click();await host.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 await host.locator('#english-lesson-select').selectOption('repeat');assert.equal(await page.evaluate(()=>recognition),null,'topic changes stop prior capture');
 await page.locator('#interface-language').selectOption('en');assert.equal(await host.getAttribute('data-learning-language'),'en-GB');
 await host.locator('[data-mini-step="2"]').click();await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
 assert.equal(await page.evaluate(()=>HablaRecordedPractice.isProtected()),false,'inactive lesson does not block idle updates');
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 await page.locator('#lesson-language').selectOption('es-EC');
 await host.locator('#recorded-practice-region').selectOption('lapaz-family');
 await page.locator('#lesson-language').selectOption('en-GB');assert.equal(await host.locator('#english-lesson-select').inputValue(),'repeat');
 await page.locator('#lesson-language').selectOption('es-EC');assert.equal(await host.locator('#recorded-practice-region').inputValue(),'lapaz-family');
 await page.locator('#lesson-language').selectOption('');await page.locator('#interface-language').selectOption('es');
 await page.reload();await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 assert.equal(await host.getAttribute('data-learning-language'),'en-US');
 await host.locator(':scope > summary').click();await host.locator('[data-mini-next="2"]').click();
 assert.equal(await host.locator('iframe,video,a[href]').count(),0,'English lessons contain no provider player or external course link');
 assert.equal(external.some(url=>/youtube|akamaized|inglesconelguero|amigosingleses/.test(url)),false);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 if(process.env.HABLA_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.HABLA_SCREENSHOT_DIR,`original-english-lesson-${width}${native?'-native':''}.png`)});
 console.log(`${process.env.HABLA_BROWSER_ENGINE||'chromium'} ${width}px ${native?'native bridge':'browser'}: four original lessons, all three steps, Spanish/English audio routes, eight locale/prompt capture paths, feedback, completion, cleanup, update protection and no external course content passed`);
 await context.close();
 }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
