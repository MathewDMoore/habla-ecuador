const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'webkit';
 const browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{
  const recording=process.env.HABLA_TEST_RECORDING||path.join(__dirname,'fixtures/recording-text.mp4');
  for(const entry of ['index.html','translator.html']){
   const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
   await page.addInitScript(()=>{
    localStorage.setItem('habla-tutorial-seen-v2','1');
    window.__frames=[];
    window.Tesseract={createWorker:async()=>({recognize:async canvas=>{
     window.__frames.push({width:canvas.width,height:canvas.height,data:canvas.toDataURL()});
     return{data:{text:'Hola Mateo.',confidence:99}};
    },terminate:async()=>{}})};
   });
   await page.route('**/*',route=>{
    const u=new URL(route.request().url());if(['blob:','data:'].includes(u.protocol))return route.continue();const local=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));
    return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(local)&&fs.statSync(local).isFile()?route.fulfill({path:local}):route.abort();
   });
   await page.goto('https://mathewdmoore.github.io/habla-ecuador/'+entry);
   console.log('Loaded',entry);
   page.on('pageerror',error=>console.error('Page:',error.message));
   if(entry==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').click();
   await page.locator('#translator-input').fill('Keep my original.');
   assert.equal(await page.locator('#translation-setup').evaluate(n=>n.open),false);
   const fileChooser=page.waitForEvent('filechooser');
   await page.locator('#music-choose-recording').click();
   await(await fileChooser).setFiles(recording);
   console.log('Selected video',entry);
   await page.waitForFunction(()=>document.querySelector('#recording-preview').readyState>=1);
   await page.locator('#recording-preview').evaluate(video=>{video.muted=true;});
   await page.waitForFunction(()=>document.querySelector('#recording-preview').readyState>=2,{}, {timeout:10000}).catch(async error=>{console.error(await page.locator('#recording-preview').evaluate(v=>({state:v.readyState,network:v.networkState,error:v.error?.message,code:v.error?.code})));throw error;});
   await page.locator('#recording-preview').evaluate(video=>video.pause());
   assert.equal(await page.locator('#translation-setup').evaluate(n=>n.open),true);
   assert.equal(await page.locator('#translator-input').inputValue(),'Keep my original.');
   assert.match(await page.locator('#recording-status').textContent(),/Recording ready/);
   await page.locator('#recording-preview').evaluate(video=>{video.currentTime=Math.min(1,video.duration/2);});
   await page.waitForFunction(()=>!document.querySelector('#read-recording-frame').disabled);
   await page.locator('#read-recording-frame').click();
   await page.waitForFunction(()=>document.querySelector('#translator-input').value==='Hola Mateo.');
   const frame=await page.evaluate(()=>window.__frames[0]);
   assert.ok(frame.width>0&&frame.height>0&&frame.data.length>1000,'real decoded video frame reaches the local reader');
   await page.locator('#clear-recording').click();
   assert.equal(await page.locator('#recording-review').isVisible(),false);
   assert.equal(await page.locator('#translator-input').inputValue(),'Hola Mateo.');
   const imported=await page.evaluate(()=>{
    const event=new Event('paste',{bubbles:true,cancelable:true});
    Object.defineProperty(event,'clipboardData',{value:{files:[new File(['video'], 'copied.mov',{type:'video/quicktime'})]}});
    document.querySelector('#translator-input').dispatchEvent(event);
    return{handled:event.defaultPrevented,image:document.querySelector('#screenshot-preview').src};
   });
   assert.equal(imported.handled,true);
   await page.locator('#clear-recording').click();
   // Use the real bridge contract to replay the reported startup failure.
   await page.evaluate(()=>{
    window.__speechMessages=[];
    window.webkit={messageHandlers:{hablaSpeech:{postMessage:message=>window.__speechMessages.push(message)}}};
   });
   await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../ios/HablaEcuador/NativeSpeech.js'),'utf8')});
   await page.locator('#native-speech-details').evaluate(panel=>panel.open=true);
   await page.locator('#native-speech-details select').selectOption('legacy-on-device');
   await page.locator('#music-listen').click();
   assert.match(await page.locator('#music-listen').textContent(),/Starting/);
   await page.evaluate(()=>{
    const id=window.__speechMessages.at(-1).id;
    window.__hablaNativeSpeech({id,type:'error',error:'service-not-allowed',message:'On-device recognition is not supported for es-MX here.'});
    window.__hablaNativeSpeech({id,type:'end'});
   });
   assert.equal(await page.locator('#music-capture-recovery').isVisible(),true);
   assert.equal(await page.evaluate(()=>window.__speechMessages.filter(m=>m.action==='start').length),1,'never retries audio online without a tap');
   await page.locator('#music-retry-service').click();
   assert.equal(await page.evaluate(()=>window.__speechMessages.at(-1).mode),'apple-service');
   await page.evaluate(()=>window.__hablaNativeSpeech({id:window.__speechMessages.at(-1).id,type:'start'}));
   assert.equal(await page.locator('#music-listen').textContent(),'Stop listening');
   console.log(engine+': '+entry+' unsupported-locale recovery, explicit service retry and actual-start button state passed');
   console.log(engine+': '+entry+' actual video selection, decode, seeking, frame OCR handoff (stub reader), text preservation and video paste passed');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
