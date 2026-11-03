# Cámara Traductora / Camera Text Translation

## Scope of this first build

The signed iPhone companion adds **📷 Scan text / Escanear** next to the
existing image actions in the Translate screen. Tap it to present Apple's
VisionKit Live Text camera scanner. It highlights words while the camera is
open. Tap a highlighted line to select only that line, or tap **Use all text**
to import all currently detected lines in reading order.

Selected words are returned to Habla's **existing** image-text import flow.
They remain editable, and the current hosted translator automatically prepares
the translation according to the selected language pair. Spanish and English
text recognition runs locally on the iPhone. The camera feed and photos are
not sent to Habla servers by this feature. Translation service privacy still
depends on the user's existing online/offline setting; online translation may
send the **recognized text** to the chosen provider.

## Preservation and fallback rules

* Camera access occurs only after a tap; camera permission is declared in
  `Info.plist` and Apple requests it as required.
* If the scanner is unsupported, restricted, denied, interrupted or cancelled,
  keep existing input and offer the older **Choose photo** workflow.
* Each camera request has an ID. Out-of-date responses, source edits and
  language changes cannot replace the source.
* A second tap while the camera is open cannot create a second scan.
* Scan completion goes through `beginScreenshotImport()` and
  `previewScreenshotText()`, not a second OCR-to-translation system.

## Validation before public beta

CI must pass `tests/native-camera-translation.test.cjs`, the existing image
paste and native speech checks, and an unsigned iOS Simulator build.

On the physical iPhone:
1. Open **Translate** and tap **📷 Scan text / Escanear**.
2. Grant camera permission if prompted; aim at Spanish and English printed text.
3. Tap one recognized line; check that both editable source and target appear.
4. Repeat using **Use all text** on a multi-line menu.
5. Reverse direction; test U.S. vs U.K. English and regional alternatives.
6. Cancel a scan and confirm original words are unchanged.
7. Deny permission and confirm fallback guidance, then retry after allowing it.
8. Test poor lighting, glare, Spanish accents and mixed-language signs.

## Not yet part of this milestone

This does **not** render translated words on top of the moving camera feed as
Google Lens sometimes does. The live feed highlights **recognized original
text**; a tap imports the chosen text for translation. On-camera translated
overlays and multi-region editing are a separate, later UX stage.
