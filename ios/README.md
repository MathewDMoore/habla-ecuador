# Native iPhone microphone prototype — 0.1.0 (1)

This is a native companion prototype for the existing Habla Ecuador
translator. Its specific test is whether music from **another app on the same
iPhone** can continue through a Bluetooth speaker while Habla listens through the
phone microphone. Build 80's browser selector did not fix the reported interruption.

The companion loads the current hosted translator in WKWebView. A bundled bridge
replaces Web Speech microphone capture with AVAudioEngine/SFSpeechRecognizer only
inside this app. Existing transcript editing, song continuation, language selection
and translation behavior are reused. The browser website remains build 80.

## Audio configuration

- `playAndRecord`, default mode, `mixWithOthers`, `allowBluetoothA2DP`.
- Prefer the built-in microphone; do not choose Bluetooth HFP input or force output
  to the phone speaker. Pair/select the Bluetooth speaker using iOS first.
- No ducking, voice processing, digital extraction from another app, or audio file
  recording. Speech may use Apple's service and require connectivity; singing can
  produce incomplete or inaccurate recognition.
- Stop/cancel/interruption releases the microphone and audio session. Final results
  get up to two seconds after Stop. Session tokens reject old results and permission
  callbacks. Backgrounding stops capture; permission alerts alone do not cancel it.
- Speech bridge messages are accepted only from the main frame at the trusted
  hosted app origin/path. External navigation opens outside the app.

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
**No native launch, permission prompt, Bluetooth coexistence, physical-device build
or recognition accuracy has been verified.** Simulator compilation establishes
that the native project builds, not that the reported audio interruption is fixed.

To compile on the Mac without installing or signing:

```sh
xcodebuild -project ios/HablaEcuador.xcodeproj -scheme HablaEcuador \
  -sdk iphonesimulator -configuration Debug CODE_SIGNING_ALLOWED=NO build
```

## Primary documentation

- [Apple: mixWithOthers](https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/mixwithothers)
- [Apple: playAndRecord](https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/playandrecord)
- [Apple: allowBluetoothA2DP](https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/allowbluetootha2dp)
- [Apple: live audio recognition request](https://developer.apple.com/documentation/speech/sfspeechaudiobufferrecognitionrequest)
- [W3C: browser Audio Session types](https://www.w3.org/TR/audio-session/)
- [WebKit's iOS audio session implementation](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/audio/ios/AudioSessionIOS.mm)

Apple documents mixing support in native audio sessions. This supports the
implementation choice; it does not establish that this prototype works on the
user's particular iPhone, music player and speaker.
