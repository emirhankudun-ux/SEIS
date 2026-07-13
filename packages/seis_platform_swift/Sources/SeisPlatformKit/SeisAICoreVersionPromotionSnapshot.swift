import Foundation

public struct SeisAICoreVersionPromotionRuntimeBoundary: Codable, Equatable, Sendable {
    public let currentLevel: String
    public let writeExecution: String
    public let backgroundAutomation: String
    public let externalMutation: String
    public let credentialAccess: String
    public let liveProviderCalls: String
    public let coreRequiresCloudApiKey: Bool
    public let dryRunOnly: Bool

    public init(
        currentLevel: String,
        writeExecution: String,
        backgroundAutomation: String,
        externalMutation: String,
        credentialAccess: String,
        liveProviderCalls: String,
        coreRequiresCloudApiKey: Bool,
        dryRunOnly: Bool
    ) {
        self.currentLevel = currentLevel
        self.writeExecution = writeExecution
        self.backgroundAutomation = backgroundAutomation
        self.externalMutation = externalMutation
        self.credentialAccess = credentialAccess
        self.liveProviderCalls = liveProviderCalls
        self.coreRequiresCloudApiKey = coreRequiresCloudApiKey
        self.dryRunOnly = dryRunOnly
    }

    public var isSafePlanOnly: Bool {
        currentLevel == "status-and-plan-only" &&
            writeExecution == "disabled" &&
            backgroundAutomation == "disabled" &&
            externalMutation == "requires-explicit-human-approval" &&
            credentialAccess == "forbidden" &&
            liveProviderCalls == "disabled" &&
            !coreRequiresCloudApiKey &&
            dryRunOnly
    }
}

public struct SeisAICoreVersionPromotionTruthBoundaries: Codable, Equatable, Sendable {
    public let promotionDryRunIsReleaseApproval: Bool
    public let internalReviewIsPublicRelease: Bool
    public let providerRoutingIsModelOwnership: Bool
    public let promptEngineeringIsTraining: Bool
    public let dryRunPermitsExternalMutation: Bool
    public let dryRunPermitsCredentialAccess: Bool

    public init(
        promotionDryRunIsReleaseApproval: Bool,
        internalReviewIsPublicRelease: Bool,
        providerRoutingIsModelOwnership: Bool,
        promptEngineeringIsTraining: Bool,
        dryRunPermitsExternalMutation: Bool,
        dryRunPermitsCredentialAccess: Bool
    ) {
        self.promotionDryRunIsReleaseApproval = promotionDryRunIsReleaseApproval
        self.internalReviewIsPublicRelease = internalReviewIsPublicRelease
        self.providerRoutingIsModelOwnership = providerRoutingIsModelOwnership
        self.promptEngineeringIsTraining = promptEngineeringIsTraining
        self.dryRunPermitsExternalMutation = dryRunPermitsExternalMutation
        self.dryRunPermitsCredentialAccess = dryRunPermitsCredentialAccess
    }

    public var isSafe: Bool {
        !promotionDryRunIsReleaseApproval &&
            !internalReviewIsPublicRelease &&
            !providerRoutingIsModelOwnership &&
            !promptEngineeringIsTraining &&
            !dryRunPermitsExternalMutation &&
            !dryRunPermitsCredentialAccess
    }
}

public struct SeisAICoreVersionPromotionDryRun: Codable, Equatable, Sendable {
    public let requestedVersionTarget: String
    public let decision: String
    public let releasePromotionAllowed: Bool
    public let realExecutionBlocked: Bool
    public let externalMutationPerformed: Bool
    public let credentialAccessPerformed: Bool
    public let reason: String
    public let nextSafeAction: String

