// Run against current hosted sources: HABLA_HOSTED_ROOT=/path/to/main.
// Neutral synthetic content only. This exercises JavaScript/DOM, not UIKit.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const {chromium} = require(process.env.HABLA_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const hosted = path.resolve(process.env.HABLA_HOSTED_ROOT || root);
const origin = 'https://mathewdmoore.github.io';
async function run(browser, width) {
  const context = await browser.newContext({viewport:{width,height:844}, isMobile:true, hasTouch:true});
  const page = await context.newPage(), errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.route('**/*', route=>{
    const u=new URL(route.request().url()), file=path.join(hosted,u.pathname.replace('/habla-ecuador/',''));
    if(u.origin!==origin || !u.pathname.startsWith('/habla-ecuador/') || !fs.existsSync(file) || /\.mp3$/.test(file)) return route.abort();
    return route.fulfill({path:file});
  });
  await page.addInitScript(()=>{
    window.__hablaSystemAudioSupported=window.__hablaSongIdentificationSupported=true;
    window.sentShares=[];window.fallbackCalls=[];
    window.webkit={messageHandlers:{hablaSpeech:{postMessage:m=>{
      if(window.failBridge)throw Error('Unavailable');
      if(m.action==='share-translation')window.sentShares.push(m);
    }}}};
    Object.defineProperty(navigator,'share',{value:()=>{window.fallbackCalls.push('web');return Promise.resolve();}});
    Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>{window.fallbackCalls.push('copy');return Promise.resolve();}}});
  });
  await page.addInitScript({path:path.join(root,'ios/HablaEcuador/NativeSpeech.js')});
  await page.goto(origin+'/habla-ecuador/index.html?start=translate');
  await page.waitForSelector('#native-translation-workspace');
  assert.equal(await page.locator('#share-result').isDisabled(),true);
  await page.evaluate(()=>{
    document.querySelector('#translator-input').value='Private original should stay here';
    setEditableTranslation('Private original should stay here','Generated neutral draft');
    document.querySelector('#translation-result').hidden=false;
    const target=document.querySelector('#natural-result');
    target.textContent='Edited translation.\n\nSecond paragraph. 😊';
    target.dispatchEvent(new InputEvent('input',{bubbles:true}));
  });
  const button=page.locator('#share-result'), status=page.locator('#translation-share-status');
  assert.equal(await button.isVisible(),true,'Share is visible without opening notes');
  assert.equal(await button.evaluate(el=>!!el.closest('details')),false);
  await button.click();
  let sent=await page.evaluate(()=>window.sentShares);
  assert.equal(sent.length,1);
  assert.equal(sent[0].text,'Edited translation.\n\nSecond paragraph. 😊');
  assert.deepEqual(Object.keys(sent[0]).sort(),['action','id','text']);
  assert.equal(await button.getAttribute('aria-busy'),'true');
  await button.click();assert.equal(await page.evaluate(()=>window.sentShares.length),1,'duplicate taps open once');
  await page.evaluate(()=>window.__hablaNativeSpeech({type:'share',id:'old-page-id',status:'completed'}));
  assert.equal(await button.getAttribute('aria-busy'),'true','stale completion ignored');
  await page.evaluate(id=>window.__hablaNativeSpeech({type:'share',id,status:'cancelled'}),sent[0].id);
  assert.match(await status.textContent(),/cancelled/);
  assert.equal(await button.getAttribute('aria-busy'),null);
  assert.deepEqual(await page.evaluate(()=>window.fallbackCalls),[],'no hosted sharing or silent clipboard copy');
  // Same live nodes move to Music; Share remains visible and uses the new edit.
  await page.locator('.bottom-nav [data-open="music-view"]').click();
  await page.evaluate(()=>{document.querySelector('#natural-result').textContent='Music draft edited by user';});
  await button.click(); sent=await page.evaluate(()=>window.sentShares);
  assert.equal(sent.length,2);assert.equal(sent[1].text,'Music draft edited by user');
  await page.evaluate(id=>window.__hablaNativeSpeech({type:'share',id,status:'completed'}),sent[1].id);
  assert.match(await status.textContent(),/completed/);
  await button.click();sent=await page.evaluate(()=>window.sentShares);
  await page.evaluate(id=>window.__hablaNativeSpeech({type:'share',id,status:'error',message:'Close the current sheet, then try Share again.'}),sent.at(-1).id);
  assert.match(await status.textContent(),/Close the current sheet/);
  assert.equal(await button.getAttribute('aria-busy'),null);
  await page.evaluate(()=>{window.failBridge=true;});await button.click();
  assert.match(await status.textContent(),/Could not open/);assert.equal(await button.getAttribute('aria-busy'),null);
  await page.evaluate(()=>{window.failBridge=false;document.querySelector('#natural-result').textContent='x'.repeat(100001);});
  await button.click();assert.match(await status.textContent(),/100,000/);
  assert.equal(await page.evaluate(()=>window.sentShares.length),3);
  await page.evaluate(()=>{document.querySelector('#natural-result').textContent='';});await button.click();
  assert.equal(await page.evaluate(()=>window.sentShares.length),3,'empty draft not shared');
  await page.evaluate(()=>{document.querySelector('#natural-result').textContent='Hidden draft';document.querySelector('#translation-result').hidden=true;document.querySelector('#share-result').click();});
  assert.equal(await page.evaluate(()=>window.sentShares.length),3,'hidden draft not shared');
  assert.deepEqual(errors,[]);await context.close();
  console.log(`Native share DOM ${width}px: edited text, privacy, visible action, Music, duplicates, stale IDs, cancel, completion, errors and bounds passed; UIKit untested`);
}
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{for(const w of [390,844])await run(browser,w);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
