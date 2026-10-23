// Real editing regression; neutral text only, no user recording or translations.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,file,native){
 const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await c.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const u=new URL(route.request().url()),p=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  if(u.origin!==origin||!u.pathname.startsWith('/habla-ecuador/')||!fs.existsSync(p)||/\.mp3$/.test(p))return route.abort();
  return route.fulfill({path:p});
 });
 if(native){
  await page.addInitScript(()=>{window.__hablaSystemAudioSupported=window.__hablaSongIdentificationSupported=true;window.testMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>window.testMessages.push(m)}}};});
  await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});
 }else await page.addInitScript(()=>{window.testRecognizers=[];window.SpeechRecognition=class{constructor(){window.testRecognizers.push(this);}start(){this.onstart?.();}abort(){this.aborted=true;}stop(){}};});
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate');
 await page.waitForFunction(()=>typeof setEditableTranslation==='function');
 if(native)await page.waitForSelector('#native-translation-workspace');
 const source=page.locator('#translator-input'),target=page.locator('#natural-result');
 await page.evaluate(()=>{musicTranscriptReview=true;document.querySelector('#translator-input').value='First neutral sentence.';});
 await source.focus();await source.evaluate(el=>el.select());await page.keyboard.type('New source');
 assert.equal(await source.inputValue(),'New source','typing replaces all selected source');
 await source.evaluate(el=>el.setSelectionRange(4,10));await page.keyboard.insertText('texto');
 assert.equal(await source.inputValue(),'New texto','partial replacement, including Unicode input');
 await page.keyboard.press('Control+z');assert.equal(await source.inputValue(),'New source','replacement keeps native undo');
 // No interim speech event may overwrite a deliberate manual edit.
 await page.locator('#input-mic').click();
 async function speech(text){await page.evaluate(({text,native})=>{
  if(native){const id=window.testMessages.findLast(m=>m.action==='start').id;window.__hablaNativeSpeech({id,type:'result',text,final:false});}
  else{const r=window.testRecognizers.at(-1),a=[{transcript:text}];a.isFinal=false;r.onresult({results:[a]});}
 },{text,native});}
 await speech('Recognized neutral source');
 await source.focus();await source.evaluate(el=>el.select());await page.keyboard.type('My edit');
 await speech('Late recognition must be ignored');
 assert.equal(await source.inputValue(),'My edit','late ordinary dictation cannot overwrite typed selection replacement');
 // The same deletion-to-empty sequence occurs in replacement/IME editing.
 await page.evaluate(()=>{setEditableTranslation('My edit','Original draft');document.querySelector('#translation-result').hidden=false;});
 await target.focus();await target.evaluate(el=>{const r=document.createRange();r.selectNodeContents(el);getSelection().removeAllRanges();getSelection().addRange(r);});
 await page.keyboard.press('Backspace');
 assert.equal(await target.textContent(),'','deleting selected draft must not immediately restore its generated text');
 await page.keyboard.insertText('Edited draft');assert.equal(await target.textContent(),'Edited draft');
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>lastCompletedTranslation.target),'Edited draft');
 // IME composition and an unfinished empty edit must not erase a saved gloss.
 await target.focus();await target.evaluate(el=>{
  el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
  el.textContent='';el.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true,inputType:'insertCompositionText',data:''}));
 });
 assert.equal(await target.textContent(),'','composition remains in charge of its temporary empty text');
 await target.evaluate(el=>{el.textContent='Edición nueva';el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'Edición nueva'}));});
 assert.equal(await page.evaluate(()=>lastCompletedTranslation.target),'Edición nueva');
 await target.evaluate(el=>{el.textContent='';el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'deleteContentBackward'}));});
 assert.equal(await target.textContent(),'');
 await page.keyboard.press('Tab');
 assert.equal(await target.textContent(),'Edición nueva','abandoning an empty edit restores the last saved edit, not the generated draft');
 if(native){
  await page.evaluate(()=>{document.querySelector('.bottom-nav [data-open="music-view"]').click();document.querySelector('#music-live-translation').checked=false;});
  await page.locator('#music-listen').click();await speech('Captured music words');
  await source.focus();await source.evaluate(el=>el.select());await page.keyboard.type('Corrected words');
  await speech('Old music callback');assert.equal(await source.inputValue(),'Corrected words');
  assert.equal(await page.locator('#music-listen').getAttribute('aria-pressed'),'false');
 }
 assert.deepEqual(errors,[]);await c.close();console.log(file+(native?' native':' browser')+': source selection replacement, undo, speech isolation, composition and draft replacement passed');
}
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox']});try{await run(b,'index.html',false);await run(b,'translator.html',false);if(process.env.HABLA_NATIVE_SCRIPT)await run(b,'index.html',true);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
