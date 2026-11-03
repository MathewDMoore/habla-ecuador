#!/usr/bin/env bash
# Prepare the signed Habla Ecuador checkout for camera translation.
# Local signing, Xcode project settings, build numbers, and TestFlight stay untouched.
set -euo pipefail

if [[ -n "${HABLA_REPO:-}" ]]; then
  repo="$HABLA_REPO"
elif git -C "$PWD" rev-parse --is-inside-work-tree >/dev/null 2>&1 && [[ -d "$PWD/ios/HablaEcuador.xcodeproj" ]]; then
  repo="$PWD"
elif [[ -d "$HOME/HablaEcuador-widget.iNAjya/.git" ]]; then
  repo="$HOME/HablaEcuador-widget.iNAjya"
else
  printf 'Could not find signed Habla checkout. Run inside the checkout or set HABLA_REPO.\n' >&2
  exit 2
fi
repo="$(cd "$repo" && pwd -P)"
if [[ ! -d "$repo/.git" || ! -d "$repo/ios/HablaEcuador.xcodeproj" ]]; then
  printf 'Not a complete Habla Ecuador Xcode checkout: %s\n' "$repo" >&2
  exit 2
fi
remote="$(git -C "$repo" remote get-url origin 2>/dev/null || true)"
if [[ "$remote" != *MathewDMoore/habla-ecuador* ]]; then
  printf 'Unexpected Git origin: %s\n' "$remote" >&2
  exit 2
fi
paths=(
  ios/HablaEcuador/HablaEcuadorApp.swift
  ios/HablaEcuador/NativeSpeech.js
  ios/HablaEcuador/NativeSpeechCapture.swift
  ios/HablaEcuador/Info.plist
)
cd "$repo"
printf 'Signed Habla checkout: %s\n' "$repo"
if [[ -n "$(git status --porcelain -- "${paths[@]}")" ]]; then
  printf 'Local native edits detected. Nothing changed. Preserve these edits first:\n' >&2
  git status --short -- "${paths[@]}" >&2
  exit 3
fi
git fetch --no-tags origin main
for path in "${paths[@]}"; do
  git cat-file -e "origin/main:$path" || { echo "Missing file: $path" >&2; exit 4; }
done
if ! git show origin/main:ios/HablaEcuador/HablaEcuadorApp.swift | grep -q 'startCameraScan'; then
  echo 'Camera source not present on origin/main. Aborting.' >&2
  exit 4
fi
backup="$(mktemp -d /tmp/habla-camera-backup.XXXXXX)"
for path in "${paths[@]}"; do
  mkdir -p "$backup/$(dirname "$path")"
  cp -p "$path" "$backup/$path"
done
printf 'Source backups: %s\n' "$backup"
git restore --source=origin/main --worktree -- "${paths[@]}"
if ! grep -q 'startCameraScan' ios/HablaEcuador/HablaEcuadorApp.swift ||
   ! grep -q 'Scan text / Escanear' ios/HablaEcuador/NativeSpeech.js ||
   ! grep -q 'NSCameraUsageDescription' ios/HablaEcuador/Info.plist; then
  printf 'Verification failed; backups are in %s\n' "$backup" >&2
  exit 5
fi
printf 'Camera code ready, signing preserved. Source: %s\n' "$(git rev-parse --short origin/main)"
if command -v open >/dev/null 2>&1; then
  open ios/HablaEcuador.xcodeproj
  echo 'In Xcode: select your connected iPhone, press Command-R, and test Scan text / Escanear.'
else
  echo 'Open ios/HablaEcuador.xcodeproj on your Mac.'
fi
echo 'Do not uninstall Habla. For TestFlight later, increase build number and Archive/Upload.'
