const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const countries=['EC','BO','MX','VE','PE','CO','CU','AR','CL','CR','DO','SV','GT','HN','NI','PA','PY','PR','ES','UY','GQ'].map(x=>'es-'+x);
(async()=>{const engine=process.env.HABLA_BROWSER_ENGINE||'chromium',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
try{for(const file of ['index.html','translator.html']){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage();
 await page.addInitScript(()=>localStorage.setItem('habla-tutorial-seen-v2','1'));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),p=path.join(__dirname,'..',u.pathname.replace('/habla-ecuador/',''));return u.origin==='https://mathewdmoore.github.io'&&fs.existsSync(p)&&fs.statSync(p).isFile()?r.fulfill({path:p}):r.abort()});
 await page.goto('https://mathewdmoore.github.io/habla-ecuador/'+file);
 for(const id of ['source-language-select','target-language-select','conversation-spanish-language','regional-slang-region','regional-slang-target','app-share-region']){
  const values=await page.locator('#'+id+' option').evaluateAll(options=>options.map(o=>o.value));
  for(const code of countries)assert.ok(values.includes(code),id+' includes '+code);
 }
 if(file==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').click();
 await page.locator('[data-mode="conversation"]').click();await page.locator('#conversation-spanish-language').selectOption('es-AR');
 await page.reload();if(file==='index.html')await page.locator('.bottom-nav [data-open="translator-view"]').click();await page.locator('[data-mode="conversation"]').click();
 assert.equal(await page.locator('#conversation-spanish-language').inputValue(),'es-AR','new regional choice persists');
 const link=await page.evaluate(()=>publicAppShareUrl('es-CL','es'));assert.equal(new URL(link).searchParams.get('region'),'es-CL');
 assert.equal(await page.evaluate(link=>sharedAppRegion(new URL(link).searchParams),link),'es-CL','shared country is accepted');
 await context.close();console.log(file+': all 21 country choices, saved new locale and share link passed');
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
