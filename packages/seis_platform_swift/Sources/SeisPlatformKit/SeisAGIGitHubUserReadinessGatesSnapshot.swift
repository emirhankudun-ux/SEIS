import Foundation

public struct SeisAGIGitHubReadinessValidator: Codable, Equatable, Sendable {
    public let status: String
    public let command: String
    public let mode: String
    public let installsModels: Bool
    public let downloadsCheckpoints: Bool
    public let trainsModels: Bool
    public let callsProviders: Bool
    public let provisionsCloudOrGpu: Bool
    public let executesSsh: Bool
    public let pushesOrMerges: Bool
    public let grantsAgiClaim: Bool
    public let grants512bRouteEligibility: Bool
    public let checks: [String]

    public init(
        status: String,
        command: String,
        mode: String,
        installsModels: Bool,
        downloadsCheckpoints: Bool,
        trainsModels: Bool,
        callsProviders: Bool,
        provisionsCloudOrGpu: Bool,
        executesSsh: Bool,
        pushesOrMerges: Bool,
        grantsAgiClaim: Bool,
        grants512bRouteEligibility: Bool,
        checks: [String]
    ) {
        self.status = status
        self.command = command
        self.mode = mode
        self.installsModels = installsModels
        self.downloadsCheckpoints = downloadsCheckpoints
        self.trainsModels = trainsModels
        self.callsProviders = callsProviders
        self.provisionsCloudOrGpu = provisionsCloudOrGpu
        self.executesSsh = executesSsh
        self.pushesOrMerges = pushesOrMerges
        self.grantsAgiClaim = grantsAgiClaim
        self.grants512bRouteEligibility = grants512bRouteEligibility
        self.checks = checks
    }

    public var isSafeLocalDemo: Bool {
        status == "available-local-demo-gate" &&
            mode == "local-demo-readiness-only" &&
            !installsModels &&
            !downloadsCheckpoints &&
            !trainsModels &&
            !callsProviders &&
            !provisionsCloudOrGpu &&
            !executesSsh &&
            !pushesOrMerges &&
            !grantsAgiClaim &&
            !grants512bRouteEligibility &&
            checks.count == 12
    }
}

public struct SeisAGIGitHubUserMode: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let status: String
    public let requiresSecrets: Bool
    public let allowedClaim: String
    public let forbiddenClaim: String

    public init(id: String, label: String, status: String, requiresSecrets: Bool, allowedClaim: String, forbiddenClaim: String) {
        self.id = id
        self.label = label
        self.status = status
        self.requiresSecrets = requiresSecrets
        self.allowedClaim = allowedClaim
        self.forbiddenClaim = forbiddenClaim
    }

    public var isComplete: Bool {
        !id.isEmpty && !label.isEmpty && !status.isEmpty && !allowedClaim.isEmpty && !forbiddenClaim.isEmpty
    }
}

public struct SeisAGIGitHubReadinessGate: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let ownerAgents: [String]
    public let requiredEvidence: [String]
    public let blocksGithubLocalDemo: Bool
    public let blocksAgiClaim: Bool

    public init(id: String, status: String, ownerAgents: [String], requiredEvidence: [String], blocksGithubLocalDemo: Bool, blocksAgiClaim: Bool) {
        self.id = id
        self.status = status
        self.ownerAgents = ownerAgents
        self.requiredEvidence = requiredEvidence
        self.blocksGithubLocalDemo = blocksGithubLocalDemo
        self.blocksAgiClaim = blocksAgiClaim
    }

    public var isSafe: Bool {
        !id.isEmpty &&
            !status.isEmpty &&
            !ownerAgents.isEmpty &&
            !requiredEvidence.isEmpty &&
            blocksAgiClaim
    }
}

