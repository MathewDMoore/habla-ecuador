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
  const coverage={pageCount:33,ocrPages:[30,31,32,33],unreadablePages:[32]};
  const covered=whole.create({...doc,name:'PDF sample.pdf',pdfCoverage:coverage},route);
  whole.save(saved,covered);
  assert.deepEqual(whole.read(saved,covered.id).pdfCoverage,coverage,'PDF coverage survives a saved draft and backup');
  saved.removeItem(whole.PREFIX+covered.id);
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
      scrollIntoView(){},addEventListener(name,handler){this.handlers[name]=handler;},setAttribute(){},removeAttribute(){},
      classList:{toggle(){},add(){},remove(){}},replaceChildren(){this.children=[];},append(...children){this.children.push(...children);},
      click(){return this.handlers.click?.();},remove(){},
      get innerHTML(){return this.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');},
      set innerHTML(value){this.value=value;}
    });return elements.get(selector);
  }
  const context=vm.createContext({console,setTimeout,clearTimeout,AbortController,Date,Math,Blob,File,URL,
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
  let documentPickerOpened=0;
  element('#choose-document').closest=()=>element('#native-import-tools');
  element('#document-file').click=()=>{documentPickerOpened++;};
  element('#choose-research-document').handlers.click();
  assert.equal(documentPickerOpened,1,'Saved Papers opens the normal document picker for PDF or Word');
  const synthetic=Array.from({length:130},(_,i)=>`Measurement ${i}: the muscle adaptation results were assessed after four weeks. `).join('')+'\n\nThe final source paragraph.';
  await element('#document-file').handlers.change({target:{files:[{name:'Paper.txt',size:synthetic.length,text:async()=>synthetic}],value:'Paper.txt'}});
  assert.equal(run('sourceLanguage'),'en-US','import preserves English source');
  assert.equal(run('targetLanguage'),'es-EC','import preserves Ecuadorian Spanish target');
  assert.equal(fetchCalls.length,0,'import and preview never translate automatically');
  assert.ok(run('importedDocument.sections.length')>1);
  assert.equal(element('#save-document-for-later').hidden,false);
  element('#save-document-for-later').handlers.click();
  assert.equal(fetchCalls.length,0,'saving a paper does not contact the translation service');
  assert.equal(element('#save-document-for-later').hidden,true);
  const savedSource=whole.list(store)[0];
  assert.equal(whole.completed(savedSource),0);
  assert.equal(savedSource.parts.map(part=>part.source).join(''),synthetic);
  element('#save-document-for-later').handlers.click();
  assert.equal(whole.list(store).length,1,'saving the same paper again keeps one record');
  run('closeImportedDocument()');
  element('#whole-document-saved').value=savedSource.id;
  element('#open-document-progress').handlers.click();
  assert.equal(fetchCalls.length,0,'reopening saved source is entirely local');
  assert.equal(element('#translate-entire-document').textContent,'Translate entire document');
  await element('#translate-entire-document').handlers.click();
  assert.match(element('#whole-document-status').textContent,/allowance|quota/);
  assert.equal(element('#print-document').disabled,true,'partial output cannot be printed as a complete paper');
  assert.equal(element('#share-document').disabled,true,'partial output cannot be shared as a finished paper');
  const savedJobs=whole.list(store);assert.equal(savedJobs.length,1);
  assert.equal(savedJobs[0].stopReason,'quota','the real provider pause survives reload');
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
  const sent=[];
  let finishShare;
  context.navigator.canShare=({files})=>files.length===1&&files[0].type==='text/plain';
  context.navigator.share=payload=>{sent.push(payload);return new Promise(resolve=>{finishShare=resolve;});};
  const sharing=element('#share-document').handlers.click();
  assert.equal(context.window.HablaWholeDocument.isSharing(),true);
  await element('#share-document').handlers.click();
  assert.equal(sent.length,1,'rapid taps open the system share sheet once');
  assert.equal(sent[0].files[0].name,'Paper-es-EC.txt');
  assert.equal(await sent[0].files[0].text(),'Paper.txt\n\n'+element('#document-full-draft').value+'\n');
  assert.ok(!Object.hasOwn(sent[0],'text'),'share only the edited translation as an attachment');
  finishShare();
  await sharing;
  assert.equal(context.window.HablaWholeDocument.isSharing(),false);
  assert.match(element('#whole-document-status').textContent,/handed to your sharing app/);
  context.navigator.share=async()=>{throw {name:'AbortError'};};
  await element('#share-document').handlers.click();
  assert.equal(element('#whole-document-status').textContent,'Sharing cancelled.');
  const downloads=[];
  context.navigator.canShare=()=>false;
  context.URL=class extends URL{static createObjectURL(blob){downloads.push(blob);return 'blob:test';}static revokeObjectURL(){}};
  const wait=context.setTimeout;
  context.setTimeout=()=>0;
  await element('#share-document').handlers.click();
  context.setTimeout=wait;
  assert.equal(await downloads[0].text(),'Paper.txt\n\n'+element('#document-full-draft').value+'\n');
  assert.match(element('#whole-document-status').textContent,/downloaded as a text file/);
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

  // Reproduce a document reopened with four of fifteen sections translated.
  const localRequests=[];
  let ready=false, finishPreparation;
  context.HablaOffline={shouldUse:()=>false,canPrepare:()=>true,get ready(){return ready;},
    prepare:()=>new Promise(resolve=>{finishPreparation=resolve;}),
    translate:async(text,way)=>{localRequests.push({text,way});return 'On-device draft: '+text;}};
  run('bindWholeDocumentTools()');
  const longDoc={name:'Fifteen sections.pdf',sections:Array.from({length:15},(_,index)=>'Section '+(index+1)+'. This section has enough source text to resume.')};
  const existing=whole.create(longDoc,route);
  for(let i=0;i<4;i++)existing.parts[i].translation='Preserved online section '+(i+1);
  existing.stopReason='quota';
  whole.save(store,existing);
  element('#whole-document-saved').value=existing.id;
  element('#open-document-progress').handlers.click();
  assert.match(element('#whole-document-status').textContent,/4 of 15 sections translated.*daily allowance/);
  assert.equal(element('#document-full-draft-label').textContent,'Partial translation preview');
  assert.equal(element('#share-document').disabled,true);
  assert.equal(element('#finish-document-on-device').textContent,'Download pack & finish on device');
  const attempt=element('#finish-document-on-device').handlers.click();
  assert.equal(element('#translate-entire-document').disabled,true);
  finishPreparation(false);
  await attempt;
  assert.equal(whole.read(store,existing.id).onDevice,false,'a failed pack preparation keeps the original job');
  assert.match(element('#document-device-status').textContent,/progress is saved/);
  const unfinished=element('#finish-document-on-device').handlers.click();
  run('closeImportedDocument()');
  finishPreparation(true);
  await unfinished;
  assert.equal(localRequests.length,0,'closing while the pack prepares does not start translation');
  element('#whole-document-saved').value=existing.id;
  element('#open-document-progress').handlers.click();
  const finishing=element('#finish-document-on-device').handlers.click();
  ready=true;
  finishPreparation(true);
  await finishing;
  const finished=whole.read(store,existing.id);
  assert.equal(finished.deviceContinuation,true);
  assert.equal(finished.stopReason,undefined);
  assert.equal(whole.completed(finished),15);
  assert.deepEqual(finished.parts.slice(0,4).map(part=>part.translation),existing.parts.slice(0,4).map(part=>part.translation));
  assert.equal(localRequests.length,11,'only the remaining eleven sections go to the local engine');
  assert.ok(localRequests.every(request=>request.way==='en-ec'));
  assert.equal(fetchCalls.length,count,'finishing on the device never calls the online provider');
  assert.equal(context.HablaOffline.shouldUse(),false,'the rest of the app keeps its existing mode');
  assert.equal(element('#document-full-draft-label').textContent,'Complete translation draft');
  assert.equal(element('#share-document').disabled,false);

  // Pasting a paper promotes the exact source into the document queue rather
  // than sending a too-long text-box request or requiring a Word/PDF file.
  run('closeImportedDocument();sourceLanguage="en-US";targetLanguage="es-AR";syncLanguagePair({persist:false});setTranslationPurpose("academic",false);');
  run('requestGeneralTranslation = async text => "Traducido: " + text;');
  const pastedPaper=Array.from({length:190},(_,i)=>'Research paragraph '+i+': exercise adaptation after four weeks.').join('\n\n');
  const totalBeforePasting=whole.list(store).length;
  element('#translator-input').value=pastedPaper;
  await element('#translate-pasted-paper').handlers.click();
  assert.equal(run('importedDocument.sections.join("")'),pastedPaper,'pasting keeps every original character and paragraph delimiter');
  assert.equal(run('importedDocument.name').startsWith('Pasted research - '),true);
  assert.ok(run('importedDocument.sections.length')>1,'long pasted papers are split into resumable sections');
  assert.equal(whole.list(store).length,totalBeforePasting+1,'the pasted research becomes a saved paper');
  assert.equal(whole.completed(whole.list(store)[0]),run('importedDocument.sections.length'),'a pasted paper uses the complete translation queue');
  assert.equal(fetchCalls.length,count,'pasted-paper queue uses the selected translation adapter, not an unrequested provider call');
  run('closeImportedDocument();sourceLanguage="en-US";targetLanguage="en-GB";syncLanguagePair({persist:false});setTranslationPurpose("academic",false);');
  element('#translator-input').value='The text remains intact if the document route is unsupported.';
  await element('#translate-pasted-paper').handlers.click();
  assert.match(element('#pasted-paper-status').textContent,/Choose English/,'unsupported same-language whole-paper route is explained');
  assert.equal(element('#translator-input').value,'The text remains intact if the document route is unsupported.');
  assert.equal(run('documentImportActive'),false,'invalid paste never opens a document');
  // Both app entry points load the new module before app.js and keep unique controls.
  for(const name of ['index.html','translator.html']){
    const source=fs.readFileSync(name,'utf8');
    const wholeScript=source.match(/whole-document\.js\?v=\d+/)?.[0];
    const appScript=source.match(/app\.js\?v=\d+/)?.[0];
    assert.ok(wholeScript && appScript && source.indexOf(wholeScript)<source.indexOf(appScript));
    assert.equal((source.match(/id="translate-entire-document"/g)||[]).length,1);
    assert.equal((source.match(/id="translate-pasted-paper"/g)||[]).length,1,"research paste control exists once per entry point");
    assert.equal((source.match(/id="research-document-workspace"/g)||[]).length,1);
    assert.ok(source.indexOf('id="research-document-workspace"')<source.indexOf('id="shared-translation-workspace"'),'paper entry remains above the text editors');
    assert.ok(source.indexOf('id="whole-document-tools"')<source.indexOf('class="music-capture document-tools"'),'whole-document controls stay ahead of music settings');
    assert.equal((source.match(/id="whole-document-print"/g)||[]).length,1);
    const wholePanel=source.match(/<section id="whole-document-tools"[\s\S]*?<\/section>/)[0];
    assert.ok(!wholePanel.includes('id="import-document-progress"'),'backup recovery remains outside the hidden active-document panel');
    assert.ok(!source.includes('the whole document is not translated at once'));
  }
  const cacheVersion=fs.readFileSync('sw.js','utf8').match(/habla-ecuador-v(\d+)/)[1];
  assert.ok(fs.readFileSync('sw.js','utf8').includes(`whole-document.js?v=${cacheVersion}`));
  assert.ok(fs.readFileSync('app.js','utf8').includes(`register("sw.js?v=${cacheVersion}"`));
  console.log('Whole-document checks passed: sequential processing, pause/resume, reload persistence, segment retries, complete-only export, multiple papers, language preservation, edits, privacy, storage errors and safe printable output.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
