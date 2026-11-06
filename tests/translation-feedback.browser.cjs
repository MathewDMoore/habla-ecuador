// Real translation-practice UI; only the operating-system speech provider is simulated.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
try{for(const file of ['index.html','translator.html'])for(const width of [320,390]){
 const context=await browser.newContext({viewport:{width,height:667},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage();
 await page.addInitScript(()=>{localStorage.setItem('habla-tutorial-seen-v2','1');window.SpeechRecognition=class{start(){window.feedbackRecognition=this;}stop(){}abort(){}};});
 await page.route('**/*',r=>{const u=new URL(r.request().url()),p=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(p)&&fs.statSync(p).isFile()?r.fulfill({path:p}):r.abort();});
 await page.goto('https://mathewdmoore.github.io/habla-ecuador/'+file+'?ui=es');
 if(file==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').tap();
 await page.evaluate(()=>{
  sourceLanguage='en-US';targetLanguage='es-PA';syncLanguagePair();
  document.querySelector('#translator-input').value="I don't know if I want to work on this application tonight.";
  setEditableTranslation(document.querySelector('#translator-input').value,'No sé si quiero trabajar en esta aplicación esta noche.');
  document.querySelector('#translation-result').hidden=false;
 });
 const opener=page.locator('#practice-translation');
 await opener.scrollIntoViewIfNeeded();const box=await opener.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 assert.equal(await page.locator('#translation-speaking-practice .dictionary-practice').isVisible(),true,'holding the entry opens practice before finger release');
 assert.equal(await opener.evaluate(el=>getComputedStyle(el).webkitUserSelect||getComputedStyle(el).userSelect),'none');
 await page.locator('#translation-speaking-practice .dictionary-practice').evaluate(el=>el.dataset.retained='yes');
 await page.mouse.up();await opener.tap();
 assert.equal(await page.locator('#translation-speaking-practice .dictionary-practice').getAttribute('data-retained'),'yes','trailing clicks preserve the active practice panel');
 await page.waitForFunction(()=>{const r=document.querySelector('#natural-result').getBoundingClientRect();return r.top>=0&&r.top<120;},{},{timeout:3000});
 await page.waitForTimeout(300);
 const panel=page.locator('#translation-speaking-practice .dictionary-practice'),mic=panel.locator('.dictionary-practice-mic');
 const layout=await page.evaluate(()=>{
  const text=document.querySelector('#natural-result'),host=document.querySelector('#translation-speaking-practice'),mic=host.querySelector('.dictionary-practice-mic');
  return {adjacent:text.nextElementSibling===host,textTop:text.getBoundingClientRect().top,textBottom:text.getBoundingClientRect().bottom,micTop:mic.getBoundingClientRect().top,micBottom:mic.getBoundingClientRect().bottom,height:innerHeight};
 });
 assert.equal(layout.adjacent,true,'practice comes before copy, playback and alternatives');
 assert.ok(layout.textTop>=0&&layout.micBottom<layout.height-65,'translation and microphone fit together above bottom navigation');
 assert.ok(layout.micTop-layout.textBottom<190,'no intervening secondary controls');
 assert.equal(await panel.locator('.translation-practice-controls .dictionary-practice-status').count(),1,'readiness stays beside the microphone when scrolling');
 const attempt=async(text,final)=>{
  await mic.tap();
  assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),false,'each attempt starts without an old grade');
  assert.equal(await panel.locator('.dictionary-practice-progress span').count(),0,'old missing-word highlights are cleared');
  assert.equal(await panel.locator('.dictionary-practice-heard').textContent(),'');
  await page.evaluate(({text,final})=>{
   const r=window.feedbackRecognition;r.onstart?.();r.onaudiostart?.();
   if(text){const result=[{transcript:text}];result.isFinal=final;r.onresult({results:[result]});}
  },{text,final});
  await mic.tap();await page.evaluate(()=>feedbackRecognition.onend());
 };
 await attempt('No sé si quiero trabajare en esta aplicación esta noche',false);
 assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),true);
 assert.match(await panel.locator('.dictionary-practice-score').textContent(),/Tentative.*90%/);
 assert.equal(await panel.locator('.dictionary-practice-coach').isVisible(),true);
 await page.waitForTimeout(400);
 const pinned=await panel.locator('.translation-practice-controls').boundingBox();
 if(!(pinned.y>=0&&pinned.y+pinned.height<602)){
  console.log('LAYOUT_DEBUG '+JSON.stringify(await page.evaluate(()=>({scrollY,innerHeight,active:document.activeElement?.id,source:document.querySelector('#translator-input').getBoundingClientRect().toJSON(),target:document.querySelector('#natural-result').getBoundingClientRect().toJSON(),ancestors:Array.from(document.querySelectorAll('#translation-speaking-practice,.translation-speaking-card,.dictionary-practice,.translation-practice-controls')).map(el=>({name:el.className||el.id,rect:el.getBoundingClientRect().toJSON(),position:getComputedStyle(el).position,overflow:getComputedStyle(el).overflow}))}))));
  console.log('LAYOUT_IMAGE '+(await page.screenshot()).toString('base64'));
 }
 assert.ok(pinned.y>=0&&pinned.y+pinned.height<602,'sentence and microphone remain visible while reading feedback: '+JSON.stringify(pinned));
 assert.match(await panel.locator('.dictionary-practice-coach p').textContent(),/trabajar en esta/);
 await attempt('No sé si quiero trabajar en esta aplicación esta noche',true);
 assert.match(await panel.locator('.dictionary-practice-score').textContent(),/(?:Recognized-word score|Coincidencia de palabras): 100%/);
 for(let repeat=0;repeat<3;repeat++){await attempt('No sé si quiero trabajar en esta aplicación esta noche',true);assert.match(await panel.locator('.dictionary-practice-score').textContent(),/100%/);}
 await attempt('',false);
 assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),false);
 assert.equal(await panel.locator('.dictionary-practice-score').textContent(),'');
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/no transcript.*not scored|no devolvió texto.*no se puntuó/i);
 await context.close();console.log(engine+' '+file+': tentative/confirmed feedback, targeted retry, and empty attempt passed');
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
