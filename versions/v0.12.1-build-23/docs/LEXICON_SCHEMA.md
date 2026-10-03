# Habla Ecuador lexicon schema

Habla Ecuador treats Ecuadorian usage as evidence-backed data, not a decorative country label.

Each lexical item should track:

- `id`: stable slug.
- `spanish`: learner-facing headword or phrase.
- `usEnglish`: natural US English equivalent.
- `ukEnglish`: natural UK English equivalent.
- `level`: CEFR learning level when assigned.
- `regionStatus`: one of `Ecuador-specific`, `Ecuador-associated`, `Regional Ecuador`, `Shared Andean`, `General Spanish used in Ecuador`, or `Research lead`.
- `regions`: optional Ecuador regions, cities, or provinces only when a source supports the label.
- `register`: conversational register.
- `intensity`: pragmatic strength.
- `warning`: context, ambiguity, false-friend, or regional caution.
- `exampleEs`: original Spanish practice example.
- `exampleUs`: original US-English rendering.
- `exampleUk`: optional UK-English rendering when meaningfully different.
- `comparisons`: country-specific comparisons backed by cited evidence.
- `sources`: source IDs from `data/sources.json`.
- `naturalness`: learner-facing summary of how strong the evidence is.
- `evidence`: concise provenance note.
- `verification`: structured review state.

## Verification object

```json
{
  "dictionaryAttested": true,
  "corpusChecked": false,
  "nativeSpeakerReviewed": false,
  "lastReviewed": null,
  "confidence": "dictionary-attested"
}
```

Suggested confidence values:

- `research-lead`
- `dictionary-attested`
- `corpus-supported`
- `native-reviewed`
- `multi-source-confirmed`

A term must not be promoted to `Ecuador-specific` merely because it appears in an Ecuador-focused dictionary. Exclusivity requires comparative evidence.
