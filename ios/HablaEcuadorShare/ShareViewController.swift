import UIKit
import UniformTypeIdentifiers

final class ShareViewController: UIViewController {
    private let status = UILabel()
    private let done = UIButton(type: .system)
    private var started = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        status.numberOfLines = 0
        status.textAlignment = .center
        status.text = "Guardando audio… / Saving audio…"
        done.setTitle("Cerrar / Done", for: .normal)
        done.addTarget(self, action: #selector(finish), for: .touchUpInside)
        done.isHidden = true
        let stack = UIStackView(arrangedSubviews: [status, done])
        stack.axis = .vertical
        stack.spacing = 24
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -24),
            stack.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        guard !started else { return }
        started = true
        let providers = (extensionContext?.inputItems as? [NSExtensionItem] ?? []).flatMap { $0.attachments ?? [] }
        // Ignore WhatsApp's accompanying text/contact URL; retain the actual file.
        func audioType(_ provider: NSItemProvider) -> String? {
            provider.registeredTypeIdentifiers.first { UTType($0)?.conforms(to: .audio) == true }
            ?? provider.registeredTypeIdentifiers.first { identifier in
                guard let type = UTType(identifier) else { return false }
                return type.conforms(to: .data) && !type.conforms(to: .text) &&
                    !type.conforms(to: .url) && !type.conforms(to: .image) && !type.conforms(to: .movie)
            }
        }
        guard let provider = providers.first(where: {
            audioType($0) != nil || $0.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier)
        }) else {
            show(SharedAudioInbox.ImportError.unsupported.localizedDescription)
            return
        }
        func save(_ url: URL?, _ error: Error?, _ type: String?) {
            do {
                guard let url else { throw error ?? SharedAudioInbox.ImportError.unsupported }
                let scoped = url.startAccessingSecurityScopedResource()
                defer { if scoped { url.stopAccessingSecurityScopedResource() } }
                // The provider's temporary file expires when this callback returns.
                try SharedAudioInbox.save(url, name: provider.suggestedName, typeIdentifier: type)
                DispatchQueue.main.async { [weak self] in self?.show("Audio guardado. Abre Habla Ecuador para escucharlo. / Audio saved. Open Habla Ecuador to listen.") }
            } catch {
                DispatchQueue.main.async { [weak self] in self?.show(error.localizedDescription) }
            }
        }
        if let type = audioType(provider) {
            provider.loadFileRepresentation(forTypeIdentifier: type) { url, error in save(url, error, type) }
        } else {
            provider.loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) { item, error in
                let url = (item as? URL) ?? (item as? Data).flatMap { URL(dataRepresentation: $0, relativeTo: nil) }
                save(url, error, nil)
            }
        }
    }
    private func show(_ message: String) {
        status.text = message
        done.isHidden = false
    }
    @objc private func finish() { extensionContext?.completeRequest(returningItems: nil) }
}
