// Synthetic passages: verify selected words, language and editing in the real UI.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const engine=playwright[process.env.HABLA_BROWSER_ENGINE||'chromium'];
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,file){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const u=new URL(route.request().url()),p=path.resolve(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&p.startsWith(root+'/')&&fs.existsSync(p)&&fs.statSync(p).isFile()?route.fulfill({path:p}):route.abort();});
 await page.addInitScript(()=>{
  localStorage.setItem('habla-tutorial-seen-v2','1');window.spoken=[];
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'es-MX',name:'Spanish'},{lang:'en-US',name:'English'}],cancel(){},resume(){},speak(u){window.spoken.push({text:u.text,lang:u.lang});u.onstart?.();}}});
 });
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate');
 await page.waitForSelector('#selected-passage-tools',{state:'attached'});
 await page.evaluate(()=>{
  musicTranscriptReview=true;sourceLanguage='es-EC';targetLanguage='en-US';
  document.querySelector('#translator-input').value='Antes. Buenos días. Después.';
  setEditableTranslation('Antes. Buenos días. Después.','Before. Good morning. After.');
  document.querySelector('#translation-result').hidden=false;
 });
 async function select(selector,start,end){await page.locator(selector).evaluate((el,{start,end})=>{
  el.focus();if(el.tagName==='TEXTAREA')el.setSelectionRange(start,end);
  else{const r=document.createRange();r.setStart(el.firstChild,start);r.setEnd(el.firstChild,end);getSelection().removeAllRanges();getSelection().addRange(r);}
  document.dispatchEvent(new Event('selectionchange'));
 },{start,end});}
 await select('#translator-input',7,18);
 await page.locator('#hear-selected-passage').click();
 assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:'Buenos días.',lang:'es-MX'});
 await page.locator('#pause-selected-passage').click();assert.match(await page.locator('#pause-selected-passage').textContent(),/Resume/);
 await page.locator('#pause-selected-passage').click();assert.match(await page.locator('#pause-selected-passage').textContent(),/Pause/);
 await page.locator('#stop-selected-passage').click();assert.equal(await page.locator('#pause-selected-passage').isDisabled(),true);
 await select('#natural-result',8,21);await page.locator('#hear-selected-passage').click();
 assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:'Good morning.',lang:'en-US'});
 await page.locator('#translation-full-text').click();
 await select('#full-reader-source',7,18);
 assert.equal(await page.locator('dialog #selected-passage-tools').count(),1);
 await page.locator('#hear-selected-passage').click();assert.equal(await page.evaluate(()=>spoken.at(-1).text),'Buenos días.');
 await page.locator('#full-reader-close').click();assert.equal(await page.locator('#selected-passage-tools').isVisible(),false);
 await select('#translator-input',7,18);await page.keyboard.insertText('Hola.');
 assert.equal(await page.locator('#translator-input').inputValue(),'Antes. Hola. Después.');
 assert.equal(await page.locator('#selected-passage-tools').isVisible(),false);
 assert.deepEqual(errors,[]);await context.close();console.log(file+': selected source/draft speech, correct languages, pause/resume/stop, modal and replacement editing passed');
}
(async()=>{const b=await engine.launch({headless:true,executablePath:process.env.HABLA_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});try{await run(b,'index.html');await run(b,'translator.html');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
