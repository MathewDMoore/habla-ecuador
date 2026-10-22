const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync('app.js','utf8');
const code = app.slice(app.indexOf('let translationSharePending = false;'),app.indexOf('function updateTranslationEditUi()'));
function harness(navigator = {}) {
  const nodes = new Map([
    ['#share-result',{disabled:false,textContent:'Share translation'}],
    ['#translation-share-status',{hidden:true,textContent:''}],
    ['#translation-result',{hidden:false}],
    ['#natural-result',{innerText:'Edited translation.\n\nSecond paragraph.',textContent:'stale text',getAttribute:()=> 'true'}]
  ]);
  const context = vm.createContext({navigator,activeTranslationEdit:{source:'PRIVATE ORIGINAL',generated:'old generated draft'},$:s=>nodes.get(s)});
  vm.runInContext(code,context);
  return {nodes,context,share:()=>vm.runInContext('shareTranslation()',context)};
}
(async()=>{
  const payloads=[],copied=[];
  let finish;
  const h=harness({share:data=>{payloads.push(data);return new Promise(r=>finish=r);},clipboard:{writeText:async text=>copied.push(text)}});
  const first=h.share();
  assert.equal(payloads.length,1,'share invoked synchronously inside user gesture');
  assert.equal(h.nodes.get('#share-result').disabled,true);
  await h.share();assert.equal(payloads.length,1,'duplicate tap cannot open another sheet');
  assert.deepEqual(JSON.parse(JSON.stringify(payloads[0])),{title:'Habla Ecuador translation',text:'Edited translation.\n\nSecond paragraph.'});
  finish();await first;
  assert.equal(copied.length,0);assert.equal(h.nodes.get('#share-result').disabled,false);
  assert.match(h.nodes.get('#translation-share-status').textContent,/handed/);
  const cancel=harness({share:async()=>{throw {name:'AbortError'};},clipboard:{writeText:async()=>assert.fail('Cancel must not copy private text')}});
  await cancel.share();assert.match(cancel.nodes.get('#translation-share-status').textContent,/cancelled/);
  for (const nativeShare of [undefined,async()=>{throw {name:'NotAllowedError'};}]) {
    const values=[];const fallback=harness({share:nativeShare,clipboard:{writeText:async text=>values.push(text)}});
    await fallback.share();assert.equal(values.length,1);assert.match(values[0],/Edited translation/);
    assert.match(fallback.nodes.get('#translation-share-status').textContent,/copied/);
  }
  const manual=harness({});await manual.share();
  assert.match(manual.nodes.get('#translation-share-status').textContent,/Press and hold/);
  assert.equal(manual.nodes.get('#share-result').disabled,false);
  for (const state of ['loading','hidden','empty','notEditable']) {
    const invalid=harness({share:()=>assert.fail('Invalid draft must not be shared')});
    if(state==='loading')vm.runInContext('activeTranslationEdit=null',invalid.context);
    if(state==='hidden')invalid.nodes.get('#translation-result').hidden=true;
    if(state==='empty')invalid.nodes.get('#natural-result').innerText=' ';
    if(state==='notEditable')invalid.nodes.get('#natural-result').getAttribute=()=>null;
    await invalid.share();assert.match(invalid.nodes.get('#translation-share-status').textContent,/Translate some text first/);
  }
  for(const file of ['index.html','translator.html']) {
    const html=fs.readFileSync(file,'utf8');
    assert.equal((html.match(/id="share-result"/g)||[]).length,1);
    assert.match(html,/id="translation-share-status"[^>]*role="status"/);
  }
  console.log('Translation sharing: edited text/paragraphs, no original/metadata, direct user gesture, duplicate exclusion, cancel, blocked API, clipboard/manual fallbacks and unfinished-result guards passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
