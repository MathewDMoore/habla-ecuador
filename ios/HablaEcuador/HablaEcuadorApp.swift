import SwiftUI
import WebKit
import Vision
import VisionKit

// BEGIN NATIVE IMAGE OCR
// Shared with the macOS Vision regression harness. No image leaves the device.
private enum NativeImageOCR {
    static func recognize(_ data: Data) throws -> [String: Any] {
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["en-US", "es-ES"]
        request.automaticallyDetectsLanguage = true
        request.usesLanguageCorrection = true
        try VNImageRequestHandler(data: data, options: [:]).perform([request])
        let observations = request.results ?? []
        let candidates = observations.compactMap { $0.topCandidates(1).first }
        // Confidence is a recognition estimate, not a guarantee of correctness.
        // Do not commit weak fragments as if they were usable translation input.
        let accepted = candidates.filter { candidate in
            candidate.confidence >= 0.65 &&
            candidate.string.range(of: #"\p{L}{3,}"#, options: .regularExpression) != nil
        }
        let text = accepted.map { $0.string }.joined(separator: "\n").trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, text.count <= 200_000 else {
            throw NSError(domain: "HablaImageOCR", code: 1, userInfo: [NSLocalizedDescriptionKey:
                "The image text could not be read clearly. Your original text was kept. Try a closer photo with less glare."])
        }
        let confidence = accepted.reduce(Float(0)) { $0 + $1.confidence } / Float(accepted.count)
        return ["text": text, "confidence": Double(confidence) * 100,
                "excludedLines": candidates.count - accepted.count, "engine": "apple-vision"]
    }
}
// END NATIVE IMAGE OCR

// A fresh id ensures a second tap on the SAME widget destination is handled.
struct WidgetLaunchRequest {
    let id = UUID()
    let url: URL
}

@main
struct HablaEcuadorApp: App {
    @State private var widgetRoute: WidgetLaunchRequest?

    var body: some Scene {
        WindowGroup {
            TranslatorView(widgetRoute: widgetRoute)
                .ignoresSafeArea(.container, edges: .bottom)
                .onOpenURL { url in
                    guard url.scheme?.lowercased() == "hablaecuador" else { return }
                    widgetRoute = WidgetLaunchRequest(url: url)
                }
        }
    }
}

struct TranslatorView: UIViewControllerRepresentable {
    var widgetRoute: WidgetLaunchRequest?
    func makeUIViewController(context: Context) -> TranslatorController { TranslatorController() }
    func updateUIViewController(_ controller: TranslatorController, context: Context) {
        controller.openWidgetRoute(widgetRoute)
    }
}

private final class WeakSpeechHandler: NSObject, WKScriptMessageHandler {
    weak var receiver: WKScriptMessageHandler?
    init(_ receiver: WKScriptMessageHandler) { self.receiver = receiver }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        receiver?.userContentController(controller, didReceive: message)
    }
}

// Read only after the user taps Paste image. WebKit's browser clipboard API
// is not a reliable image source inside the native companion.
private final class ClipboardImageHandler: NSObject, WKScriptMessageHandlerWithReply {
    func userContentController(_ controller: WKUserContentController,
                               didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        let origin = message.frameInfo.securityOrigin
        guard message.frameInfo.isMainFrame, origin.protocol == "https",
              origin.host == "mathewdmoore.github.io", origin.port == 0 || origin.port == 443,
              message.frameInfo.request.url?.path.hasPrefix("/habla-ecuador/") == true,
              let body = message.body as? [String: Any],
              let action = body["action"] as? String,
              ["readImage", "recognizeImage"].contains(action) else {
            replyHandler(nil, "Image paste is available only in Habla Ecuador.")
            return
        }
        guard let image = UIPasteboard.general.image else {
            replyHandler(nil, "No accessible image on the clipboard. Copy a photo or screenshot, allow Paste if asked, then try again. You can also use Choose photo.")
            return
        }
        let width = image.size.width * image.scale
        let height = image.size.height * image.scale
        guard width > 0, height > 0 else {
            replyHandler(nil, "This copied image has no readable pixels. Try Choose photo.")
            return
        }
        let factor = min(1, 2800 / max(width, height))
        let size = CGSize(width: max(1, floor(width * factor)), height: max(1, floor(height * factor)))
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let prepared = UIGraphicsImageRenderer(size: size, format: format).image { context in
            UIColor.white.setFill()
            context.fill(CGRect(origin: .zero, size: size))
            image.draw(in: CGRect(origin: .zero, size: size))
        }
        guard let data = prepared.pngData(), data.count <= 10 * 1024 * 1024 else {
            replyHandler(nil, "This copied image is too large. Copy a smaller screenshot or use Choose photo.")
            return
        }
        if action == "recognizeImage" {
            DispatchQueue.global(qos: .userInitiated).async {
                do {
                    let result = try NativeImageOCR.recognize(data)
                    DispatchQueue.main.async { replyHandler(result, nil) }
                } catch {
                    let message = error.localizedDescription
                    DispatchQueue.main.async { replyHandler(nil, message) }
                }
            }
        } else {
            replyHandler(["base64": data.base64EncodedString(), "type": "image/png"], nil)
        }
    }
}

