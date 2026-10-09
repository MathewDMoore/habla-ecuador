## Primary product objective

A polished, easy-to-learn translation app for Maria on iPhone or another smartphone, shareable with other users. Prioritize a clear phone experience, reliable translation/voice controls, editable drafts, private document handling, offline capability and free-tier hosting. Phone installation guidance and Share app controls remain pending. Build 69 extends screenshot import with local area selection and contrast handling.

## Build 79 — personal whole-song listening

Whole song is now the default listening length, with a 10-minute limit and an optional 30-second passage. It collects a single editable source transcript across recognition sessions. A normal browser end after returned words attempts a restart, appending the next session exactly once. Restarts can lose audio between sessions; silence, permission and service errors stop rather than loop. Continue listening appends after a manual pause or translation; New song explicitly clears the current source for a fresh capture. Changed source language, imported text and ordinary dictation cannot append an old song accidentally. Source edits remain usable for continuation. Music controls never publish a song or save an audio recording; browser recognition and selected translation services retain the existing privacy behavior.

All twelve suites pass, with whole-song restart accumulation, interim replacement, preservation of repeated choruses, pause/continue, continuation after translation, cancellation during a restart gap, locale changes, errors preserving earlier words, new-song reset, and duration boundaries. Existing document, offline, regional, conversation and playback suites remain green. Syntax and whitespace checks pass. GitHub Pages run 37971406198 succeeded for source commit b6fcf09. Live build 79 confirmed the default Whole song selector, short-passage switching, New song clearing the source, and microphone-denial recovery with the selector re-enabled. The expanded help matched the continuation and privacy behavior; a final screenshot shows the whole-song controls. The cloud browser cannot provide actual sung input. Actual singing recognition on a physical phone remains untested; the feature collects the words the browser recognizes, not guaranteed complete or accurate lyrics.

## Build 78 — music from another device

Adds Listen to music in both translators. Browser microphone recognition collects a short passage using the selected From locale. Stop listening or a 30-second limit ends capture; the browser may end sooner. The user reviews/edits the words before explicitly translating them through the existing online/on-device route, editable draft, regional context and U.K./U.S. comparison. Recognition does not identify songs or retrieve full lyrics. Singing and backing instruments can reduce accuracy. Browser recognition may send audio online; Habla does not persist an audio recording. No paid service, new dependency, bundled lyrics or audio archive is introduced.

The regular one-phrase microphone remains unchanged. Continuous capture retains all returned results, bypasses dictation-specific transcript corrections, rejects stale events and keeps interim text after an early end. Capture pauses app audio and speech playback. Switching microphones, importing text, editing the source, changing From, leaving Translate or hiding the page releases capture. A stop watchdog clears a browser that fails to send end. Captured text waits for explicit translation; recognition/network/permission errors remain visible and preserve captured words.

Validation: all twelve suites pass, including continuous final/interim accumulation, selected locale, stale handoffs, early ends, no-speech/network errors, 30-second timeout, missing-end recovery, edit protection, unsupported browsers and review-before-translation. JavaScript syntax and whitespace checks pass. GitHub Pages run 37968290518 succeeded for source commit 9337cf6. Live build 78 showed the selected Ecuadorian Spanish → U.K. English pair, new controls and closed help disclosure. The cloud browser denied microphone access; the error stayed visible, the Listen button recovered and existing text was retained. A reload confirmed the fresh UI. Actual singing capture on a physical iPhone has not been tested; this is a speech-recognition-based first step, not a music transcription model.

## Build 77 — source-attested slang and vulgarity notes

Adds 15 scoped recognition entries to the closed Context & regional expressions disclosure: huerco/huerca, güey/wey, no mames, chamo/chama, pana, coño de su madre, coño, pata, ni huevón, huevón/huevona, parce/parcero, gonorrea, chuta, pucha and ¡puta!. Country scope, literal alternatives, register and U.K./U.S. editorial English options are explicit. Source-attested does not mean every English gloss is independently validated or every speaker uses the word. Shared words never select a country or city automatically. Profanity is explained without silently sanitizing or increasing its strength; source and translation edits stay intact. Academic mode bypasses these conversational notes.

City evidence: Mexico's SEP explicitly documents huerco in Monterrey and other northern cities; UNAM's 2006 Mexico City study documents güey and no mames; Mahecha Ovalle (2018), Enunciación, documents Bogotá youth address including gonorrea and parcero and adult attitudes toward it. These sources do not establish exclusivity, universal acceptability or current city-wide frequency. Caracas and Lima guidance is country-attested, with city-specific review pending. Dictionary references: ASALE, RAE DLE, El Colegio de México DEM and Academia Peruana de la Lengua. Reference links accompany the meaning notes. Brief original editorial guidance is bundled; dictionaries, interview transcripts and the thesis are not copied into a training corpus.

