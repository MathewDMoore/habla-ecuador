// Browser regression for the precise meaning of Spanish-speaking and variants.
// The service is deliberately blocked: isolated terms must translate locally.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io';
async function run(browser,file){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[],serviceRequests=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.url().includes('mymemory.translated.net'))serviceRequests.push(request.url());});
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin||!url.pathname.startsWith('/habla-ecuador/'))return route.abort();
  const filename=path.join(root,decodeURIComponent(url.pathname.slice('/habla-ecuador/'.length))||'index.html');
  return fs.existsSync(filename)&&fs.statSync(filename).isFile()&&!filename.endsWith('.mp3')?route.fulfill({path:filename}):route.abort();
 });
 await page.goto(origin+'/habla-ecuador/'+file+'?start=translate');
 await page.waitForFunction(()=>Boolean(window.HablaLanguageCommunity)&&typeof renderTranslation==='function');
 await page.locator('#source-language-select').selectOption('en-US');
 await page.locator('#target-language-select').selectOption('es-EC');
 const check=async(phrase,expected)=>{
  await page.locator('#translator-input').fill(phrase);
  await page.waitForFunction(expected=>
   document.querySelector('#natural-result')?.textContent.trim()===expected,expected,{timeout:5000});
  assert.equal(await page.locator('#translation-result').isVisible(),true,phrase+' renders the result');
 };
 await check('Spanish-speaking','hispanohablante');
 assert.match(await page.locator('#usage-note').textContent(),/hispanoparlante/,'related alternative shown');
 assert.match(await page.locator('#usage-note').textContent(),/de habla hispana/,'country/community variant shown');
 await check('Spanish-speaking countries','países hispanohablantes');
 await page.locator('#source-language-select').selectOption('es-EC');
 await page.locator('#target-language-select').selectOption('en-US');
 await check('hispanoparlante','Spanish-speaking');
 await check('hispanohablante','Spanish-speaking');
 await check('países de habla hispana','Spanish-speaking countries');
 assert.deepEqual(serviceRequests,[],'glossary lookup does not call external translation service');
 assert.deepEqual(errors,[],'no app JavaScript errors');
 await context.close();
 console.log(file+': Spanish-speaking, hispanohablante, hispanoparlante, de habla hispana and plural country translation passed');
}
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'chromium';
 const browser=await playwright[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{for(const file of ['index.html','translator.html'])await run(browser,file);}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
