import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Sub-Agent Operating Model Snapshot")
struct SeisAISubagentOperatingModelSnapshotTests {
    @Test func canonicalOperatingModelIsPlanOnly() throws {
        let snapshot = try SeisAISubagentOperatingModelSnapshot.validated(from: operatingModelData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.permissionMatrix.count == 5)
        #expect(snapshot.lanes.count == 5)
        #expect(snapshot.fiveYearRoadmap.count == 5)
        #expect(snapshot.evidenceRequirements.count == 14)
        #expect(snapshot.runtimeBoundary.currentLevel == "status-and-plan-only")
        #expect(snapshot.lanes.allSatisfy { $0.currentPermissionLevel == "plan-only" })
        #expect(snapshot.permissionMatrix.first { $0.level == "write-gated" }?.status == "planned")
        #expect(snapshot.permissionMatrix.first { $0.level == "forbidden" }?.status == "active")
        #expect(snapshot.cadence.isComplete)
    }

    @Test func unsafeOperatingModelRejectsNonPlanLane() {
        let lane = SeisAISubagentLaneOperatingBinding(
            id: "seis",
            displayName: "SEIS",
            subAgentRole: "test",
            statusTool: "status",
            planTool: "plan",
            currentPermissionLevel: "write-gated",
            sourceMirror: "plugins/seis",
            skillPath: "skill",
            qualityGate: "check",
            fiveYearDuty: "test"
        )
        #expect(lane.validationIssues.contains { $0.contains("must remain plan-only") })
    }

    @Test func approvalRequiredBooleanDecodesAsStableLabel() throws {
        let data = Data(#"{"level":"read-only","status":"enabled","allowedActions":["inspect"],"approvalRequired":false,"evidenceRequired":["path"]}"#.utf8)
        let permission = try JSONDecoder().decode(SeisAISubagentPermissionLevel.self, from: data)

        #expect(permission.approvalRequired == "not-required")
        #expect(permission.validationIssues.isEmpty)
    }

    private func operatingModelData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-subagent-operating-model.json"))
    }
}
