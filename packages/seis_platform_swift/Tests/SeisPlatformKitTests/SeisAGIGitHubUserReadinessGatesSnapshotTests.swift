import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AGI GitHub User Readiness Gates Snapshot")
struct SeisAGIGitHubUserReadinessGatesSnapshotTests {
    @Test func canonicalGatesKeepLocalDemoSeparateFromAgi() throws {
        let snapshot = try SeisAGIGitHubUserReadinessGatesSnapshot.validated(from: gatesData())

        #expect(snapshot.isValid)
        #expect(snapshot.isLocalDemoOnly)
        #expect(snapshot.publicReadyForLocalDemo)
        #expect(!snapshot.githubReadyForEveryone)
        #expect(!snapshot.agiClaimAllowed)
        #expect(!snapshot.routeEligibleToday)
        #expect(!snapshot.runtimeAuthority)
        #expect(snapshot.githubUserModes.count == 4)
        #expect(snapshot.readinessGates.count == 7)
        #expect(snapshot.oneCommandReadinessValidator.checks.count == 12)
    }

    @Test func unsafeValidatorCannotGrantRouteEligibility() {
        let validator = SeisAGIGitHubReadinessValidator(
            status: "available-local-demo-gate",
            command: "npm run check",
            mode: "local-demo-readiness-only",
            installsModels: false,
            downloadsCheckpoints: false,
            trainsModels: false,
            callsProviders: false,
            provisionsCloudOrGpu: false,
            executesSsh: false,
            pushesOrMerges: false,
            grantsAgiClaim: false,
            grants512bRouteEligibility: true,
            checks: Array(repeating: "check", count: 12)
        )

        #expect(!validator.isSafeLocalDemo)
    }

    private func gatesData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-github-user-readiness-gates.json"))
    }
}
