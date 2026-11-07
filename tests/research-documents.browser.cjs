// Synthetic papers and a stub translation service exercise the real import UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const playwright = require(process.env.HABLA_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const origin = 'https://mathewdmoore.github.io';

async function checkPaper(browser, {file, width, ui, native}) {
  const context = await browser.newContext({
    viewport: {width, height: 844}, isMobile: true, hasTouch: true,
    serviceWorkers: 'block', acceptDownloads: true
  });
  const page = await context.newPage();
  const errors = [], requests = [];
  let failAt = 3;
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'api.mymemory.translated.net') {
      requests.push(url.searchParams.get('q'));
      const payload = requests.length === failAt
        ? {responseStatus: 403, quotaFinished: true, responseDetails: 'daily quota exceeded'}
        : {responseStatus: 200, responseData: {translatedText: 'Draft ' + url.searchParams.get('q')}};
      return route.fulfill({json: payload});
    }
    const local = path.resolve(root, url.pathname.replace('/habla-ecuador/', ''));
    if (url.origin === origin && local.startsWith(root + path.sep)
      && fs.existsSync(local) && fs.statSync(local).isFile()) return route.fulfill({path: local});
    return route.abort();
  });
  await page.addInitScript(() => localStorage.setItem('habla-tutorial-seen-v2', '1'));
  if (native) {
    await page.addInitScript(() => {
      window.webkit = {messageHandlers: {hablaSpeech: {postMessage() {}}}};
    });
    await page.addInitScript({path: path.join(root, 'ios/HablaEcuador/NativeSpeech.js')});
  }
  await page.goto(`${origin}/habla-ecuador/${file}?start=translate&ui=${ui}`);
  await page.waitForFunction(() => typeof wholeDocumentTools !== 'undefined' && wholeDocumentTools);
  const entry = page.locator('#research-document-workspace');
  assert.equal(await entry.locator('summary').isVisible(), true, 'research has a visible main-screen entry');
  assert.equal(await entry.locator('summary').textContent(), ui === 'es'
    ? 'Traducción de investigación científica · PDF / Word'
    : 'Scientific research translation · PDF / Word');
  assert.equal(await page.locator('#translation-setup').getAttribute('open'), null);
  await entry.locator('summary').click();
  const target = file === 'index.html' ? 'en-US' : 'en-GB';
  await page.locator('#source-language-select').selectOption('es-EC');
  await page.locator('#target-language-select').selectOption(target);
  const text = Array.from({length: 100}, (_, index) =>
    `Medición ${index}. Se evaluó la fuerza muscular después de cuatro semanas.\n\n`).join('')
    + 'Conclusión final. DOI 10.1234/example.2026.';
  const chooser = page.waitForEvent('filechooser');
  await page.locator('#quick-choose-document').click();
  await (await chooser).setFiles({name: 'Synthetic-paper.txt', mimeType: 'text/plain', buffer: Buffer.from(text)});
  await page.waitForFunction(() => importedDocument && !documentLoading);
  assert.equal(requests.length, 0, 'opening a paper never sends it for translation');
  assert.equal(await page.evaluate(() => importedDocument.sections.join('')), text);
  assert.ok(await page.evaluate(() => importedDocument.sections.length) > 1);
  assert.equal(await page.locator('#translate-entire-document').isVisible(), true);
  assert.equal(await page.locator('#source-language-select').inputValue(), 'es-EC');
  assert.equal(await page.locator('#target-language-select').inputValue(), target);
  const order = await page.evaluate(() => Boolean(document.querySelector('#whole-document-tools')
    .compareDocumentPosition(document.querySelector('.music-capture')) & Node.DOCUMENT_POSITION_FOLLOWING));
  assert.equal(order, true, 'whole-paper actions precede music controls');

  await page.locator('#translate-entire-document').click();
  await page.waitForFunction(() => !wholeDocumentTools.runner.busy && wholeDocumentTools.runner.error);
  assert.equal(await page.locator('#download-document-text').isDisabled(), true, 'partial drafts cannot export as complete');
  const beforeReload = requests.length;
  failAt = -1;
  await page.reload();
  await page.waitForFunction(() => typeof wholeDocumentTools !== 'undefined' && wholeDocumentTools);
  await entry.locator('summary').click();
  await page.locator('#quick-open-research').click();
  assert.equal(await page.locator('#choose-saved-paper').isVisible(), true);
  assert.equal(await page.locator('#import-document-progress').isVisible(), true);
  assert.equal(await page.locator('#open-document-progress').isVisible(), true);
  await page.locator('#open-document-progress').click();
  assert.equal(requests.length, beforeReload, 'saved progress opens without a service call');
  assert.equal(await page.locator('#source-language-select').inputValue(), 'es-EC');
  assert.equal(await page.locator('#target-language-select').inputValue(), target);
  await page.locator('#translate-entire-document').click();
  await page.waitForFunction(() => !document.querySelector('#download-document-text').disabled);
  assert.equal(requests.filter(text => text === requests[0]).length, 1, 'saved chunks are reused after reload');
  const draft = await page.locator('#document-full-draft').inputValue();
  assert.match(draft, /Medición 0/);
  assert.match(draft, /Conclusión final/);
  assert.match(draft, /10\.1234\/example\.2026/);
  assert.equal(await page.locator('#document-full-draft').getAttribute('readonly'), null);
  const edited = draft + '\n\nReviewed final paragraph.';
  await page.locator('#document-full-draft').fill(edited);
  const downloading = page.waitForEvent('download');
  await page.locator('#download-document-text').click();
  const download = await downloading;
  assert.equal(fs.readFileSync(await download.path(), 'utf8'), 'Synthetic-paper.txt\n\n' + edited);
  assert.ok(download.suggestedFilename().includes(target));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  await context.close();
  console.log(`${file} ${width}px ${ui} ${native ? 'native bridge' : 'web'} ${target}: visible research entry, complete import, quota pause, reload/resume, source fidelity, editing and export passed`);
}

(async () => {
  const engine = process.env.HABLA_BROWSER_ENGINE || 'chromium';
  const browser = await playwright[engine].launch(engine === 'chromium' ? {args: ['--no-sandbox']} : {});
  try {
    for (const file of ['index.html', 'translator.html']) {
      for (const width of [320, 390]) {
        for (const ui of ['en', 'es']) await checkPaper(browser, {file, width, ui, native: false});
      }
      await checkPaper(browser, {file, width: 390, ui: 'es', native: true});
    }
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
