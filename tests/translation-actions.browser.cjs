/* Replay the signed companion's dark result card, not just text in the DOM. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const origin='https://mathewdmoore.github.io',root=path.resolve(__dirname,'..');
(async()=>{
 const engine=process.env.HABLA_BROWSER_ENGINE||'webkit',browser=await pw[engine].launch(engine==='chromium'?{args:['--no-sandbox']}:{});
 try{
  for(const width of [320,390])for(const [entry,native] of [['index.html',false],['translator.html',false],['index.html',true]]){
   const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(({native})=>{
    if(window!==window.top)return;
    localStorage.setItem('habla-tutorial-seen-v2','1');
    window.__copied=[];window.__shared=[];window.__spoken=[];
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__copied.push(text)}});
    Object.defineProperty(navigator,'share',{configurable:true,value:async data=>window.__shared.push(data)});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],addEventListener(){},resume(){},cancel(){},speak(u){window.__spoken.push({text:u.text,lang:u.lang});u.onstart?.();}}});
    window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
    if(native)document.addEventListener('DOMContentLoaded',()=>{
     // The native wrapper moves the existing result outside the hosted light
     // workspace and initially folds all controls into its closed notes panel.
     const result=document.querySelector('#translation-result'),input=document.querySelector('#translator-input').closest('.input-card');
     const workspace=document.createElement('section');workspace.id='native-translation-workspace';input.before(workspace);workspace.append(input,result);
     const notes=document.createElement('details');notes.className='native-translation-tools';notes.innerHTML='<summary>Playback & translation notes</summary>';
     for(const child of [...result.children])if(!child.matches('.result-label,#natural-result'))notes.append(child);result.append(notes);
     const style=document.createElement('style');style.textContent='#native-translation-workspace{background:white;overflow:hidden;border-radius:20px}#native-translation-workspace>#translation-result{margin:0;border-radius:0;padding:12px 14px}';document.head.append(style);
    });
   },{native});
   await page.route('**/*',route=>{
    const u=new URL(route.request().url()),file=path.join(root,u.pathname.replace('/habla-ecuador/',''));
    return u.origin===origin&&fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.abort();
   });
   await page.goto(origin+'/habla-ecuador/'+entry+'?start=translate&ui=en');
   await page.waitForFunction(()=>document.querySelector('#translation-text-tools')?.dataset.bound==='true');
   const source='Did Ayssel carve a pumpkin?',draft='¿Ayssel talló una calabaza?';
   await page.evaluate(({source,draft})=>{
    sourceLanguage='en-US';targetLanguage='es-MX';syncLanguagePair();
    document.querySelector('#translator-input').value=source;setEditableTranslation(source,draft);
    document.querySelector('#translation-result').hidden=false;
    document.querySelector('#translation-result .result-label').textContent='Mexican Spanish translation';
   },{source,draft});
   // Check actual rendered text-fill/background contrast, including disabled
   // Pause, rather than accepting an outlined box or an accessible name alone.
   const colors=await page.evaluate(()=>{
    const rgb=value=>(value.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
    const luminance=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
    const contrast=(a,b)=>{a=luminance(rgb(a));b=luminance(rgb(b));return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
    return ['copy-result','translation-expand','translation-full-text','hear-result','pause-result','share-result'].map(id=>{
     const button=document.getElementById(id),s=getComputedStyle(button),box=button.getBoundingClientRect();
     return{id,text:button.textContent.trim(),ratio:contrast(s.webkitTextFillColor||s.color,s.backgroundColor),background:s.backgroundColor,height:box.height,inNotes:!!button.closest('.native-translation-tools'),opacity:s.opacity};
    });
   });
   for(const button of colors){assert.ok(button.text.length>2,JSON.stringify(button));assert.ok(button.ratio>=4.5,JSON.stringify(button));assert.ok(button.height>=44,JSON.stringify(button));assert.equal(button.inNotes,false,JSON.stringify(button));assert.equal(button.opacity,'1');}
   if(native){const heading=await page.locator('#translation-result .result-label').evaluate(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el.parentElement).backgroundColor}));assert.notEqual(heading.color,heading.bg);}
   await page.locator('#copy-result').tap();assert.equal(await page.evaluate(()=>__copied.at(-1)),draft);
   assert.equal(await page.locator('#translation-copy-status').isVisible(),true);
   await page.locator('#translation-expand').tap();assert.equal(await page.locator('#translation-expand').getAttribute('aria-expanded'),'true');
   await page.locator('#translation-full-text').tap();assert.equal(await page.locator('#full-text-reader').evaluate(d=>d.open),true);
   assert.equal(await page.locator('#full-reader-result').textContent(),draft);await page.locator('#full-reader-close').tap();
   assert.equal(await page.locator('#pause-result').isDisabled(),true);
   await page.locator('#hear-result').tap();assert.deepEqual(await page.evaluate(()=>__spoken.at(-1)),{text:draft,lang:'es-MX'});
   assert.match(await page.locator('#translation-result .speech-action-status').textContent(),/Playing audio/);
   const feedback=await page.locator('#translation-result .speech-action-status').evaluate(el=>({color:getComputedStyle(el).webkitTextFillColor,background:getComputedStyle(el).backgroundColor}));
   assert.deepEqual(feedback,{color:'rgb(23, 63, 53)',background:'rgb(237, 245, 240)'},'playback status has its own readable surface in both layouts');
   assert.equal(await page.locator('#pause-result').isEnabled(),true);
   await page.locator('#pause-result').tap();assert.match(await page.locator('#pause-result').textContent(),/Resume/);
   assert.match(await page.locator('#translation-result .speech-action-status').textContent(),/Audio paused/);
   await page.locator('#share-result').tap();assert.equal(await page.evaluate(()=>__shared.at(-1).text),draft);
   assert.equal(await page.locator('#translation-share-status').isVisible(),true);
   assert.equal(await page.locator('#translator-input').inputValue(),source);
   assert.deepEqual(errors,[]);
   if(process.env.HABLA_SCREENSHOT_DIR){await page.waitForFunction(()=>!document.querySelector('button.is-pressed'));await page.locator('#translation-result').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.HABLA_SCREENSHOT_DIR,`actions-${width}-${native?'native':entry}.png`)});}
   console.log(`${engine} ${width}px ${entry} ${native?'native dark card':'hosted light card'}: visible labels, contrast, touch hits, Copy, Expand, Full text, Hear/Pause and Share passed`);
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
