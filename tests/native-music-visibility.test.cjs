const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('music-venezuela-captions.js','utf8');
const functionSource=source.match(/function exposeFeaturedVideoInNativeMusic\(\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(functionSource,'native music visibility fix must exist');

function run({native=true,workspace=true,visible=false}={}){
 const explore={id:'native-music-explore',open:false};
 const music={id:'music-view',moves:0,insertBefore(node,before){
   assert.equal(before,editor);
   this.moves++;node.parentElement=this;
 }};
 const editor={id:'native-music-workspace'};
 const featured={id:'ve-music-lesson',parentElement:visible?music:explore};
 const document={getElementById(id){
   return id==='music-view'?music:id==='native-music-workspace'?(workspace?editor:null):null;
 }};
 const root={__hablaNativeInlineVideo:native};
 const context={root,document,host:featured};
 vm.runInNewContext(functionSource+'\nexposeFeaturedVideoInNativeMusic();',context);
 return {music,featured,explore};
}

test('native Music brings the actual BYE BYE player out of closed Explore',()=>{
 const {music,featured,explore}=run();
 assert.equal(explore.open,false);
 assert.equal(music.moves,1);
 assert.equal(featured.parentElement,music);
});

test('ordinary Safari and previous iPhone shells preserve the original layout',()=>{
 const {music,featured,explore}=run({native:false});
 assert.equal(music.moves,0);
 assert.equal(featured.parentElement,explore);
});

test('only one existing video is moved, without duplicating it',()=>{
 const {music}=run({visible:true});
 assert.equal(music.moves,0);
});

test('legacy layouts without the native workspace are unaffected',()=>{
 const {music}=run({workspace:false});
 assert.equal(music.moves,0);
});

test('native layout timing is covered by both document ready and child moves',()=>{
 assert.match(source,/nativeLayoutObserver\.observe\(document\.getElementById\('music-view'\),\{childList:true\}\)/);
 assert.match(source,/document\.addEventListener\('DOMContentLoaded',exposeFeaturedVideoInNativeMusic/);
 const index=fs.readFileSync('index.html','utf8');
 assert.match(index,/id="ve-music-lesson"/);
 assert.match(index,/id="ve-youtube-frame"/);
 assert.match(index,/id="ve-caption-reading"/);
});
