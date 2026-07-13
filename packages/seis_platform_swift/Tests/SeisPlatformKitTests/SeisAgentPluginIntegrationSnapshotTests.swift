import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Agent Plugin Integration Snapshot")
struct SeisAgentPluginIntegrationSnapshotTests {
    @Test func canonicalPluginManifestIsScopedAndMetadataOnly() throws {
        let snapshot = try SeisAgentPluginIntegrationSnapshot.validated(from: pluginData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.personalPlugins.count == 5)
        #expect(snapshot.lanes.count == 10)
        #expect(snapshot.auditedSnapshot.installedEnabledCount == 185)
        #expect(snapshot.auditedSnapshot.notInstalledCount == 5)
        #expect(snapshot.helperPluginUniverse.uniquePlugins == 300)
        #expect(snapshot.runtimeIntegration.sshTransportBinding.serverAndPortPolicy == "preserve-existing-server-and-port")
        #expect(snapshot.activationPolicy.noBlanketActivation)
        #expect(snapshot.auditedSnapshot.authenticationClaim == "not-claimed")
    }

    @Test func unsafeActivationPolicyIsRejected() {
        let policy = SeisAgentPluginActivationPolicy(
            mode: "blanket",
            rule: "all",
            noBlanketActivation: false,
            noSecretDisclosure: false,
            externalMutationRequiresUserConfirmation: false
        )
        #expect(!policy.isSafe)
    }

    private func pluginData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agent-plugin-integration.json"))
    }
}
