# Same-iPhone audio capture — experimental native 0.1.5 (6)

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
