import Foundation

public enum SeisSecondBrainReviewOutcome: String, CaseIterable, Codable, Hashable, Identifiable, Sendable {
    case draft
    case needsMoreEvidence = "needs-more-evidence"
    case approvedForHumanFollowUp = "approved-for-human-follow-up"
    case rejected

    public var id: String { rawValue }

    public var label: String {
        switch self {
        case .draft:
            "Draft"
        case .needsMoreEvidence:
            "Needs more evidence"
        case .approvedForHumanFollowUp:
            "Approved for human follow-up"
        case .rejected:
            "Rejected"
        }
    }
}

public struct SeisSecondBrainReviewOutcomeRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let assignmentId: String
    public let agentRole: String
    public let pluginLaneId: String
    public let brief: String
    public let outcome: SeisSecondBrainReviewOutcome
    public let requiresHumanApproval: Bool
    public let externalActionAllowed: Bool
    public let agentExecutionAllowed: Bool
    public let recordedAt: String

    public init(
        id: String,
        assignmentId: String,
        agentRole: String,
        pluginLaneId: String,
        brief: String,
        outcome: SeisSecondBrainReviewOutcome,
        requiresHumanApproval: Bool = true,
        externalActionAllowed: Bool = false,
        agentExecutionAllowed: Bool = false,
        recordedAt: String
    ) {
        self.id = id
        self.assignmentId = assignmentId
        self.agentRole = agentRole
        self.pluginLaneId = pluginLaneId
        self.brief = brief
        self.outcome = outcome
        self.requiresHumanApproval = requiresHumanApproval
        self.externalActionAllowed = externalActionAllowed
        self.agentExecutionAllowed = agentExecutionAllowed
        self.recordedAt = recordedAt
    }

    public var isTraceable: Bool {
        !id.isEmpty &&
            !assignmentId.isEmpty &&
            !agentRole.isEmpty &&
            !pluginLaneId.isEmpty &&
            !brief.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            brief.count <= 600 &&
            !recordedAt.isEmpty &&
            requiresHumanApproval &&
            !externalActionAllowed &&
            !agentExecutionAllowed
    }
}

public struct SeisSecondBrainReviewOutcomeSnapshot: Codable, Equatable, Sendable {
    public static let storagePolicy = "Native local-first review records; never persist provider credentials, private vault bodies, or external action authority."

    public let records: [SeisSecondBrainReviewOutcomeRecord]

    public init(records: [SeisSecondBrainReviewOutcomeRecord]) {
        self.records = records
    }

    public var isReady: Bool {
        records.allSatisfy(\.isTraceable)
    }

    public func count(for outcome: SeisSecondBrainReviewOutcome) -> Int {
        records.count { $0.outcome == outcome }
    }

    public var summaryLabel: String {
        SeisSecondBrainReviewOutcome.allCases
            .map { "\($0.label): \(count(for: $0))" }
            .joined(separator: " · ")
    }

    public var externalActionCount: Int {
        records.count { $0.externalActionAllowed }
    }

    public var agentExecutionCount: Int {
        records.count { $0.agentExecutionAllowed }
    }

    public static var empty: Self {
        Self(records: [])
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisSecondBrainReviewOutcome",
            "SeisSecondBrainReviewOutcomeRecord",
            "SeisSecondBrainReviewOutcomeSnapshot",
            "local-first",
            "never persist provider credentials",
            "approved-for-human-follow-up",
            "externalActionAllowed",
            "agentExecutionAllowed"
        ]
    }
}

public final class SeisSecondBrainReviewOutcomeHistoryStore: @unchecked Sendable {
    private let lock = NSLock()
    private var recordsById: [String: SeisSecondBrainReviewOutcomeRecord] = [:]

    public init(records: [SeisSecondBrainReviewOutcomeRecord] = []) {
        records.forEach { recordsById[$0.id] = $0 }
    }

    @discardableResult
    public func save(_ record: SeisSecondBrainReviewOutcomeRecord) -> SeisSecondBrainReviewOutcomeRecord {
        lock.lock()
        defer { lock.unlock() }
        recordsById[record.id] = record
        return record
    }

    public func snapshot() -> SeisSecondBrainReviewOutcomeSnapshot {
        lock.lock()
        defer { lock.unlock() }
        let records = recordsById.values.sorted {
            if $0.recordedAt == $1.recordedAt { return $0.id < $1.id }
            return $0.recordedAt < $1.recordedAt
        }
        return SeisSecondBrainReviewOutcomeSnapshot(records: records)
    }
}
