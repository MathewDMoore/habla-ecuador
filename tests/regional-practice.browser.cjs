// Real page/controller and optional companion JavaScript; synthetic speech only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const lesson=require('../regional-practice.js'),root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,native,width=390){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));
  return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
 await page.addInitScript(()=>{
  window.testMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>window.testMessages.push(m)}}};
  class Recognition{start(){window.testRecognition=this;window.testMessages.push({action:'start',lang:this.lang});}stop(){window.testMessages.push({action:'stop'});}abort(){window.testMessages.push({action:'abort'});}}
  window.SpeechRecognition=Recognition;
 });
 if(native)await page.addInitScript({path:native});
 await page.goto(origin+'/habla-ecuador/index.html');
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 const source=page.locator('#source-practice');assert.equal(await source.isVisible(),true);
 assert.equal(await source.getAttribute('open'),null,'compact on entry');await source.locator(':scope > summary').click();
 await page.evaluate(()=>{window.spoken=[];window.say=(text,lang)=>window.spoken.push({text,lang});});
 async function send(message){await page.evaluate(({message,native})=>{
  if(native){window.__hablaNativeSpeech({...message,id:window.testMessages.findLast(m=>m.action==='start').id});return;}
  const r=window.testRecognition;
  if(message.type==='result'){const result=[{transcript:message.text}];result.isFinal=Boolean(message.final);r.onresult({results:[result]});}
  else r['on'+message.type]?.(message);
 },{message,native:Boolean(native)});}
 let panel=source.locator('.dictionary-practice');const target=panel.locator('.dictionary-practice-target');
 assert.equal(await target.textContent(),lesson.items[0].spanish);assert.equal(await panel.isVisible(),true);
 assert.match(await source.locator('.source-practice-cue').textContent(),/ca-me-LLAR/);
 assert.equal(await source.locator('#source-practice-previous').isDisabled(),true);
 await panel.locator('.dictionary-practice-mic').click();await send({type:'start'});
 await send({type:'result',text:lesson.items[0].spanish.split(' ')[0],final:false});
 assert.equal(await panel.locator('.dictionary-practice-score').isVisible(),false,'provisional speech has no percentage');
 assert.equal(await target.textContent(),lesson.items[0].spanish,'mic keeps target visible');
 await send({type:'result',text:lesson.items[0].spanish.split(' ')[0],final:true});await send({type:'end'});
 assert.match(await panel.locator('.dictionary-practice-score').textContent(),/50%/);
 assert.match(await panel.locator('.dictionary-practice-score').textContent(),/not a pronunciation score/);
 await panel.locator('.dictionary-practice-focus-try').click();
 assert.equal(await panel.locator('.dictionary-practice-whole').textContent(),'Full prompt: '+lesson.items[0].spanish);
 assert.equal(await panel.locator('select').isVisible(),true,'full prompt remains selectable after focus');
 await panel.locator('select').selectOption('0');
 await panel.locator('.dictionary-practice-mic').click();
 await page.locator('#source-practice-next').click();
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'changing phrase releases the mic');
 for(let i=1;i<lesson.items.length;i++){
  panel=source.locator('.dictionary-practice');
  assert.equal(await panel.locator('.dictionary-practice-target').textContent(),lesson.items[i].spanish);
  await panel.locator('.dictionary-practice-hear').click();
  assert.deepEqual(await page.evaluate(()=>window.spoken.at(-1)),{text:lesson.items[i].spanish,lang:lesson.items[i].locale});
  await panel.locator('.dictionary-practice-mic').click();await send({type:'start'});
  assert.equal(await page.evaluate(()=>window.testMessages.findLast(m=>m.action==='start').lang),lesson.items[i].locale);
  await send({type:'result',text:lesson.items[i].spanish,final:true});await send({type:'end'});
  assert.match(await panel.locator('.dictionary-practice-score').textContent(),/100%/);
  if(i<lesson.items.length-1)await page.locator('#source-practice-next').click();
 }
 assert.equal(await page.locator('#source-practice-next').isDisabled(),true);
 assert.equal(await source.locator('.source-practice-meaning').textContent(),lesson.items[3].us);
 await page.evaluate(()=>{englishVariant='uk';renderSourcePractice();});
 assert.equal(await source.locator('.source-practice-meaning').textContent(),lesson.items[3].uk);
 const credit=source.locator('.source-practice-attribution');await credit.locator('summary').click();
 assert.equal(await credit.locator('[rel="license noreferrer"]').getAttribute('href'),lesson.source.licenseUrl);
 assert.match(await credit.textContent(),/Radialistas/);assert.match(await credit.textContent(),/have not been verified/);
 await panel.locator('.dictionary-practice-mic').click();
 await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
 assert.equal(await page.evaluate(()=>dictionaryPracticeSession),null,'source practice stops when entering dictionary');
 await page.locator('.bottom-nav [data-open="lesson-view"]').click();
 panel=source.locator('.dictionary-practice');await panel.locator('.dictionary-practice-mic').click();
 await source.locator(':scope > summary').click();await page.waitForFunction(()=>dictionaryPracticeSession===null);
 // Existing sunset lesson remains available independently.
 await page.locator('#lesson-next').click();assert.equal(await page.locator('#lesson-speaking-prompt').isVisible(),true);
 assert.ok(await page.evaluate(width=>document.documentElement.scrollWidth<=width,width));
 assert.deepEqual(errors,[]);await context.close();console.log(`${native?'Native bridge':'Browser'} ${width}px: four source phrases, context/credit, model locales, percentage, focus, navigation and original lesson passed`);
}
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});try{await run(b);await run(b,null,320);if(process.env.HABLA_NATIVE_SCRIPT)await run(b,process.env.HABLA_NATIVE_SCRIPT);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
