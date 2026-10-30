const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const script=fs.readFileSync('music-venezuela-captions.js','utf8');

function render({sourceMode='youtube',ready=true,language='en-US'}={}){
 const start=script.indexOf('function draw(force){');
 const end=script.indexOf('function renderPassages(){',start);
 assert.ok(start>=0&&end>start,'must find actual caption drawing function');
 const drawSource=script.slice(start,end);
 const caption={hidden:true,textContent:''};
 const lang={value:language};
 const overlayText={textContent:''};
 const reading={textContent:''};
 const confidence={textContent:'',classList:{toggle(){}}};
 const timing={value:'0'};
 const ctx=vm.createContext({
  sourceMode,ready,lang,caption,reading,confidence,
  theaterEnglish:overlayText,timeLabel:{textContent:''},timing,
  manual:0,offset:0,last:-2,cues:[[4,10,'English draft for demonstration.','UK English draft.',true]],
  document:{activeElement:null},position:()=>7,fmt:()=>'0:07',selectedCue:()=>0
 });
 vm.runInContext(drawSource+'\ndraw(true);',ctx);
 return {caption,reading,overlayText};
}

test('inline YouTube renders an English translation ON the actual video',()=>{
 const rendered=render();
 assert.equal(rendered.caption.hidden,false,'English on-video overlay must be visible');
 assert.equal(rendered.caption.textContent,'English draft for demonstration.');
 assert.equal(rendered.reading.textContent,'English draft for demonstration.');
 assert.equal(rendered.overlayText.textContent,'English draft for demonstration.');
});

test('UK option selects UK draft on the video',()=>{
 const rendered=render({language:'en-GB'});
 assert.equal(rendered.caption.textContent,'UK English draft.');
 assert.equal(rendered.caption.hidden,false);
});

test('Off hides the English overlay but keeps the video visible',()=>{
 const rendered=render({language:'off'});
 assert.equal(rendered.caption.hidden,true);
 assert.equal(rendered.caption.textContent,'');
});

test('unconfirmed iframe time displays a syncing message, not invented synchronized lyrics',()=>{
 const rendered=render({ready:false});
 assert.equal(rendered.caption.hidden,false);
 assert.match(rendered.caption.textContent,/connecting to video time/);
 assert.doesNotMatch(rendered.caption.textContent,/English draft for demonstration/);
});

test('English option appears directly inside the video frame, above YouTube iframe',()=>{
 const iframe=html.indexOf('id="ve-youtube-frame"');
 const control=html.indexOf('id="ve-in-video-language"');
 const overlay=html.indexOf('id="ve-caption-overlay"');
 const boxEnd=html.indexOf('</div>\n            <div class="ve-theater-caption"');
 assert.ok(iframe>=0&&control>iframe&&overlay>control&&boxEnd>overlay);
 assert.match(html,/value="en-US">🇺🇸 English on/);
 assert.match(html,/value="en-GB">🇬🇧 UK English on/);
 assert.match(html,/value="off">Subtitles off/);
 assert.match(css,/\.ve-video-box:has\(iframe:not\(\[hidden\]\)\) \.ve-caption-overlay \{z-index:24;\}/);
 assert.doesNotMatch(css,/\.ve-video-box:has\(iframe:not\(\[hidden\]\)\) \.ve-caption-overlay \{display:none !important;\}/);
 assert.match(css,/\.ve-video-box > \.ve-in-video-switch \{[\s\S]*?z-index:28/);
});

test('in-video dropdown is connected to existing US/UK/Off caption selector',()=>{
 assert.match(script,/inVideoLanguage\.addEventListener\('change',\(\)=>\{/);
 assert.match(script,/lang\.value=inVideoLanguage\.value;/);
 assert.match(script,/inVideoLanguage\.value=lang\.value;/);
 assert.match(script,/lang\.addEventListener\('change',syncInVideoLanguage\)/);
});
