const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),preview=fs.mkdtempSync(path.join(os.tmpdir(),'habla-preview-'));
(async()=>{
 let browser;
 try {
  for(const name of fs.readdirSync(root)) if(/\.(?:js|html|css|webmanifest|json|svg|png)$/.test(name))fs.copyFileSync(path.join(root,name),path.join(preview,name));
  fs.cpSync(path.join(root,'data'),path.join(preview,'data'),{recursive:true});
  execFileSync(process.execPath,[path.join(root,'scripts/prepare-preview.cjs'),preview]);
  const sw=fs.readFileSync(path.join(preview,'sw.js'),'utf8');
  assert.ok(!sw.includes('habla-ecuador-'),'preview worker cannot delete or use production cache names');
  assert.ok(!sw.includes('caches.match('),'worker fallback searches its own shell cache');
  browser=await playwright[process.env.HABLA_BROWSER_ENGINE||'chromium'].launch();
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='https://habla.test')return route.abort();
   if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<html><body>Current app</body></html>'});
   const file=path.resolve(preview,url.pathname.replace('/preview/integration/','')||'index.html');
   if(!file.startsWith(preview+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.abort();
   return route.fulfill({path:file});
  });
  await page.goto('https://habla.test/');
  await page.evaluate(()=>{localStorage.setItem('history','production history');localStorage.setItem('habla-tutorial-seen-v2','1');});
  for(const entry of ['index.html','translator.html']){
   await page.goto('https://habla.test/preview/integration/'+entry+'?start=translate&ui=en');
   await page.locator('[aria-label="Preview version / Versión de prueba"]').waitFor();
   assert.equal(await page.evaluate(()=>localStorage.getItem('history')),null);
   await page.evaluate(()=>{localStorage.setItem('history','preview history');localStorage.clear();});
   await page.goto('https://habla.test/');
   assert.equal(await page.evaluate(()=>localStorage.getItem('history')),'production history');
   assert.equal(await page.evaluate(()=>localStorage.getItem('habla-tutorial-seen-v2')),'1');
  }
  assert.deepEqual(errors,[]);
  console.log('Both preview pages isolate storage from the current app and use independent cache names and scoped fallbacks.');
 } finally {await browser?.close();fs.rmSync(preview,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
