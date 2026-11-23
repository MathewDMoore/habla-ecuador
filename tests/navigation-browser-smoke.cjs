// Real browser smoke test: the two public entry URLs must expose the same
// five tabs and a horizontal gesture must navigate between them.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'), origin='https://mathewdmoore.github.io';
(async()=>{
 const browser=await playwright[process.env.HABLA_BROWSER_ENGINE||'webkit'].launch({headless:true});
 try {
  for(const entry of ['index.html','translator.html']){
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    const rel=decodeURIComponent(url.pathname.replace('/habla-ecuador/',''))||'index.html';
    const local=path.join(root,rel);
    return url.origin===origin&&url.pathname.startsWith('/habla-ecuador/')
      &&fs.existsSync(local)&&fs.statSync(local).isFile()
      ?route.fulfill({path:local}):route.abort();
   });
   await page.goto(origin+'/habla-ecuador/'+entry,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.documentElement.dataset.hablaSwipeBound==='true',null,{timeout:10000});
   await page.evaluate(()=>{if(typeof HablaTutorial!=='undefined')HablaTutorial.close?.();});
   const buttons=await page.locator('.bottom-nav button').all();
   assert.equal(buttons.length,5,entry+' must show all five tabs');
   for(const id of ['home-view','translator-view','dictionary-view','music-view','lesson-view']){
    assert.equal(await page.locator('.bottom-nav button[data-open="'+id+'"]').count(),1,entry+' missing '+id);
    assert.equal(await page.locator('#'+id).count(),1,entry+' missing view '+id);
   }
   // Every bottom button must really switch its corresponding screen.
   for(const id of ['translator-view','dictionary-view','music-view','lesson-view','home-view']){
    await page.locator('.bottom-nav button[data-open="'+id+'"]').click();
    await page.waitForFunction(expected=>document.querySelector('.view.active')?.id===expected,id,{timeout:3000});
    assert.equal(await page.locator('.bottom-nav button.active').getAttribute('data-open'),id,
      entry+' did not highlight clicked tab '+id);
   }
   await page.locator('.bottom-nav button[data-open="dictionary-view"]').click();
   const results = page.locator('#regional-slang-results');
   await results.locator('article').first().waitFor();
   assert.equal(await results.locator('.slang-tone.caution:visible').count(),0,entry+' should open with everyday language');
   const strong = results.locator(':scope > details');
   assert.ok(await strong.locator('.caution').count()>0);
   await strong.locator(':scope > summary').click();
   assert.ok(await results.locator('.slang-tone.caution:visible').count()>0);
   await page.locator('#regional-usage-type').selectOption('vulgar');
   assert.ok(await results.locator(':scope > article .caution:visible').count()>0);
   await page.locator('#regional-usage-type').selectOption('clinical');
   for (const term of ['rodilla','corazón','riñón','páncreas']) {
     assert.equal(await results.getByRole('heading',{name:term,exact:true}).count(),1);
   }
   await page.locator('#regional-slang-search').fill('wrist');
   assert.equal(await results.getByRole('heading',{name:'muñeca',exact:true}).count(),1);
   // Return to the first tab before testing WebKit touch navigation.
   await page.locator('.bottom-nav button[data-open="home-view"]').click();
   await page.waitForFunction(()=>document.querySelector('.view.active')?.id==='home-view');
   for(const id of ['translator-view','dictionary-view','music-view','lesson-view']){
    await page.evaluate(()=>{
     const target=document.querySelector('.view.active h1, .view.active .view-heading, .view.active');
     const point=(x,y)=>({clientX:x,clientY:y});
     const send=(type,x,y)=>{
      const event=new Event(type,{bubbles:true,cancelable:true});
      Object.defineProperties(event,{touches:{value:type==='touchend'?[]:[point(x,y)]},
        changedTouches:{value:[point(x,y)]}});
      target.dispatchEvent(event);
     };
     send('touchstart',210,350);
     send('touchmove',125,354);
     send('touchend',90,358);
    });
    await page.waitForFunction(expected=>document.querySelector('.view.active')?.id===expected,id,{timeout:3000});
    assert.equal(await page.locator('.bottom-nav button.active').getAttribute('data-open'),id,'active tab must be highlighted');
   }
   if(errors.length)console.log(entry+' nonfatal page errors:',errors.slice(0,3));
   await context.close();
  }
  console.log('Five-tab navigation smoke passed in both entry pages.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
