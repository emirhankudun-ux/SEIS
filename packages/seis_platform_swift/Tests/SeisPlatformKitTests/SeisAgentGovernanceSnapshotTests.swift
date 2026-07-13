import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Agent Governance Snapshot")
struct SeisAgentGovernanceSnapshotTests {
    @Test func canonicalAgentGovernanceIsMetadataOnly() throws {
        let roleSchema = try SeisAgentRoleSchemaSnapshot.validated(from: roleSchemaData())
        let permissionMatrix = try SeisAgentPermissionMatrixSnapshot.validated(from: permissionMatrixData())

        #expect(roleSchema.isMetadataOnly)
        #expect(permissionMatrix.isMetadataOnly)
        #expect(roleSchema.roles.count == 5)
        #expect(permissionMatrix.levels.count == 5)
        #expect(permissionMatrix.enabledLevelCount == 2)
    }

    @Test func roleWithNetworkScopeIsRejected() {
        let role = SeisAgentRoleDefinition(
            id: "unsafe",
            laneId: "seis",
            statusTool: "status",
            planTool: "plan",
            authority: "plan-only",
            allowedPermissionLevels: ["read-only", "plan-only"],
            deniedPermissionLevels: ["write-gated", "external-gated", "forbidden"],
            allowedTools: ["status"],
            deniedTools: ["network"],
            fileScopes: ["docs/**"],
            networkScope: "remote",
            maxSteps: 6,
            maxDelegationDepth: 1,
            timeoutMinutes: 20,
            approvalRequiredFor: ["network"],
            validationMethod: "check",
            failureBehavior: "stop",
            outputSchema: "plan"
        )

        #expect(!role.isSafe)
    }

    private func roleSchemaData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-agent-role-schema.json"))
    }

    private func permissionMatrixData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-agent-permission-matrix.json"))
    }
}
