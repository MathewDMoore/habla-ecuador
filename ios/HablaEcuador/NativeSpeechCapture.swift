import AVFoundation
import Speech
import UIKit
import ShazamKit
#if compiler(>=6.3) && canImport(ScreenCaptureKit)
import ScreenCaptureKit
#endif

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
    private var systemAudio = false
    var isSystemAudioActive: Bool { activeID != nil && systemAudio }
    static var supportsSystemAudioCapture: Bool {
#if compiler(>=6.3) && canImport(ScreenCaptureKit)
        if #available(iOS 27.0, *) { return true }
#endif
        return false
    }
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

    func start(id: String, language: String, mode: String = "auto", systemAudio: Bool = false) {
        abortActive()
        activeID = id
        generation = UUID()
        let token = generation
        stopping = false
        requestedLanguage = language
        recognitionLanguage = ""
        recognitionMode = mode
        self.systemAudio = systemAudio
        if systemAudio {
            guard Self.supportsSystemAudioCapture else {
                finish(id: id, error: "audio-capture", message: "This iPhone audio capture requires iOS 27 and an app built with Xcode 27 or later.")
                return
            }
            recognitionMode = "auto"
            begin(id: id, language: language, token: token)
            return
        }
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
                useDictation: recognitionMode == "dictation", systemAudio: systemAudio, emit: { [weak self] event in
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

    func identifySong(id: String, requestID: String) {
        guard activeID == id, !stopping else { return }
        guard systemAudio, let modern else {
            emit(["id": id, "type": "song", "requestId": requestID, "status": "unavailable",
                  "message": "Choose This iPhone's audio and start listening before identifying a song."])
            return
        }
        modern.identifySong(requestID: requestID)
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

private protocol NativeSystemAudioInput: AnyObject {
    func cancel()
}

private protocol NativeModernCapture: AnyObject {
    func identifySong(requestID: String)
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
    private var queuedSeconds: Double = 0
    private var queuedBuffers: Int = 0
    private var convertedPeak: Float = 0
    private var rejectedBuffers: Int = 0
    private var captureDroppedBuffers: Int = 0
    private var captureDroppedSeconds: Double = 0
    func observe(_ buffer: AVAudioPCMBuffer) {
        var amplitude: Float = 0
        let interleaved = buffer.format.isInterleaved
        let channelCount = interleaved ? 1 : Int(buffer.format.channelCount)
        let samples = Int(buffer.frameLength) * (interleaved ? Int(buffer.format.channelCount) : 1)
        if let channels = buffer.floatChannelData {
            for channel in 0..<channelCount {
                for sample in 0..<samples {
                    amplitude = max(amplitude, abs(channels[channel][sample]))
                }
            }
        } else if let channels = buffer.int16ChannelData {
            for channel in 0..<channelCount {
                for sample in 0..<samples {
                    amplitude = max(amplitude, abs(Float(channels[channel][sample])) / 32768)
                }
            }
        }
        lock.lock()
        seconds += Double(buffer.frameLength) / buffer.format.sampleRate
        peak = amplitude
        lock.unlock()
    }
    var summary: String {
        lock.lock()
        let duration = seconds; let level = peak
        let queued = queuedSeconds; let buffers = queuedBuffers
        let convertedLevel = convertedPeak; let rejected = rejectedBuffers
        let captureDrops = captureDroppedBuffers; let lostSeconds = captureDroppedSeconds
        lock.unlock()
        let decibels = level > 0 ? max(-120, 20 * log10(Double(level))) : -120
        let convertedDecibels = convertedLevel > 0 ? max(-120, 20 * log10(Double(convertedLevel))) : -120
        return String(format: "Input audio: %.1f s · input peak %.0f dBFS", duration, decibels)
            + (duration == 0 ? " · waiting for audio buffers" : "")
            + String(format: "\nAnalyzer queue: %.1f s · %d buffers · converted peak %.0f dBFS · rejected %d", queued, buffers, convertedDecibels, rejected)
            + String(format: "\nCapture backlog drops: %d buffers · %.2f s lost before conversion", captureDrops, lostSeconds)
            + (captureDrops > 0 ? "\nAudio was lost before recognition; missing words may follow. This is separate from analyzer rejections." : "")
    }

    // Called on the capture queue: do not dispatch this counter through the
    // same main-thread backlog that caused the loss. No sample data is retained.
    func captureDropped(seconds duration: Double) {
        lock.lock()
        captureDroppedBuffers += 1
        if duration.isFinite && duration > 0 { captureDroppedSeconds += duration }
        lock.unlock()
    }

    // A microphone meter alone cannot establish that conversion and forwarding
    // succeeded. Count only buffers the analyzer input stream actually enqueues.
    func forwarded(_ buffer: AVAudioPCMBuffer, accepted: Bool) {
        var amplitude: Float = 0
        let interleaved = buffer.format.isInterleaved
        let channels = interleaved ? 1 : Int(buffer.format.channelCount)
        let samples = Int(buffer.frameLength) * (interleaved ? Int(buffer.format.channelCount) : 1)
        if let data = buffer.floatChannelData {
            for channel in 0..<channels {
                for sample in 0..<samples { amplitude = max(amplitude, abs(data[channel][sample])) }
            }
        } else if let data = buffer.int16ChannelData {
            for channel in 0..<channels {
                for sample in 0..<samples { amplitude = max(amplitude, abs(Float(data[channel][sample])) / 32768) }
            }
        }
        lock.lock()
        if accepted {
            queuedSeconds += Double(buffer.frameLength) / buffer.format.sampleRate
            queuedBuffers += 1
            convertedPeak = amplitude
        } else { rejectedBuffers += 1 }
        lock.unlock()
    }
}

// iOS 26 APIs, kept in this existing source file so a source-only refresh does not
// overwrite the user's locally configured Xcode signing/project settings.
@available(iOS 26.0, *)
private final class AnalyzerMicrophoneCapture: NativeModernCapture {
    private let id: String
    private let language: String
    private let useDictation: Bool
    private let systemAudio: Bool
    private var systemSource: NativeSystemAudioInput?
    private var songMatcher: NativeSongMatcher?
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
    private var receivedResults = 0
    private var nonemptyResults = 0
    private var invalidResultRanges = 0
    private var startedAt: Date?
    private var revealedNoWords = false

    init(id: String, language: String, useDictation: Bool, systemAudio: Bool = false, emit: @escaping ([String: Any]) -> Void) {
        self.id = id; self.language = language; self.useDictation = useDictation; self.systemAudio = systemAudio; self.emit = emit
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
                let (sequence, continuation) = AsyncStream<AnalyzerInput>.makeStream(bufferingPolicy: systemAudio ? .bufferingNewest(100) : .unbounded)
                input = continuation
                try await analyzer.start(inputSequence: sequence)
                try checkActive()
                try beginAudio(format: format, continuation: continuation)
            } catch {
                if !cancelled, !stopping { fail(error, stage: "On-device setup") }
            }
        }
    }

    func identifySong(requestID: String) {
        guard systemAudio, startedAt != nil, !cancelled, !stopping else {
            emit(["id": id, "type": "song", "requestId": requestID, "status": "unavailable",
                  "message": "Start this iPhone's audio capture first."])
            return
        }
        songMatcher?.cancel()
        songMatcher = NativeSongMatcher { [weak self] result in
            guard let self, !self.cancelled, !self.stopping else { return }
            var event = result
            event["id"] = self.id
            event["type"] = "song"
            event["requestId"] = requestID
            self.emit(event)
        }
    }

    private func checkActive() throws {
        if cancelled || stopping || Task.isCancelled { throw CancellationError() }
    }

    private func beginAudio(format: AVAudioFormat, continuation: AsyncStream<AnalyzerInput>.Continuation) throws {
        if systemAudio {
#if compiler(>=6.3) && canImport(ScreenCaptureKit)
            if #available(iOS 27.0, *) {
                let source = IPhoneSystemAudioInput(format: format, onBuffer: { [weak self] buffer in
                    guard let self, !self.cancelled, !self.stopping else { return }
                    self.stats.observe(buffer)
                    self.songMatcher?.consume(buffer)
                    let delivery = continuation.yield(AnalyzerInput(buffer: buffer))
                    if case .enqueued = delivery { self.stats.forwarded(buffer, accepted: true) }
                    else { self.stats.forwarded(buffer, accepted: false) }
                }, onDropped: { [stats = self.stats] seconds in
                    stats.captureDropped(seconds: seconds)
                }, onStarted: { [weak self] in
                    guard let self, !self.cancelled, !self.stopping else { return }
                    self.startedAt = Date()
                    self.routeDetail = "\(self.backend) · source \(self.language) · recognition \(self.localeTag)\nInput: this iPhone's system audio · \(Int(format.sampleRate)) Hz / \(format.channelCount) ch. Microphone off."
                    self.status(self.routeDetail + "\nCapture is active. Source apps may provide silence. No video is processed or saved.")
                    self.emit(["id": self.id, "type": "start"])
                    self.meter = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
                        guard let self, !self.cancelled else { return }
                        self.status(self.routeDetail + "\n" + self.stats.summary + "\n" + self.resultSummary)
                    }
                }, onError: { [weak self] error in self?.fail(error, stage: "This iPhone audio capture") })
                systemSource = source
                status("Allow capture in Apple's system picker, then play audio. Microphone stays off. Tap Stop listening to end capture.", reveal: true)
                source.start()
                return
            }
#endif
            throw NSError(domain: "HablaSpeech", code: 27, userInfo: [NSLocalizedDescriptionKey: "This iPhone audio capture is unavailable in this build."])
        }
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
                let delivery = continuation.yield(AnalyzerInput(buffer: converted))
                if case .enqueued = delivery { stats.forwarded(converted, accepted: true) }
                else { stats.forwarded(converted, accepted: false) }
            }
        }
        tapped = true
        engine.prepare()
        try engine.start()
        startedAt = Date()
        routeDetail = "\(backend) · source \(language) · recognition \(localeTag)\nInput: \(session.currentRoute.inputs.map { $0.portType.rawValue }.joined(separator: ", ")); output: \(session.currentRoute.outputs.map { $0.portType.rawValue }.joined(separator: ", "))."
            + "\nAudio format: \(Int(source.sampleRate)) Hz / \(source.channelCount) ch → \(Int(format.sampleRate)) Hz / \(format.channelCount) ch."
        status(routeDetail + "\nSpeak a clear sentence first. Input level shows audio, not whether speech is understood.")
        emit(["id": id, "type": "start"])
        meter = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self, !self.cancelled else { return }
            let stalled = self.transcript.text.isEmpty && Date().timeIntervalSince(self.startedAt ?? Date()) >= 15
            let reveal = stalled && !self.revealedNoWords
            if reveal { self.revealedNoWords = true }
            self.status(self.routeDetail + "\n" + self.stats.summary + "\n" + self.resultSummary
                + (stalled ? "\nNo words after 15 seconds. Listening is still active. The microphone meter does not prove recognition is working. Stop to retry; keep the analyzer queue and result counts visible for diagnosis."
                    : self.transcript.text.isEmpty ? "\nWaiting for words…" : ""), reveal: reveal)
        }
    }

    private func receive(text: String, range: CMTimeRange, final: Bool) {
        guard !cancelled else { return }
        receivedResults += 1
        if !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { nonemptyResults += 1 }
        if !range.start.seconds.isFinite || !range.end.seconds.isFinite || range.end.seconds < range.start.seconds {
            invalidResultRanges += 1
        }
        transcript.update(text: text, start: range.start.seconds, end: range.end.seconds, final: final)
        // A finalized phrase is not the end of a song/session. Always send the full
        // current text, with final=false until Stop has drained all analyzer results.
        emit(["id": id, "type": "result", "text": transcript.text, "final": false,
              "confirmedText": transcript.confirmedText, "tentativeText": transcript.tentativeText])
    }

    private var resultSummary: String {
        "Recognition results: \(receivedResults) · with words: \(nonemptyResults) · invalid ranges: \(invalidResultRanges)"
    }

    func stop() {
        guard !cancelled, !stopping else { return }
        stopping = true
        stopAudio()
        input?.finish()
        guard let analyzer, input != nil else { end(); return }
        status(routeDetail + "\nFinishing captured words… " + stats.summary + "\n" + resultSummary)
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
            emit(["id": id, "type": "result", "text": transcript.text, "final": true,
                  "confirmedText": transcript.confirmedText, "tentativeText": transcript.tentativeText])
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
        songMatcher?.cancel(); songMatcher = nil
        systemSource?.cancel(); systemSource = nil
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


// Only feeds a user-requested match from the existing system-audio buffers.
// This owns no microphone, audio engine, file, or speech-recognition session.
private final class NativeSongMatcher: NSObject, SHSessionDelegate {
    private let emit: ([String: Any]) -> Void
    private let session = SHSession()
    private let format = AVAudioFormat(standardFormatWithSampleRate: 44_100, channels: 1)!
    private var sourceFormat: AVAudioFormat?
    private var converter: AVAudioConverter?
    private var deadline: DispatchWorkItem?
    private var finished = false
    private var seconds: Double = 0

    init(emit: @escaping ([String: Any]) -> Void) {
        self.emit = emit
        super.init()
        session.delegate = self
        let deadline = DispatchWorkItem { [weak self] in
            self?.complete(["status": "not-found", "message": "No song identified. Try a clearer recorded passage; speech, silence or an uncatalogued recording may not match."])
        }
        self.deadline = deadline
        DispatchQueue.main.asyncAfter(deadline: .now() + 25, execute: deadline)
    }

    func consume(_ buffer: AVAudioPCMBuffer) {
        guard !finished, seconds < 20, buffer.frameLength > 0 else { return }
        guard buffer.format.sampleRate > 0 else { return }
        if sourceFormat != buffer.format {
            sourceFormat = buffer.format
            converter = AVAudioConverter(from: buffer.format, to: format)
            converter?.primeMethod = .none
        }
        guard let converter else {
            complete(["status": "unavailable", "message": "This audio format cannot be used for song identification."])
            return
        }
        let capacity = AVAudioFrameCount(ceil(Double(buffer.frameLength) * format.sampleRate / buffer.format.sampleRate)) + 32
        guard let output = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: capacity) else { return }
        var supplied = false
        var error: NSError?
        let status = converter.convert(to: output, error: &error) { _, inputStatus in
            if supplied { inputStatus.pointee = .noDataNow; return nil }
            supplied = true; inputStatus.pointee = .haveData; return buffer
        }
        guard status != .error, error == nil else {
            complete(["status": "unavailable", "message": "Audio conversion for song identification failed. Listening can continue."])
            return
        }
        let remaining = AVAudioFrameCount(max(0, (20 - seconds) * format.sampleRate))
        output.frameLength = min(output.frameLength, remaining)
        guard output.frameLength > 0 else { return }
        seconds += Double(output.frameLength) / format.sampleRate
        session.matchStreamingBuffer(output, at: nil)
    }

    func session(_ session: SHSession, didFind match: SHMatch) {
        // Delegate callbacks may arrive off-main or after cancellation.
        let item = match.mediaItems.first
        let title = item?.title
        let artist = item?.artist
        let webURL = item?.webURL?.absoluteString
        DispatchQueue.main.async { [weak self] in
            guard let title, !title.isEmpty else {
                self?.complete(["status": "not-found", "message": "The service returned no song title."])
                return
            }
            var result: [String: Any] = ["status": "matched", "title": title, "artist": artist ?? "Artist unavailable"]
            if let webURL { result["url"] = webURL }
            self?.complete(result)
        }
    }

    func session(_ session: SHSession, didNotFindMatchFor signature: SHSignature, error: Error?) {
        guard let error else { return } // More audio may still match before the deadline.
        let codes = nativeErrorCodes(error as NSError)
        DispatchQueue.main.async { [weak self] in
            self?.complete(["status": "unavailable", "message": "Song identification is unavailable. Check internet access and Habla's ShazamKit App Service. Listening can continue.", "detail": codes])
        }
    }

    private func complete(_ event: [String: Any]) {
        guard !finished else { return }
        cancel()
        emit(event)
    }

    func cancel() {
        finished = true
        deadline?.cancel(); deadline = nil
        session.delegate = nil
        converter = nil
    }
}

