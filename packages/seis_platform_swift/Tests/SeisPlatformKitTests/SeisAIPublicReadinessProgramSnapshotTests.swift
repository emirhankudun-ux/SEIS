import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Public Readiness Program Snapshot")
struct SeisAIPublicReadinessProgramSnapshotTests {
    @Test func canonicalProgramIsLocalDemoOnly() throws {
        let snapshot = try SeisAIPublicReadinessProgramSnapshot.validated(from: programData())

        #expect(snapshot.isValid)
        #expect(snapshot.isLocalDemoOnly)
        #expect(snapshot.publicReadyForLocalDemo)
        #expect(!snapshot.githubReadyForEveryone)
        #expect(!snapshot.publicReadyAsAgi)
        #expect(!snapshot.routeEligibleToday)
        #expect(!snapshot.runtimeAuthority)
        #expect(snapshot.internetResearchBaseline.count == 6)
        #expect(snapshot.githubAudienceModes.count == 4)
        #expect(snapshot.readinessGates.count == 6)
        #expect(snapshot.requiredBeforeAnyAgiClaim.count == 13)
    }

    @Test func unsafeGateCannotAllowAgiClaim() {
        let gate = SeisAIPublicReadinessGate(
            id: "unsafe",
            status: "available",
            blocksGithubReadyForEveryone: false,
            blocksAgiClaim: false,
            evidence: ["test"]
        )

        #expect(gate.validationIssues.contains { $0.contains("AGI") })
    }

    private func programData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-public-readiness-program.json"))
    }
}
