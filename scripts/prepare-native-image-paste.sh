#!/bin/bash
# Apply only the reviewed clipboard fix to the user's existing native source.
# Do not switch branches, reset source, change signing, archive, or upload.
set -euo pipefail
if [ "$(uname -s)" != Darwin ]; then
  echo 'Run this in Terminal on your Mac with Xcode installed.'
  exit 1
fi
habla_repo=$(python3 - <<'PY'
import os, pathlib, subprocess, sys
home=pathlib.Path.home()
def valid(path):
    return (path/'ios/HablaEcuador.xcodeproj').is_dir() and subprocess.run(
        ['git','-C',str(path),'rev-parse','--show-toplevel'],capture_output=True).returncode==0
given=os.environ.get('HABLA_REPO')
if given:
    path=pathlib.Path(given).expanduser().resolve()
    if not valid(path): sys.exit('HABLA_REPO does not contain the Habla Xcode project.')
    print(path);sys.exit()
current=pathlib.Path.cwd().resolve()
for path in [current,*current.parents]:
    if valid(path): print(path);sys.exit()
candidates=set()
for path in [home/'habla-ecuador',home/'HablaEcuador',home/'Desktop/habla-ecuador',home/'Documents/habla-ecuador']:
    if valid(path): candidates.add(path.resolve())
try:
    found=subprocess.run(['mdfind','kMDItemFSName == "HablaEcuador.xcodeproj"'],capture_output=True,text=True,timeout=15)
    for item in found.stdout.splitlines():
        path=pathlib.Path(item).parent.parent
        if valid(path): candidates.add(path.resolve())
except (FileNotFoundError,subprocess.TimeoutExpired): pass
if not candidates:
    skip={'.git','node_modules','Library','versions','DerivedData','build','.Trash','Applications','Pods'}
    for folder in ['Desktop','Documents','Downloads','Developer','Projects']:
        root=home/folder
        for directory,dirs,_ in os.walk(root):
            path=pathlib.Path(directory)
            dirs[:]=[name for name in dirs if name not in skip and not name.startswith('.') and len(path.relative_to(root).parts)<6]
            if valid(path): candidates.add(path.resolve());dirs[:]=[]
if len(candidates)!=1:
    print('Could not choose one Habla repository. Found:',file=sys.stderr)
    for item in sorted(candidates): print(item,file=sys.stderr)
    sys.exit('Run again from your Habla repository folder, or set HABLA_REPO to its path.')
print(candidates.pop())
PY
)
cd "$habla_repo"
echo "Habla project: $habla_repo"
git status --short
habla_patch=$(mktemp "${TMPDIR:-/tmp}/habla-image-paste.XXXXXX")
trap 'rm -f "$habla_patch"' EXIT
git fetch --no-tags https://github.com/MathewDMoore/habla-ecuador.git refs/heads/fix/native-image-paste-before-beta
git diff d5dd4ddce3fa607a53eb9a842440686fabde42ab FETCH_HEAD -- ios/HablaEcuador/HablaEcuadorApp.swift ios/HablaEcuador/NativeSpeech.js > "$habla_patch"
if [ ! -s "$habla_patch" ]; then
  echo 'No clipboard patch was retrieved. Stopping.'
  exit 1
fi
merge_native_fix() {
  python3 - <<'PY'
import pathlib, subprocess, sys, tempfile
names=['ios/HablaEcuador/HablaEcuadorApp.swift','ios/HablaEcuador/NativeSpeech.js']
pending=[]
with tempfile.TemporaryDirectory(prefix='habla-native-merge-') as folder:
    folder=pathlib.Path(folder)
    for number,name in enumerate(names):
        path=pathlib.Path(name)
        original=path.read_bytes()
        current=folder/f'{number}-current'
        base=folder/f'{number}-base'
        repaired=folder/f'{number}-repaired'
        current.write_bytes(original)
        base.write_bytes(subprocess.check_output(['git','show','d5dd4ddce3fa607a53eb9a842440686fabde42ab:'+name]))
        repaired.write_bytes(subprocess.check_output(['git','show','FETCH_HEAD:'+name]))
        # merge-file -p writes ONLY stdout. Conflicts never touch the project
        # or its index; both complete results are checked before either write.
        result=subprocess.run(['git','merge-file','-p',str(current),str(base),str(repaired)],capture_output=True)
        if result.returncode:
            print('Could not merge '+name+' automatically.',file=sys.stderr)
            sys.exit(1)
        pending.append((path,original,result.stdout))
    if any(path.read_bytes()!=original for path,original,_ in pending):
        sys.exit('Native source changed during preparation. No merge was written.')
    for path,_,merged in pending:
        path.write_bytes(merged)
PY
}
if git apply --check "$habla_patch" 2>/dev/null; then
  git apply "$habla_patch"
  echo 'Native image-paste fix applied. Your current branch and signing settings were kept.'
elif git apply --reverse --check "$habla_patch" 2>/dev/null; then
  echo 'Native image-paste fix is already applied.'
elif merge_native_fix; then
  echo 'Native image-paste fix merged with your current native source. Branch and signing settings were kept.'
else
  echo 'The native changes need a source-specific patch. No patch was applied. Send the following output back:'
  git log -1 --format='%H %s'
  git branch --show-current
  sed -n '1,95p' ios/HablaEcuador/NativeSpeech.js
  sed -n '1,125p' ios/HablaEcuador/HablaEcuadorApp.swift
  exit 1
fi
git diff --check
if command -v node >/dev/null 2>&1; then
  node --check ios/HablaEcuador/NativeSpeech.js
fi
habla_log=$(mktemp "${TMPDIR:-/tmp}/habla-image-paste-build.XXXXXX")
echo "Compiling app and widget for Simulator. Build log: $habla_log"
if xcodebuild -quiet -project ios/HablaEcuador.xcodeproj -scheme HablaEcuador \
  -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO COMPILER_INDEX_STORE_ENABLE=NO build > "$habla_log" 2>&1; then
  echo 'SIMULATOR BUILD PASSED. The physical-iPhone paste check is still required.'
else
  tail -n 70 "$habla_log"
  echo "BUILD FAILED. Full log: $habla_log"
  exit 1
fi
open -a Xcode ios/HablaEcuador.xcodeproj
echo 'Connect and unlock your iPhone. In Xcode select your iPhone and press Command-R.'
echo 'Copy an image in Photos, open Translate, tap Paste image, and allow Paste if asked.'
echo 'Verify recognized text AND its translation. Keep invitations unsent until this passes.'
