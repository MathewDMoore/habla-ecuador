# Native iPhone microphone prototype — 0.1.2 (3)

This is a native companion prototype for the existing Habla Ecuador
translator. Its specific test is whether music from **another app on the same
iPhone** can continue through a Bluetooth speaker while Habla listens through the
phone microphone. Build 80's browser selector did not fix the reported interruption.

The companion loads the current hosted translator in WKWebView. A bundled bridge
replaces Web Speech microphone capture with AVAudioEngine and native Apple speech only
inside this app. Existing transcript editing, song continuation, language selection
and translation behavior are reused. The browser website remains build 80.

## Audio configuration

- `playAndRecord`, default mode, `mixWithOthers`, `allowBluetoothA2DP`.
- Prefer the built-in microphone; do not choose Bluetooth HFP input or force output
  to the phone speaker. Pair/select the Bluetooth speaker using iOS first.
- No ducking, voice processing, digital extraction from another app, or audio file
  recording. Newer iPhones default to on-device speech; Apple service is a separate
  manual choice. Singing can produce incomplete or inaccurate recognition.
- Stop/cancel/interruption releases the microphone and audio session. Final results
  get up to two seconds after Stop. Session tokens reject old results and permission
  callbacks. Backgrounding stops capture; permission alerts alone do not cancel it.
- Speech bridge messages are accepted only from the main frame at the trusted
  hosted app origin/path. External navigation opens outside the app.

## Build 3: on-device SpeechAnalyzer and microphone input diagnostics

The reported build-2 phone test returned **kAFAssistantErrorDomain / 203 (“Retry”)**,
source/recognition es-MX, actual mode apple-service, with no words. This proves the
native bridge and error disclosure run on the phone. Apple's error table describes
203 as a generic recognition failure; it does not establish a networking, Siri,
Dictation, model-assets or microphone cause. Bluetooth coexistence remains unverified.

On iOS 26+, default capture now uses **SpeechAnalyzer + SpeechTranscriber**, with
**DictationTranscriber** when the selected language/device cannot use SpeechTranscriber.
The separate On-device dictation choice allows a manual comparison. The modern path
needs microphone permission and downloads required Apple-managed model assets before
opening the microphone. It does not use the legacy Apple service authorization gate
or send audio to that service. A model download needs connectivity and device storage;
its status opens the speech disclosure. Cancel/Stop/backgrounding cannot reactivate
capture after a delayed download or preparation callback. First use is not immediately
offline; subsequent on-device availability depends on Apple's retained assets.

On older iOS versions, default capture attempts the legacy on-device recognizer.
Legacy on-device speech and Apple service remain explicit choices. No on-device
failure or unsupported locale silently changes to service recognition. Apple service
permits Apple's normal processing choice and does not force remote processing.
Recognition locale can differ within the same language; actual locale is shown and
the translator's Ecuador/Mexico/regional source setting stays unchanged.

The disclosure **iPhone speech · native 0.1.2 (3)** shows setup/backend/source and
recognition locale, capture-start input/output port types, received audio duration
and current peak level in dBFS. This meter shows audio reaching the tap, not whether
words are understood. Error diagnostics include the outer and underlying NSError
domain/code chain; userInfo contents, personal speaker names, recognized words and
audio are not logged/uploaded. Existing error messages remain native-specific.

Modern recognition returns phrases, not cumulative full-session results. A timeline
accumulator replaces volatile ranges, retains finalized passages and repeated words
at later audio times, and emits one cumulative transcript to the existing translator.
Finalizing a phrase does not end a song. Stop drains results for up to two seconds,
then preserves the latest text and releases capture. Existing editing, continuation,
translation and whole-song duration limits remain in the hosted app.

