#!/bin/bash
# Run from the isolated prototype checkout on Mathew's Mac. No Git mutations.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
: "${HABLA_DEVELOPMENT_TEAM:?Set HABLA_DEVELOPMENT_TEAM for signing}"
: "${HABLA_IPHONE_ID:?Set HABLA_IPHONE_ID to the connected iPhone identifier}"
recording_derived=/tmp/HablaEcuador-recording-import-derived
recording_build_log=/tmp/habla-recording-import-build.log
printf 'Checking native transcript and audio fixtures…\n'
python3 tests/run-native-transcript-state.py
python3 tests/run-native-audio-stats.py
python3 tests/run-native-music-review.py
python3 tests/run-native-recording-audio.py
printf 'Building native 0.1.16 (17). Build output: %s\n' "$recording_build_log"
if ! xcodebuild -project ios/HablaEcuador.xcodeproj -scheme HablaEcuador \
  -configuration Debug -destination 'generic/platform=iOS' \
  -derivedDataPath "$recording_derived" \
  DEVELOPMENT_TEAM="$HABLA_DEVELOPMENT_TEAM" -allowProvisioningUpdates build \
  > "$recording_build_log" 2>&1; then
  if ! grep -E 'error:|\*\* BUILD FAILED \*\*' "$recording_build_log"; then
    tail -n 40 "$recording_build_log"
  fi
  exit 1
fi
printf 'Build succeeded. Installing on the connected iPhone…\n'
xcrun devicectl device install app --device "$HABLA_IPHONE_ID" \
  "$recording_derived/Build/Products/Debug-iphoneos/HablaEcuador.app"
xcrun devicectl device process launch --device "$HABLA_IPHONE_ID" \
  --terminate-existing com.mathewdmoore.HablaEcuador
printf 'Installed and launched. Open Music → Import a recording · Photos / Files.\n'
