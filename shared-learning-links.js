/* Source links are checked by an independent research workflow, never by 
   forcing a learner to finish an optional lesson. Links alone do not establish
   transcripts, regional usage, translation, or reuse rights. */
(() => {
  "use strict";
  const entries = [
    {
      id: "bbc-mundo-20261124-5AKmIi8bODxJ9uB9b",
      label: "▶ Video compartido como BBC News Mundo",
      description: "The Google share link was independently found to redirect to YouTube, not a news article. Video title, creator and spoken content are still unverified. No lesson is required.",
      href: "index.html?start=music&video=" + encodeURIComponent("https://www.youtube.com/watch?v=Z2YJDI4B-gw&t=29"),
      action: "Watch in Habla / Ver en Habla",
      state: "Redirect confirmed · Video metadata pending"
    },
    {
      id: "youtube-xko8gAlNZqY",
      label: "▶ La Paz, Bolivia · Before You Go",
      description: "YouTube title and channel verified by independent public metadata. Actual speech, captions, cultural claims and regional language remain unreviewed. Watching or completing lessons is optional.",
      href: "index.html?start=music&video=" + encodeURIComponent("https://youtu.be/xko8gAlNZqY"),
      action: "Watch in Habla / Ver en Habla",
      state: "Public metadata verified · Spoken content unreviewed"
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
