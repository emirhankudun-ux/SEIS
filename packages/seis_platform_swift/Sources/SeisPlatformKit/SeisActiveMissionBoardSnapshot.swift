import Foundation

public struct SeisActiveMissionGoalTrace: Codable, Equatable, Sendable {
    public let id: String
    public let northStar: String
    public let workflow: [String]
    public let priorityFocusAreas: [String]
    public let avoid: [String]
}

public struct SeisActiveMissionFocusWindow: Codable, Equatable, Sendable {
    public let weeks: Int
    public let dailyRule: String
    public let weeklyRule: String
}

public struct SeisActiveMissionMonthWindow: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let dayRange: String
    public let laneId: String
    public let theme: String
    public let acceptanceGates: [String]
    public let evidencePaths: [String]
}

public struct SeisActiveMissionLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let waveId: String
    public let wipLimit: Int
    public let cadence: String
}

public struct SeisActiveMissionInstallPolicy: Codable, Equatable, Sendable {
    public let `default`: String
    public let allowedWhen: [String]
}

public struct SeisActiveMissionCard: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let laneId: String
    public let missionId: String
    public let order: Int
    public let title: String
    public let domainId: String
    public let agentRole: String
    public let platformScope: [String]
    public let primaryLanguages: [String]
    public let qualityGates: [String]
    public let dependencies: [String]
    public let executionMode: String
    public let runtimeInstallPolicy: String

    public var isComplete: Bool {
        ![id, laneId, missionId, title, domainId, agentRole, executionMode, runtimeInstallPolicy]
            .contains(where: { $0.isEmpty }) &&
            !platformScope.isEmpty && !primaryLanguages.isEmpty && !qualityGates.isEmpty
    }
}

public struct SeisActiveMissionSummary: Codable, Equatable, Sendable {
    public let laneCount: Int
    public let monthWindowCount: Int
    public let cardCount: Int
    public let nowCount: Int
    public let nextCount: Int
    public let queuedCount: Int
    public let platformCoverageCount: Int
    public let languageCoverageCount: Int
    public let qualityGateCoverageCount: Int
    public let acceptanceGateCoverageCount: Int
}

public enum SeisActiveMissionBoardSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisActiveMissionBoardSnapshot: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let mode: String
    public let sourcePlan: String
    public let masterGoalTrace: SeisActiveMissionGoalTrace
    public let focusWindow: SeisActiveMissionFocusWindow
    public let monthWindows: [SeisActiveMissionMonthWindow]
    public let installPolicy: SeisActiveMissionInstallPolicy
    public let summary: SeisActiveMissionSummary
    public let lanes: [SeisActiveMissionLane]
    public let platformCoverage: [String]
    public let languageCoverage: [String]
    public let qualityGateCoverage: [String]
    public let acceptanceGateCoverage: [String]
    public let cards: [SeisActiveMissionCard]

    public static func validated(from data: Data) throws -> SeisActiveMissionBoardSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else { throw SeisActiveMissionBoardSnapshotError.invalidData }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else { throw SeisActiveMissionBoardSnapshotError.invalidSnapshot(issues) }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if version != 1 || id != "seis-active-mission-board" || mode != "first_90_days_execution_board" || sourcePlan != "seis-long-horizon-mission-kernel" { issues.append("active mission board identity is invalid") }
        if masterGoalTrace.id != "seis-v12-master-prompt-trace" || !masterGoalTrace.northStar.localizedCaseInsensitiveContains("Apple-first") || masterGoalTrace.workflow.count != 7 || masterGoalTrace.priorityFocusAreas.count != 10 || masterGoalTrace.avoid.isEmpty { issues.append("active mission board goal trace is incomplete") }
        if focusWindow.weeks != 12 || focusWindow.dailyRule.isEmpty || focusWindow.weeklyRule.isEmpty { issues.append("active mission board focus window is invalid") }
        if monthWindows.count != 3 || lanes.count != 3 || cards.count != 30 { issues.append("active mission board windows, lanes, or cards are incomplete") }
        if summary.laneCount != 3 || summary.monthWindowCount != 3 || summary.cardCount != 30 || summary.nowCount != 10 || summary.nextCount != 10 || summary.queuedCount != 10 || summary.platformCoverageCount != 5 || summary.languageCoverageCount != 29 || summary.qualityGateCoverageCount != 41 || summary.acceptanceGateCoverageCount != 12 { issues.append("active mission board summary counts are invalid") }
        if platformCoverage.count != 5 || languageCoverage.count != 29 || qualityGateCoverage.count != 41 || acceptanceGateCoverage.count != 12 { issues.append("active mission board coverage arrays are incomplete") }
        if installPolicy.default != "do_not_install_new_runtime_for_language_percentage" || installPolicy.allowedWhen.isEmpty { issues.append("active mission board install policy is invalid") }
        if lanes.map(\.id) != ["now", "next", "queued"] || !lanes.allSatisfy({ $0.wipLimit == 10 && !$0.cadence.isEmpty }) { issues.append("active mission board lanes are invalid") }
        let expectedOrders = Array(1...30)
        let laneCounts = Dictionary(grouping: cards, by: \.laneId).mapValues(\.count)
        if cards.map(\.order) != expectedOrders || laneCounts["now"] != 10 || laneCounts["next"] != 10 || laneCounts["queued"] != 10 || !cards.allSatisfy(\.isComplete) { issues.append("active mission board cards are not deterministic and complete") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty }
    public var firstExecutionCards: ArraySlice<SeisActiveMissionCard> { cards.prefix(3) }
}
