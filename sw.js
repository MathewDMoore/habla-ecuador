const CACHE = "habla-ecuador-v272";
const ASSETS = ["grammar-reference.css?v=267", "grammar-reference.js?v=267", "./", "index.html", "translator.html", "styles.css?v=268", "app.js?v=272", "swipe-navigation.js?v=249", "translation-history.js?v=218", "music-workspace.js?v=218", "youtube-shared-player.js?v=264", "shared-learning-links.js?v=266", "data/shared-learning-links.json", "tutorial.js?v=267", "whatsapp-audio.js?v=218", "music-song.js?v=218", "music-venezuela-captions.js?v=267", "full-text-reader.js?v=263", "persistent-translation-controls.js?v=218", "app-updates.js?v=235", "app-feedback.js?v=267", "interface-es.js?v=267", "interface-language.js?v=218", "regional-practice.js?v=218", "recorded-practice.js?v=218", "quick-lessons.js?v=267", "recorded-transcripts.js?v=218", "captions/beg05d.es.vtt?v=218", "captions/adv06c.es.vtt?v=218", "captions/beg05a.es.vtt?v=218", "captions/beg03c.es.vtt?v=218", "slang-contributions.js?v=218", "object-identification.js?v=271", "photo-translation.js?v=271", "live-camera-translation.js?v=267", "screenshot-import.js?v=272", "recording-import.js?v=223", "spanish-context.js?v=267", "language-community-terms.js?v=218", "regional-vocabulary.js?v=253", "bilingual-music.js?v=218", "button-feedback.js?v=218", "english-varieties.js?v=218", "mixed-language-translation.js?v=218", "offline-device.js?v=267", "offline-worker.js?v=267", "document-import.js?v=218", "whole-document.js?v=267", "saved-paper.js?v=218", "research-reference.js?v=218", "manifest.webmanifest", "translator.webmanifest", "app-icon.svg", "app-icon.svg?brand=20261031", "app-icon-180.png?brand=20261031", "app-icon-192.png?brand=20261031", "app-icon-512.png?brand=20261031", "data/learner-entries-v1.json", "data/vocabulary.json", "data/candidate-lexicon.json", "data/sources.json", "data/review-queue.json", "data/ecuador-bolivia-comparisons-v1.json"];

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


