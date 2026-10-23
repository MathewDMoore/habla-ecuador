# Selected text editing — web build 105

Baseline: main build 104, `028391b9c8dcf6f4db8c3ac91052f952c7da46bb`. The private recording shows a selection in the source textarea with the iPhone keyboard open. It does not expose keyboard events or establish why the reported replacement failed. No recording text is reproduced here or in tests.

Two reproducible editing faults are addressed:

1. Ordinary source dictation remained active when the user typed. A later provisional recognition callback could overwrite a correctly replaced selection. `claimSourceTextEdit()` now stops source dictation/music capture before `beforeinput` or composition starts, with an input-event fallback. No selected range, text or focus is modified by this helper. Existing recognition identity guards reject late callbacks. Conversation recognition is not stopped by an unrelated source edit.
2. The translated contenteditable draft restored its generated text whenever an input event briefly left it empty. That interfered with delete-then-insert replacement and composition. Input now allows a temporary empty draft and avoids saving unfinished composition. Composition end saves the completed edit; blur retains the nonempty-draft rule and restores the most recent saved edit if the user abandons an empty draft. Source text and saved glosses are preserved.

No custom typing engine, key interception, execCommand, synthetic replacement or forced selection/focus change is introduced. Browser replacement and undo remain native. Build-104 wrapping/scroll constraints and shared native layout remain unchanged. Native code/signing is unchanged; Xcode is not needed for this hosted increment, even though it is now allowed by the user.

Validation:

- All 18 `tests/*.test.cjs` suites passed.
- `node --check app.js` and `git diff --check` passed.
- Real Chromium 141 / Playwright 1.56.1 on both pages and installed 0.1.12 `NativeSpeech.js`: full/partial source selection replacement, replacement undo, late ordinary dictation exclusion, selected-target deletion/replacement, synthetic composition lifecycle, saved-edit restoration on empty blur, and manual correction during native Music capture. Baseline runs failed both when a late recognition event replaced the user's typed edit and when deleting the selected draft restored the old draft immediately. Both regressions pass after the change. Ordinary non-recording source selection replacement already passed in Chromium.
- The existing panel browser regression also passes with the installed native script at four viewport widths, preserving source text, editing, selection, wrap/scroll behavior and viewport zoom policy.

Commands:

```sh
HABLA_PLAYWRIGHT_MODULE=/tmp/habla-selection-browser/node_modules/playwright \
HABLA_NATIVE_SCRIPT=/tmp/habla-selection-native.js \
node tests/selected-text.browser.cjs
HABLA_PLAYWRIGHT_MODULE=/tmp/habla-selection-browser/node_modules/playwright \
HABLA_PANEL_ENGINE=chromium HABLA_NATIVE_SCRIPTS=/tmp/habla-selection-native.js \
node tests/translation-panels.browser.cjs
```

Physical iPhone/WKWebView keyboard behavior remains unverified. Browser mocks exercise late native event delivery but do not validate Swift capture or iOS keyboard input. Synthetic composition checks do not validate every real IME. These fixes do not prove the exact observed highlighted-selection issue is resolved; test a selected word and Select All on the iPhone after reopening build 105. If it persists without active capture, inspect native WebKit focus/input events separately.

Web release: v0.25.6 / build 105. App/cache/worker query identifiers advance together; downloaded offline model/runtime cache names are unchanged. No private audio/text, native version changes or dictionary edits are included.
