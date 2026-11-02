import AppKit

func label(_ lines: [String], colored: Bool) -> Data {
    let image = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 1200, pixelsHigh: 850,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: image)
    (colored ? NSColor(calibratedRed: 0.12, green: 0.22, blue: 0.55, alpha: 1) : .white).setFill()
    NSRect(x: 0, y: 0, width: 1200, height: 850).fill()
    for (index, text) in lines.enumerated() {
        (text as NSString).draw(at: NSPoint(x: 70, y: 650 - index * 130), withAttributes: [
            .font: NSFont.boldSystemFont(ofSize: 80),
            .foregroundColor: colored ? NSColor(calibratedRed: 1, green: 0.75, blue: 0.05, alpha: 1) : NSColor.black
        ])
    }
    NSGraphicsContext.restoreGraphicsState()
    return image.representation(using: .png, properties: [:])!
}

if CommandLine.arguments.count > 1 {
    let result = try NativeImageOCR.recognize(Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))
    print(result["text"] as! String)
    print("Recognition confidence:", result["confidence"]!)
} else {
    let english = try NativeImageOCR.recognize(label(["CHICKEN", "SOUP BASE", "Product of Canada"], colored: true))
    let text = (english["text"] as! String).uppercased()
    precondition(text.contains("CHICKEN") && text.contains("SOUP BASE"), "Colored label failed: \(text)")
    let spanish = try NativeImageOCR.recognize(label(["BASE PARA", "SOPA DE POLLO"], colored: false))
    precondition((spanish["text"] as! String).uppercased().contains("SOPA DE POLLO"))
    let unreadable: [[String]] = [[], ["| | |", "---"]]
    for lines in unreadable {
        var rejected = false
        do { _ = try NativeImageOCR.recognize(label(lines, colored: false)) }
        catch { rejected = true }
        precondition(rejected, "Unreadable image must not produce a translation source")
    }
    print("Vision OCR passed: English colored label, Spanish label, blank image and symbol fragments.")
}
