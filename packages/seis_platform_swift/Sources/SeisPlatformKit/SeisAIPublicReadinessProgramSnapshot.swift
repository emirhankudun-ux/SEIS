import Foundation

public struct SeisAIPublicReadinessResearchBaseline: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let url: String
    public let evidenceType: String
    public let seisImplication: String

    public init(id: String, url: String, evidenceType: String, seisImplication: String) {
        self.id = id
        self.url = url
        self.evidenceType = evidenceType
        self.seisImplication = seisImplication
    }

    public var isSafe: Bool {
        !id.isEmpty && (url.hasPrefix("https://") || url.hasPrefix("http://")) && !evidenceType.isEmpty && !seisImplication.isEmpty
    }
}

public struct SeisAIPublicReadinessAudienceMode: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let allowedUse: String
    public let forbiddenUse: String

    public init(id: String, status: String, allowedUse: String, forbiddenUse: String) {
        self.id = id
        self.status = status
        self.allowedUse = allowedUse
        self.forbiddenUse = forbiddenUse
    }

    public var isSafe: Bool {
        !id.isEmpty && !status.isEmpty && !allowedUse.isEmpty && !forbiddenUse.isEmpty
    }
}

public struct SeisAIPublicReadinessGate: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let blocksGithubReadyForEveryone: Bool
    public let blocksAgiClaim: Bool
    public let evidence: [String]

    public init(id: String, status: String, blocksGithubReadyForEveryone: Bool, blocksAgiClaim: Bool, evidence: [String]) {
        self.id = id
        self.status = status
        self.blocksGithubReadyForEveryone = blocksGithubReadyForEveryone
        self.blocksAgiClaim = blocksAgiClaim
        self.evidence = evidence
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.isEmpty || status.isEmpty || evidence.isEmpty { issues.append("public readiness gate \(id) is incomplete") }
        if !blocksAgiClaim { issues.append("public readiness gate \(id) must block AGI claims") }
        return issues
    }
}

public struct SeisAIPublicReadinessCouncilUse: Codable, Equatable, Sendable {
    public let status: String
    public let source: String
    public let allowedActions: [String]
    public let forbiddenActions: [String]

    public init(status: String, source: String, allowedActions: [String], forbiddenActions: [String]) {
        self.status = status
        self.source = source
        self.allowedActions = allowedActions
        self.forbiddenActions = forbiddenActions
    }

    public var isSafe: Bool {
        status == "plan-only-review" &&
            !source.isEmpty &&
            allowedActions == ["plan", "review", "document", "validate", "gate"] &&
            forbiddenActions.count == 8 &&
            forbiddenActions.contains("approve own promotion")
    }
}

public enum SeisAIPublicReadinessProgramSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAIPublicReadinessProgramSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let resourceURI: String
    public let qualityGate: String
    public let oneCommandReadinessValidator: String
    public let coreCredentialRequirement: String
    public let defaultRuntimeMode: String
    public let publicReadyForLocalDemo: Bool
    public let githubReadyForEveryone: Bool
    public let publicReadyAsAgi: Bool
    public let routeEligibleToday: Bool
    public let runtimeAuthority: Bool
    public let trainingStatus: String
    public let weightsAvailable: Bool
    public let inferenceAvailable: Bool
    public let benchmarkStatus: String
    public let truthBoundary: String
    public let researchBaselineVerifiedAt: String
    public let sourceOfTruth: [String: String]
    public let internetResearchBaseline: [SeisAIPublicReadinessResearchBaseline]
    public let githubAudienceModes: [SeisAIPublicReadinessAudienceMode]
    public let readinessGates: [SeisAIPublicReadinessGate]
    public let subAgentCouncilUse: SeisAIPublicReadinessCouncilUse
    public let requiredBeforeGithubReadyForEveryone: [String]
    public let requiredBeforeAnyAgiClaim: [String]
    public let forbiddenClaims: [String]
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: String,
        status: String,
        resourceURI: String,
        qualityGate: String,
        oneCommandReadinessValidator: String,
        coreCredentialRequirement: String,
        defaultRuntimeMode: String,
        publicReadyForLocalDemo: Bool,
        githubReadyForEveryone: Bool,
        publicReadyAsAgi: Bool,
        routeEligibleToday: Bool,
        runtimeAuthority: Bool,
        trainingStatus: String,
        weightsAvailable: Bool,
        inferenceAvailable: Bool,
        benchmarkStatus: String,
        truthBoundary: String,
        researchBaselineVerifiedAt: String,
        sourceOfTruth: [String: String],
        internetResearchBaseline: [SeisAIPublicReadinessResearchBaseline],
        githubAudienceModes: [SeisAIPublicReadinessAudienceMode],
        readinessGates: [SeisAIPublicReadinessGate],
        subAgentCouncilUse: SeisAIPublicReadinessCouncilUse,
        requiredBeforeGithubReadyForEveryone: [String],
        requiredBeforeAnyAgiClaim: [String],
        forbiddenClaims: [String],
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.resourceURI = resourceURI
        self.qualityGate = qualityGate
        self.oneCommandReadinessValidator = oneCommandReadinessValidator
        self.coreCredentialRequirement = coreCredentialRequirement
        self.defaultRuntimeMode = defaultRuntimeMode
        self.publicReadyForLocalDemo = publicReadyForLocalDemo
        self.githubReadyForEveryone = githubReadyForEveryone
        self.publicReadyAsAgi = publicReadyAsAgi
        self.routeEligibleToday = routeEligibleToday
        self.runtimeAuthority = runtimeAuthority
        self.trainingStatus = trainingStatus
        self.weightsAvailable = weightsAvailable
        self.inferenceAvailable = inferenceAvailable
        self.benchmarkStatus = benchmarkStatus
        self.truthBoundary = truthBoundary
        self.researchBaselineVerifiedAt = researchBaselineVerifiedAt
        self.sourceOfTruth = sourceOfTruth
        self.internetResearchBaseline = internetResearchBaseline
        self.githubAudienceModes = githubAudienceModes
        self.readinessGates = readinessGates
        self.subAgentCouncilUse = subAgentCouncilUse
        self.requiredBeforeGithubReadyForEveryone = requiredBeforeGithubReadyForEveryone
        self.requiredBeforeAnyAgiClaim = requiredBeforeAnyAgiClaim
        self.forbiddenClaims = forbiddenClaims
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisAIPublicReadinessProgramSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAIPublicReadinessProgramSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAIPublicReadinessProgramSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-public-readiness-program" { issues.append("public readiness id must identify the canonical program") }
        if status != "local-demo-public-review-ready-not-agi" { issues.append("public readiness status must remain Local Demo and not AGI") }
        if resourceURI != "seis://ai/public-readiness-program.json" { issues.append("public readiness resource URI is invalid") }
        if !qualityGate.hasPrefix("npm run check:") || !oneCommandReadinessValidator.hasPrefix("npm run check:") { issues.append("public readiness gates must be local npm checks") }
        if coreCredentialRequirement != "none" || defaultRuntimeMode != "seis-local-demo" || !publicReadyForLocalDemo || githubReadyForEveryone || publicReadyAsAgi || routeEligibleToday || runtimeAuthority || trainingStatus != "not-started" || weightsAvailable || inferenceAvailable || benchmarkStatus != "not-run" {
            issues.append("public readiness decision boundary is unsafe")
        }
        let boundaryTerms = ["does not prove AGI", "install models", "download checkpoints", "train a 512B model", "run inference", "run benchmarks", "call providers", "execute SSH", "deploy", "grant runtime authority"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) { issues.append("public readiness truth boundary must state \(term)") }
        if sourceOfTruth.count != 12 || !sourceOfTruth.keys.contains("doc") { issues.append("public readiness source-of-truth map is incomplete") }
        if internetResearchBaseline.count != 6 || !internetResearchBaseline.allSatisfy(\.isSafe) { issues.append("public readiness research baseline is incomplete") }
        if githubAudienceModes.count != 4 || !githubAudienceModes.allSatisfy(\.isSafe) { issues.append("public readiness audience modes are incomplete") }
        if readinessGates.count != 6 { issues.append("public readiness must contain six gates") }
        for gate in readinessGates { issues.append(contentsOf: gate.validationIssues) }
        if !subAgentCouncilUse.isSafe { issues.append("public readiness council use is unsafe") }
        if requiredBeforeGithubReadyForEveryone.count != 8 || requiredBeforeAnyAgiClaim.count != 13 || forbiddenClaims.count != 7 || nextSafeActions.count != 4 { issues.append("public readiness gate vocabulary is not canonical") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isLocalDemoOnly: Bool {
        isValid &&
            publicReadyForLocalDemo &&
            !githubReadyForEveryone &&
            !publicReadyAsAgi &&
            !routeEligibleToday &&
            !runtimeAuthority &&
            !weightsAvailable &&
            !inferenceAvailable
    }

    private enum CodingKeys: String, CodingKey {
        case id
        case version
        case status
        case resourceURI = "resourceUri"
        case qualityGate
        case oneCommandReadinessValidator
        case coreCredentialRequirement
        case defaultRuntimeMode
        case publicReadyForLocalDemo
        case githubReadyForEveryone
        case publicReadyAsAgi
        case routeEligibleToday
        case runtimeAuthority
        case trainingStatus
        case weightsAvailable
        case inferenceAvailable
        case benchmarkStatus
        case truthBoundary
        case researchBaselineVerifiedAt
        case sourceOfTruth
        case internetResearchBaseline
        case githubAudienceModes
        case readinessGates
        case subAgentCouncilUse
        case requiredBeforeGithubReadyForEveryone
        case requiredBeforeAnyAgiClaim
        case forbiddenClaims
        case nextSafeActions
    }
}
