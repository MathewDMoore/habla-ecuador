const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
try{const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
await page.addInitScript(()=>{localStorage.setItem('habla-tutorial-seen-v2','1');localStorage.setItem('habla-lesson-language-v1','es-EC')});
await page.route('**/*',r=>{const u=new URL(r.request().url()),p=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));
if(u.hostname==='upload.wikimedia.org'&&u.pathname.includes('La_Cucaracha')&&process.env.HABLA_VERIFY_REMOTE_AUDIO==='1')return r.continue();
return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(p)&&fs.statSync(p).isFile()?r.fulfill({path:p}):r.abort()});
await page.goto('https://mathewdmoore.github.io/habla-ecuador/index.html');await page.locator('.bottom-nav [data-open="music-view"]').click();
const lesson=page.locator('#music-song-lesson');assert.match(await lesson.textContent(),/Ya no puede caminar/);assert.match(await lesson.textContent(),/Sean Buss/);assert.match(await lesson.textContent(),/CC BY-SA 3.0/);
assert.equal(await lesson.locator('[data-song-phrase]').count(),3);
assert.match(await lesson.locator('[data-song-phrase]').first().textContent(),/español hablado/);
if(process.env.HABLA_VERIFY_REMOTE_AUDIO==='1'){
 await lesson.locator('audio').evaluate(p=>p.load());
 await page.waitForFunction(()=>document.querySelector('#music-song-lesson audio').readyState>=1,{},{timeout:45000});
 const duration=await lesson.locator('audio').evaluate(p=>p.duration);assert.ok(duration>40&&duration<46,'real vocal file decodes to the documented 43 seconds');
 console.log('Real remote sung recording decoded:',duration);
}
await page.locator('.bottom-nav [data-open="lesson-view"]').click();await page.locator('#lesson-language').selectOption('en-GB');
await page.locator('.bottom-nav [data-open="music-view"]').click();
assert.match(await lesson.textContent(),/song itself is sung in Spanish/);assert.match(await lesson.locator('[data-song-phrase]').first().textContent(),/spoken English/);assert.match(await lesson.textContent(),/I can’t walk anymore/);
await lesson.locator('audio').evaluate(p=>p.dispatchEvent(new Event('error')));assert.match(await lesson.locator('[data-song-status]').textContent(),/could not load/);
console.log(engine+': vocal source, full lyrics, useful examples, settings and explicit media error passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
