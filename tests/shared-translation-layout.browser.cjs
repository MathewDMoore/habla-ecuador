// Real DOM geometry; synthetic editable text; no providers, audio or messages.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
(async()=>{const browser=await chromium.launch({args:['--no-sandbox']});try{
 for(const width of [320,390])for(const ui of ['es','en'])for(const native of [false,...(process.env.HABLA_NATIVE_SCRIPT?[true]:[])])for(const file of ['index.html','translator.html']){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.abort();});
 if(native){await page.addInitScript(()=>{window.webkit={messageHandlers:{hablaSpeech:{postMessage(){}}}};});await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});}
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate&ui='+ui);await page.waitForFunction(()=>typeof setEditableTranslation==='function');
 if(native)await page.waitForSelector('#native-translation-workspace');
 const source=page.locator('#translator-input'),result=page.locator('#natural-result');
 await page.evaluate(()=>{document.querySelector('#translator-input').value='A neutral source.';setEditableTranslation('A neutral source.','Una traducción neutral.');document.querySelector('#translation-result').hidden=false;});
 const check=async()=>{
  assert.equal(await source.count(),1);assert.equal(await result.count(),1);
  const geometry=await page.evaluate(()=>{const input=document.querySelector('#translator-input'),s=input.closest('.input-card'),r=document.querySelector('#translation-result'),a=s.getBoundingClientRect(),b=r.getBoundingClientRect();return {gap:b.top-a.bottom,adjacent:s.nextElementSibling===r||s.nextElementSibling?.id==='translation-empty-target'||s.nextElementSibling?.id==='native-empty-translation',width:document.documentElement.scrollWidth,viewport:innerWidth};});
  assert.equal(geometry.adjacent,true,JSON.stringify(geometry));assert.ok(Math.abs(geometry.gap)<=1,JSON.stringify(geometry));assert.ok(geometry.width<=geometry.viewport);
 };
 await check();
 assert.equal(await source.inputValue(),'A neutral source.');assert.equal(await result.textContent(),'Una traducción neutral.');
 await source.evaluate(el=>{el.focus();el.setSelectionRange(2,8);});await page.locator('#interface-language').selectOption(ui==='es'?'en':'es');await check();assert.equal(await source.evaluate(el=>el.selectionEnd-el.selectionStart),6);
 if(!native){assert.equal(await page.locator('#translation-setup').getAttribute('open'),null);await page.locator('#translation-setup > summary').click();await check();assert.equal(await page.locator('#choose-document').isVisible(),true);await page.locator('#translation-setup > summary').click();}
 if(native){await page.locator('.bottom-nav [data-open="music-view"]').click();await check();await page.locator('.bottom-nav [data-open="translator-view"]').click();await check();}
 await page.evaluate(()=>{document.querySelector('#translation-result').hidden=true;document.querySelector('#music-live-preview').hidden=true;});
 assert.equal(await page.locator(native?'#native-empty-translation':'#translation-empty-target').isVisible(),true,'empty target remains next to source');
 if(width===390&&ui==='es'&&!native&&file==='index.html'){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/habla-paired-layout.png',fullPage:false});}
 assert.deepEqual(errors,[]);await context.close();console.log(`${file} ${width}px ${ui} ${native?'native companion':'web'}: adjoining source/target, setup isolation, empty target, original text and selection passed`);
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
