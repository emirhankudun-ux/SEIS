import Foundation

public enum SeisAIPrivacyMode: String, CaseIterable, Codable, Equatable, Sendable {
    case standard
    case localOnly = "local-only"
    case reviewGated = "review-gated"
}

public enum SeisAIContentClassification: String, CaseIterable, Codable, Equatable, Hashable, Sendable {
    case publicContent = "public"
    case repositoryMetadata = "repository-metadata"
    case privateUserData = "private-user-data"
    case secret
    case unknown
}

public enum SeisAIProviderTransport: String, CaseIterable, Codable, Equatable, Sendable {
    case deterministicLocalDemo = "deterministic-local-demo"
    case localProcess = "local-process"
    case backendService = "backend-service"

    public var isLocal: Bool {
        self != .backendService
    }
}

public enum SeisAICredentialBoundary: String, CaseIterable, Codable, Equatable, Sendable {
    case none
    case localProcess = "local-process"
    case backendOnly = "backend-only"
}

public enum SeisAICostTier: String, CaseIterable, Codable, Equatable, Sendable {
    case zero
    case low
    case medium
    case high

    fileprivate var rank: Int {
        switch self {
        case .zero: 0
        case .low: 1
        case .medium: 2
        case .high: 3
        }
    }
}

public enum SeisAILatencyTier: String, CaseIterable, Codable, Equatable, Sendable {
    case immediate
    case interactive
    case background

    fileprivate var rank: Int {
        switch self {
        case .immediate: 0
        case .interactive: 1
        case .background: 2
        }
    }
}

public enum SeisAIFallbackPolicy: String, CaseIterable, Codable, Equatable, Sendable {
    case none
    case explicitLocalDemo = "explicit-local-demo"
}

public struct SeisAIProviderDescriptor: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let modelIdentifier: String
    public let publicState: SeisAICoreProviderState
    public let enabled: Bool
    public let routingEligible: Bool
    public let transport: SeisAIProviderTransport
    public let credentialBoundary: SeisAICredentialBoundary
    public let clientSecretsAllowed: Bool
    public let modelBacked: Bool
    public let capabilities: [String]
    public let allowedContent: Set<SeisAIContentClassification>
    public let maximumContextTokens: Int
    public let supportsTools: Bool
    public let costTier: SeisAICostTier
    public let latencyTier: SeisAILatencyTier
    public let requiresHumanApproval: Bool

    public init(
        id: String,
        displayName: String,
        modelIdentifier: String,
        publicState: SeisAICoreProviderState,
        enabled: Bool,
        routingEligible: Bool,
        transport: SeisAIProviderTransport,
        credentialBoundary: SeisAICredentialBoundary,
        clientSecretsAllowed: Bool = false,
        modelBacked: Bool,
        capabilities: [String],
        allowedContent: Set<SeisAIContentClassification>,
        maximumContextTokens: Int,
        supportsTools: Bool,
        costTier: SeisAICostTier,
        latencyTier: SeisAILatencyTier,
        requiresHumanApproval: Bool
    ) {
        self.id = id
        self.displayName = displayName
        self.modelIdentifier = modelIdentifier
        self.publicState = publicState
        self.enabled = enabled
        self.routingEligible = routingEligible
        self.transport = transport
        self.credentialBoundary = credentialBoundary
        self.clientSecretsAllowed = clientSecretsAllowed
        self.modelBacked = modelBacked
        self.capabilities = capabilities
        self.allowedContent = allowedContent
        self.maximumContextTokens = maximumContextTokens
        self.supportsTools = supportsTools
        self.costTier = costTier
        self.latencyTier = latencyTier
        self.requiresHumanApproval = requiresHumanApproval
    }

    public static let localDemo = SeisAIProviderDescriptor(
        id: "seis-local-demo",
        displayName: "SEIS Local Demo",
        modelIdentifier: "none-local-demo",
        publicState: .available,
        enabled: true,
        routingEligible: true,
        transport: .deterministicLocalDemo,
        credentialBoundary: .none,
        modelBacked: false,
        capabilities: [
            "planning",
            "repository-planning-demo",
            "status",
            "validation-plan"
        ],
        allowedContent: [.publicContent, .repositoryMetadata],
        maximumContextTokens: 0,
        supportsTools: false,
        costTier: .zero,
        latencyTier: .immediate,
        requiresHumanApproval: false
    )

    public static func localLoopback(modelIdentifier: String = "ollama-local") -> SeisAIProviderDescriptor {
        SeisAIProviderDescriptor(
            id: "ollama-local",
            displayName: "Ollama Local Loopback",
            modelIdentifier: modelIdentifier,
            publicState: .available,
            enabled: true,
            routingEligible: true,
            transport: .localProcess,
            credentialBoundary: .none,
            modelBacked: true,
            capabilities: ["planning", "repository-review", "summarization", "code-review"],
            allowedContent: [.publicContent, .repositoryMetadata],
            maximumContextTokens: 32_768,
            supportsTools: false,
            costTier: .low,
            latencyTier: .interactive,
            requiresHumanApproval: true
        )
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("provider id must not be empty")
        }
        if displayName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("provider displayName must not be empty")
        }
        if modelIdentifier.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("provider modelIdentifier must not be empty")
        }
        if capabilities.isEmpty || capabilities.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("provider capabilities must contain only non-empty values")
        }
        if Set(capabilities).count != capabilities.count {
            issues.append("provider capabilities must not contain duplicates")
        }
        if allowedContent.isEmpty {
            issues.append("provider allowedContent must not be empty")
        }
        if allowedContent.contains(.secret) || allowedContent.contains(.unknown) {
            issues.append("provider must never accept secret or unknown content")
        }
        if maximumContextTokens < 0 {
            issues.append("provider maximumContextTokens must not be negative")
        }
        if clientSecretsAllowed {
            issues.append("provider clientSecretsAllowed must remain false")
        }
        if transport == .deterministicLocalDemo {
            if credentialBoundary != .none || modelBacked || costTier != .zero || requiresHumanApproval {
                issues.append("deterministic Local Demo must be zero-key, non-model, zero-cost, and approval-free")
            }
        }
        if transport == .backendService && credentialBoundary != .backendOnly {
            issues.append("backend services must keep credentials backend-only")
        }
        if transport != .deterministicLocalDemo && !requiresHumanApproval {
            issues.append("non-demo providers must require human approval")
        }
        return issues
    }
}

