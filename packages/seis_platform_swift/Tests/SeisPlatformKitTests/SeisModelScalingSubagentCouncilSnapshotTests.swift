import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Model Scaling Sub-Agent Council Snapshot")
struct SeisModelScalingSubagentCouncilSnapshotTests {
    @Test func canonicalCouncilIsPlanOnlyAndFullyBounded() throws {
        let snapshot = try SeisModelScalingSubagentCouncilSnapshot.validated(from: councilData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.agents.count == 12)
        #expect(snapshot.stageAssignments.count == 5)
        #expect(snapshot.apex512bCouncilDuties.count == 12)
        #expect(snapshot.agents.allSatisfy { $0.authority == "plan-only" })
        #expect(snapshot.stageAssignments.allSatisfy { !$0.routeEligibleToday })
        #expect(snapshot.coreCredentialRequirement == "none")
    }

    @Test func stageAssignmentRejectsRouteEligibility() {
        let stage = SeisModelScalingStageAssignment(
            stage: "20B",
            status: "planned",
            leadAgents: ["architect-agent"],
            requiredBeforePromotion: ["evidence"],
            routeEligibleToday: true
        )

        #expect(stage.validationIssues.contains { $0.contains("route eligible") })
    }

    private func councilData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-model-scaling-subagent-council.json"))
    }
}
