import Foundation

public struct SeisLongHorizonDuration: Codable, Equatable, Sendable {
    public let weeks: Int
    public let cadence: [String: String]
}

public struct SeisLongHorizonInstallPolicy: Codable, Equatable, Sendable {
    public let `default`: String
    public let allowedWhen: [String]
}

public struct SeisLongHorizonSourceReferences: Codable, Equatable, Sendable {
    public let capabilityKernel: String
    public let platformKernel: String
    public let refreshCommand: String
}

public struct SeisLongHorizonWave: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let horizon: String
    public let lane: String
    public let agent_role: String
    public let languages: [String]
}

public struct SeisLongHorizonMission: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let order: Int
    public let waveId: String
    public let waveLabel: String
    public let horizon: String
    public let lane: String
    public let agentRole: String
    public let domainId: String
    public let platformScope: [String]
    public let label: String
    public let intent: String
    public let requiredOutputs: [String]
    public let qualityGates: [String]
    public let primaryLanguages: [String]
    public let dependencies: [String]
    public let status: String

    public var isComplete: Bool {
        ![id, waveId, waveLabel, horizon, lane, agentRole, domainId, label, intent, status]
            .contains(where: { $0.isEmpty }) &&
            !platformScope.isEmpty && !requiredOutputs.isEmpty && !qualityGates.isEmpty && !primaryLanguages.isEmpty
    }
}

public struct SeisLongHorizonSummary: Codable, Equatable, Sendable {
    public let waveCount: Int
    public let missionCount: Int
    public let domainCoverageCount: Int
    public let languageCoverageCount: Int
    public let appleMissionCount: Int
    public let windowsMissionCount: Int
    public let minimumQualityGateCount: Int
}

public enum SeisLongHorizonMissionKernelSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisLongHorizonMissionKernelSnapshot: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let mode: String
    public let duration: SeisLongHorizonDuration
    public let installPolicy: SeisLongHorizonInstallPolicy
    public let sourceReferences: SeisLongHorizonSourceReferences
    public let summary: SeisLongHorizonSummary
    public let domainCoverage: [String]
    public let languageCoverage: [String]
    public let waves: [SeisLongHorizonWave]
    public let missions: [SeisLongHorizonMission]

    public static func validated(from data: Data) throws -> SeisLongHorizonMissionKernelSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else { throw SeisLongHorizonMissionKernelSnapshotError.invalidData }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else { throw SeisLongHorizonMissionKernelSnapshotError.invalidSnapshot(issues) }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if version != 1 || id != "seis-long-horizon-mission-kernel" || mode != "aggressive_long_duration_execution_backlog" { issues.append("long-horizon mission kernel identity is invalid") }
        if duration.weeks != 52 || duration.cadence.count != 3 || installPolicy.default != "do_not_install_new_runtime_for_language_percentage" || installPolicy.allowedWhen.isEmpty { issues.append("long-horizon duration or install policy is invalid") }
        if sourceReferences.capabilityKernel != "content/development/seis-universal-capability-kernel.json" || sourceReferences.platformKernel.isEmpty || sourceReferences.refreshCommand.isEmpty { issues.append("long-horizon source references are incomplete") }
        if summary.waveCount != 12 || summary.missionCount != 120 || summary.domainCoverageCount != 38 || summary.languageCoverageCount != 35 || summary.appleMissionCount != 20 || summary.windowsMissionCount != 20 || summary.minimumQualityGateCount != 6 { issues.append("long-horizon summary counts are invalid") }
        if domainCoverage.count != 38 || languageCoverage.count != 35 || waves.count != 12 || missions.count != 120 { issues.append("long-horizon coverage arrays are incomplete") }
        let waveIDs = Set(waves.map(\.id))
        let missionIDs = Set(missions.map(\.id))
        let missionWaveCounts = Dictionary(grouping: missions, by: \.waveId).mapValues(\.count)
        let missionDomains = Set(missions.map(\.domainId))
        let missionLanguages = Set(missions.flatMap(\.primaryLanguages))
        let appleMissionCount = missions.filter { mission in
            mission.platformScope.contains(where: { ["ios", "ipados", "macos", "visionos"].contains($0) })
        }.count
        let windowsMissionCount = missions.filter { $0.platformScope.contains("windows") }.count
        let minimumQualityGateCount = missions.map { $0.qualityGates.count }.min() ?? 0
        if waveIDs.count != waves.count || !waves.allSatisfy({ !$0.label.isEmpty && !$0.horizon.isEmpty && !$0.agent_role.isEmpty && !$0.languages.isEmpty }) { issues.append("long-horizon waves are incomplete") }
        if missionIDs.count != missions.count || missionWaveCounts.keys.count != waveIDs.count || !missionWaveCounts.keys.allSatisfy({ waveIDs.contains($0) }) { issues.append("long-horizon mission identities or wave references are invalid") }
        if summary.waveCount != waveIDs.count || summary.missionCount != missions.count || summary.domainCoverageCount != missionDomains.count || summary.languageCoverageCount != missionLanguages.count || summary.appleMissionCount != appleMissionCount || summary.windowsMissionCount != windowsMissionCount || summary.minimumQualityGateCount != minimumQualityGateCount { issues.append("long-horizon summary does not match mission records") }
        let expectedOrders = Array(1...120)
        if missions.map(\.order) != expectedOrders || missionWaveCounts.values.contains(where: { $0 != 10 }) || !missions.allSatisfy(\.isComplete) || !missions.allSatisfy({ $0.status == "planned" }) { issues.append("long-horizon missions are not deterministic planned records") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty }
    public var firstMissions: ArraySlice<SeisLongHorizonMission> { missions.prefix(3) }
}
