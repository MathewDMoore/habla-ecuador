const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.HABLA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),origin='https://mathewdmoore.github.io',catalog=require('../recorded-practice.js').catalog,meta=require('../captions/spanish-subtitles.json');
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [390,320]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[],requested=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='media.coerll.utexas.edu'){
    const bytes=fs.readFileSync('/tmp/habla-'+path.basename(u.pathname,'.mp4')+'.webm'),range=r.request().headers().range?.match(/bytes=(\d+)-(\d*)/);
    const start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),bytes.length-1):bytes.length-1;
    const headers={'accept-ranges':'bytes','content-length':String(end-start+1)};
    if(range)headers['content-range']=`bytes ${start}-${end}/${bytes.length}`;
    return r.fulfill({status:range?206:200,body:bytes.subarray(start,end+1),contentType:'video/webm',headers});
   }
   const file=path.join(root,u.pathname.replace('/habla-ecuador/',''));if(u.pathname.endsWith('.vtt'))requested.push(u.pathname);
   return u.origin===origin&&fs.existsSync(file)&&!file.endsWith('.mp3')?r.fulfill({path:file}):r.abort();});
  if(process.env.HABLA_NATIVE_SCRIPT){await page.addInitScript(()=>{window.webkit={messageHandlers:{hablaSpeech:{postMessage(){}}}};});await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});}
  await page.goto(origin+'/habla-ecuador/index.html');await page.locator('.bottom-nav [data-open="lesson-view"]').click();
  const host=page.locator('#recorded-practice');await host.locator(':scope > summary').click();
  for(const item of catalog.items){
   await page.locator('#recorded-practice-region').selectOption(item.id);
   const video=page.locator('#recorded-practice-video'),toggle=page.locator('#recorded-spanish-subtitles');
   assert.equal(await video.locator('track').getAttribute('srclang'),'es');assert.equal(await toggle.getAttribute('aria-pressed'),'true');
   await page.locator('#recorded-practice-play').click();await page.waitForFunction(()=>document.querySelector('#recorded-practice-video track').readyState===2);
   await page.waitForFunction(()=>{const v=document.querySelector('#recorded-practice-video');return v.readyState>=2&&!v.paused;});
   const track=await video.evaluate(v=>({lang:v.textTracks[0].language,label:v.textTracks[0].label,mode:v.textTracks[0].mode,count:v.textTracks[0].cues.length}));
   assert.equal(track.lang,'es');assert.match(track.label,/Español/);assert.equal(track.mode,'showing');assert.equal(track.count,meta.videos[item.clip].cues);
   await page.waitForFunction(()=>{const v=document.querySelector('#recorded-practice-video');return v.seekable.length&&v.seekable.end(0)>v.duration*.9;});
   const expectedCue=await video.evaluate(async v=>{v.pause();const t=v.textTracks[0],c=t.cues[Math.floor(t.cues.length/2)];await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=(c.startTime+c.endTime)/2;});return c.text;});
   try{await page.waitForFunction(text=>Array.from(document.querySelector('#recorded-practice-video').textTracks[0].activeCues||[]).some(c=>c.text===text),expectedCue,{timeout:6000});}catch(e){console.log(item.clip,expectedCue,await video.evaluate(v=>({time:v.currentTime,duration:v.duration,paused:v.paused,mode:v.textTracks[0].mode,active:Array.from(v.textTracks[0].activeCues||[]).map(c=>({text:c.text,start:c.startTime,end:c.endTime})),ranges:Array.from({length:v.seekable.length},(_,i)=>[v.seekable.start(i),v.seekable.end(i)])})));throw e;}
   assert.ok((await video.evaluate(v=>v.textTracks[0].activeCues[0].text)).length>0);
   await toggle.click();assert.equal(await video.evaluate(v=>v.textTracks[0].mode),'disabled');assert.equal(await toggle.getAttribute('aria-pressed'),'false');
   await toggle.click();assert.equal(await video.evaluate(v=>v.textTracks[0].mode),'showing');
   // The native controls may change selection too; the explicit button follows.
   await video.evaluate(v=>{v.textTracks[0].mode='disabled';});await page.waitForFunction(()=>document.querySelector('#recorded-spanish-subtitles').getAttribute('aria-pressed')==='false');await toggle.click();
   assert.equal(await host.locator('.dictionary-practice-target').textContent(),item.spanish,'practice prompt unchanged');
  }
  assert.equal(new Set(requested).size,4);assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width));assert.deepEqual(errors,[]);
  if(width===390)await page.screenshot({path:'/tmp/habla-spanish-subtitles.png'});
  await context.close();
 }
 console.log('Spanish subtitle browser checks: all four real VTT tracks loaded, Spanish label/default mode, decoded WebM fixtures, active timed cues after seek, on/off and native-control selection sync, unchanged prompts, 390/320px passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
