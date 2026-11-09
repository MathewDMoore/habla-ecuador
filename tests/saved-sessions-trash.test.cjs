const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
function storage(){
 const map=new Map();
 return {
  getItem:key=>map.has(key)?map.get(key):null,
  setItem:(key,value)=>map.set(key,String(value)),
  removeItem:key=>map.delete(key)
 };
}
function load(store){
 const old=globalThis.localStorage;
 globalThis.localStorage=store;
 const path=require.resolve('../saved-sessions.js');
 delete require.cache[path];
 const api=require('../saved-sessions.js');
 return {api,restore:()=>{delete require.cache[path];globalThis.localStorage=old;}};
}
test('a deleted song moves into recoverable Trash, then returns unchanged',()=>{
 const {api,restore}=load(storage());
 try{
  const first=api.saveSession('music',{
   source:'Original captured words',translation:'Edited English',
   sourceLanguage:'es-EC',targetLanguage:'en-US',
   passages:[{source:'frase en español',draft:'English draft'}]
  },'Canción de prueba','Artista de prueba');
  assert.equal(first.ok,true);
  const id=first.item.id;
  assert.equal(api.remove(id),true);
  let state=api.readState();
  assert.equal(state.items.length,0);
  assert.equal(state.trash.length,1);
  assert.equal(state.trash[0].source,'Original captured words');
  assert.equal(state.trash[0].translation,'Edited English');
  assert.equal(state.trash[0].passages[0].source,'frase en español');
  assert.ok(state.trash[0].deletedAt);
  assert.equal(api.restoreDeleted(id),true);
  state=api.readState();
  assert.equal(state.items.length,1);
  assert.equal(state.trash.length,0);
  assert.equal(state.items[0].id,id);
  assert.equal(state.items[0].artist,'Artista de prueba');
  assert.equal(state.items[0].deletedAt,'');
 }finally{restore();}
});
test('conversation remains private and preserves both original and translated turns after restore',()=>{
 const {api,restore}=load(storage());
 try{
  const result=api.saveSession('conversation',{turns:[
   {speaker:'Persona 1',source:'Hola',translation:'Hello',sourceLocale:'es-EC',target:'en-US'},
   {speaker:'Persona 2',source:'How are you?',translation:'¿Cómo estás?',sourceLocale:'en-US',target:'es-EC',faceToFace:true}
  ]},'Nuestra conversación');
  assert.equal(result.ok,true);
  const id=result.item.id;
  assert.equal(api.remove(id),true);
  assert.equal(api.restoreDeleted(id),true);
  const turn=api.readState().items[0].turns[1];
  assert.equal(turn.translation,'¿Cómo estás?');
  assert.equal(turn.faceToFace,true);
  assert.match(api.exportText(api.readState().items[0]),/Hola/);
 }finally{restore();}
});
test('full library never evicts saved work silently',()=>{
 const {api,restore}=load(storage());
 try{
  for(let i=0;i<20;i++)assert.equal(api.saveSession('music',{source:'song '+i},'Song '+i).ok,true);
  const oldest=api.readState().items.at(-1).id;
  const blocked=api.saveSession('music',{source:'21st song'});
  assert.equal(blocked.ok,false);
  assert.equal(api.readState().items.length,20);
  assert.ok(api.readState().items.some(item=>item.id===oldest));
  assert.equal(api.remove(oldest),true);
  const added=api.saveSession('music',{source:'new song'});
  assert.equal(added.ok,true);
  // Recoverability is preserved when the main library is full.
  assert.equal(api.restoreDeleted(oldest),false);
  assert.equal(api.readState().trash.length,1);
  assert.equal(api.remove(added.item.id),true);
  assert.equal(api.restoreDeleted(oldest),true);
  assert.equal(api.readState().items.length,20);
 }finally{restore();}
});
test('legacy saved sessions migrate without discarding data',()=>{
 const store=storage();
 store.setItem('habla-ecuador-saved-sessions-v1',JSON.stringify({
  version:1,items:[{kind:'music',title:'Older',source:'remembered lyric',date:'2026-11-09T00:00:00Z'}]
 }));
 const {api,restore}=load(store);
 try{
  assert.equal(api.readState().items[0].title,'Older');
  assert.deepEqual(api.readState().trash,[]);
 }finally{restore();}
});
test('permanent deletion is not the ordinary delete and requires an explicit second user action',()=>{
 const script=fs.readFileSync('saved-sessions.js','utf8');
 assert.match(script,/if\(button\.dataset\.confirm!=='yes'\)/);
 assert.match(script,/Confirmar eliminación definitiva/);
 assert.match(script,/This action cannot be undone/);
 assert.match(script,/function restoreDeleted\(id\)/);
 assert.match(script,/function permanentlyDelete\(id\)/);
 assert.match(script,/state\.trash\.length>=TRASH_LIMIT/);
 assert.doesNotMatch(script,/items:\[candidate,\.\.\.state\.items\]\.slice/);
 const html=fs.readFileSync('index.html','utf8');
 assert.match(html,/id="music-save-host"/);
 assert.match(html,/id="conversation-save-host"/);
 assert.match(html,/id="save-face-conversation"/);
 const app=fs.readFileSync('app.js','utf8');
 for(const name of ['currentSavedMusic','currentSavedConversation','restoreSavedMusic','restoreSavedConversation'])assert.match(app,new RegExp('function '+name+'\\('));
 assert.match(app,/HablaSavedSessions\.bind/);
 for(const path of ['index.html','translator.html','sw.js'])
  assert.match(fs.readFileSync(path,'utf8'),/saved-sessions\.js\?v=218/);
});
