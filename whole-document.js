/* Private, resumable document drafts. Import and restore never start translation. */
(function (root) {
  'use strict';
  const SCHEMA = 'habla-ecuador.whole-document.v1';
  const PREFIX = 'habla-ecuador-whole-document-v1:';
  const LANGUAGES = ['en-US','en-GB','es-EC','es-BO','es-MX','es-VE','es-PE','es-CO'];
  const MAX_TEXT = 200000;
  const MAX_DRAFT = 600000;
  const isText = value => typeof value === 'string';
  const fail = message => { throw new Error(message); };
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
      updatedAt:isText(data.updatedAt) ? data.updatedAt : '',status:'paused'};
  }
  function create(document, route) {
    const job = {schema:SCHEMA,id:`doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`,
      name:document.name,sourceLanguage:route.sourceLanguage,targetLanguage:route.targetLanguage,
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
      if(this.job)this.job.status='paused';
      this.notify();
    }
    async run(job, isCurrent=()=>true) {
      if(this.busy)return;
      this.job=job;this.busy=true;this.error=null;const generation=++this.generation;
      const current=()=>generation===this.generation && isCurrent();
      this.message='';job.status='running';this.notify();
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
        if(complete(job)){job.status='complete';this.message='Complete editable translation draft. Review the wording before sharing.';}
        else {job.status='paused';if(!this.message)this.message='Paused because the text, languages or translation service changed. Progress is saved.';}
      } catch(error) {
        job.status='paused';
        this.message=error.code==='superseded' ? 'Paused. Progress is saved.' : error.message || 'Translation paused. Progress is saved.';
        this.error=error;
      } finally {this.busy=false;this.notify();}
    }
  }
  const escape = text => text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function printable(job,label=job.targetLanguage) {
    const title=escape(job.name), text=escape(compose(job));
    return `<!doctype html><html lang="${job.targetLanguage}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{max-width:48rem;margin:2rem auto;padding:0 1rem;color:#161616;font:12pt/1.55 Georgia,serif}h1{font-size:20pt;line-height:1.25}main{white-space:pre-wrap;overflow-wrap:anywhere;orphans:3;widows:3}@media print{body{margin:0;max-width:none}h1{break-after:avoid}}</style><h1>${title}</h1><p>${escape(label)} · editable translation draft</p><main>${text}</main></html>`;
  }
  function bind({getDocument,getRoute,openDocument,translate,onSection,label,formatError}) {
    const $=selector=>document.querySelector(selector);
    if(!$('#translate-entire-document'))return null;
    let active=null,restoredJob=null,backupImport=0;
    const runner=new Runner({storage:localStorage,translate,onSection,onChange:()=>render()});
    function findCurrent() {
      const doc=getDocument();
      if(!doc)return null;
      const route=getRoute();
      if(restoredJob&&matches(restoredJob,doc,{...route,onDevice:restoredJob.onDevice}))return restoredJob;
      if(active && matches(active,doc,route))return active;
      return list(localStorage).find(job=>matches(job,doc,route)) || null;
    }
    function render() {
      const doc=getDocument(), route=getRoute(), jobs=list(localStorage);
      if(!runner.busy) active=findCurrent();
      const job=runner.busy?runner.job:active;
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
      $('#translate-entire-document').disabled=runner.busy||!doc||!supported||!!done||!!engineMismatch;
      $('#translate-entire-document').textContent=done?'Document translated':job?'Resume entire document':'Translate entire document';
      if(doc)$('#translate-document').disabled=runner.busy;
      $('#pause-entire-document').hidden=!runner.busy;
      $('#pause-entire-document').disabled=runner.busy&&runner.job.status!=='running';
      $('#document-full-draft-panel').hidden=!job;
      $('#document-full-draft').readOnly=!done||runner.busy;
      if(job)$('#document-full-draft').lang=job.targetLanguage;
      if(job) {
        const output=done?compose(job):job.parts.filter(part=>part.translation!==null).map(part=>part.translation).join('\n\n');
        if($('#document-full-draft').value!==output)$('#document-full-draft').value=output;
      }
      const progress=job?`${completed(job)} of ${job.parts.length} sections translated. `:'';
      let message=runner.job===job?runner.message:'';
      if(runner.busy&&job?.status==='running') message='Translating in order. Keep this page open; Pause retains completed work.';
      if(!message)message=done?'Complete editable translation draft.':job?'Saved progress is ready. Translation resumes only when you tap Resume entire document.':doc?'Ready to translate the whole document into '+label(route.targetLanguage)+'.':'';
      if(engineMismatch&&!done)message='This progress uses '+(job.onDevice?'on-device translation':'the online service')+'. Select the same mode under Offline translation before resuming. No text has been sent in a different mode.';
      $('#whole-document-status').textContent=progress+message;
      for(const id of ['print-document','download-document-text','download-document-html'])$('#'+id).disabled=!done||runner.busy;
      $('#backup-document-progress').disabled=!job;
    }
    function download(text,type,extension) {
      const job=runner.busy?runner.job:active;if(!job)return;
      const url=URL.createObjectURL(new Blob([text],{type}));const link=document.createElement('a');
      link.href=url;link.download=(job.name.replace(/\.[^.]+$/,'').replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,70)||'Document')+'-'+job.targetLanguage+extension;
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    }
    $('#translate-entire-document').addEventListener('click',async()=>{
      if(runner.busy)return;
      const doc=getDocument();if(!doc)return;
      const route=getRoute();
      try {
        active=findCurrent()||create(doc,route);
        if(active.onDevice!==route.onDevice){render();return;}
        restoredJob=active;
        runner.error=null;
        await runner.run(active,()=>{
          const now=getDocument();return !!now&&matches(active,now,getRoute());
        });
        if(runner.error?.code&&runner.error.code!=='superseded') {
          runner.message=formatError(runner.error)+' Completed work is saved; resume after resolving this.';render();
        }
      }catch(error){$('#whole-document-status').textContent=error.message;}
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
    $('#print-document').addEventListener('click',()=>{
      if(!active||!complete(active))return;
      const area=$('#whole-document-print');area.replaceChildren();
      const title=document.createElement('h1');title.textContent=active.name;
      const note=document.createElement('p');note.textContent=label(active.targetLanguage)+' · editable translation draft';
      const text=document.createElement('div');text.className='paper-print-text';text.lang=active.targetLanguage;text.textContent=compose(active);
      area.append(title,note,text);document.body.classList.add('printing-whole-document');
      try{window.print();}catch{$('#whole-document-status').textContent='Printing could not open. Download the printable document and open it in Safari to print or save as PDF.';document.body.classList.remove('printing-whole-document');}
    });
    window.addEventListener('afterprint',()=>document.body.classList.remove('printing-whole-document'));
    const modeChanged=()=>{runner.pause('Paused because the translation mode changed. Saved progress keeps its original mode.');render();};
    $('#offline-use')?.addEventListener('change',modeChanged);
    window.addEventListener('online',modeChanged);window.addEventListener('offline',modeChanged);
    render();
    return {refresh:render,pause:message=>runner.pause(message),runner,
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
  const api={SCHEMA,PREFIX,validate,create,matches,read,list,save,completed,complete,compose,Runner,printable,bind};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.HablaWholeDocument=api;
})(typeof window!=='undefined'?window:globalThis);
