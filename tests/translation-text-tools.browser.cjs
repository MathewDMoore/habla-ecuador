// Neutral text only. Real browser DOM/layout; the native bridge is mocked.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,file,native,width=390,height=844){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const u=new URL(route.request().url()),p=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  if(u.origin!==origin||!u.pathname.startsWith('/habla-ecuador/')||!fs.existsSync(p)||/\.mp3$/.test(p))return route.abort();
  return route.fulfill({path:p});});
 await page.addInitScript(()=>{
  window.testCopied=[];window.testMessages=[];
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.testCopied.push(text)}});
 });
 if(native){
  await page.addInitScript(()=>{window.__hablaSystemAudioSupported=window.__hablaSongIdentificationSupported=true;window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>window.testMessages.push(m)}}};});
  await page.addInitScript({path:native});
 }
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate');
 await page.waitForFunction(()=>document.querySelector('#translation-text-tools')?.dataset.bound==='true');
 assert.equal(await page.locator('#translation-select-all').isDisabled(),true);
 const text=('Neutral translated paragraph with accents: café, mañana, 😊.\n\n').repeat(45);
 await page.evaluate(text=>{
  musicTranscriptReview=true;document.querySelector('#translator-input').value='Neutral original';
  setEditableTranslation('Neutral original',text);document.querySelector('#translation-result').hidden=false;
  window.testDraftNode=document.querySelector('#natural-result');window.testHeard=[];
  window.say=(text,lang)=>window.testHeard.push({text,lang});
 },text);
 const target=page.locator('#natural-result'),expand=page.locator('#translation-expand');
 const size=()=>target.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 const baseSize=await size(),collapsed=await target.evaluate(el=>el.getBoundingClientRect().height);
 assert.equal(await page.locator('#translation-text-tools').evaluate(el=>!!el.closest('.native-translation-tools')),false,'new tools are not hidden by native disclosure');
 assert.equal(await expand.isVisible(),true);
 assert.equal(await expand.getAttribute('aria-expanded'),'false');
 await expand.click();
 const expanded=await target.evaluate(el=>el.getBoundingClientRect().height);
 assert.ok(expanded>collapsed*1.4,`expanded height ${expanded} > compact height ${collapsed}`);
 assert.equal(await expand.getAttribute('aria-expanded'),'true');
 assert.equal(await expand.textContent(),'Collapse');
 assert.ok(await target.evaluate(el=>{el.scrollTop=120;return el.scrollTop>0;}),'long translation scrolls vertically');
 await page.locator('.translation-text-options summary').click();
 await page.locator('#translation-text-larger').click();assert.equal(await size(),baseSize+2);
 for(let i=0;i<20;i++)if(await page.locator('#translation-text-larger').isEnabled())await page.locator('#translation-text-larger').click();
 assert.equal(await size(),40);assert.equal(await page.locator('#translation-text-larger').isDisabled(),true);
 for(let i=0;i<20;i++)if(await page.locator('#translation-text-smaller').isEnabled())await page.locator('#translation-text-smaller').click();
 assert.equal(await size(),14);assert.equal(await page.locator('#translation-text-smaller').isDisabled(),true);
 await page.locator('#translation-text-reset').click();assert.equal(await size(),baseSize);
 assert.equal(await target.textContent(),text,'view controls preserve paragraphs and Unicode exactly');
 assert.equal(await target.evaluate(el=>el===window.testDraftNode),true,'same live editable node');
 await page.locator('#translation-select-all').click();
 assert.equal(await page.evaluate(()=>window.getSelection().getRangeAt(0).cloneContents().textContent),text,'Select all covers the entire translated text node');
 assert.equal((await page.evaluate(()=>window.getSelection().toString())).trimEnd(),text.trimEnd(),'rendered selection includes every paragraph');
 await page.keyboard.insertText('Edited translated paragraph.');
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>lastCompletedTranslation.target),'Edited translated paragraph.','edit remains saved');
 // Existing actions remain in their original disclosure, where present.
 if(native)await page.locator('.native-translation-tools summary').first().click();
 await page.locator('#hear-result').click();
 assert.equal(await page.evaluate(()=>window.testHeard.at(-1).text),'Edited translated paragraph.');
 await page.locator('#copy-result').click();
 assert.equal(await page.evaluate(()=>window.testCopied.at(-1)),'Edited translated paragraph.');
 if(native){
  await page.locator('#share-result').click();
  const share=await page.evaluate(()=>window.testMessages.findLast(m=>m.action==='share-translation'));
  assert.equal(share.text,'Edited translated paragraph.');
  await page.evaluate(id=>window.__hablaNativeSpeech({type:'share',id,status:'cancelled'}),share.id);
  await page.locator('.bottom-nav [data-open="music-view"]').click();
  assert.equal(await expand.isVisible(),true);assert.equal(await expand.getAttribute('aria-expanded'),'true');
  assert.equal(await target.textContent(),'Edited translated paragraph.');
 }
 await expand.click();assert.equal(await expand.getAttribute('aria-expanded'),'false');
 assert.equal(await target.evaluate(el=>el.classList.contains('translation-expanded')),false);
 // Printing must not clip the expanded/compact text or show its toolbar.
 await page.emulateMedia({media:'print'});
 assert.equal(await target.evaluate(el=>getComputedStyle(el).maxHeight),'none');
 assert.equal(await page.locator('#translation-text-tools').isVisible(),false);
 assert.deepEqual(errors,[]);await context.close();
 console.log(`${file}${native?' native':''} ${width}x${height}: expand/collapse, font bounds/reset, selection/edit, playback, copy${native?', share, Music':''} and print passed`);
}
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox']});try{
 await run(b,'index.html');await run(b,'translator.html');
 if(process.env.HABLA_NATIVE_SCRIPT){await run(b,'index.html',process.env.HABLA_NATIVE_SCRIPT);await run(b,'index.html',process.env.HABLA_NATIVE_SCRIPT,844,390);}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
