import Foundation

public struct SeisModelFrontierEscalationPolicySnapshot: Codable, Equatable, Sendable {
    public struct SourceOfTruth: Codable, Equatable, Sendable {
        public let modelScalingProfile: String
        public let modelScalingDoc: String
        public let frontierModelProgram: String
        public let apexModelProgram: String
        public let benchmarkDryRun: String
        public let benchmarkManifest: String
        public let modelCardTemplate: String
        public let datasetCardTemplate: String
    }

    public struct DecisionRule: Codable, Equatable, Sendable {
        public let id: String
        public let rule: String
        public let enforcedStatus: String
    }

    public struct EscalationStage: Codable, Equatable, Sendable {
        public let id: String
        public let parameterClass: String
        public let status: String
        public let allowedToday: Bool
        public let routeEligibleToday: Bool
        public let requiredEvidenceBeforeNext: [String]

        public var isBlocked: Bool {
            !allowedToday && !routeEligibleToday
        }
    }

    public struct FallbackPolicy: Codable, Equatable, Sendable {
        public let fallbackRuntime: String
        public let silentCloudFallbackAllowed: Bool
        public let missingKeyIsError: Bool
        public let providerAndModelMustBeVisible: Bool
        public let localOnlyModeMustBeRespected: Bool
    }

    public enum ValidationError: Error, Equatable, CustomStringConvertible, Sendable {
        case sourceUnavailable(String)
        case invalidJSON(String)
        case policyBoundaryViolation([String])

        public var description: String {
            switch self {
            case let .sourceUnavailable(path):
                return "SEIS model frontier escalation policy source unavailable: \(path)"
            case let .invalidJSON(reason):
                return "SEIS model frontier escalation policy JSON is invalid: \(reason)"
            case let .policyBoundaryViolation(issues):
                return "SEIS model frontier escalation policy boundary violations: \(issues.joined(separator: "; "))"
            }
        }
    }

    public static let sourcePath = "content/development/seis-model-frontier-escalation-policy.json"
    public static let expectedID = "seis-model-frontier-escalation-policy"
    public static let expectedVersion = "2026.06.24"

