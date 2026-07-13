import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Plugin Interface Roadmap Snapshot")
struct SeisPluginInterfaceRoadmapSnapshotTests {
    @Test func sourceContractExposesFiveLanesAndFiveYearCadence() throws {
        let snapshot = try SeisPluginInterfaceRoadmapSnapshot.validated(from: sourceData())

        #expect(snapshot.interfaceCount == 5)
        #expect(snapshot.yearCount == 5)
        #expect(snapshot.laneYearCommitmentCount == 25)
        #expect(snapshot.cadenceLoopCount == 10)
        #expect(snapshot.readinessGateCount == 5)
        #expect(snapshot.liveActionCount == 0)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.validationIssues.isEmpty)
    }

    @Test func liveActionBoundaryAndLaneIdentityAreRejected() throws {
        var object = try JSONSerialization.jsonObject(with: sourceData()) as! [String: Any]
        var signals = object["maturitySignals"] as! [String: Any]
        var markers = signals["markers"] as! [[String: Any]]
        markers[3]["value"] = "1"
        signals["markers"] = markers
        object["maturitySignals"] = signals
        var interfaces = object["interfaces"] as! [[String: Any]]
        interfaces[0]["handle"] = "@unreviewed"
        object["interfaces"] = interfaces
        let invalidData = try JSONSerialization.data(withJSONObject: object)

        let decoded = try JSONDecoder().decode(SeisPluginInterfaceRoadmapSnapshot.self, from: invalidData)
        #expect(!decoded.isMetadataOnly)
        #expect(decoded.validationIssues.count >= 2)
        #expect(throws: SeisPluginInterfaceRoadmapSnapshotError.self) {
            try SeisPluginInterfaceRoadmapSnapshot.validated(from: invalidData)
        }
    }

    private func sourceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent(SeisPluginInterfaceRoadmapSnapshot.sourcePath))
    }
}
