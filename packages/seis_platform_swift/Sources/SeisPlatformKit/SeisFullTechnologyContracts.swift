import Foundation

public enum SeisCanonicalGoalBindingStatus: String, Codable, Equatable, Sendable {
    case unresolved
    case resolved
    case mapped
}

public struct SeisCanonicalGoalBinding: Codable, Equatable, Sendable {
    public let status: SeisCanonicalGoalBindingStatus
    public let reason: String
    public let source: String

    public init(status: SeisCanonicalGoalBindingStatus, reason: String, source: String) {
        self.status = status
        self.reason = reason
        self.source = source
    }
}

public struct SeisFullTechnologySummary: Codable, Equatable, Sendable {
    public let domainCount: Int
    public let capabilityCount: Int
    public let implementationClasses: [String]
    public let maturityStates: [String]

    public init(
        domainCount: Int,
        capabilityCount: Int,
        implementationClasses: [String],
        maturityStates: [String]
    ) {
        self.domainCount = domainCount
        self.capabilityCount = capabilityCount
        self.implementationClasses = implementationClasses
        self.maturityStates = maturityStates
    }
}

public struct SeisFullTechnologyDomain: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let name: String
    public let capabilities: [String]

    public init(id: String, name: String, capabilities: [String]) {
        self.id = id
        self.name = name
        self.capabilities = capabilities
    }
}

public struct SeisFullTechnologySafetyBoundary: Codable, Equatable, Sendable {
    public let defaultNetwork: String
    public let defaultWrite: String
    public let externalMutationRequiresApproval: Bool
    public let credentialsInRegistry: Bool
    public let demoClaimsMustBeExplicit: Bool
    public let unverifiedCapabilitiesMustRemainUnavailableOrProposed: Bool

    public init(
        defaultNetwork: String,
        defaultWrite: String,
        externalMutationRequiresApproval: Bool,
        credentialsInRegistry: Bool,
        demoClaimsMustBeExplicit: Bool,
        unverifiedCapabilitiesMustRemainUnavailableOrProposed: Bool
    ) {
        self.defaultNetwork = defaultNetwork
        self.defaultWrite = defaultWrite
        self.externalMutationRequiresApproval = externalMutationRequiresApproval
        self.credentialsInRegistry = credentialsInRegistry
        self.demoClaimsMustBeExplicit = demoClaimsMustBeExplicit
        self.unverifiedCapabilitiesMustRemainUnavailableOrProposed = unverifiedCapabilitiesMustRemainUnavailableOrProposed
    }
}

public struct SeisFullTechnologyRegistry: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let requestedGoalID: String
    public let canonicalGoalBinding: SeisCanonicalGoalBinding
    public let mode: String
    public let status: String
    public let summary: SeisFullTechnologySummary
    public let domains: [SeisFullTechnologyDomain]
    public let universalFrameworks: [String]
    public let coreSystems: [String]
    public let safetyBoundary: SeisFullTechnologySafetyBoundary

    public init(
        version: Int,
        id: String,
        requestedGoalID: String,
        canonicalGoalBinding: SeisCanonicalGoalBinding,
        mode: String,
        status: String,
        summary: SeisFullTechnologySummary,
        domains: [SeisFullTechnologyDomain],
        universalFrameworks: [String],
        coreSystems: [String],
        safetyBoundary: SeisFullTechnologySafetyBoundary
    ) {
        self.version = version
        self.id = id
        self.requestedGoalID = requestedGoalID
        self.canonicalGoalBinding = canonicalGoalBinding
        self.mode = mode
        self.status = status
        self.summary = summary
        self.domains = domains
        self.universalFrameworks = universalFrameworks
        self.coreSystems = coreSystems
        self.safetyBoundary = safetyBoundary
    }

    private enum CodingKeys: String, CodingKey {
        case version
        case id
        case requestedGoalID = "requestedGoalId"
        case canonicalGoalBinding
        case mode
        case status
        case summary
        case domains
        case universalFrameworks
        case coreSystems
        case safetyBoundary
    }
}

public enum SeisFullTechnologyValidationError: Error, Equatable, Sendable {
    case duplicateDomainID(String)
    case domainCountMismatch(declared: Int, actual: Int)
    case capabilityCountMismatch(declared: Int, actual: Int)
    case unsafeDefaultBoundary(network: String, write: String)
    case credentialsStoredInRegistry
    case externalMutationNotApprovalGated
}

public struct SeisFullTechnologyCatalog: Equatable, Sendable {
    public let registry: SeisFullTechnologyRegistry
    private let domainsByID: [String: SeisFullTechnologyDomain]

    public init(validating registry: SeisFullTechnologyRegistry) throws {
        var uniqueDomains: [String: SeisFullTechnologyDomain] = [:]
        uniqueDomains.reserveCapacity(registry.domains.count)

        for domain in registry.domains {
            guard uniqueDomains[domain.id] == nil else {
                throw SeisFullTechnologyValidationError.duplicateDomainID(domain.id)
            }
            uniqueDomains[domain.id] = domain
        }

        guard registry.summary.domainCount == registry.domains.count else {
            throw SeisFullTechnologyValidationError.domainCountMismatch(
                declared: registry.summary.domainCount,
                actual: registry.domains.count
            )
        }

        let actualCapabilityCount = registry.domains.reduce(into: 0) { count, domain in
            count += domain.capabilities.count
        }
        guard registry.summary.capabilityCount == actualCapabilityCount else {
            throw SeisFullTechnologyValidationError.capabilityCountMismatch(
                declared: registry.summary.capabilityCount,
                actual: actualCapabilityCount
            )
        }

        let safety = registry.safetyBoundary
        guard safety.defaultNetwork == "deny", safety.defaultWrite == "deny" else {
            throw SeisFullTechnologyValidationError.unsafeDefaultBoundary(
                network: safety.defaultNetwork,
                write: safety.defaultWrite
            )
        }
        guard safety.credentialsInRegistry == false else {
            throw SeisFullTechnologyValidationError.credentialsStoredInRegistry
        }
        guard safety.externalMutationRequiresApproval else {
            throw SeisFullTechnologyValidationError.externalMutationNotApprovalGated
        }

        self.registry = registry
        self.domainsByID = uniqueDomains
    }

    public var domainCount: Int {
        registry.domains.count
    }

    public var capabilityCount: Int {
        registry.domains.reduce(into: 0) { count, domain in
            count += domain.capabilities.count
        }
    }

    public var isReadOnlyByDefault: Bool {
        registry.safetyBoundary.defaultNetwork == "deny"
            && registry.safetyBoundary.defaultWrite == "deny"
            && registry.safetyBoundary.credentialsInRegistry == false
            && registry.safetyBoundary.externalMutationRequiresApproval
    }

    public func domain(id: String) -> SeisFullTechnologyDomain? {
        domainsByID[id]
    }
}
