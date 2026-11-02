// Phone-sized DOM regression for the actual clutter report, using neutral text.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 const browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{
  for(const width of [320,390])for(const pageName of ['index.html','translator.html']){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>localStorage.setItem('habla-tutorial-seen-v2','1'));
   await page.route('**/*',r=>{
    const url=new URL(r.request().url()),rel=url.pathname.replace('/habla-ecuador/',''),file=path.join(root,rel);
    return url.origin===origin&&fs.existsSync(file)&&fs.statSync(file).isFile()?r.fulfill({path:file}):r.abort();
   });
   await page.goto(origin+'/habla-ecuador/'+pageName+'?start=translate');
   await page.waitForSelector('#translation-quick-actions');
   await page.evaluate(()=>{
    const input=document.querySelector('#translator-input');
    input.value='I want to learn English and Spanish.';
    setEditableTranslation(input.value,'Quiero aprender inglés y español.');
    document.querySelector('#translation-result').hidden=false;
   });
   await page.waitForFunction(()=>!document.querySelector('#copy-result').disabled);
   const geometry=await page.evaluate(()=>{
    const s=document.querySelector('#translator-input').closest('.input-card'),r=document.querySelector('#translation-result');
    const a=s.getBoundingClientRect(),b=r.getBoundingClientRect();
    return {gap:b.top-a.bottom,sourceFirst:a.top<b.top,screenWidth:document.documentElement.scrollWidth,viewport:innerWidth,offenders:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2}).slice(0,12).map(e=>({tag:e.tagName,id:e.id,className:String(e.className).slice(0,60),right:Math.round(e.getBoundingClientRect().right)})),
      photosAfter:document.querySelector('#image-quick-actions').compareDocumentPosition(r)&Node.DOCUMENT_POSITION_PRECEDING,
      clutterBefore:s.nextElementSibling?.id};
   });
   assert.ok(geometry.sourceFirst,JSON.stringify(geometry));
   assert.ok(Math.abs(geometry.gap)<=2,JSON.stringify(geometry));
   assert.ok(geometry.screenWidth<=geometry.viewport,JSON.stringify(geometry));
   assert.ok(['translation-empty-target','translation-result','native-empty-translation'].includes(geometry.clutterBefore),JSON.stringify(geometry));
   assert.equal(await page.locator('#music-session-data').count(),pageName==='index.html'?1:0);
   if(pageName==='index.html')assert.equal(await page.locator('#music-session-data').isVisible(),false,'idle transcript graph stays folded');
   assert.equal(await page.locator('#quick-choose-image').isVisible(),true,'photo chooser remains discoverable');
   assert.equal(await page.locator('#quick-paste-image').isVisible(),true,'image paste remains discoverable');
   assert.equal(await page.locator('#swap-button').isVisible(),true,'reverse never goes into the More disclosure');
   const quick=page.locator('#translation-quick-actions');
   for(const id of ['hear-result','copy-result','translation-expand','translation-full-text'])assert.equal(await quick.locator('#'+id).isVisible(),true,id);
   assert.equal(await page.locator('#translation-more-actions').evaluate(el=>el.open),false);
   await page.locator('#translation-more-actions > summary').click();
   for(const id of ['share-result','practice-translation','translation-select-all'])assert.equal(await page.locator('#'+id).isVisible(),true,id);
   assert.equal(await page.locator('#translator-input').inputValue(),'I want to learn English and Spanish.');
   assert.equal(await page.locator('#natural-result').textContent(),'Quiero aprender inglés y español.');
   assert.deepEqual(errors,[]);
   await context.close();console.log(engine,pageName,width,'paired text, visible photo/reverse, folded extras and original text PASS');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
