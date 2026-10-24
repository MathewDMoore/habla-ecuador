"""On macOS, run production imported-audio signal checks against synthetic PCM."""
import pathlib, subprocess, tempfile
source = pathlib.Path('ios/HablaEcuador/NativeRecordingImport.swift').read_text()
start = source.index('    nonisolated private static func hasSignal(')
end = source.index('    private func report(', start)
method = source[start:end].replace('nonisolated private static', 'static')
problem = source[source.index('private struct RecordingImportProblem:'):]
tests = r'''
let directory = FileManager.default.temporaryDirectory.appendingPathComponent("habla-recording-test-" + UUID().uuidString)
try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: false)
defer { try? FileManager.default.removeItem(at: directory) }
func fixture(_ name: String, amplitude: Float, seconds: Int = 1, stereo: Bool = false) throws -> URL {
    let url = directory.appendingPathComponent(name + ".caf")
    let format = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: 16000, channels: stereo ? 2 : 1, interleaved: false)!
    let file = try AVAudioFile(forWriting: url, settings: format.settings)
    let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 4096)!
    var remaining = seconds * 16000
    while remaining > 0 {
        let count = min(remaining, 4096)
        buffer.frameLength = AVAudioFrameCount(count)
        for channel in 0..<Int(format.channelCount) {
            for frame in 0..<count {
                buffer.floatChannelData![channel][frame] = stereo && channel == 0 ? 0 : (frame % 2 == 0 ? amplitude : -amplitude)
            }
        }
        try file.write(from: buffer)
        remaining -= count
    }
    return url
}
let silent = try fixture("silent", amplitude: 0)
let nearlySilent = try fixture("nearly-silent", amplitude: 0.000001)
let signal = try fixture("signal", amplitude: 0.08)
let stereo = try fixture("one-audible-channel", amplitude: 0.08, stereo: true)
let tooLong = try fixture("too-long", amplitude: 0.08, seconds: 62)
assert(try RecordingAudioFixture.hasSignal(silent) == false)
assert(try RecordingAudioFixture.hasSignal(nearlySilent) == false)
assert(try RecordingAudioFixture.hasSignal(signal))
assert(try RecordingAudioFixture.hasSignal(stereo))
do { _ = try RecordingAudioFixture.hasSignal(tooLong); fatalError("Overlong input accepted") }
catch { /* The production guard rejects out-of-bound decoded audio. */ }
print("Recording audio: silence, nearly silent PCM, audible signal, stereo channel and duration bound passed")
'''
# assert's autoclosure cannot throw: evaluate before asserting.
tests = tests.replace('assert(try RecordingAudioFixture.hasSignal(silent) == false)', 'let silentResult = try RecordingAudioFixture.hasSignal(silent); assert(!silentResult)')
tests = tests.replace('assert(try RecordingAudioFixture.hasSignal(nearlySilent) == false)', 'let nearlySilentResult = try RecordingAudioFixture.hasSignal(nearlySilent); assert(!nearlySilentResult)')
tests = tests.replace('assert(try RecordingAudioFixture.hasSignal(signal))', 'let signalResult = try RecordingAudioFixture.hasSignal(signal); assert(signalResult)')
tests = tests.replace('assert(try RecordingAudioFixture.hasSignal(stereo))', 'let stereoResult = try RecordingAudioFixture.hasSignal(stereo); assert(stereoResult)')
with tempfile.TemporaryDirectory(prefix='habla-recording-swift-') as temporary:
    script = pathlib.Path(temporary) / 'recording-audio.swift'
    script.write_text('import Foundation\nimport AVFoundation\n' + problem + '\nprivate enum RecordingAudioFixture {\n' + method + '\n}\n' + tests)
    subprocess.run(['swift', str(script)], check=True)