public struct SeisAIRoutingRequest: Codable, Equatable, Identifiable, Sendable {
    public static let maximumTaskTypeLength = 256

    public let id: String
    public let taskType: String
    public let capability: String
    public let additionalCapabilities: [String]
    public let privacyMode: SeisAIPrivacyMode
    public let contentClassification: SeisAIContentClassification
    public let localOnly: Bool
    public let requiresTools: Bool
    public let minimumContextTokens: Int
    public let maximumCostTier: SeisAICostTier
    public let preferredLatencyTier: SeisAILatencyTier
    public let preferLocal: Bool
    public let requestedProviderID: String?
    public let fallbackPolicy: SeisAIFallbackPolicy

    public init(
        id: String,
        taskType: String,
        capability: String,
        additionalCapabilities: [String] = [],
        privacyMode: SeisAIPrivacyMode = .localOnly,
        contentClassification: SeisAIContentClassification = .repositoryMetadata,
        localOnly: Bool = true,
        requiresTools: Bool = false,
        minimumContextTokens: Int = 0,
        maximumCostTier: SeisAICostTier = .zero,
        preferredLatencyTier: SeisAILatencyTier = .immediate,
        preferLocal: Bool = true,
        requestedProviderID: String? = nil,
        fallbackPolicy: SeisAIFallbackPolicy = .none
    ) {
        self.id = id
        self.taskType = taskType
        self.capability = capability
        self.additionalCapabilities = additionalCapabilities
        self.privacyMode = privacyMode
        self.contentClassification = contentClassification
        self.localOnly = localOnly
        self.requiresTools = requiresTools
        self.minimumContextTokens = minimumContextTokens
        self.maximumCostTier = maximumCostTier
        self.preferredLatencyTier = preferredLatencyTier
        self.preferLocal = preferLocal
        self.requestedProviderID = requestedProviderID
        self.fallbackPolicy = fallbackPolicy
    }

    public var requiredCapabilities: Set<String> {
        Set([capability] + additionalCapabilities)
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let normalizedID = id.trimmingCharacters(in: .whitespacesAndNewlines)
        let normalizedTask = taskType.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalizedID.isEmpty {
            issues.append("request id must not be empty")
        }
        if normalizedTask.isEmpty || normalizedTask.count > Self.maximumTaskTypeLength {
            issues.append("taskType must contain 1...\(Self.maximumTaskTypeLength) characters")
        }
        if taskType.contains("\n") || taskType.contains("\r") {
            issues.append("taskType must be a single-line label, not a prompt body")
        }
        if requiredCapabilities.isEmpty || requiredCapabilities.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("required capabilities must contain only non-empty values")
        }
        if Set(additionalCapabilities).count != additionalCapabilities.count {
            issues.append("additionalCapabilities must not contain duplicates")
        }
        if minimumContextTokens < 0 {
            issues.append("minimumContextTokens must not be negative")
        }
        if let requestedProviderID, requestedProviderID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("requestedProviderID must be nil or non-empty")
        }
        return issues
    }
}

