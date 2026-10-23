// Browser DOM + real companion JavaScript; recognition messages are synthetic.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,native,width=390){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
 await page.addInitScript(()=>{
  window.testMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>{if(window.failStart&&m.action==='start')throw Error('start failed');window.testMessages.push(m);}}}};
  class Recognition{start(){if(window.failStart)throw Error('start failed');window.testRecognition=this;window.testMessages.push({action:'start',lang:this.lang,continuous:this.continuous});}stop(){window.testMessages.push({action:'stop'});}abort(){window.testMessages.push({action:'abort'});}}
  window.SpeechRecognition=Recognition;
 });
 if(native)await page.addInitScript({path:native});
 await page.goto(origin+'/habla-ecuador/index.html');
 await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
 await page.waitForSelector('#dictionary-results .dictionary-practice');
 await page.evaluate(()=>{window.spoken=[];window.say=(text,lang)=>window.spoken.push({text,lang});});
 const card=page.locator('#regional-slang-results .regional-slang-card').filter({has:page.locator('h3',{hasText:/^camello$/})});
 const panel=card.locator('.dictionary-practice'),mic=panel.locator('.dictionary-practice-mic');
 await panel.locator('summary').click();
 assert.equal(await panel.locator('.dictionary-practice-target').textContent(),'camello');
 await panel.locator('.dictionary-practice-hear').click();
 assert.deepEqual(await page.evaluate(()=>window.spoken.at(-1)),{text:'camello',lang:'es-EC'});
 async function send(message){await page.evaluate(({message,native})=>{
  if(native){window.__hablaNativeSpeech({...message,id:window.testMessages.findLast(m=>m.action==='start').id});return;}
  const r=window.testRecognition;
  if(message.type==='result'){const result=[{transcript:message.text}];result.isFinal=Boolean(message.final);r.onresult({results:[result]});}
  else r['on'+message.type]?.(message);
 },{message,native:Boolean(native)});}
 await mic.click();assert.equal(await mic.getAttribute('aria-pressed'),'true');
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/Starting microphone/);
 assert.equal(await panel.locator('select').isDisabled(),true);
 await send({type:'start'});await send({type:'result',text:'came',final:false});
 assert.equal(await panel.locator('.dictionary-practice-target').textContent(),'camello');
 assert.match(await panel.locator('.dictionary-practice-feedback').textContent(),/so far/);
 assert.match(await panel.locator('.dictionary-practice-progress-label').textContent(),/Tentative/);
 assert.equal(await panel.locator('.dictionary-practice-progress .word-pending').count(),1);
 await mic.click();assert.equal(await mic.isDisabled(),true);
 await send({type:'result',text:'¡Camello!',final:true});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-feedback').textContent(),/words match/);
 assert.equal(await panel.locator('.dictionary-practice-progress .word-heard').count(),1);
 assert.equal(await mic.getAttribute('aria-pressed'),'false');assert.equal(await panel.locator('select').isDisabled(),false);
 await mic.click();await send({type:'start'});await send({type:'result',text:'camino',final:true});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-feedback').textContent(),/differ/);
 assert.equal(await panel.locator('.dictionary-practice-coach').isVisible(),true);
 await panel.locator('.dictionary-practice-focus-hear').click();
 assert.equal(await page.evaluate(()=>window.spoken.at(-1).text),'camello');
 await mic.click();await send({type:'result',text:'camello',final:false});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-feedback').textContent(),/unconfirmed/,'provisional words do not earn a confirmed match');
 await mic.click();await send({type:'error',error:'not-allowed'});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/blocked/);
 await mic.click();await send({type:'error',error:'no-speech'});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/No speech/);
 // Playback stops the practice mic before it can transcribe the model.
 await mic.click();await panel.locator('.dictionary-practice-hear').click();
 assert.equal(await page.evaluate(()=>window.testMessages.at(-1).action),'abort');
 assert.equal(await mic.getAttribute('aria-pressed'),'false');
 await mic.click();await panel.locator('summary').click();
 await page.waitForFunction(()=>dictionaryPracticeSession===null);
 assert.equal(await mic.getAttribute('aria-pressed'),'false');
 // Every card family in the supplied recording gets the same in-place practice.
 const expr=page.locator('#expression-results .expression-card').filter({has:page.locator('.expression-spanish',{hasText:'aniñado'})}).first();
 const exprPanel=expr.locator('.dictionary-practice');await exprPanel.locator('summary').click();
 assert.ok(await exprPanel.locator('select option').count()>=2,'expression word and example are practice choices');
 const learner=page.locator('#dictionary-results .evidence-card').filter({has:page.locator('h2',{hasText:/^pana$/})});
 const learnerPanel=learner.locator('.dictionary-practice');await learnerPanel.locator('summary').click();
 const example=(await learnerPanel.locator('option').allTextContents()).find(t=>t.includes('partido'));
 assert.ok(example);await learnerPanel.locator('select').selectOption({label:example});
 assert.equal(await learnerPanel.locator('.dictionary-practice-target').textContent(),example);
 await learnerPanel.locator('.dictionary-practice-hear').click();
 assert.equal(await page.evaluate(()=>window.spoken.at(-1).text),example);
 await learnerPanel.locator('.dictionary-practice-mic').click();
 await send({type:'result',text:'Voy al partido con un del trabajo',final:true});await send({type:'end'});
 assert.match(await learnerPanel.locator('.dictionary-practice-coach').textContent(),/pana del trabajo/);
 await learnerPanel.locator('.dictionary-practice-focus-try').click();
 assert.equal(await learnerPanel.locator('.dictionary-practice-target').textContent(),'pana del trabajo');
 assert.equal(await learnerPanel.locator('.dictionary-practice-whole').textContent(),'Full prompt: '+example);
 await learnerPanel.locator('.dictionary-practice-mic').click();
 await page.locator('.bottom-nav [data-open="translator-view"]').click();
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'tab change releases practice microphone');
 await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
 await panel.locator('summary').click();await mic.click();
 await page.locator('#regional-slang-search').fill('chiro');
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'filter replacement cancels old capture');
 const variants=page.locator('#regional-slang-results .dictionary-practice').first();await variants.locator('summary').click();
 assert.deepEqual(await variants.locator('option').allTextContents(),['chiro','chira']);
 await variants.locator('select').selectOption({label:'chira'});
 assert.equal(await variants.locator('.dictionary-practice-target').textContent(),'chira');
 await variants.locator('.dictionary-practice-mic').click();
 const other=page.locator('#regional-slang-results .dictionary-practice').nth(1);
 if(await other.count()){await other.locator('summary').click();await other.locator('.dictionary-practice-mic').click();assert.equal(await variants.locator('.dictionary-practice-mic').getAttribute('aria-pressed'),'false');}
 await page.evaluate(()=>cancelDictionaryPractice());
 // Existing region-specific locale and English playback stay intact.
 await page.locator('#regional-slang-search').fill('');await page.locator('#regional-slang-region').selectOption('monterrey');
 const mexico=page.locator('#regional-slang-results .dictionary-practice').first();await mexico.locator('summary').click();await mexico.locator('.dictionary-practice-mic').click();
 assert.equal(await page.evaluate(()=>window.testMessages.findLast(m=>m.action==='start').lang),'es-MX');
 await page.locator('#regional-slang-results [data-audio-lang="en-GB"]').first().click();
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null);
 assert.equal(await page.evaluate(()=>window.spoken.at(-1).lang),'en-GB');
 // Failed startup and backgrounding must release ownership and restore controls.
 await page.evaluate(()=>window.failStart=true);await mexico.locator('.dictionary-practice-mic').click();
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null);
 assert.equal(await mexico.locator('.dictionary-practice-mic').isDisabled(),false);
 await page.evaluate(()=>window.failStart=false);await mexico.locator('.dictionary-practice-mic').click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});});
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'backgrounding releases dictionary microphone');
 // A silent/broken provider cannot leave the microphone owned indefinitely.
 await page.clock.install();await mexico.locator('.dictionary-practice-mic').click();
 await page.clock.fastForward(20000);
 assert.equal(await page.evaluate(()=>window.testMessages.at(-1).action),'stop');
 await page.clock.fastForward(3000);
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'provider end timeout releases practice');
 assert.equal(await mexico.locator('.dictionary-practice-mic').getAttribute('aria-pressed'),'false');
 assert.equal(await page.evaluate(()=>dictionaryPracticeText('Ñaño')===dictionaryPracticeText('nano')),false);
 assert.equal(await page.evaluate(()=>dictionaryPracticeText('¡Qué frío!')===dictionaryPracticeText('que frio')),true);
 // Unsupported recognition is explicit, with model playback still available.
 await page.evaluate(()=>{window.SpeechRecognition=window.webkitSpeechRecognition=undefined;renderRegionalSlang();});
 const unsupported=page.locator('#regional-slang-results .dictionary-practice').first();await unsupported.locator('summary').click();
 assert.equal(await unsupported.locator('.dictionary-practice-mic').isDisabled(),true);
 assert.match(await unsupported.locator('.dictionary-practice-status').textContent(),/unavailable/);
 assert.equal(await unsupported.locator('.dictionary-practice-hear').isEnabled(),true);
 assert.ok(await page.evaluate(width=>document.documentElement.scrollWidth<=width,width),'no horizontal overflow');
 assert.deepEqual(errors,[]);await context.close();console.log(`${native?'Native bridge':'Browser'} ${width}px: three card families, word/example/variant, locale, matching, errors and lifecycle passed`);
}
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});try{await run(b);await run(b,null,320);if(process.env.HABLA_NATIVE_SCRIPT)await run(b,process.env.HABLA_NATIVE_SCRIPT);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
