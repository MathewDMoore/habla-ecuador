/* Local OCR: image bytes are passed to a browser worker, never uploaded. */
const HablaScreenshot = (() => {
  const BASE="https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/";
  let loading, sequence=0, activeWorker, queue=Promise.resolve();
  function validate(file) {
    if (!file || !/^image\/(?:png|jpeg|webp|bmp)$/.test(file.type)) throw new Error("Choose a PNG, JPEG or WebP screenshot. For HEIC, save or copy it as a screenshot first.");
    if (file.size>10*1024*1024) throw new Error("Choose an image smaller than 10 MB.");
    return file;
  }
  function imageFromClipboard(data) {
    const items=Array.from(data?.items||[]);
    const image=items.find(item=>item.kind==='file'&&item.type.startsWith('image/'))?.getAsFile();
    return image || Array.from(data?.files||[]).find(file=>file.type.startsWith('image/')) || null;
  }
  function load() {
    if (globalThis.Tesseract) return Promise.resolve(Tesseract);
    if (!loading) loading=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=BASE+'tesseract.min.js';
      script.onload=()=>resolve(Tesseract);
      script.onerror=()=>{script.remove();loading=null;reject(new Error("The screenshot reader could not load. Connect for its first use, or paste copied text instead."));};
      document.head.append(script);
    });
    return loading;
  }
  function interruptible(promise,signal) {
    if(!signal)return promise;
    return new Promise((resolve,reject)=>{
      const abort=()=>reject(new Error('Screenshot reading cancelled.'));
      promise.then(value=>{signal.removeEventListener('abort',abort);resolve(value);},error=>{signal.removeEventListener('abort',abort);reject(error);});
      if(signal.aborted){abort();return;}
      signal.addEventListener('abort',abort,{once:true});
    });
  }
  async function extract(file,{language='spa',logger=()=>{},isCurrent=()=>true,reader,signal}={}) {
    validate(file);
    const api=reader || await interruptible(load(),signal);
    if (!isCurrent()) return null;
    const creation=api.createWorker(language,1,{workerPath:BASE+'worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',logger,errorHandler:()=>{}});
    creation.then(worker=>{if(signal?.aborted)worker.terminate().catch(()=>{});},()=>{});
    const worker=await interruptible(creation,signal);
    activeWorker=worker;
    try {
      if (!isCurrent()) return null;
      // Limit decoded pixels to prevent very large camera images exhausting a phone.
      if (typeof createImageBitmap==='function') {
        const bitmap=await createImageBitmap(file);
        const pixels=bitmap.width*bitmap.height;bitmap.close();
        if (pixels>16000000) throw new Error("This image is too large to read on a phone. Crop it to the text and try again.");
      }
      const result=await interruptible(worker.recognize(file),signal);
      if (!isCurrent()) return null;
      const text=String(result.data?.text||'').replace(/\r\n?/g,'\n').replace(/\u0000/g,'').trim();
      if (!text) throw new Error("No readable text found. Try a clearer screenshot or crop to the text.");
      if (text.length>200000) throw new Error("This screenshot contains too much text. Crop a smaller area.");
      return {text,name:file.name||'Screenshot',confidence:result.data?.confidence};
    } finally { if(activeWorker===worker)activeWorker=null;try { await worker.terminate(); } catch {} }
  }
  function bind({begin,commit}) {
    const input=document.querySelector('#translator-input'),fileInput=document.querySelector('#screenshot-file');
    const choose=document.querySelector('#choose-screenshot'),paste=document.querySelector('#paste-screenshot'),cancel=document.querySelector('#cancel-screenshot'),status=document.querySelector('#screenshot-status');
    if(!input||!fileInput||!choose||!paste) return;
    const report=text=>{status.textContent=text;};
    let controller;
    function read(file) {
      try{validate(file);}catch(error){report(error.message);return;}
      controller?.abort();controller=new AbortController();
      const signal=controller.signal,id=++sequence,guard=begin();
      const language=document.querySelector('#source-language-select').value.startsWith('en')?'eng':'spa';
      cancel.hidden=false;report('Reading screenshot on this device… First use downloads the reader.');
      queue=queue.then(async()=>{
        if(id!==sequence)return;
        try{
          const result=await extract(file,{language,signal,isCurrent:()=>id===sequence,logger:progress=>{
            if(id===sequence&&progress.status==='recognizing text')report(`Reading screenshot… ${Math.round((progress.progress||0)*100)}%`);
          }});
          if(id!==sequence||!result)return;
          if(!commit(result,guard)){report('Your input changed while the screenshot was read. It has been kept; choose the screenshot again when ready.');return;}
          report('Screenshot text ready. Review it below, then tap Translate this section.');
        }catch(error){if(id===sequence)report(error.message||'Screenshot could not be read. Try a clearer image.');}
        finally{if(id===sequence)cancel.hidden=true;}
      });
    }
    choose.addEventListener('click',()=>fileInput.click());
    fileInput.addEventListener('change',event=>{const file=event.target.files[0];event.target.value='';if(file)read(file);});
    input.addEventListener('paste',event=>{const file=imageFromClipboard(event.clipboardData);if(file){event.preventDefault();read(file);}});
    paste.addEventListener('click',async()=>{
      if(!navigator.clipboard?.read){report('Use Paste in the text box, or choose the screenshot from Photos. This browser does not offer an image clipboard button.');return;}
      try{
        const items=await navigator.clipboard.read();
        for(const item of items){const type=item.types.find(type=>type.startsWith('image/'));if(type){read(await item.getType(type));return;}}
        report('No image on the clipboard. Copy a screenshot first, or choose one from Photos.');
      }catch{report('Clipboard access was not available. Use Paste in the text box, or choose the screenshot from Photos.');}
    });
    cancel.addEventListener('click',()=>{sequence++;controller?.abort();cancel.hidden=true;report('Screenshot reading cancelled. Your text has been kept.');if(activeWorker)activeWorker.terminate().catch(()=>{});});
  }
  return {bind,extract,validate,imageFromClipboard};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=HablaScreenshot;
