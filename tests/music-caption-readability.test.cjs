const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const script=fs.readFileSync('music-venezuela-captions.js','utf8');

function rule(name){
 const escaped=name.replace(/[.*+?^$()|[\]{}]/g,'\\$&');
 const match=css.match(new RegExp(escaped+'\\s*\\{([^}]+)\\}'));
 assert.ok(match,'missing CSS selector: '+name);
 return match[1];
}
function hexColor(value){
 let s=value.replace('#','');
 if(s.length===3)s=s.split('').map(c=>c+c).join('');
 return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255);
}
function luminance(rgb){
 return rgb.map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4)
           .reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
}
function contrast(a,b){
 const x=luminance(hexColor(a)),y=luminance(hexColor(b));
 return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
test('high-contrast white text on nearly black background beats AAA text threshold',()=>{
 const overlay=rule('.ve-caption-overlay');
 const reading=rule('.ve-reading-text');
 for(const [name,declarations] of [['overlay',overlay],['full-size reading panel',reading]]){
  const bg=declarations.match(/background:(#[0-9a-fA-F]{3,6})/)[1];
  const fg=declarations.match(/color:(#[0-9a-fA-F]{3,6})/)[1];
  assert.ok(contrast(bg,fg)>=7,name+' must exceed WCAG AAA 7:1');
  assert.match(declarations,/font-weight:(?:800|850|900)/);
 }
});
test('Music subtitles show a large default plus selectable extra-large captions',()=>{
 assert.match(html,/id="ve-music-lesson"[^>]+data-caption-size="large"/);
 assert.match(html,/id="ve-caption-size"/);
 assert.match(html,/<option value="large" selected>/);
 assert.match(html,/<option value="extra">Extra large/);
 assert.match(css,/--ve-overlay-font:1\.4rem; --ve-reading-font:1\.625rem/);
 assert.match(css,/\[data-caption-size="extra"\][^\n]*--ve-reading-font:2rem/);
});
test('user-controlled caption size updates both caption surfaces and remembers choice',()=>{
 const functionSource=script.match(/function applyCaptionSize\(value\)\{[\s\S]*?\n\}/)?.[0];
 assert.ok(functionSource,'caption size handler must exist');
 const saved={},host={dataset:{}},sizeSelect={value:''};
 const root={localStorage:{setItem:(name,value)=>{saved[name]=value;}}};
 const ctx=vm.createContext({host,sizeSelect,root});
 vm.runInContext(functionSource+'\napplyCaptionSize("extra")',ctx);
 assert.equal(host.dataset.captionSize,'extra');
 assert.equal(sizeSelect.value,'extra');
 assert.equal(saved['habla-ve-caption-size-v1'],'extra');
 vm.runInContext('applyCaptionSize("unknown")',ctx);
 assert.equal(host.dataset.captionSize,'large','unknown preference reverts to readable default');
});
test('high-contrast caption remains outside YouTube iframe as complete text',()=>{
 assert.match(html,/id="ve-caption-overlay"/);
 assert.match(html,/id="ve-caption-reading"/);
 assert.match(script,/caption\.textContent=overlayText/);
 assert.match(script,/reading\.textContent=text/);
 assert.match(css,/\.ve-caption-overlay[^}]*z-index:10/);
 assert.match(css,/\.ve-reading-text[^}]*overflow-wrap:anywhere/);
});
