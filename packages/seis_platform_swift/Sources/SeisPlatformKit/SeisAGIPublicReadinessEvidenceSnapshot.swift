import Foundation

public struct SeisAGIPublicReadinessSummary: Codable, Equatable, Sendable {
    public let protocolStatus: String
    public let apexProgramStatus: String
    public let sourceDerivedGateCount: Int
    public let evaluationDimensionCount: Int
    public let minimumClaimEvidenceCount: Int
    public let acceptedClaimEvidenceCount: Int
    public let missingClaimEvidenceCount: Int
    public let blockedReason: String
    public let allowedPublicUse: String

    public init(
        protocolStatus: String,
        apexProgramStatus: String,
        sourceDerivedGateCount: Int,
        evaluationDimensionCount: Int,
        minimumClaimEvidenceCount: Int,
        acceptedClaimEvidenceCount: Int,
        missingClaimEvidenceCount: Int,
        blockedReason: String,
        allowedPublicUse: String
    ) {
        self.protocolStatus = protocolStatus
        self.apexProgramStatus = apexProgramStatus
        self.sourceDerivedGateCount = sourceDerivedGateCount
        self.evaluationDimensionCount = evaluationDimensionCount
        self.minimumClaimEvidenceCount = minimumClaimEvidenceCount
        self.acceptedClaimEvidenceCount = acceptedClaimEvidenceCount
        self.missingClaimEvidenceCount = missingClaimEvidenceCount
        self.blockedReason = blockedReason
        self.allowedPublicUse = allowedPublicUse
    }

    public var isBlockedPlanOnly: Bool {
        protocolStatus == "protocol-draft-not-run" &&
            apexProgramStatus == "apex-program-plan-only" &&
            sourceDerivedGateCount == 4 &&
            evaluationDimensionCount == 11 &&
            minimumClaimEvidenceCount == 20 &&
            acceptedClaimEvidenceCount == 0 &&
            missingClaimEvidenceCount == 20 &&
            !blockedReason.isEmpty &&
            !allowedPublicUse.isEmpty
    }
}

public struct SeisAGIPublicReadinessSourceGate: Codable, Equatable, Identifiable, Sendable {
    public let gateId: String
    public let status: String
    public let evidenceStatus: String
    public let requiredBeforePublicClaim: Bool
    public let blockingReason: String

    public var id: String { gateId }

    public init(gateId: String, status: String, evidenceStatus: String, requiredBeforePublicClaim: Bool, blockingReason: String) {
        self.gateId = gateId
        self.status = status
        self.evidenceStatus = evidenceStatus
        self.requiredBeforePublicClaim = requiredBeforePublicClaim
        self.blockingReason = blockingReason
    }

    public var isSafe: Bool {
        !gateId.isEmpty &&
            status == "not-run" &&
            evidenceStatus == "missing" &&
            requiredBeforePublicClaim &&
            !blockingReason.isEmpty
    }
}

public struct SeisAGIPublicReadinessMinimumEvidence: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let requirement: String
    public let status: String
    public let currentEvidence: String
    public let requiredEvidence: [String]
    public let ownerAgents: [String]
    public let routeEligibleIfMissing: Bool
    public let claimAllowedIfMissing: Bool

    public init(
        id: String,
        requirement: String,
        status: String,
        currentEvidence: String,
        requiredEvidence: [String],
        ownerAgents: [String],
        routeEligibleIfMissing: Bool,
        claimAllowedIfMissing: Bool
    ) {
        self.id = id
        self.requirement = requirement
        self.status = status
        self.currentEvidence = currentEvidence
        self.requiredEvidence = requiredEvidence
        self.ownerAgents = ownerAgents
        self.routeEligibleIfMissing = routeEligibleIfMissing
        self.claimAllowedIfMissing = claimAllowedIfMissing
    }

    public var isSafe: Bool {
        !id.isEmpty &&
            !requirement.isEmpty &&
            status == "missing" &&
            !currentEvidence.isEmpty &&
            !requiredEvidence.isEmpty &&
            !ownerAgents.isEmpty &&
            !routeEligibleIfMissing &&
            !claimAllowedIfMissing
    }
}

