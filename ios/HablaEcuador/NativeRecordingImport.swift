import AVFoundation
import PhotosUI
import Speech
import UniformTypeIdentifiers
import UIKit

// User-selected video only. Never opens a microphone or permits server ASR.
@MainActor
final class NativeRecordingImport: NSObject, PHPickerViewControllerDelegate, UIDocumentPickerDelegate, UIAdaptivePresentationControllerDelegate {
    private weak var host: UIViewController?
    private let emit: ([String: Any]) -> Void
    private var requestID: String?
    private var token = UUID()
    private var locale = "es-MX"
    private var offset: Double = 0
    private weak var picker: UIViewController?
    private var loading: Progress?
    private var operation: Task<Void, Never>?
    private var exporter: AVAssetExportSession?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var recognizer: SFSpeechRecognizer?
    private var continuation: CheckedContinuation<String, Error>?
    private var deadline: DispatchWorkItem?
    var isActive: Bool { requestID != nil }

    init(host: UIViewController, emit: @escaping ([String: Any]) -> Void) {
        self.host = host
        self.emit = emit
        super.init()
        // Recover app-owned leftovers from a crashed import, never recent jobs.
        let manager = FileManager.default
        let abandoned = (try? manager.contentsOfDirectory(at: manager.temporaryDirectory, includingPropertiesForKeys: [.creationDateKey, .isDirectoryKey])) ?? []
        for folder in abandoned where folder.lastPathComponent.hasPrefix("habla-recording-") {
            if let values = try? folder.resourceValues(forKeys: [.creationDateKey, .isDirectoryKey]),
               values.isDirectory == true, let created = values.creationDate,
               Date().timeIntervalSince(created) > 3600 { try? manager.removeItem(at: folder) }
        }
    }

