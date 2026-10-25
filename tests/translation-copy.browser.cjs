// Copy visible drafts only. Clipboard boundaries are mocked; no user text/network.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,width,file,nativeLayout){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>{const u=new URL(route.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()&&!f.endsWith('.mp3')?route.fulfill({path:f}):route.abort();});
 await page.addInitScript(()=>{
  window.copyValues=[];window.legacyValues=[];window.copyMode='modern';window.legacySucceeds=false;
  Object.defineProperty(navigator,'clipboard',{configurable:true,get:()=>copyMode==='missing'?undefined:{writeText:async text=>{
   copyValues.push(text);if(copyMode==='blocked')throw Error('Clipboard denied');if(copyMode==='pending')await new Promise(resolve=>window.finishCopy=resolve);
  }}});
  document.execCommand=command=>{if(command!=='copy')throw Error('Unexpected command');legacyValues.push(document.activeElement.value);return legacySucceeds;};
 });
 if(nativeLayout)await page.addInitScript(()=>{
  // Reproduce the signed companion 16 layout contract observed in the recording:
  // unknown result children enter a closed notes disclosure; the workspace moves
  // between Translate and Music. This is a layout fixture, not an iPhone test.
  document.addEventListener('DOMContentLoaded',()=>{
   const result=document.querySelector('#translation-result'),workspace=document.createElement('section');workspace.id='native-copy-test-workspace';result.before(workspace);workspace.append(result);
   const notes=document.createElement('details');notes.className='native-translation-tools';notes.innerHTML='<summary>Playback & translation notes</summary>';
   for(const node of [...result.children])if(!node.matches('.result-label,#natural-result'))notes.append(node);result.append(notes);
   for(const name of ['translator-view','music-view'])document.querySelector('.bottom-nav [data-open="'+name+'"]').addEventListener('click',()=>document.getElementById(name).append(workspace));
  });
 });
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate&ui=en');
 await page.waitForFunction(()=>document.querySelector('#translation-text-tools')?.dataset.bound==='true');
 assert.equal(await page.locator('#copy-result').count(),1);assert.equal(await page.locator('#copy-result').isDisabled(),true);
 const text='Neutral edited translation: café, mañana, 😊.\n\nSecond translated paragraph.';
 await page.evaluate(text=>{document.querySelector('#translator-input').value='PRIVATE ORIGINAL MUST NOT BE COPIED';setEditableTranslation('PRIVATE ORIGINAL MUST NOT BE COPIED','Initial generated text');const d=document.querySelector('#natural-result');d.textContent=text;d.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#translation-result').hidden=false;window.savedDraft=d;},text);
 assert.equal(await page.locator('#copy-result').isVisible(),true,'Copy is visible without opening notes');
 assert.equal(await page.locator('#copy-result').evaluate(el=>!!el.closest('.native-translation-tools')),false);
 await page.locator('#copy-result').click();assert.equal(await page.evaluate(()=>copyValues.at(-1)),text);
 assert.match(await page.locator('#translation-copy-status').textContent(),/Translation copied/);
 assert.equal(await page.locator('#translation-copy-fallback').isVisible(),false);
 await page.evaluate(()=>{copyMode='missing';legacySucceeds=true;});
 await page.locator('#copy-result').click();assert.equal(await page.evaluate(()=>legacyValues.at(-1)),text);
 assert.match(await page.locator('#translation-copy-status').textContent(),/Translation copied/);
 await page.evaluate(()=>{copyMode='blocked';legacySucceeds=false;});
 await page.locator('#copy-result').click();assert.equal(await page.locator('#translation-copy-fallback').isVisible(),true);
 assert.equal(await page.locator('#translation-copy-text').inputValue(),text);
 assert.deepEqual(await page.locator('#translation-copy-text').evaluate(el=>[el.selectionStart,el.selectionEnd]),[0,text.length]);
 assert.match(await page.locator('#translation-copy-status').textContent(),/unavailable/);
 assert.equal(await page.locator('#natural-result').evaluate(el=>el===savedDraft),true);
 assert.equal(await page.locator('#natural-result').textContent(),text);
 assert.equal(await page.locator('#translator-input').inputValue(),'PRIVATE ORIGINAL MUST NOT BE COPIED');
 await page.evaluate(()=>legacySucceeds=true);await page.locator('#translation-copy-retry').click();
 assert.equal(await page.locator('#translation-copy-fallback').isVisible(),false);assert.equal(await page.locator('#translation-copy-text').inputValue(),'');
 await page.evaluate(()=>{copyMode='pending';});
 await page.locator('#copy-result').click();assert.equal(await page.locator('#copy-result').isDisabled(),true);
 const count=await page.evaluate(()=>copyValues.length);await page.evaluate(()=>copyTranslation());assert.equal(await page.evaluate(()=>copyValues.length),count,'duplicate requests excluded');
 await page.evaluate(()=>{setEditableTranslation('New private original','New translated draft.');finishCopy();});
 await page.waitForFunction(()=>!document.querySelector('#copy-result').disabled);
 assert.match(await page.locator('#translation-copy-status').textContent(),/Translation changed/);
 assert.equal(await page.locator('#natural-result').textContent(),'New translated draft.');
 if(nativeLayout){
  await page.evaluate(()=>copyMode='modern');await page.locator('.bottom-nav [data-open="music-view"]').click();
  assert.equal(await page.locator('#copy-result').isVisible(),true);await page.locator('#copy-result').click();
  assert.equal(await page.evaluate(()=>copyValues.at(-1)),'New translated draft.');
  await page.locator('.bottom-nav [data-open="translator-view"]').click();
 }
 await page.evaluate(()=>{copyMode='blocked';legacySucceeds=false;});await page.locator('#copy-result').click();
 assert.equal(await page.locator('#translation-copy-fallback').isVisible(),true);
 await page.evaluate(()=>setEditableTranslation('Another original','Another completed translation.'));
 assert.equal(await page.locator('#translation-copy-fallback').isVisible(),false);assert.equal(await page.locator('#translation-copy-text').inputValue(),'');
 const layout=await page.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth,zoom:visualViewport?.scale,wide:[...document.querySelectorAll('body *')].filter(el=>!el.hidden&&el.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(el=>({id:el.id,tag:el.tagName,text:el.textContent?.slice(0,60),right:el.getBoundingClientRect().right,width:el.getBoundingClientRect().width}))}));
 assert.equal(layout.scroll<=layout.inner,true,JSON.stringify(layout));
 assert.deepEqual(errors,[]);
 if(process.env.HABLA_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.HABLA_SCREENSHOT_DIR,`translation-copy-${width}${nativeLayout?'-native':''}-${file}.png`)});
 await context.close();console.log(`${width}px ${file} ${nativeLayout?'companion-layout fixture':'browser'}: visible Copy, edited paragraphs/Unicode, clipboard/legacy/manual routes, retry, duplicate/stale guards and draft preservation passed`);
}
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';for(const width of [320,390])for(const [file,native] of [['index.html',false],['translator.html',false],['index.html',true]]){
 const browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});try{await run(browser,width,file,native);}finally{await browser.close();}
}})().catch(error=>{console.error(error);process.exitCode=1;});
