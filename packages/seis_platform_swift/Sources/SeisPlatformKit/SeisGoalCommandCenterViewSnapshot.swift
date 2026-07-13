import Foundation

public enum SeisGoalCommandCenterViewSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisGoalCommandCenterViewSnapshot: Codable, Equatable, Identifiable, Sendable {
    public let id: String

    public var viewID: String { id }
    public var finalState: String { summaryString(for: "finalState") ?? "" }
    public var totalGoalCount: Int { summaryInteger(for: "totalGoals") ?? 0 }
    public var activeGoalCount: Int { goalStatusCount(for: "active") ?? 0 }
    public var blockedGoalCount: Int { goalStatusCount(for: "blocked") ?? 0 }
    public var plannedGoalCount: Int { goalStatusCount(for: "planned") ?? 0 }
    public var progressCardCount: Int { progressCards.count }
    public var panelCount: Int { panels.count }
    public var uxGuardCount: Int { uxGuards.count }
    public var sourceRecordCount: Int { sourceRecords.count }
    public var isMetadataOnly: Bool { validationIssues.isEmpty }

    public static func validated(from data: Data) throws -> Self {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisGoalCommandCenterViewSnapshotError.invalidData
        }

        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisGoalCommandCenterViewSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []

        if schemaVersion != 1 || id != "seis-goal-command-center-view" {
            issues.append("goal command center view identity is invalid")
        }
        if updated.isEmpty {
            issues.append("goal command center view update date is missing")
        }
        if mode != "non_llm_command_center_goal_view" {
            issues.append("goal command center view must remain non-LLM metadata-only")
        }
        if finalState != "blocked_by_repository_hygiene" {
            issues.append("goal command center final state must remain blocked_by_repository_hygiene")
        }
        if totalGoalCount != 20 || activeGoalCount != 5 || blockedGoalCount != 3 || plannedGoalCount != 12 {
            issues.append("goal counts must remain 20 total, 5 active, 3 blocked, and 12 planned")
        }
        if activeGoalCount + blockedGoalCount + plannedGoalCount != totalGoalCount {
            issues.append("goal status counts must reconcile to the total goal count")
        }
        if progressCardCount != 20 {
            issues.append("progress card count must match the source contract")
        }
        if panelCount != 24 || Set(panels.keys) != Self.expectedPanelGroupIDs {
            issues.append("panel groups must contain the 24 source-backed panels")
        }
        if uxGuardCount != 4 || !uxGuards.contains("The page is generated from local files and does not require an LLM.") {
            issues.append("UX guards must include the local-file and no-LLM boundary")
        }
        if uxGuards.contains(where: { $0.localizedCaseInsensitiveContains("live") }) {
            issues.append("UX guards must not claim live behavior")
        }
        if sourceRecords != Self.expectedSourceRecords {
            issues.append("source record count and paths must match the source contract")
        }

        return issues
    }

    private static let expectedPanelGroupIDs: Set<String> = [
        "goalList",
        "milestoneTimeline",
        "nextActionQueue",
        "blockedItems",
        "evidence",
        "readinessConnections",
        "decisions",
        "reviewCadence",
        "completedItems",
        "deferredItems",
        "followUpActions",
        "planningHorizons",
        "activeProjects",
        "epics",
        "subtasks",
        "archiveItems",
        "yearlyGoals",
        "quarterlyGoals",
        "monthlyGoals",
        "weeklyPriorities",
        "risks",
        "validationSteps",
        "roadmapLinks",
        "omegaPhaseEvidence"
    ]

    private static let expectedSourceRecords = [
        "content/development/seis-goal-tracking.json",
        "content/development/seis-goal-evidence.json",
        "content/development/seis-goal-execution.json",
        "content/development/seis-goal-review-cadence.json",
        "content/development/seis-goal-progress-ledger.json",
        "content/development/seis-goal-hierarchy.json",
        "content/development/seis-goal-archive-ledger.json",
        "content/development/seis-goal-cycle-plan.json",
        "content/development/seis-goal-risk-register.json",
        "content/development/seis-goal-validation-steps.json",
        "content/development/seis-goal-roadmap-links.json",
        "content/development/seis-universe-omega-phase-evidence.json"
    ]

    private let schemaVersion: Int
    private let updated: String
    private let mode: String
    private let sourceRecords: [String]
    private let summary: [String: JSONValue]
    private let progressCards: [JSONValue]
    private let panels: [String: [JSONValue]]
    private let uxGuards: [String]

    private enum CodingKeys: String, CodingKey {
        case schemaVersion
        case id
        case updated
        case mode
        case sourceRecords
        case summary
        case progressCards
        case panels
        case uxGuards
    }

    private struct SourceDocument: Decodable {
        let schemaVersion: Int
        let id: String
        let updated: String
        let mode: String
        let sourceRecords: [String]
        let summary: [String: JSONValue]
        let progressCards: [JSONValue]
        let panels: [String: [JSONValue]]
        let uxGuards: [String]
    }

    private init(source: SourceDocument) {
        schemaVersion = source.schemaVersion
        id = source.id
        updated = source.updated
        mode = source.mode
        sourceRecords = source.sourceRecords
        summary = source.summary
        progressCards = source.progressCards
        panels = source.panels
        uxGuards = source.uxGuards
    }

    private init(from decoder: Decoder) throws {
        self.init(source: try SourceDocument(from: decoder))
    }

    private func summaryString(for key: String) -> String? {
        guard case let .string(value) = summary[key] else { return nil }
        return value
    }

    private func summaryInteger(for key: String) -> Int? {
        guard let value = summary[key] else { return nil }
        return value.integerValue
    }

    private func goalStatusCount(for status: String) -> Int? {
        guard case let .object(statuses) = summary["goalsByStatus"] else { return nil }
        return statuses[status]?.integerValue
    }

    private func encodeSource(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(schemaVersion, forKey: .schemaVersion)
        try container.encode(id, forKey: .id)
        try container.encode(updated, forKey: .updated)
        try container.encode(mode, forKey: .mode)
        try container.encode(sourceRecords, forKey: .sourceRecords)
        try container.encode(summary, forKey: .summary)
        try container.encode(progressCards, forKey: .progressCards)
        try container.encode(panels, forKey: .panels)
        try container.encode(uxGuards, forKey: .uxGuards)
    }

    public func encode(to encoder: Encoder) throws {
        try encodeSource(to: encoder)
    }
}

private enum JSONValue: Codable, Equatable, Sendable {
    case string(String)
    case integer(Int)
    case decimal(Double)
    case boolean(Bool)
    case object([String: JSONValue])
    case array([JSONValue])
    case null

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(Bool.self) {
            self = .boolean(value)
        } else if let value = try? container.decode(Int.self) {
            self = .integer(value)
        } else if let value = try? container.decode(Double.self) {
            self = .decimal(value)
        } else if let value = try? container.decode([String: JSONValue].self) {
            self = .object(value)
        } else if let value = try? container.decode([JSONValue].self) {
            self = .array(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unsupported JSON value"
            )
        }
    }

    var integerValue: Int? {
        switch self {
        case let .integer(value): return value
        case let .decimal(value) where value.rounded() == value: return Int(value)
        default: return nil
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case let .string(value): try container.encode(value)
        case let .integer(value): try container.encode(value)
        case let .decimal(value): try container.encode(value)
        case let .boolean(value): try container.encode(value)
        case let .object(value): try container.encode(value)
        case let .array(value): try container.encode(value)
        case .null: try container.encodeNil()
        }
    }
}
