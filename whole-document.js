/* Private, resumable document drafts. Import and restore never start translation. */
(function (root) {
  'use strict';
  const SCHEMA = 'habla-ecuador.whole-document.v1';
  const PREFIX = 'habla-ecuador-whole-document-v1:';
  const LANGUAGES = ['en-US','en-GB','es-EC','es-BO','es-MX','es-VE','es-PE','es-CO',
    'es-CU','es-AR','es-CL','es-CR','es-DO','es-SV','es-GT','es-HN','es-NI',
    'es-PA','es-PY','es-PR','es-ES','es-UY','es-GQ'];
  const MAX_TEXT = 200000;
  const MAX_DRAFT = 600000;
  const FREE_ONLINE_CHARACTERS = 5000;
  const STOP_REASONS = new Set(['paused','interrupted','quota','rate_limit','offline','offline_pack','offline_engine',
    'network','timeout','request_limit','research_limit','invalid_response','service']);
  const isText = value => typeof value === 'string';
  const fail = message => { throw new Error(message); };
  function pdfCoverage(value) {
    const count=value?.pageCount;
    if(!Number.isInteger(count)||count<1||count>100)return undefined;
    const pages=entries=>Array.isArray(entries)?[...new Set(entries.filter(page=>Number.isInteger(page)&&page>=1&&page<=count))]:[];
    return {pageCount:count,ocrPages:pages(value.ocrPages),unreadablePages:pages(value.unreadablePages)};
  }
  function coverageMessage(coverage,name) {
    if(!coverage)return /\.pdf$/i.test(name||'')?'For PDFs saved before scan checking, reopen the original PDF to include scanned pages.':'';
    const {pageCount,ocrPages,unreadablePages}=coverage;
    const message=[`PDF pages checked: ${pageCount}.`];
    if(ocrPages.length)message.push(`Text recognized from scans on pages: ${ocrPages.join(', ')}.`);
    if(unreadablePages.length)message.push(`Review these PDF pages for missing or unclear text: ${unreadablePages.join(', ')}.`);
    return message.map(text=>root.HablaUI?.t(text)||text).join(' ');
  }
  function validate(data) {
    if (!data || data.schema !== SCHEMA || !/^[a-z0-9-]{1,100}$/.test(data.id || '')) fail('Choose a Habla document-progress backup.');
    if (!isText(data.name) || !data.name.trim() || data.name.length > 240) fail('The document needs a name of up to 240 characters.');
    if (!LANGUAGES.includes(data.sourceLanguage) || !LANGUAGES.includes(data.targetLanguage)
      || data.sourceLanguage.slice(0,2) === data.targetLanguage.slice(0,2)) fail('Choose English → Spanish or Spanish → English for this document.');
    if (!['academic','everyday'].includes(data.purpose) || typeof data.onDevice !== 'boolean') fail('This document has an invalid translation setting.');
    if (!Array.isArray(data.parts) || !data.parts.length || data.parts.length > MAX_TEXT) fail('The document contains no sections.');
    let length = 0, draftLength = 0;
    const parts = data.parts.map(part => {
      if (!part || !isText(part.source) || !part.source.length || part.source.length > 8000) fail('A document section is invalid.');
      length += part.source.length;
      if (part.translation !== null && (!isText(part.translation) || (!part.translation.trim() && part.source.trim()))) fail('A translated section is empty.');
      const chunks = [];
      if (!Array.isArray(part.chunks) || part.chunks.length > 8000) fail('The document progress is invalid.');
      part.chunks.forEach(chunk => {
        if (!chunk || !Number.isInteger(chunk.index) || chunk.index < 0 || chunk.index > 8000
          || !isText(chunk.source) || chunk.source.length > 8000 || !isText(chunk.text) || !chunk.text.trim() || chunk.text.length > MAX_DRAFT) fail('A saved translation segment is invalid.');
        draftLength += chunk.text.length;
        chunks.push({index:chunk.index,source:chunk.source,text:chunk.text});
      });
      draftLength += part.translation?.length || 0;
      return {source:part.source,translation:part.translation,chunks};
    });
    if (length > MAX_TEXT || draftLength > MAX_DRAFT * 2) fail('This document exceeds the saved-progress limit.');
    if (data.editedText !== null && (!isText(data.editedText) || !data.editedText.trim() || data.editedText.length > MAX_DRAFT)) fail('The complete edited draft is invalid.');
    return {schema:SCHEMA,id:data.id,name:data.name,sourceLanguage:data.sourceLanguage,targetLanguage:data.targetLanguage,
      purpose:data.purpose,onDevice:data.onDevice,parts,editedText:data.editedText,
      updatedAt:isText(data.updatedAt) ? data.updatedAt : '',status:'paused',
      ...(data.pdfCoverage ? {pdfCoverage:pdfCoverage(data.pdfCoverage)} : {}),
      ...(data.onDevice&&data.deviceContinuation===true ? {deviceContinuation:true} : {}),
      ...(STOP_REASONS.has(data.stopReason) ? {stopReason:data.stopReason} : {})};
  }
  function create(document, route) {
    const job = {schema:SCHEMA,id:`doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`,
      name:document.name,pdfCoverage:document.pdfCoverage,sourceLanguage:route.sourceLanguage,targetLanguage:route.targetLanguage,
      purpose:route.purpose,onDevice:route.onDevice,
      parts:document.sections.map(source => ({source,translation:null,chunks:[]})),editedText:null,updatedAt:'',status:'paused'};
    return validate(job);
  }
  function matches(job, document, route) {
    return job.name === document.name && job.sourceLanguage === route.sourceLanguage && job.targetLanguage === route.targetLanguage
      && job.purpose === route.purpose && job.onDevice === route.onDevice
      && job.parts.length === document.sections.length && job.parts.every((part,i) => part.source === document.sections[i]);
  }
  function read(storage, id) {
    try { const raw=storage.getItem(PREFIX+id); return raw ? validate(JSON.parse(raw)) : null; }
    catch { return null; }
  }
  function list(storage) {
    const jobs=[];
    try {
      for (let i=0;i<storage.length;i++) {
        const key=storage.key(i);
        if (key?.startsWith(PREFIX)) { const job=read(storage,key.slice(PREFIX.length)); if(job) jobs.push(job); }
      }
    } catch {}
    return jobs.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  }
  function save(storage, job) {
    job.updatedAt=new Date().toISOString();
    const clean=validate(job);
    try { storage.setItem(PREFIX+job.id,JSON.stringify(clean)); }
    catch { fail('Progress could not be saved on this device. Translation paused. Download a progress backup before leaving.'); }
  }
  const completed = job => job.parts.filter(part=>part.translation !== null).length;
  const complete = job => completed(job) === job.parts.length;
  function compose(job) {
    if (!complete(job)) fail('The document is still incomplete. Resume translation before exporting the complete draft.');
    if(job.editedText !== null) return job.editedText;
    // Preserve the original section delimiters, including adjacent paragraph breaks.
    return job.parts.map(part => {
      const leading=part.source.match(/^\s*/u)[0], trailing=part.source.match(/\s*$/u)[0];
      return part.source.trim() ? leading+part.translation.trim()+trailing : part.source;
    }).join('');
  }
  class Runner {
    constructor({storage,translate,onChange=()=>{},onSection=()=>{}}) {
      this.storage=storage;this.translate=translate;this.onChange=onChange;this.onSection=onSection;
      this.job=null;this.busy=false;this.generation=0;this.message='';
    }
    persist() { save(this.storage,this.job); }
    notify() { this.onChange(this); }
    pause(message='Paused. Completed sections and segments are saved; tap Resume entire document to continue.') {
      if (!this.busy) return;
      this.generation++;this.message=message;
      if(this.job){
        this.job.status='paused';this.job.stopReason='paused';
        try {this.persist();} catch {}
      }
      this.notify();
    }
    async run(job, isCurrent=()=>true) {
      if(this.busy)return;
      this.job=job;this.busy=true;this.error=null;const generation=++this.generation;
      const current=()=>generation===this.generation && isCurrent();
      this.message='';job.status='running';job.stopReason='interrupted';this.notify();
      try {
        this.persist(); // Do not spend service quota if durable progress cannot be saved.
        for (let i=0;i<job.parts.length;i++) {
          if(!current())break;
          const part=job.parts[i];
          if(part.translation !== null)continue;
          if(!part.source.trim()) { part.translation=part.source;this.persist();continue; }
          const chunkProgress={
            read:(index,source)=>part.chunks.find(chunk=>chunk.index===index && chunk.source===source)?.text,
            write:(index,source,text)=>{
              if(!current())return;
              const old=part.chunks.find(chunk=>chunk.index===index);
              if(old){old.source=source;old.text=text;}else part.chunks.push({index,source,text});
              this.persist();this.notify();
            }
          };
          const text=await this.translate(part.source.trim(),{sourceLanguage:job.sourceLanguage,targetLanguage:job.targetLanguage,
            purpose:job.purpose,onDevice:job.onDevice,isCurrent:current,chunkProgress});
          if(!current())break;
          if(!isText(text)||!text.trim())fail('A section returned no translation. Progress is saved; retry this document.');
          part.translation=text;this.persist();this.onSection(i,part,job);this.notify();
        }
        if(complete(job)){
          job.status='complete';delete job.stopReason;this.persist();
          this.message='Complete editable translation draft. Review the wording before sharing.';
        }
        else {job.status='paused';if(!this.message)this.message='Paused because the text, languages or translation service changed. Progress is saved.';}
      } catch(error) {
        job.status='paused';
        this.message=error.code==='superseded' ? 'Paused. Progress is saved.' : error.message || 'Translation paused. Progress is saved.';
        if(error.code!=='superseded')job.stopReason=STOP_REASONS.has(error.code)?error.code:'interrupted';
        try {this.persist();} catch {}
        this.error=error;
      } finally {this.busy=false;this.notify();}
    }
  }
  const escape = text => text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function printable(job,label=job.targetLanguage) {
    const title=escape(job.name), text=escape(compose(job));
    return `<!doctype html><html lang="${job.targetLanguage}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{max-width:48rem;margin:2rem auto;padding:0 1rem;color:#161616;font:12pt/1.55 Georgia,serif}h1{font-size:20pt;line-height:1.25}main{white-space:pre-wrap;overflow-wrap:anywhere;orphans:3;widows:3}@media print{body{margin:0;max-width:none}h1{break-after:avoid}}</style><h1>${title}</h1><p>${escape(label)} · editable translation draft</p><main>${text}</main></html>`;
  }
  function downloadFile(blob,filename) {
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;link.download=filename;
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function paperFilename(title,locale) {
    const name=title.replace(/\.[^.]+$/,'').replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,70)||'Document';
    return name+'-'+locale;
  }
  const sharingButtons=new Set();
  async function sharePaper({title,text,locale,button,status}) {
    if(!text?.trim()||sharingButtons.has(button))return;
    const contents=title+'\n\n'+text+'\n';
    const filename=paperFilename(title,locale)+'.txt';
    const type='text/plain';
    sharingButtons.add(button);
    button.disabled=true;
    try {
      if(typeof navigator.share==='function'&&typeof File==='function'){
        const files=[new File([contents],filename,{type})];
        try{
          if(!navigator.canShare||navigator.canShare({files})){
            await navigator.share({title,files});
            status('Translated paper handed to your sharing app.');
            return;
          }
        }catch(error){
          if(error?.name==='AbortError'){status('Sharing cancelled.');return;}
        }
      }
      downloadFile(new Blob([contents],{type}),filename);
      status('The translation was downloaded as a text file. Open it in Files to share it.');
    } finally {
      sharingButtons.delete(button);
      button.disabled=false;
    }
  }
  function bind({getDocument,getRoute,openDocument,translate,onSection,label,formatError,prepareDevice,deviceReady}) {
    const $=selector=>document.querySelector(selector);
    if(!$('#translate-entire-document'))return null;
    const saveForLater=$('#save-document-for-later');
    const share=$('#share-document'),coverage=$('#whole-document-coverage');
    const finishDevice=$('#finish-document-on-device'),deviceStatus=$('#document-device-status');
    let active=null,restoredJob=null,backupImport=0,preparing=null,deviceMessage='';
    const routeFor=job=>job?.deviceContinuation?{...getRoute(),onDevice:true}:getRoute();
    const runner=new Runner({storage:localStorage,translate,onSection,onChange:()=>render()});
    function findCurrent() {
      const doc=getDocument();
      if(!doc)return null;
      const route=getRoute();
      if(restoredJob&&matches(restoredJob,doc,{...route,onDevice:restoredJob.onDevice}))return restoredJob;
      if(active && matches(active,doc,routeFor(active)))return active;
      return list(localStorage).find(job=>matches(job,doc,routeFor(job))) || null;
    }
    function render() {
      const doc=getDocument(), jobs=list(localStorage);
      if(!runner.busy) active=findCurrent();
      const job=runner.busy?runner.job:active;
      const route=routeFor(job);
      $('#whole-document-tools').hidden=!doc&&!jobs.length&&!job;
      const select=$('#whole-document-saved'), selected=select.value;
      select.replaceChildren();
      jobs.forEach(item=>{
        const option=document.createElement('option');option.value=item.id;
        option.textContent=`${item.name} · ${label(item.targetLanguage)} · ${completed(item)}/${item.parts.length}`;
        select.append(option);
      });
      select.value=jobs.some(item=>item.id===selected)?selected:job?.id || jobs[0]?.id || '';
      $('#whole-document-history').hidden=!jobs.length;
      $('#open-document-progress').disabled=runner.busy;
      $('#import-document-progress').disabled=runner.busy;
      const done=job&&complete(job);
      const engineMismatch=job&&job.onDevice!==route.onDevice;
      const supported=route.sourceLanguage.slice(0,2)!==route.targetLanguage.slice(0,2);
      $('#translate-entire-document').disabled=runner.busy||!!preparing||!doc||!supported||!!done||!!engineMismatch;
      const started=job?.parts.some(part=>part.translation!==null||part.chunks.length);
      $('#translate-entire-document').textContent=done?'Document translated':started?'Resume entire document':'Translate entire document';
      if(saveForLater){
        saveForLater.hidden=!doc||!!job||runner.busy;
        saveForLater.disabled=!supported||!!preparing;
      }
      if(finishDevice){
        const ready=deviceReady?.();
        const large=doc?.sections.reduce((sum,text)=>sum+text.length,0)>FREE_ONLINE_CHARACTERS;
        finishDevice.hidden=!prepareDevice||!doc||!supported||!!done||runner.busy||
          !(large||started||route.onDevice||job?.stopReason)||(job?.onDevice??route.onDevice)&&ready;
        finishDevice.disabled=!!preparing;
        finishDevice.textContent=ready?'Finish on this device':'Download pack & finish on device';
        if(deviceStatus){
          deviceStatus.textContent=deviceMessage||(!finishDevice.hidden&&!ready
            ?'The offline pack is a one-time download of over 225 MB.' : '');
          deviceStatus.hidden=!doc||!deviceStatus.textContent;
        }
      }
      if(doc)$('#translate-document').disabled=runner.busy||!!preparing;
      $('#pause-entire-document').hidden=!runner.busy;
      $('#pause-entire-document').disabled=runner.busy&&runner.job.status!=='running';
      $('#document-full-draft-panel').hidden=!job;
      const draftLabel=$('#document-full-draft-label');
      if(draftLabel)draftLabel.textContent=done?'Complete translation draft':'Partial translation preview';
      $('#document-full-draft').readOnly=!done||runner.busy;
      if(job)$('#document-full-draft').lang=job.targetLanguage;
      if(job) {
        const output=done?compose(job):job.parts.filter(part=>part.translation!==null).map(part=>part.translation).join('\n\n');
        if($('#document-full-draft').value!==output)$('#document-full-draft').value=output;
      }
      const progress=job&&(started||runner.busy)?`${completed(job)} of ${job.parts.length} sections translated. `:'';
      let message=runner.job===job?runner.message:'';
      if(runner.busy&&job?.status==='running') message=job.onDevice
        ?'Translating remaining sections on this device. Keep this page open.'
        :'Translating in order. Keep this page open; Pause retains completed work.';
      if(!message&&job&&!started)message='Document saved on this device. Translate it when you are ready.';
      if(!message&&job&&!done&&job.stopReason==='quota')message='The online service reached its daily allowance. Finish on this device, or resume after the service resets.';
      if(!message&&job&&!done&&job.stopReason&&job.stopReason!=='paused'&&job.stopReason!=='interrupted')message=formatError?.({code:job.stopReason})||'Translation paused. Your progress is saved.';
      if(!message)message=done?'Complete editable translation draft.':job?'Translation is paused. The preview shows only completed sections.':doc?'Ready to translate the whole document into '+label(route.targetLanguage)+'.':'';
      if(engineMismatch&&!done)message='This progress uses '+(job.onDevice?'on-device translation':'the online service')+'. Select the same mode under Offline translation before resuming. No text has been sent in a different mode.';
      $('#whole-document-status').textContent=progress+message;
      if(coverage){
        coverage.textContent=coverageMessage(doc?.pdfCoverage||job?.pdfCoverage,doc?.name||job?.name);
        coverage.hidden=!coverage.textContent;
      }
      if(share)share.disabled=!done||runner.busy||sharingButtons.has(share);
      for(const id of ['print-document','download-document-text','download-document-html'])$('#'+id).disabled=!done||runner.busy;
      $('#backup-document-progress').disabled=!job;
    }
    function download(text,type,extension) {
      const job=runner.busy?runner.job:active;if(!job)return;
      downloadFile(new Blob([text],{type}),paperFilename(job.name,job.targetLanguage)+extension);
    }
    saveForLater?.addEventListener('click',()=>{
      const doc=getDocument();
      if(!doc||runner.busy||findCurrent())return;
      try {
        const job=create(doc,getRoute());
        save(localStorage,job);
        active=job;
        render();
      } catch(error) {
        $('#whole-document-status').textContent=error.message;
      }
    });
    async function runJob(job) {
      restoredJob=job;
      await runner.run(job,()=>{
        const now=getDocument();
        return !!now&&matches(job,now,routeFor(job));
      });
      if(runner.error?.code&&runner.error.code!=='superseded') {
        runner.message=(formatError?.(runner.error)||runner.message)+' Completed work is saved; resume after resolving this.';render();
      }
    }
    $('#translate-entire-document').addEventListener('click',async()=>{
      if(runner.busy||preparing)return;
      const doc=getDocument();if(!doc)return;
      try {
        const job=findCurrent()||create(doc,getRoute());
        if(job.onDevice!==routeFor(job).onDevice){render();return;}
        await runJob(job);
      }catch(error){$('#whole-document-status').textContent=error.message;}
    });
    finishDevice?.addEventListener('click',async()=>{
      const doc=getDocument();
      if(!doc||runner.busy||preparing||!prepareDevice)return;
      const saved=findCurrent();
      if(saved&&complete(saved))return;
      const route={...getRoute(),onDevice:true};
      const source={...doc,sections:[...doc.sections]};
      const request={};
      preparing=request;
      deviceMessage='Preparing on-device translation. Your completed sections are saved.';
      render();
      try {
        const ready=await prepareDevice();
        if(preparing!==request)return;
        if(!ready){
          deviceMessage='The offline pack is unavailable. Your progress is saved. Retry the pack or resume online.';
          return;
        }
        const now=getDocument();
        const job=saved ? {...saved,onDevice:true,deviceContinuation:true} : {...create(source,route),deviceContinuation:true};
        if(!now||!matches(job,now,{...getRoute(),onDevice:true})||(findCurrent()?.id||null)!==(saved?.id||null))return;
        save(localStorage,job);
        active=job;restoredJob=job;preparing=null;deviceMessage='';
        await runJob(job);
      }catch(error){if(preparing===request)deviceMessage=error.message;}
      finally{
        if(preparing===request){preparing=null;render();}
      }
    });
    $('#pause-entire-document').addEventListener('click',()=>runner.pause());
    $('#open-document-progress').addEventListener('click',()=>{
      if(runner.busy)return;const job=read(localStorage,$('#whole-document-saved').value);if(!job)return;
      backupImport++;active=job;restoredJob=job;runner.job=job;runner.message='';openDocument(job);render();
    });
    $('#import-document-progress').addEventListener('click',()=>$('#document-progress-file').click());
    $('#document-progress-file').addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file||runner.busy)return;
      const token=++backupImport;
      const before=JSON.stringify({document:getDocument(),route:getRoute()});
      try {
        if(file.size>5000000)fail('Choose a document-progress backup smaller than 5 MB.');
        const job=validate(JSON.parse(await file.text()));
        if(token!==backupImport||runner.busy||before!==JSON.stringify({document:getDocument(),route:getRoute()}))return;
        // Restore as a separate copy: never overwrite newer local edits with an older backup.
        job.id=create({name:job.name,sections:job.parts.map(part=>part.source)},job).id;
        save(localStorage,job);active=job;restoredJob=job;runner.job=job;runner.message='';openDocument(job);render();
      }catch(error){$('#whole-document-status').textContent=error.message||'The progress backup could not be opened.';}
      finally{if(token===backupImport)event.target.value='';}
    });
    $('#document-full-draft').addEventListener('input',event=>{
      if(!active||!complete(active)||runner.busy)return;
      const text=event.target.value;if(!text.trim()){ $('#whole-document-status').textContent='Keep some text in the complete draft before saving.';return; }
      active.editedText=text;
      try {save(localStorage,active);$('#whole-document-status').textContent='Your complete edited draft is saved on this device.';}
      catch(error){$('#whole-document-status').textContent=error.message;}
    });
    $('#backup-document-progress').addEventListener('click',()=>{const job=runner.busy?runner.job:active;if(job)download(JSON.stringify(validate(job),null,2),'application/json','.habla.json');});
    $('#download-document-text').addEventListener('click',()=>{if(active&&complete(active))download(active.name+'\n\n'+compose(active),'text/plain;charset=utf-8','.txt');});
    $('#download-document-html').addEventListener('click',()=>{if(active&&complete(active))download(printable(active,label(active.targetLanguage)),'text/html;charset=utf-8','.html');});
    share?.addEventListener('click',async()=>{
      if(!active||!complete(active)||runner.busy)return;
      const job=active;
      const status=message=>{if(active===job)$('#whole-document-status').textContent=message;};
      try {await sharePaper({title:job.name,text:compose(job),locale:job.targetLanguage,button:share,status});}
      catch {status('Sharing could not open. Use Download translation text to keep a copy.');}
      finally {share.disabled=!active||!complete(active)||runner.busy;}
    });
    $('#print-document').addEventListener('click',()=>{
      if(!active||!complete(active))return;
      const area=$('#whole-document-print');area.replaceChildren();
      const title=document.createElement('h1');title.textContent=active.name;
      const note=document.createElement('p');note.textContent=label(active.targetLanguage)+' · editable translation draft';
      const text=document.createElement('div');text.className='paper-print-text';text.lang=active.targetLanguage;text.textContent=compose(active);
      area.append(title,note,text);document.body.classList.add('printing-whole-document');
      try{window.print();}catch{$('#whole-document-status').textContent='Printing could not open. Download the printable document and open it in Safari to print or save as PDF.';document.body.classList.remove('printing-whole-document');}
    });
    document.addEventListener?.('habla-ui-language-change',render);
    window.addEventListener('afterprint',()=>document.body.classList.remove('printing-whole-document'));
    const modeChanged=()=>{runner.pause('Paused because the translation mode changed. Saved progress keeps its original mode.');render();};
    $('#offline-use')?.addEventListener('change',modeChanged);
    window.addEventListener('online',modeChanged);window.addEventListener('offline',modeChanged);
    render();
    return {refresh:render,pause(message){preparing=null;deviceMessage='';runner.pause(message);},runner,
      usesDevice:()=>findCurrent()?.deviceContinuation===true,
      section:index=>findCurrent()?.parts[index],
      recordSection(index,source,text){
        const doc=getDocument();if(!doc||runner.busy||doc.sections[index]?.trim()!==source.trim()||!text.trim())return;
        let job=findCurrent();
        if(!job){try{job=create(doc,getRoute());}catch{return;}}
        if(job.parts[index].translation===text)return;
        job.parts[index].translation=text;active=job;
        try{
          save(localStorage,job);render();
          if(job.editedText!==null)$('#whole-document-status').textContent='Section edit saved. Your complete edited draft is kept separately and remains the export version.';
        }catch(error){$('#whole-document-status').textContent=error.message;}
      }};
  }
  const api={SCHEMA,PREFIX,validate,create,matches,read,list,save,completed,complete,compose,Runner,printable,sharePaper,isSharing:()=>sharingButtons.size>0,bind};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.HablaWholeDocument=api;
})(typeof window!=='undefined'?window:globalThis);
