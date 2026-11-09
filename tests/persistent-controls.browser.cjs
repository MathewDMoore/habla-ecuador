const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'webkit',b=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});try{for(const file of ['index.html','translator.html']){const p=await b.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});await p.addInitScript(()=>localStorage.setItem('habla-tutorial-seen-v2','1'));await p.route('**/*',r=>{const u=new URL(r.request().url()),f=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.abort();});await p.goto('https://mathewdmoore.github.io/habla-ecuador/'+file+'?start=translate');await p.waitForSelector('#translation-action-dock');
for(const id of ['copy-result','hear-result','share-result','translation-full-text']){assert.equal(await p.locator('#'+id).isVisible(),true);assert.equal(await p.locator('#'+id).isDisabled(),true);}
let requests=0;
await p.route('https://api.mymemory.translated.net/**',route=>{
 requests++;
 return requests===1
  ? route.fulfill({status:503,json:{responseStatus:503,responseDetails:'Unavailable'}})
  : route.fulfill({json:{responseStatus:200,responseData:{translatedText:'La ventana está abierta'}}});
});
const retry=p.locator('#translate-now');
assert.equal(await retry.isVisible(),false,'the retry control is reserved for failures');
await p.locator('#translator-input').fill('The window is open');
await retry.waitFor({state:'visible'});
assert.equal(requests,1,'typing starts translation without a button press');
await retry.click();
await p.waitForFunction(()=>document.querySelector('#natural-result').textContent==='La ventana está abierta');
assert.equal(requests,2,'retry starts another request');
assert.equal(await retry.isVisible(),false,'success hides retry');
await p.waitForFunction(()=>!document.querySelector('#copy-result').disabled);for(const id of ['copy-result','hear-result','share-result','translation-full-text']){assert.equal(await p.locator('#'+id).count(),1);assert.equal(await p.locator('#'+id).isVisible(),true);}
await p.evaluate(()=>{document.querySelector('#translation-result').hidden=true;});await p.waitForFunction(()=>document.querySelector('#copy-result').disabled);assert.equal(await p.locator('#copy-result').isVisible(),true);assert.equal(await retry.isVisible(),false);console.log(file,'empty/completed/failed state retains same controls, correct disabled state, working Translate');await p.close();}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
