const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const bilingual=require('../bilingual-music.js');
const examples=[
 ['I want to stay. Yo quiero trabajar.',['en','es']],
 ['Yo quiero trabajar pero I want to stay.',['es','en']],
 ['I do not want to leave pero yo tengo trabajo.',['en','es']],
 ['Yo tengo trabajo.\n\nI want to stay.\nYo tengo trabajo.',['es','en']],
 ['Hola gracias contigo.',['es']],['Hello thanks goodbye.',['en']]
];
for(const [text,languages] of examples){const p=bilingual.plan(text);assert.equal(p.parts.map(x=>x.text).join(''),text);assert.deepEqual(p.languages,languages);}
for(const text of ['No','Maria Chris','solo pie','que ya','chingar','London Quito'])assert.equal(bilingual.plan(text).uncertain,true,text+' must remain uncertain');
const elements=new Map(),storage=new Map(),requests=[];
function el(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',hidden:false,dataset:{},children:[],append(n){this.children.push(n)},replaceChildren(){this.children=[]},classList:{toggle(){},add(){},remove(){}},setAttribute(){},removeAttribute(){}});return elements.get(id);}
let handler;
const context=vm.createContext({console,setTimeout,clearTimeout,AbortController,HablaBilingualMusic:bilingual,
 document:{querySelector:el,addEventListener(){},createElement:()=>({get innerHTML(){return this.textContent||''},set innerHTML(v){this.value=v;}})},
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},navigator:{onLine:true},
 fetch:async url=>{const u=new URL(url),text=u.searchParams.get('q'),pair=u.searchParams.get('langpair');requests.push({text,pair});return {ok:true,status:200,json:async()=>({responseStatus:200,responseData:{translatedText:await handler(text,pair)}})}}
});
for(const name of ['research-reference.js','spanish-context.js','app.js'])vm.runInContext(fs.readFileSync(name,'utf8'),context);
const run=s=>vm.runInContext(s,context);
el('#music-source-mode').value='auto';
async function main(){
 handler=async(text,pair)=>pair==='es|en'?'I have work.':'Yo quiero quedarme.';
 assert.equal(await run('requestGeneralTranslation("Yo tengo trabajo. I want to stay.","ec-en",{source:"es-EC",target:"en-US",inputType:"music"})'),'I have work. I want to stay.');
 assert.deepEqual(requests,[{text:'Yo tengo trabajo.',pair:'es|en'}]);requests.length=0;run('translationChunkCache.clear()');
 assert.equal(await run('requestGeneralTranslation("Yo tengo trabajo. I want to stay.","ec-en",{source:"es-EC",target:"es-EC",inputType:"music"})'),'Yo tengo trabajo. Yo quiero quedarme.');
 assert.deepEqual(requests,[{text:'I want to stay.',pair:'en|es'}]);
 assert.equal(run('sourceLanguage'), 'en-US','routing does not mutate the selected source');
 assert.match(el('#music-language-status').textContent,/Spanish \+ English/);
 const offline=[];context.HablaOffline={shouldUse:()=>true,translate:async(text,way)=>{offline.push({text,way});return 'I have work.';}};
 requests.length=0;
 assert.equal(await run('requestGeneralTranslation("Yo tengo trabajo. I want to stay.","ec-en",{source:"es-EC",target:"en-GB",inputType:"music",onDevice:true})'),'I have work. I want to stay.');
 assert.deepEqual(offline,[{text:'Yo tengo trabajo.',way:'ec-en'}]);assert.equal(requests.length,0);
 context.HablaOffline.shouldUse=()=>false;
 requests.length=0;handler=async()=>{throw new Error('Must not translate already-target text')};
 assert.equal(await run('requestGeneralTranslation("I want to stay.","ec-en",{source:"es-EC",target:"en-US",inputType:"music"})'),'I want to stay.');
 assert.equal(requests.length,0);
 assert.equal(run('musicTranslationRequestCost("I want to stay.","es-EC","en-US")'),0);
 assert.equal(run('musicTranslationRequestCost("Yo tengo trabajo. I want to stay. Yo quiero trabajar.","es-EC","en-US")'),2);
 // Unknown short words use the explicit From language and advertise uncertainty.
 handler=async()=> 'A reviewed draft.';
 await run('requestGeneralTranslation("Maria Chris", "ec-en",{source:"es-MX",target:"en-US",inputType:"music"})');
 assert.match(el('#music-language-status').textContent,/uncertain/);
 // Manual source override, documents and research keep the original route.
 el('#music-source-mode').value='selected';run('translationChunkCache.clear()');requests.length=0;
 await run('requestGeneralTranslation("I want to stay.","ec-en",{source:"es-EC",target:"en-US",inputType:"music"})');
 assert.equal(requests[0].pair,'es|en');
 el('#music-source-mode').value='auto';run('translationChunkCache.clear()');requests.length=0;
 await run('requestGeneralTranslation("I want to stay.","ec-en",{source:"es-EC",target:"en-US",purpose:"academic",inputType:"music"})');
 assert.equal(requests[0].pair,'es|en');
 run('translationChunkCache.clear()');requests.length=0;
 await run('requestGeneralTranslation("I want to stay.","ec-en",{source:"es-EC",target:"en-US",inputType:"image"})');assert.equal(requests[0].pair,'es|en');
 // Cancellation and failure never publish partial output or a stale language label.
 let complete,current=true;context.isCurrent=()=>current;
 handler=()=>new Promise(resolve=>{complete=resolve;});run('translationChunkCache.clear()');
 el('#music-language-status').textContent='Current state';
 const pending=run('requestGeneralTranslation("Yo tengo trabajo. I want to stay.","ec-en",{source:"es-EC",target:"en-US",inputType:"music",isCurrent})');
 await new Promise(resolve=>setImmediate(resolve));current=false;complete('Old draft.');await assert.rejects(pending,e=>e.code==='superseded');
 assert.equal(el('#music-language-status').textContent,'Current state');
 assert.ok(run('musicFragmentReason("I want to stay pero que ya","es-EC",true)'));
 assert.ok(run('musicFragmentReason("Yo quiero trabajar but I am not","en-US",true)'));
 assert.equal(run('musicFragmentReason("Yo quiero trabajar. I want to stay.","en-US",true)'), '');
 run('sourceLanguage="es-EC";targetLanguage="en-US";direction="ec-en";translationPurpose="everyday"');
 assert.notEqual(run('translationEditKey("Un texto.",direction,englishVariant,translationPurpose,"auto")'),run('translationEditKey("Un texto.")'));
 // Real saved-gloss functions use independent auto/selected keys.
 el('#translator-input').value='Yo tengo trabajo. I want to stay.';
 run('setEditableTranslation(document.querySelector("#translator-input").value,"Generated draft.",{musicSourceMode:"auto"})');
 el('#natural-result').textContent='My edited bilingual draft.';run('saveActiveTranslationEdit()');
 run('setEditableTranslation(document.querySelector("#translator-input").value,"New generated draft.",{musicSourceMode:"auto"})');
 assert.equal(el('#natural-result').textContent,'My edited bilingual draft.');
 run('setEditableTranslation(document.querySelector("#translator-input").value,"Selected-language draft.",{musicSourceMode:"selected"})');
 assert.equal(el('#natural-result').textContent,'Selected-language draft.');
 console.log('Bilingual music checks passed: ES/EN spans, exact source reconstruction, fixed target, online/offline routes, uncertainty/manual override, fragments, budgets, stale results and saved glosses. Audio recognition unverified.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
