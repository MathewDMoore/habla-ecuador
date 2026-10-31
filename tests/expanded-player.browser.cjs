const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'webkit',b=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});try{for(const viewport of [{width:390,height:844},{width:844,height:390}]){
const p=await b.newPage({viewport,hasTouch:true,serviceWorkers:'block'});
await p.addInitScript(()=>{localStorage.setItem('habla-tutorial-seen-v2','1');window.__hablaNativeInlineVideo=true;window.YT={Player:class{constructor(frame,options){window.savedFrame=frame;queueMicrotask(()=>options.events.onReady({target:this}));}getCurrentTime(){return 20;}pauseVideo(){}}};});
await p.route('**/*',r=>{const u=new URL(r.request().url()),f=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.abort();});
await p.goto('https://mathewdmoore.github.io/habla-ecuador/index.html?start=music');
await p.addStyleTag({content:'#music-view{transform:translateZ(0);overflow:hidden;max-height:600px}'});
await p.locator('#ve-player-expand').click();
const state=await p.evaluate(()=>{const stage=document.querySelector('.ve-stage'),r=stage.getBoundingClientRect();return{topLayer:stage.matches(':popover-open'),top:r.top,left:r.left,width:r.width,height:r.height,same:window.savedFrame===document.querySelector('#ve-youtube-frame'),caption:document.querySelector('#ve-theater-english').textContent};});
assert.equal(state.topLayer,true);assert.equal(state.top,0);assert.equal(state.left,0);assert.ok(Math.abs(state.width-viewport.width)<2);assert.ok(Math.abs(state.height-viewport.height)<2);assert.equal(state.same,true);assert.ok(state.caption.length>5);assert.doesNotMatch(state.caption,/Connecting to YouTube/);
assert.equal(await p.locator('#ve-theater-english').isVisible(),true);assert.equal(await p.locator('#ve-theater-close').isVisible(),true);
await p.locator('#ve-theater-close').click();assert.equal(await p.locator('.ve-stage').evaluate(e=>e.hasAttribute('popover')),false);assert.equal(await p.evaluate(()=>savedFrame===document.querySelector('#ve-youtube-frame')),true);
console.log(engine,viewport,'expanded top-layer player preserves iframe and timed English with clipped native ancestor; Close restores inline');await p.close();
}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