#if compiler(>=6.3) && canImport(ScreenCaptureKit)
// Opt-in iOS 27 prototype. The system picker owns permission; only audio outputs
// are analyzed. Screen samples are immediately ignored, never saved or uploaded.
@available(iOS 27.0, *)
private final class IPhoneSystemAudioInput: NSObject, NativeSystemAudioInput,
    SCContentSharingPickerObserver, SCStreamOutput, SCStreamDelegate {
    private let format: AVAudioFormat
    private let onBuffer: (AVAudioPCMBuffer) -> Void
    private let onStarted: () -> Void
    private let onDropped: (Double) -> Void
    private let onError: (Error) -> Void
    private let queue = DispatchQueue(label: "habla.system-audio")
    private let pendingAudio = DispatchSemaphore(value: 20)
    private var capture: SCStream?
    private var cancelled = false
    private var starting = false
    private var converter: AVAudioConverter?
    private var sourceFormat: AVAudioFormat?

    init(format: AVAudioFormat, onBuffer: @escaping (AVAudioPCMBuffer) -> Void,
         onDropped: @escaping (Double) -> Void, onStarted: @escaping () -> Void, onError: @escaping (Error) -> Void) {
        self.format = format; self.onBuffer = onBuffer; self.onDropped = onDropped
        self.onStarted = onStarted; self.onError = onError
    }

    func start() {
        let picker = SCContentSharingPicker.shared
        var configuration = SCContentSharingPickerConfiguration()
        configuration.showsMicrophoneControl = false
        configuration.showsCameraControl = false
        picker.defaultConfiguration = configuration
        picker.add(self)
        picker.isActive = true
        picker.present()
    }

    func contentSharingPicker(_ picker: SCContentSharingPicker, didUpdateWith filter: SCContentFilter, for stream: SCStream?) {
        DispatchQueue.main.async { [weak self] in self?.begin(filter: filter) }
    }

    private func begin(filter: SCContentFilter) {
        guard !cancelled, !starting, capture == nil else { return }
        starting = true
        Task { @MainActor [weak self] in
            guard let self, !self.cancelled else { return }
            do {
                let configuration = SCStreamConfiguration()
                configuration.capturesAudio = true
                configuration.excludesCurrentProcessAudio = true
                configuration.sampleRate = Int(self.format.sampleRate)
                configuration.channelCount = Int(self.format.channelCount)
                configuration.width = 2; configuration.height = 2
                let stream = SCStream(filter: filter, configuration: configuration, delegate: self)
                self.capture = stream
                try stream.addStreamOutput(self, type: .audio, sampleHandlerQueue: self.queue)
                // A screen output keeps the stream valid; its frames are discarded.
                try stream.addStreamOutput(self, type: .screen, sampleHandlerQueue: self.queue)
                try await stream.startCapture()
                guard !self.cancelled else { try? await stream.stopCapture(); return }
                self.onStarted()
            } catch { if !self.cancelled { self.onError(error) } }
        }
    }

    func contentSharingPicker(_ picker: SCContentSharingPicker, didCancelFor stream: SCStream?) {
        DispatchQueue.main.async { [weak self] in
            guard let self, !self.cancelled, self.capture == nil else { return }
            self.onError(NSError(domain: "HablaSystemAudio", code: 1,
                userInfo: [NSLocalizedDescriptionKey: "System audio capture was cancelled in Apple's picker."]))
        }
    }

    func contentSharingPickerStartDidFailWithError(_ error: Error) {
        DispatchQueue.main.async { [weak self] in
            guard let self, !self.cancelled else { return }
            self.onError(error)
        }
    }

    func stream(_ stream: SCStream, didStopWithError error: Error) {
        DispatchQueue.main.async { [weak self] in
            guard let self, !self.cancelled else { return }
            self.onError(error)
        }
    }

    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio, CMSampleBufferDataIsReady(sampleBuffer) else { return }
        // Keep session state and converter use main-thread owned, as for the analyzer.
        // Bound retained PCM when the UI/recognizer cannot keep up in the background.
        guard pendingAudio.wait(timeout: .now()) == .success else {
            var duration = CMSampleBufferGetDuration(sampleBuffer).seconds
            if !duration.isFinite || duration <= 0,
               let description = CMSampleBufferGetFormatDescription(sampleBuffer),
               let asbd = CMAudioFormatDescriptionGetStreamBasicDescription(description),
               asbd.pointee.mSampleRate > 0 {
                duration = Double(CMSampleBufferGetNumSamples(sampleBuffer)) / asbd.pointee.mSampleRate
            }
            onDropped(duration)
            return
        }
        let gate = pendingAudio
        DispatchQueue.main.async { [weak self] in
            defer { gate.signal() }
            self?.receive(sampleBuffer)
        }
    }

    private func receive(_ sample: CMSampleBuffer) {
        guard !cancelled, let description = CMSampleBufferGetFormatDescription(sample),
              let asbd = CMAudioFormatDescriptionGetStreamBasicDescription(description),
              let source = AVAudioFormat(streamDescription: asbd) else { return }
        let frames = CMSampleBufferGetNumSamples(sample)
        guard frames > 0, frames <= 192_000,
              let pcm = AVAudioPCMBuffer(pcmFormat: source, frameCapacity: AVAudioFrameCount(frames)) else { return }
        pcm.frameLength = AVAudioFrameCount(frames)
        let copied = CMSampleBufferCopyPCMDataIntoAudioBufferList(sample, at: 0,
            frameCount: Int32(frames), into: pcm.mutableAudioBufferList)
        guard copied == noErr else {
            onError(NSError(domain: "HablaSystemAudio", code: Int(copied),
                userInfo: [NSLocalizedDescriptionKey: "System audio samples could not be copied."]))
            return
        }
        if sourceFormat != source {
            sourceFormat = source
            converter = AVAudioConverter(from: source, to: format)
            converter?.primeMethod = .none
        }
        guard let converter, source.sampleRate > 0 else { return }
        let capacity = AVAudioFrameCount(ceil(Double(frames) * format.sampleRate / source.sampleRate)) + 32
        guard let output = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: capacity) else { return }
        var supplied = false
        var error: NSError?
        let result = converter.convert(to: output, error: &error) { _, status in
            if supplied { status.pointee = .noDataNow; return nil }
            supplied = true; status.pointee = .haveData; return pcm
        }
        if let error { onError(error) }
        else if result != .error, output.frameLength > 0 { onBuffer(output) }
    }

    func cancel() {
        guard !cancelled else { return }
        cancelled = true
        let picker = SCContentSharingPicker.shared
        picker.remove(self)
        picker.isActive = false
        if let capture { Task { try? await capture.stopCapture() } }
        capture = nil; converter = nil
    }
}
#endif

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
    // Passage finalization is independent of Stop/session finalization. Keep
    // tentative words visible for review without using them in automatic drafts.
    var confirmedText: String { passages.filter { $0.final }.map(\.text).joined(separator: " ") }
    var tentativeText: String { passages.filter { !$0.final }.map(\.text).joined(separator: " ") }
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
