"""Fetch hash-pinned CC-BY publisher fixtures into /tmp; never into Git.

Requires ffmpeg. WebM is only for the Linux test browser; production uses the
publisher's unmodified H.264/AAC MP4s. No audio is copied into the app shell.
"""
import hashlib
from pathlib import Path
import subprocess
import urllib.request

FIXTURES = {
    'beg05d':'4d1117963ec85c9562921237bfaaf9bfe560cf1ea9ab705142f6fdb23a958d16',
    'adv06c':'7c17b974617f9ec61fa2238fb39aca3ed54d2fd21803535af522e96b2997734b',
    'beg05a':'a8373f3b7bb1d1502389939c32e6234f06b4bc65d4e18cbb483a83a8369b0f1e',
    'beg03c':'e04e445230fa65c8827a4a8683aea1c287bf5682d8af012d891a5dda0f324507',
}
for clip, digest in FIXTURES.items():
    original = Path('/tmp/habla-' + clip + '.mp4')
    if not original.exists():
        with urllib.request.urlopen('https://media.coerll.utexas.edu/spe/mp4/' + clip + '.mp4', timeout=30) as response:
            original.write_bytes(response.read(20_000_001))
    if hashlib.sha256(original.read_bytes()).hexdigest() != digest:
        raise RuntimeError('Publisher file changed: ' + clip + '; recheck the source before updating this fixture')
    subprocess.run(['ffmpeg','-v','error','-i',str(original),'-vf','scale=160:-2',
                    '-c:v','libvpx','-deadline','realtime','-cpu-used','8','-b:v','80k',
                    '-c:a','libopus','-b:a','32k','-y','/tmp/habla-' + clip + '.webm'],check=True)
print('Four hash-pinned publisher videos decoded and WebM browser fixtures prepared in /tmp')
