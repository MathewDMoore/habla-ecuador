# Habla Ecuador 🇪🇨: Home Screen widget design, version 1

## Approved About-screen artwork

The approved About-screen design is the reference: snow-capped Andean mountain, golden sun, orange tropical leaves, Ecuadorian yellow/blue/red waves and a pink flower. `app-icon.svg` is the editable source. The native app icon, widget `HablaBrand` asset, and web Home Screen PNGs are rendered from that one source. The widget bundles its artwork and does not download images.

To regenerate PNGs, run `node scripts/render-brand-icons.cjs` with `sharp` available. Native icons are opaque full-bleed squares; iOS applies the corner mask. Safari entry points include an explicit 180px apple-touch-icon. Existing Home Screen web bookmarks may need to be added again for iOS to use updated artwork.

- Base: dark Ecuador green (`#173F35`) for text contrast.
- Accents: sunrise gold, turquoise sky, mint, and Ecuadorian tricolor.
- Text must remain readable in both light and dark system appearance, with large Dynamic Type and VoiceOver labels considered in later iterations.
- No live claims, autoplay music, private audio, invented daily words, or background speech capture.

## Small widget

Square brand mark + `Habla Ecuador 🇪🇨`, `¿Cómo estás?`, `How are you?`, and `Translate / Traducir`. Tapping the widget launches Translate.

## Medium widget

The same look and bilingual phrase, with three *separate* launch links: Translate, Practice, Dictionary. Those shortcuts use `hablaecuador://translate`, `hablaecuador://practice`, and `hablaecuador://dictionary`, and are passed into the existing native iPhone app's WKWebView as trusted hosted app routes. Each action opens the corresponding existing screen; it does **not** begin recording or translate a private message without the learner's action.

## App/icon/widget distinctions

- `app-icon.svg` and `ios/HablaEcuador/Assets.xcassets/AppIcon.appiconset/icon-1024.png` are the app icons, not widgets.
- `ios/HablaEcuadorWidget/HablaHomeWidget.swift` is the native WidgetKit extension.
- The hosted site and a Safari **Add to Home Screen** bookmark do not gain WidgetKit widgets from a website update.
- A signed native iPhone build containing `HablaEcuadorWidget.appex` must be installed. After installing, open Habla Ecuador once, then long-press the Home Screen, select Add Widget and find Habla Ecuador.
- If the iPhone is running only the standalone Home Screen web app, install the native app first; don't claim the web app already contains an iOS widget.

## Testing

- `node --test tests/*.test.cjs` checks design identity and routes.
- `tests/widget-deep-links.browser.cjs` checks actual destination tabs in mobile Chromium and WebKit.
- `.github/workflows/ios-microphone-prototype.yml` compiles the native app and embedded extension with signing disabled. Passing CI is not evidence of a signed on-device installation.
- Check small/medium layouts and shortcut taps on the iPhone after a signed Xcode installation.

Future possibilities such as rotating reviewed phrases, custom regional selection or Siri/App Intents should be *additions* only. Do not delay the first useful design while researching those options.
