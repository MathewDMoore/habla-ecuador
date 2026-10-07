const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const api = require('../saved-paper.js');
const fixture = {schema:api.SCHEMA,title:'Private test paper',sourceText:'Primer párrafo.\n\nÚltima línea.',translations:{'en-GB':'First paragraph.\n\nFinal line UK.','en-US':'First paragraph.\n\nFinal line US.'}};
assert.deepEqual(api.parse(JSON.stringify({...fixture, malicious:'<script>'})), {...fixture, sourceLanguage:'es',reviewStatus:'editable translation draft'});
assert.throws(()=>api.parse('broken'),/readable/);
assert.throws(()=>api.validate({...fixture,translations:{'en-GB':'incomplete'}}),/both English/);
assert.throws(()=>api.validate({...fixture,sourceText:'x'.repeat(200001)}),/200,000/);
const values=new Map();
const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
assert.equal(api.save(storage,fixture),true);
assert.equal(api.load(storage).paper.translations['en-US'],fixture.translations['en-US']);
assert.equal(api.save({setItem(){throw Error('quota')}},fixture),false);
assert.ok(api.load({getItem(){throw Error('blocked')}}).error);

class Element {
  constructor(){this.events={};this.value='';this.textContent='';this.hidden=false;this.children=[];this.classList={toggle(){},add(){},remove(){}};}
  addEventListener(name,fn){this.events[name]=fn;} setAttribute(){} append(...items){this.children.push(...items);} replaceChildren(){this.children=[];} click(){this.events.click?.();} remove(){}
}
const elements=new Map();
const document={querySelector(selector){if(!elements.has(selector))elements.set(selector,new Element());return elements.get(selector)},createElement(){return new Element()},body:new Element()};
const windowEvents={};let sent=0,printed=0,spoken='',stopped=0,paused=0;
const context={window:{addEventListener:(name,fn)=>windowEvents[name]=fn,print:()=>printed++},document,localStorage:storage,Blob,URL:{createObjectURL(){return 'blob:local'},revokeObjectURL(){}},setTimeout:()=>0,module:{exports:{}},fetch:()=>{sent++;throw Error('must stay local')}};
vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../saved-paper.js'),'utf8'),context);
const bind=()=>context.module.exports.bind({speak:(text,locale)=>spoken=locale+'|'+text,stop:()=>stopped++,pause:()=>paused++});
document.querySelector('#saved-paper-variety').value='en-GB';bind();
assert.equal(document.querySelector('#saved-paper-uk').value,fixture.translations['en-GB']);
document.querySelector('#saved-paper-uk').value+='\n\nMy edit.';
document.querySelector('#saved-paper-uk').events.input();
bind();assert.ok(document.querySelector('#saved-paper-uk').value.endsWith('My edit.'),'edit survives reader reload');
document.querySelector('#compare-saved-paper').click();assert.equal(document.querySelector('#saved-paper-us-panel').hidden,false);
document.querySelector('#saved-paper-variety').value='en-US';document.querySelector('#saved-paper-variety').events.change();
document.querySelector('#hear-saved-paper').click();assert.equal(spoken,'en-US|'+fixture.translations['en-US']);
document.querySelector('#pause-paper').click();assert.equal(paused,1);
document.querySelector('#print-saved-paper').click();assert.equal(printed,1);
assert.equal(document.querySelector('#saved-paper-print').children.at(-1).textContent,fixture.translations['en-US']);
windowEvents.afterprint();
document.querySelector('#backup-saved-paper').click();assert.equal(sent,0,'reading, comparing, editing, backup and print make no service requests');
document.querySelector('#remove-saved-paper').click();assert.equal(api.load(storage).paper,null);
assert.equal(document.querySelector('#saved-paper-uk').value,'');
assert.ok(stopped>=2);
async function uploads(){
  const element=document.querySelector('#saved-paper-file');
  await element.events.change({target:{files:[{size:10,text:async()=>JSON.stringify({...fixture,title:'<img src=x onerror=alert(1)>',sourceText:'<script>unsafe</script>'})}],value:'chosen'}});
  assert.equal(document.querySelector('#saved-paper-title').value,'<img src=x onerror=alert(1)>');
  assert.equal(document.querySelector('#saved-paper-source').textContent,'<script>unsafe</script>');
  await element.events.change({target:{files:[{size:api.MAX_BYTES+1}],value:'chosen'}});
  assert.match(document.querySelector('#saved-paper-status').textContent,/under 2 MB/);
  assert.equal(sent,0);
  for(const name of ['index.html','translator.html']){
    const html=fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8');
    assert.equal((html.match(/id="choose-saved-paper"/g)||[]).length,1);
    assert.ok(html.indexOf('Your complete research paper')<html.indexOf('Optional research reference excerpts'));
    assert.ok(html.indexOf('saved-paper.js?v=')<html.indexOf('app.js?v='));
  }
  console.log('Saved paper checks passed: full text, variants, persistence, private local import, edits, print, backup, malformed files, storage failures and markup safety.');
}
uploads().catch(error=>{console.error(error);process.exitCode=1});
