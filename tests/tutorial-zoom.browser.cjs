// Actual Chromium pinch scaling, rather than a width-only viewport mock.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{for(const file of ['index.html','translator.html']){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage();
 await page.route('**/*',r=>{const u=new URL(r.request().url()),p=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(p)&&fs.statSync(p).isFile()?r.fulfill({path:p}):r.abort()});
 await page.goto('https://mathewdmoore.github.io/habla-ecuador/'+file+'?tour=1');
 await page.waitForSelector('#tutorial-next');const cdp=await context.newCDPSession(page);
 for(const scale of [1.5,2]){
 await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:scale});
 await page.waitForFunction(()=>{
 const content=document.querySelector('.tutorial-content'),panel=document.querySelector('.tutorial-panel').getBoundingClientRect(),v=visualViewport;
 return content.clientHeight>=120&&panel.left>=v.offsetLeft&&panel.right<=v.offsetLeft+v.width&&panel.top>=v.offsetTop&&panel.bottom<=v.offsetTop+v.height;
 });
 for(let i=0;i<3;i++){
 assert.equal(await page.locator('.tutorial-controls').evaluate(el=>el.scrollWidth<=el.clientWidth),true,'controls fit without horizontal overflow');
 for(const id of ['close','back','next']){
 const fits=await page.locator('#tutorial-'+id).evaluate(el=>{const r=el.getBoundingClientRect(),p=el.closest('.tutorial-panel').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom&&r.left>=p.left&&r.right<=p.right&&getComputedStyle(el).overflowWrap==='normal'&&getComputedStyle(el).wordBreak==='normal'});assert.equal(fits,true,id+' stays within card and preserves words');
 }
 const r=await page.locator('#tutorial-next').boundingBox();
 // CDP input coordinates are layout CSS coordinates.
 await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);
 }
 }
 await context.close();console.log(file+': 150% and 200% pinch zoom passed');
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
