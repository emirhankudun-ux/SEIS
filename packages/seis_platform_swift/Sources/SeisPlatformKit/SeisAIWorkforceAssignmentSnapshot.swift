import Foundation

public struct SeisAIWorkforceWriterPolicy: Codable, Equatable, Sendable {
    public let primaryWriter: String
    public let rule: String
    public let handoffRequirement: String

    public init(primaryWriter: String, rule: String, handoffRequirement: String) {
        self.primaryWriter = primaryWriter
        self.rule = rule
        self.handoffRequirement = handoffRequirement
    }
}

public struct SeisAIWorkforceLauncherEvidence: Codable, Equatable, Sendable {
    public let command: String
    public let observedDate: String
    public let notes: [String]

    public init(command: String, observedDate: String, notes: [String]) {
        self.command = command
        self.observedDate = observedDate
        self.notes = notes
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if command.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("launcher evidence command must not be empty") }
        if observedDate.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("launcher evidence observedDate must not be empty") }
        if notes.isEmpty || notes.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("launcher evidence notes must be non-empty")
        }
        return issues
    }
}

public struct SeisAIWorkforceAssignment: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let route: String
    public let launcherStatus: String
    public let category: String
    public let coreDuties: [String]
    public let allowedOutputs: [String]
    public let deniedActions: [String]
    public let validationDuty: String

    public init(
        id: String,
        displayName: String,
        route: String,
        launcherStatus: String,
        category: String,
        coreDuties: [String],
        allowedOutputs: [String],
        deniedActions: [String],
        validationDuty: String
    ) {
        self.id = id
        self.displayName = displayName
        self.route = route
        self.launcherStatus = launcherStatus
        self.category = category
        self.coreDuties = coreDuties
        self.allowedOutputs = allowedOutputs
        self.deniedActions = deniedActions
        self.validationDuty = validationDuty
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("assignment id must not be empty") }
        if displayName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("assignment displayName must not be empty") }
        if route.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("assignment route must not be empty") }
        if launcherStatus.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("assignment launcherStatus must not be empty") }
        if category.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("assignment category must not be empty") }
        if coreDuties.isEmpty { issues.append("assignment coreDuties must not be empty") }
        if allowedOutputs.isEmpty { issues.append("assignment allowedOutputs must not be empty") }
        if deniedActions.isEmpty { issues.append("assignment deniedActions must not be empty") }
        if validationDuty.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("assignment validationDuty must not be empty") }
        return issues
    }
}

public enum SeisAIWorkforceAssignmentSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAIWorkforceAssignmentSnapshot: Codable, Equatable, Sendable {
    private static let expectedLauncherCommand = "npm run ai -- list"
    private static let expectedLauncherObservedDate = "2026-06-23"
    private static let expectedLauncherNotes = [
        "The command checks local route readiness only.",
        "No provider call, repository upload, secret read, or live model verification was performed.",
        "Missing environment-variable status does not prove a credential does not exist outside the current shell.",
    ]
    private static let expectedTruthBoundary = "Workforce assignments are source-backed role and launcher metadata. Installed status is not live-model, authentication, provider-call, execution, or external-mutation evidence; Codex remains the only repository writer by default."
    private static let allowedLauncherStatuses = Set([
        "installed",
        "route-defined-current-shell-missing-key",
        "pr-dependent",
        "remote-ci",
        "route-defined-current-shell-missing-command",
    ])
    private static let requiredApprovalClaims = [
        "push to main",
        "merge",
        "deployment",
        "SSH command execution",
        "paid or live provider smoke tests",
    ]

    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let writerPolicy: SeisAIWorkforceWriterPolicy
    public let currentLauncherEvidence: SeisAIWorkforceLauncherEvidence
    public let truthBoundary: String
    public let approvalRequiredFor: [String]
    public let assignments: [SeisAIWorkforceAssignment]

    public init(
        id: String,
        version: String,
        status: String,
        purpose: String,
        writerPolicy: SeisAIWorkforceWriterPolicy,
        currentLauncherEvidence: SeisAIWorkforceLauncherEvidence,
        truthBoundary: String,
        approvalRequiredFor: [String],
        assignments: [SeisAIWorkforceAssignment]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.purpose = purpose
        self.writerPolicy = writerPolicy
        self.currentLauncherEvidence = currentLauncherEvidence
        self.truthBoundary = truthBoundary
        self.approvalRequiredFor = approvalRequiredFor
        self.assignments = assignments
    }

    public static func validated(from data: Data) throws -> SeisAIWorkforceAssignmentSnapshot {
        let decoder = JSONDecoder()
        guard let snapshot = try? decoder.decode(SeisAIWorkforceAssignmentSnapshot.self, from: data) else {
            throw SeisAIWorkforceAssignmentSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAIWorkforceAssignmentSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-workforce-assignments" { issues.append("workforce snapshot id must identify the canonical assignment registry") }
        if version.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("workforce snapshot version must not be empty") }
        if status != "documented" { issues.append("workforce snapshot status must remain documented") }
        if purpose.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("workforce snapshot purpose must not be empty") }
        if writerPolicy.primaryWriter != "codex" { issues.append("workforce writer policy must keep Codex as primary writer") }
        if writerPolicy.rule.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("workforce writer policy rule must not be empty") }
        if writerPolicy.handoffRequirement.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("workforce handoff requirement must not be empty") }
        if assignments.count != 10 { issues.append("workforce assignments must expose exactly ten roles") }
        issues.append(contentsOf: currentLauncherEvidence.validationIssues)
        if currentLauncherEvidence.command != Self.expectedLauncherCommand { issues.append("launcher evidence command must remain local-readiness-only") }
        if currentLauncherEvidence.observedDate != Self.expectedLauncherObservedDate { issues.append("launcher evidence observedDate must match the recorded local check") }
        if currentLauncherEvidence.notes != Self.expectedLauncherNotes { issues.append("launcher evidence notes must remain local-readiness-only") }
        if truthBoundary != Self.expectedTruthBoundary { issues.append("workforce truth boundary must remain source-backed and metadata-only") }
        if approvalRequiredFor.isEmpty || Self.requiredApprovalClaims.contains(where: { !approvalRequiredFor.contains($0) }) {
            issues.append("workforce approvalRequiredFor must include mutation and live-provider gates")
        }

        let duplicateIDs = assignments
            .reduce(into: [String: Int]()) { counts, assignment in counts[assignment.id, default: 0] += 1 }
            .filter { $0.value > 1 }
            .map(\.key)
            .sorted()
        if !duplicateIDs.isEmpty { issues.append("duplicate workforce assignment IDs: \(duplicateIDs.joined(separator: ", "))") }
        for assignment in assignments {
            if !assignment.validationIssues.isEmpty {
                issues.append(contentsOf: assignment.validationIssues.map { "\(assignment.id): \($0)" })
            }
            if !Self.allowedLauncherStatuses.contains(assignment.launcherStatus) {
                issues.append("\(assignment.id): launcherStatus is not allowlisted")
            }
        }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }

    public var launcherStatuses: [String: Int] {
        assignments.reduce(into: [String: Int]()) { counts, assignment in
            counts[assignment.launcherStatus, default: 0] += 1
        }
    }

    public var isMetadataOnly: Bool {
        isValid && assignments.allSatisfy { !$0.deniedActions.isEmpty }
    }
}
