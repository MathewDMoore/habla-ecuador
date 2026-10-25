# Spanish subtitle tracks for all four regional videos — build 120

The pilot previously offered an untimed transcript but did not attach a Spanish text track to any of the university videos. Any generated subtitle option supplied by iOS could therefore vary between videos. Build 120 supplies a same-origin WebVTT Spanish subtitle track to Quito, La Paz, Monterrey and Caracas. Each video uses `srclang="es"`, an Español label and the default track attribute. The explicit Spanish subtitles on/off button follows text-track selection changes, including changes made through native media controls. Turning subtitles off remains a deliberate session preference across region changes.

The Spanish text is the complete publisher transcript already bundled in build 119, reproduced under the publisher's CC BY listing. No machine-recognized wording replaces it. The original university video remains streamed, unedited and outside Git. No user recording was used. Model weights and raw recognition outputs are build-time scratch files, not app assets.

## Audio-derived timing and limits

Timing anchors were obtained from the four hash-pinned public MP4s with faster-whisper 1.2.1, Systran/faster-whisper-base at revision `ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66`, Spanish language, CPU int8, beam size 5, word timestamps and previous-text conditioning disabled. FFmpeg decoded 16 kHz mono float audio before inference. The model was run locally in the build environment; no audio was sent to a transcription service and no model is downloaded by the app.

An ordered sequence match aligns the published words with recognized word timestamps. Unmatched publisher words receive approximate positions within the adjacent audio-anchor gap, or the measured video endpoint. All text is retained. The generator rejects less than 95% anchor coverage and invalid timing gaps. Cues are bounded by actual video duration, chronologically ordered, non-overlapping and at most two lines of 42 characters. No timing is assigned by simply spreading text evenly over the recording.

| Recording | Publisher words | Direct anchors | Anchor coverage | Interpolated words | Cues |
| --- | ---: | ---: | ---: | ---: | ---: |
| Quito / beg05d | 186 | 184 | 98.9% | 2 | 21 |
| La Paz / adv06c | 115 | 111 | 96.5% | 4 | 11 |
| Monterrey / beg05a | 87 | 87 | 100% | 0 | 10 |
| Caracas / beg03c | 59 | 57 | 96.6% | 2 | 8 |

`captions/spanish-subtitles.json` records source text/media hashes, model revision, raw timing-output hashes, durations, cue counts and anchor statistics. Timing is explicitly labeled automatic and pending human review. Anchor coverage is not subtitle accuracy, pronunciation scoring or a human listening audit. No phoneme/accent model is introduced. Existing Habla translations remain editable untimed English drafts; English subtitle tracks have not been added. The full transcript remains available if a subtitle file fails to load.

The media abort handler also avoids reporting a play failure when a pending play request is canceled by an ordinary pause/seek. Other playback errors retain their existing error message.

## Reproduction

1. `python3 tests/prepare-recorded-practice-media.py` fetches the existing hash-pinned publisher MP4s into /tmp and prepares explicit WebM browser fixtures.
2. Install `scripts/spanish-subtitles-requirements.txt` in a separate Python environment. FFmpeg, ffprobe and node are also required.
3. `HF_HUB_DISABLE_TELEMETRY=1 HF_HUB_DISABLE_XET=1 python3 scripts/build-spanish-subtitles.py` downloads the pinned public model and computes timing. `--reuse-timing` regenerates VTT/manifest from the preceding raw /tmp timing files.
4. `node tests/spanish-subtitles.test.cjs` checks all four source hashes and complete exact transcripts, finite ordered cue bounds, two-line limits, audio-anchor metadata, default Spanish track markup and cached VTT assets.
5. `HABLA_PLAYWRIGHT_MODULE=/workspace/scratch/98d796203697/browser-tools/node_modules/playwright node tests/spanish-subtitles.browser.cjs`.
6. Repeat with `HABLA_NATIVE_SCRIPT=/tmp/habla-native16.js`, the current installed native 0.1.15 script.

The strengthened browser test supplies byte-range responses for the WebM fixtures, waits for a seekable resource, seeks to an identified middle cue and checks that exact active cue. It loads all four real VTT files, checks Spanish/default mode, on/off, external native-control text-track selection, retained practice prompts, no horizontal overflow and no page errors at 390/320px. Production streams unmodified H.264/AAC originals; Linux browser fixtures are explicitly converted WebM as documented in build 118. Actual iPhone fullscreen track presentation remains unverified.

## Validation and scope

- Baseline recorded-practice and recorded-transcript unit suites passed before edits.
- All 28 `tests/*.test.cjs` suites passed.
- New Spanish subtitle browser test passed 390/320px, including injected native 0.1.15 JavaScript.
- Existing recorded-practice and recorded-transcript browser tests passed native-injected 390/320px, preserving microphone, playback and translation behavior.
- JS syntax checks and `git diff --check` passed.
- Four small VTT files are included in the versioned offline shell; videos still require internet. Metadata manifest is for audit, not runtime model use.
- No Swift, Xcode project, signing, native version, private materials, model weights or audio files are included in this change.

Primary references: https://coerll.utexas.edu/coerll/oer/spanish-proficiency-exercises/ (publisher/CC BY), https://github.com/SYSTRAN/faster-whisper (word timing implementation), https://www.w3.org/WAI/WCAG22/Techniques/html/H95 (HTML text tracks). These are dialogue subtitles, not a claim of full SDH caption coverage.