Recognition is local and adds no service calls or large downloads. The disclosure now sits outside the translation result so meaning notes survive a network/quota/pack error. Compound phrases take precedence over nested words; independent later occurrences still appear. Unicode boundaries preserve ñ so cono is never flagged as coño. Clear medical context retains gonorrhea/gonorrhoea and avoids assuming an insult.

All eleven suites pass, including region scope, spelling, quote recognition without rewriting, mild versus vulgar register, compound precedence, clinical context, US/UK options, and local notes after a network failure. Syntax and whitespace checks pass. Build 74 live verification confirmed notes but exposed the free engine reading huerco as orchard and no mames literally. Build 75 prepares unquoted, lower-case physical-person huerco descriptions as niño/niña only for a Mexican source; names, quotations, demonic contexts and academic text are preserved. Literal suck/breastfeed drafts for idiomatic no mames get a review prompt offering surprise/rebuke alternatives without automatically choosing one. Edits clear that prompt when corrected. Build 76 adds explicit surprise/rebuke buttons when exactly one literal no mames reading is detected. Choosing a meaning changes only that literal phrase, saves it through the existing edit workflow, and preserves the source/rest of the draft. Restore and stale-source guards are tested. Live build 76 verified child wording, both meaning choices, restore and saved rebuke wording after reload. Venezuela/Peru/Colombia recognition and country/city labels were also verified through local Spanish routes. Build 77 fixes the standalone disclosure heading contrast found during visual QA. Pages deployment succeeded and live build 77 was confirmed. The saved meaning survived another reload; the heading/reference links were readable in the final screenshot. Source text remained unchanged. The functional regression suite results still apply; no physical iPhone or exhaustive dialect accuracy claim.

## Build 73 — untranslated size wording and review checks

The user supplied a competitor/app comparison showing an ordinary size adjective left untranslated in Habla Ecuador. Adds source preparation for chiquito/chiquita forms only in physical-object size descriptions. The engine sees the neutral pequeño form; the original source and all saved edits remain unchanged. Academic text, quotations, names/brands and other senses are excluded. Cart/car/toy ambiguity is explained, not silently decided.

A small local residual-Spanish check flags selected common words still present in an English draft. It updates when the user edits/restores a draft and does not certify accuracy. Musical loanwords, academic text and quoted terms are not treated as errors. Context reference links now have readable contrast on the result card. No extra online request, paid tier or bundled model. Broader accuracy needs systematic evaluation; there is no evidence that this prototype matches or exceeds Google Translate generally.

All eleven regression suites and JavaScript syntax/whitespace checks pass. Pages deployment succeeded. Live build 73 read the user's comparison screenshot locally using the 10–21% image area, recovered the original Spanish without manually retyping it, and translated the size phrase as Small Wooden Carts. Source wording remained unchanged, context notes stayed collapsed until opened, and reference links were readable. This is a verified example improvement, not a general quality benchmark or physical iPhone test.

## Build 72 — invitation meaning and more source varieties

Live build 71 improved the supplied image's affectionate address and connected OCR blocks, but left a literal that in an invitation followed by a reason. Adds a bounded editorial because correction only when a source affectionate address and selected imperative/reason construction agree with the same English verb and clause. Relative clauses and quotes remain unchanged. The original source, edits, chosen regions and academic translation stay intact. RAE's que entry (causal sense) informs this local editorial rule; it is not a lyrics memory.

Adds independently selectable Venezuelan, Peruvian and Colombian Spanish on both sides. Language help names Caracas, Lima and Bogotá as city contexts requiring local review, not trained city dialects. Speech requests the country locale and uses available device voices. Colombian employment contexts can use the attested camello work sense; other regional meanings remain review clues.

All eleven suites and syntax/whitespace checks pass. Live build 72 recovered the posted image from bytes and used an affectionate address plus a causal connector in the English draft; the incomplete ending was flagged. Venezuela→Peru and Colombia→UK selections worked independently. Country/city guidance and meaning references appeared in closed disclosures. Pages deployment succeeded; this does not certify full lyrics accuracy or physical iPhone performance.

## Build 71 — meaning and regional usage clues

Adds a closed Context & regional expressions disclosure. Local, source-linked clues cover affectionate address, pleasure, wanting/loving, camello, ñaño/ñaña and guagua. These are usage clues rather than automatic country detection: shared expressions never change the user's selected source variety. Missing endings in images are flagged rather than completed. Dictionary references are consulted and paraphrased for editorial guidance; they are not downloaded into a training corpus.

Everyday Spanish-to-English drafts can clarify a single explicit affectionate address from heart to sweetheart and a parenthetical literal rich/tasty rendering in a clear touch/affection context. Academic translation bypasses these changes. Quotations, medical senses, food/wealth, negation and ambiguous wanting/loving are protected or left for review. Both online and on-device generation use the same local rules. Image block joins now reconnect selected dangling conjunctions/estar constructions, preserving the original editable OCR source.

