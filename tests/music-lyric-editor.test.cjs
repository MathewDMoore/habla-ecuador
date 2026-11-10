const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
function storage(){
 const map=new Map();
 return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v))};
}
class Element {
 constructor(tag='div'){
  this.tagName=tag;this.children=[];this.handlers={};this.dataset={};
  this.attributes={};this.className='';this.textContent='';this.value='';
  this.classList={add:(name)=>{this.className+=' '+name;}};
 }
 setAttribute(k,v){this.attributes[k]=v;}
 append(...children){this.children.push(...children);}
 addEventListener(k,handler){this.handlers[k]=handler;}
 insertAdjacentElement(where,element){this.lastInserted=element;}
 focus(){this.focused=true;}
 setSelectionRange(a,b){this.caret=[a,b];}
 remove(){this.removed=true;}
 click(){this.handlers.click?.();}
}
test('tapping a wrong lyric immediately focuses a nearby textarea keyboard and retains original',()=>{
 const previousDocument=globalThis.document,oldStore=globalThis.localStorage;
 const store=storage();
 globalThis.document={createElement:tag=>new Element(tag),contains:()=>true,getElementById:()=>null};
 globalThis.localStorage=store;
 delete require.cache[require.resolve('../music-lyric-editor.js')];
 const editor=require('../music-lyric-editor.js');
 try{
  const lyric=new Element('p');
  let corrected='',paused=0;
  editor.makeTappable(lyric,()=>editor.show({
   key:'sample:es',original:'El texto equivocado',anchor:lyric,
   onChange:value=>{corrected=value;},pause:()=>{paused++;}
  }));
  assert.equal(lyric.attributes.role,'button');
  lyric.click();
  const panel=lyric.lastInserted;
  assert.ok(panel);
  const field=panel.children[1];
  assert.equal(field.tagName,'textarea');
  assert.equal(field.focused,true,'focus is synchronous within tap');
  assert.equal(field.value,'El texto equivocado');
  assert.equal(paused,1,'playback pauses before editing');
  field.value='El texto corregido';
  const actions=panel.children[2];
  actions.children[0].click();
  assert.equal(corrected,'El texto corregido');
  assert.equal(editor.get('sample:es','El texto equivocado'),'El texto corregido');
  lyric.click();
  const reopened=lyric.lastInserted;
  assert.equal(reopened.children[1].value,'El texto corregido');
  reopened.children[2].children[2].click();
  assert.equal(corrected,'El texto equivocado');
  assert.equal(editor.get('sample:es','El texto equivocado'),'El texto equivocado');
  lyric.click();
  const canceled=lyric.lastInserted;
  canceled.children[1].value='Should not save';
  canceled.children[2].children[1].click();
  assert.equal(editor.get('sample:es','El texto equivocado'),'El texto equivocado');
 }finally{
  globalThis.document=previousDocument;
  globalThis.localStorage=oldStore;
  delete require.cache[require.resolve('../music-lyric-editor.js')];
 }
});
test('correction controls are distinct from timed text and avoid editing copyrighted audio',()=>{
 const editor=fs.readFileSync('music-lyric-editor.js','utf8');
 const music=fs.readFileSync('music-venezuela-captions.js','utf8');
 const app=fs.readFileSync('app.js','utf8');
 assert.match(editor,/field\.focus\(\)/);
 assert.match(editor,/Guardar \/ Save/);
 assert.match(editor,/Restaurar original \/ Restore/);
 assert.match(editor,/localStorage/);
 assert.match(music,/function beginCueCorrection/);
 assert.match(music,/bye-bye:verse/);
 assert.match(app,/bindMusicLyricEdits/);
 assert.match(app,/const players = \$\$\("#music-view audio"\)/);
 for(const path of ['index.html','translator.html','sw.js'])
  assert.match(fs.readFileSync(path,'utf8'),/music-lyric-editor\.js\?v=218/);
});
