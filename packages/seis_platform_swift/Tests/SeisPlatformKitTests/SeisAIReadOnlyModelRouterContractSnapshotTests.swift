import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Read-Only Model Router Contract Snapshot")
struct SeisAIReadOnlyModelRouterContractSnapshotTests {
    @Test func canonicalRouterContractIsReadOnlyAndLocalDemoDefault() throws {
        let snapshot = try SeisAIReadOnlyModelRouterContractSnapshot.validated(from: routerData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.defaultMode == "Local Demo")
        #expect(snapshot.runtimeAuthority == false)
        #expect(snapshot.providerCalls == false)
        #expect(snapshot.localOnlyCanUseCloud == false)
        #expect(snapshot.providerStates.contains("Missing Key"))
        #expect(snapshot.providerStates.contains("Error"))
        #expect(snapshot.blockedModelClasses.contains("512B apex-program-plan-only"))
        #expect(snapshot.decisionIntegrity.privateObsidianContentRoutable == false)
        #expect(snapshot.readOnlyDecisionShape.executionPerformed == false)
    }

    @Test func unsafeDecisionIntegrityIsRejected() {
        let integrity = SeisAIRouterDecisionIntegrity(
            readOnlyOnly: false,
            executionPerformedAlwaysFalse: false,
            noPromptBodyInDecision: false,
            noCredentialMaterialInDecision: false,
            decisionLogsRedacted: false,
            providerStateMustBeNamed: false,
            selectedProviderMustBeExplicit: false,
            fallbackMustBeExplicit: false,
            blockedReasonsRequiredWhenIneligible: false,
            privateObsidianContentRoutable: true
        )
        #expect(!integrity.isSafe)
    }

    private func routerData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-read-only-model-router-contract.json"))
    }
}
