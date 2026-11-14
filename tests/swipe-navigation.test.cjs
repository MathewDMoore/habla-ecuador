const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const swipes=require('../swipe-navigation.js');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const app=fs.readFileSync('app.js','utf8');

const tabs=['home-view','translator-view','dictionary-view','music-view','lesson-view'];

test('same five visible buttons on main navigation and in Face to Face',()=>{
  const nav=html.match(/<nav class="bottom-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  const modal=html.match(/<nav class="face-to-face-bottom-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(nav&&modal);
  for(const tab of tabs) {
    assert.match(nav,new RegExp('data-open="'+tab+'"'));
    assert.match(modal,new RegExp('data-face-open="'+tab+'"'));
  }
  assert.equal((nav.match(/<button\b/g)||[]).length,5);
  assert.equal((modal.match(/<button\b/g)||[]).length,5);
  assert.match(nav,/class="active" aria-current="page" data-open="home-view"/);
  assert.match(modal,/class="active" aria-current="page" data-face-open="translator-view"/);
  assert.match(css,/\.face-to-face-panels\s*\{[^}]*grid-template-rows:minmax\(0,1fr\) auto minmax\(0,1fr\) auto/);
  assert.match(css,/\.face-to-face-bottom-nav\s*\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});

test('selected destination becomes visually prominent and accessible without hiding other buttons',()=>{
  const cssTail=css.slice(css.lastIndexOf('/* One visible five-tab navigation system'));
  assert.match(cssTail,/\.bottom-nav button\.active/);
  assert.match(cssTail,/\.face-to-face-bottom-nav button\.active/);
  assert.match(cssTail,/background:#174d38/);
  assert.match(cssTail,/color:#fff/);
  assert.doesNotMatch(cssTail.split("/* Saved song/conversation notes:")[0].split("/* Keep photo labels")[0],/display:none|visibility:hidden/);
  const functionBody=app.match(/function syncMainNavSelection\(id\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(functionBody,'shared nav state should have an actual implementation');
  const buttons=tabs.flatMap(id=>['normal','modal'].map(kind=>{
    const attrs={};
    const classes=new Set();
    return {kind,id,dataset:kind==='normal'?{open:id}:{faceOpen:id},attrs,
      classList:{toggle:(name,value)=>value?classes.add(name):classes.delete(name),
        contains:name=>classes.has(name)},
      setAttribute:(name,value)=>{attrs[name]=value;},
      removeAttribute:name=>{delete attrs[name];}
    };
  }));
  const context=vm.createContext({$$:()=>buttons});
  vm.runInContext(functionBody+'; syncMainNavSelection("music-view");',context);
  for(const item of buttons){
    assert.equal(item.classList.contains('active'),item.id==='music-view');
    assert.equal(item.attrs['aria-current'],item.id==='music-view'?'page':undefined);
  }
  vm.runInContext('syncMainNavSelection("translator-view")',context);
  assert.equal(buttons.filter(item=>item.classList.contains('active')).length,2);
  assert.ok(buttons.filter(item=>item.classList.contains('active')).every(item=>item.id==='translator-view'));
  assert.match(app,/dialog\.showModal\(\);\s*syncMainNavSelection\("translator-view"\);/);
});

test('swipes between only the five main tabs in their visible order',()=>{
  assert.deepEqual(Array.from(swipes.TABS),tabs);
  assert.equal(swipes.nextTab('home-view',1),'translator-view');
  assert.equal(swipes.nextTab('translator-view',1),'dictionary-view');
  assert.equal(swipes.nextTab('dictionary-view',1),'music-view');
  assert.equal(swipes.nextTab('music-view',1),'lesson-view');
  assert.equal(swipes.nextTab('lesson-view',1),null);
  assert.equal(swipes.nextTab('home-view',-1),null);
  assert.equal(swipes.nextTab('music-view',-1),'dictionary-view');
  assert.equal(swipes.nextTab('review-view',1),null);
  assert.equal(swipes.isSwipe(-95,10),true);
  assert.equal(swipes.isSwipe(90,-8),true);
  assert.equal(swipes.isSwipe(-44,18),true);
  assert.equal(swipes.isSwipe(44,-18),true);
  assert.equal(swipes.isSwipe(27,0),false);
  assert.equal(swipes.isSwipe(28,23),false);
  assert.equal(swipes.isSwipe(28,12),true);
  assert.equal(swipes.isSwipe(-18,4,160),true);
  assert.equal(swipes.isSwipe(18,4,400),false);
  assert.equal(swipes.isSwipe(17,0,120),false);
  assert.equal(swipes.isSwipe(70,130),false);
});

test('gesture safety preserves keyboard typing, media, dialogs and iPhone back gesture',()=>{
  const code=fs.readFileSync('swipe-navigation.js','utf8');
  assert.match(code,/input,textarea,select/);
  assert.match(code,/\[contenteditable\]/);
  assert.match(code,/audio,video,iframe/);
  assert.match(code,/\.lyric-lines/);
  assert.match(code,/scrollsHorizontally\(target\)/);
  assert.match(code,/touch\.clientX<28\|\|touch\.clientX>width-28/);
  assert.match(code,/event\.touches\.length!==1/);
  assert.match(code,/dialog\[open\]/);
  assert.match(code,/touchmove/);
  assert.match(code,/if\(event.cancelable\)event.preventDefault\(\)/);
});

test('script load and cached asset support offline swipe navigation',()=>{
  for(const path of ['index.html','sw.js']){
    const source=fs.readFileSync(path,'utf8');
    assert.match(source,/swipe-navigation\.js\?v=232/,path);
  }
  assert.match(app,/HablaSwipeNavigation\.bind\(/);
});
