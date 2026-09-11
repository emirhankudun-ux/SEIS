#if os(macOS)
import AppKit
import Foundation
import SeisPlatformKit
import SwiftUI
import Testing
@testable import SeisAppleNativeShell

/// Off-screen rendering of the actual view, using synthetic records only.
/// This is not a screenshot of a user's desktop or an interactive GUI test.
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
                    .background(scheme == .dark ? Color.black : Color.white)
                    .environment(\.colorScheme, scheme)
                let renderer = ImageRenderer(content: view)
                renderer.scale = 1
                let image = try #require(renderer.cgImage)
                #expect(image.width == 660)
                #expect(image.height == 640)
                if let directory = ProcessInfo.processInfo.environment["MARIA_UI_EVIDENCE_DIR"] {
                    let destination = URL(fileURLWithPath: directory, isDirectory: true)
                    try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)
                    let png = try #require(NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]))
                    try png.write(to: destination.appendingPathComponent("recovery-\(name)-\(appearance).png"))
                }
            }
        }
    }
}
#endif
