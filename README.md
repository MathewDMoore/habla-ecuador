# Habla Ecuador

An Ecuadorian-first Spanish practice and translation app. This repository contains a lightweight browser prototype with no build step or runtime dependency.

## Run it

Serve this folder with a static web server, then open the local URL. The app loads vocabulary and source references from JSON files; fetching those files may not work when opening `index.html` directly as a file.

## Current prototype

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

## Sources and copyright approach

The catalog includes Academia Ecuatoriana de la Lengua’s Diccionario académico de ecuatorianismos and CORPHA, the Ministerio de Educación’s searchable Ecuador dictionary, ASALE’s Diccionario de americanismos, and additional lexicographic and phraseology references.

Sources guide research; this repository stores original practice examples and concise paraphrases, not copied dictionary definitions or corpus passages. CORPHA is linked as the regional corpus for context checks. A term is not labeled corpus-verified until an actual query and its relevant metadata are reviewed. Native-speaker review remains a separate evidence step.

The nine initial sunrise/sunset items came from MITAD material supplied by the project owner. Their Ecuador relevance is recorded without claiming the expressions are exclusive to Ecuador.

## Planned work

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
