const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8'),context={URL,Set};
vm.createContext(context);vm.runInContext(source.slice(source.indexOf('const PUBLIC_APP_URL ='),source.indexOf('function bindAppSharing()')),context);
const home='https://mathewdmoore.github.io/habla-ecuador/index.html?ui=es';
assert.equal(context.publicAppShareUrl(),home);
for(const region of ['monterrey','es-VE']){
 const url=new URL(context.publicAppShareUrl(region));
 assert.equal(url.origin,'https://mathewdmoore.github.io');assert.equal(url.pathname,'/habla-ecuador/index.html');
 assert.equal(url.searchParams.get('start'),'dictionary');assert.equal(url.searchParams.get('region'),region);
 assert.equal(context.sharedAppRegion(url.searchParams),region);
 assert.deepEqual([...url.searchParams.keys()],['start','region','ui']);
}
for(const invalid of ['es-MX','https://example.com/?private=1','javascript:alert(1)','monterrey&text=private'])assert.equal(context.publicAppShareUrl(invalid),home);
for(const query of ['region=monterrey','start=translate&region=monterrey','start=dictionary&region=unknown','start=dictionary&region=https://example.com'])assert.equal(context.sharedAppRegion(new URLSearchParams(query)),null);
console.log('App sharing: canonical public URL, allowed regional invitations and invalid-route rejection passed');

const caracas=new URL(context.publicAppShareUrl('caracas'));
assert.equal(caracas.searchParams.get('region'),'es-VE');assert.equal(caracas.searchParams.get('city'),'caracas');
assert.equal(context.sharedAppRegion(caracas.searchParams),'es-VE','Caracas invitation uses existing Venezuelan country evidence');
assert.equal(context.sharedAppRegion(new URLSearchParams('start=dictionary&region=caracas')),null,'unsupported city is never passed to the dictionary filter');

assert.equal(new URL(context.publicAppShareUrl('monterrey','en')).searchParams.get('ui'),'en');
assert.equal(new URL(context.publicAppShareUrl('','javascript:bad')).searchParams.get('ui'),'es');
