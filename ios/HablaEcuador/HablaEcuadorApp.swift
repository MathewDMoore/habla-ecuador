import SwiftUI
import WebKit

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

final class TranslatorController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private var speech: NativeSpeechCapture!
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
        case "stop": speech.stop(id: id)
        case "abort": speech.abort(id: id)
        default: break
        }
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
