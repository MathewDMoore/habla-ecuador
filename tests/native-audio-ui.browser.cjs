// Real injected UI; native OS boundary is simulated. No call or recording occurs.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});try{
const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
await page.addInitScript(()=>{localStorage.setItem('habla-tutorial-seen-v2','1');window.audioMessages=[];window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>window.audioMessages.push(m)}}};});
await page.addInitScript({path:path.join(__dirname,'../ios/HablaEcuador/NativeSpeech.js')});
await page.route('**/*',r=>{const u=new URL(r.request().url()),p=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(p)&&fs.statSync(p).isFile()?r.fulfill({path:p}):r.abort()});
await page.goto('https://mathewdmoore.github.io/habla-ecuador/index.html');await page.locator('.bottom-nav [data-open="translator-view"]').click();
await page.locator('#habla-native-audio summary').click();const panel=page.locator('#habla-native-audio');
await panel.locator('[data-native-file]').click();assert.equal(await page.evaluate(()=>audioMessages.at(-1).action),'transcribeFile');
await page.evaluate(()=>window.__hablaNativeAudio({text:'Hola, ¿cómo estás?',language:'es-EC'}));assert.equal(await panel.locator('[data-native-transcript]').inputValue(),'Hola, ¿cómo estás?');
assert.equal(await page.locator('#translator-input').inputValue(),'','recognition does not overwrite the working source automatically');
await panel.locator('[data-native-use]').click();assert.equal(await page.locator('#translator-input').inputValue(),'Hola, ¿cómo estás?');
assert.equal(await panel.locator('[data-native-send]').isDisabled(),true);
await panel.locator('[data-native-call]').click();assert.equal(await page.evaluate(()=>audioMessages.at(-1).action),'callSpeech');
await page.evaluate(()=>window.__hablaNativeAudio({enabled:true,status:'Simulated route only'}));
await panel.locator('[data-native-call-text]').fill('Hello.');await panel.locator('[data-native-send]').click();
assert.deepEqual(await page.evaluate(()=>{const m=audioMessages.at(-1);return {action:m.action,text:m.text}}),{action:'speakCall',text:'Hello.'});
await panel.locator('[data-native-call]').click();assert.equal(await page.evaluate(()=>audioMessages.at(-1).enabled),false);
await page.evaluate(()=>window.__hablaNativeAudio({enabled:false,error:'No compatible active call'}));assert.equal(await panel.locator('[data-native-send]').isDisabled(),true);
console.log(engine+': native file/review/call controls passed with a simulated OS boundary');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
