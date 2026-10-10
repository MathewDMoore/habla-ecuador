import AVFoundation
import Speech
import UIKit

// A narrow native substitute for Web Speech; the existing web app keeps transcript,
// review, continuation, translation and microphone button behavior.
final class NativeSpeechCapture {
    private let emit: ([String: Any]) -> Void
    private let engine = AVAudioEngine()
    private var modern: NativeModernCapture?
    private var inputStats = NativeInputStats()
    private var meter: Timer?
    private var routeDetail = ""
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var recognizer: SFSpeechRecognizer?
    private var activeID: String?
    private var generation = UUID()
    private var tapped = false
    private var activated = false
    private var stopping = false
    private var requestedLanguage = ""
    private var recognitionLanguage = ""
    private var recognitionMode = ""
    private var stopDeadline: DispatchWorkItem?
    private var interruptionObserver: NSObjectProtocol?

    init(emit: @escaping ([String: Any]) -> Void) {
        self.emit = emit
        interruptionObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
                guard let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                      raw == AVAudioSession.InterruptionType.began.rawValue,
                      let self, let id = self.activeID else { return }
                self.finish(id: id, error: "audio-capture", message: "iOS interrupted microphone capture. Tap again after the interruption ends.")
            }
    }

    func start(id: String, language: String, mode: String = "auto") {
        abortActive()
        activeID = id
        generation = UUID()
        let token = generation
        stopping = false
        requestedLanguage = language
        recognitionLanguage = ""
        recognitionMode = mode
        guard UIApplication.shared.applicationState != .background else {
            finish(id: id, error: "audio-capture")
            return
        }
        inputStats = NativeInputStats()
        // Modern on-device analysis needs microphone permission, not the legacy
        // speech-service authorization. Stop/download callbacks remain session-owned.
        if #available(iOS 26.0, *), mode != "apple-service", mode != "legacy-on-device" {
            authorizeMicrophone(id: id, language: language, token: token)
            return
        }
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            DispatchQueue.main.async {
                guard let self, self.generation == token, self.activeID == id, !self.stopping else { return }
                guard status == .authorized else {
                    self.finish(id: id, error: "not-allowed", message: "Apple speech recognition permission is unavailable. Check Settings → Privacy & Security → Speech Recognition → Habla Ecuador.")
                    return
                }
                self.authorizeMicrophone(id: id, language: language, token: token)
            }
        }
    }

    private func authorizeMicrophone(id: String, language: String, token: UUID) {
        AVCaptureDevice.requestAccess(for: .audio) { [weak self] granted in
            DispatchQueue.main.async {
                guard let self, self.generation == token, self.activeID == id, !self.stopping else { return }
                guard granted else {
                    self.finish(id: id, error: "not-allowed", message: "Microphone permission is unavailable. Check Settings → Privacy & Security → Microphone → Habla Ecuador.")
                    return
                }
                self.begin(id: id, language: language, token: token)
            }
        }
    }

    private func begin(id: String, language: String, token: UUID) {
        if #available(iOS 26.0, *), recognitionMode != "apple-service", recognitionMode != "legacy-on-device" {
            let capture = AnalyzerMicrophoneCapture(id: id, language: language,
                useDictation: recognitionMode == "dictation", emit: { [weak self] event in
                    guard let self, self.generation == token, self.activeID == id else { return }
                    if event["type"] as? String == "end" {
                        self.finish(id: id)
                    } else {
                        self.emit(event)
                    }
                })
            modern = capture
            capture.start()
            return
        }
        if recognitionMode == "dictation" {
            finish(id: id, error: "language-not-supported", message: "On-device dictation requires iOS 26 or later. Choose Apple service or legacy on-device speech on this phone.")
            return
        }
        func tag(_ locale: Locale) -> String { locale.identifier.replacingOccurrences(of: "_", with: "-") }
        let supported = SFSpeechRecognizer.supportedLocales().sorted { tag($0) < tag($1) }
        let base = language.split(separator: "-").first.map(String.init) ?? language
        let preferred = [language] + (base == "es" ? ["es-MX", "es-ES"] : base == "en" ? ["en-US", "en-GB"] : [])
        let locale = preferred.compactMap { candidate in supported.first { tag($0).lowercased() == candidate.lowercased() } }.first
            ?? supported.first { tag($0).split(separator: "-").first.map(String.init) == base }
        guard let locale, let recognizer = SFSpeechRecognizer(locale: locale) else {
            finish(id: id, error: "language-not-supported", message: "Apple has no supported recognition locale for \(language) on this device. The translation language has not changed.")
            return
        }
        recognitionLanguage = tag(recognizer.locale)
        let onDevice = recognitionMode != "apple-service"
        guard !onDevice || recognizer.supportsOnDeviceRecognition else {
            finish(id: id, error: "service-not-allowed", message: "On-device recognition is not supported for \(recognitionLanguage) here. Choose Apple service in iPhone speech details to try its service.")
            return
        }
        guard onDevice || recognizer.isAvailable else {
            finish(id: id, error: "service-not-allowed", message: "Apple recognition is currently unavailable for \(recognitionLanguage). Try again later or try On-device if supported.")
            return
        }
        recognitionMode = onDevice ? "on-device" : "apple-service"
        self.recognizer = recognizer
        do {
            let session = AVAudioSession.sharedInstance()
            // Preserve other apps' playback; do not duck, use voiceChat, force the
            // receiver/speaker, or select a Bluetooth hands-free microphone.
            try session.setCategory(.playAndRecord, mode: .default,
                                    options: [.mixWithOthers, .allowBluetoothA2DP])
            try session.setActive(true)
            activated = true
            guard let microphone = session.availableInputs?.first(where: { $0.portType == .builtInMic }) else {
                finish(id: id, error: "audio-capture")
                return
            }
            try session.setPreferredInput(microphone)
            let request = SFSpeechAudioBufferRecognitionRequest()
            request.shouldReportPartialResults = true
            request.requiresOnDeviceRecognition = onDevice
            request.taskHint = .dictation
            self.request = request
            let input = engine.inputNode
            let format = input.outputFormat(forBus: 0)
            guard format.sampleRate > 0, format.channelCount > 0 else {
                finish(id: id, error: "audio-capture")
                return
            }
            let stats = inputStats
            input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
                stats.observe(buffer)
                request.append(buffer)
            }
            tapped = true
            task = recognizer.recognitionTask(with: request) { [weak self] result, error in
                DispatchQueue.main.async {
                    guard let self, self.generation == token, self.activeID == id else { return }
                    if let result {
                        self.emit(["id": id, "type": "result", "text": result.bestTranscription.formattedString,
                                   "final": result.isFinal])
                        if result.isFinal { self.finish(id: id); return }
                    }
                    if let error {
                        if self.stopping { self.finish(id: id); return }
                        let native = error as NSError
                        let network = native.domain == NSURLErrorDomain
                        self.finish(id: id, error: network ? "network" : "native-recognition",
                            message: "Apple \(self.recognitionMode) recognition stopped. \(native.localizedDescription)"
                                + (onDevice ? " You can choose Apple service in iPhone speech details for a separate retry." : ""),
                            detail: nativeErrorCodes(native) + " · " + self.inputStats.summary)
                    }
                }
            }
            engine.prepare()
            try engine.start()
            routeDetail = "Microphone started. Translation: \(requestedLanguage); recognition: \(recognitionLanguage); mode: \(recognitionMode). Input: \(session.currentRoute.inputs.map { $0.portType.rawValue }.joined(separator: ", ")); output: \(session.currentRoute.outputs.map { $0.portType.rawValue }.joined(separator: ", "))."
            emit(["id": id, "type": "status", "text": routeDetail])
            meter = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
                guard let self, self.activeID == id else { return }
                self.emit(["id": id, "type": "status", "text": self.routeDetail + "\n" + self.inputStats.summary])
            }
            emit(["id": id, "type": "start"])
        } catch {
            let native = error as NSError
            finish(id: id, error: "audio-capture", message: "The native microphone could not start. \(native.localizedDescription)",
                   detail: nativeErrorCodes(native) + " · " + self.inputStats.summary)
        }
    }

    func stop(id: String) {
        guard activeID == id, !stopping else { return }
        stopping = true
        if let modern { modern.stop(); return }
        guard request != nil else { finish(id: id); return }
        meter?.invalidate(); meter = nil
        stopInput()
        request?.endAudio()
        // Give the recognizer time to return its final words. The web app also
        // has a finishing watchdog; completion remains idempotent in either order.
        let deadline = DispatchWorkItem { [weak self] in self?.finish(id: id) }
        stopDeadline = deadline
        DispatchQueue.main.asyncAfter(deadline: .now() + 2, execute: deadline)
    }

    func abort(id: String) {
        guard activeID == id else { return }
        finish(id: id, error: "aborted")
    }

    func abortActive() { if let id = activeID { abort(id: id) } }

    private func stopInput() {
        engine.stop()
        if tapped { engine.inputNode.removeTap(onBus: 0); tapped = false }
    }

    private func finish(id: String, error: String? = nil, message: String? = nil, detail: String = "") {
        guard activeID == id else { return }
        activeID = nil
        generation = UUID()
        stopping = false
        stopDeadline?.cancel()
        stopDeadline = nil
        meter?.invalidate(); meter = nil
        modern?.cancel(); modern = nil
        stopInput()
        request?.endAudio()
        task?.cancel()
        task = nil
        request = nil
        recognizer = nil
        if activated {
            try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
            activated = false
        }
        if let error {
            emit(["id": id, "type": "error", "error": error, "message": message ?? "Apple microphone capture stopped.",
                  "detail": "\(detail) · source \(requestedLanguage) · recognition \(recognitionLanguage) · mode \(recognitionMode)"])
        }
        emit(["id": id, "type": "end"])
    }

    deinit {
        if let observer = interruptionObserver { NotificationCenter.default.removeObserver(observer) }
        meter?.invalidate()
        modern?.cancel()
        stopInput()
        task?.cancel()
        if activated { try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation) }
    }
}

