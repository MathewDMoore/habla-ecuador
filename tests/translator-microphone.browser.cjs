// Touch-target regression for the translator microphone; speech results are synthetic.
// Never records audio, contacts external services, or submits a translation request.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,file,width,native){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>{
  const url=new URL(route.request().url()),filePath=path.join(root,url.pathname.replace('/habla-ecuador/',''));
  return url.origin===origin&&fs.existsSync(filePath)&&fs.statSync(filePath).isFile()&&!filePath.endsWith('.mp3')
   ?route.fulfill({path:filePath}):route.abort();
 });
 await page.addInitScript(()=>{
  window.testMessages=[];
  window.webkit={messageHandlers:{hablaSpeech:{postMessage(message){testMessages.push(message);}}}};
  class Recognition{
   start(){window.testRecognition=this;testMessages.push({action:'start',lang:this.lang});}
   stop(){testMessages.push({action:'stop'});}
   abort(){testMessages.push({action:'abort'});}
  }
  window.SpeechRecognition=Recognition;
 });
 if(native)await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});
 await page.addInitScript(() => localStorage.setItem("habla-tutorial-seen-v2","1"));
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate&ui=es');
 await page.waitForFunction(()=>Boolean(document.querySelector('#input-mic')?.isConnected));
 const structure=await page.evaluate(()=>{
  const mic=document.querySelector('#input-mic'),input=document.querySelector('#translator-input');
  return {insideLabel:Boolean(mic.closest('label')),labelFor:document.querySelector('label[for="translator-input"]')?.htmlFor,
   buttonType:mic.type,sameCard:mic.closest('.input-card')===input.closest('.input-card')};
 });
 assert.deepEqual(structure,{insideLabel:false,labelFor:'translator-input',buttonType:'button',sameCard:true},
  'the editor has its own label, and the microphone is an independent button');
 await page.evaluate(()=>{window.editorClickCount=0;document.querySelector('#translator-input').addEventListener('click',()=>editorClickCount++);});
 await page.locator('#source-language-select').selectOption('en-US');
 const relativeMicTop=()=>page.evaluate(()=>{
   const button=document.querySelector('#input-mic'),card=button.closest('.input-card');
   return button.getBoundingClientRect().top-card.getBoundingClientRect().top;
 });
 const micBefore=await relativeMicTop();
 await page.locator('#input-mic').click();
 const micAfter=await relativeMicTop();
 assert.ok(Math.abs(micAfter-micBefore)<4,'start status cannot move microphone within its card');
 let messages=await page.evaluate(()=>testMessages.filter(item=>item.action==='start'));
 assert.equal(messages.length,1,'touch activates exactly one session');
 assert.equal(messages[0].lang,'en-US','dictation listens in source language');
 assert.equal(await page.evaluate(()=>editorClickCount),0,'tapping the microphone does not click the editor');
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'start'});
  else testRecognition.onstart?.();
 },{native,id:messages[0].id});
 const phrase='How are you?';
 await page.evaluate(({native,id,phrase})=>{
  if(native)__hablaNativeSpeech({id,type:'result',text:phrase,final:true});
  else{const result=[{transcript:phrase}];result.isFinal=true;testRecognition.onresult({results:[result]});}
 },{native,id:messages[0].id,phrase});
 assert.equal(await page.locator('#translator-input').inputValue(),phrase,'recognized words populate the editor');
 await page.locator('#input-mic').click();
 assert.equal(await page.evaluate(()=>testMessages.some(item=>item.action==='stop')),true,'second tap requests stop');
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'end'});else testRecognition.onend?.();
 },{native,id:messages[0].id});
 await page.locator('#source-language-select').selectOption('es-EC');
 await page.locator('#input-mic').click();
 messages=await page.evaluate(()=>testMessages.filter(item=>item.action==='start'));
 assert.equal(messages.length,2,'tap works again after prior session ends');
 assert.equal(messages[1].lang,'es-EC','dictation follows the changed source language');
 // Safari may report only 'Sí' when the actual sentence was '¿Cómo estás?'.
 // A non-final fragment must NEVER be translated as a trustworthy result.
 await page.evaluate(()=>{window.translationsStarted=0;renderTranslation=()=>{window.translationsStarted++;};});
 const spanishMicTop=await relativeMicTop();
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'result',text:'Sí',final:false});
  else{const result=[{transcript:'Sí'}];result.isFinal=false;testRecognition.onresult({results:[result]});}
 },{native,id:messages[1].id});
 assert.equal(await page.locator('#translator-input').inputValue(),'Sí');
 assert.match(await page.locator('#translator-mic-status').textContent(),/(Partial words heard|palabras parciales)/i);
 assert.ok(Math.abs((await relativeMicTop())-spanishMicTop)<4,
  'interim transcript cannot move the microphone within its card');
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'end'});else testRecognition.onend?.();
 },{native,id:messages[1].id});
 assert.equal(await page.evaluate(()=>translationsStarted),0,'partial Spanish output must not auto-translate');
 assert.equal(await page.evaluate(()=>translatorDictationNeedsReview),true,'unconfirmed transcript remains pending review');
 assert.equal(await page.locator('#translator-mic-confirm').isVisible(),true,'review action shown for unconfirmed fragment');
 assert.match(await page.locator('#translator-mic-status').textContent(),/(Only a partial transcript|transcripción parcial)/i);
 assert.equal(await page.locator('#translation-result').isVisible(),false,'stale translated result hidden');
 await page.locator('#translator-mic-confirm').click();
 assert.equal(await page.evaluate(()=>translatorDictationNeedsReview),false,'manual acceptance unlocks translation');
 assert.equal(await page.evaluate(()=>translationsStarted),1,'manual approval requests translation');
 assert.equal(await page.locator('#translator-mic-confirm').isVisible(),false);
 // An empty English recognition must explain the failure, not erase the draft.
 await page.locator('#source-language-select').selectOption('en-US');
 const beforeSilence=await page.evaluate(()=>translationsStarted);
 await page.locator('#input-mic').click();
 messages=await page.evaluate(()=>testMessages.filter(item=>item.action==='start'));
 assert.equal(messages.length,3);
 assert.equal(messages[2].lang,'en-US');
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'start'});else testRecognition.onstart?.();
 },{native,id:messages[2].id});
 await page.locator('#input-mic').click();
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'end'});else testRecognition.onend?.();
 },{native,id:messages[2].id});
 assert.match(await page.locator('#translator-mic-status').textContent(),/(No words recognized|No se reconocieron palabras)/i);
 assert.equal(await page.locator('#translator-mic-keyboard').isVisible(),true,'keyboard fallback offered');
 await page.locator('#translator-mic-keyboard').click();
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'translator-input','keyboard fallback focuses editor');
 assert.equal(await page.locator('#translator-input').inputValue(),'Sí','failed capture retains previous words');
 assert.equal(await page.evaluate(()=>translationsStarted),beforeSilence,'failed capture never translates');
 // WebKit/iOS can report successful start but NEVER dispatch an end after
 // stop. The bounded watchdog must abort and free that session before retry.
 await page.locator('#source-language-select').selectOption('es-EC');
 await page.locator('#input-mic').click();
 messages=await page.evaluate(()=>testMessages.filter(item=>item.action==='start'));
 assert.equal(messages.length,4);
 assert.equal(messages[3].lang,'es-EC');
 const stalledId=messages[3].id;
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'start'});else testRecognition.onstart?.();
  if(!native)window.stalledRecognition=window.testRecognition;
 },{native,id:stalledId});
 await page.locator('#input-mic').click();
 // Make the production watchdog fire quickly without sleeping three seconds
 // for each browser/mobile/native combination.
 await page.evaluate(()=>recognition?._hablaArmFinishDeadline?.(40));
 await page.waitForFunction(()=>!document.querySelector('#input-mic').classList.contains('listening'),null,{timeout:2500});
 assert.equal(await page.locator('#input-mic').getAttribute('aria-pressed'),'false','stalled mic resets its pressed state');
 assert.equal(await page.evaluate(()=>testMessages.filter(item=>item.action==='abort').length>0),true,
  'stalled recognition is aborted');
 assert.match(await page.locator('#translator-mic-status').textContent(),/(stalled and was reset|se bloqueó|se restableció)/i);
 await page.locator('#input-mic').click();
 messages=await page.evaluate(()=>testMessages.filter(item=>item.action==='start'));
 assert.equal(messages.length,5,'a fresh tap starts the fifth recognizer after a missing end');
 const restartedId=messages[4].id;
 assert.equal(messages[4].lang,'es-EC','retry keeps the selected Ecuadorian locale');
 // Old web recognition callbacks and old native bridge events are ignored.
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'result',text:'stale result',final:true});
  else {
   const result=[{transcript:'stale result'}];result.isFinal=true;
   window.stalledRecognition.onresult?.({results:[result]});
  }
 },{native,id:stalledId});
 assert.equal(await page.locator('#translator-input').inputValue(),'Sí','stale recognizer cannot overwrite prior input');
 await page.evaluate(({native,id})=>{
  if(native){
   __hablaNativeSpeech({id,type:'start'});
   __hablaNativeSpeech({id,type:'result',text:'¿Cómo estás?',final:true});
  }else{
   testRecognition.onstart?.();
   const result=[{transcript:'¿Cómo estás?'}];result.isFinal=true;
   testRecognition.onresult({results:[result]});
  }
 },{native,id:restartedId});
 assert.equal(await page.locator('#translator-input').inputValue(),'¿Cómo estás?','fresh recognizer delivers Spanish after stalled session');
 await page.evaluate(({native,id})=>{
  if(native)__hablaNativeSpeech({id,type:'end'});else testRecognition.onend?.();
 },{native,id:restartedId});
 assert.deepEqual(errors,[],'no page JS errors during tap and recognition flow');
 await context.close();
 console.log(`${file} ${width}px ${native?'native bridge':'web'}: independent mic target, exact one-tap start, locale, transcription and retry passed`);
}
(async()=>{
 for(const width of [320,390])for(const [file,native] of [['index.html',false],['translator.html',false],
  ...(process.env.HABLA_NATIVE_SCRIPT?[['index.html',true],['translator.html',true]]:[])]){
  const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
  const browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
  try{await run(browser,file,width,native);}finally{await browser.close();}
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
