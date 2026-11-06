const CACHE = "habla-ecuador-v208";
const ASSETS = ["./", "index.html", "translator.html", "styles.css?v=208", "app.js?v=208", "translation-history.js?v=208", "music-workspace.js?v=208", "tutorial.js?v=208", "whatsapp-audio.js?v=208", "music-song.js?v=208", "music-venezuela-captions.js?v=208", "full-text-reader.js?v=208", "persistent-translation-controls.js?v=208", "app-updates.js?v=208", "app-feedback.js?v=208", "interface-es.js?v=208", "interface-language.js?v=208", "regional-practice.js?v=208", "recorded-practice.js?v=208", "quick-lessons.js?v=208", "recorded-transcripts.js?v=208", "captions/beg05d.es.vtt?v=208", "captions/adv06c.es.vtt?v=208", "captions/beg05a.es.vtt?v=208", "captions/beg03c.es.vtt?v=208", "slang-contributions.js?v=208", "screenshot-import.js?v=208", "recording-import.js?v=208", "spanish-context.js?v=208", "language-community-terms.js?v=208", "regional-vocabulary.js?v=208", "bilingual-music.js?v=208", "button-feedback.js?v=208", "english-varieties.js?v=208", "mixed-language-translation.js?v=208", "offline-device.js?v=208", "offline-worker.js?v=208", "document-import.js?v=208", "whole-document.js?v=208", "saved-paper.js?v=208", "research-reference.js?v=208", "manifest.webmanifest", "translator.webmanifest", "app-icon.svg", "app-icon.svg?brand=20261031", "app-icon-180.png?brand=20261031", "app-icon-192.png?brand=20261031", "app-icon-512.png?brand=20261031", "data/learner-entries-v1.json", "data/vocabulary.json", "data/candidate-lexicon.json", "data/sources.json", "data/review-queue.json", "data/ecuador-bolivia-comparisons-v1.json"];

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


