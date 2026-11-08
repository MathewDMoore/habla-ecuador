const CACHE = "habla-ecuador-v214";
const ASSETS = ["./", "index.html", "translator.html", "styles.css?v=214", "app.js?v=214", "translation-history.js?v=214", "music-workspace.js?v=214", "tutorial.js?v=214", "whatsapp-audio.js?v=214", "music-song.js?v=214", "music-venezuela-captions.js?v=214", "full-text-reader.js?v=214", "persistent-translation-controls.js?v=214", "app-updates.js?v=214", "app-feedback.js?v=214", "interface-es.js?v=214", "interface-language.js?v=214", "regional-practice.js?v=214", "recorded-practice.js?v=214", "quick-lessons.js?v=214", "recorded-transcripts.js?v=214", "captions/beg05d.es.vtt?v=214", "captions/adv06c.es.vtt?v=214", "captions/beg05a.es.vtt?v=214", "captions/beg03c.es.vtt?v=214", "slang-contributions.js?v=214", "screenshot-import.js?v=214", "recording-import.js?v=214", "spanish-context.js?v=214", "language-community-terms.js?v=214", "regional-vocabulary.js?v=214", "bilingual-music.js?v=214", "button-feedback.js?v=214", "english-varieties.js?v=214", "mixed-language-translation.js?v=214", "offline-device.js?v=214", "offline-worker.js?v=214", "document-import.js?v=214", "whole-document.js?v=214", "saved-paper.js?v=214", "research-reference.js?v=214", "manifest.webmanifest", "translator.webmanifest", "app-icon.svg", "app-icon.svg?brand=20261031", "app-icon-180.png?brand=20261031", "app-icon-192.png?brand=20261031", "app-icon-512.png?brand=20261031", "data/learner-entries-v1.json", "data/vocabulary.json", "data/candidate-lexicon.json", "data/sources.json", "data/review-queue.json", "data/ecuador-bolivia-comparisons-v1.json"];

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


