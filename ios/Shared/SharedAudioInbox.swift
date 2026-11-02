import Foundation
import UniformTypeIdentifiers

// Compiled into both targets; publish a completed directory with one atomic move.
enum SharedAudioInbox {
    static let maximumBytes = 50 * 1024 * 1024
    static let extensions: Set<String> = ["m4a", "mp3", "wav", "aac", "opus", "ogg", "oga", "aif", "aiff", "caf"]
    struct Note: Codable {
        let id: String
        let name: String
        let file: String
        let type: String
        let created: Date
    }
    enum ImportError: LocalizedError {
        case unavailable, unsupported, size, full
        var errorDescription: String? {
            switch self {
            case .unavailable: return "Shared audio storage is unavailable. Enable the same App Group for Habla Ecuador and its Share extension."
            case .unsupported: return "Share an audio file, such as a WhatsApp voice note."
            case .size: return "Choose an audio file between 1 byte and 50 MB."
            case .full: return "The voice-note inbox is full. Open Habla and delete saved notes before sharing more."
            }
        }
    }
    static func directory() throws -> URL {
        guard let group = Bundle.main.object(forInfoDictionaryKey: "HablaAppGroup") as? String,
              let root = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: group) else {
            throw ImportError.unavailable
        }
        let url = root.appendingPathComponent("SharedAudio", isDirectory: true)
        try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
        return url
    }
    static func notes() throws -> [Note] {
        let root = try directory()
        return try FileManager.default.contentsOfDirectory(at: root, includingPropertiesForKeys: nil)
            .filter { !$0.lastPathComponent.hasPrefix(".") }
            .compactMap { try? JSONDecoder().decode(Note.self, from: Data(contentsOf: $0.appendingPathComponent("note.json"))) }
            .sorted { $0.created < $1.created }
    }
    static func fileURL(_ note: Note) throws -> URL {
        // Metadata is local, but never trust it to supply a path outside the inbox.
        guard UUID(uuidString: note.id) != nil, note.file == URL(fileURLWithPath: note.file).lastPathComponent else {
            throw ImportError.unsupported
        }
        return try directory().appendingPathComponent(note.id).appendingPathComponent(note.file)
    }
    static func save(_ source: URL, name: String? = nil, typeIdentifier: String? = nil) throws {
        let suppliedExtension = source.pathExtension.lowercased()
        let namedExtension = name.map { URL(fileURLWithPath: $0).pathExtension.lowercased() } ?? ""
        let ext = extensions.contains(suppliedExtension) ? suppliedExtension : namedExtension
        let declaredType = typeIdentifier.flatMap { UTType($0) }
        let type = declaredType?.conforms(to: .audio) == true ? declaredType : UTType(filenameExtension: ext)
        guard extensions.contains(ext) || type?.conforms(to: .audio) == true else { throw ImportError.unsupported }
        let size = try source.resourceValues(forKeys: [.fileSizeKey, .isRegularFileKey])
        guard size.isRegularFile == true, let bytes = size.fileSize, bytes > 0, bytes <= maximumBytes else { throw ImportError.size }
        let existing = try notes()
        let total = existing.reduce(0) { sum, note in
            sum + ((try? fileURL(note).resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0)
        }
        guard existing.count < 20, total + bytes <= 200 * 1024 * 1024 else { throw ImportError.full }
        let root = try directory(), id = UUID().uuidString
        let staging = root.appendingPathComponent(".\(id)", isDirectory: true)
        try FileManager.default.createDirectory(at: staging, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: staging) }
        let suffix = extensions.contains(ext) ? ext : (type?.preferredFilenameExtension ?? "m4a")
        let file = "audio.\(suffix)"
        try FileManager.default.copyItem(at: source, to: staging.appendingPathComponent(file))
        let note = Note(id: id, name: URL(fileURLWithPath: name ?? source.lastPathComponent).lastPathComponent,
                        file: file, type: type?.preferredMIMEType ?? "audio/\(suffix)", created: Date())
        try JSONEncoder().encode(note).write(to: staging.appendingPathComponent("note.json"), options: .atomic)
        try FileManager.default.moveItem(at: staging, to: root.appendingPathComponent(id))
    }
    static func remove(_ note: Note) throws {
        let file = try fileURL(note)
        try FileManager.default.removeItem(at: file.deletingLastPathComponent())
    }
}
