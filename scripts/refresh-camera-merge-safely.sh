#!/usr/bin/env bash
# Take a NEW snapshot of the current signed app, then re-run camera merge safely.
# Never reuse an outdated staged backup.
set -euo pipefail

repo="${HABLA_REPO:-$PWD}"
[[ -d "$repo" ]] || { echo "STOPPED: checkout folder not found." >&2; exit 2; }
repo="$(cd "$repo" && pwd -P)"
git -C "$repo" rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "STOPPED: not a Git checkout." >&2; exit 2;
}
repo="$(git -C "$repo" rev-parse --show-toplevel)"
[[ -d "$repo/ios/HablaEcuador.xcodeproj" ]] || {
  echo "STOPPED: Xcode project not in $repo." >&2; exit 2;
}
remote="$(git -C "$repo" remote get-url origin 2>/dev/null || true)"
[[ "$remote" == *MathewDMoore/habla-ecuador* ]] || {
  echo "STOPPED: unexpected Git remote: $remote" >&2; exit 2;
}
cd "$repo"
paths=(
  ios/HablaEcuador/HablaEcuadorApp.swift
  ios/HablaEcuador/NativeSpeech.js
  ios/HablaEcuador/NativeSpeechCapture.swift
  ios/HablaEcuador/Info.plist
)
for path in "${paths[@]}"; do
  [[ -f "$path" ]] || { echo "STOPPED: missing $path" >&2; exit 2; }
done

# Durable, dated backup, independent of /tmp's automatic cleanup.
backup_root="$HOME/Documents/HablaCameraBackups"
mkdir -p "$backup_root"
backup="$(mktemp -d "$backup_root/camera-before-merge.XXXXXXXX")"
for path in "${paths[@]}"; do
  mkdir -p "$backup/$(dirname "$path")"
  cp -p "$path" "$backup/$path"
done
echo "Saved current native files to: $backup"

scratch="$(mktemp -d /tmp/habla-camera-refresh.XXXXXXXX)"
url="https://raw.githubusercontent.com/MathewDMoore/habla-ecuador/main/scripts"
curl -fsSL "$url/merge-camera-preserving-local.sh" -o "$scratch/merge.sh"
curl -fsSL "$url/resolve-camera-conflicts.py" -o "$scratch/resolve.py"
bash -n "$scratch/merge.sh"
python3 -m py_compile "$scratch/resolve.py"

echo "Creating a FRESH staged camera merge against the current app files..."
if output="$(HABLA_REPO="$repo" bash "$scratch/merge.sh" 2>&1)"; then
  printf '%s\n' "$output"
  echo "Camera merge completed without conflicts. Durable backup: $backup"
  exit 0
else
  status=$?
fi
printf '%s\n' "$output"
if [[ "$status" -ne 5 ]]; then
  echo "STOPPED: merge step failed (status $status). Files backed up at: $backup" >&2
  exit "$status"
fi
stage="$(printf '%s\n' "$output" | sed -n 's/^Local copies and conflict details are in: //p' | tail -n 1)"
if [[ -z "$stage" || "$stage" != /tmp/habla-camera-merge.* || ! -d "$stage" ]]; then
  echo "STOPPED: couldn't identify the fresh staged merge; no repair attempted." >&2
  exit 5
fi
echo "Resolving only the previously reviewed camera conflicts..."
if python3 "$scratch/resolve.py" "$stage"; then
  echo "SUCCESS: Merge completed using a fresh snapshot. Durable backup: $backup"
else
  echo "STOPPED: New conflicts differ or files changed again; no forced overwrite." >&2
  echo "Durable backup: $backup" >&2
  exit 6
fi
