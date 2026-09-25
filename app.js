const searchInput = document.querySelector("#search");
const rateInput = document.querySelector("#voice-rate");
const results = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const voiceNote = document.querySelector("#voice-note");
const sourceList = document.querySelector("#source-list");

let entries = [];
let sources = [];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function normalize(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function render() {
  const query = normalize(searchInput.value.trim());
  const filtered = entries.filter((entry) => {
    const comparisonText = (entry.comparisons || []).map((item) => [item.country, item.meaning, item.note].join(" ")).join(" ");
    return normalize([
      entry.spanish, entry.usEnglish, entry.ukEnglish, entry.exampleEs, entry.exampleUs,
      entry.usage, entry.register, entry.warning, entry.naturalness, comparisonText
    ].filter(Boolean).join(" ")).includes(query);
  });

  results.innerHTML = filtered.map((entry) => {
    const linkedSources = (entry.sources || []).map((id) => sources.find((source) => source.id === id)).filter(Boolean);
    const comparisonMarkup = (entry.comparisons || []).length ? `
      <div class="country-comparisons" aria-label="Country comparisons">
        ${entry.comparisons.map((item) => `<div class="country-item"><strong>${escapeHtml(item.country)}</strong><p>${escapeHtml(item.meaning)} ${item.note ? escapeHtml(item.note) : ""}</p></div>`).join("")}
      </div>` : "";
    return `
      <article class="card">
        <div class="card-top">
          <div>
            <h2 class="term" lang="es">${escapeHtml(entry.spanish)}</h2>
            <div class="term-meta">
              ${entry.level ? `<span class="tag">${escapeHtml(entry.level)}</span>` : ""}
              <span class="tag">${escapeHtml(entry.regionStatus || "Unmarked Spanish")}</span>
            </div>
          </div>
          <button class="speak" type="button" data-speak="${escapeHtml(entry.spanish)}" aria-label="Hear ${escapeHtml(entry.spanish)} in Spanish">
            <span aria-hidden="true">▶</span> Hear Spanish
          </button>
        </div>
        <div class="definitions">
          <div class="translation"><span class="translation-label">US English</span><p>${escapeHtml(entry.usEnglish)}</p></div>
          <div class="translation"><span class="translation-label">UK English</span><p>${escapeHtml(entry.ukEnglish)}</p></div>
        </div>
        ${entry.exampleEs ? `<figure class="example">
          <blockquote lang="es">${escapeHtml(entry.exampleEs)}</blockquote>
          <figcaption>${escapeHtml(entry.exampleUs)}</figcaption>
        </figure>` : ""}
        <p class="usage"><strong>Register:</strong> ${escapeHtml(entry.register)}<br><strong>Intensity:</strong> ${escapeHtml(entry.intensity)}</p>
        ${entry.warning ? `<p class="usage"><strong>Context:</strong> ${escapeHtml(entry.warning)}</p>` : ""}
        ${comparisonMarkup}
        <p class="evidence-note"><strong>Sounds natural in Ecuador?</strong> ${escapeHtml(entry.naturalness)}<br><strong>Evidence:</strong> ${escapeHtml(entry.evidence)}</p>
        ${linkedSources.length ? `<div class="entry-sources" aria-label="Entry sources">${linkedSources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.shortName || source.name)}</a>`).join("")}</div>` : ""}
      </article>
    `;
  }).join("");

  emptyState.hidden = filtered.length > 0;
}

function renderSources() {
  sourceList.innerHTML = sources.map((source) => `
    <article class="source-card">
      <span class="source-kind">${escapeHtml(source.kind)}</span>
      <h3>${escapeHtml(source.name)}</h3>
      <p>${escapeHtml(source.use)}</p>
      <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Open source ↗</a>
    </article>
  `).join("");
}

searchInput.addEventListener("input", render);

results.addEventListener("click", (event) => {
  const button = event.target.closest("[data-speak]");
  if (!button) return;

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    voiceNote.textContent = "Speech playback is not available in this browser. Try a browser with text-to-speech enabled.";
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(button.dataset.speak);
  utterance.lang = "es-EC";
  utterance.rate = Number(rateInput.value);
  utterance.onstart = () => {
    voiceNote.textContent = rateInput.value === "0.72" ? "Playing Spanish slowly." : "Playing Spanish at a natural pace.";
  };
  utterance.onend = () => { voiceNote.textContent = "Tap “Hear Spanish” to listen."; };
  utterance.onerror = () => { voiceNote.textContent = "Speech could not play. Check your device's speech settings."; };
  window.speechSynthesis.speak(utterance);
});

Promise.all([
  fetch("data/vocabulary.json").then((response) => { if (!response.ok) throw new Error(); return response.json(); }),
  fetch("data/sources.json").then((response) => { if (!response.ok) throw new Error(); return response.json(); })
]).then(([vocabulary, sourceData]) => {
  entries = vocabulary;
  sources = sourceData;
  render();
  renderSources();
}).catch(() => {
  voiceNote.textContent = "App data did not load. Serve the folder over HTTP and reload.";
  emptyState.hidden = false;
  sourceList.innerHTML = "<p class='empty-state'>Sources could not be loaded.</p>";
});
