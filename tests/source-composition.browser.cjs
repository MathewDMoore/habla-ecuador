// Composition lifecycle regression. Synthetic IME events do not emulate iOS QuickPath.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,file,nativeFile){
 const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await c.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const u=new URL(route.request().url()),p=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  if(u.origin!==origin||!u.pathname.startsWith('/habla-ecuador/')||!fs.existsSync(p)||/\.mp3$/.test(p))return route.abort();
  return route.fulfill({path:p});
 });
 if(nativeFile){
  await page.addInitScript(()=>{window.__hablaSystemAudioSupported=window.__hablaSongIdentificationSupported=true;window.webkit={messageHandlers:{hablaSpeech:{postMessage(){}}}};});
  await page.addInitScript({path:nativeFile});
 }
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate');
 await page.waitForFunction(()=>typeof setEditableTranslation==='function');
 if(nativeFile)await page.waitForSelector('#native-translation-workspace');
 await page.evaluate(()=>{
  window.testTranslations=[];
  requestGeneralTranslation=async text=>{window.testTranslations.push(text);return 'Completed neutral draft';};
  document.querySelector('#translator-input').value='Original neutral paragraph.';
  setEditableTranslation('Original neutral paragraph.','Existing completed output');
  document.querySelector('#translation-result').hidden=false;
 });
 const input=page.locator('#translator-input');await input.focus();await input.evaluate(el=>el.select());
 // An earlier input already queued translation. Composition must stop that timer,
 // even before the keyboard changes the selected text or sends a composing input.
 await input.evaluate(el=>{el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertFromPaste'}));el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));});
 await page.waitForTimeout(700);
 assert.deepEqual(await page.evaluate(()=>window.testTranslations),[],'queued translation must not render during source composition');
 assert.equal(await page.locator('#natural-result').textContent(),'Existing completed output');
 await input.evaluate(el=>{el.value='Temporary marked word';el.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true,inputType:'insertCompositionText',data:'word'}));});
 await page.waitForTimeout(700);
 assert.deepEqual(await page.evaluate(()=>window.testTranslations),[],'a pause in marked text must not translate the unfinished word');
 assert.equal(await input.inputValue(),'Temporary marked word');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'translator-input');
 // Ending composition must work even when there is no trailing non-composing input.
 await input.evaluate(el=>{el.value='Final replacement paragraph.';el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'Final replacement paragraph.'}));});
 await page.waitForTimeout(700);
 assert.deepEqual(await page.evaluate(()=>window.testTranslations),['Final replacement paragraph.']);
 assert.equal(await input.inputValue(),'Final replacement paragraph.');
 assert.equal(await page.locator('#natural-result').textContent(),'Completed neutral draft');
 // A pre-composition response must also be rejected while the source still
 // equals the original value; checking only the text string is insufficient.
 await page.evaluate(()=>{
  window.testTranslations=[];
  requestGeneralTranslation=text=>new Promise(resolve=>{window.resolveEarlier=resolve;window.testTranslations.push(text);});
  window.pendingEarlier=renderTranslation();
 });
 await input.evaluate(el=>el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true})));
 await page.evaluate(async()=>{window.resolveEarlier('Stale pre-composition output');await window.pendingEarlier;});
 assert.notEqual(await page.locator('#natural-result').textContent(),'Stale pre-composition output');
 await page.evaluate(()=>{requestGeneralTranslation=async text=>{window.testTranslations.push(text);return 'Committed output';};});
 await input.evaluate(el=>{el.value='Committed after earlier request';el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:el.value}));});
 await page.waitForTimeout(700);
 assert.equal(await page.locator('#natural-result').textContent(),'Committed output');
 await input.evaluate(el=>{el.value='Final replacement paragraph.';el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertReplacementText',data:el.value}));});
 await page.waitForTimeout(700);
 assert.equal(await input.inputValue(),'Final replacement paragraph.','word-based replacement event uses the normal committed path');
 // Normal selected-range replacement, paste, and browser undo are still native.
 await input.evaluate(el=>el.select());await page.keyboard.insertText('Tapped replacement');
 assert.equal(await input.inputValue(),'Tapped replacement');
 await page.keyboard.press('Control+z');assert.equal(await input.inputValue(),'Final replacement paragraph.');
 await page.waitForTimeout(700);
 assert.deepEqual(errors,[]);await c.close();
 console.log(`${file}${nativeFile?' native bridge':''}: queued render, unfinished input, focus, composition commit, selected replacement and undo passed; physical QuickPath untested`);
}
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox']});try{await run(b,'index.html');await run(b,'translator.html');if(process.env.HABLA_NATIVE_SCRIPT)await run(b,'index.html',process.env.HABLA_NATIVE_SCRIPT);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
