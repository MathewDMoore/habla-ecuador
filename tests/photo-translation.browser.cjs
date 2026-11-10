const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,entry,width){
 const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',request=>requests.push({url:request.url(),error:request.failure()}));
 await page.addInitScript(()=>{
  localStorage.setItem('habla-tutorial-seen-v2','1');window.__copies=[];
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copies.push(text);}}});
  window.Tesseract={createWorker:async()=>({recognize:async(image,opts,output)=>{
   if(!output.blocks)throw new Error('Missing geometry request');
   const {width:w,height:h}=image;
   return {data:{text:'The library opens tomorrow.\nBring your membership card.',confidence:95,blocks:[{paragraphs:[
    {text:'The library opens tomorrow.',bbox:{x0:w*.1,y0:h*.1,x1:w*.9,y1:h*.24}},
    {text:'Bring your membership card.',bbox:{x0:w*.1,y0:h*.5,x1:w*.9,y1:h*.64}}
   ]}]}};
  },terminate:async()=>{}})};
 });
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.protocol==='blob:'||url.protocol==='data:')return route.continue();
  if(url.hostname==='api.mymemory.translated.net'){
   const query=url.searchParams.get('q')||'';
   const text=query.includes('Bring')&&!query.includes('library')?'Trae tu tarjeta de socio.':'La biblioteca abre mañana.';
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({responseData:{translatedText:text},responseStatus:200})});
  }
  if(url.origin!==origin||!url.pathname.startsWith('/habla-ecuador/'))return route.abort();
  const file=path.resolve(root,decodeURIComponent(url.pathname.slice('/habla-ecuador/'.length))||'index.html');
  return file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.abort();
 });
 await page.goto(origin+'/habla-ecuador/'+entry+'?start=translate&ui=en');
 await page.locator('#source-language-select').selectOption('en-US');
 await page.locator('#target-language-select').selectOption('es-EC');
 const png=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=800;c.height=500;const x=c.getContext('2d');
  x.fillStyle='#e3f0e8';x.fillRect(0,0,800,500);x.fillStyle='#173f35';x.font='28px sans-serif';
  x.fillText('The library opens tomorrow.',80,90);x.fillText('Bring your membership card.',80,285);
  return c.toDataURL().split(',')[1];
 });
 const chooserPromise=page.waitForEvent('filechooser');await page.locator('#quick-camera-image').click();
 const chooser=await chooserPromise;await chooser.setFiles({name:'notice.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 const dialog=page.locator('#photo-translator');await dialog.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelectorAll('.photo-translation-label[data-ready="true"]').length===2);
 await page.waitForFunction(()=>{const image=document.querySelector('#photo-translator img');return image.complete&&image.naturalWidth>0&&image.getBoundingClientRect().height>0;},{},{timeout:10000}).catch(async error=>{
  console.error(await page.evaluate(()=>{const i=document.querySelector('#photo-translator img');return {src:i.src,complete:i.complete,naturalWidth:i.naturalWidth,width:i.clientWidth,height:i.clientHeight,style:getComputedStyle(i).cssText};}),requests);
  if(process.env.HABLA_PHOTO_SCREENSHOT)await page.screenshot({path:process.env.HABLA_PHOTO_SCREENSHOT});throw error;
 });
 if(width===390&&entry==='index.html'&&process.env.HABLA_PHOTO_SCREENSHOT)await page.screenshot({path:process.env.HABLA_PHOTO_SCREENSHOT});
 const labels=dialog.locator('.photo-translation-label');assert.equal(await labels.count(),2);
 assert.match(await labels.first().textContent(),/biblioteca/);
 assert.match(await labels.nth(1).textContent(),/tarjeta/);
 const geometry=await labels.first().evaluate(label=>{
  const a=label.getBoundingClientRect(),b=document.querySelector('.photo-translator-stage img').getBoundingClientRect();
  return {x:(a.x-b.x)/b.width,y:(a.y-b.y)/b.height,width:a.width/b.width};
 });
 assert.ok(Math.abs(geometry.x-.1)<.01,JSON.stringify(geometry));assert.ok(Math.abs(geometry.y-.1)<.01,JSON.stringify(geometry));assert.ok(Math.abs(geometry.width-.8)<.01,JSON.stringify(geometry));
 await labels.first().click();assert.match(await dialog.locator('[data-photo-detail]').textContent(),/The library.*\n\nLa biblioteca/s);
 await dialog.locator('[data-photo-original]').click();assert.equal(await dialog.locator('.photo-translator-labels').isVisible(),false);
 await dialog.locator('[data-photo-original]').click();assert.equal(await labels.first().isVisible(),true);
 await dialog.locator('[data-photo-copy]').click();assert.match((await page.evaluate(()=>__copies))[0],/biblioteca.*\n\nTrae/s);
 assert.ok(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1),'dialog must fit a narrow screen');
 if(width===390&&entry==='index.html'&&process.env.HABLA_PHOTO_SCREENSHOT)await page.screenshot({path:process.env.HABLA_PHOTO_SCREENSHOT});
 await dialog.locator('[data-photo-close]').click();assert.equal(await dialog.isVisible(),false);
 await page.locator('#quick-photo-overlay').click();await dialog.waitFor({state:'visible'});
 await dialog.locator('[data-photo-edit]').click();await page.locator('#translator-input').fill('Corrected original text.');
 assert.equal(await page.locator('#quick-photo-overlay').isVisible(),false,'edited source invalidates stale photo labels');
 assert.deepEqual(errors,[]);await context.close();console.log(`${entry} ${width}px photo positions, original toggle, full text, copy, reopen and edit invalidation passed`);
}
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 const browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox'],executablePath:process.env.HABLA_CHROMIUM_PATH}:{});
 try{for(const entry of ['index.html','translator.html'])for(const width of [320,390])await run(browser,entry,width);}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
