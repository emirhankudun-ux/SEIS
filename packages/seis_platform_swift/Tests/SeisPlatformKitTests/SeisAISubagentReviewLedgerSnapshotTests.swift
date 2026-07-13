import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Sub-Agent Review Ledger Snapshot")
struct SeisAISubagentReviewLedgerSnapshotTests {
    @Test func canonicalReviewLedgerIsQuarterlyPlanOnlyEvidence() throws {
        let snapshot = try SeisAISubagentReviewLedgerSnapshot.validated(from: ledgerData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.cadence.totalQuarterRecords == 20)
        #expect(snapshot.summary.documentedValidatedQuarterCount == 2)
        #expect(snapshot.summary.plannedQuarterCount == 18)
        #expect(snapshot.summary.writeGatedQuarterCountEnabled == 0)
        #expect(snapshot.quarters.count == 20)
        #expect(snapshot.quarters.first?.status == "documented-validated")
        #expect(snapshot.quarters.last?.status == "planned")
        #expect(snapshot.quarters.allSatisfy { !$0.externalMutationPerformed })
    }

    @Test func reviewQuarterRejectsExternalMutation() {
        let quarter = SeisAISubagentQuarterReview(
            id: "Y1-Q1",
            status: "documented-validated",
            sourcePlanQuarter: "Y1-Q1",
            primaryLanes: ["security-agent"],
            evidence: ["evidence"],
            validator: "validator",
            externalMutationPerformed: true,
            humanApprovalNeeded: false,
            nextSafeAction: "stop"
        )

        #expect(quarter.validationIssues.contains { $0.contains("external mutation") })
    }

    private func ledgerData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-subagent-review-ledger.json"))
    }
}
