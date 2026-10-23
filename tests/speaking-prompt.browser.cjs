// Real DOM/layout with synthetic recognition events; no audio is recorded.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const {chromium} = require(process.env.HABLA_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), origin = 'https://mathewdmoore.github.io';
async function run(browser, native, width=390, height=844) {
  const context = await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
  const page = await context.newPage(), errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.route('**/*', route=>{
    const u=new URL(route.request().url()), file=path.join(root,u.pathname.replace('/habla-ecuador/',''));
    if(u.origin!==origin || !u.pathname.startsWith('/habla-ecuador/') || !fs.existsSync(file) || /\.mp3$/.test(file)) return route.abort();
    return route.fulfill({path:file});
  });
  await page.addInitScript(()=>{
    window.testMessages=[];
    window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>window.testMessages.push(m)}}};
    class TestRecognition {
      start(){window.testRecognition=this;window.testMessages.push({action:'start',lang:this.lang,continuous:this.continuous});}
      stop(){window.testMessages.push({action:'stop'});}
      abort(){window.testMessages.push({action:'abort'});}
    }
    window.SpeechRecognition=TestRecognition;
  });
  if(native) await page.addInitScript({path:native});
  await page.goto(origin+'/habla-ecuador/index.html');
  await page.locator('.bottom-nav [data-open="lesson-view"]').click();
  assert.equal(await page.locator('#lesson-play').isVisible(),true);
  await page.locator('#lesson-next').click();
  const prompt=page.locator('#lesson-speaking-prompt'), mic=page.locator('#lesson-mic');
  const expected='¿A qué hora se pone el sol?';
  await page.evaluate(()=>window.testPromptNode=document.querySelector('#lesson-speaking-prompt'));
  async function kept(stage) {
    assert.equal(await prompt.locator('.spanish').textContent(),expected,stage);
    assert.equal(await prompt.locator('.english').textContent(),'What time does the sun set?',stage);
    assert.equal(await prompt.isVisible(),true,stage);
    assert.equal(await prompt.evaluate(el=>el===window.testPromptNode),true,'same prompt node: '+stage);
  }
  async function send(message) {
    await page.evaluate(({native,message})=>{
      if(native) {
        const id=window.testMessages.findLast(m=>m.action==='start').id;
        window.__hablaNativeSpeech({...message,id});
      } else {
        const r=window.testRecognition;
        if(message.type==='result') {
          const result=[{transcript:message.text}];result.isFinal=Boolean(message.final);
          r.onresult({results:[result]});
        } else r['on'+message.type]?.(message);
      }
    },{native:Boolean(native),message});
  }
  await kept('before microphone');
  assert.equal(await mic.getAttribute('aria-pressed'),'false');
  assert.match(await page.locator('#lesson-mic-instructions').textContent(),/Tap again/);
  await mic.click();await kept('permission/start pending');
  const request=await page.evaluate(()=>window.testMessages.findLast(m=>m.action==='start'));
  assert.equal(request.lang,'es-EC');assert.equal(request.continuous,false);
  // The target and microphone must be readable together after the tap.
  assert.equal(await prompt.evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight;}),true,'prompt stays in viewport at mic tap');
  await send({type:'start'});await kept('listening');
  assert.equal(await mic.getAttribute('aria-pressed'),'true');
  await send({type:'result',text:'A qué hora',final:false});await kept('partial response');
  assert.match(await page.locator('#lesson-heard').textContent(),/A qué hora/);
  assert.equal(await prompt.locator('.spanish').textContent(),expected,'recognized text never replaces the target');
  await mic.click();await kept('finishing');
  assert.equal(await page.evaluate(()=>window.testMessages.at(-1).action),'stop');
  await send({type:'result',text:'¿A qué hora se pone el sol?',final:true});
  await send({type:'end'});await kept('final response');
  assert.equal(await mic.getAttribute('aria-pressed'),'false');
  assert.match(await page.locator('#lesson-heard').textContent(),/Understood/);
  await mic.click();await send({type:'start'});await kept('retry');
  await send({type:'error',error:'no-speech'});await send({type:'end'});await kept('no speech');
  await mic.click();await send({type:'error',error:'not-allowed'});await send({type:'end'});await kept('permission denied');
  await page.locator('#lesson-next').click();
  assert.equal(await page.locator('#lesson-next').isDisabled(),true);
  await page.locator('.choice[data-correct="true"]').click();await page.locator('#lesson-next').click();
  assert.equal(await page.locator('.map-card').count(),4);
  await page.locator('#lesson-finish').click();
  await page.locator('.bottom-nav [data-open="lesson-view"]').click();
  assert.equal(await page.locator('#lesson-step-count').textContent(),'1/4');
  assert.deepEqual(errors,[]);
  await context.close();console.log(`${native?'Native bridge JavaScript':'Browser'} ${width}x${height}: prompt retained through pending/start, partial/final, stop, retry/errors; lesson progression passed`);
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try {await run(browser);await run(browser,null,320,700);if(process.env.HABLA_NATIVE_SCRIPT)await run(browser,process.env.HABLA_NATIVE_SCRIPT);}
  finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
