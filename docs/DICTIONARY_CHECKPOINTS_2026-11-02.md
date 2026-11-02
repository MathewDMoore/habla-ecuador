# Dictionary evidence checkpoints — 2026-11-02

Baseline: f21ea66bcdec8b8ea929c4cc4a3f3307d909f256 (live build 201).

1. Source audit saved separately from the live app. Four existing expressions inspected against national sources: three complete senses corroborated; one noun-only cross-check deliberately remains insufficient for its full idiom. Ten proposed new senses have exact national-entry or regional-study locations. Source access limitations are recorded. No UI or translation behavior changed in this checkpoint.

Next gates: data integration and evidence validation; dictionary regression tests; resilient source loading; browser checks; final release. A source-audit checkpoint is not a completed app release or native-speaker approval.


2. Data integration checked: 10 additional senses (seven national-dictionary senses and three explicitly documented La Paz usages); three existing full senses nationally corroborated; one component-only check kept insufficient. Tone filtering now retains DEM’s coarse label for echar la hueva alongside ASALE’s popular label. The evidence guard and negative tests reject unsupported national/corpus/native/city claims, mismatched countries, swapped senses and loss of the recorded register caution. Existing vocabulary/usage preservation digests and country-source tests pass. UI integration and release remain pending.

3. Integration checkpoint: source collections now load independently and retain last usable data on failed retries. Twenty-seven loading cases cover HTTP/network failures, malformed collections/records and cold/warm failure paths. Country coverage shows logged national checks, regional-study checks and native approval separately. Both dictionary pages expose a La Paz scholarly-evidence view; entry cards retain exact check locators, source-label disagreements and evidence-period limits. Fifty automated tests pass across dictionary, source loading, dictation, translation and offline retention. The Pages workflow now runs the evidence guard and dictionary regressions before uploading/deploying. Browser verification and live deployment remain pending at this checkpoint.
