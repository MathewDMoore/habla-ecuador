# Native-speaker regional practice pilot — v0.26.8 / build 118

Practice → Native voices · regional speaking pilot. Ecuador / Quito is the default. The learner can choose Bolivia / La Paz, Mexico / Monterrey, or Venezuela / Caracas immediately. Each selection keeps a short Spanish excerpt, English meaning and practice cue visible. Play native recording loads the full original video only after a tap; its standard controls provide seeking and replay. Starting speech recognition or device TTS pauses it. Closing the pilot, changing region, hiding the document, navigating tabs or starting other page media stops playback. Repeated taps during a pending play request are ignored; stale play completion cannot resume playback after cancellation. Errors retain the prompt and link to the original recording/transcript.

The existing speaking-practice controller supplies microphone start/stop, recognized text, ordered word matching, focused retry, provisional-result guards and honest percentage labels. Device voice is explicitly distinguished from the native-speaker recording. Recognition uses the app's existing mode and the selected Spanish locale; it is not a new offline acoustic scorer. One voice per region is only a pilot sample. No phoneme grading, regional accent classification, fluency measurement, model training or calibrated pronunciation percentage is claimed.

## Evidence and rights

Orlando Kelm / COERLL / The University of Texas at Austin, Spanish Proficiency Exercises. The publisher identifies the collection as native-speaker clips and lists CC BY: https://coerll.utexas.edu/coerll/oer/spanish-proficiency-exercises/ . No license version is inferred from the category label. Source identity, source link and publisher/license link remain visible in the lesson's compact source details. Short excerpts were selected and original English meanings/practice cues added. Streamed originals are unmodified; no university recording is committed or included in the offline shell.

| Example | Publisher's regional label | Source / transcript | Original media check |
| --- | --- | --- | --- |
| Alejandra Z. | Ecuador, Quito | https://www.laits.utexas.edu/spe/vid/beg05d.html | HTTP 200, 5,518,729 bytes; 75.21 seconds; mean -18.3 dBFS, peak -2.3 dBFS |
| Mónica V. | Bolivia, La Paz | https://www.laits.utexas.edu/spe/vid/adv06c.html | HTTP 200, 2,438,748 bytes; 66.11 seconds; mean -20.8 dBFS, peak -4.4 dBFS |
| Alfredo C. | Mexico, Monterrey | https://www.laits.utexas.edu/spe/vid/beg05a.html | HTTP 200, 1,514,751 bytes; 39.08 seconds; mean -12.3 dBFS, peak -3.6 dBFS |
| Deyanira H. | Venezuela, Caracas | https://www.laits.utexas.edu/spe/vid/beg03c.html | HTTP 200, 2,718,986 bytes; 49.48 seconds; mean -16.6 dBFS, peak -4.0 dBFS |

Checked October 24, 2026. All four publisher MP4s decoded with FFmpeg: H.264 video, AAC stereo, 44.1 kHz. Published transcript excerpts and region labels were checked against source pages. Mónica describes mixed Bolivian/Mexican family background; this is disclosed. The pages identify regional provenance, not a universal city accent or a regional scoring norm. Signal measurements demonstrate audio presence, not human-verified intelligibility, exact excerpt timestamps or recording suitability for phoneme calibration. No listening audit or segment alignment has been completed. The player therefore uses full originals, with no invented seek times. The Caracas phrase is later in its example.

## Validation

- Baseline: `node tests/regional-practice.test.cjs` and `node tests/dictionary-practice.test.cjs`.
- `node --check app.js` and `node --check recorded-practice.js`.
- All 26 `tests/*.test.cjs` suites passed, including the new data/asset/rights-boundary check.
- `python3 tests/prepare-recorded-practice-media.py` prepares reproducible hash-pinned media fixtures outside Git. Linux Chromium lacks H.264/AAC support; the browser tests explicitly use FFmpeg-converted WebM fixtures of the same sources. Production continues to stream the original MP4s.
- `HABLA_PLAYWRIGHT_MODULE=/workspace/scratch/98d796203697/browser-tools/node_modules/playwright node tests/recorded-practice.browser.cjs`.
- Repeat that browser test with `HABLA_NATIVE_SCRIPT=/tmp/habla-native16.js` extracted from `debug/iphone-swipe-input`, native 0.1.15 (16). At 390/320px: four selectable examples, visible prompts, decoded test media, no autoplay/eager media request, recognition feedback and microphone/playback exclusion, navigation/close cleanup, source-error fallback, zero page errors and no horizontal overflow.
- Existing `tests/regional-practice.browser.cjs` passed browser 390/320px and native-injected 390px, preserving the earlier radio-story lesson and sunset lesson.
- `git diff --check`.

Physical iPhone playback/microphone behavior, subjective recording quality and region-specific recognition accuracy remain unverified. No Swift, Xcode project, signing or native version changes. Hosted text/controller assets are cached; original videos require internet and are not predownloaded. No new user-audio storage or upload endpoint; microphone handling remains with the existing recognition controller.
