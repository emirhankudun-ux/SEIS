import Foundation

public struct SeisCommandCenterOperationsSummaryCard: Codable, Equatable, Identifiable, Sendable {
    public let area: String
    public let status: String
    public let evidence: String

    public var id: String { area }

    public init(area: String, status: String, evidence: String) {
        self.area = area
        self.status = status
        self.evidence = evidence
    }

    public var isComplete: Bool {
        !area.isEmpty && !status.isEmpty && !evidence.isEmpty
    }
}

public struct SeisCommandCenterOperationsCheck: Codable, Equatable, Identifiable, Sendable {
    public let name: String
    public let owner: String
    public let status: String
    public let gate: String
    public let evidence: String

    public var id: String { name }

    public init(name: String, owner: String, status: String, gate: String, evidence: String) {
        self.name = name
        self.owner = owner
        self.status = status
        self.gate = gate
        self.evidence = evidence
    }

    public var isComplete: Bool {
        !name.isEmpty && !owner.isEmpty && !status.isEmpty && !gate.isEmpty && !evidence.isEmpty
    }
}

public enum SeisCommandCenterOperationsReadinessSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisCommandCenterOperationsReadinessSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let decisionState: String
    public let purpose: String
    public let qualityGate: String
    public let commandCenterSurface: String
    public let requiredReadinessAreas: [String]
    public let summaryCards: [SeisCommandCenterOperationsSummaryCard]
    public let checks: [SeisCommandCenterOperationsCheck]
    public let completionRule: String

    public init(
        id: String,
        version: String,
        status: String,
        decisionState: String,
        purpose: String,
        qualityGate: String,
        commandCenterSurface: String,
        requiredReadinessAreas: [String],
        summaryCards: [SeisCommandCenterOperationsSummaryCard],
        checks: [SeisCommandCenterOperationsCheck],
        completionRule: String
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.decisionState = decisionState
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.commandCenterSurface = commandCenterSurface
        self.requiredReadinessAreas = requiredReadinessAreas
        self.summaryCards = summaryCards
        self.checks = checks
        self.completionRule = completionRule
    }

    public static func validated(from data: Data) throws -> SeisCommandCenterOperationsReadinessSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisCommandCenterOperationsReadinessSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisCommandCenterOperationsReadinessSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-command-center-operations-readiness" { issues.append("operations readiness id must identify the canonical record") }
        if status != "active" || decisionState != "review-before-release" { issues.append("operations readiness must remain review-before-release") }
        if [version, purpose, commandCenterSurface, completionRule].contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) { issues.append("operations readiness identity is incomplete") }
        if !qualityGate.hasPrefix("npm run check:") || commandCenterSurface != "apps/seis-core" { issues.append("operations readiness quality surface is invalid") }
        if requiredReadinessAreas != ["release", "ci", "security", "rollback", "handoff"] { issues.append("operations readiness areas are not canonical") }
        if summaryCards.count != 4 || !summaryCards.allSatisfy(\.isComplete) { issues.append("operations readiness must contain four complete summary cards") }
        if checks.count != 6 || !checks.allSatisfy(\.isComplete) { issues.append("operations readiness must contain six complete checks") }
        if !completionRule.localizedCaseInsensitiveContains("release-ready") || !completionRule.localizedCaseInsensitiveContains("rollback proof") { issues.append("operations readiness completion rule is incomplete") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isReviewBeforeRelease: Bool {
        isValid && decisionState == "review-before-release"
    }
}
