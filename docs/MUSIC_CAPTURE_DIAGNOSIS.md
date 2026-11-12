# Music capture loss diagnosis

The system-audio prototype limits outstanding callbacks to 20 before dispatching to the main queue. A full gate discards a source sample buffer before conversion and before `NativeInputStats.observe` or analyzer forwarding. Until this change, these losses were invisible to both the input meter and analyzer rejected-buffer count. Healthy levels and zero analyzer rejections therefore did not establish lossless capture.

This increment counts those upstream losses on the capture queue with the existing stats lock, without retaining samples or creating additional main-queue work. The diagnostic reports buffer count and source duration separately from analyzer rejections. Invalid durations count as a lost buffer without poisoning the duration total; the source format/sample count supplies a fallback duration when possible. The input label is now neutral because it covers microphone and system audio.

This does not establish the cause of the reported inaccurate sung words, improve recognition, change its locale, or promise bilingual recognition. It does not eliminate losses, remove queue bounds, change audio routing, increase memory budgets, collect recordings, or save lyrics. A backlog loss is evidence of an input gap; zero backlog drops only excludes this particular drop path. Other conversion, delivery, recognition and transcript errors still require investigation. Analyzer stream evictions are separate and remain counted by the existing rejected-buffer path.

## Validation and next measurement

JavaScript regression checks: `for testfile in tests/*.test.cjs; do node "$testfile" || exit; done`.

On macOS, run `python3 tests/run-native-audio-stats.py` and `python3 tests/run-native-transcript-state.py`. The synthetic PCM test covers signal conversion, upstream drop accounting independent of analyzer rejection, invalid durations and concurrent counters. These tests require Apple's frameworks. Linux cannot validate Swift compilation or iOS 27 capture. Xcode 27 and a physical iPhone are still required before installation claims.

Use a bounded comparison with the same user-provided or openly licensed excerpt and known reference words: first clear spoken Spanish, then sung Spanish, then a Spanish/English switch. Preserve the selected source locale in the report. Compare captured words before translation; distinguish substitutions, deletions and insertions from translation errors. Record input route, audio durations, upstream drops, analyzer rejections and result counts. Do not infer recognition accuracy from volume meters. Do not commit the recording or copyrighted reference text.

If input duration is missing or drops rise, investigate capture scheduling before changing recognition. If delivery is intact but transcription is wrong, evaluate a music-capable multilingual recognition backend against that reference. Native recognition remains fixed to the selected language. This diagnostic increment is stacked on the native screen-cleanup prototype, separate from hosted build 100, and must not be merged or described as an accuracy fix without native validation.
