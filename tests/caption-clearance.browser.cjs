const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'webkit',b=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
try{for(const width of [320,390]){
 const p=await b.newPage({viewport:{width,height:844},serviceWorkers:'block'});
 await p.addInitScript(()=>{localStorage.setItem('habla-tutorial-seen-v2','1');window.__hablaNativeInlineVideo=true;});
 await p.route('**/*',r=>{const u=new URL(r.request().url()),file=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(file)&&fs.statSync(file).isFile()?r.fulfill({path:file}):r.abort();});
 await p.goto('https://mathewdmoore.github.io/habla-ecuador/index.html?start=music');
 await p.locator('#ve-youtube-try').click();
 await p.waitForFunction(()=>!document.querySelector('#ve-caption-overlay').hidden);
 for(const text of ['English on · connecting to video time…','A very long translated line of lyrics. '.repeat(12)]){
  await p.locator('#ve-caption-overlay').evaluate((e,text)=>e.textContent=text,text);
  const boxes=await p.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return{player:rect(document.querySelector('.ve-video-box')),caption:rect(document.querySelector('#ve-caption-overlay')),selector:rect(document.querySelector('.ve-in-video-switch')),inside:!!document.querySelector('.ve-video-box #ve-caption-overlay')};});
  assert.equal(boxes.inside,false);assert.ok(boxes.caption.top>=boxes.player.bottom,JSON.stringify(boxes));assert.ok(boxes.selector.top>=boxes.player.bottom,JSON.stringify(boxes));
 }
 await p.locator('#ve-in-video-language').selectOption('off');assert.equal(await p.locator('#ve-caption-overlay').isVisible(),false);
 assert.equal(await p.locator('#ve-youtube-frame').isVisible(),true);
 await p.locator('#ve-in-video-language').selectOption('en-US');assert.equal(await p.locator('#ve-caption-overlay').isVisible(),true);
 console.log(engine,width,'caption/selector stay outside player for syncing and long text; Off preserves player; selector still works');await p.close();
}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
