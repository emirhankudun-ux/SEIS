import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Agent Lane Status Snapshot")
struct SeisAgentLaneStatusSnapshotTests {
    @Test func canonicalLanesAreObservableMetadata() throws {
        let snapshot = try SeisAgentLaneStatusSnapshot.validated(from: laneData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.activeLaneCount == 14)
        #expect(snapshot.personalLaneCount == 5)
        #expect(snapshot.lanes.count == 14)
    }

    @Test func personalLanesKeepDeclaredBoundaries() throws {
        let snapshot = try SeisAgentLaneStatusSnapshot.validated(from: laneData())
        let personalIDs = Set(["seis-hub", "seis-cloud", "seis-code", "seis-design", "seis-data"])
        let personalLanes = snapshot.lanes.filter { personalIDs.contains($0.id) }

        #expect(personalLanes.count == 5)
        #expect(personalLanes.allSatisfy(\.isComplete))
        #expect(personalLanes.allSatisfy { $0.safetyBoundary.localizedCaseInsensitiveContains("approval") || $0.safetyBoundary.localizedCaseInsensitiveContains("mutation") })
    }

    private func laneData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agent-lane-status.json"))
    }
}
