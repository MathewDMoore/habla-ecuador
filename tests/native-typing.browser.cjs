// Native input probe: event metadata only. Does not emulate Apple's keyboard.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),hosted=path.resolve(process.env.HABLA_HOSTED_ROOT||root),origin='https://mathewdmoore.github.io';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for (const enabled of [false,true]) {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url()),p=path.join(hosted,u.pathname.replace('/habla-ecuador/',''));
   if(u.origin!==origin||!u.pathname.startsWith('/habla-ecuador/')||!fs.existsSync(p)||/\.mp3$/.test(p))return r.abort();
   return r.fulfill({path:p});});
  await page.addInitScript(enabled=>{
   window.__hablaTypingDiagnostics=enabled;window.typingRecords=[];
   window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>{if(m.action==='typing-diagnostic')window.typingRecords.push(m);}}}};
  },enabled);
  await page.addInitScript({path:path.join(root,'ios/HablaEcuador/NativeSpeech.js')});
  await page.goto(origin+'/habla-ecuador/index.html?start=translate');
  await page.waitForSelector('#native-translation-workspace');
  const input=page.locator('#translator-input');
  await page.evaluate(()=>{musicTranscriptReview=true;document.querySelector('#translator-input').value='Neutral fixture source';});
  await input.focus();await input.evaluate(el=>el.select());await page.keyboard.insertText('Replacement fixture');
  await input.evaluate(el=>{
   el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true,data:'Hidden event contents'}));
   el.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true,inputType:'insertCompositionText',data:'Hidden event contents'}));
   el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'Hidden event contents'}));
   const transfer=new DataTransfer();transfer.setData('text/plain','Hidden clipboard contents');
   el.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,clipboardData:transfer}));
  });
  const records=await page.evaluate(()=>window.typingRecords),serialized=JSON.stringify(records);
  if (!enabled) {
   assert.deepEqual(records,[],'ordinary launches install no diagnostic listeners');
   assert.equal(await input.inputValue(),'Replacement fixture');
   assert.ok(!(await page.locator('#native-speech-details summary').first().textContent()).includes('input diagnostics'));
   assert.deepEqual(errors,[]);await page.close();
   console.log('Native typing probe: default off, normal replacement, quiet label and no diagnostic messages passed');
   continue;
  }
  assert.ok(records.some(r=>r.event==='beforeinput'&&r.phase==='before'));
  assert.ok(records.some(r=>r.event==='input'&&r.phase==='after'&&r.textUnits==='Replacement fixture'.length));
  assert.ok(records.some(r=>r.event==='input'&&r.composing&&r.inputType==='insertCompositionText'));
  assert.ok(records.some(r=>r.event==='compositionend'));
  assert.ok(records.some(r=>r.event==='paste'));
  for(const sensitive of ['Neutral fixture source','Replacement fixture','Hidden event contents','Hidden clipboard contents'])assert.ok(!serialized.includes(sensitive),'no text, key or clipboard data');
  const allowed=['action','id','event','phase','sequence','milliseconds','inputType','textUnits','selectionStart','selectionEnd','dataUnits','focused','composing','cancelable','defaultPrevented'];
  for(const r of records)assert.ok(Object.keys(r).every(k=>allowed.includes(k)));
  assert.deepEqual(errors,[]);
  console.log('Native typing probe: opt-in event counts, selection, composition and paste privacy passed; Swift launch gate untested');
  await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
