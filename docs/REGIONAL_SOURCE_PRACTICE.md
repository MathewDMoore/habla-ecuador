# Script-based regional practice — build 111

Hosted v0.26.1/build 111 adds Work & friends under Practice: four short prompts selected/adapted from a published Radialistas radio-drama script, with English meanings, stress cues, register/context and guided speaking. The existing sunset lesson remains available. A compact disclosure contains one phrase at a time with Previous/Next navigation; speaking controls use the existing in-card controller. The full phrase remains visible while recording and while practising a focused part. Phrase navigation, closing the lesson and changing tabs release the microphone.

Source and rights:

- Original chapter: https://radialistas.net/capitulo-2-camellar-es-lo-primero/
- Series: https://radialistas.net/serie-kiubo-nano-vamos-pa-lante/
- Credit: Radialistas Apasionadas y Apasionados; series co-produced with Catholic Relief Services (CRS).
- The chapter's HTML links CC BY-SA 3.0 ES: https://creativecommons.org/licenses/by-sa/3.0/es/ . Attribution, license, changes and source links are displayed in the lesson. Selected excerpts, the shortened line, original English meanings and learning notes in `regional-practice.js` are shared under that license; no assertion is made about a new license for unrelated application code.
- Stress cues follow RAE–ASALE guidance: https://www.rae.es/dpd/tilde . These are general written-word stress cues, not acoustic error diagnoses.
- The story places a Colombian character with an Ecuadorian family. Colombian-character lines retain an es-CO practice locale; two other lines use es-EC for the Ecuador-set exercise while explicitly leaving actors' origins/recorded accents unverified. A story setting is not proof of a recorded speaker's city or accent.

Audio investigation:

The primary-host MP3 was downloaded to temporary analysis storage and decoded successfully on 2026-10-23. It is 14,768,576 bytes, approximately 615.31 seconds, MP3 stereo at 44.1 kHz. FFmpeg reported mean volume −16.8 dB and maximum 0.0 dB; these values alone do not establish clipping or pronunciation quality. The script contains multiple character voices, music cues and overlapping dialogue. No speech-analysis package was installed in this runtime. Actor accent, word timings and phoneme quality remain unverified. No source audio is included in Git or the offline pack; Hear model uses the existing device Spanish voice. Original audio is linked through the credited source page, not presented as the in-app model.

Recognized-word percentage:

The shared speaking controller now displays a percentage only for a confirmed final result with a nonempty target and at most 200 words on either side. The calculation is `round(100 × ordered matched words / max(expected word count, heard word count))`. Ordered alignment prevents crediting one occurrence twice; omissions, reordered words and extra recognized words reduce the score. Oversized input has no percentage. Case, punctuation and written acute accents are ignored while n and ñ remain distinct. Partial/provisional-only text has no percentage. Counts and the label explicitly identify word recognition rather than pronunciation, accent, stress, rhythm or phoneme quality. No acoustic assessment model/service is added.

Implementation boundaries:

- `regional-practice.js` is a separate attributed lesson-data asset, included on both hosted pages and in the service-worker shell cache. App/cache/worker references advance together to 111.
- No dictionary entries, regional selection, translation/gloss logic, speech provider, native code, signing settings or experimental audio branches change. The existing Practice stepper and all dictionary practice remain functional.
- Lesson content is available with the cached shell. Recognition and voices retain their existing device/provider/offline requirements.
- No private recordings/papers/translations, original MP3, generated models or unrelated/stale files are included.

Validation:

- `node --check app.js`, `node --check regional-practice.js`, `node --check sw.js`, `node --check offline-device.js`, `node --check tests/regional-practice.browser.cjs`, `git diff --check`.
- All 20 `tests/*.test.cjs` suites pass, including attribution/license/uncertainty/data/cache checks and word-score tests for omissions, extras, order, repetitions, empty and oversized input.
- `HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_NATIVE_SCRIPT=/path/to/installed/NativeSpeech.js node tests/regional-practice.browser.cjs` passes at 390×844/320×844 and with installed native 0.1.15 JavaScript at 390×844. It verifies four phrases, English meaning/context/credit, locale, tentative score suppression, confirmed 50%/100%, focus/full-text preservation, prompt and tab cancellation, close, boundaries and the original lesson.
- Existing dictionary-practice and speaking-prompt browser tests pass in all their standard/narrow/native-JavaScript cases. Recognition and playback events are synthetic JavaScript boundaries; physical iPhone/WebKit, actual response latency, audio output and pronunciation assessment remain unverified.
- A mobile native-layout view of the new source lesson was visually inspected.
