const searchInput = document.querySelector("#search");
const rateInput = document.querySelector("#voice-rate");
const results = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const voiceNote = document.querySelector("#voice-note");
const sourceList = document.querySelector("#source-list");
const domainFilters = document.querySelector("#domain-filters");
const readyCount = document.querySelector("#ready-count");
const domainCount = document.querySelector("#domain-count");

let entries = [];
let sources = [];
let domains = [];
let comparisons = [];
let activeDomain = "all";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);
}

function normalize(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function verificationLabel(entry) {
  const v = entry.verification || {};
  if (v.nativeSpeakerReviewed && v.corpusChecked) return {label:"Multi-source confirmed", cls:"confirmed"};
  if (v.nativeSpeakerReviewed) return {label:"Native reviewed", cls:"native"};
  if (v.corpusChecked) return {label:"Corpus supported", cls:"corpus"};
  if (v.dictionaryAttested) return {label:"Dictionary attested", cls:"dictionary"};
  return {label:"Research lead", cls:"lead"};
}

function domainFor(entryId) {
  return domains.find((domain) => (domain.entries || []).includes(entryId));
}

function comparisonsFor(entry) {
  const embedded = entry.comparisons || [];
  const special = comparisons.find((item) => item.entryId === entry.id);
  if (!special) return embedded;
  const bolivia = {country:"🇧🇴 Bolivia", meaning:special.bolivia, note:special.learnerAlert};
  const withoutBolivia = embedded.filter((item) => !normalize(item.country).includes("bolivia"));
  return [bolivia, ...withoutBolivia];
}

function renderDomains() {
  const buttons = [{id:"all", label:"All"}, ...domains.map((domain) => ({id:domain.id,label:domain.label}))];
  domainFilters.innerHTML = buttons.map((button) => `<button type="button" class="domain-chip ${activeDomain === button.id ? "active" : ""}" data-domain="${escapeHtml(button.id)}">${escapeHtml(button.label)}</button>`).join("");
}

function render() {
  const query = normalize(searchInput.value.trim());
  const filtered = entries.filter((entry) => {
    const domain = domainFor(entry.id);
    if (activeDomain !== "all" && domain?.id !== activeDomain) return false;
    const comparisonText = comparisonsFor(entry).map((item) => [item.country,item.meaning,item.note].join(" ")).join(" ");
    return normalize([entry.spanish,entry.usEnglish,entry.ukEnglish,entry.exampleEs,entry.exampleUs,entry.exampleUk,entry.regionStatus,entry.register,entry.warning,comparisonText,domain?.label].filter(Boolean).join(" ")).includes(query);
  });

  results.innerHTML = filtered.map((entry) => {
    const linkedSources = (entry.sources || []).map((id) => sources.find((source) => source.id === id)).filter(Boolean);
    const entryComparisons = comparisonsFor(entry);
    const domain = domainFor(entry.id);
    const verification = verificationLabel(entry);
    const comparisonMarkup = entryComparisons.length ? `<div class="country-comparisons" aria-label="Country comparisons">${entryComparisons.map((item) => `<div class="country-item"><strong>${escapeHtml(item.country)}</strong><p>${escapeHtml(item.meaning)} ${item.note ? escapeHtml(item.note) : ""}</p></div>`).join("")}</div>` : "";
    return `<article class="card">
      <div class="card-top"><div><h2 class="term" lang="es">${escapeHtml(entry.spanish)}</h2><div class="term-meta">${entry.level ? `<span class="tag">${escapeHtml(entry.level)}</span>` : ""}${domain ? `<span class="tag domain-tag">${escapeHtml(domain.label)}</span>` : ""}<span class="tag">${escapeHtml(entry.regionStatus || "Unmarked Spanish")}</span></div></div><button class="speak" type="button" data-speak="${escapeHtml(entry.spanish)}" aria-label="Hear ${escapeHtml(entry.spanish)} in Spanish"><span aria-hidden="true">▶</span> Hear Spanish</button></div>
      <div class="evidence-row"><span class="evidence-badge ${verification.cls}"><span class="dot" aria-hidden="true"></span>${escapeHtml(verification.label)}</span>${entry.verification?.corpusChecked ? "" : `<span class="pending-note">CORPHA check pending</span>`}</div>
      <div class="definitions"><div class="translation"><span class="translation-label">🇺🇸 US English</span><p>${escapeHtml(entry.usEnglish)}</p></div><div class="translation"><span class="translation-label">🇬🇧 UK English</span><p>${escapeHtml(entry.ukEnglish)}</p></div></div>
      ${entry.exampleEs ? `<figure class="example"><blockquote lang="es">${escapeHtml(entry.exampleEs)}</blockquote><figcaption><span>🇺🇸 ${escapeHtml(entry.exampleUs)}</span>${entry.exampleUk ? `<span>🇬🇧 ${escapeHtml(entry.exampleUk)}</span>` : ""}</figcaption></figure>` : ""}
      <p class="usage"><strong>Register:</strong> ${escapeHtml(entry.register)}${entry.intensity ? `<br><strong>Intensity:</strong> ${escapeHtml(entry.intensity)}` : ""}</p>
      ${entry.warning ? `<p class="context-note"><strong>🧐 Context:</strong> ${escapeHtml(entry.warning)}</p>` : ""}
      ${comparisonMarkup}
      ${linkedSources.length ? `<div class="entry-sources" aria-label="Entry sources">${linkedSources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.shortName || source.name)}</a>`).join("")}</div>` : ""}
    </article>`;
  }).join("");
  emptyState.hidden = filtered.length > 0;
}

function renderSources() {
  sourceList.innerHTML = sources.map((source) => `<article class="source-card"><span class="source-kind">${escapeHtml(source.kind)}</span><h3>${escapeHtml(source.name)}</h3><p>${escapeHtml(source.use)}</p><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Open source ↗</a></article>`).join("");
}

searchInput.addEventListener("input", render);
domainFilters.addEventListener("click", (event) => { const button = event.target.closest("[data-domain]"); if (!button) return; activeDomain = button.dataset.domain; renderDomains(); render(); });

results.addEventListener("click", (event) => {
  const button = event.target.closest("[data-speak]");
  if (!button) return;
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { voiceNote.textContent = "Speech playback is not available in this browser."; return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(button.dataset.speak);
  utterance.lang = "es-EC";
  utterance.rate = Number(rateInput.value);
  utterance.onstart = () => { voiceNote.textContent = Number(rateInput.value) < 0.8 ? "Playing Ecuadorian Spanish slowly." : "Playing Ecuadorian Spanish at a natural pace."; };
  utterance.onend = () => { voiceNote.textContent = "Tap “Hear Spanish” to listen."; };
  utterance.onerror = () => { voiceNote.textContent = "Speech could not play. Check your device's speech settings."; };
  window.speechSynthesis.speak(utterance);
});

Promise.all([
  fetch("data/learner-entries-v1.json").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
  fetch("data/sources.json").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
  fetch("data/conversation-domains.json").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
  fetch("data/ecuador-bolivia-comparisons-v1.json").then((r) => { if (!r.ok) throw new Error(); return r.json(); })
]).then(([learnerEntries, sourceData, domainData, comparisonData]) => {
  entries = learnerEntries;
  sources = sourceData;
  domains = domainData.domains || [];
  comparisons = comparisonData;
  readyCount.textContent = entries.length;
  domainCount.textContent = domains.length;
  renderDomains(); render(); renderSources();
}).catch(() => {
  voiceNote.textContent = "App data did not load. Serve the folder over HTTP and reload.";
  emptyState.hidden = false;
  sourceList.innerHTML = "<p class='empty-state'>Sources could not be loaded.</p>";
});
