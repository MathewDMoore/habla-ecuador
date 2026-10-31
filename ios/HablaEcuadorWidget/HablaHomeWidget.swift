import SwiftUI
import WidgetKit

// Habla Ecuador's original visual identity, translated into a native widget:
// turquoise Andean sky, rising sun, mountain peaks, tropical leaf and the
// yellow-blue-red Ecuadorian flag. No new logo or remote graphics.
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
        GeometryReader { bounds in
            let w = bounds.size.width
            let h = bounds.size.height
            ZStack {
                LinearGradient(colors: [HablaPalette.sky, HablaPalette.mint],
                               startPoint: .top, endPoint: .bottom)
                Circle()
                    .fill(HablaPalette.yellow)
                    .frame(width: w * 0.33, height: h * 0.33)
                    .position(x: w * 0.29, y: h * 0.26)
                Path { p in
                    p.move(to: CGPoint(x: 0, y: h * 0.72))
                    p.addLine(to: CGPoint(x: w * 0.39, y: h * 0.21))
                    p.addLine(to: CGPoint(x: w * 0.56, y: h * 0.49))
                    p.addLine(to: CGPoint(x: w * 0.76, y: h * 0.19))
                    p.addLine(to: CGPoint(x: w, y: h * 0.70))
                    p.addLine(to: CGPoint(x: w, y: h))
                    p.addLine(to: CGPoint(x: 0, y: h))
                    p.closeSubpath()
                }.fill(Color(red: 0.96, green: 0.97, blue: 0.92))
                Path { p in
                    p.move(to: CGPoint(x: 0, y: h * 0.79))
                    p.addQuadCurve(to: CGPoint(x: w, y: h * 0.79),
                                   control: CGPoint(x: w * 0.48, y: h * 0.48))
                    p.addLine(to: CGPoint(x: w, y: h))
                    p.addLine(to: CGPoint(x: 0, y: h))
                    p.closeSubpath()
                }.fill(Color(red: 0.16, green: 0.50, blue: 0.43))
                // The leaf stays simple so it remains legible at widget size.
                Image(systemName: "leaf.fill")
                    .font(.system(size: w * 0.32, weight: .black))
                    .foregroundStyle(HablaPalette.forest)
                    .rotationEffect(.degrees(-35))
                    .position(x: w * 0.79, y: h * 0.57)
                VStack(spacing: 0) {
                    HablaPalette.yellow
                    HablaPalette.blue
                    HablaPalette.red
                }
                .frame(height: h * 0.22)
                .frame(maxHeight: .infinity, alignment: .bottom)
            }
            .frame(width: w, height: h)
            .clipped()
            .clipShape(RoundedRectangle(cornerRadius: w * 0.23, style: .continuous))
        }
        .accessibilityHidden(true)
    }
}

private enum HablaDestination: String {
    case translate, practice, dictionary

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
            VStack(spacing: 9) {
                shortcut("Translate", symbol: "arrow.left.arrow.right", to: .translate)
                shortcut("Practice", symbol: "mic.fill", to: .practice)
                shortcut("Dictionary", symbol: "book.closed.fill", to: .dictionary)
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
            .frame(height: 34)
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
