import SwiftUI
import WebKit
import Speech
import AVFoundation
import UniformTypeIdentifiers

@main
struct HablaEcuadorApp: App {
    var body: some Scene {
        WindowGroup { TranslatorView().ignoresSafeArea(.container, edges: .bottom) }
    }
}

struct TranslatorView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> TranslatorController { TranslatorController() }
    func updateUIViewController(_ controller: TranslatorController, context: Context) {}
}

private final class WeakSpeechHandler: NSObject, WKScriptMessageHandler {
    weak var receiver: WKScriptMessageHandler?
    init(_ receiver: WKScriptMessageHandler) { self.receiver = receiver }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        receiver?.userContentController(controller, didReceive: message)
    }
}

final class TranslatorController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private var speech: NativeSpeechCapture!
    private var audioFileID: String?
    private var audioFileLanguage = "es-EC"
    private var audioFileURL: URL?
    private var audioFileTask: SFSpeechRecognitionTask?
    private var audioFileRecognizer: SFSpeechRecognizer?
    private var audioFileTimeout: DispatchWorkItem?
    private var callSpeechEnabled = false
    private var callOperation = UUID()
    private let callSynthesizer = AVSpeechSynthesizer()
    private let site = URL(string: "https://mathewdmoore.github.io/habla-ecuador/translator.html")!

    override func viewDidLoad() {
        super.viewDidLoad()
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        if let scriptURL = Bundle.main.url(forResource: "NativeSpeech", withExtension: "js"),
           let script = try? String(contentsOf: scriptURL, encoding: .utf8) {
            configuration.userContentController.addUserScript(WKUserScript(
                source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        configuration.userContentController.add(WeakSpeechHandler(self), name: "hablaSpeech")
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        speech = NativeSpeechCapture { [weak self] message in
            guard let self, let data = try? JSONSerialization.data(withJSONObject: message),
                  let json = String(data: data, encoding: .utf8) else { return }
            self.webView.evaluateJavaScript("window.__hablaNativeSpeech?.(\(json))", completionHandler: nil)
        }
        NotificationCenter.default.addObserver(self, selector: #selector(suspendCapture),
            name: UIApplication.didEnterBackgroundNotification, object: nil)
        webView.load(URLRequest(url: site))
    }

    @objc private func suspendCapture() { speech?.abortActive() }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let origin = message.frameInfo.securityOrigin
        guard message.frameInfo.isMainFrame, origin.protocol == "https",
              origin.host == site.host, origin.port == 0 || origin.port == 443,
              webView.url?.path.hasPrefix("/habla-ecuador/") == true,
              let body = message.body as? [String: Any], let id = body["id"] as? String,
              let action = body["action"] as? String else { return }
        switch action {
        case "transcribeFile": pickVoiceNote(id: id, language: body["lang"] as? String ?? "es-EC")
        case "cancelFile": finishVoiceNote(error: "Transcription cancelled.")
        case "callSpeech": setCallSpeech(id: id, enabled: body["enabled"] as? Bool ?? false)
        case "speakCall": speakIntoCall(id: id, text: body["text"] as? String ?? "", language: body["lang"] as? String ?? "es-EC")
        case "start": setCallSpeech(id: "microphone", enabled: false); speech.start(id: id, language: body["lang"] as? String ?? "es-EC", mode: body["mode"] as? String ?? "auto")
        case "stop": speech.stop(id: id)
        case "abort": speech.abort(id: id)
        default: break
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        let trusted = url.scheme == "https" && url.host == site.host
            && url.path.hasPrefix("/habla-ecuador/")
        if trusted {
            // Discard callbacks from the old page before a new document installs its bridge.
            if navigationAction.targetFrame?.isMainFrame != false { speech?.abortActive(); finishVoiceNote(error: "Page changed."); setCallSpeech(id: "navigation", enabled: false) }
            decisionHandler(.allow)
        } else {
            decisionHandler(.cancel)
            if ["https", "http", "mailto"].contains(url.scheme ?? "") {
                UIApplication.shared.open(url)
            }
        }
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if navigationAction.targetFrame == nil, let url = navigationAction.request.url,
           url.scheme == "https", url.host == site.host, url.path.hasPrefix("/habla-ecuador/") {
            webView.load(navigationAction.request)
        }
        return nil
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        guard (error as NSError).code != NSURLErrorCancelled else { return }
        let alert = UIAlertController(title: "Couldn’t open Habla Ecuador",
            message: "An internet connection is needed to load the translator in this test app.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Retry", style: .default) { [weak self] _ in
            guard let self else { return }
            self.webView.load(URLRequest(url: self.site))
        })
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    deinit {
        audioFileTimeout?.cancel()
        audioFileTask?.cancel()
        if let url = audioFileURL { try? FileManager.default.removeItem(at: url) }
        NotificationCenter.default.removeObserver(self)
    }
}

// Explicit native-only prototype: file transcription and outgoing call speech.
// This does not capture the remote participant's WhatsApp audio.
extension TranslatorController: UIDocumentPickerDelegate {
    func emitAudio(_ message: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: message),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("window.__hablaNativeAudio?.(\(json))", completionHandler: nil)
    }
    func pickVoiceNote(id: String, language: String) {
        guard presentedViewController == nil, audioFileID == nil else {
            emitAudio(["id":id,"error":"Finish the current file operation first."]); return
        }
        speech.abortActive()
        audioFileID = id; audioFileLanguage = language
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.audio], asCopy: true)
        picker.delegate = self
        present(picker, animated: true)
    }
    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        finishVoiceNote(error: "File selection cancelled.")
    }
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let id = audioFileID, let url = urls.first else { finishVoiceNote(error: "No audio file selected."); return }
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        do {
            let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
            guard size > 0, size <= 50 * 1024 * 1024 else { finishVoiceNote(error: "Choose an audio file under 50 MB."); return }
            let copy = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString).appendingPathExtension(url.pathExtension)
            try FileManager.default.copyItem(at: url, to: copy)
            audioFileURL = copy
        } catch { finishVoiceNote(error: "The audio file could not be opened."); return }
        SFSpeechRecognizer.requestAuthorization { [weak self] permission in
            DispatchQueue.main.async {
                guard let self, self.audioFileID == id else { return }
                guard permission == .authorized else { self.finishVoiceNote(error: "Speech recognition permission was not granted."); return }
                self.transcribeVoiceNote(id: id)
            }
        }
    }
    func transcribeVoiceNote(id: String) {
        guard let url = audioFileURL else { finishVoiceNote(error: "The audio file is unavailable."); return }
        let requested = audioFileLanguage.replacingOccurrences(of: "_", with: "-")
        let locales = SFSpeechRecognizer.supportedLocales().sorted { $0.identifier < $1.identifier }
        guard let locale = locales.first(where: { $0.identifier.replacingOccurrences(of:"_",with:"-") == requested })
            ?? locales.first(where: { $0.identifier.prefix(2) == requested.prefix(2) }),
              let recognizer = SFSpeechRecognizer(locale: locale), recognizer.supportsOnDeviceRecognition else {
            finishVoiceNote(error: "On-device recognition is unavailable for this language. No audio was uploaded."); return
        }
        audioFileRecognizer = recognizer
        let request = SFSpeechURLRecognitionRequest(url: url)
        request.requiresOnDeviceRecognition = true
        request.shouldReportPartialResults = false
        emitAudio(["id":id,"status":"Transcribing on this iPhone… / Transcribiendo en este iPhone…"])
        let timeout = DispatchWorkItem { [weak self] in
            guard self?.audioFileID == id else { return }
            self?.finishVoiceNote(error: "Transcription timed out. Try a shorter voice note.")
        }
        audioFileTimeout = timeout
        DispatchQueue.main.asyncAfter(deadline: .now() + 90, execute: timeout)
        audioFileTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
            DispatchQueue.main.async {
                guard let self, self.audioFileID == id else { return }
                if let result, result.isFinal {
                    self.finishVoiceNote(text: result.bestTranscription.formattedString, language: locale.identifier)
                } else if error != nil {
                    self.finishVoiceNote(error: "Speech could not be recognized. Check the recording, language and installed speech resources.")
                }
            }
        }
    }
    func finishVoiceNote(text: String? = nil, language: String? = nil, error: String? = nil) {
        let id = audioFileID
        audioFileID = nil
        audioFileTimeout?.cancel(); audioFileTimeout = nil
        audioFileTask?.cancel(); audioFileTask = nil; audioFileRecognizer = nil
        if let url = audioFileURL { try? FileManager.default.removeItem(at: url) }; audioFileURL = nil
        if let id {
            var message: [String: Any] = ["id":id]
            if let text { message["text"] = text; message["language"] = language ?? "" }
            if let error { message["error"] = error }
            emitAudio(message)
        }
    }
    func setCallSpeech(id: String, enabled: Bool) {
        guard #available(iOS 18.2, *) else { emitAudio(["id":id,"error":"Call speech requires iOS 18.2 or later."]); return }
        speech.abortActive()
        let operation = UUID(); callOperation = operation
        if !enabled {
            callSynthesizer.stopSpeaking(at: .immediate)
            try? AVAudioSession.sharedInstance().setPreferredMicrophoneInjectionMode(.none)
            callSpeechEnabled = false
            emitAudio(["id":id,"enabled":false,"status":"Call speech off / Audio de llamada desactivado"]); return
        }
        Task { @MainActor [weak self] in
            guard let self else { return }
            let permission = await AVAudioApplication.requestMicrophoneInjectionPermission()
            guard self.callOperation == operation else { return }
            guard permission == .granted else {
                self.emitAudio(["id":id,"error":"Enable Settings → Accessibility → Audio & Visual → Add Audio in Calls, then allow Habla Ecuador. / Activa Añadir audio en llamadas en Accesibilidad y permite Habla."]); return
            }
            let session = AVAudioSession.sharedInstance()
            guard session.isMicrophoneInjectionAvailable else {
                self.emitAudio(["id":id,"error":"No compatible active call was detected. WhatsApp compatibility must be tested on the device."]); return
            }
            do {
                try session.setCategory(.playback, mode: .spokenAudio, options: [.mixWithOthers])
                try session.setActive(true)
                try session.setPreferredMicrophoneInjectionMode(.spokenAudio)
                self.callSpeechEnabled = true
                self.emitAudio(["id":id,"enabled":true,"status":"Outgoing call speech enabled. Remote-call listening is not provided. / Voz saliente activada; no captura la voz del interlocutor."])
            } catch { self.emitAudio(["id":id,"error":"iOS could not enable call speech."]) }
        }
    }
    func speakIntoCall(id: String, text: String, language: String) {
        guard #available(iOS 18.2, *), callSpeechEnabled, AVAudioSession.sharedInstance().isMicrophoneInjectionAvailable else {
            emitAudio(["id":id,"error":"Enable outgoing speech during a compatible active call first."]); return
        }
        guard !text.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty, text.count <= 2000,
              let voice = AVSpeechSynthesisVoice(language: language) else {
            emitAudio(["id":id,"error":"Select a supported voice and a translation under 2,000 characters."]); return
        }
        callSynthesizer.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = voice
        callSynthesizer.speak(utterance)
        emitAudio(["id":id,"status":"Speech submitted to the call route; audibility is not verified. / Voz enviada a la ruta de llamada; verifica el audio."])
    }
}
