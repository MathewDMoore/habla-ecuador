/* Device-local contributions; never used as translation or dictionary evidence. */
(function () {
  'use strict';
  const KEY = 'habla-slang-contributions-v1';
  const FIELDS = ['task','region','city','term','meaning','example','usage','register','assessment','evidence','reviewer'];
  function bind() {
    const form = document.getElementById('slang-contribution-form');
    if (!form) return;
    const get = id => document.getElementById('slang-contribution-' + id);
    const status = message => { get('status').textContent = message; };
    const output = get('export');
    let entries = [], editing = null, promptIndex = 0, pending = false;
    const clean = item => {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string') return null;
      const copy = {id:item.id.slice(0,100)};
      for (const key of FIELDS) copy[key] = typeof item[key] === 'string' ? item[key].slice(0,2000) : '';
      return copy.term && copy.meaning && copy.example ? copy : null;
    };
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(saved)) throw Error('Invalid saved contributions');
      entries = saved.slice(0,50).map(clean).filter(Boolean);
    } catch { status('Saved contributions could not be read. Your form is still available; saving may require device storage access.'); }
    const exportText = item => ['Habla Ecuador — contribution / aporte','UNVERIFIED USER REPORT · source and regional review pending', ...FIELDS.map(key => key + ': ' + (item[key] || (key === 'usage' ? 'Not specified / unsure' : '')))].join('\n');
    function select(item) {
      editing = item.id;
      for (const key of FIELDS) {
        form.elements[key].value = item[key];
        if (form.elements[key].tagName === 'SELECT' && !form.elements[key].value) form.elements[key].selectedIndex = 0;
      }
      output.value = exportText(item);
      get('copy').disabled = get('share').disabled = false;
    }
    function persist(next) {
      try { localStorage.setItem(KEY, JSON.stringify(next)); entries = next; return true; }
      catch { status('Not saved: device storage is unavailable or full. Your form has been kept.'); return false; }
    }
    function reset() {
      form.reset(); editing = null; output.value = ''; get('copy').disabled = get('share').disabled = true;
    }
    function render() {
      const list = get('list'); list.replaceChildren();
      const heading = document.createElement('p'); heading.textContent = entries.length + ' saved contributions · all pending verification'; list.append(heading);
      for (const item of entries) {
        const row = document.createElement('div'); row.className = 'slang-contribution-actions';
        const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = item.term + ' · ' + item.region + (item.city ? ' / ' + item.city : '') + ' · Review / edit';
        edit.addEventListener('click', () => { select(item); status('Loaded for review. Save to keep changes; exports use the last saved version.'); });
        const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete'; remove.setAttribute('aria-label','Delete contribution: ' + item.term);
        remove.addEventListener('click', () => {
          if (!persist(entries.filter(other => other.id !== item.id))) return;
          if (editing === item.id) reset(); render(); status('Contribution deleted from this device.');
        });
        row.append(edit,remove); list.append(row);
      }
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const item = {id:editing || (globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2))};
      for (const key of FIELDS) item[key] = form.elements[key].value.trim();
      if (!item.term || !item.meaning || !item.example) { status('Enter a word, meaning and original example.'); return; }
      if (!editing && entries.length >= 50) { status('50 contributions saved. Copy and remove an old contribution before adding another.'); return; }
      const next = editing ? entries.map(other => other.id === editing ? item : other) : [...entries,item];
      if (!persist(next)) return;
      render(); select(item); status('Saved on this device · unverified. Nothing has been submitted or added to translations.');
    });
    get('new').addEventListener('click', () => { reset(); status('New form ready. Previously saved contributions remain below.'); });
    document.getElementById('slang-prompt-next').addEventListener('click', () => {
      const prompts = ['What do friends say for something excellent? / ¿Cómo dicen que algo es muy bueno?', 'What do you say when tired or frustrated? Is it vulgar? / ¿Qué dices al cansarte o frustrarte?', 'Which word changes meaning with the sentence? Give two contexts. / ¿Qué palabra cambia según el contexto?', 'What would you correct in the dictionary? Give the complete phrase. / ¿Qué corregirías? Escribe la frase completa.'];
      const place = [form.elements.region.value,form.elements.city.value.trim()].filter(Boolean).join(' · ');
      get('prompt').textContent = place + ': ' + prompts[promptIndex++ % prompts.length];
    });
    async function copy() {
      try { await navigator.clipboard.writeText(output.value); status('Selected contribution copied.'); }
      catch { output.focus(); output.select(); status('Copy is unavailable. The contribution is selected; use your device’s Copy action.'); }
    }
    async function send(share) {
      if (pending || !output.value) return;
      pending = true; get('copy').disabled = get('share').disabled = true;
      try {
        if (share && typeof navigator.share === 'function') {
          try { await navigator.share({title:'Habla slang contribution',text:output.value}); status('Sharing completed; public dictionary review is still pending.'); }
          catch (error) { if (error?.name === 'AbortError') status('Sharing cancelled.'); else await copy(); }
        } else await copy();
      } finally { pending = false; get('copy').disabled = get('share').disabled = !output.value; }
    }
    get('copy').addEventListener('click', () => send(false));
    get('share').addEventListener('click', () => send(true));
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',bind,{once:true}); else bind();
})();
