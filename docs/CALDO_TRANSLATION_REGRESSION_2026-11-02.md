# Translation correctness regression and recovery · 2026-11-02

## Reproduction

On iPhone, one translation screen showed source **Caldo** and target **Vol.** under Spanish (Ecuador) → U.S. English. Its result label said **preserved text / texto conservado**. A comparison translator showed **broth**. The reverse result is not evidence that the machine translation is accurate: `swapDirection()` intentionally preserves both sides of the previously completed pair.

## Failure modes confirmed in source

- `requestTranslationChunk()` uses MyMemory and originally considered nearly any nonempty, non-warning response suitable to display. This is a transport/schema check, not a meaning check.
- `swapDirection()` preserves the last completed result as the next source. Before this fix, an erroneous unedited result could become the new input.
- Saved personal translations can override newly generated answers. Preserve the person's edits but label them separately from verified dictionary entries.
- The signed native iPhone wrapper loads hosted `translator.html`, so a hosted release/cache bump matters for existing TestFlight clients. The signing / .ipa has not changed in this patch.

## Fix in web v0.26.92 · Build 202

1. Exact, case-insensitive culinary term lookup before remote or downloaded-model guesses. **caldo → broth**, **caldo de res → beef broth**, **caldo de pollo → chicken broth**, with reverse English-to-Spanish checks. Contextual options include stock and soup, not a claim that any entire sentence is verified.
2. A pre-reverse guard corrects known, unedited stale pairs against that tiny glossary. Deliberately edited wording remains intact and is labelled **preserved personal edit**, not verified output.
3. Dictionary alternatives remain accessible while the reverse control stays outside expandable panels.
4. English / Spanish regional-dictionary evidence and warnings have complete interface-language mappings for the new vocabulary batch.
5. Release metadata, HTML references, service-worker cache and offline-worker fallback advance together to Build 202.
6. Regression tests cover multiple Spanish origins, U.S. and U.K. targets, academic/everyday, online/offline, manual edits, round-trip preservation, a provider returning `Vol.`, and non-culinary contexts.

## Limits and release gates

- The glossary corrects *known exact terms*. It does not independently verify arbitrary MyMemory output, speech-to-text, Ecuadorian dialect authenticity or entire documents.
- Browser tests exercise simulated capture and network behavior. Physical iPhone / WebKit rendering and the installed TestFlight experience still require a device check.
- Ship only once the PR's required CI checks are green and the main-branch Pages deployment has succeeded. Do not mistake a saved branch, a merge or a successful upload for an independently verified phone fix.
