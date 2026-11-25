import UIKit
import UniformTypeIdentifiers

/// Accepts YouTube links supplied by another app without trying to launch
/// the containing app (not supported for ordinary iOS Share extensions).
/// The containing app consumes the App Group inbox on its next activation.
final class HablaShareViewController: UIViewController {
    private let groupID = "group.com.mathewdmoore.hablaecuador"
    private let inboxKey = "pendingYouTubeURLs"
    private let message = UILabel()
    private let dismissButton = UIButton(type: .system)
    private var saved = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        let title = UILabel()
        title.text = "Habla Ecuador · YouTube"
        title.font = .preferredFont(forTextStyle: .title2)
        title.textAlignment = .center
        title.numberOfLines = 0
        message.text = "Reading the shared YouTube link…"
        message.textAlignment = .center
        message.numberOfLines = 0
        message.font = .preferredFont(forTextStyle: .body)

        dismissButton.setTitle("Cancel", for: .normal)
        dismissButton.addTarget(self, action: #selector(close), for: .touchUpInside)
        let stack = UIStackView(arrangedSubviews: [title, message, dismissButton])
        stack.axis = .vertical
        stack.spacing = 22
        stack.alignment = .fill
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24)
        ])
        acceptSharedLink()
    }

    @objc private func close() {
        if saved {
            extensionContext?.completeRequest(returningItems: nil)
        } else {
            extensionContext?.cancelRequest(withError: NSError(
                domain: "HablaShare", code: 1,
                userInfo: [NSLocalizedDescriptionKey: "No YouTube video was saved."]))
        }
    }

    private func acceptSharedLink() {
        let providers = (extensionContext?.inputItems as? [NSExtensionItem] ?? [])
            .flatMap { $0.attachments ?? [] }
        guard let provider = providers.first(where: {
            $0.hasItemConformingToTypeIdentifier(UTType.url.identifier)
            || $0.hasItemConformingToTypeIdentifier(UTType.plainText.identifier)
        }) else {
            display("No link was provided. Share a YouTube video link and try again.")
            return
        }
        let type = provider.hasItemConformingToTypeIdentifier(UTType.url.identifier)
            ? UTType.url.identifier : UTType.plainText.identifier
        provider.loadItem(forTypeIdentifier: type, options: nil) { [weak self] item, error in
            guard let self else { return }
            let text: String?
            if let url = item as? URL { text = url.absoluteString }
            else if let url = item as? NSURL { text = url.absoluteString }
            else if let string = item as? String { text = string }
            else if let data = item as? Data { text = String(data: data, encoding: .utf8) }
            else { text = nil }
            DispatchQueue.main.async {
                guard error == nil, let text, let url = self.youtubeVideoURL(in: text) else {
                    self.display("That share does not contain a valid YouTube video link.")
                    return
                }
                self.save(url)
            }
        }
    }

    private func youtubeVideoURL(in text: String) -> URL? {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        var candidates: [URL] = []
        if let url = URL(string: trimmed) { candidates.append(url) }
        if let detector = try? NSDataDetector(types: NSTextCheckingResult.CheckingType.link.rawValue) {
            let range = NSRange(trimmed.startIndex..<trimmed.endIndex, in: trimmed)
            candidates += detector.matches(in: trimmed, options: [], range: range).compactMap { $0.url }
        }
        for url in candidates where url.scheme?.lowercased() == "https" {
            let host = (url.host ?? "").lowercased()
            let parts = url.pathComponents.filter { $0 != "/" }
            var id: String?
            if host == "youtu.be" {
                id = parts.first
            } else if ["youtube.com", "www.youtube.com", "m.youtube.com",
                       "music.youtube.com", "www.youtube-nocookie.com"].contains(host) {
                if parts.first == "watch" {
                    id = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                        .queryItems?.first(where: { $0.name == "v" })?.value
                } else if ["shorts", "live", "embed", "v"].contains(parts.first ?? "") {
                    id = parts.count > 1 ? parts[1] : nil
                }
            }
            if let id, id.range(of: #"^[A-Za-z0-9_-]{11}$"#, options: .regularExpression) != nil {
                return url
            }
        }
        return nil
    }

    private func save(_ url: URL) {
        guard let defaults = UserDefaults(suiteName: groupID) else {
            display("Habla's shared inbox is unavailable. Enable the App Groups capability for both targets.")
            return
        }
        var links = defaults.stringArray(forKey: inboxKey) ?? []
        links.removeAll(where: { $0 == url.absoluteString })
        links.append(url.absoluteString)
        defaults.set(Array(links.suffix(20)), forKey: inboxKey)
        saved = true
        display("Saved to Habla! Open Habla Ecuador to play this video in Music.")
        dismissButton.setTitle("Done", for: .normal)
    }

    private func display(_ text: String) {
        message.text = text
    }
}
