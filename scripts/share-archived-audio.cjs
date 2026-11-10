const {createHash} = require('node:crypto');
const {existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync} = require('node:fs');
const {join, relative, resolve} = require('node:path');

// Run on the Pages staging copy. Keep the repository snapshots self-contained.
const root = resolve(process.argv[2]);
const archives = join(root, 'versions');
const copies = new Map();
let savedBytes = 0;

function shareAudio(directory, appPath) {
  if (!existsSync(directory)) return;
  let source = appPath && readFileSync(appPath, 'utf8');
  const original = source;
  for (const name of readdirSync(directory).sort()) {
    if (!name.endsWith('.mp3')) continue;
    const path = join(directory, name);
    const bytes = readFileSync(path);
    const key = name + ':' + createHash('sha256').update(bytes).digest('hex');
    const canonical = copies.get(key);
    if (!canonical) {
      copies.set(key, path);
      continue;
    }
    const url = 'assets/music/' + name;
    if (!source?.includes('"' + url + '"')) continue;
    const sharedUrl = relative(join(directory, '../..'), canonical);
    source = source.replaceAll('"' + url + '"', '"' + sharedUrl + '"');
    unlinkSync(path);
    savedBytes += bytes.length;
  }
  if (source !== original) writeFileSync(appPath, source);
}

shareAudio(join(root, 'assets/music'));
for (const release of readdirSync(archives, {withFileTypes:true}).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()) {
  const directory = join(archives, release);
  const appPath = join(directory, 'app.js');
  if (existsSync(appPath)) shareAudio(join(directory, 'assets/music'), appPath);
}
console.log('Shared identical archive audio, saving ' + (savedBytes / 1024 / 1024).toFixed(1) + ' MiB.');
