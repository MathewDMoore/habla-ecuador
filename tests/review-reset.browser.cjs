const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const {chromium} = require(process.env.HABLA_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), origin = 'https://mathewdmoore.github.io';
(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    for (const width of [390,320]) {
      const context = await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
      const page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('**/*', r => {
        const u = new URL(r.request().url()), file = path.join(root,u.pathname.replace('/habla-ecuador/',''));
        return u.origin === origin && fs.existsSync(file) && !file.endsWith('.mp3') ? r.fulfill({path:file}) : r.abort();
      });
      if (process.env.HABLA_NATIVE_SCRIPT) await page.addInitScript({path:process.env.HABLA_NATIVE_SCRIPT});
      await page.goto(origin+'/habla-ecuador/index.html');
      await page.waitForFunction(() => reviewEntries().length > 1);
      const seeded = await page.evaluate(() => {
        const entries = reviewEntries();
        const target = entries.find(e => /atatay/i.test(e.spanish));
        if (!target) throw Error('Expected atatay fixture');
        const other = entries.find(e => e.id !== target.id);
        const pack = {reviewer:'Synthetic reviewer',reviews:{
          [target.id]:{rating:'natural',region:'Synthetic city',notes:'Keep this original note',reviewedAt:'2026-10-24T12:00:00Z'},
          [other.id]:{rating:'regional',region:'Other city',notes:'Keep other review'}
        }};
        writeReviewPackage(pack); reviewIndex = entries.indexOf(target); renderReview();
        return {target:target.id,other:other.id,pack};
      });
      await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
      await page.locator('[data-open="review-view"]').first().click();
      await page.evaluate(() => renderReview());
      assert.equal(await page.locator('#review-card [data-review-choice].selected').count(),1);
      await page.locator('#review-clear-rating').click();
      assert.equal(await page.locator('#review-card [data-review-choice].selected').count(),0);
      assert.equal(await page.locator('#review-clear-rating').isDisabled(),true);
      assert.equal(await page.locator('#review-notes').inputValue(),'Keep this original note');
      assert.match(await page.locator('#review-progress').textContent(),/1 of/);
      const after = await page.evaluate(() => ({pack:readReviewPackage(),summary:reviewSummary()}));
      const expected = JSON.parse(JSON.stringify(seeded.pack)); delete expected.reviews[seeded.target].rating;
      assert.deepEqual(after.pack,expected,'only target rating is removed');
      assert.ok(!after.summary.includes('Keep this original note'),'unrated entry excluded from export');
      assert.ok(after.summary.includes('Keep other review'),'other review remains in export');
      await page.reload(); await page.waitForFunction(() => reviewEntries().length > 1);
      await page.evaluate(id => {reviewIndex=reviewEntries().findIndex(e=>e.id===id);renderReview()},seeded.target);
      assert.deepEqual(await page.evaluate(() => readReviewPackage()),expected,'reset survives reload');
      await page.locator('.bottom-nav [data-open="dictionary-view"]').click();
      await page.locator('[data-open="review-view"]').first().click();
      await page.locator('[data-review-choice="natural"]').click();
      assert.equal(await page.locator('#review-clear-rating').isEnabled(),true);
      expected.reviews[seeded.target].reviewedAt = await page.evaluate(id => readReviewPackage().reviews[id].reviewedAt, seeded.target);
      // A denied storage write must not pretend the rating was cleared.
      await page.evaluate(() => {globalThis.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='habla-ecuador-review-v1')throw Error('Synthetic quota');return originalSetItem.call(this,k,v)}});
      await page.locator('#review-clear-rating').click();
      assert.equal(await page.locator('[data-review-choice="natural"]').evaluate(e=>e.classList.contains('selected')),true);
      assert.match(await page.locator('#toast').textContent(),/could not be cleared/);
      await page.evaluate(() => {Storage.prototype.setItem=originalSetItem});
      await page.locator('#review-clear-rating').click();
      assert.deepEqual(await page.evaluate(() => readReviewPackage()),expected);
      await page.evaluate(id => {
        const pack = readReviewPackage();
        pack.reviews = {[id]:{rating:'natural',notes:'Sole synthetic review'}};
        writeReviewPackage(pack); renderReview();
      }, seeded.target);
      await page.locator('#review-clear-rating').click();
      assert.match(await page.locator('#review-progress').textContent(),/0 of/);
      assert.ok(!await page.evaluate(() => Object.values(readReviewPackage().reviews).some(r=>r.rating)));
      assert.equal(await page.locator('#review-notes').inputValue(),'Sole synthetic review');
      assert.deepEqual(errors,[]);
      assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width));
      await context.close();
    }
    console.log('Review reset passed: atatay, preserved notes/region/other review/reviewer, count/export, persistence, re-rating, storage failure and 320/390px layout');
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
