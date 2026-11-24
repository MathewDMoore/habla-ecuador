import SwiftUI
import Translation
import UniformTypeIdentifiers
import UIKit

final class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        let items = extensionContext?.inputItems.compactMap { $0 as? NSExtensionItem } ?? []
        let host = UIHostingController(rootView: SharedTranslation(providers: items.flatMap { $0.attachments ?? [] }) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil)
        })
        addChild(host)
        host.view.frame = view.bounds
        host.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(host.view)
        host.didMove(toParent: self)
    }
}

private struct SharedTranslation: View {
    let providers: [NSItemProvider]
    let done: () -> Void
    @State private var input = ""
    @State private var message = ""
    @State private var presenting = false

    var body: some View {
        NavigationStack {
            Form {
                if !message.isEmpty { Text(message) }
                Section("Text to translate") {
                    TextEditor(text: $input).frame(minHeight: 100)
                    Button("Translate") { presenting = true }
                        .disabled(input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .navigationTitle("Habla Ecuador")
            .toolbar { Button("Done", action: done) }
        }
        .translationPresentation(isPresented: $presenting, text: input)
        .task { await readShare() }
    }

    @MainActor private func readShare() async {
        for type in [UTType.url, .plainText] {
            for provider in providers where provider.hasItemConformingToTypeIdentifier(type.identifier) {
                guard let item = try? await provider.loadItem(forTypeIdentifier: type.identifier, options: nil) else { continue }
                let value = (item as? URL)?.absoluteString ?? (item as? String) ?? ""
                guard !value.isEmpty else { continue }
                if let url = URL(string: value), ["http", "https"].contains(url.scheme?.lowercased() ?? "") {
                    await readLink(url)
                } else if input.isEmpty {
                    input = value
                }
                return
            }
        }
        message = "Enter a phrase to translate."
    }

    @MainActor private func readLink(_ url: URL) async {
        message = "Paste a lyric or phrase to translate."
        guard url.host?.lowercased() == "open.spotify.com",
              let track = url.pathComponents.last,
              track.range(of: "^[a-zA-Z0-9]{22}$", options: .regularExpression) != nil,
              url.pathComponents.dropLast().last == "track" else { return }
        var endpoint = URLComponents()
        endpoint.scheme = "https"
        endpoint.host = "open.spotify.com"
        endpoint.path = "/oembed"
        endpoint.queryItems = [URLQueryItem(name: "url", value: "https://open.spotify.com/track/" + track)]
        guard let requestURL = endpoint.url else { return }
        struct Track: Decodable { let title: String }
        do {
            let (data, response) = try await URLSession.shared.data(from: requestURL)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else { return }
            let title = try JSONDecoder().decode(Track.self, from: data).title
            if input.isEmpty { input = title }
            message = "Translate the track title or enter a lyric excerpt."
        } catch {
            message = "The track title is unavailable. Enter a lyric or phrase to translate."
        }
    }
}