private protocol NativeModernCapture: AnyObject {
    func stop()
    func cancel()
}

// Keep errors useful without exposing NSError.userInfo (which can contain audio,
// recognized words, URLs or device names). Error 203 alone has no specific cause.
private func nativeErrorCodes(_ error: NSError) -> String {
    var codes: [String] = []
    var current: NSError? = error
    for _ in 0..<5 {
        guard let value = current else { break }
        codes.append("\(value.domain) / \(value.code)")
        current = value.userInfo[NSUnderlyingErrorKey] as? NSError
    }
    return codes.joined(separator: " → ")
}

private final class NativeInputStats {
    private let lock = NSLock()
    private var seconds: Double = 0
    private var peak: Float = 0
    func observe(_ buffer: AVAudioPCMBuffer) {
        var amplitude: Float = 0
        if let channels = buffer.floatChannelData {
            for channel in 0..<Int(buffer.format.channelCount) {
                for frame in 0..<Int(buffer.frameLength) {
                    amplitude = max(amplitude, abs(channels[channel][frame * buffer.stride]))
                }
            }
        } else if let channels = buffer.int16ChannelData {
            for channel in 0..<Int(buffer.format.channelCount) {
                for frame in 0..<Int(buffer.frameLength) {
                    amplitude = max(amplitude, abs(Float(channels[channel][frame * buffer.stride])) / 32768)
                }
            }
        }
        lock.lock()
        seconds += Double(buffer.frameLength) / buffer.format.sampleRate
        peak = amplitude
        lock.unlock()
    }
    var summary: String {
        lock.lock(); let duration = seconds; let level = peak; lock.unlock()
        let decibels = level > 0 ? max(-120, 20 * log10(Double(level))) : -120
        return String(format: "Microphone audio: %.1f s · input peak %.0f dBFS", duration, decibels)
            + (duration == 0 ? " · waiting for audio buffers" : "")
    }
}

