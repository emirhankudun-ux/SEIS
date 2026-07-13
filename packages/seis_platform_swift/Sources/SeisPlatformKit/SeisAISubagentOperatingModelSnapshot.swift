import Foundation

public struct SeisAISubagentRuntimeBoundary: Codable, Equatable, Sendable {
    public let currentLevel: String
    public let writeMode: String
    public let backgroundAutomation: String
    public let externalMutation: String
    public let connectorAuthenticationClaim: String
    public let allowedNow: [String]
    public let forbiddenWithoutApproval: [String]

    public init(
        currentLevel: String,
        writeMode: String,
        backgroundAutomation: String,
        externalMutation: String,
        connectorAuthenticationClaim: String,
        allowedNow: [String],
        forbiddenWithoutApproval: [String]
    ) {
        self.currentLevel = currentLevel
        self.writeMode = writeMode
        self.backgroundAutomation = backgroundAutomation
        self.externalMutation = externalMutation
        self.connectorAuthenticationClaim = connectorAuthenticationClaim
        self.allowedNow = allowedNow
        self.forbiddenWithoutApproval = forbiddenWithoutApproval
    }

    public var isSafePlanOnly: Bool {
        currentLevel == "status-and-plan-only" &&
            writeMode == "disabled-until-permission-matrix-and-approval-fixtures-exist" &&
            backgroundAutomation == "disabled" &&
            externalMutation == "requires-explicit-human-approval" &&
            connectorAuthenticationClaim == "not-claimed" &&
            allowedNow.count == 7 &&
            forbiddenWithoutApproval.count == 10
    }
}

public struct SeisAISubagentPermissionLevel: Codable, Equatable, Identifiable, Sendable {
    public let level: String
    public let status: String
    public let allowedActions: [String]
    public let approvalRequired: String
    public let evidenceRequired: [String]
    public let examples: [String]

    public var id: String { level }

    public init(
        level: String,
        status: String,
        allowedActions: [String],
        approvalRequired: String,
        evidenceRequired: [String],
        examples: [String]
    ) {
        self.level = level
        self.status = status
        self.allowedActions = allowedActions
        self.approvalRequired = approvalRequired
        self.evidenceRequired = evidenceRequired
        self.examples = examples
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        level = try container.decode(String.self, forKey: .level)
        status = try container.decode(String.self, forKey: .status)
        allowedActions = try container.decode([String].self, forKey: .allowedActions)
        if let boolValue = try container.decodeIfPresent(Bool.self, forKey: .approvalRequired) {
            approvalRequired = boolValue ? "required" : "not-required"
        } else {
            approvalRequired = try container.decode(String.self, forKey: .approvalRequired)
        }
        evidenceRequired = try container.decode([String].self, forKey: .evidenceRequired)
        examples = try container.decodeIfPresent([String].self, forKey: .examples) ?? []
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if level.isEmpty || status.isEmpty { issues.append("permission level identity must not be empty") }
        if allowedActions.isEmpty || evidenceRequired.isEmpty { issues.append("permission level \(level) must include actions and evidence") }
        if level == "read-only" || level == "plan-only" {
            if status != "enabled" { issues.append("permission level \(level) must be enabled") }
        }
        if level == "write-gated" || level == "external-gated" {
            if status != "planned" { issues.append("permission level \(level) must remain planned") }
        }
        if level == "forbidden" && status != "active" { issues.append("forbidden permission level must remain active") }
        return issues
    }

    private enum CodingKeys: String, CodingKey {
        case level
        case status
        case allowedActions
        case approvalRequired
        case evidenceRequired
        case examples
    }
}

public struct SeisAISubagentLaneOperatingBinding: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let subAgentRole: String
    public let statusTool: String
    public let planTool: String
    public let currentPermissionLevel: String
    public let sourceMirror: String
    public let skillPath: String
    public let qualityGate: String
    public let fiveYearDuty: String

    public init(
        id: String,
        displayName: String,
        subAgentRole: String,
        statusTool: String,
        planTool: String,
        currentPermissionLevel: String,
        sourceMirror: String,
        skillPath: String,
        qualityGate: String,
        fiveYearDuty: String
    ) {
        self.id = id
        self.displayName = displayName
        self.subAgentRole = subAgentRole
        self.statusTool = statusTool
        self.planTool = planTool
        self.currentPermissionLevel = currentPermissionLevel
        self.sourceMirror = sourceMirror
        self.skillPath = skillPath
        self.qualityGate = qualityGate
        self.fiveYearDuty = fiveYearDuty
    }

    public var validationIssues: [String] {
        let fields = [id, displayName, subAgentRole, statusTool, planTool, currentPermissionLevel, sourceMirror, skillPath, qualityGate, fiveYearDuty]
        var issues: [String] = []
        if fields.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) { issues.append("sub-agent lane \(id) has empty fields") }
        if currentPermissionLevel != "plan-only" { issues.append("sub-agent lane \(id) must remain plan-only") }
        return issues
    }
}

