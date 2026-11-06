// Real translation-practice UI; only the operating-system speech provider is simulated.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
try{for(const file of ['index.html','translator.html']){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage();
 await page.addInitScript(()=>{localStorage.setItem('habla-tutorial-seen-v2','1');window.SpeechRecognition=class{start(){window.feedbackRecognition=this;}stop(){}abort(){}};});
 await page.route('**/*',r=>{const u=new URL(r.request().url()),p=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(p)&&fs.statSync(p).isFile()?r.fulfill({path:p}):r.abort();});
 await page.goto('https://mathewdmoore.github.io/habla-ecuador/'+file);
 if(file==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').tap();
 await page.evaluate(()=>{
  sourceLanguage='en-US';targetLanguage='es-PA';syncLanguagePair();
  document.querySelector('#translator-input').value="I don't know if I want to work on this application tonight.";
  setEditableTranslation(document.querySelector('#translator-input').value,'No sé si quiero trabajar en esta aplicación esta noche.');
  document.querySelector('#translation-result').hidden=false;
 });
 await page.locator('#practice-translation').tap();
 const panel=page.locator('#translation-speaking-practice .dictionary-practice'),mic=panel.locator('.dictionary-practice-mic');
 const attempt=async(text,final)=>{
  await mic.evaluate(el=>el.click());
  await page.evaluate(({text,final})=>{
   const r=window.feedbackRecognition;r.onstart?.();r.onaudiostart?.();
   if(text){const result=[{transcript:text}];result.isFinal=final;r.onresult({results:[result]});}
  },{text,final});
  await mic.evaluate(el=>el.click());await page.evaluate(()=>feedbackRecognition.onend());
 };
 await attempt('No sé si quiero trabajare en esta aplicación esta noche',false);
 assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),true);
 assert.match(await panel.locator('.dictionary-practice-score').textContent(),/Tentative.*90%/);
 assert.equal(await panel.locator('.dictionary-practice-coach').isVisible(),true);
 assert.match(await panel.locator('.dictionary-practice-coach p').textContent(),/trabajar en esta/);
 await attempt('No sé si quiero trabajar en esta aplicación esta noche',true);
 assert.match(await panel.locator('.dictionary-practice-score').textContent(),/Recognized-word score: 100%/);
 await attempt('',false);
 assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),false);
 assert.match(await panel.locator('.dictionary-practice-status').textContent(),/no transcript.*not scored/);
 await context.close();console.log(engine+' '+file+': tentative/confirmed feedback, targeted retry, and empty attempt passed');
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
