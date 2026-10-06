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
  async function extract(file) {
    if (file.size > MAX_BYTES) throw new Error("Choose a document smaller than 10 MB.");
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension === "doc") throw new Error("This is an older .doc file. In Word, save a copy as .docx, then choose that copy.");
    if (!["docx", "pdf", "txt"].includes(extension)) throw new Error("Choose a Word (.docx), PDF, or text (.txt) document.");
    let text;
    if (extension === "txt") text = await file.text();
    else if (extension === "docx") {
      const mammoth = await loadMammoth();
      try { text = (await mammoth.extractRawText({arrayBuffer: await file.arrayBuffer()})).value; }
      catch { throw new Error("This Word file could not be read. Save an unencrypted .docx copy in Word and try again."); }
    } else {
      let pdfjs;
      try { pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.mjs"); }
      catch { throw new Error("PDF reader could not load. Connect to the internet or use a Word .docx copy."); }
      pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.worker.mjs";
      const task = pdfjs.getDocument({data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false});
      task.onPassword = () => { task.destroy(); };
      let pdf;
      try {
        pdf = await task.promise;
        if (pdf.numPages > 100) throw new Error("Choose a PDF of 100 pages or fewer.");
        const pages = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          pages.push(content.items.map(item => item.str ? item.str + (item.hasEOL ? "\n" : " ") : "").join(""));
          page.cleanup();
          if (pages.reduce((total, page) => total + page.length, 0) > MAX_TEXT) throw new Error("This document contains too much text. Choose a smaller document or chapter.");
        }
        text = pages.join("\n\n");
      } catch (error) {
        if (/100 pages|too much text/.test(error.message)) throw error;
        throw new Error("This PDF could not be read. Use an unencrypted PDF or a Word .docx copy.");
      } finally { await (pdf ? pdf.destroy() : task.destroy()); }
    }
    text = text.replace(/\r\n?/g, "\n").replace(/\u0000/g, "").trim();
    if (!text) throw new Error(extension === "pdf" ? "No readable text was found. Scanned PDFs need OCR first; try a Word copy." : "No readable text was found in this document.");
    if (text.length > MAX_TEXT) throw new Error("This document contains too much text. Choose a smaller document or chapter.");
    return {text, sections: sections(text)};
  }
  root.HablaDocument = {extract, sections};
  if (typeof module !== "undefined") module.exports = root.HablaDocument;
})(typeof window !== "undefined" ? window : globalThis);
