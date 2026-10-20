# Song identification prototype — native 0.1.7 (8)

Status: implementation prepared on a separate branch based on the unmerged iOS 27 audio prototype. Not compiled with Apple's SDK, installed, merged or deployed. This is a bounded first increment of song recognition, separate from speech-practice teaching work.

## User behavior

In the native app, choose **This iPhone's audio · experimental** and start listening. Once Apple starts capture, **Identify this song** becomes available. Tapping it explicitly searches Shazam's online music catalog using the audio already reaching Habla. The button is disabled during a request. A successful result displays the returned title, artist and an allowlisted Shazam link. No lyrics are fetched, and the result never enters the source editor, saved glosses or translation fields.

This first increment requires an existing system-audio/on-device-speech session. It does not yet identify a song independently of speech setup, through ordinary dictation or through the external-speaker microphone route. Old builds and browser-only pages do not gain this button. Some recordings, speech, silence, protected playback and uncatalogued music may not match. A catalog match is not evidence of accurate transcription, translation or cultural/regional origin.

## Audio and lifecycle

- No additional microphone or audio-engine session is created. The existing system input supplies the buffers, and its screen permission remains required.
- Only the explicit button starts a catalog request. No automatic requests, automatic retries or background song-library writes are added.
- PCM is converted to mono 44.1 kHz for SHSession. At most 20 seconds of converted input is fed to one matcher, with a 25-second wall-clock deadline, including waiting for input/network. No raw audio file is created or uploaded by Habla.
- ShazamKit computes audio signatures for catalog matching. Apple's description of its signature privacy is linked below; this should not be described as offline recognition.
- Timeout/no-match/service failure updates only the song card. Captured words and translation remain unchanged.
- Stop/cancel, replacement capture and capture teardown cancel the matcher, remove its delegate and reject late results. Both capture ID and song-request ID are checked in the JavaScript bridge.
- Extra conversion cost, audio-format changes, timeout behavior and background operation still require physical-device testing.

## Apple setup and build

Enable the **ShazamKit App Service** for the existing Habla App ID `com.mathewdmoore.HablaEcuador` in Apple's Developer account. Do not register a different App ID or bundle identifier. This account setting has not been inspected or changed from this workspace. No custom ShazamKit entitlement, MusicKit subscription, developer key or paid recognition vendor was added. Signing team settings remain local.

Use a separate checkout of `feature/song-identification`; preserve the existing dirty Mac checkouts and retained stash. Build with Xcode 27 / iOS 27 SDK, first unsigned to check compilation, then with the user's existing signing team for a physical iPhone. Native version is 0.1.7 (8). Do not describe the feature as working before these checks complete.

## Validation performed

- `node --check ios/HablaEcuador/NativeSpeech.js` — passed.
- `node tests/native-speech-bridge.test.cjs` — passed, including explicit request/no automatic request, button disabled before capture and for microphone/external input, double taps, source isolation, independent speech results, stale request IDs, stop/replacement invalidation, no-match/retry, service errors, safe text and URL rendering.
- `for test in tests/*.test.cjs; do node "$test" || exit 1; done` — all 13 existing JavaScript suites passed on this branch.
- `git diff --check` — passed; project/Info property lists parse. Project metadata changes only version/build; signing fields are unchanged.
- Native Swift compilation, Shazam App Service access, actual match accuracy, physical layout and audio continuity remain unverified. No user audio, private research papers, restricted translations or lyrics entered Git.

## Device acceptance checks

1. Confirm native 0.1.7 (8), start same-iPhone capture, and verify the button becomes available only after capture starts.
2. Identify a known recorded song: verify title/artist against its player, check the Shazam link and verify captured source/translation remain intact.
3. Stop during identification; confirm the capture indicator ends and a late match cannot replace the stopped result. Start a new capture and ensure the prior song cannot appear as its match.
4. Test silence/spoken podcast, unavailable network and an uncatalogued recording: an honest timeout/error must leave speech capture usable without fabricating a song.
5. Check ordinary microphone dictation, music transcription, editable drafts, background switching and the paired translation card for regressions.

## Primary sources

- [Apple: SHSession](https://developer.apple.com/documentation/shazamkit/shsession)
- [Apple: matchStreamingBuffer(_:at:)](https://developer.apple.com/documentation/shazamkit/shsession/matchstreamingbuffer(_:at:))
- [Apple: SHSessionDelegate](https://developer.apple.com/documentation/shazamkit/shsessiondelegate)
- [Apple: SHMediaItem](https://developer.apple.com/documentation/shazamkit/shmediaitem)
- [Apple: Enable ShazamKit for an App ID](https://developer.apple.com/help/account/services/shazamkit)
- [Apple: ShazamKit and signature privacy](https://developer.apple.com/shazamkit/)
- [Apple DTS: ShazamKit is an App Service, not a custom entitlement](https://developer.apple.com/forums/thread/813257)
