import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Command Center Operations Readiness Snapshot")
struct SeisCommandCenterOperationsReadinessSnapshotTests {
    @Test func canonicalOperationsReadinessStaysReviewBeforeRelease() throws {
        let snapshot = try SeisCommandCenterOperationsReadinessSnapshot.validated(from: operationsData())

        #expect(snapshot.isValid)
        #expect(snapshot.isReviewBeforeRelease)
        #expect(snapshot.requiredReadinessAreas == ["release", "ci", "security", "rollback", "handoff"])
        #expect(snapshot.summaryCards.count == 4)
        #expect(snapshot.checks.count == 6)
    }

    @Test func incompleteCheckIsRejected() {
        let check = SeisCommandCenterOperationsCheck(
            name: "External CI",
            owner: "GitHub Workflow",
            status: "Review",
            gate: "",
            evidence: "test"
        )

        #expect(!check.isComplete)
    }

    private func operationsData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-command-center-operations-readiness.json"))
    }
}