Embedded camello preparation now requires local sentence employment cues and an Ecuadorian or Mexican source selection. Animal and Bolivian shoemaking contexts remain unchanged. Fixed the existing regex escape helper. No extra provider, model download or paid service; no screenshot or lyric passage is embedded in public source or tests.

Validation: all eleven regression suites, JavaScript syntax and whitespace checks pass. Checks include online/local refinement, medical/food/wealth/negation/quote isolation, ambiguous wanting/loving, regional source preservation, separate-sentence employment cues and original research image line breaks. Build 71 Pages deployment succeeded. The actual supplied image recovered 253 characters after selecting 17%–73%; the English draft used sweetheart and retained the connected love clause. Its remaining literal causal connector motivated build 72.

## Build 70 — image sentence context

For everyday images, join screen-wrapped lines within each OCR paragraph before calling the selected engine; keep paragraph breaks and the original editable source. Research images keep their line breaks and protected tokens. Existing typed text/document routes are unchanged.

Image-to-English drafts apply three bounded source-scoped editorial corrections: numbered counting constructions can change account of to count of; a single track/runway can become dance floor when source dance cues and passage music cues agree, excluding airport/athletics/audio/recording contexts; a standalone volume imperative in a music passage can change lift/raise it up to turn it up. These rules work after either online or local generation. Ambiguous expressions are deliberately retained for editing; this is not a general lyrics model. No song, author, lyric passage or screenshot is embedded into public source or memory.

All ten regression suites pass, including untouched research line breaks, paragraph retention, account/payment ambiguity, airport and audio-track isolation, salary/box meanings and ambiguous relationship wording. Live build 70 verification passed from the supplied image bytes: Paste image, select 14%–74%, Read selected area and Translate image text. All visible lyric text was retained, including faded lettering; the editable draft used count of three, dance floor and turn it up. The ambiguous relationship/switching expression remains for review. Pages deployment succeeded. These results do not certify general lyrics accuracy or physical iPhone performance.

## Build 69 — text from coloured phone screenshots

The user's supplied coloured lyrics screenshot was tested through Paste image in live build 68. Most main text was read, but player/status controls were included and faded lettering was garbled. Added an Image area disclosure with a private image preview and start/stop sliders; Read selected area rereads only the vertical region chosen by the user. Full image reading remains the initial default. No music app, title, artist or lyric is hardcoded into recognition, tests or translation memory.

Local contrast processing detects a dominant solid background (at least 60% of colour bins) and maps contrasting lettering, including faint light text, to black on white before OCR. Images with mixed backgrounds keep their colours. Image bitmap/canvas work stays on device, with an Image fallback where createImageBitmap is absent, and a 16-million-pixel cap. Preview object URLs are revoked on replacement/close; images are not stored or published.

The action is now Translate image text, directly below the editable extracted text. Single images hide irrelevant document-section fields; multi-section documents/images keep their navigation. Changing to a document or closing the image cancels old recognition and clears its preview. Translation starts only when the user taps Translate image text; reviewed text uses the selected online or on-device engine. No paid service, model archive or private paper is added to GitHub.

Validation: all ten regression suites, JavaScript syntax, HTML nesting/unique IDs and whitespace checks pass. Live build 69 read the supplied full coloured screenshot, including the formerly garbled faded line. Selecting 14%–74% via Image area recovered all visible lyrics without the clock, title, artist or player controls. Recognition was performed by the app from image bytes, not by manually supplying transcribed text. The draft exposed literal counting/dance/volume wording; build 70 handles those bounded contexts. Actual iPhone permissions/performance remain unverified.

## Build 68 — compact help and screenshot translation

Both translator screens now put language, import, research, comparison, privacy, playback and offline explanations behind closed native disclosure controls. Essential actions, warnings, language selectors, editable drafts, actual comparison differences and an online/on-device mode badge remain visible. Home voice settings are collapsed. Existing document and saved-paper controls remain available.

Added Screenshot and Paste image controls plus image paste into the input. PNG/JPEG/WebP/BMP images up to 10 MB are read locally with lazily loaded, pinned Tesseract.js 6.0.1 and core 6.0.0; the selected source language chooses Spanish or English recognition. Reader/language downloads may need a connection. Image bytes are never uploaded for OCR. Extracted text is editable in the existing section preview and requires Translate this section before translation; online translation still sends that reviewed text to MyMemory, while selected on-device translation stays local. No private paper, model weights, OCR vendor files or media archive is committed. No paid service is added.

Cancel keeps existing input. Pending OCR cannot overwrite later typed text or a newer import; workers are serialized and terminated on completion, failure or cancellation. Unsupported clipboard access falls back to normal Paste in the input or Screenshot from Photos/Files. OCR errors and unreadable images keep existing text. The 16-million-pixel guard limits large camera images; recognition accuracy and physical iPhone performance still need checking.

