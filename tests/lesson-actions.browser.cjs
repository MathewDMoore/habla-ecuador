// Keep Habla's real say(), voice selection, segmentation, cancellation and DOM.
// Only the OS speech boundary is simulated: require a synchronous trusted tap.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(width,emptyVoices){
const browser=await pw[process.env.HABLA_BROWSER_ENGINE||'chromium'].launch();
try{
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('crash',()=>console.error('Web process crashed:',width,emptyVoices));
 await page.route('**/*',route=>{const u=new URL(route.request().url());let f=path.join(root,u.pathname.replace('/habla-ecuador/',''));if(f===path.join(root,'app.js')&&process.env.HABLA_APP_SOURCE)f=process.env.HABLA_APP_SOURCE;return u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()&&!f.endsWith('.mp3')?route.fulfill({path:f}):route.abort();});
 await page.addInitScript(({emptyVoices})=>{
  window.speechCalls=[];window.tapActive=false;window.speechMode='normal';
  document.addEventListener('click',event=>{window.tapActive=event.isTrusted;},true);
  document.addEventListener('click',()=>window.tapActive=false);
  const synth={getVoices:()=>emptyVoices?[]:[{name:'English',lang:'en-US',voiceURI:'en-US',localService:true},{name:'English UK',lang:'en-GB',voiceURI:'en-GB',localService:true},{name:'Spanish',lang:'es-EC',voiceURI:'es-EC',localService:true}],
   cancel(){speechCalls.push({action:'cancel'});},resume(){},addEventListener(){},
   speak(u){speechCalls.push({action:'speak',text:u.text,lang:u.lang,voice:u.voice?.lang,trustedTap:tapActive,audioMode:navigator.audioSession?.type||'unsupported'});window.lastUtterance=u;
    if(!tapActive){u.onerror?.({error:'not-allowed'});return;}
    if(speechMode==='error'){u.onerror?.({error:'not-allowed'});return;}
    if(speechMode==='throw')throw Error('provider failed');
    if(speechMode!=='silent')u.onstart?.();
   }};
  Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  window.recognitionCalls=[];
  window.SpeechRecognition=class{start(){recognitionCalls.push({action:'start',lang:this.lang});window.lastRecognition=this;}stop(){recognitionCalls.push({action:'stop'});}abort(){recognitionCalls.push({action:'abort'});}};
 },{emptyVoices});
 await page.goto(origin+'/habla-ecuador/index.html?ui=en');
 console.log(`${width}px browser AudioSession support: ${await page.evaluate(()=>navigator.audioSession?.type||'unsupported')}`);
 await page.locator('.bottom-nav [data-open="lesson-view"]').tap();
 const host=page.locator('#quick-lessons');await host.locator(':scope > summary').tap();
 // Pressed styling must keep the touch target fixed, including its edges.
 const hear=host.locator('#quick-explanation-hear');
 await hear.scrollIntoViewIfNeeded();const before=await hear.boundingBox();
 await page.mouse.move(before.x+before.width/2,before.y+before.height/2);await page.mouse.down();
 await page.waitForTimeout(180);const pressed=await hear.boundingBox();
 for(const key of ['x','y','width','height'])assert.ok(Math.abs(before[key]-pressed[key])<.5,'pressed target geometry must stay fixed: '+key);
 await page.mouse.up();
 await hear.tap({position:{x:3,y:3}});
 assert.equal(await page.evaluate(()=>speechCalls.filter(c=>c.action==='speak').at(-1)?.trustedTap),true,'edge tap must invoke the real audio action');
 const spoken=()=>page.evaluate(()=>speechCalls.filter(c=>c.action==='speak'));
 for(const locale of ['es-EC','en-US','en-GB']){
  await page.locator('#lesson-language').selectOption(locale);
  await host.locator('#quick-explanation-hear').tap();
  let calls=await spoken();assert.equal(calls.at(-1)?.trustedTap,true,'explanation must reach speech API in the trusted tap, without timers');
  assert.equal(calls.at(-1).lang,locale==='es-EC'?'en-US':'es-EC');
  if(calls.at(-1).audioMode!=='unsupported')assert.equal(calls.at(-1).audioMode,'playback','real browser AudioSession must request playback before speaking');
  await host.locator('[data-quick-hear]').first().tap();
  calls=await spoken();assert.equal(calls.at(-1).trustedTap,true);assert.equal(calls.at(-1).lang,locale);
  await host.locator('.dictionary-practice-hear').tap();
  calls=await spoken();assert.equal(calls.at(-1).trustedTap,true);assert.equal(calls.at(-1).lang,locale);
  assert.match(await host.locator('.dictionary-practice > .speech-action-status').textContent(),/Playing audio/);
  await page.evaluate(()=>lastUtterance.onend());
  await page.waitForFunction(()=>document.querySelector('#quick-lessons .dictionary-practice > .speech-action-status').textContent==='Audio finished.');
  assert.equal(await page.evaluate(()=>!navigator.audioSession||navigator.audioSession.type!=='playback'),true,'speech completion releases media playback mode');
 }
 // These must visibly change the page, not just show pointer deformation.
 await host.locator('#quick-recall').tap();assert.equal(await host.locator('#quick-lesson-model').isVisible(),false);
 await host.locator('#quick-recall').tap();assert.equal(await host.locator('#quick-lesson-model').isVisible(),true);
 const original=await host.locator('.dictionary-practice-target').textContent();
 await host.locator('#quick-next').tap();assert.notEqual(await host.locator('.dictionary-practice-target').textContent(),original);
 await host.locator('#quick-lesson-select').selectOption('future');
 assert.match(await host.locator('.dictionary-practice-target').textContent(),/going to eat/);
 // Touch a real microphone target. A short tap releases before readiness; it
 // must still request capture and show its reason rather than remain idle.
 await host.locator('.dictionary-practice-mic').tap();
 assert.equal(await page.evaluate(()=>recognitionCalls.filter(c=>c.action==='start').length),1);
 assert.match(await host.locator('.dictionary-practice-status').textContent(),/microphone was still starting/i);
 for(const mode of ['error','throw','silent']){
  await page.evaluate(mode=>speechMode=mode,mode);
  await host.locator('.dictionary-practice-hear').tap();
  const feedback=host.locator('.dictionary-practice > .speech-action-status');
  await feedback.filter({hasText:mode==='silent'?'Audio did not start':'Audio could not start'}).waitFor({timeout:9000});
  assert.equal(await host.locator('.dictionary-practice-hear').getAttribute('aria-busy'),'false');
 }
 await page.evaluate(()=>speechMode='normal');
 await host.locator('.dictionary-practice-hear').tap();
 assert.match(await host.locator('.dictionary-practice > .speech-action-status').textContent(),/Playing audio/,'fresh tap recovers after failure');
 await page.locator('#interface-language').selectOption('es');
 await host.locator('.dictionary-practice-hear').tap();
 await page.waitForFunction(()=>document.querySelector('#quick-lessons .dictionary-practice > .speech-action-status').textContent==='Reproduciendo audio.');
 assert.deepEqual(errors,[]);
 console.log(`${width}px ${emptyVoices?'empty':'enumerated'} voices: real handler, trusted-touch speech, all locales, repeat taps, state controls, microphone request, visible failure/watchdog/retry passed`);
 await context.close();
}finally{await browser.close();}}
(async()=>{for(const [width,empty] of [[390,false],[320,true]])await run(width,empty);})().catch(e=>{console.error(e);process.exitCode=1;});
