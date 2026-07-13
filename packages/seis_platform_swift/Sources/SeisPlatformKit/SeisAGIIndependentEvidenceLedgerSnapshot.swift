import Foundation

public struct SeisAGIIndependentResearchBaseline: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let source: String
    public let url: String

    public init(id: String, source: String, url: String) {
        self.id = id
        self.source = source
        self.url = url
    }

    public var isComplete: Bool {
        !id.isEmpty && !source.isEmpty && url.hasPrefix("https://")
    }
}

public struct SeisAGIIndependentEvidenceInquiry: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let requiredBeforePublicClaim: Bool
    public let ownerAgents: [String]
    public let requiredEvidence: [String]

    public init(id: String, status: String, requiredBeforePublicClaim: Bool, ownerAgents: [String], requiredEvidence: [String]) {
        self.id = id
        self.status = status
        self.requiredBeforePublicClaim = requiredBeforePublicClaim
        self.ownerAgents = ownerAgents
        self.requiredEvidence = requiredEvidence
    }

    public var isSafe: Bool {
        !id.isEmpty &&
            status == "missing" &&
            requiredBeforePublicClaim &&
            !ownerAgents.isEmpty &&
            !requiredEvidence.isEmpty
    }
}

public struct SeisAGIIndependentReadinessChecks: Codable, Equatable, Sendable {
    public let gateIds: [String]
    public let requiredArtifacts: [String]

    public init(gateIds: [String], requiredArtifacts: [String]) {
        self.gateIds = gateIds
        self.requiredArtifacts = requiredArtifacts
    }

    public var isComplete: Bool {
        gateIds.count == 7 &&
            requiredArtifacts.count == 7 &&
            gateIds.contains("independent-agi-evaluations") &&
            gateIds.contains("512b-training-inference-evidence") &&
            requiredArtifacts.contains("content/development/seis-agi-evaluation-protocol.json")
    }
}

public struct SeisAGIIndependentHumanApproval: Codable, Equatable, Sendable {
    public let decision: String
    public let gates: [String]
    public let conditions: [String]

    public init(decision: String, gates: [String], conditions: [String]) {
        self.decision = decision
        self.gates = gates
        self.conditions = conditions
    }

    public var isSafe: Bool {
        decision == "not-recorded" &&
            gates == ["human-owner", "security-agent", "devops-agent"] &&
            conditions.count == 4 &&
            conditions.contains("no premature AGI/512B public claims")
    }
}

public enum SeisAGIIndependentEvidenceLedgerSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAGIIndependentEvidenceLedgerSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let targetCapability: String
    public let defaultRuntimeMode: String
    public let routeEligibleToday: Bool
    public let runtimeAuthority: Bool
    public let agiClaimAllowed: Bool
    public let publicReadyAsAgi: Bool
    public let publicReadyForLocalDemo: Bool
    public let githubReadyForEveryone: Bool
    public let sourceOfTruth: String
    public let truthBoundary: String
    public let researchBaseline: [SeisAGIIndependentResearchBaseline]
    public let pendingExternalInquiries: [SeisAGIIndependentEvidenceInquiry]
    public let readinessChecks: SeisAGIIndependentReadinessChecks
    public let humanApprovalNeeded: SeisAGIIndependentHumanApproval
    public let nextSafeActions: [String]
    public let forbiddenClaims: [String]

    public init(
        id: String,
        version: String,
        status: String,
        targetCapability: String,
        defaultRuntimeMode: String,
        routeEligibleToday: Bool,
        runtimeAuthority: Bool,
        agiClaimAllowed: Bool,
        publicReadyAsAgi: Bool,
        publicReadyForLocalDemo: Bool,
        githubReadyForEveryone: Bool,
        sourceOfTruth: String,
        truthBoundary: String,
        researchBaseline: [SeisAGIIndependentResearchBaseline],
        pendingExternalInquiries: [SeisAGIIndependentEvidenceInquiry],
        readinessChecks: SeisAGIIndependentReadinessChecks,
        humanApprovalNeeded: SeisAGIIndependentHumanApproval,
        nextSafeActions: [String],
        forbiddenClaims: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.targetCapability = targetCapability
        self.defaultRuntimeMode = defaultRuntimeMode
        self.routeEligibleToday = routeEligibleToday
        self.runtimeAuthority = runtimeAuthority
        self.agiClaimAllowed = agiClaimAllowed
        self.publicReadyAsAgi = publicReadyAsAgi
        self.publicReadyForLocalDemo = publicReadyForLocalDemo
        self.githubReadyForEveryone = githubReadyForEveryone
        self.sourceOfTruth = sourceOfTruth
        self.truthBoundary = truthBoundary
        self.researchBaseline = researchBaseline
        self.pendingExternalInquiries = pendingExternalInquiries
        self.readinessChecks = readinessChecks
        self.humanApprovalNeeded = humanApprovalNeeded
        self.nextSafeActions = nextSafeActions
        self.forbiddenClaims = forbiddenClaims
    }

    public static func validated(from data: Data) throws -> SeisAGIIndependentEvidenceLedgerSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAGIIndependentEvidenceLedgerSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAGIIndependentEvidenceLedgerSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-agi-independent-evidence-ledger" { issues.append("independent evidence ledger id is invalid") }
        if status != "planned-without-independent-evidence" || defaultRuntimeMode != "seis-local-demo" { issues.append("independent evidence ledger must remain planned local demo") }
        if [version, targetCapability, sourceOfTruth].contains(where: { $0.isEmpty }) { issues.append("independent evidence ledger identity is incomplete") }
        if routeEligibleToday || runtimeAuthority || agiClaimAllowed || publicReadyAsAgi || !publicReadyForLocalDemo || githubReadyForEveryone { issues.append("independent evidence ledger decision boundary is unsafe") }
        let boundaryTerms = ["planning-only", "does not prove AGI", "512B readiness", "internet downloads", "live training", "inference", "benchmark claims", "deployment"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) { issues.append("independent evidence truth boundary must state \(term)") }
        if researchBaseline.count != 4 || !researchBaseline.allSatisfy(\.isComplete) { issues.append("independent evidence research baseline is incomplete") }
        if pendingExternalInquiries.count != 3 || !pendingExternalInquiries.allSatisfy(\.isSafe) { issues.append("independent evidence inquiries are unsafe or incomplete") }
        if !readinessChecks.isComplete { issues.append("independent evidence readiness checks are incomplete") }
        if !humanApprovalNeeded.isSafe { issues.append("independent evidence human approval boundary is unsafe") }
        if nextSafeActions.count != 3 || forbiddenClaims.count != 5 { issues.append("independent evidence action and claim vocabulary is not canonical") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isPlanOnly: Bool {
        isValid && !routeEligibleToday && !runtimeAuthority && !agiClaimAllowed && !publicReadyAsAgi
    }
}
