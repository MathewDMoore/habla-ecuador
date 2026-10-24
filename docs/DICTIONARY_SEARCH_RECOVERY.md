# Dictionary search coverage and recovery — build 115

The U.S./U.K. dictionary views index a small curated Spanish collection and its editorial English glosses; they are not comprehensive English-to-regional-Spanish dictionaries. Usage, category, tone and Spanish-counterpart region combine as AND filters. Previously, every zero-result case showed the same generic message, disguising both restrictive filters and missing vocabulary.

This increment distinguishes:

- Hidden matches: the same query/region has matches when usage/category/tone are cleared. The UI names active filters and offers an explicit Show all usage types, categories & tones action. It preserves the query, source view and counterpart region.
- Regional gaps: the query has matches in another region/counterpart view. An explicit Show matches across regions action broadens the view and clears restrictive type/tone filters; no meanings are relabeled as local.
- Missing indexed coverage: no match exists across current views with filters cleared. The UI says coverage is limited, not that the expression is wrong or unused.

A Suggest / check this entry action opens the existing contribution form with the query and selected country/city. English-source views retain the English variety and put the requested Spanish counterpart in context notes. Meanings and examples remain blank and required; nothing is auto-saved or submitted. An existing unsaved contribution/sharing operation is preserved instead of overwritten. The regional-results help also distinguishes the independently searched Ecuadorian evidence collection below.

## One sourced coverage increment

Added one dictionary-only bilingual insult entry, `mamón (insult)`, indexed under the English headword cocksucker and the search variants cock sucker / cock-sucker. The spoken Spanish headword is mamón. Both source and counterpart register remain vulgar/offensive. This is one possible general bilingual insult counterpart, not an automatic replacement or a literal sexual description. No new translation engine rule, city evidence, or country-naturalness claim was added. Country selectors expose this shared editorial candidate with explicit regional review pending, matching the treatment of existing shared counterparts.

Primary publisher evidence checked 2026-10-24:

- WordReference English–Spanish: https://www.wordreference.com/es/translation.asp?tranword=cocksucker — bilingual insult counterpart and offensive register. Only headwords are retained; source definitions/examples are not copied.
- Merriam-Webster: https://www.merriam-webster.com/dictionary/cocksucker — sexual descriptive and generalized-abuse uses must be distinguished.
- Collins: https://www.collinsdictionary.com/dictionary/english/cocksucker — U.S. and U.K. meanings/register.

ASALE mamagüevo was also checked during research; it was not added as a universal substitute because the documented Venezuelan meaning does not establish equivalence to every English use. There is no new automatic profanity mapping. Broad corpus/native review and comprehensive vocabulary expansion remain open.

## Validation

- `node --check app.js`, `node --check slang-contributions.js`, `node --check spanish-context.js`
- All `tests/*.test.cjs` suites (24 suites)
- `HABLA_PLAYWRIGHT_MODULE=/workspace/scratch/98d796203697/browser-tools/node_modules/playwright node tests/dictionary-recovery.browser.cjs`
- Same browser check with `HABLA_NATIVE_SCRIPT` pointing to installed native 0.1.15 JS
- Existing regional-usage.browser.cjs and slang-contributions.browser.cjs
- `git diff --check`

Checks cover filter/region/coverage distinctions, exact supported spelling lookups, absence of automatic translation for the added term, type/tone exclusions, ordinary nonvulgar counterparts, country uncertainty, query-preserving reset, explicit regional broadening, contribution prefill and protection of an unsaved draft. The existing 168-view snapshot still covers every preexisting entry; the new stable entry ID is excluded from that old snapshot and checked by focused tests. Browser tests use neutral synthetic draft content and mocked APIs. No uploaded recording, private screen text, image, audio, stale file, or native signing change is included. Physical iPhone behavior remains unverified; this hosted change needs no Xcode rebuild.
