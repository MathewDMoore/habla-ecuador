const searchInput = document.querySelector("#search");
const rateInput = document.querySelector("#voice-rate");
const results = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const voiceNote = document.querySelector("#voice-note");

let entries = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function render() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filtered = entries.filter((entry) => [
    entry.spanish, entry.usEnglish, entry.ukEnglish, entry.exampleEs, entry.exampleUs, entry.usage
  ].filter(Boolean).join(" ").toLocaleLowerCase().includes(query));

  results.innerHTML = filtered.map((entry) => `
    <article class="card">
      <div class="card-top">
        <div>
          <h2 class="term" lang="es">${escapeHtml(entry.spanish)}</h2>
          <div class="term-meta">
            <span class="tag">${escapeHtml(entry.level)}</span>
            <span class="tag">${escapeHtml(entry.region)}</span>
            <span class="source">${escapeHtml(entry.source)}</span>
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
      <p class="usage">${escapeHtml(entry.usage)}</p>
    </article>
  `).join("");

  emptyState.hidden = filtered.length > 0;
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

fetch("data/vocabulary.json")
  .then((response) => {
    if (!response.ok) throw new Error("Vocabulary could not be loaded.");
    return response.json();
  })
  .then((data) => {
    entries = data;
    render();
  })
  .catch(() => {
    voiceNote.textContent = "The vocabulary file did not load. Serve the folder over HTTP and reload.";
    emptyState.hidden = false;
  });
