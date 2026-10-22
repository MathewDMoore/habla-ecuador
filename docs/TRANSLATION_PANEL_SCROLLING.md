# Translation panel scrolling — build 104

Hosted v0.25.5 / build 104, based on merged build 103 (`e7e7baea416c38d4834f0d6e30bba3f0ae834372`). This is the continuation of the panel task in the Habla Ecuador conversation. The dictionary audit and native recognition prototype remain separate.

## Scoped change

`styles.css` constrains the four text regions: `#translator-input`, `#natural-result`, `#music-live-source` and `#music-live-draft`. Long paragraphs and unbroken tokens wrap within their current width. Only vertical text scrolling is enabled. Axis-specific `!important` overrides are necessary because installed native wrappers inject higher-specificity `overflow:auto` rules after the hosted stylesheet. Horizontal overscroll chaining is disabled inside these regions; touch handling permits vertical panning and pinch zoom.

The shared workspace and result/preview cards get minimum/maximum width constraints. No global page overflow lock, event interception, text rewriting, selection ban, zoom restriction, fixed height or native/signing change is introduced. Paragraphs, editing, caret movement, selection, Copy/Share and existing native height limits remain in use.

App/cache references advance to 104. The offline worker URL is aligned with the app cache's versioned worker entry (the build-103 worker URL still pointed at 102). Model/runtime cache names remain unchanged, preserving downloaded translation packs. The optional offline-browser test's expected build label advances with this release; no new model inference claim is made.

## Actual validation

- `node --check app.js`
- `node --check tests/translation-panels.browser.cjs`
- All 18 `tests/*.test.cjs` suites passed, including live-microphone routing, sharing, translation safeguards and offline cache/readiness regressions.
- `git diff --check`
- Playwright 1.56.1 with real Chromium 141: both hosted pages, plus native layout scripts from installed `3f0b3d7` (0.1.12) and cleanup `8837ce0` (0.1.9), at viewport widths 375, 390, 512 and 844. Sixteen page contexts exercise 32 Translate/Music view states. Checks cover panel bounds, long paragraphs/unbroken tokens, computed horizontal/vertical overflow after native CSS injection, zero horizontal scroll range, vertical scrolling, editing at the end of source/result, text selection, retained source text/newlines, research styling and unchanged zoom-capable viewport policy. All passed.
- A neutral generated screenshot was visually checked. No private recording, transcription or screenshot entered Git.

Browser command (paths are test-environment dependencies, not app resources):

```sh
HABLA_PLAYWRIGHT_MODULE=/tmp/habla-panel-browser/node_modules/playwright \
HABLA_PANEL_ENGINE=chromium \
HABLA_NATIVE_SCRIPTS=/tmp/habla-panels-native-installed.js:/tmp/habla-panels-native-cleanup.js \
node tests/translation-panels.browser.cjs
```

The browser test can use `HABLA_PANEL_CSS` to load the pre-change stylesheet and `HABLA_PANEL_BASELINE=1` to inspect geometry without asserting the new scroll policy. Chromium did not reproduce the reported iPhone gesture with the synthetic baseline, even though the original panels computed `overflow-x:auto`; the baseline is not proof of the gesture's root cause.

## Limits and next device check

Actual iPhone/WKWebView sideways movement, rubber-band gestures, keyboard behavior and pinch zoom remain unverified. Linux WebKit could not launch because required system libraries are missing; dependency installation also failed. Do not present Chromium emulation as physical Safari validation.

On the existing iPhone app, reopen while connected and confirm build 104. In Music, scroll a long source and translation vertically and diagonally; neither should move sideways. Check selection/editing and pinch zoom. No Xcode rebuild is needed. If sideways movement persists, capture only the panel behavior with neutral text; investigate WebKit caret/gesture panning separately rather than disabling page zoom.
