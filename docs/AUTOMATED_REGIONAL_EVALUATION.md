# Automated regional evaluation and lesson proposal queue (draft build 238)

## Scope and output
Habla now has a **deterministic, offline regional lexical evaluator**. It currently produces seven Ecuador-versus-Bolivia review candidates, using existing editorial comparison records, learner entries, source bibliography and a dated source-review manifest. The output is \`data/regional-lesson-proposals-v1.json\`, also accessible through a **collapsed, read-only Practice → Regional differences** panel. No learner microphone is needed.

This is **not** autonomous internet crawling, generative linguistic discovery, voice-model retraining, audio accent measurement, or self-publishing. The six-country English dialogue lab is a separate scripted voice comparison. It does not feed its synthetic speech into this lexical evidence evaluator.

## Reproduce the evaluation

\`\`\`sh
node --test tests/regional-lesson-evaluator.test.cjs
node scripts/evaluate-regional-lessons.cjs --check
node scripts/evaluate-regional-lessons.cjs --output=data/regional-lesson-proposals-v1.json
\`\`\`

The project GitHub Actions PR workflow runs the evaluator, checks that the committed proposal queue exactly matches source files, and uploads the generated JSON as a **regional-lesson-proposals** artifact for editorial review.

## Evaluation rules

1. Join regional pairs by an exact \`entryId\` in the curated editorial tables. Never invent a comparison from a missing entry.
2. Validate evidence links as HTTPS and attach registered bibliographic references. A registered source link is only a lead, not proof of independent review.
3. Mark a source as \`source-page-reviewed\` **only** when the exact URL has a matching, dated entry in \`data/regional-evidence-reviews-v1.json\`. Otherwise mark \`reference-link-awaits-review\`.
4. Prioritize meaning contrasts, then shared semantic cores with extensions, differences of register or range, related senses and shared words. A \`comparison-pending\` record becomes a research task, **never** proof of non-use.
5. Separate Ecuador-side example sentences from Bolivia-side meanings. Existing Ecuador examples must never be relabelled as Bolivian examples.
6. Every candidate has \`publishable: false\`, \`automaticallyApproved: false\`, source URL, evidence status, priority, objective, caveats, and warnings. Publishing is a separate human-reviewed decision.
7. Do not infer prevalence, city-level origin, local audio authenticity, speaker identity, or accent quality from dictionary attestations.

## Manually inspected dictionary pages on 2026-11-18

- [¡atatay!](https://www.asale.org/damer/%C2%A1atatay%21): ASALE lists disgust in Ecuador and a pain interjection in Bolivia, especially burns.
- [guagua](https://www.asale.org/damer/guagua): ASALE lists some shared young-child meanings and additional geographically qualified senses.
- [pana](https://www.asale.org/damer/pana): ASALE lists the close-friend sense across multiple countries including Ecuador and eastern Bolivia, so **not** Ecuador-exclusive.

Other source URLs remain comparison-table references until individually reviewed.

## Next research work

Extend to verified regional comparisons beyond Ecuador–Bolivia, add source-to-sense pointers and independent corpus evidence where licensed, and build a genuinely measurable voice-availability and pronunciation-reference audit. Never claim that synthetic voices train one another or that microphone recognition grades accent without validated reference data.

## Release condition

PR #170 is still a draft based on PR #169. Resolve all tests, check browser/mobile WebKit and physical iPhone voices, and review the claims before merge/deployment. A committed preview file is **not** publication.

## Broader regional sense discovery (second evaluation engine)

The companion \`regional-sense-discovery.js\` groups **54 existing source-cited records** by their exact spoken expression (not a shared headword). It identifies **12 groups with differing senses**: **seven regional contrast candidates** and **five multi-sense/overlap cases**. Its review-only artifact is \`data/regional-sense-candidates-v1.json\`.

Examples include:
- \`llucho\`: Ecuador's documented unclothed sense versus a Bolivian wool-hat sense.
- \`bacán\`: Ecuador/Peru excellent versus a documented Bolivian wealthy-person sense.
- \`atatay\`: Ecuador/Peru disgust versus Bolivian pain.
- \`arrecho\`: documented Venezuela anger versus a documented sexual-arousal sense in Ecuador/Bolivia/Peru/Colombia.
- \`dar bola\`: separate documented meanings in Ecuador, Bolivia, Peru and Cuba.
- \`palta\`: multi-sense overlap, **not** an exclusive Ecuador-versus-Peru split because Peru has more than one documented sense.

Other region-tagged terms may have multiple senses **within a country**, so the engine refuses to label all such cases as cross-country differences. It also refuses to treat \`dar el avión\`, \`dar papaya\`, and \`dar bola\` as the same expression merely because the headword is \`dar\`.

Run or regenerate:

\`\`\`sh
node --test tests/regional-sense-discovery.test.cjs
node scripts/discover-regional-senses.cjs --check
node scripts/discover-regional-senses.cjs --output=data/regional-sense-candidates-v1.json
\`\`\`

The Practice research panel can display both review queues. Its sources are not pushed into the learner-facing published curriculum. Further evidence review is needed for frequency, native usage and pronunciation.
