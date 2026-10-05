# Habla Ecuador development handoff

Updated October 5, 2026 UTC (October 4 in Wyoming).

## Current app

- Canonical active source: `MathewDMoore/habla-ecuador`, `main`.
- Active hosting: https://mathewdmoore.github.io/habla-ecuador/
- Standalone translator: https://mathewdmoore.github.io/habla-ecuador/translator.html
- Current source: v0.22.4, build 56; continue from these root files.
- The separate ChatGPT Site `appgprj_6a9537dcc2d48191b05edbb227f05bd4` is still hosted version 9, last updated September 25. Its source is an older implementation, not the current root source. It was inspected, not rewritten or synchronized during this update.

## Preserved work

Ecuadorian-first phrases, evidence-backed vocabulary and Ecuador/Bolivia comparisons, Mexico source selection, US/UK English, speech playback and rates, selectable voices, typed/dictated translation, conversational turns, local editable translations, music, lessons, and the Mexican research-abstract reference remain in place. Regional and research claims retain their existing review labels. This update does not claim that the free engine is trained or fine-tuned.

## Build 53

- One recording owns its callbacks; late results, start, error, and end events from a replaced recording are ignored.
- Ending a recording without a confirmed final result retains its last transcript once and labels the conversation transcript as needing checking. Unconfirmed turns do not play automatically.
- Starting a microphone stops existing and scheduled speech playback. Final conversation playback waits for the microphone to close.
- Switching speakers keeps any available interim transcript without letting old events disturb the new recording.
- Clearing the conversation aborts recording, cancels scheduled speech, and invalidates pending conversation responses.
- Older translations can finish as text without replacing a newer turn's status or interrupting its microphone.
- Conversation recording and playback use the selected Spanish and English locales. A pending request retains its original target and everyday purpose even if selectors or research mode change.
- Ecuadorian library rewrites are limited to the Ecuadorian conversation route; Mexican/Bolivian requests use the existing general engine.
- Cache and script URLs identify build 53. No copied version archive, dependency, paid API, or new service was added.

## Build 54

Added two Spanish/English abstract sentence pairs from the licensed Sellers and Espinoza (2017) Cuenca air-quality paper to the local research translation memory. Research mode now has a “Try Ecuadorian research” sample alongside the Mexican reference. Matched excerpts stay local; changed facts fall back to the existing engine. Source credit and the CC BY 3.0 license appear with the result. English adaptations are distinguished from published English and still require subject-expert review. The source manifest records attribution, excerpt hash, license evidence and the quarantined newer ACI paper with conflicting licenses. No model was fine-tuned and these integrated examples are not a held-out benchmark.

## Build 55

Expanded the Ecuadorian research memory from one paper/two pairs to three papers/six pairs. Added selected Spanish/English abstract sentences from Anaguano-Yancha (2017), DOI 10.18272/aci.v9i15.294 (Sangay fish diversity), and Fernández de Córdova, Nivelo-Villavicencio and Astudillo (2017), DOI 10.18272/aci.v9i15.770 (Morona Santiago bat specimen). Both original article copyright notices link CC BY 3.0; current journal footers state CC BY-NC 4.0. Preserve the item-specific grant and do not extrapolate it to newer papers. The intake manifest records this distinction.

Both translator screens now have an accessible Ecuadorian sample selector. Result attribution follows the actual matched paper. Selected passages can match as one paragraph or separate paragraphs, while changed counts/dates and mixed-paper passages reject local retrieval. Editing, English variants and the Mexican reference retain their existing behavior. No paid service, dependency, archived project copy or model training was added.

## Build 56

Added Pause/Resume beside Hear it and in Conversation mode for synthesized translation playback. The controls track a playback request, including the short voice-loading delay; end/error disables them. Replacement playback, microphone start, conversation clearing and rhythm drills reset the paused synthesizer. Late events from canceled utterances cannot change the current controls. Existing speech voice selection, rate and language behavior are preserved. The browser SpeechSynthesis pause/resume API is used without a paid service or dependency. Real iPhone pause/resume behavior still needs on-device checking.

## Verification

Run:

```sh
node --check app.js
node tests/conversation.test.cjs
node tests/speech-playback.test.cjs
node tests/research-reference.test.cjs
node tests/ecuador-research.test.cjs
git diff --check
```

These passed before publication. Conversation tests simulate recognition events and delayed translation responses, including cross-language transcripts, locale changes, stale events, final playback, clearing, and saved-edit isolation. Research tests check fidelity, terminology, citations, source-context isolation, chunking, both English variants, licensed Ecuadorian retrieval, and changed-input rejection. The old research test's build-48 URL assertions were replaced with current script-order/cache checks.

Physical iPhone microphone and voice testing is still outstanding. No claim of live bilingual recognition, native Ecuadorian voices, or offline general translation follows from simulated tests. The browser still recognizes speech using one selected locale; language detection routes the transcript it returns, so recognition quality when the speaker changes language must be checked on-device.

## Next concrete step

Run a short iPhone regression on the deployed standalone translator: final/interim dictation, quick speaker switching, Spanish spoken under the English speaker, selected Mexico/Bolivia and US/UK voices, clearing while a response is pending, edited translations after reload/flip, and the Research mode Ecuadorian excerpt. Use observed failures for the next fix. Do not rebuild completed screens or treat the old ChatGPT Site as current source.

Keep the public static GitHub Pages route and no-build architecture. Use a single commit for a release; avoid repeated full-directory archives and their redundant deployment runs. Git history already preserves source revisions.