public enum SeisAGIPublicReadinessEvidenceSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAGIPublicReadinessEvidenceSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let resourceURI: String
    public let qualityGate: String
    public let coreCredentialRequirement: String
    public let defaultRuntimeMode: String
    public let routeEligibleToday: Bool
    public let runtimeAuthority: Bool
    public let agiClaimAllowed: Bool
    public let publicReadyAsAgi: Bool
    public let publicReadyAsLocalDemo: Bool
    public let claimDecision: String
    public let sourceOfTruth: [String: String]
    public let truthBoundary: String
    public let readinessSummary: SeisAGIPublicReadinessSummary
    public let sourceDerivedGateMatrix: [SeisAGIPublicReadinessSourceGate]
    public let minimumClaimEvidenceMatrix: [SeisAGIPublicReadinessMinimumEvidence]
    public let forbiddenGreenlights: [String]
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: String,
        status: String,
        resourceURI: String,
        qualityGate: String,
        coreCredentialRequirement: String,
        defaultRuntimeMode: String,
        routeEligibleToday: Bool,
        runtimeAuthority: Bool,
        agiClaimAllowed: Bool,
        publicReadyAsAgi: Bool,
        publicReadyAsLocalDemo: Bool,
        claimDecision: String,
        sourceOfTruth: [String: String],
        truthBoundary: String,
        readinessSummary: SeisAGIPublicReadinessSummary,
        sourceDerivedGateMatrix: [SeisAGIPublicReadinessSourceGate],
        minimumClaimEvidenceMatrix: [SeisAGIPublicReadinessMinimumEvidence],
        forbiddenGreenlights: [String],
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.resourceURI = resourceURI
        self.qualityGate = qualityGate
        self.coreCredentialRequirement = coreCredentialRequirement
        self.defaultRuntimeMode = defaultRuntimeMode
        self.routeEligibleToday = routeEligibleToday
        self.runtimeAuthority = runtimeAuthority
        self.agiClaimAllowed = agiClaimAllowed
        self.publicReadyAsAgi = publicReadyAsAgi
        self.publicReadyAsLocalDemo = publicReadyAsLocalDemo
        self.claimDecision = claimDecision
        self.sourceOfTruth = sourceOfTruth
        self.truthBoundary = truthBoundary
        self.readinessSummary = readinessSummary
        self.sourceDerivedGateMatrix = sourceDerivedGateMatrix
        self.minimumClaimEvidenceMatrix = minimumClaimEvidenceMatrix
        self.forbiddenGreenlights = forbiddenGreenlights
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisAGIPublicReadinessEvidenceSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAGIPublicReadinessEvidenceSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAGIPublicReadinessEvidenceSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-agi-public-readiness-evidence" || status != "blocked-missing-real-agi-evidence" { issues.append("AGI evidence identity/status is invalid") }
        if resourceURI != "seis://ai/agi-public-readiness-evidence.json" || !qualityGate.hasPrefix("node scripts/check-") { issues.append("AGI evidence quality boundary is invalid") }
        if coreCredentialRequirement != "none" || defaultRuntimeMode != "seis-local-demo" || routeEligibleToday || runtimeAuthority || agiClaimAllowed || publicReadyAsAgi || !publicReadyAsLocalDemo || claimDecision != "not-ready-for-agi-or-512b-public-claim" { issues.append("AGI evidence decision boundary is unsafe") }
        let boundaryTerms = ["does not run evaluations", "train or download models", "run inference", "benchmark", "call providers", "provision GPU/cloud resources", "execute SSH", "deploy", "approve route eligibility"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) { issues.append("AGI evidence truth boundary must state \(term)") }
        if sourceOfTruth.count != 6 || !sourceOfTruth.keys.contains("publicReadinessDoc") { issues.append("AGI evidence source-of-truth map is incomplete") }
        if !readinessSummary.isBlockedPlanOnly { issues.append("AGI evidence summary is not the canonical blocked state") }
        if sourceDerivedGateMatrix.count != 4 || !sourceDerivedGateMatrix.allSatisfy(\.isSafe) { issues.append("AGI source-derived gate matrix is unsafe") }
        if minimumClaimEvidenceMatrix.count != 20 || !minimumClaimEvidenceMatrix.allSatisfy(\.isSafe) { issues.append("AGI minimum claim evidence matrix is unsafe") }
        if forbiddenGreenlights.count != 4 || nextSafeActions.count != 4 { issues.append("AGI evidence action vocabulary is not canonical") }
        return issues
    }

    public var isBlockedPlanOnly: Bool {
        isValid && readinessSummary.isBlockedPlanOnly && !routeEligibleToday && !runtimeAuthority && !agiClaimAllowed && !publicReadyAsAgi
    }

    private enum CodingKeys: String, CodingKey {
        case id
        case version
        case status
        case resourceURI = "resourceUri"
        case qualityGate
        case coreCredentialRequirement
        case defaultRuntimeMode
        case routeEligibleToday
        case runtimeAuthority
        case agiClaimAllowed
        case publicReadyAsAgi
        case publicReadyAsLocalDemo
        case claimDecision
        case sourceOfTruth
        case truthBoundary
        case readinessSummary
        case sourceDerivedGateMatrix
        case minimumClaimEvidenceMatrix
        case forbiddenGreenlights
        case nextSafeActions
    }
}
