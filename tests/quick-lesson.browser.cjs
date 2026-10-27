// Real app DOM; only speech/recognition boundaries are simulated.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
const {catalog}=require('../quick-lessons.js');
(async()=>{
const browser=await pw[process.env.HABLA_BROWSER_ENGINE||'chromium'].launch();
try{for(const file of ['index.html','translator.html'])for(const width of [320,390]){
const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',route=>{const u=new URL(route.request().url()),f=path.join(root,u.pathname.replace('/habla-ecuador/',''));return u.origin===origin&&fs.existsSync(f)&&fs.statSync(f).isFile()&&!f.endsWith('.mp3')?route.fulfill({path:f}):route.abort();});
await page.addInitScript(()=>{class Recognition{start(){window.testRecognition=this;}stop(){}abort(){}}window.SpeechRecognition=Recognition;});
await page.addInitScript(() => localStorage.setItem("habla-tutorial-seen-v2","1"));
 await page.goto(origin+'/habla-ecuador/'+file+'?ui=en');
await page.evaluate(()=>{window.spoken=[];window.say=(text,lang)=>spoken.push({text,lang});});
if(file==='translator.html')await page.evaluate(()=>openView('lesson-view')); // Standalone shell intentionally hides navigation.
else await page.locator('.bottom-nav [data-open="lesson-view"]').click();
const host=page.locator('#quick-lessons');await host.locator('summary').first().click();
for(const locale of ['es-EC','en-US','en-GB']){
await page.locator('#lesson-language').selectOption(locale);
assert.equal(await host.getAttribute('data-learning-language'),locale);
assert.equal(await host.locator('#quick-lesson-select option').count(),3);
for(const lesson of catalog[locale]){
await host.locator('#quick-lesson-select').selectOption(lesson.id);
await host.locator('#quick-explanation-hear').click();
assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:lesson.explanation,lang:locale==='es-EC'?'en-US':'es-EC'});
for(let i=0;i<lesson.situations.length;i++){
const cue=lesson.situations[i];
assert.equal(await host.locator('.dictionary-practice-target').textContent(),cue.phrase);
await host.locator('[data-quick-hear]').first().click();
assert.deepEqual(await page.evaluate(()=>spoken.at(-1)),{text:lesson.examples[0][0],lang:locale});
await host.locator('#quick-recall').click();
assert.equal(await host.locator('#quick-lesson-model').isVisible(),false);
assert.equal(await host.locator('.quick-lesson-examples').isVisible(),false);
await host.locator('#quick-recall').click();
assert.equal(await host.locator('#quick-lesson-model').isVisible(),true);
await host.locator('.dictionary-practice-mic').evaluate(el=>el.click());
assert.equal(await page.evaluate(()=>testRecognition.lang),locale);
assert.equal(await host.locator('.dictionary-practice-target').isVisible(),true,'stable model while microphone is active');
await host.locator('#quick-next').click();
}
}
}
await page.locator('#interface-language').selectOption('es');
await page.waitForFunction(()=>document.querySelector('#quick-lessons summary').textContent.includes('Lecciones cortas'));
assert.equal(await host.getAttribute('data-learning-language'),'en-GB','explicit goal survives UI language');
const button=await host.locator('#quick-recall').boundingBox();assert.ok(button.x>=0&&button.x+button.width<=width,'recall control fits phone');
assert.equal(await page.evaluate(()=>HablaQuickLessons.isProtected()),true);
if(file==='index.html'&&width===390)await page.screenshot({path:'/tmp/habla-review/quick-lessons.png',fullPage:true});
if(file==='translator.html')await page.evaluate(()=>openView('home-view'));
else await page.locator('.bottom-nav [data-open="home-view"]').click();
assert.equal(await page.evaluate(()=>HablaQuickLessons.isProtected()),false);
assert.deepEqual(errors,[]);
await context.close();console.log(`${file} ${width}px: three goals, all topics/scenes, audio locales, recall, stable mic prompt, language changes, navigation passed`);
}}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
