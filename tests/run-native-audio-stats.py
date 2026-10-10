"""Exercise the production converter and input meter using synthetic PCM on macOS."""
import pathlib
import subprocess
import tempfile

source = pathlib.Path('ios/HablaEcuador/NativeSpeechCapture.swift').read_text()
stats = source.split('private final class NativeInputStats {', 1)[1].split('// iOS 26 APIs', 1)[0]
stats = 'private final class NativeInputStats {' + stats
tap = source.split('            var supplied = false', 1)[1].split('            if result == .error', 1)[0]
conversion = '            var supplied = false' + tap
test = pathlib.Path('tests/native-audio-stats.swift').read_text().replace('// PRODUCTION CONVERSION', conversion)
with tempfile.TemporaryDirectory(prefix='habla-audio-tests-') as temporary:
    script = pathlib.Path(temporary) / 'native-audio.swift'
    script.write_text('import Foundation\nimport AVFoundation\n' + stats + '\n' + test)
    subprocess.run(['swift', str(script)], check=True)
