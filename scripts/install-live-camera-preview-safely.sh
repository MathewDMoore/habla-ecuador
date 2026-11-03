#!/usr/bin/env bash
# Non-destructive installation for the signed Habla Ecuador iPhone checkout.
set -euo pipefail
repo="${HABLA_REPO:-$PWD}"
[[ -d "$repo" ]] || { echo 'STOPPED: Habla folder not found.' >&2; exit 2; }
repo="$(cd "$repo" && pwd -P)"
git -C "$repo" rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo 'STOPPED: Not a Git checkout.' >&2; exit 2; }
repo="$(git -C "$repo" rev-parse --show-toplevel)"
[[ -d "$repo/ios/HablaEcuador.xcodeproj" ]] || { echo 'STOPPED: No Habla Xcode project found.' >&2; exit 2; }
remote="$(git -C "$repo" remote get-url origin 2>/dev/null || true)"
[[ "$remote" == *MathewDMoore/habla-ecuador* ]] || { echo 'STOPPED: Unexpected Git repository.' >&2; exit 2; }
cd "$repo"
feature='feature/camera-live-overlay-preview'
paths=(ios/HablaEcuador/HablaEcuadorApp.swift ios/HablaEcuador/NativeSpeech.js)
for path in "${paths[@]}"; do
  [[ -f "$path" ]] || { echo "STOPPED: Missing $path" >&2; exit 2; }
done
root="$HOME/Documents/HablaCameraBackups"
mkdir -p "$root"
stage="$(mktemp -d "$root/camera-overlay.XXXXXXXX")"
for path in "${paths[@]}"; do
  for sub in original base proposed merged; do mkdir -p "$stage/$sub/$(dirname "$path")"; done
  cp -p "$path" "$stage/original/$path"
done
echo "Original files backed up at: $stage/original"
git fetch --no-tags origin "refs/heads/main:refs/remotes/origin/main" "refs/heads/$feature:refs/remotes/origin/$feature" || { echo 'STOPPED: Could not fetch sources.' >&2; exit 3; }
# If the earlier live camera *panel* was installed locally, merge from that
# verified milestone so shared code is not mistaken for a new conflicting edit.
base="origin/main"
if grep -Fq 'private func installCameraOverlay(' ios/HablaEcuador/HablaEcuadorApp.swift &&
   grep -Fq 'window.__hablaCameraLiveRequest = async payload =>' ios/HablaEcuador/NativeSpeech.js; then
  base="ff6005010c858e61068cd260a4867ae02d08e819"
  git cat-file -e "$base^{commit}" || { echo 'STOPPED: Prior camera panel base is missing.' >&2; exit 3; }
fi
echo "Merging from camera baseline: $base"
for path in "${paths[@]}"; do
  git show "$base:$path" > "$stage/base/$path" || { echo "STOPPED: Missing base version of $path" >&2; exit 3; }
  git show "origin/$feature:$path" > "$stage/proposed/$path" || { echo "STOPPED: Missing feature version of $path" >&2; exit 3; }
  if ! git merge-file -p "$stage/original/$path" "$stage/base/$path" "$stage/proposed/$path" > "$stage/merged/$path"; then
    echo "STOPPED: Unreviewed local changes conflict in $path." >&2
    echo "Your originals remain unchanged. Source and diagnostics: $stage" >&2
    exit 4
  fi
done
swift="$stage/merged/ios/HablaEcuador/HablaEcuadorApp.swift"
js="$stage/merged/ios/HablaEcuador/NativeSpeech.js"
if [[ "$(grep -Fc 'private func installCameraOverlay(' "$swift")" != 1 ]] ||
   [[ "$(grep -Fc 'private func receiveCameraLiveResult(' "$swift")" != 1 ]] ||
   [[ "$(grep -Fc 'window.__hablaCameraLiveRequest = async payload =>' "$js")" != 1 ]] ||
   grep -Eq '^(<<<<<<< |>>>>>>> )' "$swift" "$js"; then
  echo "STOPPED: Live-overlay feature validation failed. Backups: $stage" >&2; exit 5
fi
if command -v node >/dev/null 2>&1; then node --check "$js" || exit 5; fi
if command -v xcrun >/dev/null 2>&1; then xcrun swiftc -frontend -parse "$swift" || exit 5; fi
for path in "${paths[@]}"; do
  cmp -s "$path" "$stage/original/$path" || { echo "STOPPED: Current source changed during merge: $path" >&2; exit 6; }
done
for path in "${paths[@]}"; do cp -p "$stage/merged/$path" "$path"; done
echo "SUCCESS: Live camera overlay source installed without resetting other work."
echo "Durable backups: $stage/original"
echo 'Physical iPhone build and test are still required. No TestFlight upload occurred.'
if command -v open >/dev/null 2>&1; then open ios/HablaEcuador.xcodeproj || true; fi
echo 'Select your iPhone in Xcode and press Command-R; test Live translation in the camera.'
