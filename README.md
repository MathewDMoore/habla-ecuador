# Habla Ecuador

An Ecuadorian-first Spanish practice and translation app. This repository contains a lightweight browser prototype with no build step or runtime dependency.

## Run it

Serve this folder with a static web server, then open the local URL. The app loads vocabulary and source references from JSON files; fetching those files may not work when opening `index.html` directly as a file.

## Current prototype

- Browse a regional slang dictionary with Ecuador first, six country filters,
  documented city filters, tone filtering, U.S./U.K. meanings and device voices.
- Search Spanish and English without accent marks.
- Browse learner-ready vocabulary by conversation room.
- Show natural US English and UK English translations.
- Hear Spanish with browser text-to-speech and visibly separate slow/natural speech-rate settings.
- Show evidence badges that distinguish dictionary attestation, corpus support, native review, and multi-source confirmation.
- Compare Ecuador and Bolivia when the cited evidence supports a useful comparison.
- Show register, intensity, context warnings, source links, and verification state for each entry.
- Display live counts for learner-ready entries and conversation rooms.
- Browse the project’s source catalog.

## Data layers

- `data/candidate-lexicon.json` — sourced research leads and entries still being verified.
- `data/learner-entries-v1.json` — polished learner-facing entries.
- `data/conversation-domains.json` — everyday conversation categories used by the UI.
- `data/ecuador-bolivia-comparisons-v1.json` — evidence-backed Ecuador/Bolivia relationships and learner alerts.
- `data/lexicon.schema.json` — structured vocabulary and verification model.
- `data/sources.json` — source catalog and provenance metadata.
- `spanish-context.js` — shared local regional slang notes and the browseable
  dictionary. Editorial glosses link to the supporting dictionary or study.

## Regional slang dictionary (v0.23.0 · build 85)

Dictionary now starts with 21 local entries across Ecuador, Bolivia, Mexico,
Venezuela, Peru and Colombia. Search headwords, either English gloss, context or
region; choose all tones, exclude vulgarity/insults, or review caution-labelled
terms. All-regions ordering keeps Ecuador first. Both English glosses remain
visible and have separate voice buttons; available voices depend on the device.
Context and source links use closed disclosures to keep the phone view compact.

City filters expose only the existing cited evidence: huerco in Monterrey,
güey/no mames in Mexico City, and parcero/gonorrea in Bogotá. Caracas and Lima
remain country guidance, not city validation. This is a starting collection,
not an exhaustive dialect dictionary or speaker-origin detector. It reuses
translator notes without broadening automatic replacements. New headwords are
dictionary-only, and all entries remain local after the app is cached; opening
source websites requires internet. No API, paid service or media files were added.

### English lookup (v0.23.1 · build 86)

Region also offers U.S. English and U.K. English. These views put the selected
English gloss first, sort by that gloss, and show its Spanish counterpart plus
the other English comparison. Search checks the selected English gloss, Spanish
headword and context. The views index the existing 21 Spanish slang entries;
they do not claim a separate, validated corpus of British or American slang.
Tone labels refer to the Spanish source. Country and city evidence stays in the
Context & sources disclosure, and English view audio retains Spanish voice tags.

### English vulgarity counterparts (v0.23.2 · build 87)

Six shared-Spanish editorial pairs retain vulgarity for exclamations, dismissals,
rebukes, a shocked question and an emphatic refusal. English dictionary views now
offer a separate Spanish counterpart region filter. Spanish lexical senses link
to RAE/DLE; country-specific naturalness remains pending, not city-certified.
The collection now has 27 entries. Strong wording is excluded by the mild filter.

Translate recognizes these complete English phrases locally in everyday mode,
including offline without a model pack. This does not rewrite fragments within
longer sentences, quoted phrases, academic text, or ambiguous bare fuck/shit.
All other input retains the existing translation route. Local output stays
editable and is labelled a vulgar counterpart with its sense and review status.

### Capture and translation continuity (v0.24.5 · build 98)

The installed 0.1.6 (7) system-audio companion loads the hosted page. The prototype already marked explicit system capture with `__hablaSystemAudioCaptureActive`, but deployed main still cancelled capture on every hidden-page event. The hosted handler now preserves that explicit native session while retaining ordinary microphone cleanup. System-input status and help describe the picker and switching to the playback app, and distinguish unavailable/silent system input from an external microphone. This is compatibility with the existing installed prototype; native code and the separate prototype PR are unchanged.

Translate captured words now waits for a real result, ends its busy message on success or failure, restores retry after failure, and routes the general Retry translation action through the captured-text workflow. A double tap cannot duplicate requests. New song, a new capture, ordinary dictation, changed text and changed language reject stale completion. The renderer checks the actual source and language pair before publishing asynchronous output, including during input debounce.

