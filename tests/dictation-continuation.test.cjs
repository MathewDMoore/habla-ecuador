const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(){
 const elements=new Map();
 const el=selector=>{
  if(!elements.has(selector))elements.set(selector,{
   value:'',textContent:'',innerHTML:'',hidden:false,disabled:false,
   dataset:{},children:[],classList:{toggle(){},add(){},remove(){}},
   events:{},addEventListener(type,fn){this.events[type]=fn;},setAttribute(){},removeAttribute(){},append(x){this.children.push(x);},replaceChildren(){},
   querySelector(){return null;},closest(){return null;}
  });
  return elements.get(selector);
 };
 const sessions=[];
 class Recognition{
  start(){sessions.push(this);}
  stop(){this.onend?.();}
  abort(){}
 }
 const ctx=vm.createContext({
  console,AbortController,setTimeout,clearTimeout,
  window:{SpeechRecognition:Recognition,webkitSpeechRecognition:Recognition},
  navigator:{onLine:true},
  localStorage:{getItem:()=>null,setItem(){}},
  document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({textContent:'',set innerHTML(v){this.value=v;},get innerHTML(){return this.value;}})}
 });
 vm.runInContext(fs.readFileSync('app.js','utf8'),ctx,{filename:'app.js'});
 const run=s=>vm.runInContext(s,ctx);
 run('globalThis.realRenderTranslation=renderTranslation;stopSpeechPlayback=()=>{};updateMusicListenLabel=()=>{};renderTranslation=()=>{globalThis.translationCount=(globalThis.translationCount||0)+1;};');
 return {ctx,el,sessions,run};
}
function emit(instance,text,{final=false,confirmedText,tentativeText}={}){
 const result=[{transcript:text}];result.isFinal=final;
 instance.onresult?.({results:[result],...(confirmedText!==undefined?{confirmedText,tentativeText}:{} )});
}
test('Add missing words keeps previous English source while the new session revises its fragment',()=>{
 const {el,sessions,run}=setup();
 const source='I need to go home and use my computer';
 el('#translator-input').value=source;
 run('sourceLanguage="en-US";targetLanguage="es-MX";syncLanguagePair();startInputMicrophone({append:true})');
 assert.equal(sessions.length,1);
 assert.equal(el('#translator-input').value,source,'existing source never disappears when microphone starts');
 emit(sessions[0],'to fix',{final:false});
 assert.equal(el('#translator-input').value,source+'\nto fix');
 assert.equal(el('#translation-result').hidden,true,'no stale output with tentative input');
 emit(sessions[0],'to continue developing this app.',{final:true});
 assert.equal(el('#translator-input').value,source+'\nto continue developing this app.');
 assert.equal(run('translationCount'),1,'confirmed continuation translates once');
 assert.equal(run('translatorDictationNeedsReview'),false);
});
test('Ended native drafts translate automatically while retaining the incomplete-transcript warning',()=>{
 const {el,sessions,run}=setup();
 el('#translator-input').value='The words I know';
 run('sourceLanguage="en-US";targetLanguage="es-MX";syncLanguagePair();startInputMicrophone({append:true})');
 emit(sessions[0],'and incomplete',{final:true,confirmedText:'and',tentativeText:'incomplete'});
 assert.equal(el('#translator-input').value,'The words I know\nand incomplete');
 assert.equal(run('translatorDictationNeedsReview'),false);
 assert.equal(run('typeof translationCount === "undefined" ? 0 : translationCount'),1,'ended draft translates without confirmation');
 assert.equal(el('#translator-mic-confirm').hidden,true,'no confirmation tap required');
 assert.match(el('#translator-mic-status').textContent,/incomplete/);
});
test('Empty continuation keeps existing words and unrelated dictation defaults to replace',()=>{
 const {el,sessions,run}=setup();
 el('#translator-input').value='Existing source';
 run('sourceLanguage="en-US";targetLanguage="es-MX";syncLanguagePair();startInputMicrophone({append:true})');
 sessions[0].onend?.();
 assert.equal(el('#translator-input').value,'Existing source');
 run('startInputMicrophone()');
 emit(sessions[1],'New source.',{final:true});
 assert.equal(el('#translator-input').value,'New source.','normal microphone preserves existing replace behavior');
});

test('Typing and pasting debounce automatically; edits invalidate older replies',()=>{
 const {ctx,el,run}=setup(),pending=new Map();let id=0;
 ctx.setTimeout=fn=>{pending.set(++id,fn);return id;};ctx.clearTimeout=key=>pending.delete(key);
 const source=fs.readFileSync('app.js','utf8'),start=source.indexOf('  $("#translator-input").addEventListener("input", () => {');
 const end=source.indexOf('  $("#input-mic")?.addEventListener',start);
 assert.ok(start>=0&&end>start);run(source.slice(start,end));
 const input=el('#translator-input');
 input.value='Unlisted text';input.events.input();
 input.value='Unlisted pasted text';input.events.input();
 assert.equal(pending.size,1,'only newest input is scheduled');
 assert.equal(run('typeof translationCount==="undefined"?0:translationCount'),0);
 [...pending.values()][0]();pending.clear();assert.equal(run('translationCount'),1);
 const before=run('translationRequest');input.value='How are you?';input.events.input();
 assert.equal(run('translationCount'),2,'local phrase translates immediately');
 assert.ok(run('translationRequest')>before);
});
test('A confident wrong source route is corrected automatically instead of blocking',async()=>{
 const {ctx,el,run}=setup();el('#translator-input').value='Estoy en camino a mi casa';
 run('renderSpanishContext=()=>{};translationInputLanguageMismatch=()=>"es";correctTranslationSourceLanguage=options=>{globalThis.autoOptions=options;return "corrected";};');
 assert.equal(await run('realRenderTranslation()'),'corrected');
 assert.equal(ctx.autoOptions.automatic,true);
});
test('Automatic language correction preserves source text and regional destination',()=>{
 const {el,run}=setup();const original='Estoy en camino a mi casa';el('#translator-input').value=original;
 run('sourceLanguage="en-US";targetLanguage="es-VE";translationInputLanguageMismatch=()=>"es";cancelMusicListening=()=>{};saveActiveTranslationEdit=()=>{};showToast=()=>{};correctTranslationSourceLanguage({automatic:true});');
 assert.equal(el('#translator-input').value,original);
 assert.equal(run('sourceLanguage'),'es-VE');assert.equal(run('targetLanguage'),'en-US');
 assert.equal(run('translationCount'),1);
});
