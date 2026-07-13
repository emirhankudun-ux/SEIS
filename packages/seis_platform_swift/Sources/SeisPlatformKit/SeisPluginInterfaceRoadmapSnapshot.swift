import Foundation

public struct SeisPluginInterfaceRecord: Codable, Equatable, Sendable {
    public let id: String
    public let handle: String
    public let title: String
    public let status: String
    public let stage: String
    public let risk: String
    public let purpose: String
    public let currentSurface: String
    public let nextAction: String
    public let evidence: [String]
}

public struct SeisPluginInterfaceYearRecord: Codable, Equatable, Sendable {
    public let year: String
    public let phase: String
    public let focus: String
    public let validation: String
}

public struct SeisPluginLaneCommitment: Codable, Equatable, Sendable {
    public let id: String
    public let focus: String
    public let interfaceOutcome: String
    public let validationGate: String
}

public struct SeisPluginDevelopmentProgramRecord: Codable, Equatable, Sendable {
    public let year: String
    public let theme: String
    public let operatingPosture: String
    public let laneCommitments: [SeisPluginLaneCommitment]
}

public struct SeisPluginCadencePeriod: Codable, Equatable, Sendable {
    public let id: String
    public let label: String
    public let purpose: String
    public let reviewGate: String
}

public struct SeisPluginLaneRoutine: Codable, Equatable, Sendable {
    public let id: String
    public let h1: String
    public let h2: String
}

public struct SeisPluginDevelopmentCadence: Codable, Equatable, Sendable {
    public let periods: [SeisPluginCadencePeriod]
    public let laneRoutines: [SeisPluginLaneRoutine]
}

public struct SeisPluginMaturityMarker: Codable, Equatable, Sendable {
    public let label: String
    public let value: String
    public let detail: String
}

public struct SeisPluginMaturitySignals: Codable, Equatable, Sendable {
    public let headline: String
    public let posture: String
    public let markers: [SeisPluginMaturityMarker]
}

public struct SeisPluginInterfaceReadiness: Codable, Equatable, Sendable {
    public let id: String
    public let currentMode: String
    public let allowedActions: [String]
    public let blockedActions: [String]
    public let nextReview: String
    public let reviewCadence: String
    public let evidenceGate: String
    public let promotionGate: String
}

public enum SeisPluginInterfaceRoadmapSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisPluginInterfaceRoadmapSnapshot: Codable, Equatable, Identifiable, Sendable {
    public static let sourcePath = "content/development/seis-plugin-interface-roadmap.json"
    public static let expectedInterfaceIDs = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]
    public static let expectedYears = ["2026", "2027", "2028", "2029", "2030"]

    public let generatedAt: String
    public let status: String
    public let summary: String
    public let interfaces: [SeisPluginInterfaceRecord]
    public let fiveYearHorizon: [SeisPluginInterfaceYearRecord]
    public let developmentProgram: [SeisPluginDevelopmentProgramRecord]
    public let developmentCadence: SeisPluginDevelopmentCadence
    public let maturitySignals: SeisPluginMaturitySignals
    public let interfaceReadiness: [SeisPluginInterfaceReadiness]

    public var id: String { "seis-plugin-interface-roadmap" }
    public var interfaceCount: Int { interfaces.count }
    public var yearCount: Int { fiveYearHorizon.count }
    public var laneYearCommitmentCount: Int {
        developmentProgram.reduce(0) { $0 + $1.laneCommitments.count }
    }
    public var cadenceLoopCount: Int {
        developmentCadence.periods.count * developmentCadence.laneRoutines.count
    }
    public var readinessGateCount: Int { interfaceReadiness.count }
    public var liveActionCount: Int {
        Int(maturitySignals.markers.first(where: { $0.label == "live actions" })?.value ?? "") ?? -1
    }
    public var isMetadataOnly: Bool {
        validationIssues.isEmpty && status == "documented-static-interface" && liveActionCount == 0
    }

    public func interfaceRecord(for id: String) -> SeisPluginInterfaceRecord? {
        interfaces.first(where: { $0.id == id })
    }

    public func horizonRecord(for year: String) -> SeisPluginInterfaceYearRecord? {
        fiveYearHorizon.first(where: { $0.year == year })
    }

    public func commitment(for laneID: String, year: String) -> SeisPluginLaneCommitment? {
        developmentProgram.first(where: { $0.year == year })?.laneCommitments.first(where: { $0.id == laneID })
    }

    public func laneRoutine(for laneID: String) -> SeisPluginLaneRoutine? {
        developmentCadence.laneRoutines.first(where: { $0.id == laneID })
    }

    public func readinessRecord(for id: String) -> SeisPluginInterfaceReadiness? {
        interfaceReadiness.first(where: { $0.id == id })
    }

    public static func validated(from data: Data) throws -> Self {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisPluginInterfaceRoadmapSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisPluginInterfaceRoadmapSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let interfaceIDs = interfaces.map(\.id)
        let horizonYears = fiveYearHorizon.map(\.year)
        let programYears = developmentProgram.map(\.year)
        let readinessIDs = interfaceReadiness.map(\.id)

        if generatedAt != "2026-06-22" || status != "documented-static-interface" || !summary.contains("@seis") {
            issues.append("plugin interface roadmap identity or status is invalid")
        }
        if interfaceIDs != Self.expectedInterfaceIDs || interfaces.contains(where: { $0.handle != "@\($0.id)" }) {
            issues.append("plugin interface lane ids and handles must remain source-backed")
        }
        if interfaces.contains(where: { $0.evidence.isEmpty || $0.purpose.isEmpty || $0.nextAction.isEmpty }) {
            issues.append("plugin interface records must retain purpose, next action, and evidence")
        }
        if horizonYears != Self.expectedYears {
            issues.append("plugin interface horizon must cover 2026 through 2030")
        }
        if programYears != Self.expectedYears || developmentProgram.contains(where: { $0.laneCommitments.count != 5 }) {
            issues.append("plugin development program must contain five lanes for every year")
        }
        if developmentProgram.contains(where: { Set($0.laneCommitments.map(\.id)) != Set(Self.expectedInterfaceIDs) }) {
            issues.append("plugin development commitments must cover every named lane")
        }
        if developmentCadence.periods.map(\.id) != ["H1", "H2"] || Set(developmentCadence.laneRoutines.map(\.id)) != Set(Self.expectedInterfaceIDs) {
            issues.append("plugin development cadence must retain H1/H2 routines for every lane")
        }
        if maturitySignals.markers.count != 4 || liveActionCount != 0 {
            issues.append("plugin maturity signals must retain four markers and zero live actions")
        }
        if readinessIDs != Self.expectedInterfaceIDs || interfaceReadiness.contains(where: { $0.allowedActions.count < 2 || $0.blockedActions.count < 2 || $0.reviewCadence != "H1/H2" }) {
            issues.append("plugin readiness records must remain explicit and review-gated")
        }
        return issues
    }
}
