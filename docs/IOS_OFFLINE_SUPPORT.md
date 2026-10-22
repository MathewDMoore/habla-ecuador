# Native offline support — 0.1.11 (12)

The screenshot's unsupported-pack error is consistent with this WKWebView not enabling app-bound service workers. Configure WKAppBoundDomains with the existing app host mathewdmoore.github.io, set limitsNavigationsToAppBoundDomains before creating the web view, and explicitly retain the persistent website data store. Existing same-host navigation and external-link handling remain in place. No new signing entitlement or team setting is introduced.

This branch is stacked on the native capture-controls prototype, not main, to preserve installed capture, song identification and UI work. The only behavior change is the web-view capability configuration and a more accurate first-load/cache error message. Version metadata is 0.1.11 (12).

The corresponding hosted `fix/offline-readiness` branch prepares web build 101: it checks actual cache-only inference in both directions and the complete app/dictionary cache before marking the pack ready. A real Chromium test with the pinned public models passed offline reopening and new translations with zero online translation calls. That browser result does not verify this native wrapper.

Native validation completed here: Info.plist and project XML parse; the exact app-bound host and both target version/build configurations were checked; development-team settings remain absent as in the base project. All 13 JavaScript regression suites passed. Swift compilation and physical iPhone pack download/reopening are unverified in this Linux environment.

On Mathew's Mac, build/sign/install from this branch in the separate capture-check checkout using the existing team override. Open while connected, download/validate the pack, then reopen in airplane mode and translate new typed text in both directions. No clearing app data or removing saved papers is required. The first launch/download still needs internet. Offline speech needs downloaded device languages, and online music/Shazam remain network-dependent.

Sources: [WebKit app-bound service workers](https://bugs.webkit.org/show_bug.cgi?id=210451), [WebKit App-Bound Domains](https://webkit.org/blog/10882/app-bound-domains/), [Apple configuration API](https://developer.apple.com/documentation/webkit/wkwebviewconfiguration/limitsnavigationstoappbounddomains).
