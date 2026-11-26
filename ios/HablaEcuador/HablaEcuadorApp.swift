import SwiftUI
import WebKit
import Vision
import VisionKit
import Translation

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
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            TranslatorView(widgetRoute: widgetRoute)
                .ignoresSafeArea(.container, edges: .bottom)
                .onAppear { consumeSharedYouTubeLink() }
                .onChange(of: scenePhase) { phase in
                    if phase == .active { consumeSharedYouTubeLink() }
                }
                .onOpenURL { url in
                    guard url.scheme?.lowercased() == "hablaecuador" else { return }
                    widgetRoute = WidgetLaunchRequest(url: url)
                }
        }
    }

    // A normal Share extension cannot officially open its parent app.
    // Read the small App Group link inbox when the user launches or returns.
    private func consumeSharedYouTubeLink() {
        guard let defaults = UserDefaults(suiteName: "group.com.mathewdmoore.hablaecuador"),
              let links = defaults.stringArray(forKey: "pendingYouTubeURLs"),
              !links.isEmpty else { return }
        let allowedHosts: Set<String> = [
            "youtube.com", "www.youtube.com", "m.youtube.com",
            "music.youtube.com", "youtu.be", "www.youtube-nocookie.com"
        ]
        for (index, raw) in links.enumerated() {
            guard let video = URL(string: raw), video.scheme == "https",
                  let host = video.host?.lowercased(),
                  allowedHosts.contains(host) else { continue }
            var route = URLComponents()
            route.scheme = "hablaecuador"
            route.host = "music"
            route.queryItems = [URLQueryItem(name: "video", value: raw)]
            guard let url = route.url else { continue }
            defaults.set(Array(links.dropFirst(index + 1)), forKey: "pendingYouTubeURLs")
            widgetRoute = WidgetLaunchRequest(url: url)
            return
        }
        defaults.removeObject(forKey: "pendingYouTubeURLs")
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
    private var cameraOverlayLabel: UILabel?
    private var cameraOverlayButton: UIButton?
    private var cameraLiveEnabled = false
    private var cameraPreviewText = ""
    private var cameraPreviewWork: DispatchWorkItem?
    private var cameraPreviewInFlight: String?
    private var cameraNativeTask: Task<Void, Never>?
    private var cameraSourceLocale = "en-US"
    private var cameraTargetLocale = "es-EC"
    private var cameraLastError: String?
    private struct CameraVisibleLine {
        let id: UUID
        let source: String
        let frame: CGRect
        let angle: CGFloat
    }
    private var cameraVisibleLines: [CameraVisibleLine] = []
    private var cameraSpatialLabels: [UUID: UILabel] = [:]
    private var cameraLeaderLayers: [CAShapeLayer] = []
    private var cameraTranslatedLines: [String: String] = [:]
    private var cameraFailedLines: Set<String> = []
    private let site = URL(string: "https://mathewdmoore.github.io/habla-ecuador/translator.html")!
    private var lastWidgetRouteID: UUID?

    func openWidgetRoute(_ request: WidgetLaunchRequest?) {
        guard let request,
              request.url.scheme?.lowercased() == "hablaecuador",
              let destination = request.url.host?.lowercased(),
              ["translate", "practice", "dictionary", "tutorial", "music"].contains(destination),
              lastWidgetRouteID != request.id else { return }
        lastWidgetRouteID = request.id
        // The native translator shell deliberately hides the bottom tabs.
        // Direct widget links load the appropriate screen in the full app.
        var url = URLComponents(string: "https://mathewdmoore.github.io/habla-ecuador/index.html")!
        if destination == "tutorial" {
            url.queryItems = [URLQueryItem(name: "tour", value: "1")]
        } else {
            url.queryItems = [URLQueryItem(name: "start", value: destination)]
            if destination == "music",
               let video = URLComponents(url: request.url, resolvingAgainstBaseURL: false)?
                    .queryItems?.first(where: { $0.name == "video" })?.value {
                url.queryItems?.append(URLQueryItem(name: "video", value: video))
            }
        }
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

    @objc private func suspendCapture() {
        if speech?.isSystemAudioActive != true { speech?.abortActive() }
        if cameraScanner != nil { completeCameraScan(status: "cancelled") }
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let origin = message.frameInfo.securityOrigin
        guard message.frameInfo.isMainFrame, origin.protocol == "https",
              origin.host == site.host, origin.port == 0 || origin.port == 443,
              webView.url?.path.hasPrefix("/habla-ecuador/") == true,
              let body = message.body as? [String: Any], let id = body["id"] as? String,
              let action = body["action"] as? String else { return }
        if action == "scan-camera", cameraScanner == nil {
            cameraSourceLocale = body["source"] as? String ?? "en-US"
            cameraTargetLocale = body["target"] as? String ?? "es-EC"
        }
        switch action {
        case "start": speech.start(id: id, language: body["lang"] as? String ?? "es-EC", mode: body["mode"] as? String ?? "auto", systemAudio: body["input"] as? String == "system")
        case "identify-song":
            guard let requestID = body["requestId"] as? String, !requestID.isEmpty else { return }
            speech.identifySong(id: id, requestID: requestID)
        case "scan-camera": startCameraScan(id: id)
        case "camera-live-result": receiveCameraLiveResult(body)
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
            qualityLevel: .accurate,
            recognizesMultipleItems: true,
            isHighFrameRateTrackingEnabled: true,
            isPinchToZoomEnabled: true,
            isGuidanceEnabled: false,
            isHighlightingEnabled: false
        )
        scanner.delegate = self
        scanner.title = "Cámara Traductora"
        scanner.navigationItem.prompt = "\(cameraSourceLocale) → \(cameraTargetLocale) · Live AR"
        scanner.navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "Cancel", style: .plain, target: self, action: #selector(cancelCameraScan))
        scanner.navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "Use all text", style: .done, target: self, action: #selector(useCameraText))
        let navigation = UINavigationController(rootViewController: scanner)
        navigation.modalPresentationStyle = .fullScreen
        cameraRequestID = id
        cameraScanner = scanner
        cameraLines = []
        cameraLiveEnabled = true
        cameraLastError = nil
        cameraPreviewText = ""
        cameraPreviewWork?.cancel()
        cameraPreviewWork = nil
        cameraPreviewInFlight = nil
        cameraVisibleLines = []
        cameraTranslatedLines = [:]
        cameraFailedLines = []
        clearCameraSpatialLabels()
        installCameraOverlay(on: scanner)
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

    // The explicit Live AR camera action starts translation. The compact
    // panel toggles original text; only recognized text crosses the bridge.
    private func installCameraOverlay(on scanner: DataScannerViewController) {
        let panel = UIVisualEffectView(effect: UIBlurEffect(style: .systemThinMaterialDark))
        panel.translatesAutoresizingMaskIntoConstraints = false
        panel.layer.cornerRadius = 14
        panel.clipsToBounds = true

        let button = UIButton(type: .system)
        button.setTitle("Show original / Ver original", for: .normal)
        button.titleLabel?.font = .preferredFont(forTextStyle: .headline)
        button.tintColor = .white
        button.contentHorizontalAlignment = .leading
        button.addTarget(self, action: #selector(toggleCameraLiveTranslation), for: .touchUpInside)

        let label = UILabel()
        label.numberOfLines = 2
        label.font = .preferredFont(forTextStyle: .subheadline)
        label.adjustsFontForContentSizeCategory = true
        label.textColor = .white
        label.text = "\(cameraSourceLocale) → \(cameraTargetLocale) · on-device draft"

        let review = UIButton(type: .system)
        review.setTitle("Review / Revisar", for: .normal)
        review.tintColor = .white
        review.addTarget(self, action: #selector(reviewCameraTranslations), for: .touchUpInside)
        let controls = UIStackView(arrangedSubviews: [button, review])
        controls.axis = .horizontal
        controls.spacing = 10
        controls.distribution = .fillProportionally
        button.titleLabel?.font = .preferredFont(forTextStyle: .subheadline)
        let stack = UIStackView(arrangedSubviews: [controls, label])
        stack.axis = .vertical
        stack.spacing = 2
        stack.translatesAutoresizingMaskIntoConstraints = false
        panel.contentView.addSubview(stack)
        scanner.view.addSubview(panel)
        NSLayoutConstraint.activate([
            panel.leadingAnchor.constraint(equalTo: scanner.view.safeAreaLayoutGuide.leadingAnchor, constant: 12),
            panel.trailingAnchor.constraint(equalTo: scanner.view.safeAreaLayoutGuide.trailingAnchor, constant: -12),
            panel.bottomAnchor.constraint(equalTo: scanner.view.safeAreaLayoutGuide.bottomAnchor, constant: -12),
            stack.leadingAnchor.constraint(equalTo: panel.contentView.leadingAnchor, constant: 14),
            stack.trailingAnchor.constraint(equalTo: panel.contentView.trailingAnchor, constant: -14),
            stack.topAnchor.constraint(equalTo: panel.contentView.topAnchor, constant: 4),
            stack.bottomAnchor.constraint(equalTo: panel.contentView.bottomAnchor, constant: -4)
        ])
        cameraOverlayLabel = label
        cameraOverlayButton = button
    }

    // Full translations stay available inside the native camera, including
    // regions that cannot fit without covering adjacent text.
    @objc private func reviewCameraTranslations() {
        guard let scanner = cameraScanner else { return }
        let review = UIViewController()
        review.title = "Camera text / Texto de cámara"
        review.view.backgroundColor = .systemBackground
        let text = UITextView()
        text.isEditable = false
        text.font = .preferredFont(forTextStyle: .body)
        text.translatesAutoresizingMaskIntoConstraints = false
        text.text = cameraLines.map { source in
            source + "\n" + (cameraTranslatedLines[source] ??
                (cameraFailedLines.contains(source) ? "Not translated — original retained" : "Translation pending or unavailable"))
        }.joined(separator: "\n\n")
        review.view.addSubview(text)
        NSLayoutConstraint.activate([
            text.leadingAnchor.constraint(equalTo: review.view.safeAreaLayoutGuide.leadingAnchor, constant: 12),
            text.trailingAnchor.constraint(equalTo: review.view.safeAreaLayoutGuide.trailingAnchor, constant: -12),
            text.topAnchor.constraint(equalTo: review.view.safeAreaLayoutGuide.topAnchor),
            text.bottomAnchor.constraint(equalTo: review.view.safeAreaLayoutGuide.bottomAnchor)
        ])
        review.navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Back / Volver", style: .plain,
            target: self, action: #selector(closeCameraReview))
        review.navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Retry / Reintentar", style: .plain,
            target: self, action: #selector(retryCameraReview))
        let nav = UINavigationController(rootViewController: review)
        nav.modalPresentationStyle = .pageSheet
        scanner.present(nav, animated: true)
    }

    @objc private func closeCameraReview() {
        cameraScanner?.presentedViewController?.dismiss(animated: true)
    }

    @objc private func retryCameraReview() {
        cameraScanner?.presentedViewController?.dismiss(animated: true)
        cameraFailedLines.removeAll()
        cameraLastError = nil
        queueCameraLivePreview()
        updateCameraCoverageStatus()
    }

    @objc private func toggleCameraLiveTranslation() {
        cameraLiveEnabled.toggle()
        cameraOverlayButton?.setTitle(cameraLiveEnabled
            ? "■ Show original / Ver original" : "▶ Translate over text / Traducir encima", for: .normal)
        cameraPreviewWork?.cancel()
        cameraPreviewWork = nil
        cameraPreviewInFlight = nil
        cameraNativeTask?.cancel()
        cameraNativeTask = nil
        cameraLastError = nil
        if cameraLiveEnabled {
            cameraFailedLines.removeAll()
            cameraOverlayLabel?.text = "Live draft · check names and numbers."
            refreshCameraSpatialLabels()
            queueCameraLivePreview()
        } else {
            clearCameraSpatialLabels()
            cameraOverlayLabel?.text = "Original camera text visible. Tap Translate over text to resume."
        }
    }

    // VisionKit supplies text bounds in scanner-view coordinates. Keep a
    // reversible on-camera label for each line, keyed to the recognized item.
    // This is spatial text overlay, not background inpainting.
    private func clearCameraSpatialLabels() {
        for label in cameraSpatialLabels.values { label.removeFromSuperview() }
        cameraSpatialLabels.removeAll()
        cameraLeaderLayers.forEach { $0.removeFromSuperlayer() }
        cameraLeaderLayers.removeAll()
    }

    private func cameraTextBounds(_ bounds: RecognizedItem.Bounds) -> CGRect {
        let center = CGPoint(x: (bounds.topLeft.x + bounds.topRight.x + bounds.bottomRight.x + bounds.bottomLeft.x) / 4,
                             y: (bounds.topLeft.y + bounds.topRight.y + bounds.bottomRight.y + bounds.bottomLeft.y) / 4)
        let width = (hypot(bounds.topRight.x - bounds.topLeft.x, bounds.topRight.y - bounds.topLeft.y)
                    + hypot(bounds.bottomRight.x - bounds.bottomLeft.x, bounds.bottomRight.y - bounds.bottomLeft.y)) / 2
        let height = (hypot(bounds.bottomLeft.x - bounds.topLeft.x, bounds.bottomLeft.y - bounds.topLeft.y)
                     + hypot(bounds.bottomRight.x - bounds.topRight.x, bounds.bottomRight.y - bounds.topRight.y)) / 2
        return CGRect(x: center.x - width / 2, y: center.y - height / 2, width: width, height: height)
    }

    private func refreshCameraSpatialLabels() {
        guard cameraLiveEnabled, let scanner = cameraScanner else {
            clearCameraSpatialLabels()
            return
        }
        let surface = scanner.overlayContainerView
        let bounds = surface.bounds
        guard bounds.width > 40 && bounds.height > 40 else { return }
        cameraLeaderLayers.forEach { $0.removeFromSuperlayer() }
        cameraLeaderLayers.removeAll()
        let visibleIDs = Set(cameraVisibleLines.map(\.id))
        for id in cameraSpatialLabels.keys.filter({ !visibleIDs.contains($0) }) {
            cameraSpatialLabels.removeValue(forKey: id)?.removeFromSuperview()
        }
        // Reserve physical text footprints even if their translations are not ready.
        func screenRect(_ line: CameraVisibleLine, width: CGFloat, height: CGFloat, offset: CGPoint = .zero) -> CGRect {
            let c = abs(cos(line.angle)), t = abs(sin(line.angle))
            let w = width * c + height * t, h = width * t + height * c
            return CGRect(x: line.frame.midX + offset.x - w / 2, y: line.frame.midY + offset.y - h / 2, width: w, height: h)
        }
        var occupied: [CGRect] = []
        // Favor individual text lines over large, overlapping OCR blocks.
        let orderedLines = cameraVisibleLines.sorted {
            $0.frame.width * $0.frame.height < $1.frame.width * $1.frame.height
        }
        for line in orderedLines {
            guard let translation = cameraTranslatedLines[line.source], !translation.isEmpty,
                  !cameraUnchanged(line.source, translation),
                  line.frame.width > 12, line.frame.height > 4 else {
                cameraSpatialLabels.removeValue(forKey: line.id)?.removeFromSuperview()
                continue
            }
            let label: UILabel
            if let existing = cameraSpatialLabels[line.id] {
                label = existing
            } else {
                label = UILabel()
                label.numberOfLines = 0
                label.textAlignment = .center
                label.font = UIFont.systemFont(ofSize: 13, weight: .semibold)
                label.minimumScaleFactor = 0.65
                label.adjustsFontSizeToFitWidth = false
                label.lineBreakMode = .byWordWrapping
                label.textColor = .white
                label.backgroundColor = UIColor.black.withAlphaComponent(0.60)
                label.layer.cornerRadius = 5
                label.layer.masksToBounds = true
                label.layer.borderColor = UIColor.systemTeal.withAlphaComponent(0.7).cgColor
                label.layer.borderWidth = 0
                label.isUserInteractionEnabled = false
                label.accessibilityLabel = "Camera translation: " + translation
                surface.addSubview(label)
                cameraSpatialLabels[line.id] = label
            }
            label.attributedText = nil
            label.text = translation
            let sourceLineCount = max(1, line.source.split(whereSeparator: \.isNewline).count)
            let targetLineCount = max(1, translation.split(whereSeparator: \.isNewline).count)
            let multiLine = max(sourceLineCount, targetLineCount) > 1
            label.textAlignment = multiLine ? .left : .center
            label.backgroundColor = multiLine ? .clear : UIColor.black.withAlphaComponent(0.60)
            // Stay attached to the actual recognized text; never clamp a label
            // onto an unrelated neighboring word at the edge of the view.
            label.transform = .identity
            let width = max(24, line.frame.width)
            let height = max(14, line.frame.height)
            let baseSize = min(24, max(9, line.frame.height * 0.78 / CGFloat(max(sourceLineCount, targetLineCount))))
            var selected: CGSize?
            var selectedOffset = CGPoint.zero
            let candidates: [CGSize] = [
                CGSize(width: width, height: height),
                CGSize(width: width * 1.25, height: height),
                CGSize(width: width * 1.5, height: height * 1.25),
                CGSize(width: width * 1.5, height: height * 2),
                CGSize(width: max(100, width), height: max(28, height * 2)),
                CGSize(width: max(150, width), height: max(42, height * 2))
            ]
            let original = screenRect(line, width: line.frame.width, height: line.frame.height)
            for nearby in [false, true] {
                for candidate in candidates {
                    let distance = min(90, (height + candidate.height) / 2 + 5)
                    let normal = CGPoint(x: -sin(line.angle), y: cos(line.angle))
                    let offsets = nearby ? [
                        CGPoint(x: normal.x * distance, y: normal.y * distance),
                        CGPoint(x: -normal.x * distance, y: -normal.y * distance)
                    ] : [.zero]
                    for offset in offsets {
                        let footprint = screenRect(line, width: candidate.width, height: candidate.height, offset: offset)
                        guard bounds.contains(footprint) else { continue }
                        // Nearby labels must stay close to their source and cannot obscure any other printed region.
                        if nearby && footprint.intersects(original) { continue }
                        let collision = cameraVisibleLines.contains { other in
                            guard other.id != line.id else { return false }
                            let otherRect = screenRect(other, width: other.frame.width, height: other.frame.height)
                            let intersection = footprint.intersection(otherRect)
                            let existing = original.intersection(otherRect)
                            let area = intersection.isNull ? 0 : intersection.width * intersection.height
                            let existingArea = existing.isNull ? 0 : existing.width * existing.height
                            return area > (nearby ? 0 : existingArea) + 4
                        }
                        guard !collision, !occupied.contains(where: { prior in
                            let overlap = prior.intersection(footprint)
                            return !overlap.isNull && overlap.width * overlap.height > 4
                        }) else { continue }
                        var size = nearby ? min(18, max(12, baseSize)) : baseSize
                        while size >= 9 {
                            label.font = .systemFont(ofSize: size, weight: .semibold)
                            let measured = label.sizeThatFits(CGSize(width: max(1, candidate.width - 4), height: .greatestFiniteMagnitude))
                            if measured.width <= candidate.width && measured.height <= candidate.height {
                                selected = candidate
                                selectedOffset = offset
                                occupied.append(footprint)
                                break
                            }
                            size -= 1
                        }
                        if selected != nil { break }
                    }
                    if selected != nil { break }
                }
                if selected != nil { break }
            }
            // Longer target phrases may expand only into unused space.
            // Never cover unrelated text or silently clip an entire phrase.
            label.isHidden = selected == nil
            // Tint only the text lines in a grouped region, not the whole physical block.
            if multiLine, selected != nil {
                label.attributedText = NSAttributedString(string: translation, attributes: [
                    .font: label.font as Any, .foregroundColor: UIColor.white,
                    .backgroundColor: UIColor.black.withAlphaComponent(0.60)
                ])
            }
            let fitted = selected ?? CGSize(width: width, height: height)
            label.bounds = CGRect(origin: .zero, size: fitted)
            label.center = CGPoint(x: line.frame.midX + selectedOffset.x, y: line.frame.midY + selectedOffset.y)
            label.transform = CGAffineTransform(rotationAngle: line.angle)
            if selected != nil, selectedOffset != .zero {
                let connector = CAShapeLayer()
                let path = UIBezierPath()
                path.move(to: CGPoint(x: line.frame.midX, y: line.frame.midY))
                path.addLine(to: label.center)
                connector.path = path.cgPath
                connector.strokeColor = UIColor.systemTeal.cgColor
                connector.lineWidth = 1.5
                connector.fillColor = UIColor.clear.cgColor
                surface.layer.insertSublayer(connector, at: 0)
                cameraLeaderLayers.append(connector)
            }
            label.accessibilityLabel = line.source + " → " + translation
        }
    }

    private func updateCameraItems(_ items: [RecognizedItem]) {
        cameraLines = []
        cameraVisibleLines = []
        for item in items {
            guard case .text(let recognized) = item else { continue }
            let source = recognized.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !source.isEmpty else { continue }
            cameraLines.append(source)
            // Native translation can cover all recognized regions; the older web bridge has its own size limit.
            if #available(iOS 26.0, *) {
                // No arbitrary region cap. Leave unusually long blocks readable through Use all text.
                guard source.count <= 2000 else { continue }
            } else {
                guard source.count <= 150 else { continue }
            }
            cameraVisibleLines.append(CameraVisibleLine(
                id: item.id, source: source, frame: cameraTextBounds(item.bounds),
                angle: atan2(item.bounds.topRight.y - item.bounds.topLeft.y, item.bounds.topRight.x - item.bounds.topLeft.x)))
        }
        refreshCameraSpatialLabels()
        let newText = cameraVisibleLines.map(\.source).joined(separator: "\n")
        let changed = newText != cameraPreviewText
        cameraPreviewText = newText
        if cameraLiveEnabled {
            updateCameraCoverageStatus()
            if changed { queueCameraLivePreview() }
        }
    }

    // An identical result is not proof of a successful translation. Keep it visible as
    // original text and count it separately, including names and identifiers.
    private func cameraUnchanged(_ source: String, _ target: String) -> Bool {
        source.trimmingCharacters(in: .whitespacesAndNewlines).caseInsensitiveCompare(
            target.trimmingCharacters(in: .whitespacesAndNewlines)) == .orderedSame
    }

    private func updateCameraCoverageStatus() {
        if let error = cameraLastError { cameraOverlayLabel?.text = error; return }
        guard !cameraLines.isEmpty else { cameraOverlayLabel?.text = "Point at readable text."; return }
        let recognized = cameraLines.count
        let unchanged = cameraVisibleLines.filter { line in
            guard let result = cameraTranslatedLines[line.source] else { return false }
            return cameraUnchanged(line.source, result)
        }.count
        let translated = cameraVisibleLines.filter { cameraTranslatedLines[$0.source] != nil }.count - unchanged
        let shown = cameraSpatialLabels.values.filter { !$0.isHidden }.count
        let failed = cameraVisibleLines.filter { cameraFailedLines.contains($0.source) }.count + max(0, recognized - cameraVisibleLines.count)
        let pending = cameraVisibleLines.filter {
            cameraTranslatedLines[$0.source] == nil && !cameraFailedLines.contains($0.source)
        }.count
        cameraOverlayLabel?.text = "\(shown)/\(recognized) overlaid · \(unchanged) unchanged · \(pending) pending · \(failed) failed" +
            (translated > shown ? " · \(translated - shown) need full-text review" : "")
    }

    private func queueCameraLivePreview() {
        guard cameraLiveEnabled, cameraLastError == nil, cameraPreviewInFlight == nil, cameraPreviewWork == nil,
              cameraRequestID != nil else { return }
        guard cameraVisibleLines.contains(where: {
            cameraTranslatedLines[$0.source] == nil && !cameraFailedLines.contains($0.source)
        }) else { return }
        let work = DispatchWorkItem { [weak self] in
            guard let self else { return }
            self.cameraPreviewWork = nil
            guard self.cameraLiveEnabled, self.cameraPreviewInFlight == nil,
                  let id = self.cameraRequestID else { return }
            var seen = Set<String>()
            let batchLimit: Int
            if #available(iOS 26.0, *) { batchLimit = 12 } else { batchLimit = 4 }
            let missing = Array(self.cameraVisibleLines.filter {
                self.cameraTranslatedLines[$0.source] == nil &&
                !self.cameraFailedLines.contains($0.source) && seen.insert($0.source).inserted
            }.prefix(batchLimit))
            guard !missing.isEmpty else { return }
            let token = UUID().uuidString
            self.cameraPreviewInFlight = token
            self.updateCameraCoverageStatus()
            if #available(iOS 26.0, *) {
                self.translateCameraNatively(id: id, token: token, items: missing)
            } else {
                self.sendCameraLiveRequest(id: id, token: token, items: missing)
            }
        }
        cameraPreviewWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.18, execute: work)
    }

    // Native Translation runs while the viewfinder is visible and never sends
    // recognized text to the hosted page or a third-party translation service.
    @available(iOS 26.0, *)
    private func translateCameraNatively(id: String, token: String, items: [CameraVisibleLine]) {
        let source = String(cameraSourceLocale.prefix(2))
        let target = String(cameraTargetLocale.prefix(2))
        guard ["en", "es"].contains(source), ["en", "es"].contains(target), source != target else {
            receiveCameraLiveResult(["id": id, "token": token, "error": "Choose English → Spanish or Spanish → English before opening the camera."])
            return
        }
        cameraNativeTask?.cancel()
        cameraNativeTask = Task { @MainActor [weak self] in
            let session = TranslationSession(installedSource: Locale.Language(identifier: source),
                                             target: Locale.Language(identifier: target))
            guard let self, self.cameraRequestID == id, self.cameraPreviewInFlight == token else { return }
            guard await session.isReady else {
                self.receiveCameraLiveResult(["id": id, "token": token,
                    "error": "Download English and Spanish in Apple Translate, then reopen Live AR."])
                return
            }
            for item in items {
                var translations: [[String: String]] = []
                guard !Task.isCancelled, self.cameraRequestID == id, self.cameraPreviewInFlight == token else { return }
                do {
                    let output: String
                    if let fields = self.cameraStructuredLabelLines(item.source, source: source, target: target) {
                        var translatedFields: [String] = []
                        for field in fields {
                            guard !Task.isCancelled, self.cameraRequestID == id,
                                  self.cameraPreviewInFlight == token else { return }
                            if let reviewed = self.cameraReviewedLabel(field, source: source, target: target) {
                                translatedFields.append(reviewed)
                            } else {
                                let translated = try await session.translate(field)
                                let text = translated.targetText.trimmingCharacters(in: .whitespacesAndNewlines)
                                guard !text.isEmpty else { throw NSError(domain: "HablaCamera", code: 1) }
                                translatedFields.append(text)
                            }
                        }
                        output = translatedFields.joined(separator: "\n")
                    } else if let reviewed = self.cameraReviewedLabel(item.source, source: source, target: target) {
                        output = reviewed
                    } else {
                        let result = try await session.translate(item.source)
                        output = result.targetText.trimmingCharacters(in: .whitespacesAndNewlines)
                    }
                    if output.isEmpty || output.count > 6000 || self.cameraNumbers(item.source) != self.cameraNumbers(output) {
                        translations.append(["source": item.source, "error": "Unverified text or changed numbers"])
                    } else {
                        translations.append(["source": item.source, "translation": output])
                    }
                } catch {
                    translations.append(["source": item.source, "error": "Native translation unavailable"])
                }
                guard !Task.isCancelled, self.cameraRequestID == id, self.cameraPreviewInFlight == token else { return }
                // Paint each finished line immediately instead of waiting for the entire batch.
                self.applyCameraTranslations(translations)
                self.updateCameraCoverageStatus()
            }
            guard !Task.isCancelled, self.cameraRequestID == id, self.cameraPreviewInFlight == token else { return }
            self.receiveCameraLiveResult(["id": id, "token": token])
        }
    }

    // Only structured labels are split; normal prose stays intact for context.
    // A multiline OCR region must never be treated as one field's identifier.
    private func cameraStructuredLabelLines(_ text: String, source: String, target: String) -> [String]? {
        guard source == "en", target == "es" else { return nil }
        let lines = text.components(separatedBy: .newlines)
            .map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
        var fields: [String] = []
        let fieldStart = #"(?i)^(?:Group ID|Effective|Member#?|Subscriber ID|Group #)\s*:"#
        let nextField = #"(?i)[ \t]+(?=(?:Group ID|Effective|Member#?|Subscriber ID|Group #)\s*:)"#
        for line in lines {
            if line.range(of: fieldStart, options: .regularExpression) != nil {
                fields.append(contentsOf: line.replacingOccurrences(of: nextField, with: "\n", options: .regularExpression)
                    .components(separatedBy: .newlines))
            } else {
                fields.append(line)
            }
        }
        guard fields.count > 1,
              fields.contains(where: { cameraReviewedLabel($0, source: source, target: target) != nil }) else { return nil }
        return fields
    }

    private func cameraReviewedLabel(_ text: String, source: String, target: String) -> String? {
        guard source == "en", target == "es", !text.contains(where: \.isNewline) else { return nil }
        let labels = [("Group ID", "ID de grupo"), ("Effective", "Vigente desde"),
                      ("Member#", "N.º de miembro"), ("Subscriber ID", "ID de suscriptor"),
                      ("Group #", "N.º de grupo")]
        for (english, spanish) in labels {
            let prefix = english + ":"
            if text.lowercased().hasPrefix(prefix.lowercased()) {
                let suffix = String(text.dropFirst(prefix.count))
                // Do not silently copy prose, a second field, or unrelated text.
                let allowed = english == "Effective" ? #"^\s*\d[\d./\- ]*$"# : #"^\s*[A-Za-z0-9][A-Za-z0-9./\-]*\s*$"#
                guard suffix.range(of: allowed, options: .regularExpression) != nil else { return nil }
                return spanish + ":" + suffix
            }
        }
        if text.caseInsensitiveCompare("Vision Care") == .orderedSame { return "Cuidado de la vista" }
        if text.caseInsensitiveCompare("This is not insurance.") == .orderedSame ||
           text.caseInsensitiveCompare("This is not insurance") == .orderedSame {
            return "Esto no es un seguro."
        }
        return nil
    }

    private func cameraNumbers(_ value: String) -> [String] {
        let expression = try! NSRegularExpression(pattern: #"\d+(?:[.,]\d+)?"#)
        return expression.matches(in: value, range: NSRange(value.startIndex..., in: value))
            .compactMap { Range($0.range, in: value).map { String(value[$0]).replacingOccurrences(of: ",", with: ".") } }
            .sorted()
    }

    private func sendCameraLiveRequest(id: String, token: String, items: [CameraVisibleLine]) {
        let payload: [String: Any] = [
            "id": id, "token": token,
            "items": items.map { ["text": $0.source] }
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("void window.__hablaCameraLiveRequest?.(\(json))") { [weak self] _, error in
            guard let self, let error, self.cameraRequestID == id,
                  self.cameraPreviewInFlight == token else { return }
            self.cameraPreviewInFlight = nil
            self.cameraOverlayLabel?.text = "Translation unavailable. Show original, then retry."
            for item in items { self.cameraFailedLines.insert(item.source) }
            self.queueCameraLivePreview()
            _ = error
        }
    }

    private func applyCameraTranslations(_ translated: [[String: String]]) {
            for item in translated {
                guard let source = item["source"] else { continue }
                if let translation = item["translation"], !translation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    if cameraTranslatedLines.count >= 240 { cameraTranslatedLines.removeAll(keepingCapacity: true) }
                    cameraTranslatedLines[source] = translation
                } else if item["error"] != nil {
                    cameraFailedLines.insert(source)
                }
            }
        refreshCameraSpatialLabels()
    }

    private func receiveCameraLiveResult(_ payload: [String: Any]) {
        guard cameraLiveEnabled, let id = payload["id"] as? String,
              id == cameraRequestID, let token = payload["token"] as? String,
              token == cameraPreviewInFlight else { return }
        cameraPreviewInFlight = nil
        
        if let translated = payload["translations"] as? [[String: String]] { applyCameraTranslations(translated) }
        refreshCameraSpatialLabels()
        if let error = payload["error"] as? String {
            cameraLastError = error
            for line in cameraVisibleLines { cameraFailedLines.insert(line.source) }
            cameraOverlayLabel?.text = error
            return
        }
        updateCameraCoverageStatus()
        // Continue with new lines in small batches; do not retry provider failures
        // indefinitely. Late results are bound to the original scan token.
        queueCameraLivePreview()
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
        // In live mode a tap must not dismiss the AR viewfinder.
        guard !cameraLiveEnabled else { return }
        guard case .text(let recognized) = item else { return }
        let text = recognized.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        completeCameraScan(status: "ok", text: text)
    }

    func dataScanner(_ scanner: DataScannerViewController,
                     becameUnavailableWithError error: DataScannerViewController.ScanningUnavailable) {
        completeCameraScan(status: "error",
                           message: "Live camera scanning stopped. Check Camera permission or choose a photo.")
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
        cameraNativeTask?.cancel()
        cameraNativeTask = nil
        cameraLastError = nil
        cameraPreviewWork?.cancel()
        cameraPreviewWork = nil
        cameraPreviewInFlight = nil
        cameraLiveEnabled = false
        clearCameraSpatialLabels()
        cameraVisibleLines = []
        cameraTranslatedLines = [:]
        cameraFailedLines = []
        cameraOverlayLabel = nil
        cameraOverlayButton = nil
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
