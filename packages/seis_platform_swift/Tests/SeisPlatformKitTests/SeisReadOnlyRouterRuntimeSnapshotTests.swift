import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Read-Only Router Runtime Snapshot")
struct SeisReadOnlyRouterRuntimeSnapshotTests {
    @Test func routerRuntimeRemainsNoKeyAndReviewOnly() throws {
        let snapshot = try SeisReadOnlyRouterRuntimeSnapshot.validated(from: runtimeData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.inputCount == 9)
        #expect(snapshot.providerStateRules.count == 5)
        #expect(snapshot.forbiddenInputs.count == 7)
        #expect(snapshot.coveredLaneCount == 5)
        #expect(!snapshot.runtimeBoundary.coreRequiresCloudApiKey)
    }

    @Test func modelClaimsAndPrivateInputsRemainBlocked() throws {
        let snapshot = try SeisReadOnlyRouterRuntimeSnapshot.validated(from: runtimeData())

        #expect(!snapshot.modelClaimBoundary.isTrainedModel)
        #expect(!snapshot.modelClaimBoundary.isFoundationModel)
        #expect(!snapshot.modelClaimBoundary.isAgi)
        #expect(!snapshot.modelClaimBoundary.route512BEligible)
        #expect(snapshot.forbiddenInputs.contains("API keys and tokens"))
        #expect(snapshot.forbiddenInputs.contains("private Obsidian vault contents"))
        #expect(snapshot.agentLaneCoverage == ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"])
    }

    private func runtimeData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-read-only-router-runtime.json"))
    }
}