    public init(
        requestedVersionTarget: String,
        decision: String,
        releasePromotionAllowed: Bool,
        realExecutionBlocked: Bool,
        externalMutationPerformed: Bool,
        credentialAccessPerformed: Bool,
        reason: String,
        nextSafeAction: String
    ) {
        self.requestedVersionTarget = requestedVersionTarget
        self.decision = decision
        self.releasePromotionAllowed = releasePromotionAllowed
        self.realExecutionBlocked = realExecutionBlocked
        self.externalMutationPerformed = externalMutationPerformed
        self.credentialAccessPerformed = credentialAccessPerformed
        self.reason = reason
        self.nextSafeAction = nextSafeAction
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if requestedVersionTarget.isEmpty { issues.append("promotion dry-run version target must not be empty") }
        if decision.isEmpty { issues.append("promotion dry-run decision must not be empty") }
        if releasePromotionAllowed { issues.append("promotion dry-run must not authorize release promotion") }
        if !realExecutionBlocked { issues.append("promotion dry-run must keep real execution blocked") }
        if externalMutationPerformed { issues.append("promotion dry-run must not perform external mutation") }
        if credentialAccessPerformed { issues.append("promotion dry-run must not access credentials") }
        if reason.isEmpty || nextSafeAction.isEmpty { issues.append("promotion dry-run must include reason and next safe action") }
        return issues
    }
}

public struct SeisAICoreVersionPromotionLaneResponsibility: Codable, Equatable, Identifiable, Sendable {
    public let laneId: String
    public let displayName: String
    public let promotionDuty: String

    public var id: String { laneId }

    public init(laneId: String, displayName: String, promotionDuty: String) {
        self.laneId = laneId
        self.displayName = displayName
        self.promotionDuty = promotionDuty
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if laneId.isEmpty { issues.append("promotion lane id must not be empty") }
        if displayName.isEmpty { issues.append("promotion lane displayName must not be empty") }
        if promotionDuty.isEmpty { issues.append("promotion lane duty must not be empty") }
        return issues
    }
}

public struct SeisAICoreVersionPromotionGate: Codable, Equatable, Identifiable, Sendable {
    public let year: Int
    public let versionTarget: String
    public let status: String
    public let dryRunDecision: String
    public let humanApprovalRequired: Bool
    public let releasePromotionAllowed: Bool
    public let requiredEvidence: [String]
    public let validationCommands: [String]
    public let blockers: [String]
    public let nextSafeAction: String

    public var id: String { versionTarget }

    public init(
        year: Int,
        versionTarget: String,
        status: String,
        dryRunDecision: String,
        humanApprovalRequired: Bool,
        releasePromotionAllowed: Bool,
        requiredEvidence: [String],
        validationCommands: [String],
        blockers: [String],
        nextSafeAction: String
    ) {
        self.year = year
        self.versionTarget = versionTarget
        self.status = status
        self.dryRunDecision = dryRunDecision
        self.humanApprovalRequired = humanApprovalRequired
        self.releasePromotionAllowed = releasePromotionAllowed
        self.requiredEvidence = requiredEvidence
        self.validationCommands = validationCommands
        self.blockers = blockers
        self.nextSafeAction = nextSafeAction
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if year < 1 { issues.append("promotion gate year must be positive") }
        if versionTarget.isEmpty || status.isEmpty || dryRunDecision.isEmpty { issues.append("promotion gate identity fields must not be empty") }
        if releasePromotionAllowed { issues.append("promotion gate \(versionTarget) must not authorize release promotion") }
        if requiredEvidence.isEmpty { issues.append("promotion gate \(versionTarget) must include required evidence") }
        if validationCommands.isEmpty { issues.append("promotion gate \(versionTarget) must include validation commands") }
        if blockers.isEmpty { issues.append("promotion gate \(versionTarget) must include blockers") }
        if nextSafeAction.isEmpty { issues.append("promotion gate \(versionTarget) must include a next safe action") }
        return issues
    }
}

public enum SeisAICoreVersionPromotionSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAICoreVersionPromotionSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let updatedAt: String
    public let purpose: String
    public let qualityGate: String
    public let sourceOfTruth: [String: String]
    public let tooling: [String: String]
    public let runtimeBoundary: SeisAICoreVersionPromotionRuntimeBoundary
    public let truthBoundaries: SeisAICoreVersionPromotionTruthBoundaries
    public let decisionStates: [String]
    public let currentDryRun: SeisAICoreVersionPromotionDryRun
    public let laneResponsibilities: [SeisAICoreVersionPromotionLaneResponsibility]
    public let gates: [SeisAICoreVersionPromotionGate]
    public let forbiddenPromotionClaims: [String]
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: String,
        status: String,
        updatedAt: String,
        purpose: String,
        qualityGate: String,
        sourceOfTruth: [String: String],
        tooling: [String: String],
        runtimeBoundary: SeisAICoreVersionPromotionRuntimeBoundary,
        truthBoundaries: SeisAICoreVersionPromotionTruthBoundaries,
        decisionStates: [String],
        currentDryRun: SeisAICoreVersionPromotionDryRun,
        laneResponsibilities: [SeisAICoreVersionPromotionLaneResponsibility],
        gates: [SeisAICoreVersionPromotionGate],
        forbiddenPromotionClaims: [String],
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.updatedAt = updatedAt
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.sourceOfTruth = sourceOfTruth
        self.tooling = tooling
        self.runtimeBoundary = runtimeBoundary
        self.truthBoundaries = truthBoundaries
        self.decisionStates = decisionStates
        self.currentDryRun = currentDryRun
        self.laneResponsibilities = laneResponsibilities
        self.gates = gates
        self.forbiddenPromotionClaims = forbiddenPromotionClaims
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisAICoreVersionPromotionSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAICoreVersionPromotionSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAICoreVersionPromotionSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-core-version-promotion-gates" { issues.append("promotion snapshot id must identify the canonical gate registry") }
        if version.isEmpty || status.isEmpty || updatedAt.isEmpty || purpose.isEmpty || qualityGate.isEmpty { issues.append("promotion snapshot identity fields must not be empty") }
        if !runtimeBoundary.isSafePlanOnly { issues.append("promotion snapshot runtime boundary is unsafe") }
        if !truthBoundaries.isSafe { issues.append("promotion snapshot truth boundaries are unsafe") }
        if decisionStates.isEmpty { issues.append("promotion snapshot decision states must not be empty") }
        if laneResponsibilities.count != 5 { issues.append("promotion snapshot must include five lane responsibilities") }
        if gates.count != 5 { issues.append("promotion snapshot must include five yearly gates") }
        if forbiddenPromotionClaims.isEmpty { issues.append("promotion snapshot forbidden claims must not be empty") }
        if nextSafeActions.isEmpty { issues.append("promotion snapshot next safe actions must not be empty") }
        issues.append(contentsOf: currentDryRun.validationIssues)
        for lane in laneResponsibilities { issues.append(contentsOf: lane.validationIssues.map { "\(lane.laneId): \($0)" }) }
        for gate in gates { issues.append(contentsOf: gate.validationIssues.map { "\(gate.versionTarget): \($0)" }) }
        let duplicateLanes = laneResponsibilities.map(\.laneId)
        if Set(duplicateLanes).count != duplicateLanes.count { issues.append("promotion lane IDs must be unique") }
        let duplicateGates = gates.map(\.versionTarget)
        if Set(duplicateGates).count != duplicateGates.count { issues.append("promotion gate version targets must be unique") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            runtimeBoundary.isSafePlanOnly &&
            truthBoundaries.isSafe &&
            !currentDryRun.releasePromotionAllowed &&
            currentDryRun.realExecutionBlocked &&
            !currentDryRun.externalMutationPerformed &&
            !currentDryRun.credentialAccessPerformed &&
            gates.allSatisfy { !$0.releasePromotionAllowed }
    }
}
