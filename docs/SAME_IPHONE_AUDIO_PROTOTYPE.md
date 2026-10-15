# Same-iPhone audio capture — experimental native 0.1.6 (7)

## Compact translation layout — 14 October 2026

Native 0.1.6 (7) groups the existing full-source editor, full translation, and latest paired passage into one compact reading card. A follow-up reserves a visible Translation area even before text is entered; it yields to the actual translation or live pair and returns when results clear. The hosted app continues to own real-result visibility. Playback settings, document tools, and native diagnostics no longer sit between the source and its translation. Long fields scroll without truncating their stored values; the full translation's playback and editing actions remain available under Playback & translation notes. The existing DOM nodes, IDs, handlers, editing and saved-gloss behavior are preserved. This layout is injected by the native companion and needs a new install; the hosted website has not changed.

All 13 JavaScript suites pass. DOM checks against both index.html and translator.html confirm node identity, unique IDs, retained editor values and input handlers, app-owned visibility, and available playback/capture controls. A user recording confirms native 0.1.6 (7) installed and the source editor moved, but revealed that the empty target was still hidden. The follow-up placeholder fix passes empty/full/live/clear transition DOM checks; physical visual verification and an Xcode build of that follow-up remain pending.

The preceding native 0.1.5 (6), commit 6757a48, compiled successfully on the user's Mac with Xcode 27.0 (27A266a), iPhoneOS SDK 27.0, unsigned generic-iOS Debug. The user subsequently installed and launched it on the iPhone. A supplied screen recording shows the system-audio input selected, captured text, a live translated passage, retained text after a user-stop report, and analyzer diagnostics of 71.3 seconds / 3,564 buffers / zero rejected. The supplied recording's audio track is silent, so transcription fidelity and uninterrupted source playback cannot be verified from it. Microphone isolation, stop-indicator cleanup, other playback apps and protected playback remain unverified. The diagnostic label Microphone audio is misleading for the selected system input and remains an open issue.

## Original prototype notes — native 0.1.5 (6)

This prototype adds an opt-in system-audio input to the existing hosted translator. It is not yet verified on the user's iPhone, Spotify, Apple Podcasts or Audible. It does not guarantee access to protected playback, better sung transcription, or real-time spoken dubbing.

Apple's iOS 27 sample documents `SCContentSharingPicker`, `SCStream`, audio capture and the `screen-capture` background mode: https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-on-ios . The framework documentation is https://developer.apple.com/documentation/screencapturekit .

## Implementation

- Requires iOS 27 and an iOS 27 SDK build. Compiler availability is guarded for older toolchains; older builds keep microphone capture and do not show the system-audio option.
- The native wrapper injects a capability flag and adds **This iPhone's audio · experimental** to the music playback source selector.
- Only continuous music listening uses this input; ordinary dictation stays on the microphone. System audio always uses the modern on-device recognizer rather than a legacy microphone service.
- The system picker obtains the user's capture permission. Screen frames are discarded; the app does not save or upload video or raw audio. The existing online translation route still sends captured text to the free translation service, as described by the app.
- Captured PCM samples are copied, converted to the analyzer's format, and fed into the existing transcript/review/live-draft flow. No microphone session or tap is activated for this input.
- Backgrounding keeps only the explicitly selected system-audio session active. Ordinary microphone sessions retain their previous suspension behavior. Stop, cancellation, picker failure, navigation and stream errors cancel capture and reject stale callbacks.
- `excludesCurrentProcessAudio` is requested, but physical-device verification is required. Habla's Hear it actions stop music capture before speaking; this prototype does not provide simultaneous translated speech over playback.

## Install/test requirements

This requires a new Xcode installation/build of the native app; a web-only deployment cannot enable it. The hosted app also needs the included visibility-change guard so the system picker or switching to the playback app does not cancel the selected capture.

On a physical iPhone running iOS 27: select Translate, source and target languages, then **This iPhone's audio · experimental**, and Listen to music. Approve the Apple picker. Play a short spoken English podcast first, return to Habla and check captured words and analyzer queue. Then test Spanish speech, Spotify music and Audible separately. Stop listening must end the system capture indicator. Cancelling the picker must restore controls and preserve earlier text. Ordinary dictation and external-Alexa capture must still work.

If a source supplies silence, report that as unavailable playback rather than producing a fabricated translation. Do not infer app-wide support from one successful title or a successful compile.

App Store/TestFlight distribution of the new background mode requires separate validation; this prototype is for a directly installed development build first.

## Validation status — 13 October 2026

All 13 JavaScript suites passed. The added bridge tests cover explicit system-input selection, ordinary microphone isolation, unsupported builds, replacement-session ownership and the hosted visibility handler. Property lists parse and the diff passes whitespace checks.

GitHub's macOS runner did not have an iOS 27 SDK. Run 38491217284 stopped at SDK selection before compiling; this is not a successful native build. The iOS 27 implementation is therefore uncompiled and unvalidated. Do not merge or describe it as enabled until Xcode 27 compilation and physical-phone tests complete. There is no change to the currently deployed build 95/native 0.1.4 (5).

The prototype additionally bounds pending PCM callbacks and analyzer buffering to avoid retaining an unlimited audio queue if processing stalls. These bounds need on-device load testing; dropping queued audio is not a recognition-quality fix.
