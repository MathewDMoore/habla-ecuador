# iPhone swipe input investigation

Diagnostic-only native 0.1.14 (15), based on native sharing c1dfc0d and its separate audio prototype stack. Not merged into main or deployed. No claim that swipe-to-replace is fixed. No signing/team/bundle identifier changes. The independent source-composition candidate must not be presented as proof of the swipe root cause.

The reported failure is: paste source text, select it, swipe a replacement word; text remains selected and unchanged. Tapped characters replace the selection. Deleting first is a known workaround the user explicitly rejects; do not offer it as a solution.

This build instruments only #translator-input. It logs before/after event type, inputType, composition/cancellation/focus flags, text length, data length, selection offsets, sequence number and elapsed time through a same-origin/main-frame bridge. No text, keystroke values, clipboard contents, source URLs or recordings are logged. Swift creates a whitelist record rather than logging bridge bodies. Logs stay in the attached device console unless explicitly saved by the user's Terminal command.

The normal hosted build remains unchanged for the comparison. Keep the keyboard and source selection intact: attempt the failing swipe, then a tapped replacement as the control. If the swipe emits no beforeinput/input/composition events while taps do, further web replacement changes cannot process that missing input; investigate the native keyboard/WebKit path. If events arrive, compare before/after selection, composition and cancellation metadata to locate the app handler that interferes. No conclusion follows from an idle log alone; correlate it with the observed attempt.

Verification:

- `node --check ios/HablaEcuador/NativeSpeech.js`
- `node tests/native-speech-bridge.test.cjs`
- `node tests/music-listening.test.cjs`
- `HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_HOSTED_ROOT=/path/to/main node tests/native-typing.browser.cjs`
- `HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_HOSTED_ROOT=/path/to/main node tests/native-sharing.browser.cjs`
- `git diff --check`

Chromium exercises the actual bundled bridge and current hosted page with a stubbed native message sink. This verifies event records and text/clipboard exclusion, not iOS gestures or Swift compilation. Native builds must use Xcode 27 and an actual iPhone. Capture stdout with devicectl launch --console; repeat the original swipe action, without deleting first, and stop console streaming after the control tap. Keep diagnostic work separate from the dictionary audit and do not merge this logging build as a production feature.
