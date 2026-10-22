import AVFoundation
import WhisperKit

// A bounded, opt-in second pass. User audio never enters a file or a request.
// The model/tokenizer download is separate from the translation offline pack.
final class NativeMusicReview {
    private let lock = NSLock()
    private var enabled = false
    private var samples = MusicReviewSamples()
    private var converter: AVAudioConverter?
    private var sourceFormat: AVAudioFormat?
    private let format = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: 16000, channels: 1, interleaved: false)!
    private var conversionFailed = false
    private var task: Task<Void, Never>?
    private var generation = UUID()
    private var onCancel: (() -> Void)?

    func setEnabled(_ value: Bool) {
        cancel()
        lock.lock()
        enabled = value
        samples.clear()
        converter = nil
        sourceFormat = nil
        conversionFailed = false
        lock.unlock()
    }

    func resetClip() {
        cancel()
        lock.lock()
        samples.clear()
        converter = nil
        sourceFormat = nil
        conversionFailed = false
        lock.unlock()
    }

    // Capture callbacks are serialized by this lock. No AVAudioPCMBuffer escapes
    // its callback, and the circular buffer retains at most 30 s / 1.92 MB PCM.
    func consume(_ buffer: AVAudioPCMBuffer) {
        lock.lock()
        defer { lock.unlock() }
        guard enabled, buffer.frameLength > 0 else { return }
        if sourceFormat != buffer.format {
            sourceFormat = buffer.format
            converter = AVAudioConverter(from: buffer.format, to: format)
            converter?.primeMethod = .none
        }
        guard let converter, buffer.format.sampleRate > 0 else { conversionFailed = true; return }
        let capacity = AVAudioFrameCount(ceil(Double(buffer.frameLength) * 16000 / buffer.format.sampleRate)) + 32
        guard let converted = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: capacity) else { conversionFailed = true; return }
        var supplied = false
        var error: NSError?
        let result = converter.convert(to: converted, error: &error) { _, status in
            if supplied { status.pointee = .noDataNow; return nil }
            supplied = true
            status.pointee = .haveData
            return buffer
        }
        guard result != .error, error == nil else { conversionFailed = true; return }
        if let channel = converted.floatChannelData?[0] {
            samples.append(UnsafeBufferPointer(start: channel, count: Int(converted.frameLength)))
        }
    }

    func cancel() {
        generation = UUID()
        task?.cancel()
        onCancel?()
        onCancel = nil
        // Retain the task until its defer runs: repeated taps must not load
        // multiple large Core ML models while cancellation is still unwinding.
    }

    func transcribe(id: String, emit: @escaping ([String: Any]) -> Void) {
        func send(_ status: String, _ message: String, text: String = "") {
            emit(["type": "music-review", "id": id, "status": status, "message": message, "text": text])
        }
        guard task == nil else { send("error", "Previous recognition is finishing. Try again in a moment."); return }
        lock.lock()
        let audio = samples.snapshot()
        let valid = enabled && !conversionFailed
        lock.unlock()
        guard valid else { send("error", "Enable the 30-second retry buffer before listening. If conversion failed, start a new capture."); return }
        guard audio.count >= 16000 else { send("error", "Capture at least one second of audio first."); return }
        guard audio.allSatisfy({ $0.isFinite }), audio.contains(where: { abs($0) > 0.00001 }) else {
            send("error", "The retained audio is silent or invalid. No words were invented; check the audio source.")
            return
        }
        let token = UUID()
        generation = token
        onCancel = { send("error", "Recognition cancelled. Your captured words are unchanged.") }
        task = Task { @MainActor [weak self] in
            guard let self else { return }
            defer { self.task = nil; self.onCancel = nil }
            do {
                var base = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                    .appendingPathComponent("HablaWhisper", isDirectory: true)
                try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
                var values = URLResourceValues()
                values.isExcludedFromBackup = true
                try base.setResourceValues(values)
                let marker = base.appendingPathComponent("model-location.txt")
                let folder: URL
                if let relative = try? String(contentsOf: marker, encoding: .utf8), !relative.isEmpty,
                   !relative.contains(".."), FileManager.default.fileExists(atPath: base.appendingPathComponent(relative).path) {
                    folder = base.appendingPathComponent(relative)
                    send("working", "Loading the downloaded multilingual model… Audio stays on this iPhone.")
                } else {
                    send("working", "Downloading the multilingual recognition model… Large download; keep Habla open. Audio is not uploaded.")
                    folder = try await WhisperKit.download(variant: "openai_whisper-small", downloadBase: base)
                }
                try Task.checkCancellation()
                let pipe = try await WhisperKit(WhisperKitConfig(modelFolder: folder.path, tokenizerFolder: base,
                    verbose: false, prewarm: true, load: true, download: false))
                try Task.checkCancellation()
                if folder.path.hasPrefix(base.path + "/") {
                    try String(folder.path.dropFirst(base.path.count + 1)).write(to: marker, atomically: true, encoding: .utf8)
                }
                guard self.generation == token else { return }
                send("working", "Recognizing the last \(Int(Double(audio.count) / 16000)) seconds… Language detection is automatic; singing and language switches may still be wrong.")
                let options = DecodingOptions(task: .transcribe, language: nil, temperatureFallbackCount: 2,
                    usePrefillPrompt: true, detectLanguage: true, skipSpecialTokens: true,
                    suppressBlank: true, concurrentWorkerCount: 1)
                let results = try await pipe.transcribe(audioArray: audio, decodeOptions: options)
                try Task.checkCancellation()
                guard self.generation == token else { return }
                // Do not pass obvious low-quality guesses on to translation.
                let all = results.flatMap { $0.segments }
                let accepted = all.filter { MusicReviewSamples.accepts(logProbability: $0.avgLogprob,
                    noSpeech: $0.noSpeechProb, compression: $0.compressionRatio) }
                let text = accepted.map { $0.text }.joined().trimmingCharacters(in: .whitespacesAndNewlines)
                if text.isEmpty { send("error", "No usable words were recognized. Your existing words are unchanged.") }
                else { send("done", "Experimental draft for the last \(Int(Double(audio.count) / 16000)) seconds. \(all.count - accepted.count) uncertain segments omitted. Check both languages before using it.", text: text) }
            } catch {
                guard self.generation == token, !Task.isCancelled else { return }
                // Avoid SDK error descriptions: they may contain private paths.
                send("error", "Multilingual recognition failed. First use needs internet and space for the model. Your captured words are unchanged.")
            }
        }
    }
}

// Pure Swift storage and result policy, independently exercised without Core ML.
struct MusicReviewSamples {
    static let capacity = 30 * 16000
    private var storage = [Float](repeating: 0, count: MusicReviewSamples.capacity)
    private var next = 0
    private var count = 0
    mutating func append<S: Sequence>(_ values: S) where S.Element == Float {
        for value in values {
            storage[next] = value
            next = (next + 1) % Self.capacity
            count = min(count + 1, Self.capacity)
        }
    }
    mutating func clear() {
        storage = [Float](repeating: 0, count: Self.capacity)
        next = 0; count = 0
    }
    func snapshot() -> [Float] {
        let start = (next - count + Self.capacity) % Self.capacity
        return (0..<count).map { storage[(start + $0) % Self.capacity] }
    }
    static func accepts(logProbability: Float, noSpeech: Float, compression: Float) -> Bool {
        logProbability.isFinite && noSpeech.isFinite && compression.isFinite
            && logProbability >= -1 && noSpeech < 0.6 && compression <= 2.4
    }
}
