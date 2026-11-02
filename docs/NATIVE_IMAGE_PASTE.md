# Native image paste before external testing

The hosted Paste image button depends on `navigator.clipboard.read()`. On older
companions it can be missing or denied; denial only reports an error. Selecting
Photos is a separate import path and does not prove copied-image paste works.

The native companion now registers `hablaClipboard` with a reply handler. Its
bundled script intercepts only the two image-paste buttons, asks UIKit for the
image after that tap, and passes a PNG File into the existing local OCR/import
and automatic-translation pipeline. The image is normalized to at most 2800
pixels on its longest edge and 10 MB. Clipboard contents are not read at launch
or in the background. Empty/denied clipboard reads show a retry/Choose photo
message without replacing the source. Pending replies are discarded after an
edit, language change, cancellation, or later paste request. Subframes and
pages outside the Habla HTTPS path are rejected by the native handler.

This is bundled native code, so the fix requires an Xcode build/install. It does
not depend on deploying a modified website. The existing hosted OCR reader and
language data still need connectivity on first use. Safari and older installed
companions retain their existing browser clipboard behavior.

`scripts/prepare-native-image-paste.sh` finds the existing Mac project, fetches
this branch, applies only the two native-file changes if the patch fits, checks
JavaScript syntax when Node is present, builds app/widget for Simulator, and
opens Xcode for the physical-device run. It preserves the current branch,
version, local source, and signing settings; it does not archive or upload.
When a different committed companion version rejects the direct patch, it first
checks a three-way merge of both files in a temporary directory. A clean merge
preserves that version's native code and writes only the repaired working files;
the Git index is unchanged. Conflicting local
changes cause it to stop without applying the patch and print the source context
needed to adapt the fix.

## Validation

- Native JavaScript bridge tests: explicit tap, PNG transfer to the OCR entry,
  browser-handler suppression, denied/invalid replies, unchanged source on
  failure, superseded replies, cancellation, and older companion compatibility.
- Existing screenshot import and speech bridge regression suites.
- GitHub native workflow: compile app/widget for iOS Simulator without signing.
- Required before invitations: install from Xcode on the physical iPhone; copy
  a text-bearing screenshot in Photos; tap Paste image in Translate; allow Paste
  if asked; verify the source text and the requested translation. Repeat with
  Spanish-to-English and English-to-Spanish, both image-paste buttons, an empty
  or text-only clipboard, and Choose photo. This device check remains unverified
  until Mathew performs it.
