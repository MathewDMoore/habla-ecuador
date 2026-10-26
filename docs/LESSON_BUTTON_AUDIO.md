# Lesson audio action repair — build 137

Mathew's 22:59:20 recording shows build135 in iPhone Safari. Audio buttons deform with no audible output or adjacent playback status. The audio track is entirely silent. The scene does advance later in the recording, so this is not evidence that all JavaScript or all listeners failed.

The shared `say()` handler delayed voice preparation and first speech submission through two 160ms timers (and further retries for an empty voice list). This moved the first speak request outside the original tap. WebKit's speech implementation imposes user-gesture restrictions on iOS. This is a concrete activation hazard; we cannot prove it is the only cause of this device's silent playback without physical-device inspection.

Build137 prepares the voice and submits the first utterance synchronously. Resume also submits from the direct user action. An empty voice list no longer postpones the action: the utterance receives the requested language and lets the browser resolve it. If a populated list contains no suitable language, the existing unavailable message remains; an enumerated voice of the wrong language is never selected.

Quick-lesson explanation/example and dictionary Hear model controls now have nearby status based on real utterance events. Starting/playing/finished, blocked/thrown errors and a six-second no-start watchdog are explicit. A silent provider is canceled and offers a fresh tap; there is no automatic speech retry that would lose activation again. Pause, stop, replacement and stale events cancel/invalidate old timers and preserve prior position behavior. These changes reuse device voices and do not introduce paid services or recording uploads.

Validation uses Habla's real say(), not a replacement. A lower-level speech stub enforces the first request occurring in the trusted touch event. The regression fails against the previous app.js; the fixed implementation passes with enumerated and empty voice lists. Coverage includes actual touchscreen taps, Spanish/U.S./U.K. target languages, explanation/model/example routing, repeated playback, visible lifecycle/error/no-start/retry states, phrase hiding/reveal, next situation/topic, Spanish UI and a real touch request to the practice microphone. OS speech and recognition are simulated; this does not prove iPhone audibility or recognition reliability. Existing pause/resume, replacement/cancellation and unit checks also pass.

The microphone retains its existing hold-to-speak behavior. A brief tap can release before capture is ready and is explicitly unscored; this repair does not claim a physical microphone diagnosis or silently change that interaction.

Primary reference: https://bugs.webkit.org/show_bug.cgi?id=223473 (iOS speech gesture restriction).
