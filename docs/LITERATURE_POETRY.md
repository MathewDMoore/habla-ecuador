# Literatura y poesía / Literature & poetry — implementation contract

## Current status
The original lesson seed data is in `data/literature-poetry-v1.json`. **This is a content foundation, not a shipped UI change.** Dictionary category selector, search, translation alternatives, and speaking practice still require explicit frontend integration and tests.

## Integration target
- Add a fourth category option alongside `All categories`, `Slang & expressions`, `Literal meanings`, and `Clinical & anatomy`: `Literature & poetry / Literatura y poesía`.
- Load `data/literature-poetry-v1.json` as structured data using existing dictionary search/caching conventions. Avoid a new standalone dictionary or replacing existing regional data.
- Search Spanish headword, U.S. English, U.K. English, metaphor, and cross-category tags, with accent-insensitive matching where supported.
- Keep `category` as a filter while `tags` are overlapping semantic facets. An everyday idiom may also be metaphorical and literary.
- Show **literal meaning**, **figurative meaning**, **natural conversational alternative**, **U.S. English**, **U.K. English**, **register**, and **regional evidence** as distinct fields; do not mislabel any as definitive translation in every context.
- Offer a contrast exercise: literal vs figurative vs everyday expression, with a context sentence, and allow ordinary audio from Habla's own licensed/generative voice system. Never ship third-party recording audio as a lesson asset.

## Evidence and intellectual-property gates
- Prioritize Ecuador research; compare Bolivia and other countries only with evidence. Never label an expression as Ecuador-specific because it appears in an Ecuadorian literary context alone.
- `General Spanish used in Ecuador` means general usage, not an Ecuador-specific provenance claim.
- All three seed records are editorial learning examples, not verified Ecuadorian regional senses. False verification flags and research-lead confidence are intentional. Promote a claim only after checking the actual reference, geographic label and sense.
- Keep creators' recordings and screenshots as temporary research references where lawfully processed, not as distributable assets, source-voice training data, or copy-pasted lesson text.
- Use original examples and public-domain or appropriately licensed literary material. Attribution does not substitute for permission.
- Never automatically publish or ingest uploaded papers, protected works or personal recordings.

## Acceptance criteria
1. Category appears translated correctly for English and Spanish interface locales, including accented `poesía`.
2. Switching the category visibly filters results, without losing Ecuador/Bolivia region selection.
3. Search for `luceros`, `corazón de piedra`, and `recuerdos` finds their corresponding original examples once integrated.
4. The figurative meaning is different from the literal gloss where appropriate, with U.S. and U.K. English variants.
5. Unverified regional provenance is visibly flagged; no fictional citations, corpus validation or author attribution.
6. Works offline once the relevant app data bundle is present; missing offline data is reported, never silently presented as installed.
7. Existing dictionary categories and deletion/history privacy behavior do not regress.

## Follow-up implementation
Wire this file into the existing dictionary renderer, search and interface-localization logic; add focused tests, then validate on device. Do not claim the selector or deployed build is updated until verified.
