import Foundation

public struct SeisAIRouterDecisionIntegrity: Codable, Equatable, Sendable {
    public let readOnlyOnly: Bool
    public let executionPerformedAlwaysFalse: Bool
    public let noPromptBodyInDecision: Bool
    public let noCredentialMaterialInDecision: Bool
    public let decisionLogsRedacted: Bool
    public let providerStateMustBeNamed: Bool
    public let selectedProviderMustBeExplicit: Bool
    public let fallbackMustBeExplicit: Bool
    public let blockedReasonsRequiredWhenIneligible: Bool
    public let privateObsidianContentRoutable: Bool

    public init(
        readOnlyOnly: Bool,
        executionPerformedAlwaysFalse: Bool,
        noPromptBodyInDecision: Bool,
        noCredentialMaterialInDecision: Bool,
        decisionLogsRedacted: Bool,
        providerStateMustBeNamed: Bool,
        selectedProviderMustBeExplicit: Bool,
        fallbackMustBeExplicit: Bool,
        blockedReasonsRequiredWhenIneligible: Bool,
        privateObsidianContentRoutable: Bool
    ) {
        self.readOnlyOnly = readOnlyOnly
        self.executionPerformedAlwaysFalse = executionPerformedAlwaysFalse
        self.noPromptBodyInDecision = noPromptBodyInDecision
        self.noCredentialMaterialInDecision = noCredentialMaterialInDecision
        self.decisionLogsRedacted = decisionLogsRedacted
        self.providerStateMustBeNamed = providerStateMustBeNamed
        self.selectedProviderMustBeExplicit = selectedProviderMustBeExplicit
        self.fallbackMustBeExplicit = fallbackMustBeExplicit
        self.blockedReasonsRequiredWhenIneligible = blockedReasonsRequiredWhenIneligible
        self.privateObsidianContentRoutable = privateObsidianContentRoutable
    }

    public var isSafe: Bool {
        readOnlyOnly &&
            executionPerformedAlwaysFalse &&
            noPromptBodyInDecision &&
            noCredentialMaterialInDecision &&
            decisionLogsRedacted &&
            providerStateMustBeNamed &&
            selectedProviderMustBeExplicit &&
            fallbackMustBeExplicit &&
            blockedReasonsRequiredWhenIneligible &&
            !privateObsidianContentRoutable
    }
}

public struct SeisAIRouterReviewArtifact: Codable, Equatable, Sendable {
    public let status: String
    public let json: String
    public let markdown: String
    public let qualityGate: String

    public init(status: String, json: String, markdown: String, qualityGate: String) {
        self.status = status
        self.json = json
        self.markdown = markdown
        self.qualityGate = qualityGate
    }

    public var isComplete: Bool {
        !status.isEmpty && !json.isEmpty && !markdown.isEmpty && !qualityGate.isEmpty
    }
}

public struct SeisAIRouterDecisionShape: Codable, Equatable, Sendable {
    public let taskType: String
    public let privacyMode: String
    public let selectedProvider: String
    public let selectedModel: String
    public let providerState: String
    public let routeEligible: Bool
    public let executionPerformed: Bool
    public let fallbackUsed: Bool
    public let blockedReasons: [String]

    public init(
        taskType: String,
        privacyMode: String,
        selectedProvider: String,
        selectedModel: String,
        providerState: String,
        routeEligible: Bool,
        executionPerformed: Bool,
        fallbackUsed: Bool,
        blockedReasons: [String]
    ) {
        self.taskType = taskType
        self.privacyMode = privacyMode
        self.selectedProvider = selectedProvider
        self.selectedModel = selectedModel
        self.providerState = providerState
        self.routeEligible = routeEligible
        self.executionPerformed = executionPerformed
        self.fallbackUsed = fallbackUsed
        self.blockedReasons = blockedReasons
    }

    public var isSafeShape: Bool {
        taskType == "string" &&
            privacyMode.contains("local-only") &&
            selectedProvider.contains("Local Demo") &&
            !routeEligible &&
            !executionPerformed &&
            !fallbackUsed &&
            blockedReasons.isEmpty
    }
}

public enum SeisAIReadOnlyModelRouterContractSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAIReadOnlyModelRouterContractSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let status: String
    public let version: String
    public let qualityGate: String
    public let runtimeAuthority: Bool
    public let providerCalls: Bool
    public let credentialValidation: Bool
    public let browserSecrets: Bool
    public let silentFallback: Bool
    public let localOnlyCanUseCloud: Bool
    public let defaultMode: String
    public let routerInputsAllowed: [String]
    public let routerInputsForbidden: [String]
    public let providerStates: [String]
    public let routingRules: [String]
    public let blockedModelClasses: [String]
    public let requiredEvidenceBeforeLiveRouting: [String]
    public let decisionIntegrity: SeisAIRouterDecisionIntegrity
    public let reviewOnlyOutputs: [String]
    public let reviewArtifact: SeisAIRouterReviewArtifact
    public let readOnlyDecisionShape: SeisAIRouterDecisionShape

    public init(
        id: String,
        title: String,
        status: String,
        version: String,
        qualityGate: String,
        runtimeAuthority: Bool,
        providerCalls: Bool,
        credentialValidation: Bool,
        browserSecrets: Bool,
        silentFallback: Bool,
        localOnlyCanUseCloud: Bool,
        defaultMode: String,
        routerInputsAllowed: [String],
        routerInputsForbidden: [String],
        providerStates: [String],
        routingRules: [String],
        blockedModelClasses: [String],
        requiredEvidenceBeforeLiveRouting: [String],
        decisionIntegrity: SeisAIRouterDecisionIntegrity,
        reviewOnlyOutputs: [String],
        reviewArtifact: SeisAIRouterReviewArtifact,
        readOnlyDecisionShape: SeisAIRouterDecisionShape
    ) {
        self.id = id
        self.title = title
        self.status = status
        self.version = version
        self.qualityGate = qualityGate
        self.runtimeAuthority = runtimeAuthority
        self.providerCalls = providerCalls
        self.credentialValidation = credentialValidation
        self.browserSecrets = browserSecrets
        self.silentFallback = silentFallback
        self.localOnlyCanUseCloud = localOnlyCanUseCloud
        self.defaultMode = defaultMode
        self.routerInputsAllowed = routerInputsAllowed
        self.routerInputsForbidden = routerInputsForbidden
        self.providerStates = providerStates
        self.routingRules = routingRules
        self.blockedModelClasses = blockedModelClasses
        self.requiredEvidenceBeforeLiveRouting = requiredEvidenceBeforeLiveRouting
        self.decisionIntegrity = decisionIntegrity
        self.reviewOnlyOutputs = reviewOnlyOutputs
        self.reviewArtifact = reviewArtifact
        self.readOnlyDecisionShape = readOnlyDecisionShape
    }

    public static func validated(from data: Data) throws -> SeisAIReadOnlyModelRouterContractSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAIReadOnlyModelRouterContractSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAIReadOnlyModelRouterContractSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-read-only-model-router-contract" { issues.append("router contract id must identify the canonical contract") }
        if title.isEmpty || status.isEmpty || version.isEmpty || qualityGate.isEmpty { issues.append("router contract identity is incomplete") }
        if runtimeAuthority || providerCalls || credentialValidation || browserSecrets || silentFallback || localOnlyCanUseCloud {
            issues.append("router contract runtime safety flags are unsafe")
        }
        if defaultMode != "Local Demo" { issues.append("router default mode must remain Local Demo") }
        if routerInputsAllowed.count != 10 || routerInputsForbidden.count != 7 || providerStates.count != 7 || blockedModelClasses.count != 6 || requiredEvidenceBeforeLiveRouting.count != 10 {
            issues.append("router contract input, state, model, or evidence counts are not canonical")
        }
        if routingRules.count != 9 || reviewOnlyOutputs.count != 6 { issues.append("router contract rules or review outputs are incomplete") }
        if !decisionIntegrity.isSafe { issues.append("router decision integrity is unsafe") }
        if !reviewArtifact.isComplete { issues.append("router review artifact is incomplete") }
        if !readOnlyDecisionShape.isSafeShape { issues.append("router decision shape is unsafe") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            !runtimeAuthority &&
            !providerCalls &&
            decisionIntegrity.isSafe &&
            readOnlyDecisionShape.isSafeShape
    }
}
