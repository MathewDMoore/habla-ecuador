# Habla Ecuador: TestFlight readiness gates (2026-11-03)

**Status: NOT READY FOR A NEW EXTERNAL TESTFLIGHT RELEASE.** A source build and green CI are necessary, not a substitute for physical iPhone tests or complete translations.

## Release rule
No release until all **P0** criteria below pass on the signed physical iPhone build. For each test record: build number, iOS version, source/target region, online/offline mode, expected result, actual result, and screen recording (avoid sensitive text in public issues). A failure requires a small fix, retained regression test, and retest before release.

| Priority | Feature | Reproducible acceptance criteria | Known risk / current state |
| --- | --- | --- | --- |
| P0 | Offline translation | Download once while connected. Validate **both** English↔Spanish directions; kill/reopen app in airplane mode; translate NEW sentences both directions; no request to online translation provider. Then reconnect and verify default prefers online unless on-device only was deliberately chosen. | A downloaded cache was able to fail model validation indefinitely. Repair work is draft PR #116. Offline language model is distinct from local vocabulary database. |
| P0 | Offline repair | Simulate failed model validation; show **Repair offline pack**, allow repair only while online, revalidate both directions. Do not delete user documents or source text. | Draft PR #116 has automated mock-cache regression tests; real iPhone test pending. |
| P0 | Image paste | Copy PNG/JPEG screenshot into Habla. Image appears/read via native Vision or browser fallback. OCR text remains editable; correct the errors; translation automatically appears in the chosen direction; changing source or canceling must preserve existing text. | OCR and automatic first-section translation exist; check long multi-section images separately. Privacy: do not upload images by default. |
| P0 | Whole research paper | Open an accessible, text-based multi-page PDF or DOCX. Count pages/sections and compare extracted source with original, including abstract, headings, quotations, reference list, citations, DOI/URLs, final page. Translate **every** section, pause, reopen, resume, export; never claim complete if any section failed or was dropped. | Current PDF reader: 10 MB file limit, up to 100 pages, 200,000 extracted characters. Scanned PDFs need OCR, currently unsupported. Original PDF page formatting and images are not retained. |
| P0 | Translation integrity | English↔Ecuadorian Spanish and English↔Mexican/Bolivian Spanish. Reverse uses original source, not repeatedly translated text. Source preserves punctuation and all paragraphs. No blank results labeled success; error and retry visible. | Translation engine has service quota/network limits. Regional output remains a draft unless reviewed. |
| P0 | Camera translation | On-device VisionKit opens, reads small labels and signs, translates *over* recognized source words with correct geometry, allows show-original toggle; works with cancellations, moving camera, incomplete line and stale results. Confirm camera permission and fallback. | Camera draft PR #115 has simulator build success. True spatial overlay is experimental and unverified on physical phone. It does NOT reconstruct invisible text or do photorealistic Lens inpainting. |
| P0 | Core actions | All primary buttons fire and visibly respond; the microphone captures the expected speech source; translation and alternatives are selectable; Home Screen widget links open correct app views. | Earlier reports include no-op buttons, microphone and widget problems. |
| P1 | Music and video captions | Keep bilingual captions visible without covering the player controls; verify controls, song identification and source audio behavior. | Earlier user testing found missing captions and overlapping controls. |
| P1 | Tutorial and feedback | New tester can launch bilingual tutorial, close/reopen it, identify how to report feedback, and understand consent/privacy. | Tutorial discoverability and feedback workflow require device testing. |

## Defined “working” terms
- **Source coded**: change exists in GitHub only.
- **Automated tests passed**: unit/browser/simulator checks passed, not proof the physical camera or microphone works.
- **Installed**: signed build loaded onto a specified physical iPhone.
- **Device verified**: same build exercised end-to-end with source and translation checked.
- **TestFlight ready**: P0 gates passed on a signed archive, version/build incremented, and upload/review requirements satisfied.

## Lightweight next test cases
1. **Offline**: *The house is small.* → Spanish; *La casa es pequeña.* → English, in airplane mode after closing/reopening Habla.
2. **Image paste**: a clean two-paragraph photograph or screenshot plus one deliberately poor image. Ensure no lost paragraph, no silent text replacement, automatic translation or explicit error.
3. **Research paper**: 10–20-page text-based PDF with footnotes/reference section. Verify first AND last page are present; pause and resume midway. Try scanned PDF to confirm a truthful limitation message.
4. **Camera**: small label with brand name, numbers and two line lengths; test OCR errors, stable line positions, and show-original toggle.

## Change policy
Preserve the signed Mac checkout and user-local edits; back up before merging. Keep offline repair, image paste, research-paper and camera changes in separable pull requests, with tests before any new TestFlight upload.