Stop/Continue and normal segment restarts retain native confirmation metadata. Previously, Continue promoted every retained word—including tentative guesses—into confirmed source. Tentative words now stay available in the source and review notice but stay out of native confirmed-only live translation. Manually translating the full capture explicitly labels inclusion of unconfirmed words. Editing the retained source makes that edited text authoritative. Recognizers without native certainty metadata retain their existing behavior.

The supplied recording ends in `There are no commissions on`. A bounded financial/noun-preposition check now waits for the missing object in live mode and labels manually translated incomplete captures. Complete phrasal endings such as `Turn it on` and `Come on` are not blocked. This does not infer missing speech or establish general grammatical/translation accuracy.

Regressions cover the previously failing hidden-page guard, actual 0.1.6 (7) JavaScript bridge paired with the updated hosted app, interrupted-clause recovery, confirmation across Continue, full-translation success/failure/retry, stale responses and route messages. JavaScript checks cannot validate iOS audio capture or recognition on a physical phone. The supplied screen recording has silent audio, so its exact spoken source and translation fidelity remain unverified. No new native build is required for these hosted changes; device playback and recognition still need a focused follow-up.

### Spanish tomorrow spelling (v0.24.4 · build 97)

The online service was reproduced returning `Yo voy a trabajar manana` for `I'm going to work tomorrow.` The shared English-to-Spanish translation path now restores the ñ in standalone `manana` only when the English source explicitly contains `tomorrow`. The spelling and next-day sense follow [RAE/ASALE DLE: mañana](https://dle.rae.es/ma%C3%B1ana). This applies across supported Spanish targets, online and on-device drafts, including cached provider responses. It preserves case, other Unicode text, quotations, code, links, email, handles, compound words, source text and saved user edits. If the English source itself contains Manana/mañana, the rule skips the ambiguous name or literal spelling. Spanish-to-English and regional bridges keep their existing behavior.

Regression coverage reproduces the phone's rendered result, checks U.S./U.K. sources and every Spanish target, both purposes, offline output, cache reuse, protected text and saved edits. This is one bounded spelling guard, not general Spanish spellchecking or evidence that translation/transcription quality is solved. No native rebuild is required; the installed wrapper loads the hosted app. The separate iOS system-audio prototype remains unmerged.

### Quito dictionary evidence (v0.24.3 · build 96)

The regional dictionary adds one bounded, source-supported Quito entry: `chulla`. It separates the literal/popular “single or unmatched” sense from the Quito-linked social and cultural archetype, and warns that the city evidence does not make the term exclusive to Quito or universally current. The entry links ASALE, the Academia Ecuatoriana de la Lengua and the Municipality of Quito. A Quito city filter and Ecuadorian audio locale are included. No automatic translation rule, speech-recognition behavior, private material or native code changed.

### Faster live music previews (v0.24.2 · build 95)

Live translation now checks for new words every 1 second on-device or 3 seconds online, plus recognition and translation processing time. Confirmed passages remain the default. The optional Live update → Quick preview includes tentative native recognition and labels the resulting draft unconfirmed. Such previews can change or disappear; they enter finalized passage history only after recognition confirms the source. Browser recognition without native certainty metadata retains its existing draft behavior.

Translation failures expose Retry live translation while the microphone and captured text remain active. Retry preserves the consumed online request/character budget; the 30-request/2,500-character free preview caps and one-request-at-a-time guard remain. A network error does not establish that a daily quota was exceeded. The installed app in the reviewed recording used Online service; its on-device pack must be enabled separately from Safari. These web changes require no native rebuild and do not guarantee streaming latency or physical-phone recognition accuracy.

### Listen audio side effects (v0.24.1 · build 94)

Mathew reported that Listen stops music playing in another iPhone app while Habla runs in Safari. Listen no longer explicitly pauses Habla's music players under any playback-source selection, and starting a Habla track no longer cancels an active music capture. Single-track playback still pauses other tracks when a new track is chosen.

Idle speech cleanup no longer calls speech-synthesis Cancel or Resume. Cancelling an actual Habla translation voice still works; Resume is deferred until a real speech segment starts. These are app-side fixes, not evidence that Safari can keep another app playing while its speech-recognition microphone is active. The reported physical-iPhone/Safari scenario still needs testing. No experimental audio-session override, native-route change, forced playback in another app or new native build is included.

Related primary reports: [WebKit speech/audio interference](https://bugs.webkit.org/show_bug.cgi?id=321436), [speech recognition audio-session activation](https://bugs.webkit.org/show_bug.cgi?id=317741). These reports concern related behavior; they do not establish the cause of this user's interruption. The native capture already requests playAndRecord + mixWithOthers + Bluetooth A2DP; Safari does not run that native bridge.

### Conversation and text-only modes (v0.24.0 · build 93)

Conversation now has a persistent spoken/text-only setting, independent English and Spanish variety choices, per-turn Hear controls, and a typed-turn fallback with manual language choice. Turn originals remain visible during recognition. Each final turn binds its actual source and target explicitly, preventing local idiom/context rules from accidentally using the main translator's opposite source. Clear English/Spanish clues in recognized text can switch direction while retaining the original speaker name and exact captured words. The microphone still uses the assigned language; this is not bilingual audio detection. Ambiguous short text is labelled uncertain and is not spoken automatically. Choose its language explicitly in the text composer.

Text-only mode suppresses automatic playback even when an earlier translation finishes late, and changing back does not replay previous turns. Hear remains an explicit user choice and is unavailable while a microphone turn is active. Leaving the conversation stops capture/playback and prevents delayed auto speech. Transcript text is not silently rewritten by the walking-context heuristic. Microphone failures offer a typed fallback; the change does not claim physical-phone recognition has been validated. Names and mode/variety settings stay on the device; conversation turns remain in memory until clearing/reloading. Free-service and on-device translation behavior are preserved. No native rebuild is required for these web changes.

### Indifference expression (v0.23.7 · build 92)

A phone recording showed Ecuadorian `“Me vale verga` rendered as `“I'm worth a dick` with Research selected. Complete `me/te/nos vale verga` utterances now use the ASALE-attested indifference sense locally in everyday and research mode, producing `I/You/We don't give a fuck`. An agreeing `A mí me…` form is also recognized. Outer quotation marks (including a lone pasted opening quote) and punctuation are preserved. This retains source register rather than neutralizing quoted vulgar speech in research.

The rule covers these standalone constructions for Ecuador, Bolivia and Mexico into U.S./U.K. English. It does not replace substrings in papers, guess ambiguous `le/les`, accept negated or expanded expressions, or establish general translation accuracy. The dictionary adds a separately scoped `me vale verga` entry (47 total entries). It works without the online service or an on-device model download. Editable drafts and stale-request protection remain in place. No native rebuild is needed.

### Dictionary context and clinical terms (v0.23.6 · build 91)

Two dictionary recordings supplied by Mathew informed 16 independently checked entries: literal and vulgar verga senses, selected Mexican/Bolivian expressions, cojón/cojones, and nine neutral clinical/anatomy terms. Category filters separate Slang & expressions, Literal meanings, and Clinical & anatomy. Clinical entries remain available when vulgarity is excluded. U.S./U.K. lookup, speech buttons, and linked sources remain available. General Spanish availability does not establish country-specific slang use; each phrase retains its source scope. These entries are dictionary references, not automatic whole-sentence translation replacements or model training.

The collection now has 46 entries. This is a web-only update; no additional Xcode rebuild is needed for these dictionary changes. [Recording review and remaining headwords](docs/DICTIONARY_RECORDING_REVIEW_2026-10-12.md) records what was added and what still needs review.

### Finalized music passages (v0.23.5 · build 90; native 0.1.4 / 5)

The modern native recognizer now sends finalized and tentative passage text separately, while its song session continues. Live translation uses only finalized passages when this metadata is available. Tentative words remain in the full editable capture and are labelled separately; withdrawing a tentative guess clears it instead of leaving stale words on screen. Stop keeps unfinished words for explicit review and translation. Finalization does not establish accuracy and cannot recover missed singing.

This requires rebuilding/installing native **0.1.4 (5)**. Hosted build 90 remains compatible with native 0.1.3 (4) and ordinary browser capture, which retain their prior live-draft behavior because they do not supply native passage-finalization metadata. No audio route, permission, automatic backend switching, or free-provider change was made. The online eight-second and on-device three-second schedules, budgets, paired passage editing, continuation, imports and language selectors remain in place. Automated bridge/music tests cover tentative suppression, later finalization, withdrawn guesses, continued capture and review after Stop. Singing recognition remains unresolved until tested on the physical iPhone.

### Music passage context (v0.23.4 · build 89)

Live music drafts retain a connected sentence or capture segment, instead of starting an update at an arbitrary five-word overlap. Oversized unpunctuated passages wait for manual review rather than losing their beginning. Clearly dangling Spanish/English clause endings wait for more captured words without spending an online translation request; this is a conservative heuristic, not a grammar validator. Recognition can still miss words or mistake sung vocals. This release does not repair Apple's singing recognition or guarantee translation quality from the free provider.

Captured source words are visible beside each live draft. Pending incomplete words have a separate display so they cannot appear paired with an earlier translation. Paused capture retains existing editable passage review. Both external-speaker and future same-phone Bluetooth workflows remain available; native version stays 0.1.3 (4).

### Ambiguous chingar/chinga lookup (v0.23.3 · build 88)

Three Mexican dictionary entries separate the verb, noun, and en chinga speed
expression. Sources distinguish bothering, sexual usage, burdens/beatings,
breakage/failure and hard work. No country is inferred from a single word, and
sexual meanings do not establish consent. There are now 30 dictionary entries.

Isolated chinga/chingar shows local English meanings with explicit choice buttons;
Mexico also exposes the noun senses. Chingarse/en chinga have Mexico-scoped local
lookup. Word choices edit and save the current draft only when source, target and
input still match. Quoted words, longer sentences and academic material remain on
the existing route. Notes flag relevant verb forms without automatically replacing
their sentence. This resolves the bare-word ambiguity, not general language
understanding or every chingar construction.

## Sources and copyright approach

The catalog includes Academia Ecuatoriana de la Lengua’s Diccionario académico de ecuatorianismos and CORPHA, the Ministerio de Educación’s searchable Ecuador dictionary, ASALE’s Diccionario de americanismos, and additional lexicographic and phraseology references.

Sources guide research; this repository stores original practice examples and concise paraphrases, not copied dictionary definitions or corpus passages. CORPHA is linked as the regional corpus for context checks. A term is not labeled corpus-verified until an actual query and its relevant metadata are reviewed. Native-speaker review remains a separate evidence step.

The nine initial sunrise/sunset items came from MITAD material supplied by the project owner. Their Ecuador relevance is recorded without claiming the expressions are exclusive to Ecuador.

## Planned work

- Build the requested Listening, Conversation, Text-only and Custom modes in the
  order and acceptance checks recorded in [the conversation-mode roadmap](docs/CONVERSATION_MODES_ROADMAP.md).
- Log CORPHA queries, regional metadata, and source dates for entries.
- Add Ecuadorian-speaker review notes for naturalness, tone, and regional differences.
- Expand the learner-ready batch beyond the first 10 entries.
- Add microphone-based speaking practice.
- Evaluate on-device translation and offline support before claiming either feature.


## Research reference (v0.21.1 · build 48)

Research mode includes a local editorial reference for the paired Escalante (2017) abstract supplied by Mathew. It applies contextual pragmatics terminology to general Spanish-to-English research drafts and provides a “Try the reference abstract” button. This adds reference retrieval and translation rules; it does not fine-tune the free translation service. See [the reference and fidelity notes](docs/RESEARCH_ABSTRACT_REFERENCE.md).

## Ecuadorian research references (v0.22.3 · build 55)

Research mode offers three Ecuadorian papers: Cuenca air quality, fish diversity in Sangay National Park, and a bat specimen from Morona Santiago. Select a paper, then press “Try Ecuadorian research” to load two credited abstract sentences. Six Spanish/English pairs now use local editorial English for exact matches; source credit and the article-specific CC BY 3.0 link appear with each result. Dates, counts and names must match; altered text uses the existing general service. The existing edit and restore controls work on these drafts too.

See `data/research-source-manifest.json` and the [research-source registry](docs/research-translation-sources.md) for licensing, modifications, and quarantined candidates. This is reference retrieval, not model fine-tuning or a held-out benchmark. No paid API or large corpus download was added.

## Playback and full-paper access (v0.22.5 · build 57)

Pause becomes Resume based on the app's playback state. Resume uses the last reported word position; if the device supplies no word positions, it repeats the current sentence or short segment. The selected voice, language and speed are retained. “Hear it” starts playback again from the beginning.

Research samples are two-sentence excerpts. “Read full paper” opens the selected original paper. Longer research text can be translated by pasting sections, up to 8,000 characters and 20 service segments per request; the free service's quota still applies. These references do not constitute full-article training or full-paper translated editions.

### Import a document (build 58)

Open the translator, tap **Choose document**, then **Browse** on iPhone and select the Word `.docx` in Files. Preview its extracted text; UK English is selected automatically. Tap **Translate this section**, then **Compare U.K. / U.S. English** to edit both spelling adaptations of that draft without spending more service quota. Use the section selector to continue through a long document. PDF (selectable text) and UTF-8 text also work. Older `.doc` files must first be saved as `.docx`. Formatting/images are not imported. Extraction is local; only text explicitly selected for translation goes to MyMemory. Limits: 10 MB, 200,000 extracted characters, 100 PDF pages. Documents are not retained after closing/reloading. Readers load on demand from pinned jsDelivr distributions: Mammoth 1.11.0 (BSD-2-Clause) and PDF.js 6.3.289 (Apache-2.0).
