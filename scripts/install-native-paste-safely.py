#!/usr/bin/env python3
"""Install the reviewed native Paste Text/Image fix without overwriting camera/audio code.

Run from the existing signed Habla Ecuador checkout on the Mac. This script
changes exactly two protected native source spans; the Xcode project/signing
and all other features are left untouched.
"""
from pathlib import Path
import datetime, os, shutil, subprocess, sys, tempfile

REPO = Path(os.environ.get('HABLA_REPO', os.getcwd())).expanduser().resolve()
BRANCH = 'fix/paste-text-or-image-native'
PATHS = ('ios/HablaEcuador/HablaEcuadorApp.swift', 'ios/HablaEcuador/NativeSpeech.js')
SWIFT_HEAD = 'private final class ClipboardImageHandler: NSObject, WKScriptMessageHandlerWithReply {'
SWIFT_END = '\nfinal class TranslatorController:'
JS_HEAD = '  const clipboard = window.webkit.messageHandlers.hablaClipboard;'
JS_END = '  // Keep camera controls beside'
CONFIRM_HEAD = '    // WKWebView does not reliably present JavaScript confirm prompts without'
CONFIRM_END = "    // The app's document and embedded YouTube video are different frames."

def fail(msg):
    raise RuntimeError('STOPPED: ' + msg + '. No existing project edits have been intentionally overwritten.')

def run(*args):
    return subprocess.run(args, cwd=REPO, check=True, text=True, capture_output=True).stdout

def slice_segment(contents, first, last):
    a=contents.find(first)
    b=contents.find(last,a+len(first))
    if a < 0 or b < 0 or b <= a: fail('Expected source boundary not found')
    return contents[a:b]

def main():
    if not (REPO/'ios/HablaEcuador.xcodeproj').is_dir(): fail('Xcode project not found in the current folder')
    root=run('git','rev-parse','--show-toplevel').strip()
    if Path(root).resolve()!=REPO: fail('Run in the top level of the signed Habla checkout')
    origin=run('git','remote','get-url','origin').strip()
    if 'MathewDMoore/habla-ecuador' not in origin: fail('Unexpected Git origin')
    for path in PATHS:
        if not (REPO/path).is_file(): fail('Missing '+path)
    archive=Path.home()/'Documents'/'HablaPasteBackups'
    archive.mkdir(parents=True,exist_ok=True)
    folder=Path(tempfile.mkdtemp(prefix='paste-before-fix-',dir=archive))
    originals={}
    for path in PATHS:
        data=(REPO/path).read_bytes()
        originals[path]=data
        target=folder/path
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(data)
    print('Original files saved at:',folder,flush=True)
    subprocess.run(['git','fetch','--no-tags','origin',
        'refs/heads/main:refs/remotes/origin/main',
        'refs/heads/'+BRANCH+':refs/remotes/origin/'+BRANCH],cwd=REPO,check=True)
    updates={}
    for path in PATHS:
        local=originals[path].decode('utf-8')
        base=run('git','show','origin/main:'+path)
        new=run('git','show','origin/'+BRANCH+':'+path)
        head,end=(SWIFT_HEAD,SWIFT_END) if path.endswith('.swift') else (JS_HEAD,JS_END)
        oldpart=slice_segment(base,head,end)
        newpart=slice_segment(new,head,end)
        if oldpart in local:
            local=local.replace(oldpart,newpart,1)
        elif newpart not in local:
            fail('Local edits conflict with the Paste fix in '+path+'; originals backed up at '+str(folder))
        if path.endswith('.swift'):
            confirm=slice_segment(new,CONFIRM_HEAD,CONFIRM_END)
            if CONFIRM_HEAD not in local:
                if CONFIRM_END not in local: fail('Cannot safely insert native confirmation')
                local=local.replace(CONFIRM_END,confirm+CONFIRM_END,1)
        updates[path]=local
    if 'pasteToTranslate' not in updates[PATHS[0]] or 'UIPasteboard.general.string' not in updates[PATHS[0]] or 'runJavaScriptConfirmPanelWithMessage' not in updates[PATHS[0]]:
        fail('Native text handler or replacement confirmation missing')
    if '#native-paste-feedback' not in updates[PATHS[1]] or 'pasteToTranslate' not in updates[PATHS[1]]:
        fail('Visible clipboard feedback or JS bridge missing')
    stage=folder/'prepared'
    stage.mkdir()
    temp={}
    for path in PATHS:
        p=stage/path
        p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text(updates[path])
        temp[path]=p
    if shutil.which('node'):
        subprocess.run(['node','--check',str(temp[PATHS[1]])],check=True)
    if shutil.which('xcrun'):
        subprocess.run(['xcrun','swiftc','-frontend','-parse',str(temp[PATHS[0]])],check=True)
    for path in PATHS:
        if (REPO/path).read_bytes()!=originals[path]: fail('The files changed during inspection; refusing overwrite')
    changed=[]
    try:
        for path in PATHS:
            dest=REPO/path
            copy=dest.parent/('.habla-paste-'+dest.name+'.tmp')
            shutil.copy2(temp[path],copy)
            os.replace(copy,dest)
            changed.append(path)
    except Exception:
        for path in changed:
            (REPO/path).write_bytes(originals[path])
        raise
    print('SUCCESS: Paste text or image support prepared. Local camera/audio changes kept.')
    print('Backups:',folder)
    print('Xcode signing and TestFlight were NOT changed.')
    if sys.platform=='darwin':
        subprocess.run(['open','ios/HablaEcuador.xcodeproj'],cwd=REPO,check=False)
    print('Select your iPhone in Xcode, press Command-R, and test copying TEXT then pasting.')
if __name__=='__main__':
    try: main()
    except Exception as exc:
        print(str(exc),file=sys.stderr)
        sys.exit(1)
