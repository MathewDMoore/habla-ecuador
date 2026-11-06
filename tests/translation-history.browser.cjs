// Local history on two app entry points, 320/390 px, without a translation network.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const playwright=require(process.env.HABLA_PLAYWRIGHT_MODULE||"playwright");
const root=path.resolve(__dirname,".."),origin="https://mathewdmoore.github.io";
async function run(browser,file,width){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const page=await context.newPage(),errors=[],translationRequests=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("request",req=>{if(req.url().includes("mymemory.translated.net"))translationRequests.push(req.url());});
 await page.route("**/*",route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin||!url.pathname.startsWith("/habla-ecuador/"))return route.abort();
  const rel=decodeURIComponent(url.pathname.slice("/habla-ecuador/".length))||"index.html";
  const local=path.resolve(root,rel);
  return local.startsWith(root+path.sep)&&fs.existsSync(local)&&fs.statSync(local).isFile()
   ?route.fulfill({path:local}):route.abort();
 });
 await page.addInitScript(()=>{localStorage.setItem("habla-tutorial-seen-v2","1");});
 await page.goto(origin+"/habla-ecuador/"+file+"?start=translate");
 await page.waitForSelector("#translation-history");
 assert.equal(await page.locator("#translation-history").getAttribute("open"),null,"compact by default");
 assert.equal(await page.locator("#history-auto-save").isChecked(),true);
 await page.evaluate(()=>{
  sourceLanguage="es-EC";targetLanguage="en-US";syncLanguagePair();
  document.querySelector("#translator-input").value="¿Cómo estás?";
  document.querySelector("#translation-result").hidden=false;
  setEditableTranslation("¿Cómo estás?","How are you?");
 });
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem("habla-ecuador-translation-history-v1")||"null")?.items?.length===1,null,{timeout:5000});
 await page.locator("#translation-history > summary").click();
 assert.equal(await page.locator("#history-results .history-entry").count(),1);
 assert.match(await page.locator("#history-results").textContent(),/¿Cómo estás\?/);
 assert.match(await page.locator("#history-results").textContent(),/How are you/);
 await page.locator("#history-auto-save").uncheck();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("habla-ecuador-translation-history-v1")).enabled),false);
 await page.evaluate(()=>{
  document.querySelector("#translator-input").value="Buenos días.";
  document.querySelector("#translation-result").hidden=false;
  setEditableTranslation("Buenos días.","Good morning.");
 });
 await page.waitForTimeout(1900);
 assert.equal(await page.locator("#history-results .history-entry").count(),1,"off prevents automatic saves");
 await page.locator("#history-save-current").click();
 assert.equal(await page.locator("#history-results .history-entry").count(),2,"explicit Save works even when auto-save is off");
 await page.locator("#history-search").fill("buenos");
 assert.equal(await page.locator("#history-results .history-entry").count(),1,"source search");
 await page.locator("#history-search").fill("morning");
 assert.equal(await page.locator("#history-results .history-entry").count(),1,"translation search");
 await page.locator("#history-search").fill("");
 const earlier=translationRequests.length;
 await page.locator('#history-results .history-entry').last().locator('[data-history-action="open"]').click();
 assert.equal(await page.locator("#translator-input").inputValue(),"¿Cómo estás?","original is restored");
 assert.equal(await page.locator("#natural-result").textContent(),"How are you?","saved translation is restored verbatim");
 assert.equal(await page.locator("#source-language-select").inputValue(),"es-EC");
 assert.equal(await page.locator("#target-language-select").inputValue(),"en-US");
 assert.equal(translationRequests.length,earlier,"restoration never calls remote translation");
 await page.locator("#translation-history > summary").click();
 await page.locator("#history-results .history-entry").first().locator('[data-history-action="delete"]').click();
 assert.equal(await page.locator("#history-results .history-entry").count(),1,"individual deletion");
 await page.locator("#history-clear").click();
 assert.equal(await page.locator("#history-confirm-clear").isVisible(),true,"clear requires confirmation");
 await page.locator("#history-cancel-clear").click();
 assert.equal(await page.locator("#history-results .history-entry").count(),1,"cancel keeps data");
 await page.locator("#history-clear").click();
 await page.locator("#history-confirm-clear").click();
 assert.equal(await page.locator("#history-results .history-entry").count(),0,"confirmed clear empties storage");
 await page.reload();
 await page.waitForSelector("#translation-history");
 await page.locator("#translation-history > summary").click();
 assert.equal(await page.locator("#history-results .history-entry").count(),0,"deletion persists over reload");
 assert.equal(await page.locator("#history-auto-save").isChecked(),false,"preference persists over reload");
 assert.deepEqual(errors,[],"no browser JavaScript errors");
 await context.close();
 console.log(file+" "+width+"px: auto save, search both languages, manual save, private restore, delete, clear and persistence passed");
}
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||"chromium";
 const browser=await playwright[engine].launch(engine==="chromium"?{args:["--no-sandbox"]}:{});
 try{for(const file of ["index.html","translator.html"])for(const width of [320,390])await run(browser,file,width);}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