// iOS 26 APIs, kept in this existing source file so a source-only refresh does not
// overwrite the user's locally configured Xcode signing/project settings.
@available(iOS 26.0, *)
private final class AnalyzerMicrophoneCapture: NativeModernCapture {
    private let id: String
    private let language: String
    private let useDictation: Bool
    private let emit: ([String: Any]) -> Void
    private let engine = AVAudioEngine()
    private let stats = NativeInputStats()
    private var analyzer: SpeechAnalyzer?
    private var input: AsyncStream<AnalyzerInput>.Continuation?
    private var preparation: Task<Void, Never>?
    private var results: Task<Void, Never>?
    private var finalization: Task<Void, Never>?
    private var meter: Timer?
    private var deadline: DispatchWorkItem?
    private var tapped = false
    private var activated = false
    private var cancelled = false
    private var stopping = false
    private var localeTag = ""
    private var backend = "SpeechAnalyzer"
    private var routeDetail = ""
    private var transcript = NativeTranscript()

    init(id: String, language: String, useDictation: Bool, emit: @escaping ([String: Any]) -> Void) {
        self.id = id; self.language = language; self.useDictation = useDictation; self.emit = emit
    }

    // Every state mutation and callback is main-thread owned. Only conversion and
    // locked, numerical input statistics run on AVAudioEngine's serialized tap.
    func start() {
        preparation = Task { @MainActor [weak self] in
            guard let self else { return }
            do {
                status("Preparing on-device speech for \(language)… First use may download an Apple language model. Keep this app open.")
                let module: any SpeechModule
                let preferred = Locale(identifier: language)
                if !useDictation, SpeechTranscriber.isAvailable,
                   let locale = await SpeechTranscriber.supportedLocale(equivalentTo: preferred) {
                    try checkActive()
                    localeTag = locale.identifier.replacingOccurrences(of: "_", with: "-")
                    backend = "SpeechTranscriber (on-device)"
                    let transcriber = SpeechTranscriber(locale: locale, transcriptionOptions: [],
                        reportingOptions: [.volatileResults], attributeOptions: [])
                    module = transcriber
                    results = Task { @MainActor [weak self] in
                        do {
                            for try await result in transcriber.results {
                                self?.receive(text: String(result.text.characters), range: result.range, final: result.isFinal)
                            }
                        } catch { self?.fail(error, stage: "On-device speech") }
                    }
                } else if let locale = await DictationTranscriber.supportedLocale(equivalentTo: preferred) {
                    try checkActive()
                    localeTag = locale.identifier.replacingOccurrences(of: "_", with: "-")
                    backend = "DictationTranscriber (on-device)"
                    let transcriber = DictationTranscriber(locale: locale, contentHints: [],
                        transcriptionOptions: [], reportingOptions: [.volatileResults], attributeOptions: [])
                    module = transcriber
                    results = Task { @MainActor [weak self] in
                        do {
                            for try await result in transcriber.results {
                                self?.receive(text: String(result.text.characters), range: result.range, final: result.isFinal)
                            }
                        } catch { self?.fail(error, stage: "On-device dictation") }
                    }
                } else {
                    try checkActive()
                    throw NSError(domain: "HablaSpeech", code: 1, userInfo: [NSLocalizedDescriptionKey:
                        "No on-device recognition locale supports \(language). Choose Apple service for a separate retry."])
                }
                try checkActive()
                let analyzer = SpeechAnalyzer(modules: [module])
                self.analyzer = analyzer
                if let installation = try await AssetInventory.assetInstallationRequest(supporting: [module]) {
                    try checkActive()
                    status("Downloading Apple's on-device model for \(localeTag)… Keep this app open. Microphone capture starts when it is ready.", reveal: true)
                    try await installation.downloadAndInstall()
                }
                try checkActive()
                guard let format = await SpeechAnalyzer.bestAvailableAudioFormat(compatibleWith: [module]) else {
                    throw NSError(domain: "HablaSpeech", code: 2, userInfo: [NSLocalizedDescriptionKey: "Apple supplied no compatible speech audio format."])
                }
                try checkActive()
                status("Loading \(backend) for \(localeTag)…")
                try await analyzer.prepareToAnalyze(in: format)
                try checkActive()
                let (sequence, continuation) = AsyncStream<AnalyzerInput>.makeStream()
                input = continuation
                try await analyzer.start(inputSequence: sequence)
                try checkActive()
                try beginAudio(format: format, continuation: continuation)
            } catch {
                if !cancelled, !stopping { fail(error, stage: "On-device setup") }
            }
        }
    }

