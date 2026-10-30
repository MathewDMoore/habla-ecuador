const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const mixed=require('../mixed-language-translation.js');

const original='Necesito voy a mi casa para usar mis computadora para continuar developing este app';
const wrong='I need to go to my house to use my computer to continue to view this app';
const expected='I need to go home to use my computer to continue developing this app';
const opts={source:'es-MX',target:'en-US',way:'ec-en',purpose:'everyday'};

test('Code-switching is normalized only for the service, not the original',()=>{
 assert.equal(mixed.prepare(original,opts),'necesito ir a casa para usar mi computadora para seguir desarrollando esta aplicación');
 assert.equal(original,'Necesito voy a mi casa para usar mis computadora para continuar developing este app');
 assert.deepEqual(mixed.detect(original,opts),{mixedDevelopment:true,appObject:true});
 assert.equal(mixed.refine(wrong,original,opts),expected);
 assert.equal(mixed.lostMeaning(expected,original,opts),false);
 assert.equal(mixed.lostMeaning(wrong,original,opts),true);
});

test('Both English varieties preserve developing, not viewing',()=>{
 for(const target of ['en-US','en-GB']){
  const options={...opts,target};
  assert.equal(mixed.refine(wrong,original,options),expected);
  assert.match(mixed.prepare(original,options),/seguir desarrollando esta aplicación/);
 }
});

test('Other meanings, quotes, and academic sources remain untouched',()=>{
 assert.equal(mixed.prepare(original,{...opts,purpose:'academic'}),original);
 assert.equal(mixed.prepare(original,{...opts,source:'en-US'}),original);
 assert.equal(mixed.prepare(original,{...opts,target:'es-EC'}),original);
 assert.equal(mixed.prepare('Dijo "continuar developing este app" como ejemplo.',opts),'Dijo "continuar developing este app" como ejemplo.');
 const view='I need to continue to view this app.';
 assert.equal(mixed.refine(view,'Quiero continuar viendo esta app.',opts),view);
 assert.equal(mixed.refine('I want to continue developing this app.',original,opts),'I want to continue developing this app.');
 assert.equal(mixed.prepare('Voy a mi casa para ver este app.',opts),'Voy a mi casa para ver este app.');
});

test('End-to-end everyday translator repairs provider meaning loss without changing source',async()=>{
 let requested='';
 const context=vm.createContext({
  console,AbortController,setTimeout,clearTimeout,
  window:{},
  navigator:{onLine:true},
  localStorage:{getItem:()=>null,setItem(){}},
  document:{querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},
    createElement:()=>({value:'',set innerHTML(v){this.value=v;},get innerHTML(){return this.value;}})},
  fetch:async url=>{
   requested=new URL(url).searchParams.get('q');
   return {ok:true,status:200,json:async()=>({responseStatus:200,responseData:{translatedText:wrong}})};
  }
 });
 for(const file of ['research-reference.js','spanish-context.js','english-varieties.js','language-community-terms.js','mixed-language-translation.js','app.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  if(file==='mixed-language-translation.js')context.HablaMixedTranslation=context.window.HablaMixedTranslation;
 }
 context.userSentence=original;
 const translate=target=>vm.runInContext('requestGeneralTranslation(userSentence,"ec-en",{source:"es-MX",target:'+JSON.stringify(target)+',purpose:"everyday",onDevice:false})',context);
 assert.equal(await translate('en-US'),expected);
 assert.equal(await translate('en-GB'),expected);
 assert.equal(context.userSentence,original,'source is never rewritten');
 assert.equal(requested,'necesito ir a casa para usar mi computadora para seguir desarrollando esta aplicación');
});