    public let id: String
    public let version: String
    public let status: String
    public let updatedAt: String
    public let purpose: String
    public let resourceURI: String
    public let qualityGate: String
    public let sourceOfTruth: SourceOfTruth
    public let truthBoundary: String
    public let coreCredentialRequirement: String
    public let defaultRuntimeMode: String
    public let routeEligibleToday: Bool
    public let currentAllowedMode: String
    public let decisionRules: [DecisionRule]
    public let escalationStages: [EscalationStage]
    public let requiredGlobalEvidence: [String]
    public let forbiddenClaims: [String]
    public let humanApprovalRequiredFor: [String]
    public let fallbackPolicy: FallbackPolicy
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: String,
        status: String,
        updatedAt: String,
        purpose: String,
        resourceURI: String,
        qualityGate: String,
        sourceOfTruth: SourceOfTruth,
        truthBoundary: String,
        coreCredentialRequirement: String,
        defaultRuntimeMode: String,
        routeEligibleToday: Bool,
        currentAllowedMode: String,
        decisionRules: [DecisionRule],
        escalationStages: [EscalationStage],
        requiredGlobalEvidence: [String],
        forbiddenClaims: [String],
        humanApprovalRequiredFor: [String],
        fallbackPolicy: FallbackPolicy,
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.updatedAt = updatedAt
        self.purpose = purpose
        self.resourceURI = resourceURI
        self.qualityGate = qualityGate
        self.sourceOfTruth = sourceOfTruth
        self.truthBoundary = truthBoundary
        self.coreCredentialRequirement = coreCredentialRequirement
        self.defaultRuntimeMode = defaultRuntimeMode
        self.routeEligibleToday = routeEligibleToday
        self.currentAllowedMode = currentAllowedMode
        self.decisionRules = decisionRules
        self.escalationStages = escalationStages
        self.requiredGlobalEvidence = requiredGlobalEvidence
        self.forbiddenClaims = forbiddenClaims
        self.humanApprovalRequiredFor = humanApprovalRequiredFor
        self.fallbackPolicy = fallbackPolicy
        self.nextSafeActions = nextSafeActions
    }

    private enum CodingKeys: String, CodingKey {
        case id, version, status, updatedAt, purpose, resourceURI = "resourceUri", qualityGate
        case sourceOfTruth, truthBoundary, coreCredentialRequirement, defaultRuntimeMode
        case routeEligibleToday, currentAllowedMode, decisionRules, escalationStages
        case requiredGlobalEvidence, forbiddenClaims, humanApprovalRequiredFor, fallbackPolicy
        case nextSafeActions
    }

    public static func sourceURL(repositoryRoot: URL) -> URL {
        repositoryRoot.appendingPathComponent(sourcePath)
    }

    public static func loadAndValidate(from sourceURL: URL) throws -> Self {
        let data: Data
        do {
            data = try Data(contentsOf: sourceURL)
        } catch {
            throw ValidationError.sourceUnavailable(sourceURL.path)
        }

        return try decodeAndValidate(data)
    }

    public static func decodeAndValidate(_ data: Data) throws -> Self {
        let snapshot: Self
        do {
            snapshot = try JSONDecoder().decode(Self.self, from: data)
        } catch {
            throw ValidationError.invalidJSON(String(describing: error))
        }

        try snapshot.validate()
        return snapshot
    }

    public static func load(from sourceURL: URL) throws -> Self {
        try loadAndValidate(from: sourceURL)
    }

    public static func loadAndValidateFromCurrentDirectory() throws -> Self {
        var directory = URL(fileURLWithPath: FileManager.default.currentDirectoryPath, isDirectory: true)
        while directory.path != "/" {
            let candidate = sourceURL(repositoryRoot: directory)
            if FileManager.default.fileExists(atPath: candidate.path) {
                return try loadAndValidate(from: candidate)
            }
            directory.deleteLastPathComponent()
        }

        throw ValidationError.sourceUnavailable(sourcePath)
    }

    public func validate() throws {
        let issues = validationIssues
        guard issues.isEmpty else {
            throw ValidationError.policyBoundaryViolation(issues)
        }
    }

    public var validationIssues: [String] {
        var issues: [String] = []

        if id != Self.expectedID { issues.append("id must identify the SEIS frontier escalation policy") }
        if version != Self.expectedVersion { issues.append("version must match the reviewed policy snapshot") }
        if status != "policy-active-research-gated" { issues.append("policy must remain research-gated") }
        if updatedAt != "2026-06-24" { issues.append("updatedAt must match the reviewed policy date") }
        if resourceURI != "seis://ai/model-frontier-escalation-policy.json" { issues.append("resource URI must identify the frontier policy") }
        if qualityGate != "npm run check:seis-model-frontier-escalation-policy" { issues.append("quality gate must use the frontier policy checker") }
        if purpose.isEmpty { issues.append("policy purpose must be present") }
        if coreCredentialRequirement != "none" { issues.append("the policy snapshot must require no core credential") }
        if defaultRuntimeMode != "local-demo" { issues.append("default runtime mode must be local-demo") }
        if routeEligibleToday { issues.append("no frontier route may be eligible today") }
        if currentAllowedMode != "Local Demo and deterministic seed-model lab only" {
            issues.append("current allowed mode must remain local demo and deterministic seed-model lab only")
        }

        let requiredTruthBoundaryFragments = [
            "Policy and escalation gate only",
            "does not download models",
            "run inference",
            "train",
            "call providers",
            "execute SSH",
            "claim SEIS owns a trained"
        ]
        for fragment in requiredTruthBoundaryFragments where !truthBoundary.contains(fragment) {
            issues.append("truth boundary is missing: \(fragment)")
        }

        let stageIDs = escalationStages.map(\.id)
        let expectedStageIDs = [
            "stage-0-local-demo",
            "stage-1-20b-local-compatibility",
            "stage-2-70b-research",
            "stage-3-150b-frontier",
            "stage-4-512b-apex",
            "stage-5-highest-available-future"
        ]
        if stageIDs != expectedStageIDs {
            issues.append("escalation stages must preserve the reviewed order and six-stage ladder")
        }
        if escalationStages.first?.id != "stage-0-local-demo" {
            issues.append("stage 0 must be the local demo stage")
        }
        if escalationStages.first?.allowedToday != true || escalationStages.first?.routeEligibleToday != true {
            issues.append("only the local demo stage may be active and route-eligible")
        }
        if escalationStages.dropFirst().contains(where: { !$0.isBlocked }) {
            issues.append("all non-demo escalation stages must be blocked")
        }
        if Set(stageIDs).count != stageIDs.count {
            issues.append("escalation stage IDs must be unique")
        }
        if escalationStages.dropFirst().contains(where: { $0.allowedToday }) {
            issues.append("only the local demo stage may be allowed today")
        }
        if escalationStages.count != 6 || requiredGlobalEvidence.count != 8 || forbiddenClaims.count != 13 ||
            humanApprovalRequiredFor.count != 12 || decisionRules.count != 4 || nextSafeActions.count != 4 {
            issues.append("frontier policy counts do not match the reviewed source contract")
        }

        let decisionRuleIDs = decisionRules.map(\.id)
        if decisionRuleIDs != ["no-skip-20b", "no-silent-provider-fallback", "human-approval-before-real-runtime", "evidence-before-ownership"] ||
            decisionRules.first?.enforcedStatus != "blocked" ||
            decisionRules.dropFirst().contains(where: { $0.enforcedStatus != "active" }) {
            issues.append("decision rules must preserve the no-skip, fallback, approval, and evidence boundaries")
        }
        if !decisionRules.contains(where: { $0.id == "no-skip-20b" && $0.rule.contains("20B local compatibility gates") }) ||
            !decisionRules.contains(where: { $0.id == "evidence-before-ownership" && $0.rule.contains("dataset provenance") }) {
            issues.append("decision rules must require evidence before escalation and ownership")
        }

        let requiredForbiddenClaimFragments = [
            "trained a 20B foundation model",
            "trained a 70B foundation model",
            "trained a 150B foundation model",
            "trained a 512B foundation model",
            "achieved real AGI",
            "routeable 20B weights",
            "routeable 70B weights",
            "routeable 150B weights",
            "routeable 512B weights",
            "benchmarked 20B, 70B, or 150B memory usage",
            "benchmarked 512B or AGI capability",
            "skip 20B evidence",
            "provider API, prompt profile, RAG system"
        ]
        for fragment in requiredForbiddenClaimFragments where !forbiddenClaims.contains(where: { $0.contains(fragment) }) {
            issues.append("forbidden claims are missing: \(fragment)")
        }

        let requiredApprovals = [
            "model download",
            "dataset download",
            "runtime adapter execution",
            "benchmark execution",
            "training run",
            "fine-tuning run",
            "checkpoint publication",
            "provider credential setup",
            "GPU or cloud provisioning",
            "SSH execution",
            "deployment",
            "public model or dataset release"
        ]
        for approval in requiredApprovals where !humanApprovalRequiredFor.contains(approval) {
            issues.append("human approval is missing for: \(approval)")
        }

        if fallbackPolicy.fallbackRuntime != "seis-local-demo" {
            issues.append("fallback runtime must be seis-local-demo")
        }
        if fallbackPolicy.silentCloudFallbackAllowed {
            issues.append("silent cloud fallback must remain disabled")
        }
        if fallbackPolicy.missingKeyIsError {
            issues.append("missing provider keys must remain a non-error in local demo mode")
        }
        if !fallbackPolicy.providerAndModelMustBeVisible {
            issues.append("provider and model visibility must remain explicit")
        }
        if !fallbackPolicy.localOnlyModeMustBeRespected {
            issues.append("local-only mode must be respected")
        }

        let expectedSourceOfTruth = SourceOfTruth(
            modelScalingProfile: "content/development/seis-model-scaling-hardware-profile.json",
            modelScalingDoc: "docs/ai/seis-model-scaling.md",
            frontierModelProgram: "content/development/seis-150b-frontier-model-program.json",
            apexModelProgram: "content/development/seis-512b-apex-model-program.json",
            benchmarkDryRun: "reports/seis-model-scaling/20b-benchmark-dry-run.json",
            benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
            modelCardTemplate: "content/development/seis-20b-model-card-template.json",
            datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json"
        )
        if sourceOfTruth != expectedSourceOfTruth {
            issues.append("source-of-truth map must preserve the reviewed model and evidence paths")
        }
        if requiredGlobalEvidence != [
            "dataset provenance",
            "license and rights review",
            "secret and PII scan",
            "training or fine-tuning logs before any training claim",
            "checkpoint governance before any checkpoint claim",
            "model card before any model ownership claim",
            "evaluation report before any benchmark claim",
            "provider and local-only routing disclosure before any live route claim"
        ] {
            issues.append("global evidence gates must preserve the reviewed promotion order")
        }

        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            !routeEligibleToday &&
            defaultRuntimeMode == "local-demo" &&
            fallbackPolicy.fallbackRuntime == "seis-local-demo" &&
            !fallbackPolicy.silentCloudFallbackAllowed &&
            !fallbackPolicy.missingKeyIsError &&
            escalationStages.dropFirst().allSatisfy(\.isBlocked)
    }

    public var routeEligibleStageCount: Int {
        escalationStages.filter(\.routeEligibleToday).count
    }
}
