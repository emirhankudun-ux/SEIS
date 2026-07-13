import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Model Planning Evidence")
struct SeisAIModelPlanningEvidenceSnapshotTests {
    @Test func canonicalModelPlanningEvidenceIsPlanOnly() throws {
        let snapshot = try SeisAIModelPlanningEvidenceSnapshot.validated(from: planningData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.records.count == 6)
        #expect(snapshot.agiClaimIsBlocked)
        #expect(snapshot.localDemoIsAllowed)
        #expect(snapshot.records.contains { $0.id == "seis-150b-frontier-model-program" && $0.trainingStatus == "not-started" })
        #expect(snapshot.records.contains { $0.id == "seis-512b-apex-model-program" && $0.runtimeAuthority == false })
        #expect(snapshot.records.allSatisfy { $0.routeEligibleToday != true && $0.productionReady != true })
    }

    @Test func unsafeModelPlanningEvidenceRejectsLiveOrProductionClaims() {
        let record = SeisAIModelPlanningEvidenceRecord(
            id: "unsafe",
            version: "test",
            status: "test",
            routeEligibleToday: true,
            runtimeAuthority: true,
            productionReady: true,
            trainingStatus: "started",
            benchmarkStatus: "passed",
            agiClaimAllowed: true,
            publicReadyAsAgi: true,
            publicReadyAsLocalDemo: false,
            truthBoundary: "test",
            forbiddenClaimsCount: 0,
            humanApprovalCount: 0,
            nextSafeActionsCount: 0
        )

        #expect(!record.validationIssues.isEmpty)
        #expect(!record.isPlanOnly)
    }

    private func planningData() throws -> [String: Data] {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        let names = [
            "seis-model-scaling-hardware-profile",
            "seis-model-parameter-ladder",
            "seis-model-frontier-escalation-policy",
            "seis-150b-frontier-model-program",
            "seis-512b-apex-model-program",
            "seis-agi-public-readiness-evidence"
        ]
        return try Dictionary(uniqueKeysWithValues: names.map { id in
            let url = root.appendingPathComponent("content/development/\(id).json")
            return (id, try Data(contentsOf: url))
        })
    }
}
