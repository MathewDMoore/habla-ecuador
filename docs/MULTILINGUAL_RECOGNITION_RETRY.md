# Multilingual recognition retry prototype

Native 0.1.12 (13), branch `feature/multilingual-recognition`, based on native offline support `2d6da0c`. This prototype is separate from the dictionary audit, hosted build 101 and Shazam song identification. It is not an accuracy fix that has already been verified on an iPhone.

## Behavior

Music → Listening options & help → iPhone speech → Try multilingual recognition.

1. Enable the retry buffer **before** listening. This is off by default and is not persisted.
2. Listen to a short passage and stop. The existing Apple live recognizer remains in use.
3. Tap **Retry last 30 seconds · download model if needed**. The first retry downloads the multilingual Whisper small model and its tokenizer; this is a separate, large download from the translation pack. Wi-Fi and sufficient storage are needed.
4. Read the experimental result. Nothing replaces captured words automatically. **Replace captured words with this 30-second draft** replaces the entire shared source box, not the whole song transcription. Undo restores the previous text unless the user has since edited it. Use the existing Translate captured words action after review.

No extra input/output translation boxes are created. The comparison preview is inside a folded Music disclosure. Capture Stop is not coupled to model inference, so the hosted three-second finishing watchdog does not discard the retry. Status text, cancel, duplicate-tap exclusion, request identifiers and a three-minute UI timeout make pending work explicit. Model cancellation is cooperative; the native layer prevents another model task until the previous one unwinds.

## Recognition and privacy boundaries

- Argmax OSS WhisperKit is pinned to `9f99b5cb6a907730543823ad271b82532782a899` and linked through its WhisperKit Swift package product. Only the public model/tokenizer files are downloaded; user audio is not uploaded.
- The model is `openai_whisper-small`, **not** `small.en`. `task: .transcribe`, `language: nil` and `detectLanguage: true` preserve source-language transcription rather than instructing the decoder to translate everything into English. Automatic detection is not evidence of reliable within-line Spanish/English switching.
- A circular buffer retains at most 480,000 float samples (30 seconds at 16 kHz mono; about 1.92 MB). It copies PCM during capture, never writes audio files, and clears on new capture, New song, disabling the buffer or navigation. Speaking-practice sessions do not request retention. An inference snapshot remains in memory until the running task finishes/cancels.
- A new capture, cancel, background transition, navigation or timeout invalidates the request. Late results cannot edit the source. Downloaded model/tokenizer files persist in Application Support; cache reuse is implemented, but native offline model reuse still requires a device test. The public model repository is not content-hash pinned.
- Silent/invalid samples are rejected before inference. Low log-probability, high no-speech probability, invalid confidence values and excessive compression-ratio segments are omitted. These are conservative heuristic gates, not calibrated accuracy scores. They can omit real sung words. Repeated words are not globally deduplicated.
- Input conversion failures block retry. Existing input/backlog diagnostics remain available. Upstream capture gaps and microphone quality can still affect the retained sample.
- SDK/model license notices ship in the app resource `RecognitionNotices.txt`.

## Validation performed here

- All 13 existing `tests/*.test.cjs` suites passed, including expanded native bridge checks for opt-in, stop gate, duplicate requests, stale replies, cancel, timeout, explicit replacement, undo and speaking-session isolation.
- `node --check ios/HablaEcuador/NativeSpeech.js` and `git diff --check` passed.
- Actual DOM integration against hosted build-101 source passed with `jsdom@30.1.3`: existing shared editors, Music placement, tab navigation, capture/stop, conversation, retry preview, explicit replacement, undo and translation-button availability.

Commands:

```sh
for test in tests/*.test.cjs; do node "$test" || exit 1; done
node --check ios/HablaEcuador/NativeSpeech.js
git diff --check
HABLA_JSDOM_MODULE=/tmp/habla-review-dom/node_modules/jsdom \
HABLA_HOSTED_ROOT=/workspace/scratch/98d796203697/habla-offline-validation \
node tests/native-layout.dom.cjs
```

## Required Mac/iPhone verification

This Linux workspace has no Swift/Xcode/Apple frameworks. These checks have **not run here**:

```sh
python3 tests/run-native-transcript-state.py
python3 tests/run-native-audio-stats.py
python3 tests/run-native-music-review.py
xcodebuild -project ios/HablaEcuador.xcodeproj -scheme HablaEcuador \
  -configuration Debug -destination 'generic/platform=iOS' \
  -derivedDataPath /tmp/HablaEcuador-recognition-derived \
  DEVELOPMENT_TEAM=P43N26B5TN -allowProvisioningUpdates build
```

The new Swift test exercises the production PCM converter, opt-in, 48 kHz stereo → 16 kHz mono, signal preservation, ring wrap/order/capacity, repetition, clear/reset and quality gates without downloading a model. A successful Xcode build must also verify the pinned SDK against Xcode 27.

On the iPhone, compare both recognizers on the **same retained 15–30 seconds**, using English, Spanish, mixed-language audio and an instrumental/silent negative case. Count substitutions, omissions and extra words against a manually checked private reference. Do not commit recordings, lyrics or private reference text. Verify cancel/background/retry, download failure and airplane-mode model reuse. Do not make this the default recognizer or claim better music accuracy until measured. The supplied 2026-10-22 11:49:57 screen recording has a silent audio track (ffmpeg peak/mean about -91 dBFS), so it cannot serve as a recognition benchmark.

No signing identity, bundle identifier, deployment settings, dictionary data, hosted version, private papers or user audio are changed by this increment.
