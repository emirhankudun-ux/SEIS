import Foundation

public enum SeisAgentApprovalRequirement: Codable, Equatable, Sendable {
    case boolean(Bool)
    case text(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Bool.self) {
            self = .boolean(value)
        } else {
            self = .text(try container.decode(String.self))
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .boolean(let value): try container.encode(value)
        case .text(let value): try container.encode(value)
        }
    }
}

public struct SeisAgentRoleDefinition: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let laneId: String
    public let statusTool: String
    public let planTool: String
    public let authority: String
    public let allowedPermissionLevels: [String]
    public let deniedPermissionLevels: [String]
    public let allowedTools: [String]
    public let deniedTools: [String]
    public let fileScopes: [String]
    public let networkScope: String
    public let maxSteps: Int
    public let maxDelegationDepth: Int
    public let timeoutMinutes: Int
    public let approvalRequiredFor: [String]
    public let validationMethod: String
    public let failureBehavior: String
    public let outputSchema: String

    public var isSafe: Bool {
        authority == "plan-only" &&
            allowedPermissionLevels == ["read-only", "plan-only"] &&
            deniedPermissionLevels == ["write-gated", "external-gated", "forbidden"] &&
            networkScope == "none" &&
            maxDelegationDepth == 1 &&
            maxSteps > 0 && timeoutMinutes > 0 &&
            !allowedTools.isEmpty && !deniedTools.isEmpty && !fileScopes.isEmpty &&
            !approvalRequiredFor.isEmpty && !validationMethod.isEmpty && !failureBehavior.isEmpty && !outputSchema.isEmpty
    }
}

public struct SeisAgentPermissionLevel: Codable, Equatable, Identifiable, Sendable {
    public let level: String
    public let status: String
    public let actions: [String]
    public let approvalRequired: SeisAgentApprovalRequirement
    public let evidenceRequired: [String]

    public var id: String { level }
    public var isComplete: Bool { !level.isEmpty && !status.isEmpty && !actions.isEmpty && !evidenceRequired.isEmpty }
}

public enum SeisAgentGovernanceSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAgentRoleSchemaSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let qualityGate: String
    public let requiredFields: [String]
    public let runtimeBoundary: String
    public let roles: [SeisAgentRoleDefinition]

    public static func validated(from data: Data) throws -> SeisAgentRoleSchemaSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else { throw SeisAgentGovernanceSnapshotError.invalidData }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else { throw SeisAgentGovernanceSnapshotError.invalidSnapshot(issues) }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let expectedLanes = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]
        if id != "seis-ai-core-agent-role-schema" || status != "documented-fixture" || runtimeBoundary != "status-and-plan-only" { issues.append("agent role schema identity or boundary is invalid") }
        if qualityGate != "npm run check:seis-ai-core-subagent-runtime-fixtures" || requiredFields.count != 18 || purpose.isEmpty { issues.append("agent role schema quality contract is incomplete") }
        if roles.count != 5 || roles.map(\.laneId) != expectedLanes || !roles.allSatisfy(\.isSafe) { issues.append("agent role schema must contain five safe lane roles") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty }
    public var laneIDs: [String] { roles.map(\.laneId) }
}

public struct SeisAgentPermissionMatrixSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let qualityGate: String
    public let runtimeBoundary: String
    public let levels: [SeisAgentPermissionLevel]
    public let forbiddenWithoutSeparatePlan: [String]

    public static func validated(from data: Data) throws -> SeisAgentPermissionMatrixSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else { throw SeisAgentGovernanceSnapshotError.invalidData }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else { throw SeisAgentGovernanceSnapshotError.invalidSnapshot(issues) }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let expectedLevels = ["read-only", "plan-only", "write-gated", "external-gated", "forbidden"]
        if id != "seis-ai-core-agent-permission-matrix" || status != "documented-fixture" || runtimeBoundary != "status-and-plan-only" { issues.append("permission matrix identity or boundary is invalid") }
        if qualityGate != "npm run check:seis-ai-core-subagent-runtime-fixtures" || purpose.isEmpty { issues.append("permission matrix quality contract is incomplete") }
        if levels.count != 5 || levels.map(\.level) != expectedLevels || !levels.allSatisfy(\.isComplete) { issues.append("permission matrix must contain five complete levels") }
        if levels[0].status != "enabled" || levels[1].status != "enabled" || levels[2].status != "planned" || levels[3].status != "planned" || levels[4].status != "active" { issues.append("permission matrix statuses are unsafe") }
        if forbiddenWithoutSeparatePlan.count != 7 || !forbiddenWithoutSeparatePlan.contains("credential access") { issues.append("permission matrix forbidden plan boundary is incomplete") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty }
    public var enabledLevelCount: Int { levels.filter { $0.status == "enabled" }.count }
}