public struct SeisAIProviderRejection: Codable, Equatable, Identifiable, Sendable {
    public var id: String { providerID }
    public let providerID: String
    public let publicState: SeisAICoreProviderState
    public let reasons: [String]

    public init(providerID: String, publicState: SeisAICoreProviderState, reasons: [String]) {
        self.providerID = providerID
        self.publicState = publicState
        self.reasons = reasons
    }
}

public enum SeisAIRouteOutcome: String, CaseIterable, Codable, Equatable, Sendable {
    case localDemoReady = "local-demo-ready"
    case approvalRequired = "approval-required"
    case blocked
}

public struct SeisAIRouteDecision: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let requestID: String
    public let outcome: SeisAIRouteOutcome
    public let selectedProviderID: String?
    public let selectedModelIdentifier: String?
    public let selectedProviderState: SeisAICoreProviderState?
    public let selectionBasis: String
    public let routeEligible: Bool
    public let requiresHumanApproval: Bool
    public let executionPerformed: Bool
    public let providerCallPerformed: Bool
    public let networkCallPerformed: Bool
    public let fallbackUsed: Bool
    public let blockedReasons: [String]
    public let providerRejections: [SeisAIProviderRejection]

    public init(
        id: String,
        requestID: String,
        outcome: SeisAIRouteOutcome,
        selectedProviderID: String?,
        selectedModelIdentifier: String?,
        selectedProviderState: SeisAICoreProviderState?,
        selectionBasis: String,
        routeEligible: Bool,
        requiresHumanApproval: Bool,
        executionPerformed: Bool = false,
        providerCallPerformed: Bool = false,
        networkCallPerformed: Bool = false,
        fallbackUsed: Bool,
        blockedReasons: [String],
        providerRejections: [SeisAIProviderRejection]
    ) {
        self.id = id
        self.requestID = requestID
        self.outcome = outcome
        self.selectedProviderID = selectedProviderID
        self.selectedModelIdentifier = selectedModelIdentifier
        self.selectedProviderState = selectedProviderState
        self.selectionBasis = selectionBasis
        self.routeEligible = routeEligible
        self.requiresHumanApproval = requiresHumanApproval
        self.executionPerformed = executionPerformed
        self.providerCallPerformed = providerCallPerformed
        self.networkCallPerformed = networkCallPerformed
        self.fallbackUsed = fallbackUsed
        self.blockedReasons = blockedReasons
        self.providerRejections = providerRejections
    }

    public var isFailClosed: Bool {
        !executionPerformed && !providerCallPerformed && !networkCallPerformed &&
            (outcome != .blocked || (!routeEligible && selectedProviderID == nil))
    }
}

public struct SeisAIModelRouter: Sendable {
    public init() {}

