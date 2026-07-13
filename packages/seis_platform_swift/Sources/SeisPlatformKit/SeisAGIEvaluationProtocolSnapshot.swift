import Foundation

public struct SeisAGIEvaluationResearchSource: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let url: String
    public let evidenceType: String
    public let seisImplication: String

    public var isComplete: Bool {
        !id.isEmpty && url.hasPrefix("https://") && !evidenceType.isEmpty && !seisImplication.isEmpty
    }
}

public struct SeisAGIEvaluationResearchBaseline: Codable, Equatable, Sendable {
    public let updatedAt: String
    public let status: String
    public let sources: [SeisAGIEvaluationResearchSource]
}

public struct SeisAGIEvaluationSourceGate: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let sourceIds: [String]
    public let status: String
    public let requiredEvidence: [String]

    public var isSafe: Bool {
        !id.isEmpty && !sourceIds.isEmpty && status == "not-run" && requiredEvidence.count >= 3
    }
}

public struct SeisAGIEvaluationDimension: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let requiredEvidence: [String]

    public var isSafe: Bool {
        !id.isEmpty && status == "not-run" && requiredEvidence.count >= 3
    }
}

public struct SeisAGIEvaluationPromotionDecisionModel: Codable, Equatable, Sendable {
    public let defaultDecision: String
    public let silentPromotionAllowed: Bool
    public let selfApprovalAllowed: Bool
    public let providerWrapperPromotionAllowed: Bool
    public let publicClaimRequiresExternalReview: Bool
    public let routeEligibilityRequiresHumanApproval: Bool
}

public enum SeisAGIEvaluationProtocolSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAGIEvaluationProtocolSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let resourceUri: String
    public let qualityGate: String
    public let coreCredentialRequirement: String
    public let defaultRuntimeMode: String
    public let routeEligibleToday: Bool
    public let runtimeAuthority: Bool
    public let agiClaimAllowed: Bool
    public let evaluationRunStatus: String
    public let benchmarkStatus: String
    public let trainingStatus: String
    public let weightsAvailable: Bool
    public let inferenceAvailable: Bool
    public let productionReady: Bool
    public let truthBoundary: String
    public let sourceOfTruth: [String: String]
    public let publicResearchBaseline: SeisAGIEvaluationResearchBaseline
    public let sourceDerivedReadinessGates: [SeisAGIEvaluationSourceGate]
    public let evaluationDimensions: [SeisAGIEvaluationDimension]
    public let minimumEvidenceBeforeAnyAgiClaim: [String]
    public let negativeControls: [String]
    public let requiredReviewers: [String]
    public let promotionDecisionModel: SeisAGIEvaluationPromotionDecisionModel
    public let forbiddenClaims: [String]

    public static func validated(from data: Data) throws -> SeisAGIEvaluationProtocolSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAGIEvaluationProtocolSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAGIEvaluationProtocolSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-agi-evaluation-protocol" || status != "protocol-draft-not-run" || resourceUri != "seis://ai/agi-evaluation-protocol.json" { issues.append("AGI evaluation protocol identity or status is invalid") }
        if qualityGate != "node scripts/check-seis-agi-evaluation-protocol.mjs" || coreCredentialRequirement != "none" || defaultRuntimeMode != "seis-local-demo" { issues.append("AGI evaluation protocol runtime boundary is invalid") }
        if routeEligibleToday || runtimeAuthority || agiClaimAllowed || evaluationRunStatus != "not-run" || benchmarkStatus != "not-run" || trainingStatus != "not-started" || weightsAvailable || inferenceAvailable || productionReady { issues.append("AGI evaluation protocol must remain blocked and not run") }
        let boundaryTerms = ["does not prove AGI", "train or download models", "run inference", "run benchmarks", "call providers", "provision cloud/GPU", "execute SSH", "grant route eligibility"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) { issues.append("AGI evaluation truth boundary must state (term)") }
        let requiredSourceKeys = ["apexModelProgram", "modelScalingProfile", "frontierEscalationPolicy", "modelScalingSubagentCouncil", "protocolDoc", "publicReadinessEvidence", "publicReadinessDoc"]
        if sourceOfTruth.count != 10 || !requiredSourceKeys.allSatisfy({ sourceOfTruth[$0]?.isEmpty == false }) { issues.append("AGI evaluation source-of-truth map is incomplete") }
        if publicResearchBaseline.status != "public-sources-reviewed" || publicResearchBaseline.updatedAt != "2026-06-29" || publicResearchBaseline.sources.count != 10 || !publicResearchBaseline.sources.allSatisfy(\.isComplete) { issues.append("AGI evaluation research baseline is incomplete") }
        if sourceDerivedReadinessGates.count != 4 || !sourceDerivedReadinessGates.allSatisfy(\.isSafe) { issues.append("AGI evaluation source-derived gates are unsafe or incomplete") }
        if evaluationDimensions.count != 11 || !evaluationDimensions.allSatisfy(\.isSafe) { issues.append("AGI evaluation dimensions are unsafe or incomplete") }
        if minimumEvidenceBeforeAnyAgiClaim.count != 20 || !minimumEvidenceBeforeAnyAgiClaim.contains("independent multi-domain capability evaluation passed") || !minimumEvidenceBeforeAnyAgiClaim.contains("explicit human approval recorded") { issues.append("AGI minimum claim evidence inventory is incomplete") }
        if negativeControls.count != 7 || !negativeControls.contains("parameter count alone is not AGI evidence") || !negativeControls.contains("green CI is not AGI proof") { issues.append("AGI negative controls are incomplete") }
        if requiredReviewers.count != 11 || !requiredReviewers.contains("human-owner") || !requiredReviewers.contains("external-reviewer") { issues.append("AGI required reviewer inventory is incomplete") }
        if promotionDecisionModel.defaultDecision != "blocked" || promotionDecisionModel.silentPromotionAllowed || promotionDecisionModel.selfApprovalAllowed || promotionDecisionModel.providerWrapperPromotionAllowed || !promotionDecisionModel.publicClaimRequiresExternalReview || !promotionDecisionModel.routeEligibilityRequiresHumanApproval { issues.append("AGI evaluation promotion policy is unsafe") }
        if forbiddenClaims.count != 7 || !forbiddenClaims.contains("SEIS has achieved real AGI.") || !forbiddenClaims.contains("Installed AI or sub-agents prove AGI.") { issues.append("AGI forbidden claim inventory is incomplete") }
        return issues
    }

    public var minimumEvidenceCount: Int { minimumEvidenceBeforeAnyAgiClaim.count }
    public var isMetadataOnly: Bool { validationIssues.isEmpty && !routeEligibleToday && !runtimeAuthority && !agiClaimAllowed }
}
