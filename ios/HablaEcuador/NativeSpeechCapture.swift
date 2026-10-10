import AVFoundation
import Speech
import UIKit

// A narrow native substitute for Web Speech; the existing web app keeps transcript,
// review, continuation, translation and microphone button behavior.
final class NativeSpeechCapture {
    private let emit: ([String: Any]) -> Void
    private let engine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var recognizer: SFSpeechRecognizer?
    private var activeID: String?
    private var generation = UUID()
    private var tapped = false
    private var activated = false
    private var stopping = false
    private var stopDeadline: DispatchWorkItem?
    private var interruptionObserver: NSObjectProtocol?

    init(emit: @escaping ([String: Any]) -> Void) {
        self.emit = emit
        interruptionObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
                guard let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                      raw == AVAudioSession.InterruptionType.began.rawValue,
                      let self, let id = self.activeID else { return }
                self.finish(id: id, error: "audio-capture")
            }
    }

    func start(id: String, language: String) {
        abortActive()
        activeID = id
        generation = UUID()
        let token = generation
        stopping = false
        guard UIApplication.shared.applicationState != .background else {
            finish(id: id, error: "audio-capture")
            return
        }
        // Permission callbacks must never resurrect an aborted or replaced session.
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            DispatchQueue.main.async {
                guard let self, self.generation == token, self.activeID == id, !self.stopping else { return }
                guard status == .authorized else { self.finish(id: id, error: "not-allowed"); return }
                AVCaptureDevice.requestAccess(for: .audio) { [weak self] granted in
                    DispatchQueue.main.async {
                        guard let self, self.generation == token, self.activeID == id, !self.stopping else { return }
                        guard granted else { self.finish(id: id, error: "not-allowed"); return }
                        self.begin(id: id, language: language, token: token)
                    }
                }
            }
        }
    }

    private func begin(id: String, language: String, token: UUID) {
        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: language)), recognizer.isAvailable else {
            finish(id: id, error: "service-not-allowed")
            return
        }
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
            // No forced on-device claim: Apple may need its recognition service.
            self.request = request
            let input = engine.inputNode
            let format = input.outputFormat(forBus: 0)
            guard format.sampleRate > 0, format.channelCount > 0 else {
                finish(id: id, error: "audio-capture")
                return
            }
            input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
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
                    if error != nil { self.finish(id: id, error: self.stopping ? nil : "network") }
                }
            }
            engine.prepare()
            try engine.start()
            emit(["id": id, "type": "start"])
        } catch { finish(id: id, error: "audio-capture") }
    }

    func stop(id: String) {
        guard activeID == id, !stopping else { return }
        stopping = true
        guard request != nil else { finish(id: id); return }
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

    private func finish(id: String, error: String? = nil) {
        guard activeID == id else { return }
        activeID = nil
        generation = UUID()
        stopping = false
        stopDeadline?.cancel()
        stopDeadline = nil
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
        if let error { emit(["id": id, "type": "error", "error": error]) }
        emit(["id": id, "type": "end"])
    }

    deinit {
        if let observer = interruptionObserver { NotificationCenter.default.removeObserver(observer) }
        stopInput()
        task?.cancel()
        if activated { try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation) }
    }
}
