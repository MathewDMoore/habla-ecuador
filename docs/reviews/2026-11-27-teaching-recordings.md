# November 26 teaching recordings: review and implementation

Reviewed on November 27. Visual review used time-sampled frames including the end sections of longer clips; this is not a verified audio transcription. Uploads stay outside the repository. No creator footage, voices, presenter likenesses or song lyrics are bundled.

## Implemented in short lessons

Four original lessons enter the existing catalog in Spanish and both English learning directions, with existing device playback and speaking practice:

- `meaning-dar-igual`: subject, negation and contextual emotional meaning. Source: RAE Diccionario del estudiante, dar, sense 17.
- `commands-polarity`: affirmative/negative tú commands and pronoun placement. Source: RAE–ASALE GTG, modo imperativo. Explicitly not a universal usted/vos rule.
- `hacer-in-context`: eight contextual tense/aspect examples, do/make distinction, and warning about English auxiliary do. Sources: RAE–ASALE DPD conjugation models and hacer.
- `register-indifference`: vulgar versus neutral indifference, preserving pragmatic negative meaning. Source: RAE Diccionario del estudiante, carajo, un carajo.

Links appear within each lesson. No claim of Ecuadorian exclusivity or country frequency, no automatic CEFR level derived from creator labels, and no general translation-engine fix or model training is claimed.

## Reviewed inputs and remaining work

| Recording | Visible topic | Use / status |
| --- | --- | --- |
| 11-32-54 | Basic / advanced adjectives | Pending: explain near-synonym differences; tired/exhausted is intensity, sad/discouraged changes nuance. Do not import an automatic replacement list. |
| 17-24-46 | Cold expressions by purported level | Existing cold lesson already distinguishes weather from personal sensation. Further intensity examples pending. Creator CEFR labels not adopted. |
| 17-31-51 | Hacer across tenses | Original contextual lesson implemented. |
| 17-45-47, including (1) | Commands | Original tú lesson implemented. |
| 17-49-06 | Arena etymology | Pending independent dictionary verification; historical story not imported. |
| 17-49-40 | Compliments | Pending original practice distinguishing appearance, clothing and invitations; an invitation is not itself a compliment. |
| 17-52-47 | Strong language | Original indifference/register lesson implemented. Other insults not added in this change. |
| 17-59-49 | Animated language-app promotion | Concept only: contextual family conversation and responding without a proxy interpreter. No scenes, characters or dialogue copied. |
| 19-26-56, including (1) | iCloud navigation | Access troubleshooting, not linguistic teaching material. |
| 11-27 00-02-48 | Song shown as A Qué Volviste, Proyección | Pending artist/origin verification. Learning targets: purpose questions, figurative meaning and translating emotional context. No lyric collection or embedding. |
| IMG_3115 | Dar igual wordplay | Original subject/polarity/context lesson implemented. |

Files with (1) have different binary hashes from their counterparts. Keep both inputs; do not delete on filename similarity or assume byte-level duplication. Their sampled visual content overlaps; one lesson per teaching concept is sufficient.

## Verification

Existing solo grammar regression plus new teaching-recording lesson tests check stable IDs, source presence, all three learning locales, paired models and retained polarity, tense/aspect and explicit register. Browser workflow is triggered by quick-lessons.js; physical iPhone playback remains unverified here. Changes are content in the current lesson UI, not a new native build.
