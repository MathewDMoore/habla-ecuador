## Build 63 — new text on device

Added an opt-in downloadable Spanish ↔ English pack using pinned quantized OPUS-MT models and Transformers.js 2.17.2 in a dedicated worker. Runtime/model files are browser-cached outside GitHub; private documents and generated drafts are never added to model downloads. Download both directions once (about 250 MB), then select Use on-device translation. Translation always uses local-files-only model loading; local errors never trigger a silent online fallback. Existing verified phrases and research matches remain first. All text is chunked without truncating input, retaining protected research tokens and paragraphs; editable drafts, UK/US spelling choices and regional review labels remain.

Service-worker upgrades now delete only old app-shell caches, preserving model/runtime caches and other applications. A single WASM thread works without cross-origin isolation on GitHub Pages. One direction is loaded in memory at a time. Browser storage clearing can remove the pack; mobile speed/memory and device dictation/voices vary. Whole-paper import/printing remains separate and private. No new research paper is treated as training data.

Validation: all existing regression suites plus offline cache/routing tests pass. Live model/output checks recorded after deployment below.

# Habla Ecuador development handoff

Updated October 6, 2026 (America/Denver).

## Current app

- Canonical active source: `MathewDMoore/habla-ecuador`, `main`.
- Active hosting: https://mathewdmoore.github.io/habla-ecuador/
- Standalone translator: https://mathewdmoore.github.io/habla-ecuador/translator.html
- Current source: v0.22.10, build 62; continue from these root files.
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

## Build 57

User reported that Pause sometimes stayed visible with no Resume action on iPhone. The old control trusted `speechSynthesis.paused` from asynchronous events. Playback now owns its paused state, cancels the current utterance while retaining a word position, and submits the remaining text when Resume is tapped. Each sentence or short segment has its own utterance; cancellation events are invalidated before canceling, so late end/error/boundary callbacks cannot reset Resume or skip text. On voices with no boundary events, Resume repeats the current sentence or short segment; the translator explains this fallback. Voice, language and rate are retained through resumption. Native pause/resume events no longer govern the label.

Added a per-paper “Read full paper” link next to an explicitly named excerpt button. The UI states that each reference is two abstract sentences and explains section-by-section translation for longer papers. Full-paper ingestion, full-paper bilingual alignment and model training are not implemented. Over-limit research input now shows the actual 8,000-character/20-segment limit instead of an unrelated network-error message.

Regression checks simulate stale native flags, synchronous cancellation errors, late end/boundary events, pausing before loading, rapid taps, word-position resume, sentence fallback, three-sentence completion, and replacement/cancellation. Existing conversation, editable translation and research tests pass. Actual iPhone audio and resume still require the user's next check; the cloud browser has no installed speech voices.

## Verification

Run:

```sh
node --check app.js
node --check document-import.js
node --check saved-paper.js
node tests/saved-paper.test.cjs
node tests/document-import.test.cjs
node tests/translation-service.test.cjs
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

## Build 58

Added Choose document to both translators: Word .docx, selectable-text PDF and UTF-8 .txt, up to 10 MB and 200,000 extracted characters (PDF up to 100 pages). Extraction is local, text-only, with an explicit preview. Import defaults to UK English and Research while preserving a selected Spanish source variety; Ecuador is the default source if previously English. The document is split into sections that fit the free engine's character/segment limits, with every extracted character retained. Only an explicit Translate this section sends text to MyMemory; editing and selector changes during import remain a preview. Source edits are retained when changing sections during the session. No document bytes are sent, no account or paid API was added. Documents are retained only in memory until closing/reloading, and their layout/images are not imported. Legacy .doc needs a .docx copy; scanned PDFs need OCR outside this app.

Added an editable UK/US spelling comparison of the current English draft. The existing limited variety converter is reused, so comparison does not consume another service request and is not presented as independent translation or comprehensive dialect rewriting. Comparison edits are saved locally by source context and variety.

On-demand readers: Mammoth 1.11.0 (BSD-2-Clause, https://github.com/mwilliamson/mammoth.js) using extractRawText only; PDF.js 6.3.289 (Apache-2.0, https://github.com/mozilla/pdf.js), pinned jsDelivr npm distributions. No bundled dependency or archived app copy. First import requires internet to load its reader. Raw imported text is never interpreted as HTML.

## Build 59

Live Word import, explicit preview, UK default, local reference translation and editable UK/US comparison were verified in the cloud browser. A real PDF test exposed PDF.js 6's removed PDFDocumentProxy.destroy method. Cleanup now destroys the loading task; successful and failed parse cleanup have regression checks. Word import was already functional in build 58. iPhone Files picker interaction still requires on-device checking.

## Build 60

User's screenshot showed a failed new-passage translation. The prior successful Word demonstration retrieved a local reference; it was insufficient evidence for online whole-document translation. A new unmatched Spanish passage was successfully translated via the live app and MyMemory API during investigation. This does not reproduce or identify the user's device-specific failure; its old generic message cannot distinguish quota, timeout, network or service rejection.

Added classified errors based on actual HTTP/payload/fetch evidence and a user-initiated Retry translation action. Provider quota/warning text never becomes an editable translation. Successful segments and concurrent identical requests are reused in memory (bounded to 200 entries); failed segments are not cached. Timeout is 20 seconds. Superseded input stops sending subsequent segments. Comparison is disabled until an English draft succeeds. Imported-document retries retain the document status flow.

All new passages now use bounded splitting, including Everyday mode: the old 500-character slice silently cut off longer input. Segments use a conservative 430 UTF-8-byte budget, keep paragraph separators and avoid decimal/surrogate corruption. The service accepted a 489-character/531-byte test, so byte counting was not established as the cause of the screenshot. No automatic service change or quota bypass was added. The service worker now handles same-origin app assets only and never substitutes cached HTML for cross-origin API failures or missing JS assets.

Regression checks cover full long-input delivery, Unicode budgets, decimals, cached partial retries, quota/warning payloads, HTTP rate limits, offline/network/timeout/invalid response errors and stopping superseded batches. Whole-document export and any guarantee of full-paper availability or academic fidelity remain unimplemented; free-provider restrictions still apply.


## Build 61

Research now starts with a private complete-paper reader. A user imports a Habla saved-paper JSON containing the whole Spanish source and both completed English drafts. It persists in localStorage on that browser/device, restores after reload, and supports independent UK/US edits, comparison, whole-paper playback with the existing Pause/Resume engine, Print / Save as PDF, English text download, backup export, and removal of the device copy. Storage failures are reported; users can download a backup before clearing browser data. Import validates required text fields and size limits, strips unsupported data, and displays source/translation as text. No fetch or translation-service call occurs for any saved-paper operation.

The three licensed Ecuadorian samples and Mexican reference are preserved behind Optional research reference excerpts, below the personal-paper reader. Existing section-by-section import remains available for new, untranslated documents; it does not automatically become a complete translation. Existing regional, conversation, playback, editable translation and translation-service regression checks pass alongside private-paper tests.

Only generic code and synthetic tests are published. User-supplied papers, source text, author details, completed translations and personal saved-paper packages must never enter this public repository or its version archives. A completed private paper is delivered separately to the user for one-time Files import; the public website cannot automatically load a private ChatGPT attachment on their iPhone. No model training, paid API, build system, dependency or version archive was added.


## Build 62

Saved-paper actions have a minimum 44 px tap height and match the existing app button style. Updated script, style and service-worker cache URLs so devices receive the phone control sizing after the initial build 61 release. Complete-paper behavior and privacy are unchanged.
