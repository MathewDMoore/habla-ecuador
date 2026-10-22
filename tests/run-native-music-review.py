"""Exercise production retry storage/conversion on macOS without downloading a model."""
import pathlib
import subprocess
import tempfile
source = pathlib.Path('ios/HablaEcuador/NativeMusicReview.swift').read_text()
prefix = source.split('final class NativeMusicReview {', 1)[1].split('    func transcribe(id:', 1)[0]
policy = source.split('struct MusicReviewSamples {', 1)[1]
production = 'final class NativeMusicReview {' + prefix + '}\nstruct MusicReviewSamples {' + policy
checks = r'''
do {
    var ring = MusicReviewSamples()
    ring.append((0..<(MusicReviewSamples.capacity + 12)).map(Float.init))
    assert(ring.snapshot().count == 480000)
    assert(ring.snapshot().first == 12 && ring.snapshot().last == 480011)
    ring.clear()
    assert(ring.snapshot().isEmpty)
    ring.append([1, 1, 2])
    assert(ring.snapshot() == [1, 1, 2]) // real repetition must survive
    assert(MusicReviewSamples.accepts(logProbability: -0.4, noSpeech: 0.1, compression: 1.2))
    assert(!MusicReviewSamples.accepts(logProbability: -1.1, noSpeech: 0.1, compression: 1.2))
    assert(!MusicReviewSamples.accepts(logProbability: -0.4, noSpeech: 0.9, compression: 1.2))
    assert(!MusicReviewSamples.accepts(logProbability: -0.4, noSpeech: 0.1, compression: 3))
    assert(!MusicReviewSamples.accepts(logProbability: .nan, noSpeech: 0.1, compression: 1.2))
    let review = NativeMusicReview()
    let format = AVAudioFormat(standardFormatWithSampleRate: 48000, channels: 2)!
    let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 48000)!
    buffer.frameLength = 48000
    for channel in 0..<2 {
        for index in 0..<48000 { buffer.floatChannelData![channel][index] = 0.2 * sin(Float(index) * 2 * .pi * 440 / 48000) }
    }
    review.consume(buffer)
    assert(review.testSnapshot().isEmpty) // opt-in is mandatory
    review.setEnabled(true)
    review.consume(buffer)
    let audio = review.testSnapshot()
    assert(audio.count > 15000 && audio.count <= 16000)
    assert(audio.allSatisfy { $0.isFinite })
    assert(audio.contains { abs($0) > 0.1 })
    for _ in 0..<35 { review.consume(buffer) }
    assert(review.testSnapshot().count == 480000)
    review.resetClip()
    assert(review.testSnapshot().isEmpty)
    review.consume(buffer)
    assert(!review.testSnapshot().isEmpty)
    review.setEnabled(false)
    review.consume(buffer)
    assert(review.testSnapshot().isEmpty)
}
print("Native music retry: opt-in, 48k stereo conversion, signal, 30-second bound, wrap order, repetition, clear and uncertainty gates passed")
'''
# The snapshot seam is appended inside the real type; production conversion is unchanged.
production = production.replace('    func cancel() {', '    func testSnapshot() -> [Float] { samples.snapshot() }\n    func cancel() {', 1)
with tempfile.TemporaryDirectory(prefix='habla-music-review-') as temporary:
    script = pathlib.Path(temporary) / 'review.swift'
    script.write_text('import Foundation\nimport AVFoundation\n' + production + checks)
    subprocess.run(['swift', str(script)], check=True)
