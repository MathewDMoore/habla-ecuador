# Slang contributions — build 113

Dictionary → Review usage or suggest slang → Suggest or check slang.

A separate device-local form accepts additions and checks/corrections for any supported country, with free city/area labels including Monterrey and Caracas. Required fields are the expression, meaning and an original example. Tone, self-reported usage assessment, evidence/context and optional reviewer initials accompany the report. Rotating bilingual suggestion prompts help contributors describe everyday usage, register, context-dependent senses and corrections.

Up to 50 contributions are saved in a separate localStorage key. Select a saved contribution to edit or delete it. Save explicitly; an unsaved form is not persisted through reloads. Storage errors keep the current form and report that it was not saved. Clearing browser data removes these local records.

Copy and Share export only the selected, last-saved contribution, labeled UNVERIFIED USER REPORT. Sharing requires an explicit tap, respects cancellation, prevents duplicate requests and falls back to copy or a selected readonly export. No server, account, automatic submission or public review queue is added. A shared report must be brought back to the project for source and regional review before any dictionary change. Self-reported usage is not dictionary attestation; all contributions remain pending verification. No entry, sense, translation match, saved gloss or existing Ecuadorian review is changed by this form.

Validation:

- `node --check slang-contributions.js` and `node --check app.js`
- All `tests/*.test.cjs` suites
- `HABLA_PLAYWRIGHT_MODULE=/workspace/scratch/98d796203697/browser-tools/node_modules/playwright node tests/slang-contributions.browser.cjs`
- Same browser check with `HABLA_NATIVE_SCRIPT` pointing to installed native 0.1.15 JS
- `git diff --check`

Browser checks use synthetic content and mocked sharing APIs, at 390 and 320 pixels. They cover saving/reloading/editing, region-specific prompts, escaped rendering, selected-only export, cancellation, storage failure, manual-copy fallback and overflow. Physical iPhone storage and sharing remain unverified. Hosted change; no Xcode or signing changes.
