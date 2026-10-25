# Friend feedback — build 123

A 💬 control beside the interface-language selector opens Suggest a correction from every app view and the standalone translator. Regional dictionary cards also offer Report this entry, with the exact headword/sense prefilled. Existing slang contributions and Ecuadorian rating workflows remain available and unchanged.

The initial view has one required “What would you change?” field and a Share with Mathew button. Friends can type or use their keyboard’s dictation. Add details (optional) and Preview, copy or save start collapsed. Opting to include source/translation opens the preview; manual-copy fallback also opens it. No extra speech capture or permission flow was added.

Optional topics cover translation, regional meaning/usage, dictionary entries, pronunciation/speaking practice, lessons/subtitles, app behavior/layout and other comments. A report can identify country/city, the affected word/sentence/feature, a required problem description, an optional proposed correction, examples/evidence and a name/initials. Monterrey/other supported city filters and Caracas invitations prefill appropriate region/city context without asserting city-specific dictionary verification.

## Private drafts and explicit sharing

- The form stays in memory when closed. Save draft explicitly stores one draft under `habla-feedback-draft-v1`; reopening restores it. Unsaved or saved work is not overwritten when another entry is reported. Clear draft removes only this draft key.
- A readonly preview shows exactly the report text to be copied/shared. App version, current view and selected language pair help reproduce the issue. No page URL/query, unrelated storage, translation history, recordings or private papers are collected.
- Current source/translation text is excluded by default. The explicit checkbox snapshots up to 3000 characters per box, shows the text in the preview and clears the snapshot when unchecked. Included text is saved locally only if Save draft is tapped.
- Share with Mathew invokes the device's share options synchronously from the tap. The sender must choose the destination and Mathew; there is no configured inbox, account, backend or automatic submission. A resolved share promise does not confirm delivery. Cancellation preserves the form and does not copy. Unsupported/failed sharing falls back to clipboard; clipboard failure selects the preview for manual copying.
- Reports are labeled user reports/unverified and do not alter dictionary data, register labels, regional evidence or scoring. Incoming reports still need review.
- Both UI and report labels follow the English/Spanish interface choice; original report/input text and canonical field values remain unchanged. General feedback does not require a slang term/example.

The compact header hides only the visible language caption at 320px, retaining its accessible label and selector. Feedback never enters the paired source/translation workspace. Native code/signing and audio processing are unchanged; no Xcode rebuild is required for the hosted update.

## Validation

```sh
node --check app-feedback.js
node --check app.js
node --check interface-es.js
for test in tests/*.test.cjs; do node "$test" || exit; done
HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_NATIVE_SCRIPT=/tmp/habla-native16.js node tests/app-feedback.browser.cjs
git diff --check
```

The new schema/export suite verifies allowlisted/bounded fields, text opt-in, Spanish export labels, no URL/private-text leakage by default and offline-shell references. Browser tests use synthetic reports and mocked share/clipboard/storage APIs: 320/390px in English/Spanish plus native-16 companion JavaScript simulation, the one-field quick-share path, initially collapsed optional/preview sections, required fields, all topics, Monterrey and Caracas context, entry prefill, save/reload, unsaved guard, corrupt storage, save failure, sharing/cancel/copy/manual fallbacks, pending guard, original text preservation, Escape/close/focus and all six views/standalone.

Existing shared-layout (16 combinations), interface language, app sharing, slang contributions and regional vocabulary browser suites run as regressions. Physical iPhone keyboard/share-sheet delivery remains unverified. No actual report or message was sent by tests.
