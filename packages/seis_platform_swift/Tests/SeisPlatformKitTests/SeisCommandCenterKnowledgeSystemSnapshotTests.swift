import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Command Center Knowledge System Snapshot")
struct SeisCommandCenterKnowledgeSystemSnapshotTests {
    @Test func canonicalKnowledgeSystemIsMetadataOnly() throws {
        let snapshot = try SeisCommandCenterKnowledgeSystemSnapshot.validated(from: knowledgeData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.requiredNodes.count == 6)
        #expect(snapshot.requiredEvidenceKinds.count == 5)
        #expect(snapshot.evidence.count == 7)
        #expect(!snapshot.securityBoundary.storesSecrets)
    }

    @Test func secretStorageIsRejected() {
        let boundary = SeisCommandCenterKnowledgeSecurityBoundary(
            storesSecrets: true,
            forbiddenData: ["API keys", "tokens", "passwords", "private keys", "cookies"]
        )

        #expect(!boundary.isSafe)
    }

    private func knowledgeData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-command-center-knowledge-system.json"))
    }
}
