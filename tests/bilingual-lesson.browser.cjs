// Real lesson DOM, synthetic speech/playback boundaries; no audio or messages sent.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,width,native){
 // This suite serves checkout files through routing, including on reload.
 // Real service-worker update behavior has its own HTTP-based browser suite.
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()&&!f.endsWith('.mp3')?r.fulfill({path:f}):r.abort();});
 await page.addInitScript(()=>{
  window.testMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>testMessages.push(m)}}};
  class Recognition{start(){window.testRecognition=this;testMessages.push({action:'start',lang:this.lang});}stop(){testMessages.push({action:'stop'});}abort(){testMessages.push({action:'abort'});}}
  window.SpeechRecognition=Recognition;
 });
 if(native)await page.addInitScript({path:native});
 const mockPlayback=()=>page.evaluate(()=>{window.spoken=[];window.say=(text,lang)=>spoken.push({text,lang});});
 async function result(text){await page.evaluate(({text,native})=>{
  if(native)__hablaNativeSpeech({id:testMessages.findLast(m=>m.action==='start').id,type:'result',text,final:true});
  else{const r=[{transcript:text}];r.isFinal=true;testRecognition.onresult({results:[r]});}
 },{text,native:Boolean(native)});}
 const phrase='What time does the sun set?',spanish='¿A qué hora se pone el sol?';
 await page.goto(origin+'/habla-ecuador/index.html?ui=es');await mockPlayback();
 assert.match(await page.locator('.lesson-card .card-kicker').textContent(),/inglés/);
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 assert.equal(await page.locator('#lesson-content').getAttribute('data-target-language'),'en-US');
 assert.match(await page.locator('#lesson-learning-goal').textContent(),/Aprende inglés/);
 assert.equal(await page.locator('#recorded-practice').isVisible(),false);assert.equal(await page.locator('#source-practice').isVisible(),false);
 assert.equal(await page.locator('.lesson-target').textContent(),phrase);assert.equal(await page.locator('.lesson-meaning').textContent(),spanish);
 await page.locator('#lesson-play').click();assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:phrase,lang:'en-US'});
 await page.locator('#lesson-next').click();
 assert.match(await page.locator('#lesson-mic-instructions').textContent(),/^Toca el micrófono/);
 await page.locator('#lesson-mic').click();assert.equal(await page.evaluate(()=>testMessages.findLast(m=>m.action==='start').lang),'en-US');
 await result(phrase);assert.equal(await page.locator('#lesson-speaking-prompt .english').textContent(),phrase);
 assert.match(await page.locator('#lesson-heard').textContent(),/palabras clave/);
 await page.locator('#lesson-next').click();assert.equal(await page.evaluate(()=>recognition),null,'changing steps closes old microphone');
 assert.equal(await page.locator('.choice [data-ui-content]').first().textContent(),phrase,'English answer is never translated by Spanish UI');
 await page.locator('.choice[data-correct="true"]').click();assert.match(await page.locator('.choice small').textContent(),/Inglés cotidiano natural/);
 await page.locator('#lesson-next').click();
 assert.equal(await page.locator('.map-card').count(),4);
 for(const b of await page.locator('.map-card [data-say]').all()){const text=await b.getAttribute('data-say');await b.click();assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text,lang:'en-US'});}
 await page.locator('#lesson-language').selectOption('en-GB');assert.equal(await page.locator('#lesson-step-count').textContent(),'1/4');
 await page.locator('#lesson-play').click();assert.equal(await page.evaluate(()=>spoken.at(-1).lang),'en-GB');
 await page.locator('#lesson-next').click();await page.locator('#lesson-mic').click();assert.equal(await page.evaluate(()=>testMessages.findLast(m=>m.action==='start').lang),'en-GB');
 await page.evaluate(()=>{document.querySelector('#translator-input').value='Neutral saved source';setEditableTranslation('Neutral saved source','Borrador neutral');});
 await page.locator('#lesson-language').selectOption('es-EC');assert.equal(await page.evaluate(()=>recognition),null,'goal change cancels old speech');
 assert.equal(await page.locator('#lesson-step-count').textContent(),'1/4');
 assert.equal(await page.locator('#source-practice').isVisible(),true);assert.equal(await page.locator('#recorded-practice').isVisible(),true);
 await page.locator('#lesson-play').click();assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:spanish,lang:'es-EC'});
 assert.equal(await page.locator('#translator-input').inputValue(),'Neutral saved source');assert.equal(await page.locator('#natural-result').textContent(),'Borrador neutral');
 await page.reload();assert.equal(await page.locator('#lesson-language').inputValue(),'es-EC','explicit learning goal survives reload');
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 await page.locator('#lesson-language').selectOption('');assert.equal(await page.locator('#lesson-content').getAttribute('data-target-language'),'en-US');
 await page.locator('#interface-language').selectOption('en');assert.equal(await page.locator('#lesson-content').getAttribute('data-target-language'),'es-EC','automatic goal follows English UI back to Spanish learning');
 await page.locator('#interface-language').selectOption('es');assert.equal(await page.locator('#lesson-content').getAttribute('data-target-language'),'en-US');
 await page.locator('#lesson-next').click();await page.locator('#lesson-mic').click();
 await page.locator('.bottom-nav [data-open="home-view"]').click();assert.equal(await page.evaluate(()=>recognition),null,'leaving lesson closes capture');
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();assert.equal(await page.locator('#lesson-speaking-prompt .english').textContent(),phrase);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(process.env.HABLA_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.HABLA_SCREENSHOT_DIR,`english-lesson-${width}.png`)});
 assert.deepEqual(errors,[]);await context.close();console.log(`${native?'Native bridge':'Browser'} ${width}px: English learning in Spanish UI, all four steps, US/UK playback/recognition, protected learning text, goal persistence, automatic/manual switching and capture cleanup passed`);
}
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});try{await run(browser,320);await run(browser,390);if(process.env.HABLA_NATIVE_SCRIPT)await run(browser,390,process.env.HABLA_NATIVE_SCRIPT);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
