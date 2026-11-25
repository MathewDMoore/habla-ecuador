# YouTube playback and iPhone Share integration

**Status:** Implementation proposed in a feature branch, not installed or signed.
Do not change a user's signed local checkout without checking for local modifications.

## How it works

1. Habla > Music has a new YouTube link field and a privacy-enhanced embedded player. It accepts normal YouTube watch URLs, youtu.be, Shorts, Live and supported embed URLs. It never autoplays, downloads video or extracts protected media.
2. The native iPhone target embeds HablaEcuadorShare.appex with the title **Save to Habla**. iOS offers the action when an app shares a URL or text, subject to the host app's supported share sheet.
3. The extension checks for a valid video ID and saves the original link (no video bytes) to shared App Group preferences (group.com.mathewdmoore.hablaecuador), retaining at most 20 distinct queued links.
4. On foreground activation, Habla reads one queued link, opens its Music screen with the validated video query parameter, and the player displays it. The user taps Play to start. The extension **does not** attempt an unsupported force-open of its parent app.

## Signing setup required on the Mac

- In Apple Developer / Xcode Signing & Capabilities, ensure that **both** the HablaEcuador app and the new HablaEcuadorShare extension are registered for the same **App Groups** identifier: group.com.mathewdmoore.hablaecuador.
- Preserve the existing team, bundle IDs, certificates, and local signing adjustments. The new extension's bundle ID is com.mathewdmoore.HablaEcuador.share; it needs its own valid provisioning support.
- With a signed checkout, fetch the feature branch carefully, review changed files, then compile the HablaEcuador iOS scheme and install over the existing app. Do not uninstall Habla: existing local data must be preserved.
- An unsigned GitHub Actions iOS Simulator compile is a **build check only**, not proof that App Groups or the extension work on the phone.

## Manual regression test on an iPhone

1. Install the new signed native build and check that existing Habla translation, bottom tabs, tutorial navigation, offline data, and Music function normally.
2. Open YouTube, select any embeddable video, tap **Share** and open **More** / the share extension list. If **Save to Habla** isn't immediately visible, use the system's edit/favorites control if offered. Third-party apps cannot force their icon into the top row.
3. Select **Save to Habla**. Verify that it reports the link saved, without launching or replacing YouTube.
4. Manually open Habla. The Music tab should open with that exact video in the embedded player. Tap Play. There must be no automatic playback, recording, transcription, music extraction or invented translated captions.
5. Repeat with a Shorts link and a youtu.be link; test an unrelated website URL and ensure it cannot be saved as a YouTube video.
6. Test videos whose creators disallow embedding. The app should offer **Open on YouTube** as a fallback, not imply that in-app playback or transcripts are available.
7. Check low connectivity and a signed production/TestFlight archive. Verify that the App Group URL queue survives switching between YouTube and Habla and that the extension is bundled in the archive.

## Evidence boundaries

The player uses YouTube's official embedded-video URL, not an undocumented stream URL. Embedding permission, caption availability, and playback behavior are decided by YouTube. Language/artist/region classification and translations are **not** inferred from the shared URL. Habla's existing pre-authored companion captions for the BYE BYE example are separate from this general-purpose player and must not be presented as accurate captions for an unrelated shared video.
