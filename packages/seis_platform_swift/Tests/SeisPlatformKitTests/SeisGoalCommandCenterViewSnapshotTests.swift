import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Goal Command Center View Snapshot")
struct SeisGoalCommandCenterViewSnapshotTests {
    @Test func sourceContractExposesStableMetadataOnlyCounts() throws {
        let snapshot = try SeisGoalCommandCenterViewSnapshot.validated(from: sourceData())

        #expect(snapshot.id == "seis-goal-command-center-view")
        #expect(snapshot.viewID == snapshot.id)
        #expect(snapshot.finalState == "blocked_by_repository_hygiene")
        #expect(snapshot.totalGoalCount == 20)
        #expect(snapshot.activeGoalCount == 5)
        #expect(snapshot.blockedGoalCount == 3)
        #expect(snapshot.plannedGoalCount == 12)
        #expect(snapshot.progressCardCount == 20)
        #expect(snapshot.panelCount == 24)
        #expect(snapshot.uxGuardCount == 4)
        #expect(snapshot.sourceRecordCount == 12)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.validationIssues.isEmpty)
    }

    @Test func sourceContractRoundTripsThroughCodable() throws {
        let snapshot = try SeisGoalCommandCenterViewSnapshot.validated(from: sourceData())
        let encoded = try JSONEncoder().encode(snapshot)
        let decoded = try JSONDecoder().decode(SeisGoalCommandCenterViewSnapshot.self, from: encoded)

        #expect(decoded == snapshot)
        #expect(decoded.validationIssues.isEmpty)
        #expect(decoded.isMetadataOnly)
    }

    @Test func invalidCountsAndLiveModeAreRejected() throws {
        var object = try JSONSerialization.jsonObject(with: sourceData()) as! [String: Any]
        var summary = object["summary"] as! [String: Any]
        summary["totalGoals"] = 19
        object["summary"] = summary
        object["mode"] = "live_llm_command_center"
        let invalidData = try JSONSerialization.data(withJSONObject: object)

        let decoded = try JSONDecoder().decode(SeisGoalCommandCenterViewSnapshot.self, from: invalidData)
        #expect(!decoded.isMetadataOnly)
        #expect(decoded.validationIssues.count >= 2)
        #expect(throws: SeisGoalCommandCenterViewSnapshotError.self) {
            try SeisGoalCommandCenterViewSnapshot.validated(from: invalidData)
        }
    }

    private func sourceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-goal-command-center-view.json"))
    }
}
