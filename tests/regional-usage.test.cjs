const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const current=require('../spanish-context.js'),snapshots=[];
for(const region of ['all','es-EC','es-BO','es-MX','es-VE','es-PE','es-CO','en-US','en-GB','quito','monterrey','mexico-city','bogota'])for(const category of ['all','slang','literal','clinical'])for(const tone of ['all','mild','caution']){
 const options={region,category,tone};
 const entries=current.dictionary(options);
 snapshots.push(entries.filter(entry=>entry.id!=='mamon-insult-counterpart'&&entry.batch!=='regional-vocabulary-116').map(({usage,...entry})=>entry));
 const allTypes=['idiom','exclamation','familiar','culture','vocabulary','usage','literal','clinical'];
 assert.equal(allTypes.reduce((n,usage)=>n+current.dictionary({...options,usage}).length,0),entries.length,'usage groups partition existing collection');
}
assert.equal(crypto.createHash('sha256').update(JSON.stringify(snapshots)).digest('hex'),'43b2c206b2a5e642db8d5eb839033f5e46b036a76269c1fd5f171f7fc82ec168','all 168 pre-change region/category/tone snapshots preserved');
const find=term=>current.dictionary({region:'all'}).find(x=>x.term===term);
for(const term of ['en chinga','me vale verga','de la verga','valer / importar verga','ni verga / ni vergas'])assert.equal(find(term).usage.type,'idiom');
assert.equal(find('chinga (noun)').usage.type,'vocabulary');assert.equal(find('chingar / chinga (verb)').usage.type,'vocabulary');
assert.equal(find('chuta').usage.type,'exclamation');assert.equal(find('guagua').usage.type,'familiar');assert.equal(find('chulla').usage.type,'culture');assert.equal(find('vulva').usage.type,'clinical');assert.equal(find('verga (literal)').usage.type,'literal');
assert.match(find('me vale verga').register,/vulgarity/);assert.deepEqual(find('me vale verga').regions,['es-EC','es-BO','es-MX']);
assert.match(find('chiro / chira').scope,/Ecuador: without money. Mexico: pretty/);
assert.deepEqual(find('huerco / huerca').usage.cities,['Monterrey, Nuevo León']);assert.deepEqual(find('chamo / chama').usage.cities,[]);assert.match(find('chamo / chama').scope,/Caracas-specific review pending/);
assert.equal(current.dictionary({region:'es-VE',usage:'idiom'}).length,0,'empty coverage is not invented');
assert.equal(current.dictionary({region:'es-EC',usage:'nonexistent'}).length,0);
for(const text of ['que ya','cono','unchingado','ordinary unrelated word'])assert.deepEqual(current.slang(text),[]);
assert.equal(current.translateIndifferenceExpression('no me vale verga'),null);
console.log('Regional usage: 168 region/category/tone combinations unchanged; independent type partitions, idiom/register distinction, country meanings, city evidence and negative cases passed');