    func start(id: String, source: String, language: String, startSeconds: Double) {
        guard !id.isEmpty, id.utf16.count <= 200, !isActive else { return }
        guard ["photos", "files"].contains(source), ["es-MX", "en-US"].contains(language),
              startSeconds.isFinite, startSeconds.rounded(.towardZero) == startSeconds, startSeconds >= 0, startSeconds <= 86_400 else {
            emit(["type":"recording-import", "id":id, "status":"error", "message":"Choose Photos or Files, Spanish or English, and a valid start time."])
            return
        }
        guard let host, host.view.window != nil, host.presentedViewController == nil else {
            emit(["type":"recording-import", "id":id, "status":"error", "message":"Close the current sheet and try importing again."])
            return
        }
        requestID = id
        token = UUID()
        locale = language
        offset = startSeconds
        let current = token
        report("working", "Choose one video. Photos stored in iCloud may need internet to download.")
        let timeout = DispatchWorkItem { [weak self] in
            Task { @MainActor [weak self] in
                guard let self, self.token == current else { return }
                self.cancel(message: "Import timed out. Your existing text is unchanged.")
            }
        }
        deadline = timeout
        DispatchQueue.main.asyncAfter(deadline: .now() + 300, execute: timeout)
        if source == "photos" {
            var configuration = PHPickerConfiguration()
            configuration.filter = .videos
            configuration.selectionLimit = 1
            configuration.preferredAssetRepresentationMode = .current
            let sheet = PHPickerViewController(configuration: configuration)
            sheet.delegate = self
            picker = sheet
            host.present(sheet, animated: true)
            sheet.presentationController?.delegate = self
        } else {
            let sheet = UIDocumentPickerViewController(forOpeningContentTypes: [.movie], asCopy: true)
            sheet.allowsMultipleSelection = false
            sheet.delegate = self
            picker = sheet
            host.present(sheet, animated: true)
            sheet.presentationController?.delegate = self
        }
    }

    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        guard self.picker === picker, isActive else { return }
        picker.dismiss(animated: true)
        self.picker = nil
        guard let provider = results.first?.itemProvider else { cancel(); return }
        let current = token
        report("working", "Loading selected video… Audio will be transcribed on this iPhone only.")
        // The provider URL expires when this callback returns: copy inside it.
        loading = provider.loadFileRepresentation(forTypeIdentifier: UTType.movie.identifier) { [weak self] url, _ in
            let staged: Result<URL, Error>
            do {
                guard let url else { throw RecordingImportProblem("The selected video could not be loaded. If it is in iCloud, download it and try again.") }
                staged = .success(try Self.stage(url))
            } catch { staged = .failure(error) }
            Task { @MainActor [weak self] in
                guard let self, self.token == current, self.isActive else {
                    if case let .success(url) = staged { Self.removeStage(url) }
                    return
                }
                self.loading = nil
                switch staged {
                case let .success(url): self.process(url, current: current)
                case let .failure(error): self.fail(error)
                }
            }
        }
    }

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard picker === controller, isActive, let url = urls.first else { return }
        picker = nil
        let current = token
        report("working", "Reading selected video…")
        operation = Task { [weak self] in
            let staged: Result<URL, Error> = await Task.detached {
                let scoped = url.startAccessingSecurityScopedResource()
                defer { if scoped { url.stopAccessingSecurityScopedResource() } }
                do { return .success(try Self.stage(url)) } catch { return .failure(error) }
            }.value
            guard let self, self.token == current, self.isActive else {
                if case let .success(url) = staged { Self.removeStage(url) }
                return
            }
            switch staged {
            case let .success(url): self.process(url, current: current)
            case let .failure(error): self.fail(error)
            }
        }
    }

    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        if picker === controller { cancel() }
    }
    func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        if picker === presentationController.presentedViewController { cancel() }
    }

    nonisolated private static func stage(_ source: URL) throws -> URL {
        let size = try source.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
        guard size > 0, size <= 500 * 1024 * 1024 else { throw RecordingImportProblem("Choose a nonempty video no larger than 500 MB.") }
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent("habla-recording-" + UUID().uuidString, isDirectory: true)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: false)
        do {
            let copy = folder.appendingPathComponent("selected-video.mov")
            try FileManager.default.copyItem(at: source, to: copy)
            return copy
        } catch {
            try? FileManager.default.removeItem(at: folder)
            throw error
        }
    }
    nonisolated private static func removeStage(_ video: URL) {
        try? FileManager.default.removeItem(at: video.deletingLastPathComponent())
    }

    private func process(_ video: URL, current: UUID) {
        let language = locale, start = offset
        operation = Task { [weak self] in
            defer { Self.removeStage(video) }
            guard let self, self.token == current, self.isActive else { return }
            do {
                let asset = AVURLAsset(url: video)
                let tracks = try await asset.loadTracks(withMediaType: .audio)
                guard !tracks.isEmpty else { throw RecordingImportProblem("This video has no audio track. A silent screen recording cannot be transcribed.") }
                let mediaDuration = try await asset.load(.duration)
                let duration = mediaDuration.seconds
                guard duration.isFinite, duration > start else { throw RecordingImportProblem("Start time is beyond the end of this recording.") }
                let seconds = min(60, duration - start)
                try Task.checkCancellation()
                guard self.token == current, self.isActive else { return }
                let audio = video.deletingLastPathComponent().appendingPathComponent("selected-audio.m4a")
                guard let export = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
                    throw RecordingImportProblem("The audio format could not be extracted from this video.")
                }
                self.exporter = export
                export.outputURL = audio
                export.outputFileType = .m4a
                export.timeRange = CMTimeRange(start: CMTime(seconds: start, preferredTimescale: 600), duration: CMTime(seconds: seconds, preferredTimescale: 600))
                self.report("working", "Extracting \(Int(seconds.rounded(.up))) seconds from \(Int(start))s. Longer videos are processed one segment at a time.")
                try await withCheckedThrowingContinuation { (done: CheckedContinuation<Void, Error>) in
                    export.exportAsynchronously {
                        if export.status == .completed { done.resume() }
                        else { done.resume(throwing: RecordingImportProblem("Could not extract the selected audio. It may be unsupported, protected, or cancelled.")) }
                    }
                }
                try Task.checkCancellation()
                guard self.token == current, self.isActive else { return }
                self.exporter = nil
                let meter = Task.detached { try Self.hasSignal(audio) }
                let signal = try await withTaskCancellationHandler(operation: { try await meter.value }, onCancel: { meter.cancel() })
                guard signal else { throw RecordingImportProblem("This segment is silent or too quiet for reliable recognition. No transcript was substituted for your text.") }
                guard self.token == current, self.isActive else { return }
                self.report("working", "Preparing on-device \(language == "es-MX" ? "Spanish" : "English") recognition…")
                let authorization = await withCheckedContinuation { done in
                    SFSpeechRecognizer.requestAuthorization { done.resume(returning: $0) }
                }
                try Task.checkCancellation()
                guard authorization == .authorized else { throw RecordingImportProblem("Speech recognition permission is unavailable. Check iPhone Settings → Privacy & Security → Speech Recognition → Habla Ecuador.") }
                guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: language)),
                      recognizer.supportsOnDeviceRecognition, recognizer.isAvailable else {
                    throw RecordingImportProblem("On-device recognition is unavailable for the selected language. Recording import does not fall back to uploading audio.")
                }
                guard self.token == current, self.isActive else { return }
                self.recognizer = recognizer
                let request = SFSpeechURLRecognitionRequest(url: audio)
                request.requiresOnDeviceRecognition = true
                request.shouldReportPartialResults = true
                let text = try await withCheckedThrowingContinuation { (done: CheckedContinuation<String, Error>) in
                    self.continuation = done
                    self.recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
                        Task { @MainActor [weak self] in
                            guard let self, self.token == current, self.isActive, let pending = self.continuation else { return }
                            if let result, result.isFinal {
                                self.continuation = nil
                                pending.resume(returning: result.bestTranscription.formattedString)
                            } else if error != nil {
                                self.continuation = nil
                                pending.resume(throwing: RecordingImportProblem("On-device recognition could not finish. Try another language or a clearer segment; your text is unchanged."))
                            } else if let result {
                                self.report("working", "Tentative recognition · not ready to apply", text: result.bestTranscription.formattedString)
                            }
                        }
                    }
                }
                try Task.checkCancellation()
                guard self.token == current, self.isActive else { return }
                guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { throw RecordingImportProblem("No words were recognized in this segment. Your existing text is unchanged.") }
                self.report("done", "On-device draft · \(Int(start))s–\(Int((start + seconds).rounded(.up)))s · \(language). Check every word; mixed speech and singing can be inaccurate.", text: String(text.prefix(100_000)))
                self.release()
            } catch {
                guard self.token == current, self.isActive else { return }
                self.fail(error)
            }
        }
    }

    // A low-level signal check, not a guarantee of intelligibility or accuracy.
    nonisolated private static func hasSignal(_ url: URL) throws -> Bool {
        let file = try AVAudioFile(forReading: url, commonFormat: .pcmFormatFloat32, interleaved: false)
        let format = file.processingFormat
        guard format.sampleRate.isFinite, (8_000.0...192_000.0).contains(format.sampleRate),
              (1...8).contains(Int(format.channelCount)), Double(file.length) <= format.sampleRate * 61,
              let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 4096) else { throw RecordingImportProblem("Unsupported extracted audio format.") }
        var energy = 0.0, count = 0
        while file.framePosition < file.length {
            try Task.checkCancellation()
            try file.read(into: buffer)
            guard buffer.frameLength > 0, let channels = buffer.floatChannelData else { break }
            for channel in 0..<Int(format.channelCount) {
                for frame in 0..<Int(buffer.frameLength) {
                    let sample = Double(channels[channel][frame])
                    guard sample.isFinite else { throw RecordingImportProblem("The audio contains invalid samples.") }
                    energy += sample * sample
                    count += 1
                }
            }
        }
        return count > 0 && sqrt(energy / Double(count)) >= 0.0001
    }

    private func report(_ status: String, _ message: String, text: String? = nil) {
        guard let id = requestID else { return }
        var event: [String: Any] = ["type":"recording-import", "id":id, "status":status, "message":message]
        if let text { event["text"] = text }
        emit(event)
    }
    private func fail(_ error: Error) {
        report("error", (error as? RecordingImportProblem)?.message ?? "The recording could not be read. Your text is unchanged; try another video.")
        release()
    }
    func cancel(id: String? = nil, message: String = "Import cancelled. Your existing text is unchanged.") {
        guard isActive, id == nil || requestID == id else { return }
        report("cancelled", message)
        token = UUID()
        operation?.cancel()
        exporter?.cancelExport()
        loading?.cancel()
        picker?.dismiss(animated: false)
        picker = nil
        continuation?.resume(throwing: CancellationError())
        continuation = nil
        release()
    }
    private func release() {
        deadline?.cancel(); deadline = nil
        recognitionTask?.cancel(); recognitionTask = nil
        recognizer = nil
        exporter = nil
        loading = nil
        operation = nil
        requestID = nil
    }
}

private struct RecordingImportProblem: Error {
    let message: String
    init(_ message: String) { self.message = message }
}
