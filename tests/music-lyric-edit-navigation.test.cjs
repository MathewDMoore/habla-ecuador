const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const music=require('../music-lyric-editor.js');
const swipes=require('../swipe-navigation.js');

const storage={};
global.localStorage={
  getItem:key=>storage[key]||null,
  setItem:(key,value)=>{storage[key]=value;}
};

class Elem{
  constructor(tag='div'){
    this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attrs={};
    this.parentElement=null;this.value='';this.textContent='';this.className='';this.focused=false;
    this.classList={add:name=>{this.className+=' '+name;}};
  }
  append(...elements){for(const element of elements){this.children.push(element);element.parentElement=this;}}
  setAttribute(key,value){this.attrs[key]=value;}
  addEventListener(key,callback){this.listeners[key]=callback;}
  insertAdjacentElement(place,element){this.inserted=element;element.parentElement=this.parentElement;}
  remove(){this.removed=true;}
  focus(){this.focused=true;}
  setSelectionRange(){}
  click(){this.listeners.click?.({target:this});}
}
function editFixture(){
 const anchor=new Elem('p');
 global.document={
  contains:el=>el===anchor,
  createElement:tag=>new Elem(tag),
  getElementById:()=>null
 };
 return anchor;
}
test('tap on incorrect lyric opens a focused iPhone keyboard field alongside lyric',()=>{
 const anchor=editFixture(),onChange=[];
 music.show({anchor,key:'test:cue:one:en',original:'Wrong translation',onChange:value=>onChange.push(value)});
 const panel=anchor.inserted,field=panel.children[1],actions=panel.children[2];
 assert.equal(panel.tag,'section');
 assert.equal(field.tag,'textarea');
 assert.equal(field.focused,true,'direct synchronous focus must invoke the iPhone keyboard');
 assert.equal(field.value,'Wrong translation');
 assert.equal(actions.children[0].textContent,'Guardar / Save');
 field.value='Correct translation';
 actions.children[0].click();
 assert.deepEqual(onChange,['Correct translation']);
 assert.equal(panel.removed,true);
 assert.equal(music.get('test:cue:one:en','Wrong translation'),'Correct translation');
 assert.match(storage['habla-ecuador-music-lyric-edits-v1'],/Correct translation/);
});
test('cancel keeps existing correction, restore returns the original, and empty save is blocked',()=>{
 const anchor=editFixture();
 music.show({anchor,key:'test:cue:one:en',original:'Wrong translation'});
 let panel=anchor.inserted;
 panel.children[1].value='Accidental edit';
 panel.children[2].children[1].click();
 assert.equal(music.get('test:cue:one:en','Wrong translation'),'Correct translation');

 music.show({anchor,key:'test:cue:one:en',original:'Wrong translation'});
 panel=anchor.inserted;
 assert.equal(panel.children[1].value,'Correct translation');
 panel.children[1].value='   ';
 panel.children[2].children[0].click();
 assert.equal(panel.removed,undefined);
 assert.match(panel.children[3].textContent,/Escribe la corrección/);
 panel.children[2].children[2].click();
 assert.equal(music.get('test:cue:one:en','Wrong translation'),'Wrong translation');
});
test('separate Spanish, American English and British English corrections never overwrite one another',()=>{
 assert.equal(music.get('test:line:es','Original en español'),'Original en español');
 const keys=['test:line:es','test:line:en-US','test:line:en-GB'];
 const values=['Español corregido','Corrected US text','Corrected UK text'];
 for(let i=0;i<keys.length;i++){
  const anchor=editFixture();
  music.show({anchor,key:keys[i],original:'Initial'});
  anchor.inserted.children[1].value=values[i];
  anchor.inserted.children[2].children[0].click();
 }
 keys.forEach((key,i)=>assert.equal(music.get(key,'Initial'),values[i]));
});
test('touch target is keyboard accessible and does not consume song-wide text edits',()=>{
 const element=new Elem('p');
 let calls=0;
 music.makeTappable(element,()=>{calls++;});
 assert.equal(element.attrs.role,'button');
 assert.match(element.attrs['aria-label'],/Tap to edit lyrics/);
 element.click();
 element.listeners.keydown({key:'Enter',preventDefault:()=>{}});
 assert.equal(calls,2);
});
test('swipe size and direction are conservative',()=>{
 assert.deepEqual(swipes.TABS,['home-view','translator-view','dictionary-view','music-view','lesson-view']);
 assert.equal(swipes.isSwipe(-75,10),true);
 assert.equal(swipes.isSwipe(75,10),true);
 assert.equal(swipes.isSwipe(35,3),false);
 assert.equal(swipes.isSwipe(90,70),false);
 assert.equal(swipes.nextTab('translator-view',1),'dictionary-view');
 assert.equal(swipes.nextTab('translator-view',-1),'home-view');
 assert.equal(swipes.nextTab('home-view',-1),null);
 assert.equal(swipes.nextTab('lesson-view',1),null);
});
test('swiping navigates, but not over an editor, a modal, or while recording',()=>{
 const listeners={},body={};
 let active='translator-view',modal=false,recording=false,interactive=false;
 const view={id:active,parentElement:body,scrollWidth:100,clientWidth:100};
 const target={parentElement:view,scrollWidth:100,clientWidth:100,closest(selector){
  return selector==='.view.active'?view:interactive?{}:null;
 }};
 global.innerWidth=390;
 global.document={
  body,documentElement:{dataset:{},clientWidth:390},
  addEventListener:(event,fn)=>{listeners[event]=fn;},
  querySelector:selector=>selector==='.view.active'
    ?(view.id=active,view):(modal?{}:null)
 };
 const destinations=[];
 swipes.bind({navigate:to=>{destinations.push(to);active=to;},enabled:()=>!recording});
 const gesture=(start,end,dy=0)=>{
  listeners.touchstart({target,touches:[{clientX:start,clientY:200}]});
  listeners.touchend({changedTouches:[{clientX:end,clientY:200+dy}]});
 };
 gesture(250,150);
 assert.deepEqual(destinations,['dictionary-view']);
 gesture(150,250);
 assert.deepEqual(destinations,['dictionary-view','translator-view']);
 gesture(250,155,100);
 assert.equal(destinations.length,2,'vertical reading scroll is not navigation');
 interactive=true;gesture(250,145);interactive=false;
 assert.equal(destinations.length,2,'interactive captions, inputs and buttons are protected');
 modal=true;gesture(250,145);modal=false;
 assert.equal(destinations.length,2,'face-to-face dialog never gets swipe-navigation gestures');
 recording=true;gesture(250,145);recording=false;
 assert.equal(destinations.length,2,'voice capture disables screen switching');
 gesture(18,120);
 assert.equal(destinations.length,2,'do not intercept the iOS back gesture from the screen edge');
});
test('all five tabs remain accessible inside full-screen face-to-face dialog',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const app=fs.readFileSync('app.js','utf8');
 const css=fs.readFileSync('styles.css','utf8');
 const face=html.match(/<dialog id="face-to-face"[\s\S]*?<\/dialog>/)?.[0];
 assert.ok(face);
 assert.match(face,/class="face-to-face-bottom-nav"/);
 for(const id of swipes.TABS)assert.match(face,new RegExp('data-face-open="'+id+'"'));
 assert.equal((face.match(/data-face-open=/g)||[]).length,5);
 assert.match(app,/dialog\.querySelectorAll\("\[data-face-open\]"\)/);
 assert.match(app,/closeFaceToFace\(\);[\s\S]*?openView\(destination\)/);
 assert.match(css,/grid-template-rows:minmax\(0,1fr\) auto minmax\(0,1fr\) auto/);
 assert.match(css,/\.face-to-face-bottom-nav button/);
 assert.match(css,/min-height:48px/);
});
test('caption and licensed lyric integrations use the same local keyboard editor',()=>{
 const app=fs.readFileSync('app.js','utf8');
 const captions=fs.readFileSync('music-venezuela-captions.js','utf8');
 const html=fs.readFileSync('index.html','utf8');
 const standalone=fs.readFileSync('translator.html','utf8');
 const sw=fs.readFileSync('sw.js','utf8');
 assert.match(app,/function bindMusicLyricEdits/);
 assert.match(app,/editor\.makeTappable\(element/);
 assert.match(captions,/function beginCueCorrection/);
 assert.match(captions,/lyricEditor\?\.makeTappable\(surface/);
 assert.match(captions,/bye-bye:verse:/);
 assert.match(captions,/shownCue\(index\)/);
 for(const page of [html,standalone]){
  assert.match(page,/music-lyric-editor\.js\?v=218/);
  assert.match(page,/swipe-navigation\.js\?v=218/);
 }
 assert.match(sw,/music-lyric-editor\.js\?v=218/);
 assert.match(sw,/swipe-navigation\.js\?v=218/);
 assert.match(app,/HablaSwipeNavigation\.bind/);
});
