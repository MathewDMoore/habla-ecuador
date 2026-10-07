/* Quantized Marian/OPUS models. Only pack installation allows model downloads. */
const MODELS = {
  "en-ec": {id:"Xenova/opus-mt-en-es", revision:"4b002a4c7edd54a7ced58877258b87f7efd3f892"},
  "ec-en": {id:"Xenova/opus-mt-es-en", revision:"eadfd7c658a9d8929ac3b8e996b68a68e2c7d480"}
};
const BASE = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/";
let runtime, active, activeWay, queue = Promise.resolve();
async function load(way, installing = false) {
  if (!MODELS[way]) throw new Error("Unsupported translation direction.");
  if (!runtime) {
    runtime = await import(BASE + "transformers.min.js");
    runtime.env.allowLocalModels = false;
    runtime.env.useBrowserCache = false;
    runtime.env.useCustomCache = true;
    const modelCache = await caches.open("habla-ecuador-offline-models-v1");
    runtime.env.customCache = {
      match: async url => {
        const hit = await modelCache.match(url);
        if (hit) return hit;
        // Missing optional files return a local 404, without probing /models over HTTP.
        if (!runtime.env.allowRemoteModels && String(url).startsWith("https://huggingface.co/")) return new Response(null, {status:404});
        return undefined;
      },
      put: (url, response) => modelCache.put(url, response)
    };
    runtime.env.backends.onnx.wasm.numThreads = 1;
    runtime.env.backends.onnx.wasm.proxy = false;
    runtime.env.backends.onnx.wasm.wasmPaths = BASE;
  }
  // v2 requires allowLocalModels with local_files_only, even for browser cache.
  runtime.env.allowLocalModels = !installing;
  runtime.env.allowRemoteModels = installing;
  if (activeWay === way) return active;
  if (active) { await active.dispose(); active = null; activeWay = null; }
  const model = MODELS[way];
  active = await runtime.pipeline("translation", model.id, {
    quantized:true, revision:model.revision, local_files_only:!installing,
    progress_callback: installing ? progress => {
      if (progress.status === "progress") self.postMessage({type:"progress", message:`Downloading ${way === "ec-en" ? "Spanish → English" : "English → Spanish"}: ${progress.file.split("/").pop()} ${Math.round(progress.progress || 0)}%. Keep this page open.`});
    } : undefined
  });
  activeWay = way;
  return active;
}
async function handle(message) {
  if (message.type === "install") {
    for (const way of Object.keys(MODELS)) await load(way, true);
    runtime.env.allowRemoteModels = false;
    return true;
  }
  if (message.type !== "translate") throw new Error("Unknown offline request.");
  const engine = await load(message.way);
  const tokens = await engine.tokenizer(message.text);
  if (tokens.input_ids.dims.at(-1) > 500) throw new Error("This segment is too long for the offline model. Shorten the section and retry.");
  const output = await engine(message.text, {max_new_tokens:512, num_beams:1});
  const result = output[0]?.translation_text;
  if (typeof result !== "string" || !result.trim()) throw new Error("The on-device model returned no translation.");
  const translatedTokens = await engine.tokenizer(result);
  if (translatedTokens.input_ids.dims.at(-1) >= 510) throw new Error("The offline model reached its output limit. Shorten the section and retry.");
  return result;
}
self.onmessage = ({data}) => {
  queue = queue.then(async () => {
    try { self.postMessage({id:data.id, result:await handle(data)}); }
    catch (error) { self.postMessage({id:data.id, error:error.message || "On-device translation failed."}); }
  });
};
