/* Local text extraction. No document bytes are uploaded. Libraries load on demand. */
(function (root) {
  "use strict";
  const MAX_BYTES = 10 * 1024 * 1024;
  const MAX_TEXT = 200000;
  let mammothLoading;
  function sections(text, limit = 3000) {
    const result = [];
    let remaining = text;
    while (remaining.length > limit) {
      let end = remaining.lastIndexOf("\n\n", limit);
      if (end < limit / 2) end = remaining.lastIndexOf(" ", limit);
      if (end < limit / 2) end = limit;
      // Keep delimiters in the source: joining sections reproduces the entire text.
      result.push(remaining.slice(0, end));
      remaining = remaining.slice(end);
    }
    if (remaining) result.push(remaining);
    return result;
  }
  function loadMammoth() {
    if (root.mammoth) return Promise.resolve(root.mammoth);
    if (!mammothLoading) mammothLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mammoth@1.11.0/mammoth.browser.min.js";
      script.onload = () => resolve(root.mammoth);
      script.onerror = () => { script.remove(); mammothLoading = null; reject(new Error("Word reader could not load. Connect to the internet and try again.")); };
      document.head.append(script);
    });
    return mammothLoading;
  }
  // A selectable header or footer does not make an embedded scan searchable.
  function scanRegions(page, pdfjs, operators, items) {
    const {OPS, Util} = pdfjs;
    const viewport = page.getViewport({scale:1});
    const images = [];
    const stack = [];
    let matrix = [1,0,0,1,0,0];
    operators.fnArray.forEach((op, i) => {
      const args = operators.argsArray[i];
      if (op === OPS.save || op === OPS.paintFormXObjectBegin) stack.push(matrix);
      if (op === OPS.restore || op === OPS.paintFormXObjectEnd) matrix = stack.pop() || matrix;
      if (op === OPS.transform) matrix = Util.transform(matrix, args);
      if (op === OPS.paintFormXObjectBegin && args?.[0]) matrix = Util.transform(matrix, args[0]);
      if (op !== OPS.paintImageXObject && op !== OPS.paintInlineImageXObject) return;
      const [a,b,c,d,x,y] = matrix;
      const corners = [[x,y],[x+a,y+b],[x+c,y+d],[x+a+c,y+b+d]]
        .map(point => viewport.convertToViewportPoint(...point));
      const left = Math.max(0, Math.min(...corners.map(point => point[0])));
      const top = Math.max(0, Math.min(...corners.map(point => point[1])));
      const right = Math.min(viewport.width, Math.max(...corners.map(point => point[0])));
      const bottom = Math.min(viewport.height, Math.max(...corners.map(point => point[1])));
      if (right-left < 72 || bottom-top < 72 || (right-left)*(bottom-top) < viewport.width*viewport.height*0.08) return;
      const box = {left,top,right,bottom};
      const contained = items.filter(item => {
        if (!item.str?.trim() || !item.transform) return false;
        const [x,y] = viewport.convertToViewportPoint(item.transform[4],item.transform[5]);
        return x >= left && x <= right && y >= top && y <= bottom;
      });
      // Most searchable scans include a text layer spread through the image.
      // A single caption or header is too little evidence to skip OCR.
      const wordCount = contained.map(item => item.str.trim()).join(' ').match(/\p{L}+/gu)?.length || 0;
      const lineCount = new Set(contained.map(item => Math.round(viewport.convertToViewportPoint(item.transform[4],item.transform[5])[1]/5))).size;
      if (wordCount >= 12 && lineCount >= 3) return;
      images.push(box);
    });
    // Scans often consist of a background/shadow and a second image layered
    // over it. Keep the largest region where the two largely overlap.
    const area = box => (box.right-box.left)*(box.bottom-box.top);
    const regions = [];
    for (const box of images.sort((a,b) => area(b)-area(a))) {
      const overlaps = regions.some(existing =>
        Math.max(0,Math.min(box.right,existing.right)-Math.max(box.left,existing.left)) *
        Math.max(0,Math.min(box.bottom,existing.bottom)-Math.max(box.top,existing.top)) >= area(box)*0.7);
      if (!overlaps) regions.push(box);
    }
    if (!regions.length && !items.some(item => /\p{L}/u.test(item.str || ''))) {
      regions.push({left:0,top:0,right:viewport.width,bottom:viewport.height});
    }
    return regions.sort((a,b) => a.top-b.top || a.left-b.left);
  }
  async function readScan(page, box, session, signal, createCanvas) {
    const scale = Math.min(3, 2400/Math.max(box.right-box.left,box.bottom-box.top));
    const canvas = createCanvas();
    canvas.width = Math.ceil((box.right-box.left)*scale);
    canvas.height = Math.ceil((box.bottom-box.top)*scale);
    const viewport = page.getViewport({scale});
    const render = page.render({canvas,canvasContext:canvas.getContext('2d'),viewport,
      transform:[1,0,0,1,-box.left*scale,-box.top*scale]});
    const cancel = () => render.cancel();
    signal?.addEventListener('abort',cancel,{once:true});
    try {
      if (signal?.aborted) cancel();
      await render.promise;
      signal?.throwIfAborted();
      return await session.recognize(canvas);
    } finally {
      signal?.removeEventListener('abort',cancel);
      canvas.width = canvas.height = 0;
    }
  }
  async function extract(file, {pdfReader,openOcr,language='spa',signal,onPage=()=>{},createCanvas=()=>document.createElement('canvas')}={}) {
    if (file.size > MAX_BYTES) throw new Error("Choose a document smaller than 10 MB.");
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension === "doc") throw new Error("This is an older .doc file. In Word, save a copy as .docx, then choose that copy.");
    if (!["docx", "pdf", "txt"].includes(extension)) throw new Error("Choose a Word (.docx), PDF, or text (.txt) document.");
    let text, pdfCoverage;
    if (extension === "txt") text = await file.text();
    else if (extension === "docx") {
      const mammoth = await loadMammoth();
      try { text = (await mammoth.extractRawText({arrayBuffer: await file.arrayBuffer()})).value; }
      catch { throw new Error("This Word file could not be read. Save an unencrypted .docx copy in Word and try again."); }
    } else {
      let pdfjs = pdfReader;
      try { if (!pdfjs) pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.mjs"); }
      catch { throw new Error("PDF reader could not load. Connect to the internet or use a Word .docx copy."); }
      pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.worker.mjs";
      const task = pdfjs.getDocument({data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false});
      let session;
      const abort = () => task.destroy().catch(()=>{});
      task.onPassword = abort;
      signal?.addEventListener('abort',abort,{once:true});
      try {
        signal?.throwIfAborted();
        const pdf = await task.promise;
        if (pdf.numPages > 100) throw new Error("Choose a PDF of 100 pages or fewer.");
        pdfCoverage = {pageCount:pdf.numPages, ocrPages:[], unreadablePages:[]};
        const pages = [];
        let length = 0;
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          signal?.throwIfAborted();
          onPage({page:pageNumber,total:pdf.numPages,ocr:false});
          const page = await pdf.getPage(pageNumber);
          try {
            const {items} = await page.getTextContent();
            let pageText = items.map(item => item.str ? item.str + (item.hasEOL ? "\n" : " ") : "").join("").trim();
            const regions = pdfjs.OPS && page.getOperatorList ? scanRegions(page,pdfjs,await page.getOperatorList(),items) : [];
            if (regions.length) {
              try {
                onPage({page:pageNumber,total:pdf.numPages,ocr:true});
                session ||= await openOcr({language,signal});
                const recognized = [];
                let needsReview = false;
                for (const region of regions) {
                  const result = await readScan(page,region,session,signal,createCanvas);
                  if (result.text) recognized.push(result.text);
                  if (!result.text || (Number.isFinite(result.confidence) && result.confidence < 65)) needsReview = true;
                }
                if (recognized.length) pdfCoverage.ocrPages.push(pageNumber);
                if (needsReview) pdfCoverage.unreadablePages.push(pageNumber);
                pageText = [pageText,...recognized].filter(Boolean).join("\n\n");
              } catch (error) {
                signal?.throwIfAborted();
                throw new Error(`Scanned PDF page ${pageNumber} could not be read. Connect to load the text reader and choose the PDF again, or try a searchable copy.`);
              }
            }
            pages.push(pageText);
            length += pageText.length + (pageNumber > 1 ? 2 : 0);
            if (length > MAX_TEXT) throw new Error("This document contains too much text. Choose a smaller document or chapter.");
          } finally { page.cleanup(); }
        }
        text = pages.join("\n\n");
      } catch (error) {
        signal?.throwIfAborted();
        if (/100 pages|too much text|^Scanned PDF page/.test(error.message)) throw error;
        throw new Error("This PDF could not be read. Use an unencrypted PDF or a Word .docx copy.");
      } finally {
        signal?.removeEventListener('abort',abort);
        await session?.close();
        await task.destroy();
      }
    }
    text = text.replace(/\r\n?/g, "\n").replace(/\u0000/g, "").trim();
    if (!text) throw new Error(extension === "pdf" ? "No readable text was found in this PDF. Try a clearer or searchable copy." : "No readable text was found in this document.");
    if (text.length > MAX_TEXT) throw new Error("This document contains too much text. Choose a smaller document or chapter.");
    return {text, sections: sections(text), ...(pdfCoverage ? {pdfCoverage} : {})};
  }
  root.HablaDocument = {extract, sections};
  if (typeof module !== "undefined") module.exports = root.HablaDocument;
})(typeof window !== "undefined" ? window : globalThis);
