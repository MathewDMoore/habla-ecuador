// No real share sheet, message or email is sent. Browser APIs are mocked.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io',home=origin+'/habla-ecuador/index.html';
async function run(browser,native,width=390){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
 await page.addInitScript(()=>{
  window.testShares=[];window.testCopies=[];window.testMessages=[];
  Object.defineProperty(navigator,'share',{configurable:true,writable:true,value:data=>{window.testShares.push(data);return new Promise(resolve=>window.finishShare=resolve);}});
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testCopies.push(text);}}});
  window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>window.testMessages.push(m)}}};
 });
 if(native)await page.addInitScript({path:native});
 await page.goto(home+'?secret=private-query&text=private-source');
 await page.evaluate(()=>{document.querySelector('#translator-input').value='Private translation source';localStorage.setItem('private-fixture','Private saved note');});
 assert.equal(await page.locator('#regional-slang-region').inputValue(),'es-EC','ordinary startup remains Ecuadorian first');
 const panel=page.locator('.app-sharing');await panel.locator('summary').click();
 assert.equal(await page.locator('#app-share-link').inputValue(),home+'?ui=es');
 await page.locator('#app-share-region').selectOption('monterrey');
 await page.locator('#app-share-language').selectOption('en');assert.equal(new URL(await page.locator('#app-share-link').inputValue()).searchParams.get('ui'),'en');
 await page.locator('#app-share-language').selectOption('es');
 const monterrey=await page.locator('#app-share-link').inputValue();
 assert.equal(monterrey,home+'?start=dictionary&region=monterrey&ui=es');
 await page.locator('#share-app').click();
 assert.equal(await page.locator('#share-app').isDisabled(),true);assert.equal(await page.locator('#app-share-region').isDisabled(),true);
 await page.evaluate(()=>shareApp());assert.equal(await page.evaluate(()=>window.testShares.length),1,'duplicate sharing guarded');
 const shared=await page.evaluate(()=>window.testShares[0]);
 assert.deepEqual(Object.keys(shared).sort(),['text','title','url']);assert.equal(shared.url,monterrey);
 assert.ok(!JSON.stringify(shared).includes('private'),'no source, history or current URL parameters in invitation');
 await page.evaluate(()=>window.finishShare());await page.waitForFunction(()=>!document.querySelector('#share-app').disabled);
 assert.match(await page.locator('#app-share-status').textContent(),/completed/);
 await page.evaluate(()=>navigator.share=async()=>{throw {name:'AbortError'};});
 await page.locator('#share-app').click();await page.waitForFunction(()=>!document.querySelector('#share-app').disabled);
 assert.match(await page.locator('#app-share-status').textContent(),/cancelled/);assert.equal(await page.evaluate(()=>window.testCopies.length),0,'cancellation never copies');
 await page.evaluate(()=>navigator.share=undefined);
 await page.locator('#app-share-region').selectOption('es-VE');const venezuela=await page.locator('#app-share-link').inputValue();
 await page.locator('#share-app').click();await page.waitForFunction(()=>!document.querySelector('#share-app').disabled);
 assert.equal(await page.evaluate(()=>window.testCopies.at(-1)),venezuela);
 assert.match(await page.locator('#app-share-status').textContent(),/copied/);
 await page.evaluate(()=>navigator.share=()=>{throw Error('Copy link must not invoke sharing');});
 await page.locator('#copy-app-link').click();await page.waitForFunction(()=>!document.querySelector('#share-app').disabled);
 assert.equal(await page.evaluate(()=>window.testCopies.length),2);
 await page.evaluate(()=>navigator.clipboard.writeText=async()=>{throw Error('clipboard blocked');});
 await page.locator('#copy-app-link').click();await page.waitForFunction(()=>!document.querySelector('#share-app').disabled);
 assert.match(await page.locator('#app-share-status').textContent(),/Select and copy/);
 assert.equal(await page.locator('#app-share-link').evaluate(el=>el.selectionEnd-el.selectionStart),venezuela.length);
 assert.equal(await page.locator('#translator-input').inputValue(),'Private translation source');
 assert.equal(await page.evaluate(()=>localStorage.getItem('private-fixture')),'Private saved note');
 assert.ok(!await page.evaluate(()=>window.testMessages.some(m=>m.action==='share-translation')),'app sharing never borrows the native translation bridge');
 assert.ok(await page.evaluate(width=>document.documentElement.scrollWidth<=width,width));
 for(const [url,region] of [[monterrey,'monterrey'],[venezuela,'es-VE']]){
  await page.goto(url);assert.equal(await page.locator('#dictionary-view').evaluate(el=>el.classList.contains('active')),true);
  assert.equal(await page.locator('#regional-slang-region').inputValue(),region);
  assert.ok(await page.locator('#regional-slang-results .regional-slang-card').count()>0);
  assert.equal(await page.locator('#target-language-select').inputValue(),'es-EC','shared dictionary choice does not rewrite translator defaults');
 }
 await page.goto(home+'?start=dictionary&region=es-VE&city=caracas&ui=es');
 assert.equal(await page.locator('#regional-slang-region').inputValue(),'es-VE');
 assert.match(await page.locator('#shared-app-context').textContent(),/La revisión específica de Caracas está pendiente/);
 await page.locator('#regional-slang-region').selectOption('es-BO');assert.equal(await page.locator('#shared-app-context').isVisible(),false);
 await page.evaluate(()=>document.querySelector('#shared-app-context').remove());
 await page.locator('#regional-slang-region').selectOption('es-MX');
 await page.locator('#home-button').click();await page.locator('.app-sharing summary').click();
 await page.locator('#app-share-region').selectOption('caracas');
 assert.equal(await page.locator('#app-share-link').inputValue(),home+'?start=dictionary&region=es-VE&city=caracas&ui=es');
 await page.goto(home+'?start=dictionary&region=unknown');
 assert.equal(await page.locator('#home-view').evaluate(el=>el.classList.contains('active')),true);
 assert.equal(await page.locator('#regional-slang-region').inputValue(),'es-EC');
 await page.goto(home.replace('index.html','translator.html'));
 if(!native){assert.equal(await page.locator('#translator-view').evaluate(el=>el.classList.contains('active')),true);await page.locator('#home-button').click();await page.locator('.app-sharing summary').click();assert.equal(await page.locator('#share-app').isVisible(),true);}
 else await page.waitForURL('**/index.html?start=translate');
 assert.deepEqual(errors,[]);await context.close();console.log(`${native?'Native bridge JavaScript':'Browser'} ${width}px: share/cancel/copy/manual, privacy, duplicate guard, regional invitations and standalone launch passed`);
}
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});try{await run(b);await run(b,null,320);if(process.env.HABLA_NATIVE_SCRIPT)await run(b,process.env.HABLA_NATIVE_SCRIPT);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
