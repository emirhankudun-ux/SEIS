import Foundation

public struct SeisActionCapabilityDecisionRule: Codable, Equatable, Sendable {
    public let capability: String
    public let decision: String
    public let requiresApproval: Bool
    public let risk: String

    public var isComplete: Bool {
        ![capability, decision, risk].contains(where: { $0.isEmpty })
    }
}

public struct SeisActionRedactionPolicy: Codable, Equatable, Sendable {
    public let enabled: Bool
    public let patterns: [String]

    public var isSafe: Bool {
        enabled && patterns.count == 3 && patterns.allSatisfy { !$0.isEmpty }
    }
}

public struct SeisActionRollbackPolicy: Codable, Equatable, Sendable {
    public let required: Bool
    public let strategy: String

    public var isSafe: Bool {
        required && strategy == "documented"
    }
}

public struct SeisActionExecutionPolicy: Codable, Equatable, Sendable {
    public let mode: String
    public let dryRun: Bool
    public let maxCommandSeconds: Int
    public let requiresExplicitApprovalFor: [String]
    public let redaction: SeisActionRedactionPolicy
    public let rollback: SeisActionRollbackPolicy

    public var isSafe: Bool {
        mode == "dryRunDefault" && dryRun && maxCommandSeconds == 60 &&
            requiresExplicitApprovalFor == ["write", "shell", "git", "network", "deploy", "model", "data"] &&
            redaction.isSafe && rollback.isSafe
    }
}

public struct SeisActionDecisionContractSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let version: String
    public let status: String
    public let policyVersion: String
    public let qualityGate: String
    public let scope: String
    public let defaultDecision: String
    public let operatingModel: String
    public let redaction: SeisActionRedactionPolicy
    public let capabilityDecisionRules: [SeisActionCapabilityDecisionRule]
    public let requiredEvidence: [String]
    public let requiredArtifacts: [String]
    public let secretPolicy: String

    public static func validated(from data: Data) throws -> SeisActionDecisionContractSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else { throw SeisActionGovernanceContractsSnapshotError.invalidData }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else { throw SeisActionGovernanceContractsSnapshotError.invalidSnapshot(issues) }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-action-decision-kernel" || status != "active" || defaultDecision != "read-only" || scope != "local-repo" { issues.append("action decision identity or safe default is invalid") }
        if qualityGate != "npm run check:seis-action-decision" || !operatingModel.localizedCaseInsensitiveContains("deterministic-first") { issues.append("action decision quality gate or operating model is invalid") }
        if capabilityDecisionRules.count != 12 || !capabilityDecisionRules.allSatisfy(\.isComplete) { issues.append("action decision rules are incomplete") }
        if !rule(capability: "secret", decision: "deny", requiresApproval: false) { issues.append("secret capability must be denied without approval") }
        if !["write", "shell", "git"].allSatisfy({ rule(capability: $0, decision: "gate", requiresApproval: true) }) { issues.append("write, shell, and git must be approval-gated") }
        if !["network", "deploy", "model", "data"].allSatisfy({ rule(capability: $0, decision: "approval_required", requiresApproval: true) }) { issues.append("network, deploy, model, and data must require explicit approval") }
        if !redaction.isSafe || requiredEvidence.count != 4 || requiredArtifacts.count != 6 || !secretPolicy.contains("REDACTED_SECRET") { issues.append("action decision redaction or evidence boundary is unsafe") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty }
    public var ruleCount: Int { capabilityDecisionRules.count }

    private func rule(capability: String, decision: String, requiresApproval: Bool) -> Bool {
        capabilityDecisionRules.contains { $0.capability == capability && $0.decision == decision && $0.requiresApproval == requiresApproval }
    }
}

public struct SeisActionExecutionContractSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let version: String
    public let status: String
    public let policyVersion: String
    public let qualityGate: String
    public let scope: String
    public let defaultDecision: String
    public let operatingModel: String
    public let executionPolicy: SeisActionExecutionPolicy
    public let capabilityDecisionRules: [SeisActionCapabilityDecisionRule]
    public let requiredEvidence: [String]
    public let requiredArtifacts: [String]
    public let secretPolicy: String

    public static func validated(from data: Data) throws -> SeisActionExecutionContractSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else { throw SeisActionGovernanceContractsSnapshotError.invalidData }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else { throw SeisActionGovernanceContractsSnapshotError.invalidSnapshot(issues) }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-action-execution-lane" || status != "active" || defaultDecision != "gate" || scope != "local-repo" { issues.append("action execution identity or safe default is invalid") }
        if qualityGate != "npm run check:seis-action-execution" || !operatingModel.localizedCaseInsensitiveContains("explicit approval") { issues.append("action execution quality gate or operating model is invalid") }
        if !executionPolicy.isSafe || capabilityDecisionRules.count != 12 || !capabilityDecisionRules.allSatisfy(\.isComplete) { issues.append("action execution policy or rules are unsafe") }
        if !rule(capability: "secret", decision: "deny", requiresApproval: false) { issues.append("execution lane secret capability must be denied") }
        if requiredEvidence.count != 6 || requiredArtifacts.count != 5 || !secretPolicy.contains("REDACTED_SECRET") { issues.append("action execution evidence boundary is unsafe") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty }
    public var ruleCount: Int { capabilityDecisionRules.count }

    private func rule(capability: String, decision: String, requiresApproval: Bool) -> Bool {
        capabilityDecisionRules.contains { $0.capability == capability && $0.decision == decision && $0.requiresApproval == requiresApproval }
    }
}

public enum SeisActionGovernanceContractsSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}
