// Optional real-browser layout regression. Uses only neutral synthetic text.
// HABLA_PLAYWRIGHT_MODULE points to Playwright; HABLA_NATIVE_SCRIPTS optionally
// supplies colon-separated NativeSpeech.js files from the installed prototypes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
const scripts=(process.env.HABLA_NATIVE_SCRIPTS||'').split(':').filter(Boolean);
const text=('Neutral paragraph for testing vertical scrolling and editing.\n\n').repeat(18)+'https://example.test/'+('LongUnbrokenTestToken'.repeat(70))+'\n\nFinal neutral sentence.';
async function run(browser,engine,nativeFile,width,file='index.html'){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin||!url.pathname.startsWith('/habla-ecuador/'))return route.abort();
  const relative=decodeURIComponent(url.pathname.slice('/habla-ecuador/'.length))||'index.html';
  if(relative.includes('..')||/\.mp3$/.test(relative))return route.abort();
  const local=path.join(root,relative);
  if(!fs.existsSync(local))return route.abort();
  if(relative==='styles.css'&&process.env.HABLA_PANEL_CSS)return route.fulfill({path:process.env.HABLA_PANEL_CSS,contentType:'text/css'});
  return route.fulfill({path:local});
 });
 if(nativeFile){
  await page.addInitScript(()=>{window.__hablaSystemAudioSupported=window.__hablaSongIdentificationSupported=true;window.webkit={messageHandlers:{hablaSpeech:{postMessage(){}}}};});
  await page.addInitScript({path:nativeFile});
 }
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate');
 await page.waitForFunction(()=>typeof setEditableTranslation==='function'&&document.querySelector('#translator-input'));
 if(nativeFile)await page.waitForSelector('#native-translation-workspace');
 for(const view of nativeFile?['translator-view','music-view','translator-view']:['translator-view']){
  await page.evaluate(({text,view})=>{
   document.querySelector(`.bottom-nav [data-open="${view}"]`)?.click();
   musicTranscriptReview=true; // paused-capture editing, without translation calls
   document.querySelector('#translator-input').value=text;
   setEditableTranslation(text,text);
   document.querySelector('#translation-result').hidden=false;
   document.querySelector('#music-live-preview').hidden=false;
   document.querySelector('#music-live-source').textContent=text;
   document.querySelector('#music-live-draft').value=text;
  },{text,view});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  for(const selector of ['#translator-input','#natural-result','#music-live-source','#music-live-draft']){
   const panel=page.locator(selector);
   const geometry=await panel.evaluate(el=>{
    const css=getComputedStyle(el),r=el.getBoundingClientRect();
    return {scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,left:r.left,right:r.right,overflowX:css.overflowX,overflowY:css.overflowY,touchAction:css.touchAction};
   });
   const label=`${engine} ${nativeFile?path.basename(nativeFile):file} ${width} ${view} ${selector}`;
   assert.ok(geometry.clientWidth>0,label+' visible');
   assert.ok(geometry.scrollWidth<=geometry.clientWidth+1,label+' no horizontal text overflow: '+JSON.stringify(geometry));
   assert.ok(geometry.left>=-1&&geometry.right<=width+1,label+' remains in viewport');
   if(!process.env.HABLA_PANEL_BASELINE){
    assert.equal(geometry.overflowX,'hidden',label+' native overflow:auto overridden');
    assert.match(geometry.touchAction,/pan-y/);assert.match(geometry.touchAction,/pinch-zoom/);
   }
   const scroll=await panel.evaluate(el=>{el.scrollTop=40;el.scrollLeft=40;return {x:el.scrollLeft,y:el.scrollTop};});
   assert.equal(scroll.x,0,label+' cannot drift horizontally');
   if(geometry.scrollHeight>geometry.clientHeight+40)assert.ok(scroll.y>0,label+' can scroll vertically');
  }
  // Caret moves, selection and edits must remain possible without panning sideways.
  const source=page.locator('#translator-input');
  await source.focus();await source.evaluate(el=>el.setSelectionRange(el.value.length,el.value.length));
  await page.keyboard.insertText(' Added.');
  assert.ok((await source.inputValue()).endsWith(' Added.'));
  assert.equal(await source.evaluate(el=>el.scrollLeft),0);
  const draft=page.locator('#natural-result');
  await draft.focus();await draft.evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);range.collapse(false);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);});
  await page.keyboard.insertText(' Edited.');
  assert.ok((await draft.textContent()).endsWith(' Edited.'));
  assert.equal(await draft.evaluate(el=>el.scrollLeft),0);
  assert.equal(await source.inputValue(),text+' Added.','soft wrapping does not insert newlines into the source');
  await draft.evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);getSelection().removeAllRanges();getSelection().addRange(range);});
  assert.ok((await page.evaluate(()=>getSelection().toString())).includes('LongUnbrokenTestToken'));
  assert.equal(await page.locator('meta[name="viewport"]').getAttribute('content'),'width=device-width,initial-scale=1,viewport-fit=cover','zoom is not disabled');
 }
 // A long research-style draft also wraps; vertical flow remains available.
 await page.locator('body').evaluate(el=>el.classList.add('research-mode'));
 assert.ok(await page.locator('#natural-result').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 if(process.env.HABLA_PANEL_SCREENSHOT&&nativeFile&&width===390)await page.screenshot({path:process.env.HABLA_PANEL_SCREENSHOT});
 assert.deepEqual(errors,[],engine+' has no runtime errors');
 await context.close();
 console.log(`${engine}: ${nativeFile?path.basename(nativeFile):file}, ${width}px passed`);
}
(async()=>{
 const engines=process.env.HABLA_PANEL_ENGINE==='chromium'?[['Chromium',chromium]]:[['Chromium',chromium],['WebKit',webkit]];
 for(const [name,type]of engines){
  const browser=await type.launch({headless:true,...(name==='Chromium'?{args:['--no-sandbox']}: {})});
  try{for(const width of [375,390,512,844]){
   await run(browser,name,null,width);await run(browser,name,null,width,'translator.html');
   for(const script of scripts)await run(browser,name,script,width);
  }}finally{await browser.close();}
 }
 console.log('Translation panels: long paragraphs/unbroken text, scrolling, caret, editing, selection, both pages, native CSS and zoom policy passed. Physical iPhone/WebKit gestures require a device check.');
})().catch(error=>{console.error(error);process.exitCode=1;});
