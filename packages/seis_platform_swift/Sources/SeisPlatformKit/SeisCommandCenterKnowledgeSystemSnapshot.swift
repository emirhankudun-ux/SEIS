import Foundation

public struct SeisCommandCenterKnowledgeSecurityBoundary: Codable, Equatable, Sendable {
    public let storesSecrets: Bool
    public let forbiddenData: [String]

    public init(storesSecrets: Bool, forbiddenData: [String]) {
        self.storesSecrets = storesSecrets
        self.forbiddenData = forbiddenData
    }

    public var isSafe: Bool {
        !storesSecrets && forbiddenData.count == 5 && forbiddenData.contains("API keys")
    }
}

public enum SeisCommandCenterKnowledgeSystemSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisCommandCenterKnowledgeSystemSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let commandCenterSurface: String
    public let qualityGate: String
    public let purpose: String
    public let requiredNodes: [String]
    public let requiredEvidenceKinds: [String]
    public let releaseRule: String
    public let securityBoundary: SeisCommandCenterKnowledgeSecurityBoundary
    public let evidence: [String]

    public init(
        id: String,
        version: String,
        status: String,
        commandCenterSurface: String,
        qualityGate: String,
        purpose: String,
        requiredNodes: [String],
        requiredEvidenceKinds: [String],
        releaseRule: String,
        securityBoundary: SeisCommandCenterKnowledgeSecurityBoundary,
        evidence: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.commandCenterSurface = commandCenterSurface
        self.qualityGate = qualityGate
        self.purpose = purpose
        self.requiredNodes = requiredNodes
        self.requiredEvidenceKinds = requiredEvidenceKinds
        self.releaseRule = releaseRule
        self.securityBoundary = securityBoundary
        self.evidence = evidence
    }

    public static func validated(from data: Data) throws -> SeisCommandCenterKnowledgeSystemSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisCommandCenterKnowledgeSystemSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisCommandCenterKnowledgeSystemSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-command-center-knowledge-system" || status != "active" { issues.append("knowledge system identity/status is invalid") }
        if commandCenterSurface != "apps/seis-core" || qualityGate != "npm run check:seis-command-center-knowledge-system" { issues.append("knowledge system surface or quality gate is invalid") }
        if [version, purpose, releaseRule].contains(where: { $0.isEmpty }) { issues.append("knowledge system identity is incomplete") }
        if requiredNodes.count != 6 || !requiredNodes.contains("Repository Memory") { issues.append("knowledge system requires six canonical nodes") }
        if requiredEvidenceKinds.count != 5 || !requiredEvidenceKinds.contains("knowledge-graph-node") { issues.append("knowledge system evidence kinds are incomplete") }
        if !releaseRule.localizedCaseInsensitiveContains("graph nodes") || !releaseRule.localizedCaseInsensitiveContains("checker coverage") { issues.append("knowledge system release rule is incomplete") }
        if !securityBoundary.isSafe { issues.append("knowledge system security boundary is unsafe") }
        if evidence.count != 7 || evidence.isEmpty { issues.append("knowledge system evidence must contain seven records") }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty && securityBoundary.isSafe
    }
}