Validation: all ten regression suites pass, including screenshot extraction/cleanup, clipboard selection, stale-result protection and preview-before-translation. JavaScript syntax, HTML nesting/unique IDs and whitespace checks pass. Cancellation also settles recognition requests that never respond after termination, allowing the next image to proceed. Live build 68 Chrome verification passed: Paste image and direct input image paste extracted both Spanish sentences accurately, preserving accents and the line break. The preview required an explicit Translate this section action, and the editable U.K. draft read The water is clean / Tomorrow we will go to Quito. Pages deployment succeeded. Physical iPhone permissions/performance and the Photos picker remain unverified; the cloud file-chooser test stalled in the browser-control layer. Cancellation settlement and restart are verified by regression tests.

## Build 66 — meaningful U.K./U.S. comparison

Added a local, source-scoped editorial layer for five everyday pairs: flat/apartment, lift/elevator, holiday/vacation, pavement/sidewalk and petrol/gasoline. Sentence alignment must match before vocabulary adaptation; ambiguous floor/surface/tyre, lifting, public-holiday and road-surface meanings remain unchanged. Articles follow apartment/flat and elevator/lift substitutions. These remain regional adaptations of a single draft, not independent translations or a general semantic model. Existing Ecuadorian meaning preparation and independent Spanish region selectors are preserved. No extra network request, model download or paid service.

Comparison now highlights actual differences in separate read-only previews, explains supported vocabulary choices and says Same wording in both when identical. Highlights update with each edit; each variety retains its own saved text, including intentionally empty edits. Original paragraph breaks/text are retained in the diff, with bounded memory for long edits. Research mode does not apply these everyday vocabulary rules. Quotations, citations, DOI/URLs, inline code and detected capitalised names are protected during adaptation; computer program is kept as program when context identifies software. This does not guarantee every specialist term or proper name is detected.

Validation: all nine regression suites pass, including ambiguous/context-isolation examples, articles, scholarly references, lossless diffs, independently saved edits and escaped user markup. Live build 66 Chrome verification passed with the on-device pack: El apartamento tiene un ascensor became The flat has a lift versus The apartment has an elevator; highlighted vocabulary/article differences and both explanations were visible. Editing U.K. to match U.S. showed Same wording in both; reopening the comparison kept the saved U.K. edit. The original demonstration was restored. No archived media was changed for this release.

Vocabulary references (sense/region labels only; no dictionary examples or definitions copied):
- https://dictionary.cambridge.org/dictionary/english/apartment
- https://dictionary.cambridge.org/dictionary/english/lift
- https://dictionary.cambridge.org/dictionary/english/holiday?q=holiday_1
- https://dictionary.cambridge.org/us/dictionary/english/sidewalk
- https://dictionary.cambridge.org/dictionary/english/gasoline

## Build 65 — new text on device

Added an opt-in downloadable Spanish ↔ English pack using pinned quantized OPUS-MT models and Transformers.js 2.17.2 in a dedicated worker. Runtime/model files are browser-cached outside GitHub; private documents and generated drafts are never added to model downloads. Download both directions once (about 250 MB), then select Use on-device translation. Translation always uses local-files-only model loading; local errors never trigger a silent online fallback. Existing verified phrases and research matches remain first. All text is chunked without truncating input, retaining protected research tokens and paragraphs; editable drafts, UK/US spelling choices and regional review labels remain.

Service-worker upgrades now delete only old app-shell caches, preserving model/runtime caches and other applications. A single WASM thread works without cross-origin isolation on GitHub Pages. One direction is loaded in memory at a time. Browser storage clearing can remove the pack; mobile speed/memory and device dictation/voices vary. Whole-paper import/printing remains separate and private. No new research paper is treated as training data.

Validation: all existing regression suites plus offline cache/routing tests pass. Live Chrome validation: both pinned model directions installed and unseen Spanish translated to English. Reload testing caught the Transformers.js v2 local-files-only/allowLocalModels configuration requirement; fixed it and added a worker fetch guard that serves runtime/models from their caches and returns 404 for any missing file while translating. Optional configurations therefore never probe HTTP. Live reload/reverse-direction checks passed after the configuration fix: fresh English became Spanish with both paragraph breaks retained. Models load with remote model access disabled during translation. Physical network-disconnection and iPhone performance were not tested.

# Habla Ecuador development handoff

Updated October 8, 2026 (America/Denver).

## Current app

- Canonical active source: `MathewDMoore/habla-ecuador`, `main`.
- Active hosting: https://mathewdmoore.github.io/habla-ecuador/
- Standalone translator: https://mathewdmoore.github.io/habla-ecuador/translator.html
- Current source: v0.22.27, build 79; continue from these root files.
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
