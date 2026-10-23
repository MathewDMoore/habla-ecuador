// Optional real-model check. Requires Playwright/Chromium and downloads the public pack.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
async function main(){
 const root=path.resolve(__dirname,'..');
 const server=http.createServer((req,res)=>{
  const requestURL=new URL(req.url,'http://localhost');
  const pathname=decodeURIComponent(requestURL.pathname);
  if(pathname==='/__pack' && process.env.HABLA_CURL_NETWORK==='yes'){
   const target=new URL(requestURL.searchParams.get('url'));
   if(!['cdn.jsdelivr.net','huggingface.co'].includes(target.hostname)){res.writeHead(403).end();return;}
   const {execFile}=require('node:child_process');
   execFile('curl',['--fail','--location','--silent','--show-error','--max-time','180',target.href],{encoding:'buffer',maxBuffer:160*1024*1024},(error,body)=>{res.writeHead(error?502:200,{'Content-Type':target.pathname.endsWith('.js')?'application/javascript':target.pathname.endsWith('.wasm')?'application/wasm':'application/octet-stream','Access-Control-Allow-Origin':'*'});res.end(error?'Public pack download failed':body);});return;
  }
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const types={'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
  fs.readFile(file,(error,body)=>{res.writeHead(error?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(error?'missing':body);});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({ignoreHTTPSErrors:true});
 let onlineTranslationCalls=0;
 context.on('request',r=>{if(r.url().includes('api.mymemory.translated.net'))onlineTranslationCalls++;});
 const page=await context.newPage();page.on('pageerror',error=>console.error('Page:',error.message));
 try{
  const base=`http://127.0.0.1:${server.address().port}`;
  await page.goto(base+'/index.html?start=translate');
  await page.waitForFunction(()=>navigator.serviceWorker.controller,{},{timeout:30000});
  if(process.env.HABLA_CURL_NETWORK==='yes'){
   console.log('Downloading public pack through the CI network bridge; validation still runs in the browser with network disabled.');
   await page.evaluate(async()=>{
    const files=[...HablaOffline.RUNTIME.map(url=>({url,cache:HablaOffline.RUNTIME_CACHE})),...Object.values(HablaOffline.MODELS).flatMap(model=>HablaOffline.FILES.map(file=>({url:`https://huggingface.co/${model.id}/resolve/${model.revision}/${file}`,cache:HablaOffline.MODEL_CACHE})))];
    for(const {url,cache} of files){const response=await fetch('/__pack?url='+encodeURIComponent(url));if(!response.ok)throw Error('Public pack download failed: '+url);await(await caches.open(cache)).put(url,response);}
   });
  }
  await page.locator('.offline-tools').evaluate(node=>node.open=true);
  await page.locator('#offline-download').click();
  const report=setInterval(async()=>{try{console.log(await page.locator('#offline-status').textContent());}catch{}},15000);
  try{await page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('validated in both directions')||document.querySelector('#offline-status').textContent.startsWith('Offline pack not ready.'),{},{timeout:600000});}finally{clearInterval(report);}
  const status=await page.locator('#offline-status').textContent();console.log(status);assert.match(status,/validated in both directions/);
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('validated in both directions'),{},{timeout:180000});
  const results=await page.evaluate(async()=>({es:await HablaOffline.translate('The water is cold.','en-ec'),en:await HablaOffline.translate('El agua está fría.','ec-en'),data:await fetch('data/vocabulary.json').then(r=>r.ok),shell:document.querySelector('[data-app-version]').textContent}));
  assert.match(results.es.toLowerCase(),/agua/);assert.match(results.en.toLowerCase(),/water/);assert.equal(results.data,true);assert.match(results.shell,/build 105/);
  assert.equal(onlineTranslationCalls,0);
  console.log(JSON.stringify({offlineReopen:true,actualModels:true,...results,onlineTranslationCalls}));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1});
