import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AGI Public Readiness Evidence Snapshot")
struct SeisAGIPublicReadinessEvidenceSnapshotTests {
    @Test func canonicalEvidenceRemainsBlockedAndLocalDemoSafe() throws {
        let snapshot = try SeisAGIPublicReadinessEvidenceSnapshot.validated(from: evidenceData())

        #expect(snapshot.isValid)
        #expect(snapshot.isBlockedPlanOnly)
        #expect(snapshot.publicReadyAsLocalDemo)
        #expect(!snapshot.agiClaimAllowed)
        #expect(!snapshot.routeEligibleToday)
        #expect(!snapshot.runtimeAuthority)
        #expect(snapshot.readinessSummary.minimumClaimEvidenceCount == 20)
        #expect(snapshot.readinessSummary.acceptedClaimEvidenceCount == 0)
        #expect(snapshot.minimumClaimEvidenceMatrix.count == 20)
    }

    @Test func minimumEvidenceCannotAuthorizeRouteWhenMissing() {
        let evidence = SeisAGIPublicReadinessMinimumEvidence(
            id: "unsafe",
            requirement: "test",
            status: "missing",
            currentEvidence: "test",
            requiredEvidence: ["test"],
            ownerAgents: ["test"],
            routeEligibleIfMissing: true,
            claimAllowedIfMissing: false
        )

        #expect(!evidence.isSafe)
    }

    private func evidenceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-public-readiness-evidence.json"))
    }
}
