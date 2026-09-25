# Habla Ecuador

An Ecuadorian-first Spanish practice and translation app. This repository currently contains a lightweight browser prototype with no build step or external dependencies.

## Run it

Serve this folder with a static web server, then open the local URL. The app loads vocabulary from `data/vocabulary.json`; fetching JSON may not work when opening `index.html` directly as a file.

## Prototype features

- Search Spanish terms, English meanings, and examples.
- Show natural US English and UK English translations.
- Hear Spanish with browser text-to-speech, using separate slow and natural rates.
- Keep source notes and mark regional evidence clearly.

## Content notes

The initial vocabulary comes from MITAD — Spanish Dictionary for Ecuador, based on terms and examples supplied by the project owner. These are useful Ecuador reference items, but are not labeled as exclusive to Ecuador. New dialect-specific entries should include evidence, register, intensity, context, and country comparisons when supported.

## Planned work

- Add microphone input and speaking practice.
- Add Ecuadorian usage entries backed by reliable, citable sources.
- Compare Ecuadorian, Bolivian, Mexican, US English, and UK English usage where useful.
- Evaluate on-device translation and offline support before claiming either feature.
