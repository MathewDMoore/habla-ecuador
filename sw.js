const CACHE = "habla-ecuador-v215";
const ASSETS = ["./", "index.html", "translator.html", "styles.css?v=215", "app.js?v=215", "translation-history.js?v=215", "music-workspace.js?v=215", "tutorial.js?v=215", "whatsapp-audio.js?v=215", "music-song.js?v=215", "music-venezuela-captions.js?v=215", "full-text-reader.js?v=215", "persistent-translation-controls.js?v=215", "app-updates.js?v=215", "app-feedback.js?v=215", "interface-es.js?v=215", "interface-language.js?v=215", "regional-practice.js?v=215", "recorded-practice.js?v=215", "quick-lessons.js?v=215", "recorded-transcripts.js?v=215", "captions/beg05d.es.vtt?v=215", "captions/adv06c.es.vtt?v=215", "captions/beg05a.es.vtt?v=215", "captions/beg03c.es.vtt?v=215", "slang-contributions.js?v=215", "screenshot-import.js?v=215", "recording-import.js?v=215", "spanish-context.js?v=215", "language-community-terms.js?v=215", "regional-vocabulary.js?v=215", "bilingual-music.js?v=215", "button-feedback.js?v=215", "english-varieties.js?v=215", "mixed-language-translation.js?v=215", "offline-device.js?v=215", "offline-worker.js?v=215", "document-import.js?v=215", "whole-document.js?v=215", "saved-paper.js?v=215", "research-reference.js?v=215", "manifest.webmanifest", "translator.webmanifest", "app-icon.svg", "app-icon.svg?brand=20261031", "app-icon-180.png?brand=20261031", "app-icon-192.png?brand=20261031", "app-icon-512.png?brand=20261031", "data/learner-entries-v1.json", "data/vocabulary.json", "data/candidate-lexicon.json", "data/sources.json", "data/review-queue.json", "data/ecuador-bolivia-comparisons-v1.json"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("habla-ecuador-v") && key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data?.type !== "OFFLINE_SHELL_STATUS" || !event.ports?.[0]) return;
  event.waitUntil(caches.open(CACHE).then(async cache => {
    const files=await Promise.all(ASSETS.map(path=>cache.match(path)));
    event.ports[0].postMessage({ready:files.every(response=>response?.ok),cache:CACHE});
  }).catch(()=>event.ports[0].postMessage({ready:false})));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  // Release checks must reach the server; an offline cache is not freshness evidence.
  if (new URL(event.request.url).origin === self.location.origin && new URL(event.request.url).pathname.endsWith("/app-version.json")) return;
  const runtimeBase = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/";
  const runtimeUrls = ["transformers.min.js", "ort-wasm-simd.wasm", "ort-wasm.wasm"].map(file => runtimeBase + file);
  if (runtimeUrls.includes(event.request.url)) {
    event.respondWith(caches.open("habla-ecuador-offline-runtime-v1").then(async cache => {
      const hit = await cache.match(event.request);
      if (hit) return hit;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    }));
    return;
  }
  if (new URL(event.request.url).origin !== self.location.origin) return;
  const fallback = () => caches.match(event.request).then(hit => hit || (event.request.mode === "navigate" ? caches.match("./") : undefined));
  event.respondWith(fetch(event.request).then(async response => {
    if (!response.ok) return (await fallback()) || response;
    const copy = response.clone();
    event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(()=>{}));
    return response;
  }).catch(async () => (await fallback()) || Response.error()));
});


