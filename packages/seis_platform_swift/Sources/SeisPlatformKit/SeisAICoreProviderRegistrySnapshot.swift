import Foundation

public struct SeisAIProviderStateModel: Codable, Equatable, Identifiable, Sendable {
    public let state: String
    public let routingEligible: Bool
    public let meaning: String

    public init(state: String, routingEligible: Bool, meaning: String) {
        self.state = state
        self.routingEligible = routingEligible
        self.meaning = meaning
    }

    public var validationIssues: [String] {
        if state.isEmpty || meaning.isEmpty { return ["provider state \(state) is incomplete"] }
        if state != "Available" && routingEligible { return ["provider state \(state) must not be routing eligible"] }
        return []
    }
}

public struct SeisAIProviderRegistryProvider: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let category: String
    public let publicStatus: String
    public let credentialRequirement: String
    public let expectedEnv: [String]
    public let configured: Bool
    public let enabled: Bool
    public let routingEligible: Bool
    public let privacyClass: String
    public let capabilities: [String]
    public let modelAliases: [String]
    public let actualModel: String
    public let backendOnly: Bool
    public let frontendSecretAllowed: Bool
    public let fallbackEligible: Bool
    public let evidence: [String]
    public let notes: String

    public init(
        id: String,
        displayName: String,
        category: String,
        publicStatus: String,
        credentialRequirement: String,
        expectedEnv: [String],
        configured: Bool,
        enabled: Bool,
        routingEligible: Bool,
        privacyClass: String,
        capabilities: [String],
        modelAliases: [String],
        actualModel: String,
        backendOnly: Bool,
        frontendSecretAllowed: Bool,
        fallbackEligible: Bool,
        evidence: [String],
        notes: String
    ) {
        self.id = id
        self.displayName = displayName
        self.category = category
        self.publicStatus = publicStatus
        self.credentialRequirement = credentialRequirement
        self.expectedEnv = expectedEnv
        self.configured = configured
        self.enabled = enabled
        self.routingEligible = routingEligible
        self.privacyClass = privacyClass
        self.capabilities = capabilities
        self.modelAliases = modelAliases
        self.actualModel = actualModel
        self.backendOnly = backendOnly
        self.frontendSecretAllowed = frontendSecretAllowed
        self.fallbackEligible = fallbackEligible
        self.evidence = evidence
        self.notes = notes
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if [id, displayName, category, publicStatus, credentialRequirement, privacyClass, actualModel, notes].contains(where: { $0.isEmpty }) {
            issues.append("provider \(id) has incomplete identity")
        }
        if capabilities.isEmpty || modelAliases.isEmpty || evidence.isEmpty { issues.append("provider \(id) must include capabilities, aliases, and evidence") }
        if !backendOnly { issues.append("provider \(id) must remain backend-only") }
        if frontendSecretAllowed { issues.append("provider \(id) cannot allow frontend secrets") }
        if publicStatus == "Available" {
            if !configured || !enabled || !routingEligible { issues.append("available provider \(id) must be configured, enabled, and route-eligible") }
        } else if routingEligible {
            issues.append("provider \(id) state \(publicStatus) must not be route-eligible")
        }
        return issues
    }

    public var statusColorKey: String {
        switch publicStatus {
        case "Available": return "green"
        case "Missing Key": return "orange"
        case "Disabled": return "secondary"
        case "Rate Limited", "Error": return "red"
        default: return "orange"
        }
    }
}

public struct SeisAIOptionalLiveProvider: Codable, Equatable, Identifiable, Sendable {
    public let providerId: String
    public let env: [String]
    public let scope: String

    public var id: String { providerId }

    public init(providerId: String, env: [String], scope: String) {
        self.providerId = providerId
        self.env = env
        self.scope = scope
    }
}

public enum SeisAICoreProviderRegistrySnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAICoreProviderRegistrySnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: Int
    public let status: String
    public let updatedAt: String
    public let purpose: String
    public let qualityGate: String
    public let sourceOfTruth: [String: String]
    public let truthBoundary: String
    public let publicStates: [String]
    public let stateModel: [SeisAIProviderStateModel]
    public let coreCredentialRequirement: String
    public let defaultRoutingMode: String
    public let localOnlyRespected: Bool
    public let requiredForCore: [String]
    public let fallbackOrder: [String]
    public let providers: [SeisAIProviderRegistryProvider]
    public let optionalForLiveFeatures: [SeisAIOptionalLiveProvider]
    public let noKeyProviders: [String]
    public let securityInvariants: [String]
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: Int,
        status: String,
        updatedAt: String,
        purpose: String,
        qualityGate: String,
        sourceOfTruth: [String: String],
        truthBoundary: String,
        publicStates: [String],
        stateModel: [SeisAIProviderStateModel],
        coreCredentialRequirement: String,
        defaultRoutingMode: String,
        localOnlyRespected: Bool,
        requiredForCore: [String],
        fallbackOrder: [String],
        providers: [SeisAIProviderRegistryProvider],
        optionalForLiveFeatures: [SeisAIOptionalLiveProvider],
        noKeyProviders: [String],
        securityInvariants: [String],
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.updatedAt = updatedAt
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.sourceOfTruth = sourceOfTruth
        self.truthBoundary = truthBoundary
        self.publicStates = publicStates
        self.stateModel = stateModel
        self.coreCredentialRequirement = coreCredentialRequirement
        self.defaultRoutingMode = defaultRoutingMode
        self.localOnlyRespected = localOnlyRespected
        self.requiredForCore = requiredForCore
        self.fallbackOrder = fallbackOrder
        self.providers = providers
        self.optionalForLiveFeatures = optionalForLiveFeatures
        self.noKeyProviders = noKeyProviders
        self.securityInvariants = securityInvariants
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisAICoreProviderRegistrySnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAICoreProviderRegistrySnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAICoreProviderRegistrySnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-core-provider-registry" { issues.append("provider registry id must identify the canonical registry") }
        if version != 1 || status.isEmpty || updatedAt.isEmpty || purpose.isEmpty || qualityGate.isEmpty { issues.append("provider registry identity is incomplete") }
        let boundaryTerms = ["no live provider calls", "no credential validation", "no network health checks", "no SSH checks", "no deployment", "no GitHub mutation"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) {
            issues.append("provider truth boundary must state \(term)")
        }
        if publicStates != ["Available", "Missing Key", "Disabled", "Rate Limited", "Error"] { issues.append("provider public states are not canonical") }
        if stateModel.count != 5 { issues.append("provider state model must contain five states") }
        if coreCredentialRequirement != "none" || defaultRoutingMode != "local-demo" || !localOnlyRespected || !requiredForCore.isEmpty {
            issues.append("provider zero-key core boundary is unsafe")
        }
        if fallbackOrder.count != 5 || providers.count != 7 || optionalForLiveFeatures.count != 4 || noKeyProviders.count != 3 || securityInvariants.count != 7 {
            issues.append("provider registry counts are not canonical")
        }
        for state in stateModel { issues.append(contentsOf: state.validationIssues) }
        for provider in providers { issues.append(contentsOf: provider.validationIssues) }
        if Set(providers.map(\.id)).count != providers.count { issues.append("provider IDs must be unique") }
        if nextSafeActions.isEmpty { issues.append("provider registry next safe actions must not be empty") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            localOnlyRespected &&
            providers.allSatisfy { $0.backendOnly && !$0.frontendSecretAllowed } &&
            providers.filter { $0.publicStatus == "Available" }.allSatisfy { $0.routingEligible }
    }
}
