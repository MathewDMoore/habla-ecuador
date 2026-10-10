"""Run the actual Foundation-only native accumulator with macOS Swift."""
import pathlib
import subprocess
import tempfile
source = pathlib.Path('ios/HablaEcuador/NativeSpeechCapture.swift').read_text()
state = source.split('// BEGIN NATIVE TRANSCRIPT STATE', 1)[1].split('// END NATIVE TRANSCRIPT STATE', 1)[0]
state = state.split('\n', 1)[1]
with tempfile.TemporaryDirectory(prefix='habla-speech-tests-') as temporary:
    script = pathlib.Path(temporary) / 'native-transcript.swift'
    script.write_text('import Foundation\n' + state + '\n' + pathlib.Path('tests/native-transcript-state.swift').read_text())
    subprocess.run(['swift', str(script)], check=True)
