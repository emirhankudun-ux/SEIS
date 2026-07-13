import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Core Provider Registry Snapshot")
struct SeisAICoreProviderRegistrySnapshotTests {
    @Test func canonicalProviderRegistryKeepsZeroKeyAndStateSemantics() throws {
        let snapshot = try SeisAICoreProviderRegistrySnapshot.validated(from: providerData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.providers.count == 7)
        #expect(snapshot.coreCredentialRequirement == "none")
        #expect(snapshot.defaultRoutingMode == "local-demo")
        #expect(snapshot.providers.filter { $0.publicStatus == "Available" }.count == 2)
        #expect(snapshot.providers.filter { $0.publicStatus == "Missing Key" }.count == 3)
        #expect(snapshot.providers.filter { $0.publicStatus == "Disabled" }.count == 2)
        #expect(snapshot.providers.allSatisfy { $0.backendOnly && !$0.frontendSecretAllowed })
        #expect(snapshot.noKeyProviders.contains("ollama-local"))
    }

    @Test func frontendSecretsAreRejected() {
        let provider = SeisAIProviderRegistryProvider(
            id: "unsafe",
            displayName: "Unsafe",
            category: "test",
            publicStatus: "Available",
            credentialRequirement: "none",
            expectedEnv: [],
            configured: true,
            enabled: true,
            routingEligible: true,
            privacyClass: "test",
            capabilities: ["test"],
            modelAliases: ["test"],
            actualModel: "test",
            backendOnly: true,
            frontendSecretAllowed: true,
            fallbackEligible: false,
            evidence: ["test"],
            notes: "test"
        )
        #expect(provider.validationIssues.contains { $0.contains("frontend secrets") })
    }

    private func providerData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-provider-registry.json"))
    }
}
