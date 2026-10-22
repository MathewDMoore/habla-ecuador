# Offline readiness — web build 101

The native screenshot reported that service workers were unavailable while on-device translation was selected. Existing readiness only checked successful cached responses and could not establish working inference. The worker URL also still used build 77, which was absent from the current shell cache and could break a cold offline start.

This change requires a complete runtime/model cache, a service-worker confirmation that all app/dictionary assets are cached, and successful cache-only smoke translations in both directions before reporting readiness. Downloaded files alone are not validated. Validation uses two generic built-in sentences, never user documents. It checks that output changes language and includes a basic expected word; this is an operational check, not a translation-quality assessment.

The worker URL matches the app's cache version. Service-worker precaching now includes the six dictionary JSON dependencies. Cached app resources also survive transient unsuccessful HTTP responses. Model and runtime caches remain separate from versioned app caches. No user documents, recordings or private translations are added to Git or the pack.

Missing native capabilities produce a direct update message and disable the unavailable download action. A previously selected on-device preference stays selected and blocks online translation; failed validation never silently enables the online service. Worker startup failures and timeouts reject pending requests. Service-worker setup/cache checks have bounded waits. Storage persistence is requested when supported, but operating systems may still evict caches.

## Verified locally

- All 17 `tests/*.test.cjs` suites passed.
- Syntax checks for offline-device.js, offline-worker.js and sw.js, plus `git diff --check`, passed.
- `tests/offline-browser.integration.cjs` passed in Chromium 141 with the actual pinned Transformers.js 2.17.2/OPUS-MT models. The CI network required curl to download the public pack into browser caches through a local bridge. Initial direct browser downloads were blocked by the test environment; the bridge does not replace the inference engine.
- With browser network access disabled, a full page reload/cold worker validated both directions, translated new English/Spanish text, and fetched cached dictionary data. Results included “El agua está fría.” and “The water's cold.” Online translation calls: zero. This proves that the tested cache could execute locally after reopening; it does not establish iPhone performance or cache retention.

Commands:

```sh
for testfile in tests/*.test.cjs; do node "$testfile" || exit; done
node --check offline-device.js
node --check offline-worker.js
node --check sw.js
git diff --check
HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_CURL_NETWORK=yes node tests/offline-browser.integration.cjs
```

The optional browser test downloads about 250 MB of public runtime/models; it is not included in the lightweight regression loop. Omit HABLA_CURL_NETWORK on a browser network that can reach the public model/CDN endpoints directly.

## Native companion and feature limits

The separate native fix `fix/ios-offline-support`, based on the capture-controls prototype, enables WKAppBoundDomains for mathewdmoore.github.io and limitsNavigationsToAppBoundDomains, using the persistent website data store. It prepares native 0.1.11 (12). It needs a Mac build/install and physical iPhone verification. Hosted code alone cannot enable a missing native service-worker capability.

After installing the updated wrapper, open while connected, download/validate the pack, then reopen once in airplane mode and translate new text in each direction. This is the remaining device acceptance check, not a claim already completed.

Offline coverage here is the cached app, dictionary data, typed translation and locally saved paper state. On-device speech and voices need installed device languages; Apple-service recognition needs connectivity. Shazam, external music and source links require internet. Word/PDF/screenshot parsers may need their separate runtimes or language files downloaded first; this increment does not claim those are fully cached. Recognition accuracy and bilingual audio capture are unchanged.

Native configuration evidence: [WebKit app-bound service workers](https://bugs.webkit.org/show_bug.cgi?id=210451), [App-Bound Domains](https://webkit.org/blog/10882/app-bound-domains/), and [Apple's navigation configuration](https://developer.apple.com/documentation/webkit/wkwebviewconfiguration/limitsnavigationstoappbounddomains).
