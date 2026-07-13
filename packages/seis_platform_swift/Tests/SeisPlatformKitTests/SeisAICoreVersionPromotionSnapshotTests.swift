import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Core Version Promotion Snapshot")
struct SeisAICoreVersionPromotionSnapshotTests {
    @Test func canonicalPromotionSnapshotIsDryRunOnly() throws {
        let snapshot = try SeisAICoreVersionPromotionSnapshot.validated(from: promotionData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.laneResponsibilities.count == 5)
        #expect(snapshot.gates.count == 5)
        #expect(snapshot.currentDryRun.decision == "eligible-for-internal-review")
        #expect(!snapshot.currentDryRun.releasePromotionAllowed)
        #expect(snapshot.currentDryRun.realExecutionBlocked)
        #expect(snapshot.runtimeBoundary.coreRequiresCloudApiKey == false)
        #expect(snapshot.truthBoundaries.isSafe)
        #expect(snapshot.gates.allSatisfy { !$0.releasePromotionAllowed })
    }

    @Test func unsafePromotionSnapshotRejectsReleaseAndMutationFlags() {
        let boundary = SeisAICoreVersionPromotionRuntimeBoundary(
            currentLevel: "status-and-plan-only",
            writeExecution: "disabled",
            backgroundAutomation: "disabled",
            externalMutation: "requires-explicit-human-approval",
            credentialAccess: "forbidden",
            liveProviderCalls: "disabled",
            coreRequiresCloudApiKey: false,
            dryRunOnly: true
        )
        let truth = SeisAICoreVersionPromotionTruthBoundaries(
            promotionDryRunIsReleaseApproval: false,
            internalReviewIsPublicRelease: false,
            providerRoutingIsModelOwnership: false,
            promptEngineeringIsTraining: false,
            dryRunPermitsExternalMutation: false,
            dryRunPermitsCredentialAccess: false
        )
        let dryRun = SeisAICoreVersionPromotionDryRun(
            requestedVersionTarget: "test",
            decision: "test",
            releasePromotionAllowed: true,
            realExecutionBlocked: false,
            externalMutationPerformed: true,
            credentialAccessPerformed: true,
            reason: "unsafe",
            nextSafeAction: "stop"
        )
        let snapshot = SeisAICoreVersionPromotionSnapshot(
            id: "seis-ai-core-version-promotion-gates",
            version: "test",
            status: "documented-fixture",
            updatedAt: "2026-07-13",
            purpose: "test",
            qualityGate: "npm run check:test",
            sourceOfTruth: [:],
            tooling: [:],
            runtimeBoundary: boundary,
            truthBoundaries: truth,
            decisionStates: ["test"],
            currentDryRun: dryRun,
            laneResponsibilities: [],
            gates: [],
            forbiddenPromotionClaims: ["test"],
            nextSafeActions: ["stop"]
        )

        #expect(!snapshot.isValid)
        #expect(!snapshot.isMetadataOnly)
        #expect(snapshot.validationIssues.contains { $0.contains("must not authorize release promotion") })
    }

    private func promotionData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-version-promotion-gates.json"))
    }
}