The [build-3 unsigned simulator compile](https://github.com/MathewDMoore/habla-ecuador/actions/runs/38030340504)
passed for source `6819d1f` on Xcode 26.6 / SDK 26.5, both arm64 and x86_64.
Native transcript-state tests passed on that macOS runner, covering volatile revision,
duplicate final delivery, repeated choruses, overlap merging, invalid times, cleared
ranges and a fresh session. Bridge tests pass for dictation mode forwarding, model
download disclosure, persistent errors and stale-session cleanup. This compile is
not a phone transcription or Bluetooth acceptance result.

For the existing Mac checkout whose signing was configured in Xcode, update only
the three native source/resource files rather than merging changed project settings:

```sh
git -C "$HOME/HablaEcuador-iPhone.GRu3fe" fetch origin main &&
git -C "$HOME/HablaEcuador-iPhone.GRu3fe" restore --source=FETCH_HEAD --worktree -- \
  ios/HablaEcuador/HablaEcuadorApp.swift \
  ios/HablaEcuador/NativeSpeechCapture.swift \
  ios/HablaEcuador/NativeSpeech.js
```

Stop the current run and press **⌘R** in Xcode. Confirm the speech disclosure reads
**native 0.1.2 (3)**. Keep default On-device speech and wait for preparation/download,
then pause music, tap the microphone, say “Hola María, ¿cómo estás?” and tap again to
finish. Once words appear, repeat with phone music through the Bluetooth speaker.
If no words appear, compare On-device dictation and inspect the input level, duration
and lasting error. A visible meter is not itself successful transcription.

This source-only refresh does not advance the checkout's branch or change local
bundle-version/signing settings; the disclosure identifies the source revision.
A fresh checkout uses 0.1.2/build 3 target metadata. If these three files contain
personal code edits, retain those before refreshing them.

## Install and run on Mathew's iPhone

1. On the MacBook Air, open `ios/HablaEcuador.xcodeproj` from the repository.
2. Select the HablaEcuador target → Signing & Capabilities → your Apple Developer
   team. Keep automatic signing; change the bundle identifier if Xcode requires it.
3. Connect/unlock the iPhone, select it as the run destination, and press Run.
   Follow any first-time Developer Mode/trust instructions shown by Xcode/iOS.
4. Allow microphone and speech recognition when requested. Permission descriptions
   explicitly disclose Apple's possible speech processing.

No third-party packages, paid transcription service, large model files, or App Store
publication are added. Loading the hosted translator needs internet. WKWebView's
offline caching, clipboard, voice playback, document chooser and all feature parity
must be checked on-device; this is not a fully packaged offline native app.

## Physical acceptance test — still pending

Use a real iPhone, not the Simulator. Start music in Apple Music or another player,
route it to the Bluetooth speaker, return to this native Habla app, and tap Listen
to music. Confirm **all three**: the other player's position keeps advancing, audio
still comes from the Bluetooth speaker, and Habla receives microphone words. Check
both playback source choices; native mixing is enabled for either choice.

Then Stop, Continue, New song, source-language changes, normal dictation, permission
denial, interruption, leaving the app, Bluetooth disconnection and translation voice
playback should leave working controls and preserve captured text where appropriate.
Try a second music player and a second speaker if available. Record iOS/device/app
versions and the actual result before calling this a fix. A2DP retention cannot be
established by JavaScript tests or a source review.

## Verification available here

`node tests/native-speech-bridge.test.cjs` checks native-message/result dispatch,
interim/final results, stop/abort, duplicate/stale callbacks, permission-error cleanup,
restart ownership, origin scope and transport retry. Project/plist/resource/scheme
references are inspected separately. All thirteen JavaScript suites pass.
The [unsigned compile check](https://github.com/MathewDMoore/habla-ecuador/actions/runs/38022305010)
succeeded for source commit `794532a` using Xcode 26.6 / iOS Simulator SDK 26.5,
building both arm64 and x86_64. No compiler errors occurred. The App Intents metadata
warning is expected because this prototype has no App Intents dependency.

The local Linux environment has no Xcode, signing access or connected iPhone.
The user has confirmed native installation/launch. Build 2 returned no words with
Apple service error 203. **Build-3 physical transcription, model download, permission
behavior and Bluetooth coexistence remain unverified.** Simulator compilation
establishes that the project builds, not that the reported failure is fixed.

To compile on the Mac without installing or signing:

```sh
xcodebuild -project ios/HablaEcuador.xcodeproj -scheme HablaEcuador \
  -sdk iphonesimulator -configuration Debug CODE_SIGNING_ALLOWED=NO build
```

## Primary documentation

- [Apple: mixWithOthers](https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/mixwithothers)
- [Apple: playAndRecord](https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/playandrecord)
- [Apple: allowBluetoothA2DP](https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/allowbluetootha2dp)
- [Apple: SpeechAnalyzer](https://developer.apple.com/documentation/speech/speechanalyzer)
- [Apple: SpeechTranscriber](https://developer.apple.com/documentation/speech/speechtranscriber)
- [Apple: DictationTranscriber](https://developer.apple.com/documentation/speech/dictationtranscriber)
- [Apple: AssetInventory](https://developer.apple.com/documentation/speech/assetinventory)
- [Apple: recognition error codes](https://developer.apple.com/documentation/speech/sfspeechrecognitiontask/error)
- [Apple: live audio recognition request](https://developer.apple.com/documentation/speech/sfspeechaudiobufferrecognitionrequest)
- [W3C: browser Audio Session types](https://www.w3.org/TR/audio-session/)
- [WebKit's iOS audio session implementation](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/audio/ios/AudioSessionIOS.mm)

Apple documents mixing support in native audio sessions. This supports the
implementation choice; it does not establish that this prototype works on the
user's particular iPhone, music player and speaker.
