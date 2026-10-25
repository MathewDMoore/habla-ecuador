const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const whole=require('../whole-document.js');
function storage(){
  const values=new Map();return {get length(){return values.size;},key:i=>[...values.keys()][i]??null,
    getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
}
const route={sourceLanguage:'en-US',targetLanguage:'es-EC',purpose:'academic',onDevice:false};
const doc={name:'Synthetic research paper.txt',sections:['First paragraph.','\n\nSecond paragraph.','\n\nThird paragraph.']};
async function main(){
  const saved=storage();let calls=[];
  const job=whole.create(doc,route);
  const runner=new whole.Runner({storage:saved,translate:async(text,options)=>{
    calls.push(text);assert.equal(options.sourceLanguage,'en-US');assert.equal(options.targetLanguage,'es-EC');
    return 'ES: '+text;
  }});
  await runner.run(job);
  assert.equal(whole.completed(job),3);assert.equal(job.status,'complete');assert.equal(calls.length,3);
  assert.equal(whole.compose(job),'ES: First paragraph.\n\nES: Second paragraph.\n\nES: Third paragraph.');
  await runner.run(job);assert.equal(calls.length,3,'completed sections are not requested again');
  assert.equal(whole.list(saved).length,1);
  assert.equal(whole.read(saved,job.id).status,'paused','reopening never starts a queue');
  const other=whole.create({name:'Other paper.txt',sections:['Different paper.']},route);
  whole.save(saved,other);assert.equal(whole.list(saved).length,2,'a new paper preserves earlier documents');
  assert.equal(whole.matches(job,doc,{...route,targetLanguage:'es-BO'}),false);
  assert.equal(whole.matches(job,doc,{...route,onDevice:true}),false);
  assert.equal(whole.matches(job,{...doc,sections:['Edited',...doc.sections.slice(1)]},route),false);
  const incomplete=whole.create(doc,route);
  assert.throws(()=>whole.compose(incomplete),/incomplete/,'an incomplete job cannot be exported as complete');
  const pauseStore=storage();let pauseRunner;
  pauseRunner=new whole.Runner({storage:pauseStore,translate:async text=>'Traducido: '+text,
    onSection:index=>{if(index===0)pauseRunner.pause();}});
  await pauseRunner.run(incomplete);
  assert.equal(whole.completed(incomplete),1);assert.equal(incomplete.status,'paused');
  const resumed=whole.read(pauseStore,incomplete.id);let resumedCalls=0;
  const freshRunner=new whole.Runner({storage:pauseStore,translate:async text=>{resumedCalls++;return 'Traducido: '+text;}});
  await freshRunner.run(resumed);assert.equal(resumedCalls,2,'reload resume skips completed sections');
  const slow=whole.create(doc,route);let finish;
  const slowRunner=new whole.Runner({storage:storage(),translate:()=>new Promise(resolve=>finish=resolve)});
  const pending=slowRunner.run(slow);await slowRunner.run(slow);
  slowRunner.pause();finish('Late translation');await pending;
  assert.equal(whole.completed(slow),0,'a response arriving after Pause cannot overwrite progress');
  const blocked=whole.create(doc,route);let forbidden=0;
  const blockedRunner=new whole.Runner({storage:{setItem(){throw new Error('quota');}},translate:async()=>{forbidden++;return 'x';}});
  await blockedRunner.run(blocked);assert.equal(forbidden,0,'storage failures stop before spending provider quota');
  assert.match(blockedRunner.message,/could not be saved/);
  const bad=whole.create(doc,route);bad.parts[0].source='x'.repeat(200001);
  assert.throws(()=>whole.validate(bad),/section/);
  job.editedText='Mi texto editado: niño, mañana, músculo y VO₂máx.';whole.save(saved,job);
  assert.equal(whole.compose(whole.read(saved,job.id)),job.editedText,'whole-paper edits survive reload');
  const evil=whole.create({name:'<img src=x onerror=alert(1)>',sections:['Unsafe source.']},route);
  evil.parts[0].translation='<script>alert(1)</script>\n\nMañana.';
  const html=whole.printable(evil,'Ecuadorian Spanish');
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;img'));
  const whitespace=whole.create({name:'Whitespace.txt',sections:['One','\n\n','Two']},route);
  await new whole.Runner({storage:storage(),translate:async text=>text}).run(whitespace);
  assert.equal(whole.compose(whitespace),'One\n\nTwo');

  // Exercise the real app importer, chunker, provider error path, resume UI and export.
  const elements=new Map(),store=storage();let fetchCalls=[],failAt=3,printCalls=0;
  function element(selector=''){
    if(!elements.has(selector))elements.set(selector,{value:'',textContent:'',hidden:false,disabled:false,dataset:{},children:[],handlers:{},readOnly:false,
      addEventListener(name,handler){this.handlers[name]=handler;},setAttribute(){},removeAttribute(){},
      classList:{toggle(){},add(){},remove(){}},replaceChildren(){this.children=[];},append(...children){this.children.push(...children);},
      click(){return this.handlers.click?.();},remove(){},
      get innerHTML(){return this.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');},
      set innerHTML(value){this.value=value;}
    });return elements.get(selector);
  }
  const context=vm.createContext({console,setTimeout,clearTimeout,AbortController,Date,Math,Blob,URL,
    localStorage:store,navigator:{onLine:true},
    document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){},createElement:()=>element('created-'+Math.random()),
      body:{append(){},classList:{toggle(){},add(){},remove(){}}}},
    window:{addEventListener(){},print(){printCalls++;}},
    fetch:async url=>{
      const text=new URL(url).searchParams.get('q');fetchCalls.push(text);
      if(fetchCalls.length===failAt)return {ok:true,status:200,json:async()=>({responseStatus:403,quotaFinished:true,responseDetails:'daily quota exceeded'})};
      return {ok:true,status:200,json:async()=>({responseStatus:200,responseData:{translatedText:'Traducción: '+text}})};
    }
  });
  for(const file of ['document-import.js','whole-document.js','research-reference.js','spanish-context.js','english-varieties.js']){
    vm.runInContext(fs.readFileSync(file,'utf8'),context);
    const names={'document-import.js':'HablaDocument','whole-document.js':'HablaWholeDocument','research-reference.js':'HablaResearchReference','spanish-context.js':'HablaSpanishContext','english-varieties.js':'HablaEnglish'};
    if(context.window[names[file]])context[names[file]]=context.window[names[file]];
  }
  vm.runInContext(fs.readFileSync('app.js','utf8'),context);
  const run=code=>vm.runInContext(code,context);
  run('bindDocumentTools(); bindWholeDocumentTools(); sourceLanguage="en-US";targetLanguage="es-EC";syncLanguagePair({persist:false});');
  const synthetic=Array.from({length:130},(_,i)=>`Measurement ${i}: the muscle adaptation results were assessed after four weeks. `).join('')+'\n\nThe final source paragraph.';
  await element('#document-file').handlers.change({target:{files:[{name:'Paper.txt',size:synthetic.length,text:async()=>synthetic}],value:'Paper.txt'}});
  assert.equal(run('sourceLanguage'),'en-US','import preserves English source');
  assert.equal(run('targetLanguage'),'es-EC','import preserves Ecuadorian Spanish target');
  assert.equal(fetchCalls.length,0,'import and preview never translate automatically');
  assert.ok(run('importedDocument.sections.length')>1);
  await element('#translate-entire-document').handlers.click();
  assert.match(element('#whole-document-status').textContent,/allowance|quota/);
  assert.equal(element('#print-document').disabled,true,'partial output cannot be printed as a complete paper');
  const savedJobs=whole.list(store);assert.equal(savedJobs.length,1);
  assert.ok(savedJobs[0].parts[0].chunks.length===2,'each completed provider chunk was saved before the quota error');
  const already=fetchCalls.slice(0,2);failAt=-1;
  run('translationChunkCache.clear()'); // Simulate losing all in-memory service cache.
  await element('#translate-entire-document').handlers.click();
  assert.equal(element('#print-document').disabled,false);
  assert.equal(fetchCalls.filter(text=>text===already[0]).length,1,'durable chunk cache skips provider calls after retry');
  assert.equal(fetchCalls.filter(text=>text===already[1]).length,1);
  const combined=element('#document-full-draft').value;
  assert.ok(combined.endsWith('The final source paragraph.'));
  assert.ok(combined.includes('\n\n'),'paragraph boundaries survive assembly');
  assert.equal(run('wholeDocumentTools.runner.job.parts.length'),run('importedDocument.sections.length'));
  element('#document-full-draft').value='Texto revisado íntegro: músculo, mañana y fuerza.';
  element('#document-full-draft').handlers.input({target:element('#document-full-draft')});
  assert.equal(whole.compose(whole.list(store)[0]),element('#document-full-draft').value);
  element('#print-document').handlers.click();assert.equal(printCalls,1);
  assert.ok(element('#whole-document-print').children.some(item=>item.textContent==='Texto revisado íntegro: músculo, mañana y fuerza.'));
  const count=fetchCalls.length;run('closeImportedDocument()');
  assert.equal(whole.list(store).length,1,'closing preserves progress');
  element('#whole-document-saved').value=savedJobs[0].id;
  element('#open-document-progress').handlers.click();
  assert.equal(fetchCalls.length,count,'opening saved progress is entirely local');
  assert.equal(element('#document-full-draft').value,'Texto revisado íntegro: músculo, mañana y fuerza.');
  run('wholeDocumentTools.recordSection(0,importedDocument.sections[0].trim(),"Otra edición de sección.")');
  assert.equal(element('#document-full-draft').value,'Texto revisado íntegro: músculo, mañana y fuerza.','section changes do not erase whole-document edits');
  assert.match(element('#whole-document-status').textContent,/kept separately/);
  run('translationEdits[translationEditKey(importedDocument.sections[0].trim())]={text:"Obsolete unrelated edit"}');
  element('#open-document-progress').handlers.click();
  assert.equal(element('#natural-result').textContent,'Otra edición de sección.','saved document wording wins over an older standalone edit');
  const offlineJob=whole.create({name:'On-device progress.txt',sections:['Local source.']},{...route,onDevice:true});
  whole.save(store,offlineJob);
  element('#whole-document-saved').value=offlineJob.id;
  element('#open-document-progress').handlers.click();
  assert.equal(element('#translate-entire-document').disabled,true,'restoring local progress cannot silently switch to the online service');
  assert.match(element('#whole-document-status').textContent,/same mode/);
  context.HablaOffline={shouldUse:()=>true};run('wholeDocumentTools.refresh()');
  assert.equal(element('#translate-entire-document').disabled,false,'matching the saved engine allows an explicit resume');
  let finishBackup;
  const backupTarget={files:[{size:100,text:()=>new Promise(resolve=>finishBackup=resolve)}],value:'backup.json'};
  const slowBackup=element('#document-progress-file').handlers.change({target:backupTarget});
  run('closeImportedDocument()');
  finishBackup(JSON.stringify(offlineJob));await slowBackup;
  assert.equal(whole.list(store).length,2,'a slow backup read cannot replace a document closed in the meantime');
  await element('#document-progress-file').handlers.change({target:{files:[{size:100,text:async()=>JSON.stringify(offlineJob)}],value:'backup.json'}});
  assert.equal(whole.list(store).length,3,'a progress backup restores as a separate copy after closing the source');
  assert.equal(run('importedDocument.name'),offlineJob.name);
  assert.equal(fetchCalls.length,count,'reopening and importing backups never sends text to a translation service');
  // Both app entry points load the new module before app.js and keep unique controls.
  for(const name of ['index.html','translator.html']){
    const source=fs.readFileSync(name,'utf8');
    const wholeScript=source.match(/whole-document\.js\?v=\d+/)?.[0];
    const appScript=source.match(/app\.js\?v=\d+/)?.[0];
    assert.ok(wholeScript && appScript && source.indexOf(wholeScript)<source.indexOf(appScript));
    assert.equal((source.match(/id="translate-entire-document"/g)||[]).length,1);
    assert.equal((source.match(/id="whole-document-print"/g)||[]).length,1);
    assert.ok(source.indexOf('id="import-document-progress"')<source.indexOf('id="whole-document-tools"'),'backup recovery remains outside the hidden active-document panel');
    assert.ok(!source.includes('the whole document is not translated at once'));
  }
  const cacheVersion=fs.readFileSync('sw.js','utf8').match(/habla-ecuador-v(\d+)/)[1];
  assert.ok(fs.readFileSync('sw.js','utf8').includes(`whole-document.js?v=${cacheVersion}`));
  assert.ok(fs.readFileSync('app.js','utf8').includes(`register("sw.js?v=${cacheVersion}"`));
  console.log('Whole-document checks passed: sequential processing, pause/resume, reload persistence, segment retries, complete-only export, multiple papers, language preservation, edits, privacy, storage errors and safe printable output.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
