import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Core MCP Runtime Contract Snapshot")
struct SeisAICoreMCPRuntimeContractSnapshotTests {
    @Test func canonicalMCPContractIsLocalSmokeVerified() throws {
        let snapshot = try SeisAICoreMCPRuntimeContractSnapshot.validated(from: mcpData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.version == 1)
        #expect(snapshot.transport == "stdio newline-delimited JSON-RPC")
        #expect(snapshot.lifecycle == "initialize -> notifications/initialized -> tools/list")
        #expect(snapshot.toolCount == 37)
        #expect(snapshot.resourceCount == 30)
        #expect(snapshot.promptCount == 3)
        #expect(snapshot.surfaces.count == 4)
        #expect(snapshot.surfaces.allSatisfy { $0.state == "verified" })
        #expect(snapshot.boundary.contains("remote MCP servers"))
    }

    @Test func unverifiedMCPSurfaceIsRejected() {
        let surface = SeisAICoreMCPSurface(
            id: "tools",
            label: "Tools",
            count: 1,
            state: "planned",
            method: "tools/list",
            evidence: "fixture",
            duty: "inspect"
        )
        #expect(surface.validationIssues.contains { $0.contains("must remain verified") })
    }

    private func mcpData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-mcp-runtime-contract.json"))
    }
}
