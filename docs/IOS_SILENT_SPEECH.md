# iPhone speech output — build 138

The 23:24:10 recording shows build137. The user reports no sound; its audio track is digital silence. Unlike the earlier video, the UI now visibly receives speech start/end callbacks and reports Playing audio / Audio finished. This narrows the issue to audible output, not missing tap handlers. Those callbacks cannot establish speaker audibility. No startup/storage changes are included in this repair.

Request `navigator.audioSession.type = 'playback'` immediately before speaking, when supported. Previously the app never declared a playback session, so browser/OS automatic routing was left in control. An inherited ambient or recording configuration is one possible explanation for silent output. It is not proven to be the device's sole cause.

The session claim is made only after an explicit speech action, never at startup. Preserve the prior type and restore it after completion, pause, stop, provider error or startup watchdog. A newer microphone/media owner that has already changed the type is not overwritten. Resume reacquires playback. Unsupported APIs and throwing properties fall back safely; voice selection and the selected language remain unchanged. No silent-audio priming, microphone permission request, forced volume or output-device switch is added.

Validation: all32 units and local touch regressions pass. Unit coverage checks mode order before speak, no mode changes at idle, pause/resume/completion/watchdog cleanup, newer-owner preservation and throwing-API fallback. The browser regression keeps the real navigator.audioSession where present and asserts playback at the speech boundary and mode restoration at completion. OS synthesis remains simulated. These checks establish requests and lifecycle, not physical iPhone sound. Device audibility remains unverified until actual sound is confirmed.

Primary references:
- https://www.w3.org/TR/audio-session/ — API types, playback intent, per-page state.
- https://developer.apple.com/documentation/avfaudio/avaudiosession — default iOS audio-session behavior and playback category; native context, not a guarantee about Safari's implementation.
