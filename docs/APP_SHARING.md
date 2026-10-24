# Share Habla — build 112

Hosted v0.26.2/build 112 adds a compact Invite a friend section on Today/Home in both HTML pages. Share app invokes Web Share synchronously within the user gesture when available. Copy link always uses the clipboard. Unsupported/failed sharing falls back to copying the public link; blocked clipboard leaves a selected read-only link and clear manual-copy instructions. Cancelling the share sheet does not copy anything. Controls and a shared pending guard prevent duplicate requests. No message/email is sent automatically.

Invitations always use the fixed public HTTPS index URL, never the current URL, hash, private query parameters, translation text, documents, recordings or local history. A Spanish invitation accompanies Web Share. Destinations are Home (default), Monterrey/Nuevo León, Venezuela and Caracas. Region selection adds only allowlisted public routing parameters. Caracas maps to existing es-VE country guidance with a city=caracas invitation label; it does not create a city-attested dictionary filter or new linguistic claims.

Valid incoming regional invitations open Dictionary and set its existing region selector. A Caracas invitation explicitly says city-specific review is pending, matching current source metadata. That context note hides when the user changes region. Invalid/unsupported routes do not change the default. Normal startup stays Ecuadorian first; dictionary invitations do not rewrite translator language defaults or saved content. Existing standalone translator/native redirect behavior remains intact.

The web version needs no account or Xcode installation. Speech availability still depends on browser/device support. Some experimental iPhone capture features require the native companion. The installed 0.1.15 JavaScript does not gain a new UIKit sharing command: when Web Share is unavailable, Share app copies its public link. Existing native translation sharing is not repurposed or modified. No native/signing/App Store changes are made.

Validation:

- All 21 `tests/*.test.cjs` suites, JavaScript syntax and `git diff --check` pass.
- `HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_NATIVE_SCRIPT=/path/to/installed/NativeSpeech.js node tests/app-sharing.browser.cjs` passes at 390×844 and 320×844 plus installed native 0.1.15 JavaScript at 390×844. It covers Share/Copy, cancellation, duplicate guard, share failure/unavailability and clipboard failure, fixed public payload, private source/history preservation, regional invitations/Caracas label, invalid route defaults and standalone/native launch.
- Web Share and clipboard are mocked; no real message, email or share sheet is sent. Physical iPhone share-sheet behavior and use by remote friends remain unverified.
- App/cache/worker query references advance together to 112. No dictionary entries, translation/saved-gloss behavior, speech/learning logic, private files or stale audio artifacts are changed or published.
