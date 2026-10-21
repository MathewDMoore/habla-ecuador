// This is synthetic PCM, never a user's speech or music recording.
for rate in [44100.0, 48000.0] {
    for channels in [AVAudioChannelCount(1), AVAudioChannelCount(2)] {
        let source = AVAudioFormat(standardFormatWithSampleRate: rate, channels: channels)!
        let format = AVAudioFormat(standardFormatWithSampleRate: 16000, channels: 1)!
        let converter = AVAudioConverter(from: source, to: format)!
        converter.primeMethod = .none
        let stats = NativeInputStats()
        // Initial state and a source-only observation must not claim forwarded audio.
        assert(stats.summary.contains("Analyzer queue: 0.0 s · 0 buffers"))
        var convertedFrames = 0
        for _ in 0..<50 {
            let buffer = AVAudioPCMBuffer(pcmFormat: source, frameCapacity: 1024)!
            buffer.frameLength = 1024
            for channel in 0..<Int(channels) {
                for sample in 0..<1024 {
                    buffer.floatChannelData![channel][sample] = 0.2 * sin(Float(sample) * 0.07)
                }
            }
            stats.observe(buffer)
            if convertedFrames == 0 { assert(stats.summary.contains("Analyzer queue: 0.0 s · 0 buffers")) }
            let capacity = AVAudioFrameCount(ceil(Double(buffer.frameLength) * format.sampleRate / source.sampleRate)) + 32
            let converted = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: capacity)!
            // PRODUCTION CONVERSION
            assert(result != .error && conversionError == nil)
            assert(converted.frameLength > 0, "Conversion must produce frames")
            convertedFrames += Int(converted.frameLength)
            stats.forwarded(converted, accepted: true)
        }
        let expected = 50 * 1024 * format.sampleRate / rate
        assert(abs(Double(convertedFrames) - expected) < 64, "Conversion must preserve duration")
        assert(stats.summary.contains("50 buffers"))
        assert(!stats.summary.contains("converted peak -120 dBFS"), "Signal must survive conversion")
        let rejected = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 1)!
        rejected.frameLength = 1
        stats.forwarded(rejected, accepted: false)
        assert(stats.summary.contains("50 buffers") && stats.summary.contains("rejected 1"))
    }
}
print("Native audio: production conversion preserves signal/duration and meters forwarded/rejected buffers")

// Capture losses occur before observe()/forwarded(); they must remain visible
// even if no converted samples ever reach the analyzer.
let lossOnly = NativeInputStats()
lossOnly.captureDropped(seconds: 0.125)
lossOnly.captureDropped(seconds: 0.125)
lossOnly.captureDropped(seconds: .nan)
lossOnly.captureDropped(seconds: -1)
assert(lossOnly.summary.contains("Capture backlog drops: 4 buffers · 0.25 s"))
assert(lossOnly.summary.contains("Analyzer queue: 0.0 s · 0 buffers"))
assert(lossOnly.summary.contains("rejected 0"))
assert(lossOnly.summary.contains("Audio was lost before recognition"))
// The callback runs outside the main queue; concurrent observations are safe.
let concurrentLoss = NativeInputStats()
DispatchQueue.concurrentPerform(iterations: 1000) { _ in concurrentLoss.captureDropped(seconds: 0.01) }
assert(concurrentLoss.summary.contains("Capture backlog drops: 1000 buffers · 10.00 s"))
print("Capture loss diagnostics: upstream loss, invalid durations and concurrent counters passed")
