# Translation-screen cleanup — native 0.1.9 (10)

Status: prepared and JavaScript/DOM-tested on `feature/translation-screen-cleanup`, based on song-identification commit `093617b715b6873b36cdf8fed888335667382cd8`. Separate draft; no merge or website deployment. This native version has not been compiled, installed or visually reviewed on an iPhone.

## Bounded first increment

- Move the existing music listening controls, song-identification card and capture statuses into the existing Music tab.
- Keep original source and translation together there. Translate and Music share the same editor nodes, language selectors, context and English-comparison controls. Returning restores the same nodes to their original positions; no duplicated IDs or new transcript store.
- Put audio source, capture duration, live draft preferences, help and native diagnostics in Listening options & help. Stop/listen, Identify, Translate captured words and live status remain outside that disclosure.
- Keep the original recordings, players, attribution/license links, drills and cultural material in Explore recordings & culture on Music.
- Translate gets Music listening and Speech settings shortcuts. Document/image imports and their existing help move into one compact Import document or image disclosure. Document translation itself, saved papers, research mode and exports remain available through their current workflows.
- Preserve the current capture when moving between Translate and Music. Other destinations retain the hosted app's existing cancellation behavior. Entering Music leaves conversation mode. Existing input changes, manual Stop, app background policy and native permissions remain authoritative.

This is a native DOM rearrangement; hosted HTML/application files, dictionaries, native capture code, signing settings and Info.plist are unchanged. A later Documents/Research destination and broader Settings page remain design work. This increment does not fix Shazam service access or improve lyric recognition.

## Verification

Commands run from this branch:

```sh
node --check ios/HablaEcuador/NativeSpeech.js
for test in tests/*.test.cjs; do node "$test" || exit 1; done
npm install --prefix /tmp/habla-ui-test jsdom@30.1.3 --no-audit --no-fund
HABLA_JSDOM_MODULE=/tmp/habla-ui-test/node_modules/jsdom node tests/native-layout.dom.cjs
HABLA_HOSTED_ROOT=/path/to/current-main HABLA_JSDOM_MODULE=/tmp/habla-ui-test/node_modules/jsdom node tests/native-layout.dom.cjs
git diff --check
```

All 13 existing JavaScript suites passed. The optional real-DOM integration test passed against both this branch's hosted source and current main `84a4b6f3b468e0e9e1e7fd97556b5693ce5fc093` (build 99, including full-document translation). It checks actual DOM reparenting, unique IDs, retained editor identity/text/listeners, import disclosure, original music players, Music/Translate navigation and active-tab state, system input, queued Identify, Stop/cancel, and conversation handoff. No real service calls or user audio are used.

jsdom is an optional test-only dependency installed outside the repository. Existing `tests/*.test.cjs` commands need no added dependencies. jsdom does not validate layout geometry, iOS permissions or audio. A headless Chromium visual check could not run because browser downloads returned invalid archives; do not describe visual layout as verified. Physical screen size, touch targets, keyboard behavior, screen-sharing continuity and native compilation need Mac/iPhone checks.

Project property-list comparison confirms only version/build changes, to 0.1.9 (10). No private papers, audio, recordings or translations are included in the change. Local Mac checkouts and their signing changes have not been touched.

## Next device check

Build/install from a separate checkout on the Mac, preserving existing dirty checkouts. On the iPhone confirm 0.1.9 (10), inspect the cleaner Translate screen, open Music, capture a short passage and switch Translate ↔ Music. Confirm retained words and edited translations, visible Stop, usable Listening options and original players. Test imports/research documents and conversation after returning. Do not merge until those checks pass.
