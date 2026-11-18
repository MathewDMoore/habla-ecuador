const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const whole=require('../whole-document.js');
const feedback=require('../app-feedback.js');

const choices=[
  ['en-US','🇺🇸'],['en-GB','🇬🇧'],['en-CA','🇨🇦'],['en-AU','🇦🇺'],['en-NZ','🇳🇿'],['en-IE','🇮🇪']
];
function select(html,id){
  const match=html.match(new RegExp('<select\\b[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/select>'));
  assert.ok(match,'Missing '+id);
  return match[1];
}
test('both web entrypoints show all six correctly labelled English flags in translation and conversation',()=>{
  for(const file of ['index.html','translator.html']){
    const html=fs.readFileSync(file,'utf8');
    for(const id of ['source-language-select','target-language-select','conversation-english-language','conversation-spanish-language']){
      const options=select(html,id);
      for(const [locale,flag] of choices){
        const m=options.match(new RegExp('<option value="'+locale+'">([^<]+)<\\/option>'));
        assert.ok(m,file+': '+id+' missing '+locale);
        assert.ok(m[1].includes(flag),file+': '+locale+' wrong flag');
        assert.equal((options.match(new RegExp('value="'+locale+'"','g'))||[]).length,1,file+': duplicated '+locale);
      }
    }
    assert.match(html,/id="english-country-coverage"/);
    assert.match(html,/not yet validated/);
    assert.match(html,/socialworkengland.org.uk/);
    assert.ok(html.includes('app.js?v=238')&&html.includes('whole-document.js?v=236')&&html.includes('app-feedback.js?v=236'));
  }
});
test('country locale selection keeps general-English routing and distinct speech locale',()=>{
  const elements=new Map(),store=new Map();
  const select=id=>{if(!elements.has(id))elements.set(id,{value:'',textContent:'',hidden:false,dataset:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},removeAttribute(){}});return elements.get(id);};
  const ctx=vm.createContext({console,window:{},setTimeout,clearTimeout,AbortController,
    document:{body:{classList:{toggle(){}}},addEventListener(){},querySelector:select,querySelectorAll:()=>[],createElement:()=>({})},
    localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
    navigator:{onLine:true},fetch:()=>{throw Error('No external translation request expected')}});
  vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
  const run=js=>vm.runInContext(js,ctx);
  for(const [locale] of choices){
    run('sourceLanguage="es-EC"; targetLanguage='+JSON.stringify(locale)+'; syncLanguagePair();');
    assert.equal(run('translatorRoute()'),'ec-en');
    assert.equal(run('targetSpeechLocale()'),locale);
    assert.equal(JSON.parse(store.get('habla-ecuador-language-pair-v1')).target,locale);
  }
  assert.equal(run('englishBaseVariant("en-CA")'),'us');
  for(const locale of ['en-GB','en-AU','en-NZ','en-IE'])assert.equal(run('englishBaseVariant('+JSON.stringify(locale)+')'),'uk');
});
test('whole paper input and explicit feedback both preserve added country locale codes',()=>{
  for(const [locale] of choices.slice(2)){
    const job=whole.create({name:'Synthetic paper.txt',sections:['Hello world.']},
      {sourceLanguage:'es-EC',targetLanguage:locale,purpose:'academic',onDevice:false});
    assert.equal(job.targetLanguage,locale);
    const report=feedback.format({context:{sourceLocale:'es-EC',targetLocale:locale}});
    assert.ok(report.includes(locale==='en-CA'?'Canadian English':locale==='en-AU'?'Australian English':locale==='en-NZ'?'New Zealand English':'Irish English'));
  }
});
