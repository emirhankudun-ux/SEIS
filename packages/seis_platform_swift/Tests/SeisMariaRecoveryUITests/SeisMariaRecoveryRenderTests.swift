#if os(macOS)
import AppKit
import Foundation
import SeisPlatformKit
import SwiftUI
import Testing
@testable import SeisAppleNativeShell

/// Renders the actual view through AppKit using synthetic records only.
/// ImageRenderer omits native buttons/lists, so it is not sufficient evidence.
/// These are view bitmaps, not captures of the user's desktop or interactive tests.
@MainActor
struct SeisMariaRecoveryRenderTests {
    @Test func renderEmptyLoadedAndInvalidStatesInBothAppearances() throws {
        _ = NSApplication.shared
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        let fixtureData = try Data(contentsOf: root.appendingPathComponent("test/fixtures/maria-recovery-swift-v1.json"))
        let fixture = try #require(JSONSerialization.jsonObject(with: fixtureData) as? [String: Any])
        let snapshot = try SeisMariaRecoveryDecoder.decode(Data(try #require(fixture["wire"] as? String).utf8))
        var loaded = SeisMariaRecoveryImportState()
        let token = loaded.beginImport()
        loaded.finishImport(token: token, result: .success(snapshot))
        var invalid = SeisMariaRecoveryImportState()
        let invalidToken = invalid.beginImport()
        invalid.finishImport(token: invalidToken, result: .failure(.invalidJSON))
        let states = [("unloaded", SeisMariaRecoveryImportState()), ("loaded", loaded), ("invalid", invalid)]
        for (name, state) in states {
            for (appearance, scheme) in [("light", ColorScheme.light), ("dark", ColorScheme.dark)] {
                let view = SeisMariaRecoveryView(initialState: state)
                    .frame(width: 660, height: 640)
                    .environment(\.colorScheme, scheme)
                let bounds = NSRect(x: 0, y: 0, width: 660, height: 640)
                let host = NSHostingView(rootView: view)
                let window = NSWindow(contentRect: bounds, styleMask: [.borderless], backing: .buffered, defer: false)
                window.isReleasedWhenClosed = false
                window.appearance = NSAppearance(named: scheme == .dark ? .darkAqua : .aqua)
                window.contentView = host
                host.frame = bounds
                window.orderFront(nil)
                defer { window.orderOut(nil); window.close() }
                RunLoop.main.run(until: Date().addingTimeInterval(0.15))
                host.layoutSubtreeIfNeeded()
                window.displayIfNeeded()
                let bitmap = try #require(host.bitmapImageRepForCachingDisplay(in: host.bounds))
                host.cacheDisplay(in: host.bounds, to: bitmap)
                #expect(bitmap.pixelsWide >= 660)
                #expect(bitmap.pixelsHigh >= 640)
                try rejectUnsupportedRenderPlaceholder(bitmap)
                if let directory = ProcessInfo.processInfo.environment["MARIA_UI_EVIDENCE_DIR"] {
                    let destination = URL(fileURLWithPath: directory, isDirectory: true)
                    try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)
                    let png = try #require(bitmap.representation(using: .png, properties: [:]))
                    try png.write(to: destination.appendingPathComponent("recovery-\(name)-\(appearance).png"))
                }
            }
        }
    }

    private func rejectUnsupportedRenderPlaceholder(_ bitmap: NSBitmapImageRep) throws {
        var unsupported = 0
        var samples = 0
        for y in stride(from: 0, to: bitmap.pixelsHigh, by: 8) {
            for x in stride(from: 0, to: bitmap.pixelsWide, by: 8) {
                let color = try #require(bitmap.colorAt(x: x, y: y)?.usingColorSpace(.deviceRGB))
                if color.redComponent > 0.9 && color.greenComponent > 0.6 && color.blueComponent < 0.2 {
                    unsupported += 1
                }
                samples += 1
            }
        }
        #expect(unsupported * 200 < samples, "Native view contains an unsupported-render placeholder")
    }
}
#endif
