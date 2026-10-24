# Recording import prototype — native 0.1.16 (17)

Branch: feature/recording-import. Based on the installed native 0.1.15 (16) / debug/iphone-swipe-input commit 43eb21827916c0db29ccc5107a2bf1555150955e. This independent native prototype does not merge any experimental native branch into main or alter the hosted build-114 release. Use an isolated Mac worktree; keep existing local changes and signing settings.

## User flow

Music → Import a recording · Photos / Files → choose Spanish (es-MX recognizer) or English (en-US recognizer) → set start time in seconds → pick one video. Import reads at most 60 seconds from the chosen start position, from a video no larger than 500 MB. Use another start time for another segment; these are replacements, not automatic whole-video stitching. Photos/iCloud downloads may require internet. A picker is used, not clipboard-video paste or an iOS share extension.

The app stages the user-selected video in an app-owned temporary directory, extracts only the chosen audio range, checks decoded PCM for a signal, and runs SFSpeechURLRecognitionRequest with both supportsOnDeviceRecognition and requiresOnDeviceRecognition enforced. Audio is never sent to a recognition server by this feature. Unsupported or unavailable on-device recognition fails explicitly. No microphone or live screen capture is opened.

The draft appears separately. Partial recognition is readonly and cannot be applied. Final words are editable but still require human review. Replace source & translate explicitly applies the edited draft, adjusts the source/target language families while preserving a compatible regional choice, and uses the existing translation flow. Text translation may use the chosen online provider; this is stated next to Apply. The recognition locale is not proof of an Ecuadorian or city accent. There is no automatic bilingual recognition or accuracy improvement claim.

A changed source requires another explicit replacement tap. Undo restores prior source text/languages only while the applied source is unchanged, and does not restore an earlier capture session or old live retry audio. Applying clears that old retry buffer to prevent it being confused with the imported video. Failed/cancelled imports never replace the source. Duplicate and stale request IDs are guarded. Cancellation, backgrounding, navigation, timeout, unsupported media, missing audio, near silence, permission failure, and unavailable recognition have explicit outcomes.

Temporary staged video and extracted audio are removed on completion/cancellation/error once in-flight file/framework work has ended. Abandoned app-owned directories older than an hour are removed on a subsequent launch. Original files in Photos/Files are never deleted. No recordings, private reference text or audio fixtures are committed; tests generate synthetic PCM on the Mac. Native audio failure messages avoid raw file paths or transcripts. The RMS threshold is a heuristic (-80 dBFS); quiet audio is not proof that the original file is wholly silent.

## Validation status

Implemented: picker/processing controller, native bridge/UI, review/apply/undo, signal check, project wiring, and version metadata. JavaScript tests do not establish Swift compilation, real picker behavior, on-device model availability or recognition accuracy.

Passed in the coding environment:

- `node --check ios/HablaEcuador/NativeSpeech.js`
- All 14 `tests/*.test.cjs` suites on this native base, including native-recording-import.test.cjs
- `HABLA_PLAYWRIGHT_MODULE=/workspace/scratch/98d796203697/browser-tools/node_modules/playwright HABLA_HOSTED_ROOT=/workspace/scratch/98d796203697/habla-regional-usage node tests/native-recording-import.browser.cjs` at 390/320px, against hosted build 114
- Existing native-sharing.browser.cjs at 390/844px against the same hosted source
- Plist parsing/project source membership and `git diff --check`

Not yet run: Swift compilation, production signal fixtures and actual file import on Mathew's Mac/iPhone. The Linux environment has no Xcode/Apple frameworks. The prototype is not merged, deployed or installed. The Mac helper runs existing transcript/audio/retry fixtures plus the new production signal test, then builds, signs, installs and launches only after all preceding steps succeed:

`HABLA_DEVELOPMENT_TEAM=<team> HABLA_IPHONE_ID=<device> bash scripts/build-recording-import.sh`

Build log: /tmp/habla-recording-import-build.log. Derived data: /tmp/HablaEcuador-recording-import-derived. No signing/team/bundle-ID settings are rewritten by the helper. Building can download existing Swift package dependencies. The helper is for this prototype; it does not publish or deploy anything.

## Physical checks after a successful build

1. Confirm native 0.1.16 (17). Import a short video that is audibly playing in Photos; choose its dominant language. The original editor stays unchanged until Apply. Review/edit the draft, apply, confirm From/To, and undo.
2. Test Files selection and both picker cancellation paths. Test a video without audio and an audible-track-but-nearly-silent video. Test an unavailable recognition language/model or denied Speech Recognition permission. Existing source text must remain intact on failure.
3. Use an offset within a video longer than 60 seconds; confirm the reported processed interval. Check invalid/beyond-end offsets. Compare a Spanish, English and mixed/sung segment to a manually reviewed private reference. Do not assume accuracy from UI success.
4. Cancel/background during extraction/recognition, reopen and import again. Test starting live capture/retry during import and vice versa; operations must not overlap. Confirm sharing, dictation, music capture, hosted regional dictionary and offline translation still work.

## Primary API references

- https://developer.apple.com/documentation/speech/sfspeechrecognizer/supportsondevicerecognition
- https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition
- https://developer.apple.com/documentation/speech/sfspeechurlrecognitionrequest
- https://developer.apple.com/documentation/photosui/phpickerviewcontroller
- https://developer.apple.com/documentation/foundation/nsitemprovider/loadfilerepresentation(fortypeidentifier:completionhandler:)
- https://developer.apple.com/documentation/avfoundation/avassetexportsession
