# Source keyboard composition candidate

Baseline: main 260b463, hosted v0.25.6/build 105. This is a bounded candidate fix for a demonstrated input-lifecycle defect. It is not verified as a solution to the reported iPhone swipe-to-replace failure. No release identifiers are advanced and this candidate is not deployed.

The private recording shows tap typing replacing a selected source range, while the reported swipe attempt leaves the range selected. A recording does not expose DOM/native keyboard events. No recording text is reproduced in this document, source, or tests. The cause of the actual ignored swipe has not been established.

A separate reproducible app defect: source compositionstart did not cancel a pending translation, composing input scheduled translations of unfinished text, and compositionend did not commit if a keyboard omitted its trailing input event. The output could rerender while the input method owned marked text. Baseline Chromium test fails when an earlier translation timer fires during composition.

The candidate suspends source translation during composition, invalidates earlier requests, preserves marked input and selection, and processes committed text at compositionend. Existing committed-input, imported-document, paused music review, and saved-gloss handling are retained. It does not synthesize replacement characters, intercept keyboard gestures, force focus, delete a selection, or change CSS/native signing.

Validation:

```sh
node --check app.js
HABLA_PLAYWRIGHT_MODULE=/path/to/playwright \
HABLA_NATIVE_SCRIPT=/path/to/current/NativeSpeech.js \
node tests/source-composition.browser.cjs
HABLA_PLAYWRIGHT_MODULE=/path/to/playwright \
HABLA_NATIVE_SCRIPT=/path/to/current/NativeSpeech.js \
node tests/selected-text.browser.cjs
git diff --check
```

All 18 existing Node test suites pass. Real Chromium tests on both hosted pages and with native 0.1.13's JavaScript bridge cover queued/in-flight translation suppression, unfinished composing input, commit without trailing input, committed replacement events, selection replacement, focus and undo. Existing selection/saved-gloss/late-speech regressions pass. Synthetic composition and a native bridge mock do not exercise Apple's QuickPath keyboard. No physical iPhone, Swift or Xcode result is claimed.

Next investigation must distinguish a swipe that emits no editing event from one whose editing event is mishandled. Do not label this PR a verified swipe fix or ask the user to delete the selection first as a solution. Keep the actual swipe-to-replace report open pending device-level evidence.
