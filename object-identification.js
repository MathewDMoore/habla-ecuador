/* COCO-SSD runs locally. Only object names use the text translation service. */
const HablaObjects = (() => {
  'use strict';
  let modelPromise, classifierPromise, queue = Promise.resolve(), generation = 0;
  let dialog, stage, image, overlay, status, results, fileInput, cameraInput, translate;
  let imageUrl;

  function loadScript(url, ready) {
    if (ready()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => finish(new Error('Download timed out.')), 60000);
      function finish(error) {
        clearTimeout(timer);
        script.onload = script.onerror = null;
        if (error) { script.remove(); reject(error); }
        else resolve();
      }
      script.src = url;
      script.onload = () => finish(ready() ? null : new Error('Model library unavailable.'));
      script.onerror = () => finish(new Error('Model download failed.'));
      document.head.append(script);
    });
  }

  function loadModel() {
    if (!modelPromise) modelPromise = (async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js', () => globalThis.tf);
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js', () => globalThis.cocoSsd);
      await tf.ready();
      return cocoSsd.load({base: 'lite_mobilenet_v2'});
    })().catch(error => { modelPromise = null; throw error; });
    return modelPromise;
  }

  function loadClassifier() {
    if (!classifierPromise) classifierPromise = (async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js', () => globalThis.mobilenet);
      return mobilenet.load({version:2, alpha:1.0});
    })().catch(error => {classifierPromise=null;throw error;});
    return classifierPromise;
  }

  async function classifyPhoto(frame,token,display=true) {
    status.textContent='Checking a broader image model… / Consultando un modelo de imágenes más amplio…';
    const classifier=await loadClassifier();
    if(!current(token))return;
    const job=queue.catch(()=>{}).then(()=>current(token)?classifier.classify(frame,3):[]);queue=job;
    const candidates=await job;if(!current(token))return;
    const best=candidates[0];
    if(!best||best.probability<0.35){
      status.textContent='No reliable match in the available models. This does not mean your photo is unclear; the subject may be unsupported. / Sin coincidencia fiable. El objeto puede no estar incluido en los modelos.';return;
    }
    if(!display)return best;
    return showSubject(best,token);
  }

  async function showSubject(best,token) {
    const name=best.className==="jack-o'-lantern"?"carved pumpkin (jack-o’-lantern)":best.className;
    const row=document.createElement('li');row.textContent=name;results.append(row);
    status.textContent='Suggested subject for the whole photo (no object position). / Tema sugerido para toda la foto (sin ubicación).';
    try {
      const spanish=String(await translate(name,()=>current(token))).trim();
      if(current(token)&&spanish)row.textContent=name+' — '+spanish+' · '+Math.round(best.probability*100)+'%';
    } catch {if(current(token))status.textContent+=' Spanish translation unavailable. / Traducción no disponible.';}
    return best;
  }

  function clear() {
    generation++;
    image.removeAttribute('src');
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = null;
    overlay.replaceChildren();
    results.replaceChildren();
    status.textContent = "Choose or take a photo. / Elige o toma una foto.";
  }

  function current(token) { return generation === token && dialog.open; }

  async function identify(file) {
    clear();
    if (!dialog.open) dialog.showModal();
    const token = generation;
    try {
      HablaScreenshot.validate(file);
      status.textContent = 'Opening image… / Abriendo imagen…';
      imageUrl = URL.createObjectURL(file);
      image.src = imageUrl;
      await image.decode();
      if (!current(token)) return;
      // Bound inference memory for high-resolution phone photos.
      const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
      const frame = document.createElement('canvas');
      frame.width = Math.max(1, Math.round(image.naturalWidth * scale));
      frame.height = Math.max(1, Math.round(image.naturalHeight * scale));
      frame.getContext('2d').drawImage(image, 0, 0, frame.width, frame.height);
      status.textContent = 'Loading object detector. First use needs internet… / Cargando detector. El primer uso necesita internet…';
      const model = await loadModel();
      if (!current(token)) return;
      status.textContent = 'Identifying objects… / Identificando objetos…';
      // Serialize inference when another image replaces one already being read.
      const job = queue.catch(() => {}).then(() => current(token) ? model.detect(frame, 20, 0.6) : []);
      queue = job;
      const predictions = await job;
      if (!current(token)) return;
      // A positive detection can still be wrong; always cross-check the photo.
      let subject;
      try {subject=await classifyPhoto(frame,token,!predictions.length);} catch {
        if(current(token))status.textContent='Broader photo check unavailable. / Comprobación de foto no disponible.';
      }
      if(!current(token)||!predictions.length)return;
      const dominant=predictions.find(p=>p.bbox[2]*p.bbox[3]>frame.width*frame.height*0.5);
      if(subject?.probability>=0.6&&dominant&&!subject.className.toLowerCase().includes(dominant.class.toLowerCase())) {
        await showSubject(subject,token);
        if(!current(token))return;
        status.textContent='Models disagree: the detector suggests '+dominant.class+'. The whole-photo suggestion above is unconfirmed; no disputed box is shown. / Los modelos discrepan. La sugerencia de la foto no está confirmada; se oculta el recuadro en disputa.';
        return;
      }
      const labels = new Map();
      for (const prediction of predictions) {
        const {score, bbox: [x, y, width, height]} = prediction;
        const name = prediction.class === "mouse" ? "computer mouse" : prediction.class;
        const box = document.createElement('div');
        box.className = 'object-detection-box';
        Object.assign(box.style, {
          left: x / frame.width * 100 + '%', top: y / frame.height * 100 + '%',
          width: width / frame.width * 100 + '%', height: height / frame.height * 100 + '%'
        });
        const caption = document.createElement('span');
        caption.textContent = name + ' · ' + Math.round(score * 100) + '%';
        box.append(caption);
        overlay.append(box);
        if (!labels.has(name)) labels.set(name, []);
        labels.get(name).push(caption);
      }
      status.textContent = 'Objects detected. Translating names… / Traduciendo nombres…';
      let failed = false;
      for (const [name, captions] of labels) {
        if (!current(token)) return;
        const row = document.createElement('li');
        row.textContent = name;
        results.append(row);
        try {
          const spanish = String(await translate(name, () => current(token))).trim();
          if (!current(token)) return;
          if (!spanish) throw new Error('Empty translation');
          row.textContent = name + ' — ' + spanish;
          for (const caption of captions) caption.textContent = row.textContent + ' · ' + caption.textContent.split(' · ').pop();
        } catch {
          if (!current(token)) return;
          failed = true;
          row.textContent = name + ' · Spanish unavailable / Español no disponible';
        }
      }
      status.textContent = failed
        ? 'Detection complete. Some names could not be translated. / Algunas traducciones no están disponibles.'
        : !subject ? 'Detector suggestions only. The broader photo check is unconfirmed. / Sugerencias del detector; la comprobación de la foto no está confirmada.'
        : 'Detection complete. Check the suggested labels. / Revisa las etiquetas sugeridas.';
    } catch (error) {
      if (current(token)) status.textContent = 'Could not identify this image. Try again with a JPEG or PNG and an internet connection. / Reintenta con JPEG o PNG y conexión a internet. ' + error.message;
    }
  }

  function bind(options) {
    const button = document.querySelector('#quick-identify-objects');
    if (!button) return;
    translate = options.translate;
    dialog = document.createElement('dialog');
    dialog.className = 'photo-translator object-identifier';
    dialog.setAttribute('aria-labelledby', 'object-identifier-title');
    dialog.innerHTML = `<div class="photo-translator-toolbar"><h2 id="object-identifier-title">Identify objects / Identificar objetos</h2><button type="button" data-objects-close>Close / Cerrar</button></div>
      <div class="photo-translator-controls"><button type="button" data-objects-camera>Take photo / Tomar foto</button><button type="button" data-objects-choose>Choose image / Elegir imagen</button><button type="button" data-objects-paste>Paste image / Pegar imagen</button></div>
      <p class="photo-translator-note">Locates 80 common object categories and cross-checks every photo with a broader classifier. Conflicting suggestions remain unconfirmed. Labels are suggestions; percentages are model scores. Images are processed on this device. First use downloads the detector. Online translation sends object names. / Localiza 80 categorías y comprueba cada foto con un clasificador más amplio. Las discrepancias quedan sin confirmar. Las etiquetas son sugerencias. Las imágenes se procesan en este dispositivo; la traducción en línea envía los nombres.</p>
      <p data-objects-status role="status" aria-live="polite">Choose or take a photo. / Elige o toma una foto.</p>
      <div class="object-image-stage"><img alt="Image to identify / Imagen para identificar"><div class="object-detection-overlay"></div></div>
      <ul data-objects-results aria-label="Detected objects / Objetos detectados"></ul>
      <input type="file" data-objects-file accept="image/*,.heic,.heif" hidden>
      <input type="file" data-objects-camera-file accept="image/*" capture="environment" hidden>`;
    document.body.append(dialog);
    stage = dialog.querySelector('.object-image-stage');
    image = stage.querySelector('img');
    overlay = stage.querySelector('.object-detection-overlay');
    status = dialog.querySelector('[data-objects-status]');
    results = dialog.querySelector('[data-objects-results]');
    fileInput = dialog.querySelector('[data-objects-file]');
    cameraInput = dialog.querySelector('[data-objects-camera-file]');
    for (const input of [fileInput, cameraInput]) input.addEventListener('change', () => {
      const file = input.files?.[0]; input.value = '';
      if (file) identify(file);
    });
    button.addEventListener('click', () => {const task=document.querySelector('#image-task');if(task)task.value='objects';dialog.showModal();});
    dialog.querySelector('[data-objects-choose]').addEventListener('click', () => fileInput.click());
    dialog.querySelector('[data-objects-camera]').addEventListener('click', () => cameraInput.click());
    dialog.querySelector('[data-objects-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', clear);
    dialog.addEventListener('paste', event => {
      const file = HablaScreenshot.imageFromClipboard(event.clipboardData);
      if (file) { event.preventDefault(); identify(file); }
    });
    dialog.querySelector('[data-objects-paste]').addEventListener('click', async () => {
      const token = generation;
      try {
        const items = await navigator.clipboard.read();
        if (!current(token)) return;
        for (const item of items) {
          const type = item.types.find(type => type.startsWith('image/'));
          if (type) { const blob = await item.getType(type); if (current(token)) identify(blob); return; }
        }
        status.textContent = 'Copy an image first, or choose one from Photos. / Copia una imagen o elígela de Fotos.';
      } catch {
        if (current(token)) status.textContent = 'Choose image to open Photos. / Pulsa Elegir imagen para abrir Fotos.';
      }
    });
    window.addEventListener('pagehide', () => { if (dialog.open) dialog.close(); });
  }
  return {bind, open:identify};
})();
