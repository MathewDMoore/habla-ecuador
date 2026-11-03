#!/usr/bin/env bash
# Non-destructive merge of Camera Translator into an existing signed checkout.
set -euo pipefail
repo="${HABLA_REPO:-$PWD}"
[[ -d "$repo" ]] || { echo "Checkout directory missing: $repo" >&2; exit 2; }
repo="$(cd "$repo" && pwd -P)"
git -C "$repo" rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "Not a Git checkout; no files changed." >&2; exit 2;
}
repo="$(git -C "$repo" rev-parse --show-toplevel)"
[[ -d "$repo/ios/HablaEcuador.xcodeproj" ]] || {
  echo "Xcode project missing at $repo; no files changed." >&2; exit 2;
}
remote="$(git -C "$repo" remote get-url origin 2>/dev/null || true)"
[[ "$remote" == *MathewDMoore/habla-ecuador* ]] || {
  echo "Unexpected Git origin: $remote; no files changed." >&2; exit 2;
}
cd "$repo"
paths=(
  ios/HablaEcuador/HablaEcuadorApp.swift
  ios/HablaEcuador/NativeSpeech.js
  ios/HablaEcuador/NativeSpeechCapture.swift
  ios/HablaEcuador/Info.plist
)
for path in "${paths[@]}"; do
  [[ -f "$path" ]] || { echo "Missing $path; no files changed." >&2; exit 2; }
done
echo "Protecting your current Habla checkout: $repo"
git fetch --no-tags origin main
base="$(git merge-base HEAD origin/main || true)"
[[ -n "$base" ]] || { echo "No shared Git ancestor; no files changed." >&2; exit 3; }
stage="$(mktemp -d /tmp/habla-camera-merge.XXXXXX)"
for path in "${paths[@]}"; do
  for sub in local base remote merged; do mkdir -p "$stage/$sub/$(dirname "$path")"; done
  cp -p "$path" "$stage/local/$path"
  git show "$base:$path" > "$stage/base/$path" || {
    echo "Base version unavailable for $path; originals untouched. Backup: $stage" >&2; exit 4;
  }
  git show "origin/main:$path" > "$stage/remote/$path" || {
    echo "Remote version unavailable for $path; originals untouched. Backup: $stage" >&2; exit 4;
  }
done
conflicts=()
for path in "${paths[@]}"; do
  if git merge-file -p "$stage/local/$path" "$stage/base/$path" "$stage/remote/$path" > "$stage/merged/$path"; then
    echo "Clean merge: $path"
  else
    conflicts+=("$path")
    echo "Conflicting edits: $path" >&2
  fi
done
if (( ${#conflicts[@]} )); then
  echo "STOPPED: All of your project files remain unchanged." >&2
  printf 'Conflicts: %s\n' "${conflicts[*]}" >&2
  echo "Local copies and conflict details are in: $stage" >&2
  exit 5
fi
swift="$stage/merged/ios/HablaEcuador/HablaEcuadorApp.swift"
js="$stage/merged/ios/HablaEcuador/NativeSpeech.js"
plist="$stage/merged/ios/HablaEcuador/Info.plist"
if [[ "$(grep -Fc 'private func startCameraScan' "$swift")" -ne 1 ]] ||
   [[ "$(grep -Fc 'button.id = "native-scan-camera"' "$js")" -ne 1 ]] ||
   [[ "$(grep -Fc '<key>NSCameraUsageDescription</key>' "$plist")" -ne 1 ]]; then
  echo "Camera integration validation failed. Originals untouched. Details: $stage" >&2
  exit 6
fi
if command -v node >/dev/null 2>&1; then
  node --check "$js" || { echo "JavaScript validation failed; originals untouched." >&2; exit 6; }
fi
if command -v plutil >/dev/null 2>&1; then
  plutil -lint "$plist" || { echo "Plist validation failed; originals untouched." >&2; exit 6; }
fi
for path in "${paths[@]}"; do
  cmp -s "$path" "$stage/local/$path" || {
    echo "Source changed during merge: $path. Originals untouched." >&2; exit 7;
  }
done
for path in "${paths[@]}"; do cp "$stage/merged/$path" "$path"; done
echo "Camera integration prepared. Complete backups: $stage/local"
echo "Preserved current checkout, branch, widget project and signing."
if [[ "$(uname)" == "Darwin" ]] && command -v open >/dev/null 2>&1; then
  if open ios/HablaEcuador.xcodeproj; then
    echo "Xcode opened. Select your iPhone and press Command-R."
  else
    echo "Open ios/HablaEcuador.xcodeproj in Xcode."
  fi
fi
echo "This did not upload or install a new TestFlight build."
