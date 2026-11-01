import SwiftUI
import WidgetKit

// Shared artwork from the approved About-screen design.
private enum HablaPalette {
    static let forest = Color(red: 0.09, green: 0.25, blue: 0.21)
    static let mint = Color(red: 0.74, green: 0.91, blue: 0.82)
    static let sky = Color(red: 0.29, green: 0.73, blue: 0.68)
    static let yellow = Color(red: 0.97, green: 0.85, blue: 0.27)
    static let blue = Color(red: 0.14, green: 0.36, blue: 0.67)
    static let red = Color(red: 0.87, green: 0.24, blue: 0.29)
}

private struct HablaLandscape: View {
    var body: some View {
        Image("HablaBrand")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            .accessibilityHidden(true)
    }
}

private enum HablaDestination: String {
    case translate, practice, dictionary, tutorial

    var url: URL {
        URL(string: "hablaecuador://\(rawValue)")!
    }
}

struct HablaWidgetEntry: TimelineEntry {
    let date: Date
}

struct HablaWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> HablaWidgetEntry {
        HablaWidgetEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (HablaWidgetEntry) -> Void) {
        completion(HablaWidgetEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HablaWidgetEntry>) -> Void) {
        // No invented word-of-the-day feed, microphone access, or background
        // network calls. This first release is a stable useful launch surface.
        completion(Timeline(entries: [HablaWidgetEntry(date: Date())], policy: .never))
    }
}

struct HablaHomeWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: HablaWidgetEntry

    var body: some View {
        Group {
            if family == .systemMedium {
                medium
            } else {
                small
            }
        }
        .foregroundStyle(.white)
        .widgetURL(HablaDestination.translate.url)
        .modifier(HablaWidgetBackground())
    }

    private var header: some View {
        HStack(spacing: 8) {
            HablaLandscape()
                .frame(width: 43, height: 43)
            VStack(alignment: .leading, spacing: 1) {
                Text("Habla Ecuador 🇪🇨")
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .lineLimit(1)
                    .minimumScaleFactor(0.76)
                Text("ESPAÑOL • ENGLISH")
                    .font(.system(size: 9, weight: .semibold, design: .rounded))
                    .tracking(0.8)
                    .foregroundStyle(HablaPalette.mint)
            }
        }
    }

    private var phrase: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("¿Cómo estás?")
                .font(.system(size: 19, weight: .bold, design: .rounded))
                .minimumScaleFactor(0.8)
                .lineLimit(1)
            Text("How are you?")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(HablaPalette.mint)
                .lineLimit(1)
        }
    }

    private var small: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            Spacer(minLength: 6)
            phrase
            Spacer(minLength: 4)
            HStack(spacing: 5) {
                Image(systemName: "arrow.left.arrow.right")
                Text("Translate / Traducir")
            }
            .font(.system(size: 10, weight: .bold))
            .foregroundStyle(HablaPalette.yellow)
        }
        .padding(13)
    }

    private var medium: some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 0) {
                header
                Spacer(minLength: 8)
                phrase
                Spacer(minLength: 5)
                Text("Language · Culture · Connection")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(HablaPalette.mint)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            Spacer(minLength: 0)
            VStack(spacing: 5) {
                shortcut("Translate", symbol: "arrow.left.arrow.right", to: .translate)
                shortcut("Practice", symbol: "mic.fill", to: .practice)
                shortcut("Dictionary", symbol: "book.closed.fill", to: .dictionary)
                shortcut("Tutorial", symbol: "questionmark.circle.fill", to: .tutorial)
            }
            .frame(width: 112)
        }
        .padding(14)
    }

    private func shortcut(_ title: String, symbol: String, to destination: HablaDestination) -> some View {
        Link(destination: destination.url) {
            HStack(spacing: 6) {
                Image(systemName: symbol)
                    .frame(width: 14)
                Text(title)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Spacer(minLength: 0)
            }
            .font(.system(size: 11, weight: .semibold))
            .padding(.horizontal, 9)
            .frame(height: 29)
            .background(.white.opacity(0.14), in: RoundedRectangle(cornerRadius: 9))
        }
        .buttonStyle(.plain)
    }
}

private struct HablaWidgetBackground: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(HablaPalette.forest, for: .widget)
        } else {
            content.background(HablaPalette.forest)
        }
    }
}

@main
struct HablaHomeWidget: Widget {
    let kind = "com.mathewdmoore.HablaEcuador.home"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HablaWidgetProvider()) { entry in
            HablaHomeWidgetView(entry: entry)
        }
        .configurationDisplayName("Habla Ecuador 🇪🇨")
        .description("Ecuadorian Spanish, English and quick access to learning.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
