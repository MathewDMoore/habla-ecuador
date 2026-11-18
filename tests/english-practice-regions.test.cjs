const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const english=[
 ['en-US','🇺🇸'],['en-GB','🇬🇧'],['en-CA','🇨🇦'],['en-AU','🇦🇺'],
 ['en-NZ','🇳🇿'],['en-IE','🇮🇪'],['en-JM','🇯🇲'],['en-BS','🇧🇸'],
 ['en-BB','🇧🇧'],['en-GY','🇬🇾'],['en-TT','🇹🇹'],['en-AG','🇦🇬'],
 ['en-KN','🇰🇳'],['en-LC','🇱🇨'],['en-VC','🇻🇨'],['en-GD','🇬🇩'],
 ['en-ZA','🇿🇦'],['en-SG','🇸🇬']
];

test('both entrypoints offer all 18 English Practice country choices with correct flags and honest status',()=>{
  for(const page of ['index.html','translator.html']){
    const html=fs.readFileSync(page,'utf8');
    const picker=html.match(/<select id="lesson-language">([\s\S]*?)<\/select>/);
    assert.ok(picker,page+' missing Practice picker');
    for(const [code,flag] of english){
      const matches=[...picker[1].matchAll(new RegExp('<option value="'+code+'">([^<]+)<\\/option>','g'))];
      assert.equal(matches.length,1,page+' needs one '+code);
      assert.ok(matches[0][1].includes(flag),page+' flag mismatch '+code);
    }
    assert.equal([...picker[1].matchAll(/<option value="en-[A-Z]{2}">/g)].length,18,page+' English option count');
    assert.match(picker[1],/General English lesson pilots/);
    assert.match(picker[1],/Regional research previews/);
    assert.match(html,/id="lesson-region-coverage-note"|class="lesson-region-coverage-note"/);
    assert.match(html,/recorded-practice\.js\?v=238/);
    assert.match(html,/quick-lessons\.js\?v=238/);
    assert.match(html,/app\.js\?v=238/);
  }
});

test('shared English lesson catalog supports every selected country but does not claim national phrases',()=>{
  const short=fs.readFileSync('quick-lessons.js','utf8');
  const recorded=fs.readFileSync('recorded-practice.js','utf8');
  for(const [locale] of english){
    assert.ok(short.includes("'"+locale+"':english"),'short lessons missing '+locale);
    assert.ok(recorded.includes("'"+locale+"':originalEnglishLessons"),'recorded lessons missing '+locale);
  }
  assert.match(recorded,/General English lessons shared across countries/);
});

test('app keeps country preference and blocks misleading local accent substitutions',()=>{
  const app=fs.readFileSync('app.js','utf8');
  const elements=new Map(), store=new Map();
  const select=id=>{
    if(!elements.has(id))elements.set(id,{value:'',textContent:'',hidden:false,dataset:{},
      classList:{toggle(){},add(){},remove(){}},setAttribute(){},removeAttribute(){}});
    return elements.get(id);
  };
  const ctx=vm.createContext({console,window:{},setTimeout,clearTimeout,AbortController,
    document:{body:{classList:{toggle(){}}},addEventListener(){},querySelector:select,querySelectorAll:()=>[],createElement:()=>({})},
    localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
    navigator:{onLine:true},fetch:()=>{throw Error('Unexpected network request')}});
  vm.runInContext(app,ctx);
  for(const [locale] of english){
    assert.equal(vm.runInContext('lessonTargetLocale('+JSON.stringify(locale)+')',ctx),locale);
  }
  assert.match(app,/ENGLISH_PRACTICE_PREVIEW\.has\(passage\.lang\)/);
  assert.match(app,/No matching regional voice is available on this device/);
  assert.match(app,/Region-specific vocabulary, pronunciation and lesson audio are not yet validated|Region-specific|Region-specific/);
  assert.match(app,/General English lessons only/);
});

test('release, cached module versions, and original speaking engine are retained',()=>{
  const app=fs.readFileSync('app.js','utf8');
  const sw=fs.readFileSync('sw.js','utf8');
  const release=JSON.parse(fs.readFileSync('app-version.json','utf8'));
  assert.equal(release.build,238);
  assert.equal(release.version,'0.27.28');
  assert.match(sw,/habla-ecuador-v238/);
  for(const entry of ['app.js','quick-lessons.js','recorded-practice.js'])
    assert.ok(sw.includes('"'+entry+'?v=238"'),entry+' not in offline shell');
  assert.match(app,/const ENGLISH_PRACTICE_LOCALES/);
});
