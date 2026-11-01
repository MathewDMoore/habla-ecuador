// Render every Home Screen surface from the approved editable brand artwork.
// Requires sharp. The Work runtime's shared dependency path is also supported.
const path = require('node:path');
const fs = require('node:fs/promises');
const sharp = require(require.resolve('sharp', {
  paths: [process.cwd(), process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)
}));
const root = path.resolve(__dirname, '..');
const outputs = [
  [1024, 'ios/HablaEcuador/Assets.xcassets/AppIcon.appiconset/icon-1024.png'],
  [256, 'ios/HablaEcuadorWidget/Assets.xcassets/HablaBrand.imageset/habla-brand.png'],
  ...[180, 192, 512].map(size => [size, `app-icon-${size}.png`])
];
(async () => {
  for (const [size, file] of outputs) {
    const dest = path.join(root, file);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await sharp(path.join(root, 'app-icon.svg'), { density: 192 })
      .resize(size, size).flatten({ background: '#68d2c5' }).removeAlpha().png().toFile(dest);
    console.log(`${file}: ${size} × ${size}`);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
