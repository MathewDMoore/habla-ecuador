/* The downloaded pack contains public model files, never document text. */
const HablaOffline = (() => {
  const RUNTIME_CACHE = "habla-ecuador-offline-runtime-v1";
  const MODEL_CACHE = "habla-ecuador-offline-models-v1";
  const BASE = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/";
  const RUNTIME = [BASE + "transformers.min.js", BASE + "ort-wasm-simd.wasm", BASE + "ort-wasm.wasm"];
  const MODELS = {
    "en-ec": {id:"Xenova/opus-mt-en-es", revision:"4b002a4c7edd54a7ced58877258b87f7efd3f892"},
    "ec-en": {id:"Xenova/opus-mt-es-en", revision:"eadfd7c658a9d8929ac3b8e996b68a68e2c7d480"}
  };
  const FILES = ["config.json", "tokenizer.json", "tokenizer_config.json", "onnx/encoder_model_quantized.onnx", "onnx/decoder_model_merged_quantized.onnx"];
  let ready = false, enabled = false, worker, serial = 0, installing = false;
  const pending = new Map();
  const fail = (code, message) => Object.assign(new Error(message), {code});
  function updateModeBadge() {
    const badge = document.querySelector("#translation-engine-badge");
    if (badge) badge.textContent = shouldUse() ? (ready ? "On device" : "On-device pack needed") : navigator.onLine === false ? "Offline" : "Online service";
  }
  const status = text => { const node = document.querySelector("#offline-status"); if (node) node.textContent = text; updateModeBadge(); };
  async function checkPack() {
    if (!globalThis.caches) return false;
    const runtime = await caches.open(RUNTIME_CACHE), models = await caches.open(MODEL_CACHE);
    const urls = Object.values(MODELS).flatMap(model => FILES.map(file => `https://huggingface.co/${model.id}/resolve/${model.revision}/${file}`));
    const responses = await Promise.all([...RUNTIME.map(url => runtime.match(url)), ...urls.map(url => models.match(url))]);
    return responses.every(response => response?.ok);
  }
  function call(type, payload = {}) {
    if (!worker) {
      worker = new Worker("offline-worker.js?v=74");
      worker.onmessage = ({data}) => {
        if (data.type === "progress") { status(data.message); return; }
        const request = pending.get(data.id);
        if (!request) return;
        pending.delete(data.id);
        if (data.error) request.reject(fail("offline_engine", data.error));
        else request.resolve(data.result);
      };
      worker.onerror = () => {
        for (const request of pending.values()) request.reject(fail("offline_engine", "The on-device engine could not start."));
        pending.clear(); worker.terminate(); worker = null;
      };
    }
    const id = ++serial;
    return new Promise((resolve, reject) => { pending.set(id, {resolve, reject}); worker.postMessage({id, type, ...payload}); });
  }
  async function install() {
    if (installing) return;
    installing = true;
    const button = document.querySelector("#offline-download");
    button.disabled = true;
    try {
      ready = await checkPack();
      if (ready) {
        status("Offline pack ready. Select Use on-device translation to keep new text here.");
        return;
      }
      if (!navigator.onLine) throw new Error("Connect to download the pack first.");
      if (!navigator.serviceWorker) throw new Error("This browser does not support the offline pack.");
      await navigator.serviceWorker.ready;
      // Ensure the current worker controls the page before remote module imports.
      if (!navigator.serviceWorker.controller) throw new Error("Reload this page, then download the pack.");
      const cache = await caches.open(RUNTIME_CACHE);
      for (const url of RUNTIME) {
        if ((await cache.match(url))?.ok) continue;
        status("Downloading the offline engine… Keep this page open.");
        const response = await fetch(url);
        if (!response.ok) throw new Error("The engine download failed. Retry when connected.");
        await cache.put(url, response);
      }
      await call("install");
      ready = await checkPack();
      if (!ready) throw new Error("The pack is incomplete. Tap Download to continue.");
      enabled = true;
      try { localStorage.setItem("habla-ecuador-offline-enabled-v1", "yes"); } catch {}
      document.querySelector("#offline-use").checked = true;
      status("Offline pack ready. New Spanish ↔ English text stays on this device. First translation may take a moment.");
    } catch (error) {
      status(`Offline pack not ready. ${error.message || "Download interrupted; retry to continue."}`);
    } finally { installing = false; button.disabled = false; button.textContent = ready ? "Check offline pack" : "Download offline pack"; }
  }
  function shouldUse() { return enabled || (ready && navigator.onLine === false); }
  async function translate(text, way) {
    if (!ready) throw fail("offline_pack", "Download the offline pack while connected first.");
    return call("translate", {text, way});
  }
  async function bind() {
    const button = document.querySelector("#offline-download"), checkbox = document.querySelector("#offline-use");
    if (!button || !checkbox) return;
    button.addEventListener("click", install);
    try { enabled = localStorage.getItem("habla-ecuador-offline-enabled-v1") === "yes"; } catch {}
    checkbox.checked = enabled;
    updateModeBadge();
    globalThis.addEventListener?.("online",updateModeBadge);
    globalThis.addEventListener?.("offline",updateModeBadge);
    checkbox.addEventListener("change", () => {
      enabled = checkbox.checked;
      try { localStorage.setItem("habla-ecuador-offline-enabled-v1", enabled ? "yes" : "no"); } catch {}
      status(enabled ? (ready ? "On-device translation selected. New text stays on this device." : "Download the pack first. No text will be sent to the online service in this mode.") : "Online service selected. Downloaded models remain available offline.");
    });
    try { ready = await checkPack(); } catch { ready = false; }
    if (ready) { button.textContent = "Check offline pack"; status("Offline pack ready. New Spanish ↔ English text can be translated on this device."); }
    else if (enabled) status("The offline pack is missing or incomplete. Connect and download it again.");
  }
  return {bind, shouldUse, translate, checkPack, RUNTIME, RUNTIME_CACHE, MODEL_CACHE, MODELS, FILES};
})();
