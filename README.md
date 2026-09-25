# Habla Ecuador

An Ecuadorian-first Spanish practice and translation app. This repository contains a lightweight browser prototype with no build step or runtime dependency.

## Run it

Serve this folder with a static web server, then open the local URL. The app loads vocabulary and source references from JSON files; fetching those files may not work when opening `index.html` directly as a file.

## Current prototype

- Search Spanish and English without accent marks.
- Show natural US English and UK English translations.
- Hear Spanish with browser text-to-speech and visibly separate slow/natural speech-rate settings.
- Compare country-tagged meanings where the cited evidence supports a comparison.
- Show register, intensity, context warnings, source links, and a “Sounds natural in Ecuador?” evidence note for each entry.
- Browse the project’s source catalog.

## Sources and copyright approach

The catalog includes Academia Ecuatoriana de la Lengua’s Diccionario académico de ecuatorianismos and CORPHA, the Ministerio de Educación’s searchable Ecuador dictionary, ASALE’s Diccionario de americanismos, and additional lexicographic and phraseology references.

Sources guide research; this repository stores original practice examples and concise paraphrases, not copied dictionary definitions or corpus passages. CORPHA is linked as the regional corpus for context checks. A term is not labeled corpus-verified until an actual query and its relevant metadata are reviewed. Native-speaker review remains a separate evidence step.

The nine initial sunrise/sunset items came from MITAD material supplied by the project owner. Their Ecuador relevance is recorded without claiming the expressions are exclusive to Ecuador. The new Ecuadorian entries are dictionary-attested leads with corpus checks still pending.

## Planned work

- Log CORPHA queries, regional metadata, and source dates for entries.
- Add Ecuadorian-speaker review notes for naturalness, tone, and regional differences.
- Add original microphone-based speaking practice.
- Evaluate on-device translation and offline support before claiming either feature.
