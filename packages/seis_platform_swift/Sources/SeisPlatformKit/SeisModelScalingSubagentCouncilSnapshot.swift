import Foundation

public struct SeisModelScalingCouncilRule: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let rule: String
    public let status: String

    public init(id: String, rule: String, status: String) {
        self.id = id
        self.rule = rule
        self.status = status
    }

    public var validationIssues: [String] {
        if id.isEmpty || rule.isEmpty || status.isEmpty { return ["council rule is incomplete"] }
        return []
    }
}

public struct SeisModelScalingCouncilAgent: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let lane: String
    public let authority: String
    public let primaryDuty: String
    public let allowedActions: [String]
    public let forbiddenActions: [String]
    public let requiredEvidence: [String]
    public let validationGate: String

    public init(
        id: String,
        displayName: String,
        lane: String,
        authority: String,
        primaryDuty: String,
        allowedActions: [String],
        forbiddenActions: [String],
        requiredEvidence: [String],
        validationGate: String
    ) {
        self.id = id
        self.displayName = displayName
        self.lane = lane
        self.authority = authority
        self.primaryDuty = primaryDuty
        self.allowedActions = allowedActions
        self.forbiddenActions = forbiddenActions
        self.requiredEvidence = requiredEvidence
        self.validationGate = validationGate
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.isEmpty || displayName.isEmpty || lane.isEmpty || primaryDuty.isEmpty || validationGate.isEmpty {
            issues.append("council agent \(id) has incomplete identity")
        }
        if authority != "plan-only" { issues.append("council agent \(id) must remain plan-only") }
        if allowedActions.isEmpty || forbiddenActions.isEmpty || requiredEvidence.isEmpty {
            issues.append("council agent \(id) must include allowed, forbidden, and evidence fields")
        }
        return issues
    }
}

public struct SeisModelScalingStageAssignment: Codable, Equatable, Identifiable, Sendable {
    public let stage: String
    public let status: String
    public let leadAgents: [String]
    public let requiredBeforePromotion: [String]
    public let routeEligibleToday: Bool

    public var id: String { stage }

    public init(stage: String, status: String, leadAgents: [String], requiredBeforePromotion: [String], routeEligibleToday: Bool) {
        self.stage = stage
        self.status = status
        self.leadAgents = leadAgents
        self.requiredBeforePromotion = requiredBeforePromotion
        self.routeEligibleToday = routeEligibleToday
    }

    public var validationIssues: [String] {
        if stage.isEmpty || status.isEmpty || leadAgents.isEmpty || requiredBeforePromotion.isEmpty {
            return ["scaling stage \(stage) is incomplete"]
        }
        if routeEligibleToday { return ["scaling stage \(stage) cannot be route eligible today"] }
        return []
    }
}

public struct SeisModelScalingApexCouncilDuty: Codable, Equatable, Identifiable, Sendable {
    public let agentId: String
    public let duty: String
    public let evidence: [String]

    public var id: String { agentId }

    public init(agentId: String, duty: String, evidence: [String]) {
        self.agentId = agentId
        self.duty = duty
        self.evidence = evidence
    }

    public var validationIssues: [String] {
        if agentId.isEmpty || duty.isEmpty || evidence.isEmpty { return ["apex council duty \(agentId) is incomplete"] }
        return []
    }
}

public enum SeisModelScalingSubagentCouncilSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisModelScalingSubagentCouncilSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let updatedAt: String
    public let qualityGate: String
    public let purpose: String
    public let truthBoundary: String
    public let runtimeBoundary: String
    public let coreCredentialRequirement: String
    public let defaultRuntimeMode: String
    public let routeEligibleToday: Bool
    public let sourceOfTruth: [String: String]
    public let councilRules: [SeisModelScalingCouncilRule]
    public let agents: [SeisModelScalingCouncilAgent]
    public let stageAssignments: [SeisModelScalingStageAssignment]
    public let apex512bCouncilDuties: [SeisModelScalingApexCouncilDuty]
    public let forbiddenClaims: [String]
    public let humanApprovalRequiredFor: [String]
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: String,
        status: String,
        updatedAt: String,
        qualityGate: String,
        purpose: String,
        truthBoundary: String,
        runtimeBoundary: String,
        coreCredentialRequirement: String,
        defaultRuntimeMode: String,
        routeEligibleToday: Bool,
        sourceOfTruth: [String: String],
        councilRules: [SeisModelScalingCouncilRule],
        agents: [SeisModelScalingCouncilAgent],
        stageAssignments: [SeisModelScalingStageAssignment],
        apex512bCouncilDuties: [SeisModelScalingApexCouncilDuty],
        forbiddenClaims: [String],
        humanApprovalRequiredFor: [String],
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.updatedAt = updatedAt
        self.qualityGate = qualityGate
        self.purpose = purpose
        self.truthBoundary = truthBoundary
        self.runtimeBoundary = runtimeBoundary
        self.coreCredentialRequirement = coreCredentialRequirement
        self.defaultRuntimeMode = defaultRuntimeMode
        self.routeEligibleToday = routeEligibleToday
        self.sourceOfTruth = sourceOfTruth
        self.councilRules = councilRules
        self.agents = agents
        self.stageAssignments = stageAssignments
        self.apex512bCouncilDuties = apex512bCouncilDuties
        self.forbiddenClaims = forbiddenClaims
        self.humanApprovalRequiredFor = humanApprovalRequiredFor
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisModelScalingSubagentCouncilSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisModelScalingSubagentCouncilSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisModelScalingSubagentCouncilSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-model-scaling-subagent-council" { issues.append("scaling council id must identify the canonical council") }
        if [version, status, updatedAt, qualityGate, purpose, truthBoundary, runtimeBoundary, coreCredentialRequirement, defaultRuntimeMode].contains(where: { $0.isEmpty }) {
            issues.append("scaling council identity fields must not be empty")
        }
        if runtimeBoundary != "status-and-plan-only" || coreCredentialRequirement != "none" || defaultRuntimeMode != "seis-local-demo" || routeEligibleToday {
            issues.append("scaling council runtime boundary is unsafe")
        }
        let boundaryTerms = ["does not run agents", "download models", "train", "provider", "SSH", "cloud/GPU"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) {
            issues.append("scaling council truth boundary must state \(term)")
        }
        if councilRules.count != 4 { issues.append("scaling council must contain four council rules") }
        if agents.count != 12 { issues.append("scaling council must contain twelve agents") }
        if stageAssignments.count != 5 { issues.append("scaling council must contain five stage assignments") }
        if apex512bCouncilDuties.count != 12 { issues.append("scaling council must contain twelve apex duties") }
        if forbiddenClaims.count != 8 { issues.append("scaling council must contain eight forbidden claims") }
        if humanApprovalRequiredFor.count != 12 { issues.append("scaling council must contain twelve approval boundaries") }
        if nextSafeActions.isEmpty { issues.append("scaling council next safe actions must not be empty") }
        for rule in councilRules { issues.append(contentsOf: rule.validationIssues) }
        for agent in agents { issues.append(contentsOf: agent.validationIssues) }
        for stage in stageAssignments { issues.append(contentsOf: stage.validationIssues) }
        for duty in apex512bCouncilDuties { issues.append(contentsOf: duty.validationIssues) }
        if Set(agents.map(\.id)).count != agents.count { issues.append("scaling council agent IDs must be unique") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            !routeEligibleToday &&
            agents.allSatisfy { $0.authority == "plan-only" } &&
            stageAssignments.allSatisfy { !$0.routeEligibleToday }
    }
}
