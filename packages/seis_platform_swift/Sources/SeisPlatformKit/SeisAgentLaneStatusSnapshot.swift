import Foundation

public struct SeisAgentLaneStatusRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let status: String
    public let skillPath: String
    public let agentManifest: String
    public let autonomyLevel: String
    public let toolBoundary: String
    public let safetyBoundary: String
    public let validationDuty: String

    public var isComplete: Bool {
        ![id, displayName, skillPath, agentManifest, autonomyLevel, toolBoundary, safetyBoundary, validationDuty]
            .contains(where: \.isEmpty) &&
            status == "active"
    }
}

public enum SeisAgentLaneStatusSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAgentLaneStatusSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let qualityGate: String
    public let safetyRules: [String]
    public let lanes: [SeisAgentLaneStatusRecord]

    public static func validated(from data: Data) throws -> SeisAgentLaneStatusSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAgentLaneStatusSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAgentLaneStatusSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-agent-lane-status" || status != "active" || qualityGate != "npm run check:seis-agent-lane-status" { issues.append("agent lane status identity or quality gate is invalid") }
        if purpose.isEmpty || safetyRules.count < 5 || !safetyRules.contains("Agents must be observable and controllable.") || !safetyRules.contains("Agents must not expose secrets or credentials.") || !safetyRules.contains("Agents must not perform destructive operations without explicit approval.") { issues.append("agent lane safety rules are incomplete") }
        let laneIDs = Set(lanes.map(\.id))
        let requiredLaneIDs: Set<String> = [
            "seis-god-mode-developer",
            "seis-focus-mode",
            "seis-master-prompt",
            "seis-security-review",
            "seis-github-workflow",
            "seis-hub",
            "seis-cloud",
            "seis-code",
            "seis-design",
            "seis-data",
            "seis-security",
            "seis-research",
            "seis-automation",
            "seis-product"
        ]
        if lanes.count != 14 || laneIDs.count != lanes.count || laneIDs != requiredLaneIDs || !lanes.allSatisfy(\.isComplete) { issues.append("agent lane inventory is incomplete or not active") }
        let personalLaneIDs: Set<String> = ["seis-hub", "seis-cloud", "seis-code", "seis-design", "seis-data"]
        if !personalLaneIDs.isSubset(of: laneIDs) { issues.append("personal SEIS lane coverage is incomplete") }
        if lanes.contains(where: { $0.safetyBoundary.isEmpty || $0.toolBoundary.isEmpty || $0.validationDuty.isEmpty }) { issues.append("agent lane governance boundaries are incomplete") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty && lanes.allSatisfy(\.isComplete) }
    public var activeLaneCount: Int { lanes.filter { $0.status == "active" }.count }
    public var personalLaneCount: Int { Set(["seis-hub", "seis-cloud", "seis-code", "seis-design", "seis-data"]).intersection(Set(lanes.map(\.id))).count }
    public var firstLanes: ArraySlice<SeisAgentLaneStatusRecord> { lanes.prefix(3) }
}