    private func checkActive() throws {
        if cancelled || stopping || Task.isCancelled { throw CancellationError() }
    }

    private func beginAudio(format: AVAudioFormat, continuation: AsyncStream<AnalyzerInput>.Continuation) throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .default, options: [.mixWithOthers, .allowBluetoothA2DP])
        try session.setActive(true)
        activated = true
        guard let microphone = session.availableInputs?.first(where: { $0.portType == .builtInMic }) else {
            throw NSError(domain: "HablaSpeech", code: 3, userInfo: [NSLocalizedDescriptionKey: "The built-in microphone is unavailable."])
        }
        try session.setPreferredInput(microphone)
        let node = engine.inputNode
        let source = node.outputFormat(forBus: 0)
        guard source.sampleRate > 0, source.channelCount > 0,
              let converter = AVAudioConverter(from: source, to: format) else {
            throw NSError(domain: "HablaSpeech", code: 4, userInfo: [NSLocalizedDescriptionKey: "The microphone audio format could not be converted for speech."])
        }
        // Apple's iOS 26 sample uses AVAudioConverter; avoid iOS 27 beta-only helpers.
        converter.primeMethod = .none
        let stats = self.stats
        node.installTap(onBus: 0, bufferSize: 1024, format: source) { [weak self] buffer, _ in
            stats.observe(buffer)
            let capacity = AVAudioFrameCount(ceil(Double(buffer.frameLength) * format.sampleRate / source.sampleRate)) + 32
            guard let converted = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: capacity) else { return }
            var supplied = false
            var conversionError: NSError?
            let result = converter.convert(to: converted, error: &conversionError) { _, status in
                if supplied { status.pointee = .noDataNow; return nil }
                supplied = true; status.pointee = .haveData; return buffer
            }
            if result == .error {
                let error = conversionError ?? NSError(domain: "HablaSpeech", code: 5,
                    userInfo: [NSLocalizedDescriptionKey: "Microphone audio conversion failed."])
                DispatchQueue.main.async { self?.fail(error, stage: "Audio conversion") }
            } else if converted.frameLength > 0 {
                continuation.yield(AnalyzerInput(buffer: converted))
            }
        }
        tapped = true
        engine.prepare()
        try engine.start()
        routeDetail = "\(backend) · source \(language) · recognition \(localeTag)\nInput: \(session.currentRoute.inputs.map { $0.portType.rawValue }.joined(separator: ", ")); output: \(session.currentRoute.outputs.map { $0.portType.rawValue }.joined(separator: ", "))."
        status(routeDetail + "\nSpeak a clear sentence first. Input level shows audio, not whether speech is understood.")
        emit(["id": id, "type": "start"])
        meter = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self, !self.cancelled else { return }
            self.status(self.routeDetail + "\n" + self.stats.summary
                + (self.transcript.text.isEmpty ? "\nWaiting for words. First test with music paused and speak clearly." : ""))
        }
    }

    private func receive(text: String, range: CMTimeRange, final: Bool) {
        guard !cancelled else { return }
        transcript.update(text: text, start: range.start.seconds, end: range.end.seconds, final: final)
        // A finalized phrase is not the end of a song/session. Always send the full
        // current text, with final=false until Stop has drained all analyzer results.
        emit(["id": id, "type": "result", "text": transcript.text, "final": false])
    }

    func stop() {
        guard !cancelled, !stopping else { return }
        stopping = true
        stopAudio()
        input?.finish()
        guard let analyzer, input != nil else { end(); return }
        status(routeDetail + "\nFinishing captured words… " + stats.summary)
        // Stay inside the hosted UI's existing finishing watchdog.
        let deadline = DispatchWorkItem { [weak self] in self?.end() }
        self.deadline = deadline
        DispatchQueue.main.asyncAfter(deadline: .now() + 2, execute: deadline)
        finalization = Task { @MainActor [weak self] in
            guard let self else { return }
            do {
                try await analyzer.finalizeAndFinishThroughEndOfInput()
                await results?.value
                end()
            } catch { if !cancelled { end() } }
        }
    }

    private func end() {
        guard !cancelled else { return }
        if !transcript.text.isEmpty {
            emit(["id": id, "type": "result", "text": transcript.text, "final": true])
        }
        cancel()
        emit(["id": id, "type": "end"])
    }

    private func status(_ text: String, reveal: Bool = false) {
        guard !cancelled else { return }
        emit(["id": id, "type": "status", "text": text, "reveal": reveal])
    }

    private func fail(_ error: Error, stage: String) {
        guard !cancelled, !stopping else { return }
        let native = error as NSError
        let message = "\(stage) stopped. \(native.localizedDescription)"
        let detail = nativeErrorCodes(native) + " · source \(language) · recognition \(localeTag) · \(backend)\n" + stats.summary
        cancel()
        emit(["id": id, "type": "error", "error": "native-recognition", "message": message, "detail": detail])
        emit(["id": id, "type": "end"])
    }

    private func stopAudio() {
        meter?.invalidate(); meter = nil
        engine.stop()
        if tapped { engine.inputNode.removeTap(onBus: 0); tapped = false }
        if activated {
            try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
            activated = false
        }
    }

    func cancel() {
        guard !cancelled else { return }
        cancelled = true
        deadline?.cancel(); deadline = nil
        preparation?.cancel(); preparation = nil
        finalization?.cancel(); finalization = nil
        results?.cancel(); results = nil
        stopAudio()
        input?.finish(); input = nil
        if let analyzer { Task { await analyzer.cancelAndFinishNow() } }
        analyzer = nil
    }
}

// BEGIN NATIVE TRANSCRIPT STATE — Foundation-only, exercised on the macOS runner.
// Timeline identity, rather than matching words, preserves repeated song choruses.
struct NativeTranscript {
    private struct Passage {
        var text: String
        var start: Double
        var end: Double
        var final: Bool
    }
    private var passages: [Passage] = []
    var text: String { passages.map(\.text).joined(separator: " ") }
    mutating func update(text: String, start: Double, end: Double, final: Bool) {
        guard start.isFinite, end.isFinite, end >= start else { return }
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        func overlaps(_ passage: Passage) -> Bool {
            passage.start == start || (passage.start < end && start < passage.end)
        }
        // Finalized passages are immutable. Repeated callbacks for their range
        // cannot duplicate them, while the same words later in time remain valid.
        if passages.contains(where: { $0.final && overlaps($0) }) { return }
        passages.removeAll(where: { !$0.final && overlaps($0) })
        if !value.isEmpty { passages.append(Passage(text: value, start: start, end: end, final: final)) }
        passages.sort { $0.start < $1.start }
    }
}
// END NATIVE TRANSCRIPT STATE
