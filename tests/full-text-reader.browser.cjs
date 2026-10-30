/* Full-length source/translation reading tests with neutral 4500+ char text. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
const spanish=["Misión","Nuestra organización ofrece formación.","","Visión","Aprendizaje continuo para la comunidad.","","Historia","Desde el año dos mil cinco brindamos atención y formación."].join("\n");
const english=["Mission","Our organization provides training.","","Vision","Continuous learning for the community.","","History","Since 2005 we have provided support and training."].join("\n");
const longSource=(spanish+"\n\n").repeat(30)+"Final source paragraph.";
const longTarget=(english+"\n\n").repeat(30)+"Final English paragraph.";
async function run(browser,file,width){
 const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin||!url.pathname.startsWith('/habla-ecuador/'))return route.abort();
  const relative=decodeURIComponent(url.pathname.slice('/habla-ecuador/'.length))||'index.html';
  const target=path.resolve(root,relative);
  return target.startsWith(root+path.sep)&&fs.existsSync(target)&&fs.statSync(target).isFile()
   ?route.fulfill({path:target}):route.abort();
 });
 await page.addInitScript(() => localStorage.setItem("habla-tutorial-seen-v2","1"));
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate');
 await page.waitForFunction(()=>Boolean(window.HablaFullReader)&&document.querySelector('#source-full-text'));
 await page.evaluate(({longSource,longTarget})=>{
  const input=document.querySelector('#translator-input');input.value=longSource;
  setEditableTranslation(longSource,longTarget);
  document.querySelector('#translation-result').hidden=false;
 },{longSource,longTarget});
 await page.locator('#source-full-text').click();
 assert.equal(await page.locator('#full-text-reader').evaluate(el=>el.open),true,'expanded source opens fullscreen dialog');
 assert.equal(await page.locator('#full-reader-source').inputValue(),longSource,'complete pasted source preserved with all paragraphs');
 assert.equal(await page.locator('#full-reader-result').textContent(),longTarget,'complete translation preserved with all paragraphs');
 assert.equal(await page.locator('#full-reader-source').evaluate(el=>el.scrollHeight>500),true,'source grows far beyond original small text box');
 assert.equal(await page.locator('#full-reader-result').evaluate(el=>getComputedStyle(el).maxHeight==='none'||getComputedStyle(el).maxHeight==='0px'||getComputedStyle(el).maxHeight==='none'),true,'translation has no clipping height');
 const panel=await page.locator('#full-reader-source').evaluate(el=>({height:el.getBoundingClientRect().height,scrollHeight:el.scrollHeight,width:el.scrollWidth,clientWidth:el.clientWidth}));
 assert.ok(panel.height>400,'source expands rather than using 140px fixed editor');
 assert.ok(panel.width<=panel.clientWidth+2,'expanded text never scrolls horizontally');
 assert.ok(await page.locator('#full-text-reader').evaluate(el=>el.scrollHeight>el.clientHeight),'full document scrolls vertically as one dialog');
 const input=page.locator('#full-reader-source');
 await input.fill('Misión\nUno.\n\nVisión\nDos.\n\nHistoria\nTres.');
 assert.equal(await page.locator('#translator-input').inputValue(),'Misión\nUno.\n\nVisión\nDos.\n\nHistoria\nTres.','edits synchronize to real source');
 await page.locator('#full-reader-close').click();
 assert.equal(await page.locator('#full-text-reader').evaluate(el=>el.open),false,'close returns to app');
 assert.equal(await page.locator('#translator-input').inputValue(),'Misión\nUno.\n\nVisión\nDos.\n\nHistoria\nTres.','source edit survives close');
 // Reuse a fresh completed draft so the output reading action stays testable.
 await page.evaluate(({longSource,longTarget})=>{
  // Stop an earlier source-edit debounce before presenting the completed mock.
  clearTimeout(translationTimer);
  translationRequest += 1;
  document.querySelector('#translator-input').value=longSource;
  setEditableTranslation(longSource,longTarget);
  document.querySelector('#translation-result').hidden=false;
 },{longSource,longTarget});
 await page.locator('#translation-full-text').click();
 assert.equal(await page.locator('#full-text-reader').evaluate(el=>el.open),true,'translation opens same complete document');
 assert.equal(await page.locator('#full-reader-result').textContent(),longTarget);
 // Missing/blocked clipboard must select the requested translation, never source.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
 await page.locator('#full-reader-copy-target').evaluate(el=>el.click());
 assert.equal(await page.locator('#full-reader-copy-field').inputValue(),longTarget);
 assert.equal(await page.locator('#full-reader-source').inputValue(),longSource,'copy fallback cannot replace source');
 assert.deepEqual(await page.locator('#full-reader-copy-field').evaluate(el=>[el.selectionStart,el.selectionEnd,el.readOnly]),[0,longTarget.length,true]);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(Error('blocked'))}}));
 await page.locator('#full-reader-copy-source').evaluate(el=>el.click());
 await page.waitForFunction(value=>document.querySelector('#full-reader-copy-field').value===value,longSource);
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#full-text-reader').evaluate(el=>el.open),false,'Escape closes full screen');
 // Inline Expand no longer crops the result at 55svh.
 await page.locator('#translation-expand').click();
 const style=await page.locator('#natural-result').evaluate(el=>({height:el.clientHeight,scrollHeight:el.scrollHeight,maxHeight:getComputedStyle(el).maxHeight,scrollY:getComputedStyle(el).overflowY}));
 assert.ok(style.height>=style.scrollHeight-4,'inline Expand reveals all the translated paragraphs: '+JSON.stringify(style));
 // After expanding a many-page result, WebKit Playwright can auto-scroll
 // the Collapse button endlessly. Dispatch its real click directly; the
 // full-screen and first Expand touch targets are tested above.
 await page.locator('#translation-expand').evaluate(el=>el.click());
 assert.equal(await page.locator('#translation-expand').getAttribute('aria-expanded'),'false','Collapse returns to compact mode');
 // Short paired view stays compact and reverses without translating again.
 await page.evaluate(()=>{
  document.querySelector('#translator-input').value='Hello there!';
  setEditableTranslation('Hello there!','¡Hola!');
  document.querySelector('#translation-result').hidden=false;
 });
 await page.locator('#source-full-text').click();
 assert.ok(await page.locator('#full-reader-source').evaluate(el=>el.clientHeight<180),'short source fits content');
 await page.locator('#full-reader-alternatives summary').click();
 assert.equal(await page.locator('#full-reader-alternatives').getAttribute('open'),'');
 assert.equal(await page.locator('#full-reader-reverse').isVisible(),true,'reverse stays available with alternatives expanded');
 assert.equal(await page.locator('.full-reader-jumps').evaluate(el=>getComputedStyle(el).position),'sticky');
 await page.locator('#full-reader-reverse').click();
 assert.equal(await page.locator('#full-reader-source').inputValue(),'¡Hola!');
 assert.equal(await page.locator('#full-reader-result').textContent(),'Hello there!');
 await page.locator('#full-reader-reverse').click();
 assert.equal(await page.locator('#full-reader-source').inputValue(),'Hello there!');
 assert.equal(await page.locator('#full-reader-result').textContent(),'¡Hola!');
 // Hidden stale placeholders cannot masquerade as a finished translation.
 await page.evaluate(()=>{
  document.querySelector('#translation-result').hidden=true;
  document.querySelector('#natural-result').textContent='Translating…';
 });
 await page.waitForFunction(()=>document.querySelector('#full-reader-result').textContent==='');
 assert.equal(await page.locator('#full-reader-reverse').isDisabled(),true);
 assert.equal(await page.locator('#full-reader-copy-target').isDisabled(),true);
 await page.evaluate(()=>{window.retryTranslation=()=>{
  setEditableTranslation(document.querySelector('#translator-input').value,'Completed test draft.');
  document.querySelector('#translation-result').hidden=false;
 };});
 await page.locator('#full-reader-translate').click();
 await page.waitForFunction(()=>document.querySelector('#full-reader-result').textContent==='Completed test draft.');
 assert.equal(await page.locator('#full-reader-translation-state').textContent(),'');
 assert.equal(await page.locator('#full-reader-reverse').isEnabled(),true);
 assert.deepEqual(errors,[],'no JS errors');
 await context.close();
 console.log(file+' '+width+'px full length pasted text, both expanding actions, paragraph preservation, source editing and Escape passed');
}
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 const browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{for(const file of ['index.html','translator.html'])for(const width of [320,390])await run(browser,file,width);}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
