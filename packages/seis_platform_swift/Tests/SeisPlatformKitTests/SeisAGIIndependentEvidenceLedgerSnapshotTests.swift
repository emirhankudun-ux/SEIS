import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AGI Independent Evidence Ledger Snapshot")
struct SeisAGIIndependentEvidenceLedgerSnapshotTests {
    @Test func canonicalLedgerRemainsPlanOnly() throws {
        let snapshot = try SeisAGIIndependentEvidenceLedgerSnapshot.validated(from: ledgerData())

        #expect(snapshot.isValid)
        #expect(snapshot.isPlanOnly)
        #expect(snapshot.publicReadyForLocalDemo)
        #expect(!snapshot.agiClaimAllowed)
        #expect(!snapshot.routeEligibleToday)
        #expect(!snapshot.runtimeAuthority)
        #expect(snapshot.pendingExternalInquiries.count == 3)
        #expect(snapshot.readinessChecks.gateIds.count == 7)
        #expect(snapshot.humanApprovalNeeded.decision == "not-recorded")
    }

    @Test func incompleteInquiryCannotAuthorizeClaim() {
        let inquiry = SeisAGIIndependentEvidenceInquiry(
            id: "test",
            status: "accepted",
            requiredBeforePublicClaim: false,
            ownerAgents: [],
            requiredEvidence: []
        )

        #expect(!inquiry.isSafe)
    }

    private func ledgerData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-independent-evidence-ledger.json"))
    }
}
