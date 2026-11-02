"""Run the exact production OCR helper on macOS. Optional argument: local photo.

User photos stay local. The CI default generates synthetic English/Spanish labels.
"""
import pathlib
import subprocess
import sys
import tempfile

root = pathlib.Path(__file__).resolve().parent.parent
source = (root / 'ios/HablaEcuador/HablaEcuadorApp.swift').read_text()
core = source.split('// BEGIN NATIVE IMAGE OCR\n', 1)[1].split('// END NATIVE IMAGE OCR', 1)[0]
test = (root / 'tests/native-image-ocr.swift').read_text()
with tempfile.TemporaryDirectory(prefix='habla-vision-test-') as directory:
    script = pathlib.Path(directory) / 'ImageOCR.swift'
    script.write_text('import Foundation\nimport Vision\n' + core + '\n' + test)
    subprocess.run(['swift', str(script), *sys.argv[1:]], check=True)
