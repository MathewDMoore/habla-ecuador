# Shared translation layout — build 122

The hosted pages previously kept imports, music capture and document tools between the source editor and translation result. The installed companion assembled its compact pair at runtime, so web invitations did not inherit that arrangement. Interface-language work exposed this existing web/native discrepancy.

Both index.html and translator.html now contain a shared source/target section in their initial HTML. The original source editor, translation result and live-preview nodes remain unique. The full result immediately follows the source area, with an empty target hint until a result or live preview is available. Translation text options follow the text rather than intervening above it.

Language help, purpose/research and import tools are in a collapsed “Translation setup & import” section below the pair. Existing control IDs, handlers, document workflows, speech, editable output, sharing, playback and selection are retained. Existing native JavaScript can still assemble and relocate its own paired workspace into Music; the hosted outer shell does not duplicate its empty target. No native source/signing settings changed and no rebuild is needed.

Validation:

- `node tests/shared-translation-layout.browser.cjs` with HABLA_PLAYWRIGHT_MODULE and HABLA_NATIVE_SCRIPT: 16 combinations of 320/390px, en/es, both hosted pages, browser/native-16 JavaScript simulation. Geometry confirms zero gap between source and target cards, even with setup expanded. Original text and selection survive language changes; native tab movement retains the pair; exactly one editor/result exists; empty targets and page width checked.
- `node tests/interface-language.browser.cjs`, `node tests/translation-text-tools.browser.cjs`, `node tests/selected-text.browser.cjs`, `node tests/music-controls-layout.browser.cjs` with the same environment: Spanish language, editing/composition, expansion/playback/share and capture-card regressions.
- All `tests/*.test.cjs` suites; `node --check app.js`; `node --check interface-es.js`; `git diff --check`.

Tests use neutral synthetic content and mocked audio/share APIs. Physical iPhone/WebKit keyboard verification remains pending. No recognition-quality or native-build claim is made.
