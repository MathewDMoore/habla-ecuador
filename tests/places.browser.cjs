const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const countries=['EC','BO','MX','VE','PE','CO','CU','AR','CL','CR','DO','SV','GT','HN','NI','PA','PY','PR','ES','UY','GQ'].map(x=>'es-'+x);
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
try{for(const file of ['index.html','translator.html']){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage();
 await page.addInitScript(()=>localStorage.setItem('habla-tutorial-seen-v2','1'));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.protocol==='blob:')return r.continue();const p=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(p)&&fs.statSync(p).isFile()?r.fulfill({path:p}):r.abort()});
 await page.goto('https://mathewdmoore.github.io/habla-ecuador/'+file);
 for(const id of ['source-language-select','target-language-select','conversation-spanish-language','regional-slang-region','regional-slang-target','app-share-region']){
  const values=await page.locator('#'+id+' option').evaluateAll(options=>options.map(o=>o.value));
  for(const code of countries)assert.ok(values.includes(code),id+' includes '+code);
 }
 if(file==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').click();
 await page.locator('[data-mode="conversation"]').click();await page.locator('#conversation-spanish-language').selectOption('es-AR');
 await page.reload();if(file==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').click();await page.locator('[data-mode="conversation"]').click();
 assert.equal(await page.locator('#conversation-spanish-language').inputValue(),'es-AR','new regional choice persists');
 const link=await page.evaluate(()=>publicAppShareUrl('es-CL','es'));assert.equal(new URL(link).searchParams.get('region'),'es-CL');
 assert.equal(await page.evaluate(link=>sharedAppRegion(new URL(link).searchParams),link),'es-CL','shared country is accepted');
 await page.locator('[data-mode="translate"]').click();
 await page.locator('#whatsapp-audio-import summary').click();
 // Synthetic silent WAV checks file decoding/UI only; it proves no speech capture.
 const wav=Buffer.alloc(16044);wav.write('RIFF');wav.writeUInt32LE(16036,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
 await page.locator('#whatsapp-audio-file').setInputFiles({name:'voice-note.wav',mimeType:'audio/wav',buffer:wav});
 await page.waitForFunction(()=>document.querySelector('#whatsapp-audio-player').readyState>=1).catch(async e=>{console.log(await page.locator('#whatsapp-audio-player').evaluate(p=>({src:p.src,error:p.error?.code,networkState:p.networkState,readyState:p.readyState})));throw e;});
 assert.equal(await page.locator('#whatsapp-audio-player').evaluate(p=>p.src.startsWith('blob:')),true,'audio stays in a local object URL');
 assert.match(await page.locator('#whatsapp-audio-status').textContent(),/voice-note.wav/);
 await page.locator('#whatsapp-audio-clear').click();assert.equal(await page.locator('#whatsapp-audio-player').isVisible(),false);
 await page.locator('#whatsapp-audio-file').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('not audio')});
 assert.match(await page.locator('#whatsapp-audio-status').textContent(),/Select an audio file/);
 await context.close();console.log(file+': all 21 country choices, saved new locale and share link passed');
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
