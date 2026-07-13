import Foundation

public struct SeisProjectIntakeInputPolicy: Codable, Equatable, Sendable {
    public let read: String
    public let write: String
    public let shell: String
    public let network: String
    public let secretCapture: String

    public init(read: String, write: String, shell: String, network: String, secretCapture: String) {
        self.read = read
        self.write = write
        self.shell = shell
        self.network = network
        self.secretCapture = secretCapture
    }
}

public struct SeisProjectIntakeScopeRecommendation: Codable, Equatable, Sendable {
    public let primary: String
    public let secondary: String
    public let target: String

    public init(primary: String, secondary: String, target: String) {
        self.primary = primary
        self.secondary = secondary
        self.target = target
    }
}

public struct SeisProjectIntakeReportShape: Codable, Equatable, Sendable {
    public let topLevelKeys: [String]
    public let intakeRequiredFields: [String]

    public init(topLevelKeys: [String], intakeRequiredFields: [String]) {
        self.topLevelKeys = topLevelKeys
        self.intakeRequiredFields = intakeRequiredFields
    }
}

public struct SeisProjectIntakeCommandPolicyEntry: Codable, Equatable, Sendable {
    public let capability: String
    public let decision: String

    public init(capability: String, decision: String) {
        self.capability = capability
        self.decision = decision
    }
}

public struct SeisProjectIntakeCommandPolicy: Codable, Equatable, Sendable {
    public let `default`: String
    public let scopedActions: [SeisProjectIntakeCommandPolicyEntry]

    public init(default: String, scopedActions: [SeisProjectIntakeCommandPolicyEntry]) {
        self.default = `default`
        self.scopedActions = scopedActions
    }
}

public enum SeisProjectIntakeSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisProjectIntakeSnapshot: Codable, Equatable, Sendable {
    public let identity: String
    public let version: String
    public let status: String
    public let scope: String
    public let qualityGate: String
    public let inputPolicy: SeisProjectIntakeInputPolicy
    public let scopeRecommendation: SeisProjectIntakeScopeRecommendation
    public let requiredEvidence: [String]
    public let requiredArtifacts: [String]
    public let reportShape: SeisProjectIntakeReportShape
    public let commandPolicy: SeisProjectIntakeCommandPolicy
    public let nextPhaseSuggestions: [String]

    private enum CodingKeys: String, CodingKey {
        case identity = "id"
        case version, status, scope, qualityGate, inputPolicy, scopeRecommendation
        case requiredEvidence, requiredArtifacts, reportShape, commandPolicy, nextPhaseSuggestions
    }

    public init(
        identity: String,
        version: String,
        status: String,
        scope: String,
        qualityGate: String,
        inputPolicy: SeisProjectIntakeInputPolicy,
        scopeRecommendation: SeisProjectIntakeScopeRecommendation,
        requiredEvidence: [String],
        requiredArtifacts: [String],
        reportShape: SeisProjectIntakeReportShape,
        commandPolicy: SeisProjectIntakeCommandPolicy,
        nextPhaseSuggestions: [String]
    ) {
        self.identity = identity
        self.version = version
        self.status = status
        self.scope = scope
        self.qualityGate = qualityGate
        self.inputPolicy = inputPolicy
        self.scopeRecommendation = scopeRecommendation
        self.requiredEvidence = requiredEvidence
        self.requiredArtifacts = requiredArtifacts
        self.reportShape = reportShape
        self.commandPolicy = commandPolicy
        self.nextPhaseSuggestions = nextPhaseSuggestions
    }

    public static func validated(from data: Data) throws -> SeisProjectIntakeSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisProjectIntakeSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisProjectIntakeSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if identity != "seis-project-intake-contract" { issues.append("intake identity is not canonical") }
        if version != "0.2.0" || status != "active" || scope != "local-repo" || qualityGate != "npm run check:seis-project-intake" {
            issues.append("intake identity metadata is not canonical")
        }
        if inputPolicy.read != "allowed" || inputPolicy.write != "requires-user-approval" || inputPolicy.shell != "requires-user-approval" || inputPolicy.network != "disabled-by-default" || inputPolicy.secretCapture != "forbidden" {
            issues.append("input policy must remain read-only by default and approval-gated for unsafe capabilities")
        }
        if scopeRecommendation.primary != "cli-first" || scopeRecommendation.secondary != "macos-native-aware" || scopeRecommendation.target != "local-repo-safe-intake" {
            issues.append("scope recommendation is not canonical")
        }
        if requiredEvidence.count != 4 { issues.append("intake contract requires exactly four evidence items") }
        if requiredArtifacts.count != 5 { issues.append("intake contract requires exactly five artifacts") }
        if reportShape.topLevelKeys.count != 6 { issues.append("report shape must expose six top-level keys") }
        if reportShape.intakeRequiredFields.count != 5 { issues.append("intake report requires exactly five fields") }
        if commandPolicy.default != "read-only" || commandPolicy.scopedActions.count != 5 {
            issues.append("command policy must have a read-only default and five scoped actions")
        }
        let actionCapabilities = commandPolicy.scopedActions.map(\.capability)
        let decisions = Dictionary(grouping: commandPolicy.scopedActions, by: \.capability)
            .compactMapValues { entries in entries.count == 1 ? entries[0].decision : nil }
        let expectedDecisions = ["read": "allow", "write": "gate", "shell": "gate", "network": "deny", "secret": "deny"]
        if Set(actionCapabilities).count != actionCapabilities.count || decisions != expectedDecisions { issues.append("command policy decisions are unsafe or incomplete") }
        if nextPhaseSuggestions.count != 3 { issues.append("intake contract requires exactly three next actions") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }

    public var isMetadataOnly: Bool {
        isValid &&
            inputPolicy.read == "allowed" &&
            inputPolicy.write == "requires-user-approval" &&
            inputPolicy.shell == "requires-user-approval" &&
            inputPolicy.network == "disabled-by-default" &&
            inputPolicy.secretCapture == "forbidden" &&
            commandPolicy.default == "read-only" &&
            commandPolicy.scopedActions.allSatisfy { ["read", "write", "shell", "network", "secret"].contains($0.capability) }
    }
}
