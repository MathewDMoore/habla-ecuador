/* Saved papers are user-imported data. Never fetch, publish or translate them here. */
(function (root) {
  'use strict';
  const SCHEMA = 'habla-ecuador.saved-paper.v1';
  const STORAGE = 'habla-ecuador-private-paper-v1';
  const MAX_TEXT = 200000;
  const MAX_BYTES = 2000000;
  function validate(data) {
    if (!data || data.schema !== SCHEMA) throw new Error('Choose a Habla saved-paper file (.json) containing the full Spanish and English drafts.');
    if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 240) throw new Error('The saved paper needs a title of up to 240 characters.');
    const check = value => typeof value === 'string' && !!value.trim() && value.length <= MAX_TEXT;
    if (!check(data.sourceText) || !check(data.translations?.['en-GB']) || !check(data.translations?.['en-US'])) throw new Error('The file must contain the full source and both English drafts, each up to 200,000 characters.');
    // Copy only supported text fields; imported markup is always displayed as text.
    return {schema:SCHEMA, title:data.title.trim(), sourceLanguage:'es', sourceText:data.sourceText,
      translations:{'en-GB':data.translations['en-GB'], 'en-US':data.translations['en-US']},
      reviewStatus:'editable translation draft'};
  }
  function parse(text) {
    try { return validate(JSON.parse(text)); }
    catch (error) { if (error instanceof SyntaxError) throw new Error('This is not a readable saved-paper JSON file. Choose the Habla paper download.'); throw error; }
  }
  function load(storage) {
    try { const text = storage.getItem(STORAGE); return text ? {paper:parse(text)} : {paper:null}; }
    catch { return {paper:null, error:'The saved paper could not be read on this device. Import your backup again.'}; }
  }
  function save(storage, paper) {
    try { storage.setItem(STORAGE, JSON.stringify(validate(paper))); return true; }
    catch { return false; }
  }
  function bind({speak, stop, pause}) {
    const $ = selector => document.querySelector(selector);
    if (!$('#choose-saved-paper')) return;
    let paper = null;
    let comparing = false;
    let importRequest = 0;
    const status = message => { $('#saved-paper-status').textContent = message; };
    const selected = () => $('#saved-paper-variety').value;
    const collect = () => {
      if (!paper) return;
      paper.title = $('#saved-paper-title').value;
      paper.translations['en-GB'] = $('#saved-paper-uk').value;
      paper.translations['en-US'] = $('#saved-paper-us').value;
    };
    const persist = () => {
      collect();
      status(save(localStorage, paper) ? 'Saved on this device. The whole paper is ready; no translation request is needed.' : 'Your draft is open, but could not be saved on this device. Download a backup before leaving. Check that both drafts and the title contain text.');
    };
    const updatePanels = () => {
      $('#saved-paper-uk-panel').hidden = !comparing && selected() !== 'en-GB';
      $('#saved-paper-us-panel').hidden = !comparing && selected() !== 'en-US';
      $('#saved-paper-editors').classList.toggle('comparing', comparing);
      $('#compare-saved-paper').textContent = comparing ? 'Show one English version' : 'Compare U.K. / U.S. English';
      $('#compare-saved-paper').setAttribute('aria-pressed', String(comparing));
    };
    const render = () => {
      $('#saved-paper-reader').hidden = !paper;
      if (!paper) return;
      $('#saved-paper-title').value = paper.title;
      $('#saved-paper-source').textContent = paper.sourceText;
      $('#saved-paper-uk').value = paper.translations['en-GB'];
      $('#saved-paper-us').value = paper.translations['en-US'];
      $('#saved-paper-count').textContent = `Complete saved paper · ${paper.sourceText.trim().split(/\s+/u).length.toLocaleString()} source words · editable English drafts. Review the translation against the original.`;
      updatePanels();
    };
    const download = (text, type, extension) => {
      const url = URL.createObjectURL(new Blob([text], {type}));
      const link = document.createElement('a');
      link.href = url;
      link.download = (paper.title.replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,80) || 'Saved-paper') + extension;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    };
    $('#choose-saved-paper').addEventListener('click', () => $('#saved-paper-file').click());
    $('#saved-paper-file').addEventListener('change', async event => {
      const file = event.target.files[0];
      if (!file) return;
      const token = ++importRequest;
      status('Opening the saved paper on your device…');
      try {
        if (file.size > MAX_BYTES) throw new Error('Choose a saved-paper file under 2 MB.');
        const imported = parse(await file.text());
        if (token !== importRequest) return;
        stop(); paper = imported; comparing = false; render(); persist();
      } catch (error) { if (token === importRequest) status(error.message || 'This saved paper could not be opened.'); }
      finally { if (token === importRequest) event.target.value = ''; }
    });
    ['#saved-paper-title', '#saved-paper-uk', '#saved-paper-us'].forEach(selector => $(selector).addEventListener('input', persist));
    $('#saved-paper-variety').addEventListener('change', () => { stop(); updatePanels(); });
    $('#compare-saved-paper').addEventListener('click', () => { comparing = !comparing; updatePanels(); });
    $('#hear-saved-paper').addEventListener('click', () => { collect(); if (paper) speak(paper.translations[selected()], selected()); });
    $('#pause-paper').addEventListener('click', pause);
    $('#stop-saved-paper').addEventListener('click', stop);
    $('#backup-saved-paper').addEventListener('click', () => {
      collect(); if (!paper) return;
      try { download(JSON.stringify(validate(paper), null, 2), 'application/json', '.json'); }
      catch (error) { status(error.message); }
    });
    $('#download-saved-paper').addEventListener('click', () => {
      collect(); if (paper) download(`${paper.title}\n\n${paper.translations[selected()]}\n`, 'text/plain;charset=utf-8', selected() === 'en-GB' ? '-UK.txt' : '-US.txt');
    });
    $('#print-saved-paper').addEventListener('click', () => {
      collect(); if (!paper) return;
      stop();
      const area = $('#saved-paper-print'); area.replaceChildren();
      const title = document.createElement('h1'); title.textContent = paper.title;
      const variant = document.createElement('p'); variant.textContent = selected() === 'en-GB' ? 'U.K. English translation draft' : 'U.S. English translation draft';
      const text = document.createElement('div'); text.className = 'paper-print-text'; text.textContent = paper.translations[selected()];
      area.append(title, variant, text);
      document.body.classList.add('printing-saved-paper');
      try { window.print(); } catch { document.body.classList.remove('printing-saved-paper'); status('Printing could not open. Download the English text to print from Word or Pages.'); }
    });
    window.addEventListener('afterprint', () => document.body.classList.remove('printing-saved-paper'));
    $('#remove-saved-paper').addEventListener('click', () => {
      // Removing the device copy retains the explicit downloaded backup.
      try { localStorage.removeItem(STORAGE); }
      catch { status('The device copy could not be removed. Try again before closing the page.'); return; }
      ++importRequest; stop(); paper = null; render();
      $('#saved-paper-title').value = ''; $('#saved-paper-source').textContent = '';
      $('#saved-paper-uk').value = ''; $('#saved-paper-us').value = '';
      $('#saved-paper-print').replaceChildren();
      status('Paper removed from this device. You can open your backup whenever you need it.');
    });
    const saved = load(localStorage); paper = saved.paper; render();
    if (paper) status('Opened your complete saved paper from this device.');
    else if (saved.error) status(saved.error);
  }
  const api = {SCHEMA, STORAGE, MAX_BYTES, validate, parse, load, save, bind};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HablaPaper = api;
})(typeof window !== 'undefined' ? window : globalThis);