final class TranslatorController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler, DataScannerViewControllerDelegate {
    private var webView: WKWebView!
    private var speech: NativeSpeechCapture!
    private var cameraScanner: DataScannerViewController?
    private var cameraRequestID: String?
    private var cameraLines: [String] = []
    private let site = URL(string: "https://mathewdmoore.github.io/habla-ecuador/translator.html")!
    private var lastWidgetRouteID: UUID?

    func openWidgetRoute(_ request: WidgetLaunchRequest?) {
        guard let request,
              request.url.scheme?.lowercased() == "hablaecuador",
              let destination = request.url.host?.lowercased(),
              ["translate", "practice", "dictionary", "tutorial"].contains(destination),
              lastWidgetRouteID != request.id else { return }
        lastWidgetRouteID = request.id
        // The native translator shell deliberately hides the bottom tabs.
        // Direct widget links load the appropriate screen in the full app.
        var url = URLComponents(string: "https://mathewdmoore.github.io/habla-ecuador/index.html")!
        url.queryItems = destination == "tutorial"
            ? [URLQueryItem(name: "tour", value: "1")]
            : [URLQueryItem(name: "start", value: destination)]
        guard let target = url.url else { return }
        loadViewIfNeeded()
        speech?.abortActive()
        webView?.load(URLRequest(url: target))
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.userContentController.addUserScript(WKUserScript(
            source: "window.__hablaNativeInlineVideo = true; window.__hablaSongIdentificationSupported = window.__hablaSystemAudioSupported = \(NativeSpeechCapture.supportsSystemAudioCapture ? "true" : "false");",
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        if let scriptURL = Bundle.main.url(forResource: "NativeSpeech", withExtension: "js"),
           let script = try? String(contentsOf: scriptURL, encoding: .utf8) {
            configuration.userContentController.addUserScript(WKUserScript(
                source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        configuration.userContentController.add(WeakSpeechHandler(self), name: "hablaSpeech")
        configuration.userContentController.addScriptMessageHandler(
            ClipboardImageHandler(), contentWorld: .page, name: "hablaClipboard")
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

    @objc private func suspendCapture() { if speech?.isSystemAudioActive != true { speech?.abortActive() } }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let origin = message.frameInfo.securityOrigin
        guard message.frameInfo.isMainFrame, origin.protocol == "https",
              origin.host == site.host, origin.port == 0 || origin.port == 443,
              webView.url?.path.hasPrefix("/habla-ecuador/") == true,
              let body = message.body as? [String: Any], let id = body["id"] as? String,
              let action = body["action"] as? String else { return }
        switch action {
        case "start": speech.start(id: id, language: body["lang"] as? String ?? "es-EC", mode: body["mode"] as? String ?? "auto", systemAudio: body["input"] as? String == "system")
        case "identify-song":
            guard let requestID = body["requestId"] as? String, !requestID.isEmpty else { return }
            speech.identifySong(id: id, requestID: requestID)
        case "scan-camera": startCameraScan(id: id)
        case "stop": speech.stop(id: id)
        case "abort": speech.abort(id: id)
        default: break
        }
    }


    // Scan directly with Apple's Live Text camera. The scanned pixels never
    // enter the web page or a server; only selected, editable text is passed
    // back through the same guarded import flow used for image paste.
    private func startCameraScan(id: String) {
        guard cameraScanner == nil else {
            sendCameraResult(["id": id, "status": "error",
                              "message": "A camera scan is already open."])
            return
        }
        guard DataScannerViewController.isSupported && DataScannerViewController.isAvailable else {
            sendCameraResult(["id": id, "status": "error",
                              "message": "Live Text camera scanning is unavailable. Check Camera permission in Settings, or choose a photo."])
            return
        }
        let available = DataScannerViewController.supportedTextRecognitionLanguages
        let languages = ["es-ES", "en-US"].filter { available.contains($0) }
        let scanner = DataScannerViewController(
            recognizedDataTypes: [.text(languages: languages)],
            qualityLevel: .balanced,
            recognizesMultipleItems: true,
            isHighFrameRateTrackingEnabled: false,
            isPinchToZoomEnabled: true,
            isGuidanceEnabled: true,
            isHighlightingEnabled: true
        )
        scanner.delegate = self
        scanner.title = "Cámara Traductora"
        scanner.navigationItem.prompt = "Tap one highlighted line or choose all visible text."
        scanner.navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "Cancel", style: .plain, target: self, action: #selector(cancelCameraScan))
        scanner.navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "Use all text", style: .done, target: self, action: #selector(useCameraText))
        let navigation = UINavigationController(rootViewController: scanner)
        navigation.modalPresentationStyle = .fullScreen
        cameraRequestID = id
        cameraScanner = scanner
        cameraLines = []
        present(navigation, animated: true) { [weak self, weak scanner] in
            guard let self, let scanner else { return }
            do {
                try scanner.startScanning()
            } catch {
                self.completeCameraScan(status: "error",
                                        message: "Could not start the camera: \(error.localizedDescription)")
            }
        }
    }

    private func updateCameraItems(_ items: [RecognizedItem]) {
        cameraLines = items.compactMap { item in
            guard case .text(let recognized) = item else { return nil }
            let text = recognized.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
            return text.isEmpty ? nil : text
        }
    }

    func dataScanner(_ scanner: DataScannerViewController,
                     didAdd addedItems: [RecognizedItem], allItems: [RecognizedItem]) {
        updateCameraItems(allItems)
    }

    func dataScanner(_ scanner: DataScannerViewController,
                     didUpdate updatedItems: [RecognizedItem], allItems: [RecognizedItem]) {
        updateCameraItems(allItems)
    }

    func dataScanner(_ scanner: DataScannerViewController,
                     didRemove removedItems: [RecognizedItem], allItems: [RecognizedItem]) {
        updateCameraItems(allItems)
    }

    func dataScanner(_ scanner: DataScannerViewController, didTapOn item: RecognizedItem) {
        guard case .text(let recognized) = item else { return }
        let text = recognized.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        completeCameraScan(status: "ok", text: text)
    }

    @objc private func useCameraText() {
        let text = cameraLines.joined(separator: "\n")
        guard !text.isEmpty else {
            cameraScanner?.navigationItem.prompt = "No text yet. Hold the camera steady over clear lettering."
            return
        }
        completeCameraScan(status: "ok", text: text)
    }

    @objc private func cancelCameraScan() {
        completeCameraScan(status: "cancelled")
    }

    private func completeCameraScan(status: String, text: String? = nil, message: String? = nil) {
        guard let id = cameraRequestID else { return }
        cameraRequestID = nil
        let navigation = cameraScanner?.navigationController
        cameraScanner?.stopScanning()
        cameraScanner?.delegate = nil
        cameraScanner = nil
        cameraLines = []
        navigation?.dismiss(animated: true)
        var payload: [String: Any] = ["id": id, "status": status]
        if let text { payload["text"] = String(text.prefix(20_000)) }
        if let message { payload["message"] = message }
        sendCameraResult(payload)
    }

    private func sendCameraResult(_ payload: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("window.__hablaCameraScan?.(\(json))", completionHandler: nil)
    }

    // The app's document and embedded YouTube video are different frames.
    // Never redirect a subframe or script-initiated YouTube navigation to Safari.
    private func isTrustedAppPage(_ url: URL) -> Bool {
        url.scheme?.lowercased() == "https" &&
        url.host?.lowercased() == site.host &&
        url.path.hasPrefix("/habla-ecuador/")
    }

    private func isAllowedVideoFrame(_ url: URL) -> Bool {
        guard url.scheme?.lowercased() == "https" else { return false }
        switch url.host?.lowercased() {
        case "www.youtube.com", "www.youtube-nocookie.com", "youtube.com":
            return true
        default:
            return false
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        // A YouTube iframe should load *inside* the Music screen, not replace
        // Habla or launch the YouTube application. Keep the main-frame boundary.
        if navigationAction.targetFrame?.isMainFrame == false {
            decisionHandler(isTrustedAppPage(url) || isAllowedVideoFrame(url) ? .allow : .cancel)
            return
        }

        if isTrustedAppPage(url) {
            // Retain the existing speech bridge's main-frame navigation cleanup.
            speech?.abortActive()
            decisionHandler(.allow)
            return
        }

        // Only an explicit, main-document link tap may open an external app.
        // YouTube's scripts, redirects, and iframe links cannot escape Habla.
        decisionHandler(.cancel)
        if navigationAction.sourceFrame.isMainFrame,
           navigationAction.navigationType == .linkActivated,
           ["https", "http", "mailto"].contains(url.scheme?.lowercased() ?? "") {
            UIApplication.shared.open(url)
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

    deinit { NotificationCenter.default.removeObserver(self) }
}
