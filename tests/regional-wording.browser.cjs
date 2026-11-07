const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const playwright = require(process.env.HABLA_PLAYWRIGHT_MODULE || 'playwright');

async function checkRegionalWording() {
  const engine = process.env.HABLA_BROWSER_ENGINE || 'chromium';
  const browser = await playwright[engine].launch();
  try {
    for (const file of ['index.html', 'translator.html']) {
      const page = await browser.newPage({viewport:{width:390,height:844}, isMobile:true, hasTouch:true, serviceWorkers:'block'});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        localStorage.setItem('habla-tutorial-seen-v2', '1');
        window.SpeechRecognition = class {
          start() { window.testRecognition = this; this.onstart?.(); }
          stop() { this.onend?.(); }
          abort() { this.onend?.(); }
        };
        window.emitTranscript = (transcript, isFinal) => window.testRecognition.onresult({
          results:[{0:{transcript},isFinal}]
        });
      });
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.host === 'api.mymemory.translated.net') return route.fulfill({json:{responseStatus:200,responseData:{translatedText:'Example translation.'}}});
        const local = path.join(__dirname, '..', url.pathname.replace('/habla-ecuador/', ''));
        return url.origin === 'https://mathewdmoore.github.io' && fs.existsSync(local) && fs.statSync(local).isFile()
          ? route.fulfill({path:local}) : route.abort();
      });
      await page.goto(`https://mathewdmoore.github.io/habla-ecuador/${file}?ui=en`);
      if (file === 'index.html') await page.locator('.bottom-nav [data-open="translator-view"]').tap();
      await page.locator('#source-language-select').selectOption('es-EC');
      await page.locator('#target-language-select').selectOption('en-US');

      const input = page.locator('#translator-input');
      const mic = page.locator('#input-mic');
      const clue = page.locator('#translator-regional-wording summary');
      const mexicanText = '¡Órale, no manches! ¿En serio?';
      await mic.tap();
      await page.evaluate(text => window.emitTranscript(text, false), mexicanText);
      assert.equal(await clue.count(), 0, 'an unfinished draft has no regional label');
      await page.evaluate(text => window.emitTranscript(text, true), mexicanText);
      await clue.waitFor();
      assert.match(await clue.textContent(), /Possible usage from Mexico/);
      assert.equal(await input.inputValue(), mexicanText);
      assert.equal(await page.locator('#source-language-select').inputValue(), 'es-EC');
      await clue.tap();
      assert.equal(await page.locator('#translator-regional-wording a').count(), 2);
      await mic.tap();
      await mic.tap();
      await page.evaluate(text => window.emitTranscript(text, false), mexicanText);
      await mic.tap();
      assert.equal(await clue.count(), 0, 'ending on an unconfirmed draft does not promote its clues');

      await input.fill('¡Chuta! Ya me voy al laburo.');
      await clue.waitFor();
      assert.match(await clue.textContent(), /Shared usage/);
      await page.locator('#interface-language').selectOption('es');
      assert.match(await clue.textContent(), /Usos compartidos/);

      await page.locator('[data-mode="conversation"]').tap();
      const turnMic = page.locator('[data-speaker-role="spanish"]');
      await turnMic.tap();
      await page.evaluate(() => window.emitTranscript('¡Chuta! ¿Me acolitas con esto?', true));
      const turnClue = page.locator('#conversation-turns .regional-wording summary');
      await turnClue.waitFor();
      assert.match(await turnClue.textContent(), /Posible uso de Ecuador/);
      assert.equal(await page.locator('#conversation-spanish-language').inputValue(), 'es-EC');
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`${engine} ${file}: finalized speech, shared wording, localization and conversation passed`);
    }
  } finally {
    await browser.close();
  }
}

checkRegionalWording().catch(error => { console.error(error); process.exitCode = 1; });
