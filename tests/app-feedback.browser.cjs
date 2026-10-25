// Synthetic reports; share/clipboard/storage mocked. No real messages are sent.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io',home=origin+'/habla-ecuador/index.html';
(async()=>{const browser=await chromium.launch({args:['--no-sandbox']});try{
 for(const [width,lang,native] of [[320,'es',false],[320,'en',false],[390,'es',false],[390,'en',false],...(process.env.HABLA_NATIVE_SCRIPT?[[390,'es',true]]:[])]){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.abort();});
 await page.addInitScript(()=>{
  window.copies=[];window.shares=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>copies.push(text)}});
  Object.defineProperty(navigator,'share',{configurable:true,writable:true,value:async data=>{shares.push(data);}});
 });
 if(native){await page.addInitScript(()=>{window.webkit={messageHandlers:{hablaSpeech:{postMessage(){}}}};});await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});}
 await page.goto(home+'?start=dictionary&region=monterrey&ui='+lang+'&secret=DO_NOT_SEND');
 await page.evaluate(()=>{document.querySelector('#translator-input').value='Private synthetic source';setEditableTranslation('Private synthetic source','Private synthetic draft');localStorage.setItem('private-unrelated-record','DO_NOT_SEND');});
 const open=page.locator('.feedback-open'),dialog=page.locator('#app-feedback'),form=page.locator('#app-feedback-form'),preview=page.locator('#feedback-preview');
 await open.click();assert.equal(await dialog.isVisible(),true);assert.equal(await page.locator('#feedback-title').textContent(),lang==='es'?'Corregir algo':'Suggest a correction');assert.equal(await form.locator('[name=region]').inputValue(),'es-MX');assert.equal(await form.locator('[name=city]').inputValue(),'Monterrey, Nuevo León');assert.equal(await page.locator('#feedback-include-text').isChecked(),false);
 await page.locator('#feedback-share').click();assert.equal(await page.evaluate(()=>shares.length),0,'description required');
 assert.equal(await page.locator('#feedback-details').getAttribute('open'),null);assert.equal(await page.locator('#feedback-review').getAttribute('open'),null);
 assert.equal(await form.locator('textarea:visible').count(),1,'one visible field for the quick path');
 await form.locator('[name=problem]').fill('One quick correction.');
 await page.locator('#feedback-share').click();assert.equal(await page.evaluate(()=>shares.length),1,'one field can be shared');assert.ok((await page.evaluate(()=>shares[0].text)).includes('One quick correction.'));
 assert.equal(await page.locator('#feedback-details').getAttribute('open'),null,'quick sharing does not require optional details');
 await page.evaluate(()=>shares.length=0);
 if(width===390&&lang==='es'&&!native)await page.screenshot({path:'/tmp/habla-feedback-simple.png'});
 await page.locator('#feedback-details > summary').click();
 for(const topic of ['translation','regional','dictionary','pronunciation','lesson','interface','other'])await form.locator('[name=topic]').selectOption(topic);
 await form.locator('[name=problem]').fill('Neutral issue <script>not markup</script>');await form.locator('[name=correction]').fill('Neutral proposed correction');await form.locator('[name=reference]').fill('Copy');
 assert.ok(!(await preview.inputValue()).includes('Private synthetic'));assert.ok(!(await preview.inputValue()).includes('DO_NOT_SEND'));
 await page.locator('#feedback-include-text').check();assert.match(await preview.inputValue(),/Private synthetic source/);assert.match(await preview.inputValue(),/Private synthetic draft/);
 await page.locator('#feedback-include-text').uncheck();assert.ok(!(await preview.inputValue()).includes('Private synthetic'));
 await page.locator('#feedback-save').click();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('habla-feedback-draft-v1')));assert.equal(saved.problem,'Neutral issue <script>not markup</script>');assert.ok(saved.context.version.includes('build 126'));assert.equal(saved.includeText,false);assert.equal(saved.source,'');assert.equal(saved.translation,'');
 await page.locator('#feedback-copy').click();assert.equal(await page.evaluate(()=>copies.length),1);assert.ok(!(await page.evaluate(()=>copies.at(-1))).includes('Private synthetic'));
 await page.evaluate(()=>navigator.share=async()=>{throw {name:'AbortError'};});await page.locator('#feedback-share').click();assert.equal(await page.evaluate(()=>copies.length),1,'cancel does not copy');assert.equal(await form.locator('[name=problem]').inputValue(),'Neutral issue <script>not markup</script>');
 await page.evaluate(()=>navigator.share=data=>{shares.push(data);return new Promise(resolve=>window.finishShare=resolve);});await page.locator('#feedback-share').click();assert.equal(await page.locator('#feedback-share').isDisabled(),true);assert.equal(await page.locator('#feedback-fields').evaluate(el=>el.disabled),true);assert.equal(await page.evaluate(()=>shares.length),1);
 const shared=await page.evaluate(()=>shares[0]);assert.deepEqual(Object.keys(shared).sort(),['text','title']);assert.ok(!shared.text.includes('DO_NOT_SEND'));assert.ok(!shared.text.includes('Private synthetic'));await page.evaluate(()=>finishShare());await page.waitForFunction(()=>!document.querySelector('#feedback-share').disabled);
 await page.evaluate(()=>HablaUI.set(HablaUI.language==='es'?'en':'es'));assert.equal(await form.locator('[name=reference]').inputValue(),'Copy');assert.equal(await form.locator('[name=correction]').inputValue(),'Neutral proposed correction');
 await page.locator('#feedback-close').click();assert.equal(await dialog.isVisible(),false);assert.equal(await open.evaluate(el=>document.activeElement===el),true);
 // Reporting another entry must not overwrite an unfinished draft.
 const entry=page.locator('[data-feedback-reference]').first();const reference=await entry.getAttribute('data-feedback-reference');await entry.evaluate(el=>el.scrollIntoView({block:'center'}));await page.waitForTimeout(150);await entry.click();assert.equal(await form.locator('[name=reference]').inputValue(),'Copy');
 await page.locator('#feedback-clear').click();await page.locator('#feedback-close').click();await entry.evaluate(el=>el.scrollIntoView({block:'center'}));await page.waitForTimeout(150);await entry.click();assert.equal(await form.locator('[name=reference]').inputValue(),reference);assert.equal(await form.locator('[name=topic]').inputValue(),'regional');
 await form.locator('[name=problem]').fill('A regional observation.');await page.locator('#feedback-save').click();assert.equal(await page.locator('#translator-input').inputValue(),'Private synthetic source');assert.equal(await page.locator('#natural-result').textContent(),'Private synthetic draft');await page.reload();await open.click();await page.locator('#feedback-review > summary').click();assert.equal(await form.locator('[name=reference]').inputValue(),reference);assert.equal(await form.locator('[name=problem]').inputValue(),'A regional observation.');
 await page.evaluate(()=>navigator.share=undefined);await page.locator('#feedback-share').click();assert.equal(await page.evaluate(()=>copies.length),1,'unsupported share copies the current report');
 await page.evaluate(()=>navigator.clipboard.writeText=async()=>{throw Error('blocked');});await page.locator('#feedback-copy').click();assert.equal(await preview.evaluate(el=>el.selectionEnd-el.selectionStart),await preview.evaluate(el=>el.value.length),'manual copying remains possible');
 await page.evaluate(()=>{const old=Storage.prototype.setItem;window.restoreStorage=()=>Storage.prototype.setItem=old;Storage.prototype.setItem=function(k,v){if(k==='habla-feedback-draft-v1')throw Error('full');return old.call(this,k,v);};});await form.locator('[name=problem]').fill('Unsaved after storage failure');await page.locator('#feedback-save').click();assert.equal(await form.locator('[name=problem]').inputValue(),'Unsaved after storage failure');await page.evaluate(()=>restoreStorage());
 assert.equal(await page.locator('#app-feedback script').count(),0);assert.equal(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width),true);
 const size=await dialog.boundingBox();assert.ok(size.width<=width&&size.height<=844*.87);if(width===390&&lang==='es')await page.screenshot({path:'/tmp/habla-feedback.png'});
 await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false);assert.equal(await page.locator('#translator-input').inputValue(),'','reload resets the normal source editor, not feedback data');
 assert.deepEqual(errors,[]);await context.close();console.log(`${native?'Native companion ':''}${width}px ${lang}: topics, Monterrey prefill, explicit text opt-in, validation, save/reload, unsaved guard, share/cancel/fallback, storage failure, focus and narrow dialog passed`);
 }
 // Standalone and every view retain the same global feedback control.
 const ctx=await browser.newContext(),p=await ctx.newPage();await p.route('**/*',r=>{const u=new URL(r.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.abort();});
 await p.goto(home.replace('index.html','translator.html')+'?ui=es');await p.locator('.feedback-open').click();assert.equal(await p.locator('#app-feedback').isVisible(),true);await p.locator('#feedback-close').click();
 for(const view of ['home-view','translator-view','dictionary-view','review-view','music-view','lesson-view']){await p.evaluate(v=>openView(v),view);await p.locator('.feedback-open').click();assert.equal(await p.locator('#app-feedback').isVisible(),true);await p.locator('#feedback-close').click();}
 await p.goto(home+'?start=dictionary&region=es-VE&city=caracas&ui=es');await p.locator('.feedback-open').click();assert.equal(await p.locator('#app-feedback-form [name=region]').inputValue(),'es-VE');assert.equal(await p.locator('#app-feedback-form [name=city]').inputValue(),'Caracas');await p.locator('#feedback-close').click();
 await p.evaluate(()=>localStorage.setItem('habla-feedback-draft-v1','broken JSON'));await p.reload();await p.locator('.feedback-open').click();assert.match(await p.locator('#feedback-status').textContent(),/No se pudo leer/);assert.equal(await p.locator('#app-feedback-form [name=problem]').isEnabled(),true);
 await ctx.close();console.log('Feedback: Caracas prefill, corrupt draft recovery, standalone and all six app views passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
