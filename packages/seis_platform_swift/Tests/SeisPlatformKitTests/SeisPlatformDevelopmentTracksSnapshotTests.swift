import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Platform Development Tracks Snapshot")
struct SeisPlatformDevelopmentTracksSnapshotTests {
    @Test func appleContinuationAndWindowsPolyglotTracksRemainExplicit() throws {
        let snapshot = try SeisPlatformDevelopmentTracksSnapshot.validated(from: tracksData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.trackCount == 4)
        #expect(snapshot.summary.appleTrackCount == 1)
        #expect(snapshot.summary.windowsTrackCount == 2)
        #expect(snapshot.summary.windowsLanguageCoverageCount == 41)
        #expect(snapshot.uniqueQualityGateCount == 31)
    }

    @Test func platformBoundariesDoNotMixAppleOnlySurfacesIntoWindows() throws {
        let snapshot = try SeisPlatformDevelopmentTracksSnapshot.validated(from: tracksData())
        let appleOnly = Set(["AppleScript", "Objective-C", "Playground", "Swift", "SwiftUI"])
        let windows = snapshot.tracks.filter { $0.lane.hasPrefix("windows_") }

        #expect(Set(snapshot.platformBoundaries.appleOnlyLanguageSurfaces) == appleOnly)
        #expect(windows.allSatisfy { Set($0.forbiddenLanguages) == appleOnly })
        #expect(snapshot.platformBoundaries.javascriptPolicy.contains("compatibility_only"))
    }

    private func tracksData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-platform-development-tracks.json"))
    }
}
