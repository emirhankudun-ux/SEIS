import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Core Version Registry Snapshot")
struct SeisAICoreVersionRegistrySnapshotTests {
    @Test func canonicalVersionRegistryIsZeroKeyAndPlanOnly() throws {
        let snapshot = try SeisAICoreVersionRegistrySnapshot.validated(from: registryData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.currentVersion.id == "seis-ai-core-v0.1")
        #expect(snapshot.currentVersion.providerMode == "zero-key-core")
        #expect(snapshot.versionComponents.count == 7)
        #expect(snapshot.linkedSubAgentLanes.count == 5)
        #expect(snapshot.fiveYearVersionRoadmap.count == 5)
        #expect(snapshot.promotionEvidenceRequired.count == 10)
        #expect(snapshot.linkedSubAgentLanes.allSatisfy { $0.permissionLevel == "plan-only" })
        #expect(snapshot.truthBoundaries.isSafe)
        #expect(snapshot.runtimeBoundary.localDemoAllowed)
    }

    @Test func unsafeVersionRegistryRejectsFoundationModelAndWriteRuntimeClaims() {
        let identity = SeisAICoreVersionIdentity(
            id: "seis-ai-core-v0.1",
            displayName: "SEIS AI Core v0.1",
            maturity: "test",
            scope: "test",
            releaseClass: "foundation-planning",
            runtimeBoundary: "status-and-plan-only",
            providerMode: "cloud",
            languageVersion: "test",
            agentRuntimeVersion: "test",
            modelRouterVersion: "test",
            promptEngineVersion: "test",
            commandIntelligenceVersion: "test"
        )
        let snapshot = SeisAICoreVersionRegistrySnapshot(
            id: "seis-ai-core-version-registry",
            version: "0.1.0",
            status: "documented-fixture",
            updatedAt: "2026-07-13",
            purpose: "test",
            qualityGate: "npm run check:test",
            sourceOfTruth: [:],
            currentVersion: identity,
            truthBoundaries: SeisAICoreVersionTruthBoundaries(
                isFoundationModel: true,
                isTrainedModel: false,
                providerRoutingIsModelOwnership: false,
                promptEngineeringIsTraining: false,
                ragIsTraining: false,
                autonomousWriteRuntimeEnabled: true,
                externalMutationPerformed: false,
                credentialAccessPerformed: false
            ),
            runtimeBoundary: SeisAICoreVersionRuntimeBoundary(
                currentLevel: "status-and-plan-only",
                writeExecution: "enabled",
                backgroundAutomation: "disabled",
                externalMutation: "requires-explicit-human-approval",
                credentialAccess: "forbidden",
                liveProviderCalls: "disabled",
                localDemoAllowed: true,
                coreRequiresCloudApiKey: false
            ),
            versionComponents: [],
            linkedSubAgentLanes: [],
            fiveYearVersionRoadmap: [],
            promotionEvidenceRequired: [],
            nextSafeActions: ["stop"]
        )

        #expect(!snapshot.isValid)
        #expect(!snapshot.isMetadataOnly)
        #expect(snapshot.validationIssues.contains { $0.contains("truth boundaries are unsafe") })
        #expect(snapshot.validationIssues.contains { $0.contains("runtime boundary is unsafe") })
    }

    private func registryData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-version-registry.json"))
    }
}