public enum SeisAGIGitHubUserReadinessGatesSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAGIGitHubUserReadinessGatesSnapshot: Codable, Equatable, Sendable {
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
    public let publicReadyForLocalDemo: Bool
    public let githubReadyForEveryone: Bool
    public let claimDecision: String
    public let oneCommandReadinessValidator: SeisAGIGitHubReadinessValidator
    public let sourceOfTruth: [String: String]
    public let truthBoundary: String
    public let researchBaseline: [SeisAGIIndependentResearchBaseline]
    public let githubUserModes: [SeisAGIGitHubUserMode]
    public let readinessGates: [SeisAGIGitHubReadinessGate]
    public let requiredBeforeEveryoneReady: [String]
    public let forbiddenClaims: [String]
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
        publicReadyForLocalDemo: Bool,
        githubReadyForEveryone: Bool,
        claimDecision: String,
        oneCommandReadinessValidator: SeisAGIGitHubReadinessValidator,
        sourceOfTruth: [String: String],
        truthBoundary: String,
        researchBaseline: [SeisAGIIndependentResearchBaseline],
        githubUserModes: [SeisAGIGitHubUserMode],
        readinessGates: [SeisAGIGitHubReadinessGate],
        requiredBeforeEveryoneReady: [String],
        forbiddenClaims: [String],
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
        self.publicReadyForLocalDemo = publicReadyForLocalDemo
        self.githubReadyForEveryone = githubReadyForEveryone
        self.claimDecision = claimDecision
        self.oneCommandReadinessValidator = oneCommandReadinessValidator
        self.sourceOfTruth = sourceOfTruth
        self.truthBoundary = truthBoundary
        self.researchBaseline = researchBaseline
        self.githubUserModes = githubUserModes
        self.readinessGates = readinessGates
        self.requiredBeforeEveryoneReady = requiredBeforeEveryoneReady
        self.forbiddenClaims = forbiddenClaims
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisAGIGitHubUserReadinessGatesSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAGIGitHubUserReadinessGatesSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAGIGitHubUserReadinessGatesSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-agi-github-user-readiness-gates" { issues.append("GitHub readiness gate id is invalid") }
        if status != "review-gated-local-demo-ready" || resourceURI != "seis://ai/agi-github-user-readiness-gates.json" { issues.append("GitHub readiness gate identity is unsafe") }
        if !qualityGate.hasPrefix("node scripts/check-") || coreCredentialRequirement != "none" || defaultRuntimeMode != "seis-local-demo" { issues.append("GitHub readiness gate quality boundary is invalid") }
        if routeEligibleToday || runtimeAuthority || agiClaimAllowed || publicReadyAsAgi || !publicReadyForLocalDemo || githubReadyForEveryone || claimDecision != "github-users-can-review-local-demo-not-real-agi" { issues.append("GitHub readiness decision boundary is unsafe") }
        let boundaryTerms = ["does not prove SEIS AGI", "train or download a 512B model", "run inference", "run benchmarks", "approve release", "mutate GitHub", "call providers", "execute SSH", "route eligibility"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) { issues.append("GitHub readiness truth boundary must state \(term)") }
        if !oneCommandReadinessValidator.isSafeLocalDemo { issues.append("one-command readiness validator is unsafe") }
        if sourceOfTruth.count != 7 || !sourceOfTruth.keys.contains("doc") { issues.append("GitHub readiness source-of-truth map is incomplete") }
        if researchBaseline.count != 4 || !researchBaseline.allSatisfy(\.isComplete) { issues.append("GitHub readiness research baseline is incomplete") }
        if githubUserModes.count != 4 || !githubUserModes.allSatisfy(\.isComplete) { issues.append("GitHub user modes are incomplete") }
        if readinessGates.count != 7 || !readinessGates.allSatisfy(\.isSafe) { issues.append("GitHub readiness gates are incomplete or unsafe") }
        if requiredBeforeEveryoneReady.count != 8 || forbiddenClaims.count != 6 || nextSafeActions.count != 4 { issues.append("GitHub readiness vocabulary is not canonical") }
        return issues
    }

    public var isLocalDemoOnly: Bool {
        isValid &&
            publicReadyForLocalDemo &&
            !githubReadyForEveryone &&
            !agiClaimAllowed &&
            !publicReadyAsAgi &&
            !routeEligibleToday &&
            !runtimeAuthority
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
        case publicReadyForLocalDemo
        case githubReadyForEveryone
        case claimDecision
        case oneCommandReadinessValidator
        case sourceOfTruth
        case truthBoundary
        case researchBaseline
        case githubUserModes
        case readinessGates
        case requiredBeforeEveryoneReady
        case forbiddenClaims
        case nextSafeActions
    }
}
