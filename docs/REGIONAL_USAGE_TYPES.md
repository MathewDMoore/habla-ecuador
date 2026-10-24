# Regional usage distinctions — build 114

Dictionary has a new Usage type filter, independent of Region, Tone and the existing meaning Category. Cards show type, countries covered by the entry, existing city evidence where available, and the complete existing meaning-by-country scope outside the information dropdown. No country-specific sense is flattened into a universal gloss. Shared clinical, literal and editorial counterparts are labeled as not establishing regional naturalness. Caracas and Lima remain country guidance with city review pending.

Editorial presentation groups:

- Idiom / fixed expression: the existing en chinga, me vale verga, de la verga, valer / importar verga and ni verga / ni vergas entries.
- Exclamation: existing chuta, pucha, ¡puta! and ¡verga! entries.
- Familiar / everyday words: entries already labeled Familiar.
- Cultural usage: the existing chulla entry (including its documented Quito context).
- Literal and clinical: the existing explicit categories.
- Informal / slang vocabulary: remaining headwords or slash-separated word variants, including noun/verb labels; these are browsing labels, not a claim that vulgarity or every sense is slang.
- Other contextual usage: remaining multiword entries and editorial expressions. Multi-sense entries retain their full context; one browsing label is not an exhaustive linguistic classification.

The fixed-expression grouping follows the already-linked primary sources, rechecked for this increment: https://www.asale.org/damer/chinga (en chinga is an adverbial locution), https://www.asale.org/damer/valer (valer verga locution), and https://dem.colmex.mx/Ver/verga (the existing indifference, ni verga(s), and de la verga phrases). No source wording/examples were copied into the change. No new senses, attested countries or cities were added. Translation exact matches, ambiguity gates, editable translations and saved glosses are untouched.

The separately curated expression library now explicitly identifies itself as the Ecuador collection and explains that its cards do not follow the regional filter above. Its idiom/slang/cultural labels and review status are preserved. Contribution forms now accept a proposed usage type separately from register. Old saved contributions remain readable and export an unspecified type until edited. All reports remain unverified.

Validation commands:

- `node --check app.js`, `node --check spanish-context.js`, `node --check slang-contributions.js`
- Every `tests/*.test.cjs` suite (23 suites)
- `HABLA_PLAYWRIGHT_MODULE=/workspace/scratch/98d796203697/browser-tools/node_modules/playwright node tests/regional-usage.browser.cjs`
- Same browser test with `HABLA_NATIVE_SCRIPT` set to installed native 0.1.15 JS
- Existing `tests/slang-contributions.browser.cjs` for persistence and sharing compatibility
- `git diff --check`

The regression snapshot digest in regional-usage.test.cjs covers all 168 existing region/category/tone combinations from pre-change main 0a3a8601bdd882d3c3a32f997e11b455593d7e8b, excluding only the additive usage metadata. It prevents changes to existing meanings, evidence and ordering without intentional review. Browser tests cover 390/320 widths, default and alternate countries/cities, English counterpart filters, empty coverage, tone distinction, uncertainty, contributions and overflow. Physical iPhone behavior remains unverified. Hosted release; no native source, signing or Xcode changes.
