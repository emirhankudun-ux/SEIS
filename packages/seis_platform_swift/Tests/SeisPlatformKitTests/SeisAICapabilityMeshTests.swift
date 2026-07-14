import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Capability Mesh")
struct SeisAICapabilityMeshTests {
    @Test func projectsPluginAndMCPEvidenceWithoutRuntimeAuthority() throws {
        let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: runtimeSnapshotData())
        let mesh = SeisAICapabilityMesh(snapshot: snapshot)

        #expect(mesh.isValid)
        #expect(mesh.pluginID == "seis-agent-plugin-integration")
        #expect(mesh.pluginStatus == "active")
        #expect(mesh.installedEnabledCount == 185)
        #expect(mesh.notInstalledCount == 5)
        #expect(mesh.helperUniquePlugins == 300)
        #expect(mesh.helperCapabilityLaneCount == 12)
        #expect(mesh.laneIDs == ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"])
        #expect(mesh.mcpCounts == SeisAICoreRuntimeSnapshotContract.expectedMCPCounts)
        #expect(mesh.mcpSurfaces.map(\.id) == ["tools", "resources", "prompts", "transport"])
        #expect(mesh.runtimeBoundarySafe)
        #expect(mesh.humanApprovalRequiredForLiveActions)
        #expect(mesh.validationIssues.isEmpty)
    }

    @Test func meshLabelsKeepActivationAndMCPCountsVisible() throws {
        let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: runtimeSnapshotData())
        let mesh = SeisAICapabilityMesh(snapshot: snapshot)

        #expect(mesh.pluginStatusLabel.contains("185 installed/enabled"))
        #expect(mesh.pluginStatusLabel.contains("300 helper plugins"))
        #expect(mesh.mcpStatusLabel == "37 tools · 30 resources · 3 prompts")
        #expect(mesh.activationPolicy.contains("user_approved"))
    }

    private func runtimeSnapshotData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(
            contentsOf: root
                .appendingPathComponent("apps")
                .appendingPathComponent("seis-core")
                .appendingPathComponent("data")
                .appendingPathComponent("seis-ai-core-runtime-snapshot.json")
        )
    }
}
