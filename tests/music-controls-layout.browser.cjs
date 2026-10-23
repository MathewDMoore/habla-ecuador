// Real layout with the installed native script; short viewports approximate a
// raised keyboard. This is not an iPhone/WebKit keyboard automation test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
const native=process.env.HABLA_NATIVE_SCRIPT;
if(!native)throw Error('Set HABLA_NATIVE_SCRIPT to the installed companion NativeSpeech.js');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {for(const [width,height] of [[390,380],[390,320],[390,844],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const u=new URL(route.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));
   if(u.origin!==origin||!u.pathname.startsWith('/habla-ecuador/')||!fs.existsSync(file)||/\.mp3$/.test(file))return route.abort();
   return route.fulfill({path:file});});
  await page.addInitScript(()=>{window.__hablaSystemAudioSupported=window.__hablaSongIdentificationSupported=true;window.webkit={messageHandlers:{hablaSpeech:{postMessage(){}}}};});
  await page.addInitScript({path:native});
  await page.goto(origin+'/habla-ecuador/index.html?start=translate');
  await page.waitForSelector('#native-translation-workspace');
  await page.locator('.bottom-nav [data-open="music-view"]').click();
  await page.evaluate(()=>{
   musicTranscriptReview=true;
   document.querySelector('#translator-input').value='A neutral source paragraph for editing.';
   setEditableTranslation('A neutral source paragraph for editing.','An editable translated paragraph.');
   document.querySelector('#translation-result').hidden=false;
  });
  const card=page.locator('#native-capture-controls');
  for(const selector of ['#translator-input','#natural-result']){
   const editor=page.locator(selector);await editor.focus();await editor.evaluate(el=>el.scrollIntoView({block:'center'}));
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const geometry=await editor.evaluate(el=>{
    const c=document.querySelector('#native-capture-controls').getBoundingClientRect(),e=el.getBoundingClientRect();
    return {cardTop:c.top,cardBottom:c.bottom,editorTop:e.top,editorBottom:e.bottom,
     overlap:Math.min(c.bottom,e.bottom)>Math.max(c.top,e.top)+1,
     position:getComputedStyle(document.querySelector('#native-capture-controls')).position};
   });
   assert.equal(geometry.overlap,false,`${width}x${height} ${selector} must not be covered by capture card: ${JSON.stringify(geometry)}`);
   assert.equal(geometry.position,'static','hosted rule overrides later native sticky inline style');
  }
  // Controls are still available in Music and remain the original hooked-up nodes.
  await card.evaluate(el=>el.scrollIntoView({block:'start'}));
  assert.equal(await page.locator('#music-listen').isVisible(),true);
  assert.equal(await page.locator('#music-playback-source').isVisible(),true);
  assert.equal(await page.locator('#music-listen').count(),1);
  assert.equal(await page.locator('#native-capture-status').getAttribute('role'),'status');
  // Switching back to Translate restores the editors without bringing this card.
  await page.locator('.bottom-nav [data-open="translator-view"]').click();
  assert.equal(await card.isVisible(),false);
  assert.equal(await page.locator('#translator-input').inputValue(),'A neutral source paragraph for editing.');
  assert.equal(await page.locator('#natural-result').textContent(),'An editable translated paragraph.');
  assert.deepEqual(errors,[]);await context.close();console.log(`Music controls ${width}x${height}: flow, editor visibility, controls and tab preservation passed`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
