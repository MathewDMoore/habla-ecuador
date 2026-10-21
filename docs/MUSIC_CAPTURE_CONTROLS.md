# Visible native music capture controls

Native 0.1.10 (11) prepares a visible capture card with the existing source selector and Start/Continue/Stop button. The card appears above the growing transcript, stays outside collapsed help, sticks within the Music workspace while scrolling, and retains the existing button node and handlers. Capture details are one explicit action away. Other source/translation editors and workflows remain intact.

Starting this iPhone's audio says **Waiting for screen-sharing approval**, with a **Cancel startup** button. This is not presented as active capture. Only the native start event shows **Listening**. Subsequent meter updates distinguish waiting for audio, detected audio, three consecutive near-silent readings (at or below -90 dBFS), and capture backlog gaps. Nonempty recognition results show **words received**, without claiming accuracy. Stop, cancellation, errors and session handoff clear the active state. Old sessions cannot revive the current card. Status titles use text and color, and titles only mutate when their text changes to avoid repeated live announcements for an unchanged title.

The silence threshold is a diagnostic heuristic, not proof about every sample or word. Received seconds describe forwarded input duration, not guaranteed recognized coverage. Quiet audio may legitimately trigger the warning. Apple's picker cannot be bypassed. Song recognition remains a separate action. Capture processes words for translation and does not save an audio recording; the visible instructions now say this directly. Screen recording can interfere with system capture, so an ordinary screenshot is suggested for diagnosis.

Validation:

```sh
for testfile in tests/*.test.cjs; do node "$testfile" || exit; done
node --check ios/HablaEcuador/NativeSpeech.js
git diff --check
HABLA_HOSTED_ROOT=/path/to/hosted-build-100 HABLA_JSDOM_MODULE=/path/to/jsdom node tests/native-layout.dom.cjs
```

All 13 JavaScript suites and the real-DOM integration check passed against hosted build 100 source using jsdom 30.1.3. The lifecycle tests cover permission gating, native start, silence/recovery, words, upstream gaps, errors, stale events, cancellation and microphone startup. The DOM check confirms primary capture controls and source choice stay outside disclosures, with no duplicate controls and preserved editor/tab behavior.

This increment changes the bundled JavaScript, tests, and native version/build metadata. Swift capture logic is unchanged from 69bc271, whose native tests and device build passed on Mathew's Mac and whose diagnostic was installed. This new bundle has not yet been compiled, installed or visually verified on a physical iPhone. A Mac build/install is required to receive the new controls; hosted build 100 alone cannot replace bundled NativeSpeech.js. Signing settings are unchanged. This does not improve transcription or bilingual recognition accuracy.
