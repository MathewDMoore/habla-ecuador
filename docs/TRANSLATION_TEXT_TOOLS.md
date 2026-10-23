# Expandable translation text — build 107

Baseline: main d44e263 (v0.25.7/build 106). Hosted v0.25.8/build 107 adds Expand/Collapse above the translated text and a compact Text options disclosure containing smaller/larger text, Default size and Select all. This is an in-page panel, not a floating/full-screen overlay.

The compact output is capped at 24svh; expanded height is 55svh, bounded to 220–620px. Its explicit CSS overrides the installed companion's later native 24svh cap while keeping normal page flow and vertical scrolling. Text size changes in 2px steps from 14–40px; reset removes only the presentation override. Expansion and size are session/view state on the same live editor, so they follow it into native Music. They are not persisted across app reloads.

The companion moves unfamiliar result children into Playback & translation notes. After DOM initialization the hosted binding moves only the new text toolbar back immediately before #natural-result. Existing Hear/Pause/Copy/Restore stay in their established disclosure; native Share and its listener stay where installed. No existing action is moved or cloned. Select all focuses and selects only the completed editable output; it is disabled while no completed editable translation exists. No source text, translated content, saved gloss, recognition behavior, native code or signing settings are changed by presentation controls.

Print CSS hides the toolbar and removes output height/overflow limits, preventing clipped printed text. Existing document/Word/PDF/export workflows continue reading the complete text rather than visible panel dimensions. App/cache/offline-worker query references advance together to 107; downloaded model/runtime caches do not change.

Validation:

- `node --check app.js`, `node --check sw.js`, `node --check offline-device.js`, `git diff --check`.
- All 18 existing `tests/*.test.cjs` suites pass.
- `HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_NATIVE_SCRIPT=/path/to/installed/NativeSpeech.js node tests/translation-text-tools.browser.cjs`.
- The new real Chromium test exercises both HTML pages at 390×844 and installed native 0.1.15 JavaScript at 390×844/844×390. It checks actual expanded height, scrolling, ARIA toggle state, bounded size/reset, paragraph/Unicode preservation, original editor identity, selection/replacement/saved edits, existing playback/Copy/native Share, Music relocation and unclipped print layout. Playback and native sharing are checked at their JavaScript call boundary, not as physical audio or message delivery.
- Existing selected-text browser regression passes both pages plus native editor. Existing music-card flow regression passes all four viewport sizes.
- A neutral synthetic native-layout screenshot was visually inspected with expanded output and Text options open. No private recordings/text/screenshots are included in Git or deployment.

Physical iPhone/WebKit interaction remains to be confirmed after release. This is a hosted update and requires no Xcode rebuild. It does not implement screen-recording import, change the existing action-cluster placement the user chose to retain, or merge the independent source-composition candidate.
