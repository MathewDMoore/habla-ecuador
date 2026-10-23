# Speaking prompt visibility — build 108

Hosted v0.25.9/build 108 keeps the existing sunset lesson's Spanish question and English meaning above its microphone during the speaking step. The previous step intentionally hid the question behind “Speak from memory”; the revised guided step lets learners read along. Recognized speech and keyword feedback remain in the separate “I heard” region. Microphone instructions now describe the existing tap-to-start/tap-again-to-finish behavior rather than incorrectly requesting a hold.

Only lesson markup, scoped prompt styles and release/cache references change. Recognition, keyword evaluation, translation, lesson progression and native signing/code remain unchanged. This is a hosted update and requires no Xcode rebuild.

Validation:

- `node --check app.js`, `node --check sw.js`, `node --check offline-device.js`, `git diff --check`.
- All 18 existing `tests/*.test.cjs` suites pass.
- `HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_NATIVE_SCRIPT=/path/to/installed/NativeSpeech.js node tests/speaking-prompt.browser.cjs`.
- Chromium at 390×844 and 320×700, plus the installed native 0.1.15 JavaScript at 390×844, retains the same prompt node and both language lines through pending startup, listening, partial/final responses, stopping, retry, no-speech and denied-permission events. The prompt stays within the viewport when the microphone is tapped. Existing choice/map/finish/reset progression passes.

Recognition events and native messages are synthetic; no audio is recorded. Physical iPhone/WebKit interaction and speech accuracy are not established by these checks.
