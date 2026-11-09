const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const stored={};
global.localStorage={
 getItem:key=>stored[key]??null,
 setItem:(key,value)=>{stored[key]=value;}
};
class Elem {
 constructor(tag){
  this.tag=tag;this.children=[];this.dataset={};this.listeners={};this.attrs={};
  this.id='';this.className='';this.value='';this.textContent='';this.open=false;
 }
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=[...children];}
 addEventListener(event,callback){this.listeners[event]=callback;}
 setAttribute(k,v){this.attrs[k]=v;}
}
const hostMusic=new Elem('div');hostMusic.id='music-save-host';
const hostConversation=new Elem('div');hostConversation.id='conversation-save-host';
const faceAction=new Elem('div');
const faceButton=new Elem('button');faceButton.id='save-face-conversation';
faceAction.append(faceButton);
function findId(node,id){
 if(node.id===id)return node;
 for(const child of node.children){const found=findId(child,id);if(found)return found;}
 return null;
}
global.document={
 createElement:tag=>new Elem(tag),
 getElementById:id=>findId(hostMusic,id)||findId(hostConversation,id)||findId(faceAction,id),
 querySelector:selector=>selector==='#face-to-face .face-to-face-actions'?faceAction:null
};
const archive=require('../saved-music-conversations.js');
const song={
 source:'A captured phrase that the listener supplied',
 target:'Una frase capturada que aportó quien escucha',
 sourceLanguage:'en-US',targetLanguage:'es-EC',
 passages:[{source:'Captured phrase',draft:'Frase capturada',language:'en-US',target:'es-EC'}],
 audio:'must not be stored'
};
const conversation={turns:[
 {speaker:'Speaker 1',source:'Hello',translation:'Hola',sourceLocale:'en-US',target:'es-EC'},
 {speaker:'Speaker 2',source:'¿Cómo estás?',translation:'How are you?',sourceLocale:'es-EC',target:'en-US'}
],recording:'never stored'};
function click(id){global.document.getElementById(id)?.listeners.click?.();}
function action(container,id,verb){
 const target={closest:()=>({dataset:{savedId:id,savedAction:verb}})};
 global.document.getElementById(container).listeners.click({target});
}
test('music and conversation shelves mount in reserved hosts and are manual only',()=>{
 assert.equal(archive.list('song').length,0);
 assert.equal(archive.list('conversation').length,0);
 archive.bind({getSong:()=>song,getConversation:()=>conversation,restoreSong:()=>true,restoreConversation:()=>true});
 assert.ok(document.getElementById('save-music-translation'));
 assert.ok(document.getElementById('save-conversation-now'));
 assert.ok(document.getElementById('saved-music-trash-results'));
 assert.ok(document.getElementById('saved-conversations-trash-results'));
 assert.equal(archive.list('song').length,0,'never auto-save captured music');
 assert.equal(archive.list('conversation').length,0,'never auto-save others speaking');
});
test('song save preserves translation but not unlicensed audio and trash supports undo',()=>{
 click('save-music-translation');
 let saved=archive.list('song');
 assert.equal(saved.length,1);
 assert.equal(saved[0].source,song.source);
 assert.equal(saved[0].target,song.target);
 assert.equal(saved[0].passages.length,1);
 assert.equal(saved[0].audio,undefined);
 const id=saved[0].id;
 action('saved-music-results',id,'delete');
 assert.equal(archive.list('song').length,0);
 assert.equal(archive.list('song','',true).length,1,'deleted song remains recoverable');
 assert.match(document.getElementById('saved-music-trash-results').children[0].children[0].textContent,/Untitled song/);
 action('saved-music-trash-results',id,'restore');
 assert.equal(archive.list('song').length,1);
 assert.equal(archive.list('song','',true).length,0);
 assert.equal(archive.list('song')[0].source,song.source,'restored original text is unchanged');
});
test('conversations preserve speaker/locale/translation, then can be recovered from trash',()=>{
 click('save-conversation-now');
 let saved=archive.list('conversation');
 assert.equal(saved.length,1);
 assert.equal(saved[0].turns[0].speaker,'Speaker 1');
 assert.equal(saved[0].turns[1].translation,'How are you?');
 assert.equal(saved[0].recording,undefined);
 const id=saved[0].id;
 action('saved-conversations-results',id,'delete');
 assert.equal(archive.list('conversation').length,0);
 assert.equal(archive.list('conversation','',true).length,1);
 action('saved-conversations-trash-results',id,'restore');
 assert.equal(archive.list('conversation').length,1);
 assert.equal(archive.list('conversation')[0].turns[1].source,'¿Cómo estás?');
});
test('permanent removal requires confirmation and is never an automatic expiry',()=>{
 const id=archive.list('conversation')[0].id;
 action('saved-conversations-results',id,'delete');
 global.confirm=()=>false;
 action('saved-conversations-trash-results',id,'purge');
 assert.equal(archive.list('conversation','',true).length,1,'declined permanent removal keeps data');
 global.confirm=()=>true;
 action('saved-conversations-trash-results',id,'purge');
 assert.equal(archive.list('conversation','',true).length,0);
 assert.match(fs.readFileSync('saved-music-conversations.js','utf8'),/cannot be recovered/);
});
test('archive limit rejects new items without deleting the oldest active item or trash',()=>{
 const archived=archive.list('song')[0].id;
 action('saved-music-results',archived,'delete');
 assert.equal(archive.list('song','',true).length,1);
 for(let i=0;i<15;i++)assert.equal(archive.add('song',{...song,title:'Song '+i}).ok,true);
 const earliest=archive.list('song').at(-1).id;
 const extra=archive.add('song',{...song,title:'Song 16'});
 assert.equal(extra.ok,false);
 assert.equal(archive.list('song').length,15);
 assert.equal(archive.list('song').at(-1).id,earliest);
 assert.equal(archive.list('song','',true).length,1,'trash must never be auto-purged to make room');
});
test('app integration reopens saved text without translating and retains both archive entrypoints',()=>{
 const app=fs.readFileSync('app.js','utf8');
 const index=fs.readFileSync('index.html','utf8');
 const sw=fs.readFileSync('sw.js','utf8');
 assert.match(app,/function currentSavedSong\(\)/);
 assert.match(app,/function currentSavedConversation\(faceOnly=false\)/);
 assert.match(app,/function restoreSavedSong\(item\)/);
 assert.match(app,/function restoreSavedConversation\(item\)/);
 assert.match(app,/HablaSavedSessions\.bind/);
 assert.match(index,/id="music-save-host"/);
 assert.match(index,/id="conversation-save-host"/);
 assert.match(index,/id="save-face-conversation"/);
 assert.match(index,/saved-music-conversations\.js\?v=218/);
 assert.match(sw,/saved-music-conversations\.js\?v=218/);
});
