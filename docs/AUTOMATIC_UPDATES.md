# Automatic hosted updates — build 126

Build 125 registered a service worker on page load but did not refresh an already-open page when a new release became available. Its hold-to-speak controls and independent dictionary startup remain unchanged.

## What changes

- Each GitHub Pages deployment runs `node scripts/write-release.cjs` before packaging. It derives public `app-version.json` from APP_VERSION and verifies matching service-worker/HTML build identifiers. The generated file contains only version/build; it is not committed and never contains user data.
- Both pages check this metadata at startup, on foreground/focus/reconnect and every five minutes while visible/online. The worker deliberately bypasses its cache for this URL; cached metadata is never freshness evidence. There is also Today → App updates → Check for updates.
- A higher build requests a service-worker update with HTTP-cache bypass. Automatic reload waits for the new worker's complete offline-shell cache to report the matching build cache. Failed installation keeps the old page. Web views without a usable worker use fresh navigation after a successful online release check; that path is not an offline-readiness claim.
- An untouched idle page reloads once after at least six quiet seconds. Existing URL preferences remain. A session-scoped attempted-build marker prevents repeated reloads if navigation serves stale content. Storage restrictions defer to reopening rather than risk a loop.
- Reloads are deferred while source/output text, changed fields, composition/focus, open feedback dialogs, speech/recording/practice/conversation work, imports/documents, offline-pack operations, sharing or media playback/paused playback positions are present. A ready update checks locally for idle state every two seconds, without additional network calls. Current work is left in its original page; it is not serialized, uploaded or automatically discarded.
- Offline, invalid metadata and download/registration failures are handled independently from app startup and keep the existing page. Checks retry when online. Both English and Spanish status messages are supplied.

This updates hosted HTML/CSS/JavaScript. Native Swift/binary changes still need a separate build/install. The first release containing the updater must be loaded once; an already-running build 125 cannot acquire new JavaScript in place before navigation.

## Mateo display preference

At Mathew's request, Spanish interface labels use Mateo; English retains Mathew. Preset/display labels may localize, but canonical option values, typed names, reports' original content and actual device contacts are not renamed.

## Validation

```sh
node --check app-updates.js
node --check app.js
node --check interface-es.js
node scripts/write-release.cjs
for test in tests/*.test.cjs; do node "$test" || exit; done
HABLA_PLAYWRIGHT_MODULE=/path/to/playwright node tests/app-updates.browser.cjs
git diff --check
```

The updater browser test uses a local HTTP server and the actual production worker/cache path, serving a current fixture and future fixture. It verifies genuine new-worker installation and idle navigation, source/output and synthetic recognition protection, conversation/feedback/import protection, invalid/offline metadata, paused media, IME composition, a failed new asset/cache installation, the repeated-reload guard and a no-worker fallback. Only neutral synthetic data is used; no live audio or messages are sent.

Existing interface-language, shared-layout, feedback, dictionary-startup, app-sharing and speaking-prompt browser suites run, including native-16 companion-JavaScript simulation where supported. The language checks cover Spanish Mateo/English Mathew while preserving the canonical name input. Physical iPhone/Safari/Home Screen background-resume behavior remains unverified; these are browser and bridge simulations, not a native build or a recognition-accuracy test.

Deferring an update preserves work by leaving it open. It is not a backup: deliberately closing/reloading a page can still lose its unsaved session content under existing workflows. Saved glosses, review storage, papers and downloaded model caches are not modified by the updater.