    public func route(
        _ request: SeisAIRoutingRequest,
        providers: [SeisAIProviderDescriptor]
    ) -> SeisAIRouteDecision {
        let duplicateProviderIDs = providers
            .reduce(into: [String: Int]()) { counts, provider in counts[provider.id, default: 0] += 1 }
            .filter { $0.value > 1 }
            .map(\.key)
            .sorted()

        var globalIssues = request.validationIssues
        if !duplicateProviderIDs.isEmpty {
            globalIssues.append("provider ids must be unique: \(duplicateProviderIDs.joined(separator: ", "))")
        }
        if request.contentClassification == .secret {
            globalIssues.append("secret content is never routable")
        }
        if request.contentClassification == .unknown {
            globalIssues.append("unknown content classification is not routable")
        }

        let rejections = providers.map { provider in
            SeisAIProviderRejection(
                providerID: provider.id,
                publicState: provider.publicState,
                reasons: rejectionReasons(for: provider, request: request)
            )
        }

        guard globalIssues.isEmpty else {
            return blockedDecision(request: request, reasons: globalIssues, rejections: rejections)
        }

        let providersByID = Dictionary(uniqueKeysWithValues: providers.map { ($0.id, $0) })
        let requestedCandidates: [SeisAIProviderDescriptor]
        if let requestedProviderID = request.requestedProviderID {
            requestedCandidates = providersByID[requestedProviderID].map { [$0] } ?? []
        } else {
            requestedCandidates = providers
        }

        let rejectionByProvider = Dictionary(uniqueKeysWithValues: rejections.map { ($0.providerID, $0.reasons) })
        var candidates = requestedCandidates.filter { rejectionByProvider[$0.id, default: ["provider not evaluated"]].isEmpty }
        var fallbackUsed = false

        if candidates.isEmpty && request.fallbackPolicy == .explicitLocalDemo {
            if let localDemo = providersByID[SeisAIProviderDescriptor.localDemo.id],
               rejectionByProvider[localDemo.id, default: ["provider not evaluated"]].isEmpty {
                candidates = [localDemo]
                fallbackUsed = true
            }
        }

        guard let selected = candidates.sorted(by: { providerSortKey($0, request: request) < providerSortKey($1, request: request) }).first else {
            var reasons: [String] = []
            if let requestedProviderID = request.requestedProviderID, providersByID[requestedProviderID] == nil {
                reasons.append("requested provider \(requestedProviderID) is not registered")
            } else if let requestedProviderID = request.requestedProviderID {
                reasons.append("requested provider \(requestedProviderID) is not eligible")
            } else {
                reasons.append("no registered provider satisfies the request")
            }
            if request.fallbackPolicy == .none {
                reasons.append("fallback is disabled; the router never switches providers silently")
            } else {
                reasons.append("the explicitly requested Local Demo fallback is not eligible")
            }
            return blockedDecision(request: request, reasons: reasons, rejections: rejections)
        }

        let outcome: SeisAIRouteOutcome = selected.transport == .deterministicLocalDemo
            ? .localDemoReady
            : .approvalRequired
        let basis = fallbackUsed
            ? "explicit Local Demo fallback selected after the requested route was unavailable"
            : "selected by capability, privacy, content, context, tool, cost, latency, and locality policy"

        return SeisAIRouteDecision(
            id: "route:\(request.id):\(selected.id):\(outcome.rawValue)",
            requestID: request.id,
            outcome: outcome,
            selectedProviderID: selected.id,
            selectedModelIdentifier: selected.modelIdentifier,
            selectedProviderState: selected.publicState,
            selectionBasis: basis,
            routeEligible: true,
            requiresHumanApproval: selected.requiresHumanApproval,
            fallbackUsed: fallbackUsed,
            blockedReasons: outcome == .approvalRequired
                ? ["live or local-model execution requires explicit human approval"]
                : [],
            providerRejections: rejections
        )
    }

    private func rejectionReasons(
        for provider: SeisAIProviderDescriptor,
        request: SeisAIRoutingRequest
    ) -> [String] {
        var reasons = provider.validationIssues
        if provider.publicState != .available {
            reasons.append("provider state is \(provider.publicState.rawValue)")
        }
        if !provider.enabled {
            reasons.append("provider is disabled")
        }
        if !provider.routingEligible {
            reasons.append("provider is not routing eligible")
        }
        let missingCapabilities = request.requiredCapabilities.subtracting(provider.capabilities)
        if !missingCapabilities.isEmpty {
            reasons.append("missing capabilities: \(missingCapabilities.sorted().joined(separator: ", "))")
        }
        if request.requiresTools && !provider.supportsTools {
            reasons.append("tool support is required")
        }
        if request.minimumContextTokens > provider.maximumContextTokens {
            reasons.append("minimum context exceeds provider capacity")
        }
        if request.maximumCostTier.rank < provider.costTier.rank {
            reasons.append("provider exceeds the maximum cost tier")
        }
        if !provider.allowedContent.contains(request.contentClassification) {
            reasons.append("content classification is outside the provider privacy boundary")
        }
        if (request.localOnly || request.privacyMode == .localOnly) && !provider.transport.isLocal {
            reasons.append("local-only requests cannot route to backend services")
        }
        if request.privacyMode == .reviewGated && request.contentClassification == .privateUserData {
            reasons.append("private user data requires a separate approved private-data runtime")
        }
        return reasons
    }

    private func providerSortKey(
        _ provider: SeisAIProviderDescriptor,
        request: SeisAIRoutingRequest
    ) -> String {
        let localityRank = request.preferLocal && provider.transport.isLocal ? 0 : 1
        let latencyDistance = abs(provider.latencyTier.rank - request.preferredLatencyTier.rank)
        return String(
            format: "%01d-%01d-%01d-%@",
            localityRank,
            provider.costTier.rank,
            latencyDistance,
            provider.id
        )
    }

    private func blockedDecision(
        request: SeisAIRoutingRequest,
        reasons: [String],
        rejections: [SeisAIProviderRejection]
    ) -> SeisAIRouteDecision {
        SeisAIRouteDecision(
            id: "route:\(request.id):blocked",
            requestID: request.id,
            outcome: .blocked,
            selectedProviderID: nil,
            selectedModelIdentifier: nil,
            selectedProviderState: nil,
            selectionBasis: "fail-closed",
            routeEligible: false,
            requiresHumanApproval: false,
            fallbackUsed: false,
            blockedReasons: reasons,
            providerRejections: rejections
        )
    }
}
