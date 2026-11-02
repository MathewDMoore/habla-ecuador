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
                    guard url.isFileURL || url.scheme?.lowercased() == "hablaecuador" else { return }
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
    private var promptedAudio = Set<String>()
    private var audioGeneration = UUID()
    private var deliveringAudio = false

    func openWidgetRoute(_ request: WidgetLaunchRequest?) {
        if let request, request.url.isFileURL, lastWidgetRouteID != request.id {
            lastWidgetRouteID = request.id
            loadViewIfNeeded()
            let scoped = request.url.startAccessingSecurityScopedResource()
            defer { if scoped { request.url.stopAccessingSecurityScopedResource() } }
            do { try SharedAudioInbox.save(request.url); checkSharedAudio() }
            catch { showAudioError(error.localizedDescription) }
            return
        }
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
        for resource in ["NativeSpeech", "SharedAudio"] {
            if let scriptURL = Bundle.main.url(forResource: resource, withExtension: "js"),
               let script = try? String(contentsOf: scriptURL, encoding: .utf8) {
                configuration.userContentController.addUserScript(WKUserScript(
                    source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
            }
        }
        configuration.userContentController.add(WeakSpeechHandler(self), name: "hablaAudio")
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
        NotificationCenter.default.addObserver(self, selector: #selector(checkSharedAudio),
            name: UIApplication.didBecomeActiveNotification, object: nil)
        webView.load(URLRequest(url: site))
    }

    @objc private func suspendCapture() {
        speech?.abortActive()
        audioGeneration = UUID()
        deliveringAudio = false
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        checkSharedAudio()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { checkSharedAudio() }

    @objc private func checkSharedAudio() {
        guard viewIfLoaded?.window != nil, UIApplication.shared.applicationState == .active,
              !webView.isLoading, !deliveringAudio, presentedViewController == nil,
              let url = webView.url, isTrustedAppPage(url),
              let notes = try? SharedAudioInbox.notes(),
              notes.contains(where: { !promptedAudio.contains($0.id) }) else { return }
        showAudioInbox()
    }

    private func showAudioError(_ message: String) {
        let alert = UIAlertController(title: "Audio · Habla Ecuador", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showAudioInbox() {
        guard !deliveringAudio, presentedViewController == nil else { return }
        do {
            let notes = try SharedAudioInbox.notes()
            promptedAudio.formUnion(notes.map(\.id))
            let alert = UIAlertController(title: "Audios compartidos / Shared voice notes",
                message: notes.isEmpty ? "No hay audios. / No saved audio." : "Elige un audio para abrir en Traducir. / Choose audio to open in Translate.", preferredStyle: .actionSheet)
            for note in notes {
                alert.addAction(UIAlertAction(title: note.name, style: .default) { [weak self] _ in self?.deliverAudio(note) })
            }
            if !notes.isEmpty {
                alert.addAction(UIAlertAction(title: "Eliminar audios guardados / Delete saved audio", style: .destructive) { [weak self] _ in
                    guard let self else { return }
                    let confirmation = UIAlertController(title: "Delete saved voice notes?", message: "This removes audio saved in Habla. WhatsApp's original messages stay in WhatsApp.", preferredStyle: .alert)
                    confirmation.addAction(UIAlertAction(title: "Cancel", style: .cancel))
                    confirmation.addAction(UIAlertAction(title: "Delete", style: .destructive) { _ in
                        do { for note in notes { try SharedAudioInbox.remove(note) } }
                        catch { self.showAudioError(error.localizedDescription) }
                    })
                    self.present(confirmation, animated: true)
                })
            }
            alert.addAction(UIAlertAction(title: "Cerrar / Close", style: .cancel))
            alert.popoverPresentationController?.sourceView = view
            alert.popoverPresentationController?.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
            present(alert, animated: true)
        } catch { showAudioError(error.localizedDescription) }
    }

    private func deliverAudio(_ note: SharedAudioInbox.Note) {
        guard !deliveringAudio, let url = webView.url, isTrustedAppPage(url), !webView.isLoading else { return }
        do {
            let file = try SharedAudioInbox.fileURL(note)
            let handle = try FileHandle(forReadingFrom: file)
            let generation = UUID()
            audioGeneration = generation
            deliveringAudio = true
            speech?.abortActive()
            func send(_ message: [String: Any], completion: @escaping (Bool) -> Void) {
                guard let data = try? JSONSerialization.data(withJSONObject: message),
                      let json = String(data: data, encoding: .utf8) else { completion(false); return }
                guard self.audioGeneration == generation, let url = self.webView.url,
                      self.isTrustedAppPage(url) else { completion(false); return }
                webView.evaluateJavaScript("window.__hablaSharedAudio?.(\(json))") { result, error in
                    completion(error == nil && (result as? Bool) == true)
                }
            }
            func finish(_ success: Bool) {
                try? handle.close()
                guard self.audioGeneration == generation else { return }
                self.deliveringAudio = false
                if !success { self.showAudioError("Could not open audio. Reopen Habla online and try Shared voice notes again. Your saved note is retained.") }
            }
            func nextChunk() {
                guard self.audioGeneration == generation else { try? handle.close(); return }
                do {
                    if let data = try handle.read(upToCount: 192 * 1024), !data.isEmpty {
                        send(["action": "chunk", "id": note.id, "data": data.base64EncodedString()]) { ok in
                            if ok { nextChunk() } else { finish(false) }
                        }
                    } else { send(["action": "end", "id": note.id], completion: finish) }
                } catch { finish(false) }
            }
            send(["action": "begin", "id": note.id, "name": note.name, "type": note.type]) { ok in
                if ok { nextChunk() } else { finish(false) }
            }
        } catch { showAudioError(error.localizedDescription) }
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let origin = message.frameInfo.securityOrigin
        guard message.frameInfo.isMainFrame, origin.protocol == "https",
              origin.host == site.host, origin.port == 0 || origin.port == 443,
              webView.url?.path.hasPrefix("/habla-ecuador/") == true,
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        if message.name == "hablaAudio" {
            if action == "inbox" { showAudioInbox() }
            return
        }
        guard let id = body["id"] as? String else { return }
        switch action {
        case "start": speech.start(id: id, language: body["lang"] as? String ?? "es-EC", mode: body["mode"] as? String ?? "auto")
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
            audioGeneration = UUID()
            deliveringAudio = false
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
