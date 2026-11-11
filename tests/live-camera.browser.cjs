const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright'),root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,entry){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[],cameraQueries=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  localStorage.setItem('habla-tutorial-seen-v2','1');
  window.__cameraWords='The museum opens at nine.';window.__cameraCalls=[];window.__copies=[];window.__ocrCalls=0;window.__workers=0;window.__activeOcr=0;window.__maxOcr=0;window.__terminated=0;
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__copies.push(text)}});
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async constraints=>{
   window.__cameraCalls.push(constraints);if(window.__denyCamera)throw Object.assign(new Error('Denied'),{name:'NotAllowedError'});
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=500;const ctx=canvas.getContext('2d');
   let phase=false;const draw=()=>{phase=!phase;ctx.fillStyle=window.__movingCamera?(phase?'#555':'#fff'):'#e2f1e6';ctx.fillRect(0,0,800,500);ctx.fillStyle='#173f35';ctx.font='30px sans-serif';ctx.fillText(window.__cameraWords,80,140);};draw();
   const timer=setInterval(draw,100),stream=canvas.captureStream(15),track=stream.getVideoTracks()[0],stop=track.stop.bind(track);
   track.stop=()=>{clearInterval(timer);stop();};window.__stream=stream;
   if(window.__delayCamera)await new Promise(resolve=>window.__releaseCamera=resolve);
   return stream;
  }}});
  window.Tesseract={createWorker:async()=>{window.__workers++;return {recognize:async(frame,opts,output)=>{
   window.__ocrCalls++;window.__activeOcr++;window.__maxOcr=Math.max(window.__maxOcr,window.__activeOcr);
   if(!output.blocks||!frame.width||!frame.height)throw new Error('Real video frame/geometry missing');
   const sidewaysFrame=frame.height>frame.width;
   const text=sidewaysFrame===Boolean(window.__sidewaysText)?window.__cameraWords:'I1I l| o0 Qfd';await new Promise(resolve=>setTimeout(resolve,window.__movingCamera?900:60));window.__activeOcr--;
   return {data:{text,confidence:text===window.__cameraWords?99:25,blocks:[{paragraphs:[{text,bbox:{x0:frame.width*.1,y0:frame.height*.2,x1:frame.width*.9,y1:frame.height*.38}}]}]}};
  },terminate:async()=>{window.__terminated++;}};}};
 });
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());if(['blob:','data:'].includes(url.protocol))return route.continue();
  if(url.hostname==='api.mymemory.translated.net'){
   const query=url.searchParams.get('q')||'';cameraQueries.push(query);
   const text=query.includes('Tickets')?'Las entradas se venden abajo.':'El museo abre a las nueve.';
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({responseData:{translatedText:text},responseStatus:200})});
  }
  if(url.origin!==origin||!url.pathname.startsWith('/habla-ecuador/'))return route.abort();
  const file=path.resolve(root,decodeURIComponent(url.pathname.slice('/habla-ecuador/'.length))||'index.html');
  return file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.abort();
 });
 await page.goto(origin+'/habla-ecuador/'+entry+'?start=translate&ui=en');
 await page.locator('#source-language-select').selectOption('en-US');await page.locator('#target-language-select').selectOption('es-EC');
 await page.locator('#translator-input').fill('Keep my original source.');
 assert.equal(await page.evaluate(()=>__cameraCalls.length),0,'camera never opens without a tap');
 // Camera movement during OCR must not prevent recognized words from ever
 // being translated. Positions stay hidden until a fresh stable frame arrives.
 await page.evaluate(()=>{window.__movingCamera=true;});
 const translation=page.waitForResponse(response=>response.url().includes('api.mymemory.translated.net')&&new URL(response.url()).searchParams.get('q')?.includes('museum'));
 await page.locator('#quick-live-camera').click();await translation;
 await page.evaluate(()=>{window.__movingCamera=false;});
 const dialog=page.locator('#live-camera-translator'),labels=dialog.locator('.photo-translation-label');await dialog.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('#live-camera-translator .photo-translation-label')?.textContent.includes('museo'),{},{timeout:20000});
 assert.equal(await dialog.locator('video').evaluate(v=>v.paused),false,'camera preview stays live while translated labels show');
 assert.deepEqual(await dialog.locator('video').boundingBox(),{x:0,y:0,width:390,height:844},'the video fills the viewport');
 assert.equal(await page.locator('#translator-input').inputValue(),'Keep my original source.');
 assert.equal(await page.evaluate(()=>__workers),1);assert.equal(await page.evaluate(()=>__maxOcr),1,'frames process serially using one worker');
 const constraints=await page.evaluate(()=>__cameraCalls[0]);assert.equal(constraints.audio,false);assert.equal(constraints.video.facingMode.ideal,'environment');
 assert.ok(await labels.evaluateAll(items=>items.every(label=>label.scrollHeight<=label.clientHeight+1)),'labels fit the video');
 assert.equal(await labels.first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
 assert.equal(await labels.first().evaluate(el=>Number(getComputedStyle(el).opacity)),.65);
 await dialog.locator('[data-camera-opacity]').evaluate(input=>{input.value='35';input.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await labels.first().evaluate(el=>Number(getComputedStyle(el).opacity)),.35);
 await dialog.locator('[data-camera-opacity]').evaluate(input=>{input.value='65';input.dispatchEvent(new Event('input',{bubbles:true}));});
 if(process.env.HABLA_CAMERA_SCREENSHOT&&entry==='index.html')await page.screenshot({path:process.env.HABLA_CAMERA_SCREENSHOT});
 await page.evaluate(()=>{window.__sidewaysText=true;window.__cameraWords='Tickets are sold downstairs.';});
 await page.waitForFunction(()=>document.querySelector('#live-camera-translator .photo-translation-label')?.textContent.includes('entradas'),{},{timeout:20000});
 assert.equal(await dialog.locator('video').evaluate(v=>v.paused),false,'new camera text replaces old labels without taking a photo');
 assert.equal(await labels.count(),1);
 assert.match(await labels.first().getAttribute('style'),/rotate\(-90deg\)/,'sideways recognition maps the overlay back onto the source');
 assert.ok(!cameraQueries.some(query=>query.includes('Qfd')),'low-confidence OCR never reaches translation');
 await dialog.locator('[data-camera-freeze]').click();await page.waitForFunction(()=>document.querySelector('#live-camera-translator .photo-translation-label')?.textContent.includes('entradas'));
 assert.equal(await dialog.locator('video').evaluate(v=>v.paused),true,'Freeze holds the live view');
 await dialog.locator('[data-camera-original]').click();assert.equal(await dialog.locator('.photo-translator-labels').isVisible(),false);
 await dialog.locator('[data-camera-original]').click();assert.equal(await labels.first().isVisible(),true);
 await dialog.locator('[data-camera-copy]').click();assert.match((await page.evaluate(()=>__copies))[0],/entradas/);
 await dialog.locator('[data-camera-freeze]').click();assert.equal(await dialog.locator('video').evaluate(v=>v.paused),false);
 await page.waitForFunction(()=>document.querySelector('#live-camera-translator [data-camera-use]').disabled===false);
 await dialog.locator('[data-camera-use]').click();assert.equal(await dialog.isVisible(),false);
 assert.equal(await page.locator('#translator-input').inputValue(),'Tickets are sold downstairs.');
 assert.equal(await page.evaluate(()=>__stream.getTracks().every(track=>track.readyState==='ended')),true,'closing stops every camera track');
 assert.ok(await page.evaluate(()=>__terminated)>0,'closing releases the OCR worker');
 await page.evaluate(()=>{window.__denyCamera=true;});await page.locator('#quick-live-camera').click();
 await page.waitForFunction(()=>document.querySelector('#live-camera-translator [data-camera-status]').textContent.includes('denied'));
 assert.equal(await page.locator('#translator-input').inputValue(),'Tickets are sold downstairs.','permission denial preserves existing input');
 await dialog.locator('[data-camera-close]').click();
 await page.evaluate(()=>{window.__denyCamera=false;window.__delayCamera=true;});await page.locator('#quick-live-camera').click();
 await page.waitForFunction(()=>Boolean(window.__releaseCamera));await dialog.locator('[data-camera-close]').click();await page.evaluate(()=>__releaseCamera());
 await page.waitForFunction(()=>__stream.getTracks().every(track=>track.readyState==='ended'));
 assert.equal(await dialog.isVisible(),false,'late camera permission cannot reopen a closed view');assert.deepEqual(errors,[]);
 await context.close();console.log(entry+': continuous video, changing text overlays, rear camera/no microphone, serial OCR reuse, freeze/resume, original, copy, guarded import, denial and late-permission cleanup passed');
}
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox'],executablePath:process.env.HABLA_CHROMIUM_PATH}:{});
 try{for(const entry of ['index.html','translator.html'])await run(browser,entry);}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
