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
            for (appearanceName, appearance) in [("light", NSAppearance.Name.aqua), ("dark", NSAppearance.Name.darkAqua)] {
                let view = SeisMariaRecoveryView(initialState: state)
                    .frame(width: 660, height: 640)
                let bitmap = try render(view, appearance: appearance)
                if let directory = ProcessInfo.processInfo.environment["MARIA_UI_EVIDENCE_DIR"] {
                    let destination = URL(fileURLWithPath: directory, isDirectory: true)
                    try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)
                    let png = try #require(bitmap.representation(using: .png, properties: [:]))
                    try png.write(to: destination.appendingPathComponent("recovery-\(name)-\(appearanceName).png"))
                }
            }
        }
    }

    private func render<V: View>(_ view: V, appearance: NSAppearance.Name) throws -> NSBitmapImageRep {
        let hosting = NSHostingView(rootView: view)
        hosting.frame = NSRect(x: 0, y: 0, width: 660, height: 640)
        hosting.appearance = NSAppearance(named: appearance)
        hosting.layoutSubtreeIfNeeded()
        let bitmap = try #require(hosting.bitmapImageRepForCachingDisplay(in: hosting.bounds))
        hosting.cacheDisplay(in: hosting.bounds, to: bitmap)
        #expect(bitmap.pixelsWide > 0)
        #expect(bitmap.pixelsHigh > 0)
        return bitmap
    }
}
#endif
