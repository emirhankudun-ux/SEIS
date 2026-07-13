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
    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let writerPolicy: SeisAIWorkforceWriterPolicy
    public let assignments: [SeisAIWorkforceAssignment]

    public init(
        id: String,
        version: String,
        status: String,
        purpose: String,
        writerPolicy: SeisAIWorkforceWriterPolicy,
        assignments: [SeisAIWorkforceAssignment]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.purpose = purpose
        self.writerPolicy = writerPolicy
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
        if status.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("workforce snapshot status must not be empty") }
        if purpose.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("workforce snapshot purpose must not be empty") }
        if writerPolicy.primaryWriter != "codex" { issues.append("workforce writer policy must keep Codex as primary writer") }
        if writerPolicy.rule.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("workforce writer policy rule must not be empty") }
        if writerPolicy.handoffRequirement.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("workforce handoff requirement must not be empty") }
        if assignments.isEmpty { issues.append("workforce assignments must not be empty") }

        let duplicateIDs = assignments
            .reduce(into: [String: Int]()) { counts, assignment in counts[assignment.id, default: 0] += 1 }
            .filter { $0.value > 1 }
            .map(\.key)
            .sorted()
        if !duplicateIDs.isEmpty { issues.append("duplicate workforce assignment IDs: \(duplicateIDs.joined(separator: ", "))") }
        for assignment in assignments where !assignment.validationIssues.isEmpty {
            issues.append(contentsOf: assignment.validationIssues.map { "\(assignment.id): \($0)" })
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
