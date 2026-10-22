# Translation sharing — web build 102

Adds Share translation beside Copy in both index.html and translator.html. Shares the visible completed translation, including current edits and paragraph breaks. It excludes source text, URLs, saved history and metadata. The existing native wrapper moves this same result card between Translate and Music, so it requires no Xcode rebuild.

The button calls navigator.share directly from the user gesture. Duplicate taps are excluded while pending. A successful Web Share promise is reported as handing text to the sharing app, not proof of message delivery. AbortError cancels without copying. Unsupported or blocked sharing falls back to clipboard with an explicit paste instruction; if clipboard also fails, the user gets a press-and-hold instruction. A wrapper without Web Share cannot gain a native share sheet from this web-only update. Existing Copy remains available.

Incomplete, hidden, empty and noneditable drafts cannot be shared. Status is announced inline and clears for a new completed translation. Offline model/runtime caches remain unchanged; only the app cache and URL version advance to 102 (v0.25.3).

Validation: all 18 tests/*.test.cjs suites; node --check app.js; git diff --check. Dedicated sharing tests cover edits/paragraphs, excluded originals, synchronous Web Share invocation, duplicate taps, cancellation, blocked/absent API, clipboard/manual fallback and unavailable drafts. Full DOM integration passes for both pages and installed 0.1.12 NativeSpeech.js layout, including actual button binding and Music placement. Existing native layout integration also passes against build 102.

Commands:

```sh
for test in tests/*.test.cjs; do node "$test" || exit 1; done
node --check app.js
git diff --check
HABLA_JSDOM_MODULE=/tmp/habla-share-dom/node_modules/jsdom \
HABLA_NATIVE_SCRIPT=/workspace/scratch/98d796203697/habla-multilingual-recognition/ios/HablaEcuador/NativeSpeech.js \
node tests/translation-sharing.dom.cjs
```

Physical iPhone system-sheet behavior and the installed wrapper's clipboard permissions require a device check. Tests stub platform APIs; they do not prove Messages/WhatsApp delivery. No native/signing, dictionary, user recordings or private paper changes.
