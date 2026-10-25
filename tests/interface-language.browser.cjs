// Neutral fixtures only. No messages or translation requests are sent.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io',home=origin+'/habla-ecuador/index.html';
(async()=>{const browser=await chromium.launch({args:['--no-sandbox']});try{
 for(const [width,native] of [[390,false],[320,false],...(process.env.HABLA_NATIVE_SCRIPT?[[390,true],[320,true]]:[])]){
 const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
 await ctx.addInitScript(()=>{class Recognition{start(){window.testRecognition=this;}stop(){this.onend?.();}abort(){this.onend?.();}}window.SpeechRecognition=Recognition;});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.abort();});
 if(native){await page.addInitScript(()=>{window.webkit={messageHandlers:{hablaSpeech:{postMessage:()=>{}}}};});await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});}
 await page.goto(home);assert.equal(await page.locator('html').getAttribute('lang'),'en');
 const original=await page.locator('select[id], #slang-contribution-form select').evaluateAll(els=>els.map(el=>[el.id,Array.from(el.options).map(o=>o.value)]));
 await page.evaluate(()=>localStorage.setItem('habla-ui-language-v1','en'));
 await page.goto(home+'?start=dictionary&region=monterrey&ui=es');
 await page.waitForFunction(()=>document.querySelector('.bottom-nav').textContent.includes('Diccionario'));
 assert.equal(await page.locator('html').getAttribute('lang'),'es');assert.equal(await page.locator('#interface-language').getAttribute('aria-label'),'Idioma de la interfaz');assert.equal(await page.locator('#regional-slang-region').inputValue(),'monterrey');
 assert.equal(await page.locator('#target-language-select').inputValue(),'es-EC');
 assert.equal(await page.evaluate(()=>localStorage.getItem('habla-ui-language-v1')),'es');
 assert.deepEqual(await page.locator('select[id], #slang-contribution-form select').evaluateAll(els=>els.map(el=>[el.id,Array.from(el.options).map(o=>o.value)])),original,'UI translation preserves every canonical option value');
 await page.evaluate(()=>{openView('review-view');document.querySelector('#slang-contributions').open=true;});
 const form=page.locator('#slang-contribution-form');
 await form.locator('[name=term]').fill('Copy');await form.locator('[name=meaning]').fill('Family');await form.locator('[name=example]').fill('All');
 await form.locator('[name=region]').selectOption('Mexico');
 await form.evaluate(el=>el.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 await page.waitForFunction(()=>document.querySelector('#slang-contribution-export').value.includes('SIN VERIFICAR'));
 const report=await page.locator('#slang-contribution-export').inputValue();assert.ok(report.includes('Copy')&&report.includes('Family')&&report.includes('All'));assert.match(report,/México/);assert.ok(!report.includes('addition'));
 await form.locator('[name=meaning]').fill('Unsaved neutral edit');
 await page.evaluate(()=>{const el=document.querySelector('#translator-input');el.value='Copy All Family';el.setSelectionRange(0,4);document.querySelector('#natural-result').textContent='Copy';});
 await page.locator('#interface-language').selectOption('en');
 assert.equal(await form.locator('[name=meaning]').inputValue(),'Unsaved neutral edit');
 assert.equal(await page.locator('#translator-input').inputValue(),'Copy All Family');assert.equal(await page.locator('#natural-result').textContent(),'Copy');
 assert.match(await page.locator('.bottom-nav [data-open="dictionary-view"]').textContent(),/Dictionary$/);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('habla-slang-contributions-v1'))[0]);assert.equal(stored.term,'Copy');assert.equal(stored.region,'Mexico');assert.equal(stored.task,'addition');
 await page.locator('#interface-language').selectOption('es');
 assert.equal(await page.locator('#translator-input').evaluate(el=>el.selectionStart),0);assert.equal(await page.locator('#translator-input').evaluate(el=>el.selectionEnd),4);
 await page.evaluate(()=>{const p=document.createElement('p');p.id='test-dynamic-ui';p.textContent='Entry 2 of 79';document.body.append(p);const p2=document.createElement('p');p2.id='test-private';p2.dataset.uiContent='';p2.textContent='Family';document.body.append(p2);});
 await page.waitForFunction(()=>document.querySelector('#test-dynamic-ui').textContent==='Entrada 2 de 79');assert.equal(await page.locator('#test-private').textContent(),'Family');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no page overflow');
 await page.screenshot({path:'/tmp/habla-spanish-'+width+'.png'});
 // Capture untranslated UI for editorial review, excluding actual learning/private content.
 const unknown=[];for(const view of ['home-view','translator-view','dictionary-view','review-view','music-view','lesson-view']){await page.evaluate(id=>openView(id),view);await page.waitForTimeout(100);unknown.push(...await page.evaluate(()=>{document.querySelectorAll('details').forEach(el=>el.open=true);const protectedRoots='script,style,textarea,input,[translate="no"],[data-ui-content],.spanish,.english,.translation-text,.regional-gloss,.english-gloss,.expression-example,.evidence-example,.dictionary-practice-target,.dictionary-practice-heard,.source-practice-meaning';const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),out=[];let n;while(n=walk.nextNode()){const s=n.nodeValue.trim();if(n.parentElement.closest(protectedRoots)||!n.parentElement.getClientRects().length)continue;if(/\b(the|your|with|for|not|and|English|Spanish|Choose|Review|Hear|Source|Saved|pending)\b/.test(s))out.push(s);}return [...new Set(out)];}));}
 fs.writeFileSync('/tmp/habla-ui-unknown-'+width+'.json',JSON.stringify(unknown,null,2));
 await page.evaluate(()=>{openView('lesson-view');document.querySelector('#recorded-practice').open=true;});
 const prompt=page.locator('#recorded-practice .dictionary-practice-target');const words=await prompt.textContent();
 const video=page.locator('#recorded-practice-video');await video.evaluate(v=>{window.savedVideo=v;});
 await page.locator('#interface-language').selectOption('en');await page.locator('#interface-language').selectOption('es');
 assert.equal(await prompt.textContent(),words);assert.equal(await video.evaluate(v=>v===window.savedVideo),true,'UI switch preserves video object');
 if(!native){await page.locator('#recorded-practice .dictionary-practice-mic').click();await page.evaluate(text=>{const r=window.testRecognition,result=[{transcript:text}];result.isFinal=true;r.onresult({results:[result]});r.onend?.();},words);await page.waitForFunction(()=>document.querySelector('#recorded-practice .dictionary-practice-score')?.textContent.includes('No es una puntuación de pronunciación.'));assert.equal(await prompt.textContent(),words);}
 for(const step of [2,3,4]){await page.evaluate(n=>{lessonStep=n;renderLesson();},step);await page.waitForTimeout(30);assert.ok(!/Read along|Ask the question|Choose the most|Finish lesson/.test(await page.locator('#lesson-content').textContent()));}
 await page.goto(home+'?start=dictionary&region=es-VE&city=caracas&ui=es');assert.equal(await page.locator('#regional-slang-region').inputValue(),'es-VE');
 assert.deepEqual(errors,[]);await ctx.close();console.log((native?'Native companion / ':'')+'Spanish interface '+width+'px: preference, invitations, canonical form values, private content, selection, unsaved edits, exports, dynamic labels and overflow passed');
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
