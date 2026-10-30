const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const player=fs.readFileSync('music-venezuela-captions.js','utf8');

test('Habla theater supplies English captions beside YouTube instead of native fullscreen',()=>{
 assert.match(html,/id="ve-habla-theater"[^>]*>Watch with English captions/);
 assert.match(html,/id="ve-theater-english"/);
 assert.match(html,/id="ve-theater-close"/);
 assert.match(html,/data-src="https:\/\/www.youtube.com\/embed\/[^"]*playsinline=1&amp;fs=0/);
 assert.doesNotMatch(html,/id="ve-youtube-frame"[^>]*allowfullscreen/);
 assert.match(css,/\.ve-lesson\.ve-theater-mode \.ve-stage\s*\{[^}]*position:fixed/);
 assert.match(css,/\.ve-lesson\.ve-theater-mode \.ve-theater-caption\s*\{[^}]*display:block/);
 assert.match(css,/\.ve-video-box:has\(iframe:not\(\[hidden\]\)\) \.ve-caption-overlay \{display:none !important;\}/);
});
test('English cue is rendered inside the playing-video companion too',()=>{
 assert.match(player,/theaterEnglish\.textContent=text\|\|/);
 assert.match(player,/selectedCue\(now\+offset\)/);
 assert.match(player,/root\.setInterval\(\(\)=>\{if\(!document.hidden&&document.getElementById\('music-view'\)\?\.classList.contains\('active'\)\)draw\(false\);\},300\)/);
 assert.match(html,/id="ve-caption-language"[^]*value="en-US"/);
});
test('Opening and closing theater preserves YouTube player and restores focus',()=>{
 const m=player.match(/function setTheater\(open\)\{[\s\S]*?\n\}/);
 assert.ok(m,'theater controller is present');
 const active=new Set(),classes={toggle(name,on){if(on)active.add(name);else active.delete(name);}};
 let focused=0,restored=0,pressed=null,draws=0;
 const button={setAttribute(name,v){if(name==='aria-pressed')pressed=v;}};
 const exit={focus(){focused++;}};
 const prior={focus(){restored++;}};
 const context={host:{classList:classes},document:{body:{classList:classes},activeElement:prior},
  theaterButton:button,theaterClose:exit,previousFocus:null,draw(){draws++;}};
 vm.createContext(context);
 vm.runInContext('let theaterOpen=false;\n'+m[0]+'\nsetTheater(true);',context);
 assert.equal(pressed,'true');
 assert.equal(focused,1);
 assert.ok(active.has('ve-theater-mode'));
 assert.ok(active.has('ve-theater-open'));
 vm.runInContext('setTheater(false);',context);
 assert.equal(pressed,'false');
 assert.equal(restored,1);
 assert.ok(!active.has('ve-theater-mode'));
 assert.equal(draws,2);
});
test('Theater is a separate explicit user action, not an automatic YouTube fullscreen',()=>{
 assert.match(player,/theaterButton\.addEventListener\('click',\(\)=>\{[\s\S]*?setTheater\(true\)/);
 assert.match(player,/theaterClose\.addEventListener\('click',\(\)=>setTheater\(false\)\)/);
 assert.match(player,/event\.key==='Escape'/);
 assert.match(player,/if\(theaterOpen\)setTheater\(false\)/);
});
