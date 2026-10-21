# Experimental bilingual music text translation

Build 100 prepares Spanish/English routing for captured music text. This is a hosted-web change based on main build 99, separate from the native audio, song identification, and screen cleanup prototypes. It is not deployed merely by committing it.

Music translation defaults to **Detect Spanish + English · experimental**. The selected **To** language remains fixed. A local rule-based detector groups language cues into spans, including switches within a sentence. Spans already in the target language are copied exactly; other spans use the existing translation path and selected regional locale where applicable. Source order, whitespace, repeated lines, and punctuation are retained by the routing layer. Existing target-language text is not converted between US and UK vocabulary.

This is a small cue-based text detector, not a general language model or bilingual speech recognizer. Two consecutive cues support a language assignment; short or unsupported clauses fall back to **From**. Sparse cues and discarded singleton cues produce an uncertainty label. Slang, names, borrowings, and very short switches can be missed or assigned incorrectly. Users can review captured words and choose **Use selected From language**. This code does not infer Ecuadorian or Mexican origin from Spanish alone.

The native speech recognizer still uses its selected From locale. This change cannot recover English or Spanish words that the recognizer missed. Reliable bilingual audio recognition and physical iPhone validation remain open under issue #6. Song identification and its Shazam service availability are unchanged. No lyrics are fetched or added.

Mixed text passes through the existing translation path one span at a time. The selected output language, source selection, fragment rejection, cancellation, offline route, and online request allowance remain enforced. Auto and selected-language saved edits use distinct keys. Academic, image, document, and conversation inputs keep their existing routes. Each network translation chunk counts toward the live allowance; copying an already-target span costs no request. A single manual music translation is capped at 20 chunks and 8,000 input characters.

Buttons receive a pressed class on pointer or keyboard activation, retained for 160 ms after release so quick taps remain visible. CSS adds shading and a small compression, with motion disabled for reduced-motion users. Disabled buttons do not respond. This acknowledges the input, not successful completion; operation status still reports results and errors.

## Validation

Run from the repository root:

```sh
for testfile in tests/*.test.cjs; do node "$testfile" || exit; done
node --check app.js
node --check bilingual-music.js
node --check button-feedback.js
git diff --check
```

The bilingual suite exercises mixed clauses, reconstruction, fixed output language, online/offline routing, manual override, ambiguity, fragments, stale responses, request costs, and saved gloss isolation. The music suite also exercises the production bilingual route when From and To are both English, plus exhausted allowances. Button checks cover pointer, keyboard, quick taps, dynamically inserted buttons, disabled controls, cancellation, and reduced-motion styles. All sixteen suites must pass.

An additional integration check uses the native screen-cleanup worktree's `tests/native-layout.dom.cjs` with this checkout as `HABLA_HOSTED_ROOT` and jsdom 30.1.3. It verifies that the new scripts and controls coexist with native 0.1.9's editor relocation and capture bridge. It does not verify physical audio, Shazam, or rendered iPhone appearance.

On an iPhone, check mixed captured text in both target languages, corrected/edited words, selected-language override, visible button feedback, and preservation of paired source/translation editors when switching Music and Translate. No native Swift compilation, signing change, installation, merge, or deployment is performed by this web increment.
