const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

function setup(){
  const memory=new Map();
  global.localStorage={
    getItem:key=>memory.get(key)||null,
    setItem:(key,val)=>memory.set(key,String(val))
  };
  const file=require.resolve('../saved-sessions.js');
  delete require.cache[file];
  const lib=require('../saved-sessions.js');
  return {lib,memory};
}
const song={source:'Recognized original words',translation:'Corrected English draft',
  sourceLanguage:'es-EC',targetLanguage:'en-US',passages:[{source:'Original text',draft:'Draft English'}]};
const conversation={turns:[
 {speaker:'Person 1',source:'Hola',translation:'Hello',sourceLocale:'es-EC',target:'en-US',slot:'spanish'},
 {speaker:'Person 2',source:'How are you?',translation:'¿Cómo estás?',sourceLocale:'en-US',target:'es-EC',slot:'english'}
]};

test('song is soft-deleted to persistent Trash, then restored with both original and translated words',()=>{
  const {lib,memory}=setup();
  const saved=lib.saveSession('music',song,'Song A','Verified singer');
  assert.equal(saved.ok,true);
  assert.equal(lib.read().length,1);
  assert.equal(lib.remove(saved.item.id),true);
  assert.equal(lib.read().length,0,'ordinary list omits trashed song');
  let state=lib.readState();
  assert.equal(state.trash.length,1);
  assert.equal(state.trash[0].source,song.source);
  assert.equal(state.trash[0].translation,song.translation);
  assert.equal(state.trash[0].passages[0].source,'Original text');
  assert.ok(state.trash[0].deletedAt);
  // The data must survive a page reload.
  delete require.cache[require.resolve('../saved-sessions.js')];
  const afterReload=require('../saved-sessions.js');
  assert.equal(afterReload.readState().trash.length,1);
  assert.equal(afterReload.restoreDeleted(saved.item.id),true);
  state=afterReload.readState();
  assert.equal(state.items.length,1);
  assert.equal(state.trash.length,0);
  assert.equal(state.items[0].artist,'Verified singer');
  assert.match(memory.get('habla-ecuador-saved-sessions-v1'),/Corrected English draft/);
});

test('complete conversation saved, trashed and restored with both sides and languages',()=>{
  const {lib}=setup();
  const result=lib.saveSession('conversation',conversation,'Conversation 1');
  assert.equal(result.ok,true);
  assert.equal(lib.remove(result.item.id),true);
  assert.equal(lib.readState().trash[0].turns.length,2);
  assert.equal(lib.readState().trash[0].turns[1].translation,'¿Cómo estás?');
  assert.equal(lib.restoreDeleted(result.item.id),true);
  assert.equal(lib.readState().items[0].turns[0].source,'Hola');
  assert.equal(lib.readState().items[0].turns[1].target,'es-EC');
});

test('permanent deletion is separate from ordinary Trash operation',()=>{
  const {lib}=setup();
  const saved=lib.saveSession('music',song,'Never silently purged');
  assert.equal(saved.ok,true);
  assert.equal(lib.permanentlyDelete(saved.item.id),false,'cannot bypass Trash');
  assert.equal(lib.readState().items.length,1);
  assert.equal(lib.remove(saved.item.id),true);
  assert.equal(lib.permanentlyDelete(saved.item.id),true);
  assert.deepEqual(lib.readState().trash,[]);
  assert.equal(lib.restoreDeleted(saved.item.id),false);
});

test('full Trash refuses additional deletion; no active entry silently disappears',()=>{
  const {lib}=setup();
  const base=lib.readState();
  // Exercise overflow without exposing any real song material.
  const example=lib.sanitize({...song,kind:'music',id:'example'});
  const forty=Array.from({length:40},(_,i)=>({...example,id:'trash-'+i,deletedAt:new Date().toISOString()}));
  assert.equal(lib.writeState({items:[],trash:forty}),true);
  // A new fixture is required because the module caches the last UI state.
  const reloaded=require.resolve('../saved-sessions.js');
  delete require.cache[reloaded];
  const next=require('../saved-sessions.js');
  const saved=next.saveSession('music',song);
  assert.equal(saved.ok,true);
  assert.equal(next.remove(saved.item.id),false);
  assert.equal(next.read().length,1);
  assert.equal(next.readState().trash.length,40);
});

test('clearing unsaved current work includes a reversible Trash choice and Cancel',()=>{
  const script=fs.readFileSync(path.join(__dirname,'../saved-sessions.js'),'utf8');
  const main=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
  const page=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  assert.match(script,/A Papelera \/ Trash \(recuperable\)/);
  assert.match(script,/Cancelar \/ Cancel/);
  assert.match(script,/Guard(ar|ar) \/ Save/);
  assert.match(script,/function trashDraft\(/);
  assert.match(script,/function askBeforeClear\(/);
  assert.match(main,/HablaSavedSessions\?\.askBeforeClear\("music",newMusicSong\)/);
  assert.match(main,/HablaSavedSessions\?\.askBeforeClear\("conversation",clearConversation\)/);
  assert.match(page,/saved-sessions\.js\?v=218/);
  assert.match(script,/Confirmar eliminación definitiva \/ Confirm permanent delete/);
});

test('device storage failure prevents loss rather than claiming deletion',()=>{
  const {lib}=setup();
  const saved=lib.saveSession('music',song);
  assert.equal(saved.ok,true);
  global.localStorage.setItem=()=>{throw new Error('quota')};
  assert.equal(lib.remove(saved.item.id),false);
  assert.equal(lib.read().length,1,'failed write keeps current in-memory item');
});
