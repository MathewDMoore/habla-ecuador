# Clear an accidental usage rating — build 117

In Dictionary → Review usage, return to the entry and tap **Clear rating**. It removes only that entry’s saved rating and returns it to unreviewed. The reviewer name, region, notes, timestamp and other entries remain unchanged. The reviewed count decreases and the entry no longer appears in the rated-review export. You can rate it again later. With no rating the control is disabled.

Reviews are device-local until explicitly shared. This does not change the public dictionary or its source-attestation labels. Failed storage writes report failure and retain the selected rating. No native, signing, recognition or dictionary-data changes.

Validation:
- `node --check app.js`
- All 25 existing `tests/*.test.cjs` suites passed.
- `HABLA_PLAYWRIGHT_MODULE=/workspace/scratch/98d796203697/browser-tools/node_modules/playwright node tests/review-reset.browser.cjs`
- Repeat with `HABLA_NATIVE_SCRIPT` pointing to the installed native 0.1.15 layout script.
- Browser checks use synthetic notes and exercise the real atatay entry, persistence, exports, preserved other reviews, re-rating and a denied storage write at 390px and 320px.
- `git diff --check`

Physical iPhone interaction remains unverified. Hosted update; no Xcode rebuild required.
