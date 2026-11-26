// Operates only on an exported candidate copy inside the deployment artifact.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(path.join(root, 'app.js'))) throw Error('Provide the exported preview directory.');
const {build} = JSON.parse(fs.readFileSync(path.join(root, 'app-version.json'),'utf8'));
const bootstrap = `(() => {
  const prefix = 'habla-preview-integration:';
  for (const name of ['localStorage','sessionStorage']) {
    const storage = window[name];
    const keys = () => Array.from({length:storage.length}, (_,i)=>storage.key(i)).filter(key=>key.startsWith(prefix));
    const isolated = {
      getItem:key=>storage.getItem(prefix+key),
      setItem:(key,value)=>storage.setItem(prefix+key,value),
      removeItem:key=>storage.removeItem(prefix+key),
      clear:()=>keys().forEach(key=>storage.removeItem(key)),
      key:index=>keys()[index]?.slice(prefix.length) ?? null,
      get length(){return keys().length;}
    };
    Object.defineProperty(window,name,{value:isolated});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const banner=document.createElement('aside');
    banner.setAttribute('aria-label','Preview version / Versión de prueba');
    banner.style.cssText='padding:10px;background:#ffe8a3;color:#173f35;text-align:center;font:16px system-ui';
    banner.innerHTML='Preview / Prueba · Build ${build} · <a href="../../">Open current app / Abrir app actual</a>';
    document.body.prepend(banner);
  });
})();\n`;
fs.writeFileSync(path.join(root, 'preview-session.js'), bootstrap);
for (const name of ['index.html','translator.html']) {
  const file = path.join(root, name);
  const html = fs.readFileSync(file,'utf8').replace('<head>','<head>\n  <script src="preview-session.js"></script>');
  fs.writeFileSync(file, html);
}
for (const name of ['sw.js','offline-device.js','offline-worker.js']) {
  const file = path.join(root, name);
  let code = fs.readFileSync(file,'utf8').replaceAll('habla-ecuador-', 'habla-preview-integration-');
  if (name === 'sw.js') code = code.replace('const ASSETS = [','const ASSETS = ["preview-session.js", ')
    .replace('caches.match(event.request)', 'caches.open(CACHE).then(cache=>cache.match(event.request))')
    .replace('caches.match("./")', 'caches.open(CACHE).then(cache=>cache.match("./"))');
  fs.writeFileSync(file, code);
}
for (const name of ['manifest.webmanifest','translator.webmanifest']) {
  const file=path.join(root,name), manifest=JSON.parse(fs.readFileSync(file,'utf8'));
  manifest.name='Habla Preview';manifest.short_name='Habla Preview';manifest.id='./preview-'+name;
  fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
}
