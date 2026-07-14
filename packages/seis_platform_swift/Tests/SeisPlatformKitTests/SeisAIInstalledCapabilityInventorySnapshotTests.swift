import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS installed capability inventory snapshot")
struct SeisAIInstalledCapabilityInventorySnapshotTests {
    @Test func canonicalInventoryIsSourceBackedAndMetadataOnly() throws {
        let snapshot = try SeisAIInstalledCapabilityInventorySnapshot.validated(
            bigTechData: bigTechData(),
            nvidiaData: nvidiaData()
        )

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.installedSkillCount == 38)
        #expect(snapshot.cliToolProfiles.count == 3)
        #expect(snapshot.projectMCPConfigurations.count == 3)
        #expect(snapshot.currentSessionMCPSurfaceCount == 17)
        #expect(snapshot.localAppCount == 8)
        #expect(snapshot.pendingConnectorInstallCount == 1)
        #expect(snapshot.nvidiaSkillManifestCount == 11)
        #expect(snapshot.nvidiaIntegrationIDs.count == 11)
        #expect(snapshot.nvidiaRuntimeBlockedCount == 8)
        #expect(snapshot.cliToolProfiles.map(\.name) == ["Kimi Code CLI", "Claude Code CLI", "XcodeBuildMCP"])
        #expect(snapshot.projectMCPConfigurations[0].serverIDs == ["seis", "xcodebuildmcp"])
        #expect(snapshot.runtimeAuthority == false)
        #expect(snapshot.credentialsRead == false)
        #expect(snapshot.networkCalled == false)
        #expect(snapshot.externalMutationPerformed == false)
        #expect(snapshot.humanApprovalRequiredForActivation)
    }

    @Test func providerCallsInBigTechSourceAreRejected() throws {
        var root = try #require(JSONSerialization.jsonObject(with: bigTechData()) as? [String: Any])
        var securityBoundary = try #require(root["security_boundary"] as? [String: Any])
        securityBoundary["no_provider_calls"] = false
        root["security_boundary"] = securityBoundary

        #expect(throws: SeisAIInstalledCapabilityInventorySnapshotError.self) {
            try SeisAIInstalledCapabilityInventorySnapshot.validated(
                bigTechData: JSONSerialization.data(withJSONObject: root),
                nvidiaData: nvidiaData()
            )
        }
    }

    @Test func nvidiaRuntimeActivationIsRejected() throws {
        var root = try #require(JSONSerialization.jsonObject(with: nvidiaData()) as? [String: Any])
        var policy = try #require(root["installPolicy"] as? [String: Any])
        policy["dockerAllowed"] = true
        root["installPolicy"] = policy

        #expect(throws: SeisAIInstalledCapabilityInventorySnapshotError.self) {
            try SeisAIInstalledCapabilityInventorySnapshot.validated(
                bigTechData: bigTechData(),
                nvidiaData: JSONSerialization.data(withJSONObject: root)
            )
        }
    }

    private func bigTechData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-big-tech-mcp-skill-inventory.json"))
    }

    private func nvidiaData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-nvidia-installed-integrations.json"))
    }
}
