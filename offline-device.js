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
  let ready = false, enabled = false, worker, serial = 0, installing = false, validating = null;
  const pending = new Map();
  const fail = (code, message) => Object.assign(new Error(message), {code});
  function supportProblem() {
    if (!navigator.serviceWorker) return "This installed app or browser needs an offline-support update. Offline mode is unavailable here; your text will not be sent online while on-device mode is selected.";
    if (!globalThis.caches || typeof Worker === "undefined" || typeof WebAssembly === "undefined") return "This device does not provide the storage or engine needed for this offline pack.";
    return "";
  }
  function deadline(promise, ms, message) {
    let timer;
    return Promise.race([promise, new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms);})]).finally(()=>clearTimeout(timer));
  }
  async function controllingWorker() {
    if (!navigator.serviceWorker) throw new Error(supportProblem());
    await deadline(navigator.serviceWorker.ready,15000,"Offline setup has not finished. Reload while connected, then retry.");
    if (navigator.serviceWorker.controller) return navigator.serviceWorker.controller;
    let changed;
    try {
      await deadline(new Promise(resolve=> {
        changed=()=> { if(navigator.serviceWorker.controller) resolve(); };
        navigator.serviceWorker.addEventListener("controllerchange",changed);
        changed();
      }),5000,"Reload this page, then download or validate the pack.");
    } finally {navigator.serviceWorker.removeEventListener("controllerchange",changed);}
    return navigator.serviceWorker.controller;
  }
  async function checkShell(controller) {
    const channel=new MessageChannel();
    try {
      return await deadline(new Promise((resolve,reject)=> {
        channel.port1.onmessage=({data})=>data?.ready ? resolve(true) : reject(new Error("App files or dictionary data are incomplete. Reload while connected and retry."));
        controller.postMessage({type:"OFFLINE_SHELL_STATUS"},[channel.port2]);
      }),8000,"The app cache needs an update. Reload while connected and retry.");
    } finally {channel.port1.close();channel.port2.close();}
  }
  function updateModeBadge() {
    const badge = document.querySelector("#translation-engine-badge");
    if (badge) badge.textContent = shouldUse() ? (ready ? "On device · validated" : supportProblem() ? "On-device unavailable" : validating ? "Validating offline pack" : "On-device pack needed") : navigator.onLine === false ? "Offline" : "Online service";
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
      worker = new Worker("offline-worker.js?v=140");
      worker.onmessage = ({data}) => {
        if (data.type === "progress") { status(data.message); return; }
        const request = pending.get(data.id);
        if (!request) return;
        pending.delete(data.id);
        clearTimeout(request.timer);
        if (data.error) request.reject(fail("offline_engine", data.error));
        else request.resolve(data.result);
      };
      worker.onerror = () => {
        for (const request of pending.values()) { clearTimeout(request.timer); request.reject(fail("offline_engine", "The on-device engine could not start.")); }
        ready = false;
        pending.clear(); worker.terminate(); worker = null;
        status("On-device engine stopped. Validate the pack again before translating. Your text was not sent online.");
      };
    }
    const id = ++serial;
    return new Promise((resolve, reject) => {
      const timer=setTimeout(()=> {
        for (const request of pending.values()) {clearTimeout(request.timer);request.reject(fail("offline_engine","The on-device engine timed out. Your text is kept; retry or reload."));}
        pending.clear();worker?.terminate();worker=null;ready=false;
        status("On-device engine timed out. Validate the pack again; your text is kept and was not sent online.");
      },type === "install" ? 600000 : 180000);
      pending.set(id, {resolve, reject, timer});
      try {worker.postMessage({id, type, ...payload});}
      catch(error){clearTimeout(timer);pending.delete(id);reject(fail("offline_engine",error.message));}
    });
  }
  async function validate(controller) {
    if (validating) return validating;
    ready=false;
    validating=(async()=> {
      status("Validating downloaded files, app cache and both translation directions… No user text is used.");
      if (!await checkPack()) throw new Error("The pack is incomplete. Connect and tap Download offline pack.");
      await checkShell(controller || await controllingWorker());
      const result=await call("validate");
      if (result?.directions !== 2) throw new Error("Both translation directions could not be validated.");
      ready=true;
      status("Offline pack validated in both directions. App and dictionary files are cached. New typed text can stay on this device. Confirm offline reopening once in airplane mode.");
    })().finally(()=> {validating=null;});
    updateModeBadge();
    return validating;
  }
  async function install() {
    if (installing) return;
    installing = true;
    const button = document.querySelector("#offline-download");
    button.disabled = true;
    try {
      const problem=supportProblem();
      if (problem) throw new Error(problem);
      const controller=await controllingWorker();
      if (!await checkPack()) {
        if (navigator.onLine === false) throw new Error("Connect to download the pack first.");
        const cache = await caches.open(RUNTIME_CACHE);
        for (const url of RUNTIME) {
          if ((await cache.match(url))?.ok) continue;
          status("Downloading the offline engine… Keep this page open.");
          const response = await fetch(url);
          if (!response.ok) throw new Error("The engine download failed. Retry when connected.");
          await cache.put(url, response);
        }
        await call("install");
      }
      await validate(controller);
      enabled = true;
      try { localStorage.setItem("habla-ecuador-offline-enabled-v1", "yes"); } catch {}
      document.querySelector("#offline-use").checked = true;
      try {await navigator.storage?.persist?.();} catch {}
    } catch (error) {
      ready=false;
      status(`Offline pack not ready. ${error.message || "Download interrupted; retry to continue."}`);
    } finally { installing = false; button.disabled = Boolean(supportProblem()); button.textContent = ready ? "Validate offline pack" : "Download / validate offline pack"; }
  }
  function shouldUse() { return enabled || (ready && navigator.onLine === false); }
  async function translate(text, way) {
    if (validating) await validating;
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
    const problem=supportProblem();
    if (problem) {button.disabled=true;status(problem);return;}
    let downloaded=false;
    try {downloaded=await checkPack();} catch {}
    if (downloaded) {
      button.textContent="Validate offline pack";
      if(enabled) {
        button.disabled=true;
        try {await validate();} catch(error){status(`Offline pack not ready. ${error.message}`);}
        finally {button.disabled=false;}
      } else status("Pack files downloaded. Tap Validate offline pack to check both directions and offline app files.");
    } else if (enabled) status("On-device mode requested, but the pack is incomplete. Download and validate it first. Your text will not be sent online in this mode.");
  }
  return {get busy(){return installing || Boolean(validating) || pending.size > 0;}, bind, shouldUse, translate, checkPack, RUNTIME, RUNTIME_CACHE, MODEL_CACHE, MODELS, FILES};
})();
