# Music capture controls in page flow — build 106

The installed native companion (tested JavaScript from 0.1.15/16, commit 43eb218) injects #native-capture-controls with inline position:sticky, top:0 and z-index:5. With the keyboard reducing the available viewport, this card stays above the shared source/translation editors instead of scrolling away. The private recording is evidence only; no recording contents or frames are committed.

The hosted stylesheet now overrides the card's position to static, resets its insets/stacking, and removes the floating shadow using !important so the later native inline styles cannot win. The same original controls/status and source/translation nodes remain available in Music and scroll normally; Translate still restores the same editors. No native code, signing, dictionary, audio recognition or composition-candidate changes are included.

Web version v0.25.7/build 106 advances app, page, service-worker and offline-worker query identifiers together. Offline model/runtime caches are unchanged. The existing offline-readiness test now checks the worker URL against the actual precache URL rather than a stale hardcoded build number.

Validation:

- `node --check app.js`, `node --check sw.js`, `node --check offline-device.js`, `git diff --check`.
- All 18 existing `tests/*.test.cjs` suites pass after updating the worker-cache assertion.
- `HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_NATIVE_SCRIPT=/path/to/installed/NativeSpeech.js node tests/music-controls-layout.browser.cjs`.
- Existing selected-text browser tests run against both pages and the native bridge; native sharing browser tests run against the updated hosted files.

Baseline Chromium at 390×380 reproduced the source editor fully behind the card (card roughly y=4–256, editor y=148–228). The fixed test passes at 390×380, 390×320, 390×844 and 844×390, checking both editors for intersection, static positioning, control availability, single button identity and tab/text preservation. Short viewports approximate a raised keyboard; this is not physical iPhone/WebKit keyboard verification. The installed native JavaScript is supplied by the test environment rather than copying the experimental native branch into main.

No Xcode rebuild is required for this hosted stylesheet override. Actual updated iPhone layout remains to be confirmed after the hosted release loads.
