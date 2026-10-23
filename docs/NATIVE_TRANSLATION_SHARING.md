# Native translation sharing

Native version 0.1.13 (14), based on the separate multilingual recognition prototype 3f0b3d7. This branch is not a merge of experimental audio features into main.

The installed wrapper intercepts the hosted Share translation button and opens UIKit's UIActivityViewController with only the current edited, completed translation. Paragraphs and Unicode are preserved; originals, URLs, history and metadata are excluded. Messages/iMessage, Mail and other destinations are offered according to the device's configured apps and system availability. The user chooses the destination and recipient and confirms sending in that app. Completion means the activity completed; it is not a delivery receipt.

Share remains visible under the translated text in Translate and Music, outside Playback & translation notes. Live provisional music text is not shared as a completed translation. No automatic clipboard fallback occurs for the native action, including cancellation. Ordinary website sharing retains its existing Web Share/Copy behavior.

The bridge retains main-frame, HTTPS, app-origin and path checks. It rejects empty or over-100,000-UTF-16-unit text without truncation, duplicate presentations and unavailable presentation contexts. Document-specific request IDs isolate stale completions. Navigation invalidates and dismisses a pending sheet; iPad uses a popover anchor. No signing, team or bundle identifier settings were changed.

## Verification

- `node --check ios/HablaEcuador/NativeSpeech.js`
- `node tests/native-speech-bridge.test.cjs`
- `node tests/music-listening.test.cjs`
- `node tests/translation-service.test.cjs`
- `HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_HOSTED_ROOT=/path/to/current-main node tests/native-sharing.browser.cjs`
- `git diff --check`

The browser test requires hosted main at build 105 (260b463) or a compatible version containing #share-result; this prototype's older tracked web files do not contain that button. It loads the actual hosted HTML/JS and bundled native bridge in Chromium at 390px and 844px, checking visible actions, edited paragraphs, Music relocation, duplicate/stale IDs, cancellation/completion/error, transport failure and size/empty/hidden guards. UIKit is stubbed at the message boundary. The existing music harness gained a missing addEventListener stub for the inherited multilingual controls; no production audio logic changed.

Swift/UIKit compilation, share-sheet presentation, iPad presentation and actual Messages/Mail composer behavior must be tested with Xcode and a physical device. No native build or install can be claimed from Linux JavaScript checks. This change does not improve music recognition accuracy.

## Mac smoke test

Build and install this branch in a separate checkout with Xcode 27, preserving existing worktrees. Confirm native 0.1.13 (14). Translate neutral text, edit the output, tap Share translation, and check that the system sheet offers available destinations. Open Messages or Mail and verify only the edited translation appears. Cancel, then retry. Repeat from Music after a completed translation. Check two taps do not open two sheets. Recipient delivery is outside the app's completion status.
