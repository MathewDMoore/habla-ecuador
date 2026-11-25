/* Source links are checked by an independent research workflow, never by 
   forcing a learner to finish an optional lesson. Links alone do not establish
   transcripts, regional usage, translation, or reuse rights. */
(() => {
  "use strict";
  const entries = [
    {
      id: "bbc-mundo-20261124-5AKmIi8bODxJ9uB9b",
      label: "📰 BBC News Mundo · Lectura",
      description: "Shared Spanish-language news source. Headline and content not yet verified; source checks happen separately. You do not need to complete a lesson.",
      href: "https://share.google/5AKmIi8bODxJ9uB9b",
      action: "Open original / Abrir fuente",
      state: "Source unresolved · Pendiente de verificación"
    },
    {
      id: "youtube-xko8gAlNZqY",
      label: "▶ YouTube · Video compartido",
      description: "User-shared video. Title, accents and captions await independent checks. Watch in Habla if you want; completing a lesson is never required.",
      href: "index.html?start=music&video=" + encodeURIComponent("https://youtu.be/xko8gAlNZqY"),
      action: "Watch in Habla / Ver en Habla",
      state: "Metadata unverified · Pendiente de revisión"
    }
  ];

  function render() {
    const host = document.getElementById("habla-learning-inbox");
    if (!host || host.dataset.ready === "true") return;
    host.dataset.ready = "true";
    const list = document.createElement("ul");
    list.className = "habla-learning-inbox-list";
    entries.forEach(entry => {
      const item = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = entry.label;
      const status = document.createElement("small");
      status.textContent = entry.state;
      const description = document.createElement("p");
      description.textContent = entry.description;
      const link = document.createElement("a");
      link.href = entry.href;
      link.textContent = entry.action;
      if (entry.href.startsWith("https://")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      item.append(name, status, description, link);
      list.appendChild(item);
    });
    host.append(list);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, {once:true});
  } else render();
})();
