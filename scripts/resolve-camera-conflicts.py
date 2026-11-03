#!/usr/bin/env python3
"""Safely resolve the three reviewed Habla camera merge conflicts.

Uses the staged, non-destructive three-way merge produced by
scripts/merge-camera-preserving-local.sh. Requires exact expected conflict
shapes; never resolves an unknown conflict automatically.
"""
from __future__ import annotations
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

FILES = (
    'ios/HablaEcuador/HablaEcuadorApp.swift',
    'ios/HablaEcuador/NativeSpeech.js',
    'ios/HablaEcuador/NativeSpeechCapture.swift',
    'ios/HablaEcuador/Info.plist',
)
SWIFT_OLD = 'final class TranslatorController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {'
SWIFT_NEW = 'final class TranslatorController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler, DataScannerViewControllerDelegate {'
CONFLICT = re.compile(r'^<<<<<<< [^\n]*\n(.*?)^=======\n(.*?)^>>>>>>> [^\n]*\n', re.M | re.S)


def stop(reason):
    raise RuntimeError(reason + '\nNo project files have been intentionally replaced.')


def resolve_swift(path: Path) -> str:
    text = path.read_text()
    hunks = CONFLICT.findall(text)
    if len(hunks) != 2:
        stop(f'Expected exactly 2 Swift conflicts, saw {len(hunks)}.')
    if not (hunks[0][0].strip() == '' and hunks[0][1].strip() == 'import VisionKit'):
        stop('Swift import conflict is different from the reviewed one.')
    if not (hunks[1][0].strip() == SWIFT_OLD and hunks[1][1].strip() == SWIFT_NEW):
        stop('Swift controller declaration differs from the reviewed conflict.')
    result = CONFLICT.sub(lambda m: m.group(2), text)
    if result.count('private func startCameraScan(') != 1 or result.count('import VisionKit') != 1:
        stop('Camera implementation is not present exactly once in Swift.')
    return result


def resolve_js(path: Path) -> str:
    text = path.read_text()
    hunks = CONFLICT.findall(text)
    if len(hunks) != 1:
        stop(f'Expected exactly 1 JavaScript conflict, saw {len(hunks)}.')
    local, remote = hunks[0]
    if local.strip() or not remote.lstrip().startswith('// Keep camera controls beside the existing image actions'):
        stop('JavaScript conflict differs from the reviewed camera addition.')
    for token in ('button.id = "native-scan-camera"', 'window.__hablaCameraScan = payload =>', 'action: "scan-camera"'):
        if token not in remote:
            stop('Missing expected camera bridge code: ' + token)
    result = CONFLICT.sub(lambda m: m.group(2), text)
    if result.count('button.id = "native-scan-camera"') != 1:
        stop('Camera button must exist exactly once.')
    return result


def check(command, description):
    print('Checking:', description, flush=True)
    subprocess.run(command, check=True)


def main():
    if len(sys.argv) != 2:
        stop('Usage: python3 resolve_habla_camera.py /tmp/habla-camera-merge.YE27Dx')
    stage = Path(sys.argv[1]).expanduser().resolve()
    repo = Path.cwd().resolve()
    if not (repo / 'ios/HablaEcuador.xcodeproj').is_dir():
        stop('Open Terminal in the Habla checkout, then retry.')
    if not all((stage / 'local' / name).is_file() and (stage / 'merged' / name).is_file() for name in FILES):
        stop(f'Missing expected backup or merged files inside {stage}.')
    if not stage.name.startswith('habla-camera-merge.') or stage.parent != Path('/tmp'):
        stop('Unexpected staged merge location.')
    for name in FILES:
        current = repo / name
        if not current.is_file() or current.read_bytes() != (stage / 'local' / name).read_bytes():
            stop(f'Your local {name} has changed since the earlier backup; refusing to overwrite.')

    resolved = stage / 'camera-resolved'
    if resolved.exists():
        stop(f'Already has a camera-resolved directory: {resolved}. Refusing to reuse it.')
    resolved.mkdir(mode=0o700)
    for name in FILES:
        dest = resolved / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        src = stage / 'merged' / name
        if name.endswith('HablaEcuadorApp.swift'):
            dest.write_text(resolve_swift(src))
        elif name.endswith('NativeSpeech.js'):
            dest.write_text(resolve_js(src))
        else:
            text = src.read_text()
            if CONFLICT.search(text):
                stop(f'Unexpected remaining conflict in {name}.')
            dest.write_text(text)
        shutil.copymode(stage / 'local' / name, dest)
        if any(mark in dest.read_text() for mark in ('<<<<<<< ', '>>>>>>> ')):
            stop(f'Conflict marker remains in {name}.')

    if 'NSCameraUsageDescription' not in (resolved / 'ios/HablaEcuador/Info.plist').read_text():
        stop('Required camera permission is missing.')
    if shutil.which('node'):
        check(['node', '--check', str(resolved / 'ios/HablaEcuador/NativeSpeech.js')], 'JavaScript syntax')
    if shutil.which('plutil'):
        check(['plutil', '-lint', str(resolved / 'ios/HablaEcuador/Info.plist')], 'iOS privacy permissions')
    if shutil.which('xcrun'):
        check(['xcrun', 'swiftc', '-frontend', '-parse', str(resolved / 'ios/HablaEcuador/HablaEcuadorApp.swift')], 'Swift syntax')

    ready = []
    for name in FILES:
        dest = repo / name
        fd, tempname = tempfile.mkstemp(prefix='.habla-camera-', dir=dest.parent)
        os.close(fd)
        temp = Path(tempname)
        shutil.copy2(resolved / name, temp)
        ready.append((temp, dest, stage / 'local' / name))
    try:
        for name in FILES:
            if (repo / name).read_bytes() != (stage / 'local' / name).read_bytes():
                stop(f'{name} changed while preparing; no files overwritten.')
        for temp, dest, backup in ready:
            os.replace(temp, dest)
    except Exception:
        print('Write interrupted; restoring all four originals from the backup.', file=sys.stderr)
        for temp, dest, backup in ready:
            if backup.is_file():
                shutil.copy2(backup, dest)
        raise
    finally:
        for temp, _, _ in ready:
            temp.unlink(missing_ok=True)

    print('\nSUCCESS: Camera code added while preserving existing local edits.')
    print('Original backups:', stage / 'local')
    print('Merged code:', resolved)
    print('Xcode project, signing and TestFlight build were not changed.')
    print('Next: open ios/HablaEcuador.xcodeproj, select the iPhone, press Command-R.')
    if sys.platform == 'darwin':
        subprocess.run(['open', 'ios/HablaEcuador.xcodeproj'], check=False)


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, subprocess.CalledProcessError) as exc:
        print('STOPPED:', str(exc), file=sys.stderr)
        sys.exit(1)