public struct SeisAISubagentRoadmapEntry: Codable, Equatable, Identifiable, Sendable {
    public let year: Int
    public let theme: String
    public let requiredEvidence: [String]
    public let promotionGate: String

    public var id: Int { year }

    public init(year: Int, theme: String, requiredEvidence: [String], promotionGate: String) {
        self.year = year
        self.theme = theme
        self.requiredEvidence = requiredEvidence
        self.promotionGate = promotionGate
    }

    public var validationIssues: [String] {
        if year < 1 || theme.isEmpty || requiredEvidence.isEmpty || promotionGate.isEmpty {
            return ["sub-agent roadmap year \(year) is incomplete"]
        }
        return []
    }
}

public struct SeisAISubagentCadence: Codable, Equatable, Sendable {
    public let daily: String
    public let weekly: String
    public let monthly: String
    public let quarterly: String
    public let annual: String

    public init(daily: String, weekly: String, monthly: String, quarterly: String, annual: String) {
        self.daily = daily
        self.weekly = weekly
        self.monthly = monthly
        self.quarterly = quarterly
        self.annual = annual
    }

    public var isComplete: Bool {
        [daily, weekly, monthly, quarterly, annual].allSatisfy { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
    }
}

public enum SeisAISubagentOperatingModelSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAISubagentOperatingModelSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let qualityGate: String
    public let sourceOfTruth: [String: String]
    public let runtimeBoundary: SeisAISubagentRuntimeBoundary
    public let permissionMatrix: [SeisAISubagentPermissionLevel]
    public let lanes: [SeisAISubagentLaneOperatingBinding]
    public let fiveYearRoadmap: [SeisAISubagentRoadmapEntry]
    public let cadence: SeisAISubagentCadence
    public let evidenceRequirements: [String]

    public init(
        id: String,
        version: String,
        status: String,
        purpose: String,
        qualityGate: String,
        sourceOfTruth: [String: String],
        runtimeBoundary: SeisAISubagentRuntimeBoundary,
        permissionMatrix: [SeisAISubagentPermissionLevel],
        lanes: [SeisAISubagentLaneOperatingBinding],
        fiveYearRoadmap: [SeisAISubagentRoadmapEntry],
        cadence: SeisAISubagentCadence,
        evidenceRequirements: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.sourceOfTruth = sourceOfTruth
        self.runtimeBoundary = runtimeBoundary
        self.permissionMatrix = permissionMatrix
        self.lanes = lanes
        self.fiveYearRoadmap = fiveYearRoadmap
        self.cadence = cadence
        self.evidenceRequirements = evidenceRequirements
    }

    public static func validated(from data: Data) throws -> SeisAISubagentOperatingModelSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAISubagentOperatingModelSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAISubagentOperatingModelSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-core-subagent-operating-model" { issues.append("operating model id must identify the canonical sub-agent model") }
        if [version, status, purpose, qualityGate].contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("operating model identity fields must not be empty")
        }
        if !runtimeBoundary.isSafePlanOnly { issues.append("sub-agent runtime boundary is unsafe") }
        if permissionMatrix.count != 5 { issues.append("sub-agent permission matrix must contain five levels") }
        if lanes.count != 5 { issues.append("sub-agent operating model must contain five lanes") }
        if fiveYearRoadmap.count != 5 { issues.append("sub-agent operating model must contain five roadmap entries") }
        if evidenceRequirements.count != 14 { issues.append("sub-agent operating model must contain fourteen evidence requirements") }
        if !cadence.isComplete { issues.append("sub-agent operating model cadence is incomplete") }
        for permission in permissionMatrix { issues.append(contentsOf: permission.validationIssues.map { "\(permission.level): \($0)" }) }
        for lane in lanes { issues.append(contentsOf: lane.validationIssues) }
        for entry in fiveYearRoadmap { issues.append(contentsOf: entry.validationIssues) }
        let laneIDs = lanes.map(\.id)
        if Set(laneIDs).count != laneIDs.count { issues.append("sub-agent lane IDs must be unique") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            runtimeBoundary.isSafePlanOnly &&
            lanes.allSatisfy { $0.currentPermissionLevel == "plan-only" } &&
            permissionMatrix.first(where: { $0.level == "write-gated" })?.status == "planned" &&
            permissionMatrix.first(where: { $0.level == "external-gated" })?.status == "planned"
    }
}
