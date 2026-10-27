// Browser DOM + real companion JavaScript; recognition messages are synthetic.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,native,width=390){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
 await page.addInitScript(()=>{
  window.testMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>{if(window.failStart&&m.action==='start')throw Error('start failed');window.testMessages.push(m);}}}};
  class Recognition{start(){if(window.failStart)throw Error('start failed');window.testRecognition=this;window.testMessages.push({action:'start',lang:this.lang,continuous:this.continuous});}stop(){window.testMessages.push({action:'stop'});}abort(){window.testMessages.push({action:'abort'});}}
  window.SpeechRecognition=Recognition;
 });
 if(native)await page.addInitScript({path:native});
 await page.addInitScript(() => localStorage.setItem("habla-tutorial-seen-v2","1"));
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
 // Actual pointer hold/release: release requests stop, and a late final result
 // is retained without the trailing click starting another session.
 await mic.scrollIntoViewIfNeeded();
 const layout=()=>mic.evaluate(el=>({x:el.offsetLeft,y:el.offsetTop,width:el.offsetWidth,height:el.offsetHeight}));
 const beforeHold=await layout(),idleLabel=await mic.textContent();
 const box=await mic.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 assert.deepEqual(await layout(),beforeHold,'pending microphone cannot move the hold target');
 const micBackground=()=>mic.evaluate(el=>getComputedStyle(el).backgroundColor);
 const startingBackground=await micBackground();
 assert.notEqual(startingBackground,'rgb(243, 206, 105)','gold must not invite speech before capture is ready');
 assert.equal(await mic.textContent(),idleLabel);
 assert.equal(await panel.evaluate(el=>{const style=getComputedStyle(el.querySelector('.dictionary-practice-status'));return style.userSelect||style.webkitUserSelect;}),'none','long press cannot select status text while holding');
 await send({type:'start'});if(!native)await send({type:'audiostart'});
 assert.deepEqual(await layout(),beforeHold,'ready microphone cannot wrap to another row');
 assert.equal(await micBackground(),'rgb(243, 206, 105)','gold means the microphone is ready for speech');
 if(process.env.HABLA_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.HABLA_SCREENSHOT_DIR,`held-practice-${native?'native':'browser'}-${width}.png`)});
 assert.equal(await page.evaluate(()=>window.testMessages.findLast(m=>m.action==='start').continuous),true);
 await send({type:'result',text:'came',final:true});
 assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),false,'final passage does not finish the held attempt');
 await send({type:'result',text:'came',final:false});
 const starts=await page.evaluate(()=>window.testMessages.filter(m=>m.action==='start').length);
 await page.mouse.up();assert.equal(await mic.isDisabled(),true);
 assert.notEqual(await micBackground(),'rgb(243, 206, 105)','releasing the microphone clears the gold speak cue');
 await send({type:'result',text:'camello',final:true});await send({type:'end'});
 assert.equal(await page.evaluate(()=>window.testMessages.filter(m=>m.action==='start').length),starts);
 assert.match(await panel.locator('.dictionary-practice-score').textContent(),/100%/);
 // Mobile touch input has a different default-event sequence from a mouse.
 // A quick tap during startup must cancel without a trailing click reopening it.
 await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'quick touch release during startup cancels capture');
 assert.equal(await mic.getAttribute('aria-pressed'),'false');
 assert.equal(await mic.isEnabled(),true);
 if((process.env.HABLA_BROWSER_ENGINE||'chromium')==='chromium'){
  const touch=await context.newCDPSession(page),target=await mic.boundingBox();
  const point={x:target.x+target.width/2,y:target.y+target.height/2};
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});
  await send({type:'start'});if(!native)await send({type:'audiostart'});
  await send({type:'result',text:'came',final:false});
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x,y:point.y-14,id:1}]});
  assert.notEqual(await page.evaluate(()=>dictionaryPracticeSession),null,'finger drift does not turn a held microphone into page scrolling');
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await page.evaluate(()=>window.testMessages.at(-1).action),'stop','real touch release stops capture');
  const touchStarts=await page.evaluate(()=>window.testMessages.filter(m=>m.action==='start').length);
  await send({type:'result',text:'camello',final:true});await send({type:'end'});
  assert.equal(await page.evaluate(()=>window.testMessages.filter(m=>m.action==='start').length),touchStarts,'touch release never restarts capture');
  assert.match(await panel.locator('.dictionary-practice-score').textContent(),/100%/);
  await touch.detach();
 }
 await mic.focus();await page.keyboard.down('Space');await send({type:'start'});if(!native)await send({type:'audiostart'});
 await page.keyboard.up('Space');assert.equal(await page.evaluate(()=>window.testMessages.at(-1).action),'stop');await send({type:'end'});
 await mic.evaluate(el=>el.click());assert.equal(await mic.getAttribute('aria-pressed'),'true');
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/Starting microphone/);
 assert.equal(await panel.locator('select').isDisabled(),true);
 await send({type:'start'});
 if(!native){
  assert.match(await panel.locator('.dictionary-practice-status').textContent(),/Waiting for the microphone/);
  assert.equal(await mic.textContent(),idleLabel,'service start keeps a stable hold target');
  await send({type:'audiostart'});
 }
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/Microphone ready/);
 await send({type:'speechstart'});
 if(!native)assert.match(await panel.locator('.dictionary-practice-status').textContent(),/Speech detected/);
 await send({type:'result',text:'came',final:false});
 assert.equal(await panel.locator('.dictionary-practice-target').textContent(),'camello');
 assert.match(await panel.locator('.dictionary-practice-feedback').textContent(),/so far/);
 assert.match(await panel.locator('.dictionary-practice-progress-label').textContent(),/Tentative/);
 assert.equal(await panel.locator('.dictionary-practice-progress .word-pending').count(),1);
 await mic.evaluate(el=>el.click());assert.equal(await mic.isDisabled(),true);
 await send({type:'result',text:'¡Camello!',final:true});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-feedback').textContent(),/words match/);
 assert.equal(await panel.locator('.dictionary-practice-progress .word-heard').count(),1);
 assert.equal(await mic.getAttribute('aria-pressed'),'false');assert.equal(await panel.locator('select').isDisabled(),false);
 await mic.evaluate(el=>el.click());await send({type:'start'});await send({type:'result',text:'camino',final:true});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-feedback').textContent(),/differ/);
 assert.equal(await panel.locator('.dictionary-practice-coach').isVisible(),true);
 await panel.locator('.dictionary-practice-focus-hear').click();
 assert.equal(await page.evaluate(()=>window.spoken.at(-1).text),'camello');
 await mic.evaluate(el=>el.click());await send({type:'result',text:'camello',final:false});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-feedback').textContent(),/unconfirmed/,'provisional words do not earn a confirmed match');
 await mic.evaluate(el=>el.click());await send({type:'error',error:'not-allowed'});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/blocked/);
 await mic.evaluate(el=>el.click());await send({type:'error',error:'no-speech'});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/no transcript.*not scored/);
 assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),false);
 // Speech can be detected even when the provider returns no recognized words.
 await mic.evaluate(el=>el.click());await send({type:'start'});if(!native){await send({type:'audiostart'});await send({type:'speechstart'});}
 await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/speech service returned no transcript.*not scored/);
 assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),false);
 // Playback stops the practice mic before it can transcribe the model.
 await mic.evaluate(el=>el.click());await panel.locator('.dictionary-practice-hear').click();
 assert.equal(await page.evaluate(()=>window.testMessages.at(-1).action),'abort');
 assert.equal(await mic.getAttribute('aria-pressed'),'false');
 await mic.evaluate(el=>el.click());await panel.locator('summary').click();
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
 await learnerPanel.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 await send({type:'result',text:'Voy al partido con un del trabajo',final:true});await send({type:'end'});
 assert.match(await learnerPanel.locator('.dictionary-practice-coach').textContent(),/pana del trabajo/);
 await learnerPanel.locator('.dictionary-practice-focus-try').click();
 assert.equal(await learnerPanel.locator('.dictionary-practice-target').textContent(),'pana del trabajo');
 assert.equal(await learnerPanel.locator('.dictionary-practice-whole').textContent(),'Full prompt: '+example);
 await learnerPanel.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 await page.locator('.bottom-nav [data-open="translator-view"]').click();
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'tab change releases practice microphone');
 await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
 await panel.locator('summary').click();await mic.evaluate(el=>el.click());
 await page.locator('#regional-slang-search').fill('chiro');
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'filter replacement cancels old capture');
 const variants=page.locator('#regional-slang-results .dictionary-practice').first();await variants.locator('summary').click();
 assert.deepEqual(await variants.locator('option').allTextContents(),['chiro','chira']);
 await variants.locator('select').selectOption({label:'chira'});
 assert.equal(await variants.locator('.dictionary-practice-target').textContent(),'chira');
 await variants.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 const other=page.locator('#regional-slang-results .dictionary-practice').nth(1);
 if(await other.count()){await other.locator('summary').click();await other.locator('.dictionary-practice-mic').evaluate(el=>el.click());assert.equal(await variants.locator('.dictionary-practice-mic').getAttribute('aria-pressed'),'false');}
 await page.evaluate(()=>cancelDictionaryPractice());
 // Existing region-specific locale and English playback stay intact.
 await page.locator('#regional-slang-search').fill('');await page.locator('#regional-slang-region').selectOption('monterrey');
 const mexico=page.locator('#regional-slang-results .dictionary-practice').first();await mexico.locator('summary').click();await mexico.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 assert.equal(await page.evaluate(()=>window.testMessages.findLast(m=>m.action==='start').lang),'es-MX');
 await page.locator('#regional-slang-results [data-audio-lang="en-GB"]').first().click();
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null);
 assert.equal(await page.evaluate(()=>window.spoken.at(-1).lang),'en-GB');
 // Failed startup and backgrounding must release ownership and restore controls.
 await page.evaluate(()=>window.failStart=true);await mexico.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null);
 assert.equal(await mexico.locator('.dictionary-practice-mic').isDisabled(),false);
 await page.evaluate(()=>window.failStart=false);await mexico.locator('.dictionary-practice-mic').evaluate(el=>el.click());
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});});
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'backgrounding releases dictionary microphone');
 // A silent/broken provider cannot leave the microphone owned indefinitely.
 await page.clock.install();
 if(!native){
  await mexico.locator('.dictionary-practice-mic').evaluate(el=>el.click());await send({type:'start'});
  await page.clock.fastForward(8000);
  assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'service start without audio must time out without inviting speech');
  assert.match(await mexico.locator('.dictionary-practice-status').textContent(),/did not become ready.*not scored/);
  await send({type:'audiostart'});
  assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'late readiness cannot reopen a timed-out session');
  await mexico.locator('.dictionary-practice-mic').evaluate(el=>el.click());await send({type:'start'});
  await mexico.locator('.dictionary-practice-mic').evaluate(el=>el.click());
  assert.match(await mexico.locator('.dictionary-practice-status').textContent(),/still starting.*not scored/);
  assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'Cancel during startup releases microphone');
 }
 await mexico.locator('.dictionary-practice-mic').evaluate(el=>el.click());await send({type:'start'});
 if(!native){await page.clock.fastForward(6000);await send({type:'audiostart'});}
 await page.clock.fastForward(19999);
 assert.notEqual(await page.evaluate(()=>dictionaryPracticeSession),null,'full speaking window begins when audio is ready');
 await page.clock.fastForward(1);
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
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';const b=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});try{await run(b);await run(b,null,320);if(process.env.HABLA_NATIVE_SCRIPT)await run(b,process.env.HABLA_NATIVE_SCRIPT);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
