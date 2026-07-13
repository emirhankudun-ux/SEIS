import Foundation

public struct SeisFullStackEndpoint: Codable, Equatable, Identifiable, Sendable {
    public let route: String
    public let method: String
    public let sourceKey: String
    public let status: String
    public let mode: String

    public var id: String { route }

    public var isReadOnlyLocalDemo: Bool {
        method == "GET" && status == "working-local-demo" && mode == "read-only"
    }
}

public struct SeisFullStackServerBoundary: Codable, Equatable, Sendable {
    public let runtime: String
    public let dependencyPolicy: String
    public let writePolicy: String
    public let storagePolicy: String
    public let secretPolicy: String
    public let approvalRequiredFor: [String]
}

public struct SeisFullStackAuth: Codable, Equatable, Sendable {
    public let status: String
    public let provider: String
    public let approvalRequired: Bool
}

public struct SeisFullStackSession: Codable, Equatable, Sendable {
    public let sessionId: String
    public let userMode: String
    public let privacyMode: String
    public let storageMode: String
    public let auth: SeisFullStackAuth
    public let capabilitySummary: [String: String]
}

public struct SeisFullStackProviderStatus: Codable, Equatable, Identifiable, Sendable {
    public let providerId: String
    public let status: String
    public let expectedEnv: [String]
    public let backendOnly: Bool
    public let frontendSecretAllowed: Bool
    public let liveCallVerified: Bool
    public let routeEligible: Bool

    public var id: String { providerId }

    public var respectsSecretBoundary: Bool {
        backendOnly && !frontendSecretAllowed && !liveCallVerified
    }
}

public struct SeisFullStackAgentTask: Codable, Equatable, Identifiable, Sendable {
    public let taskId: String
    public let forbiddenActions: [String]
    public let approvalRequired: Bool
    public let validation: String

    public var id: String { taskId }

    public var isDryRunBounded: Bool {
        !forbiddenActions.isEmpty &&
            (forbiddenActions.contains("secret access") ||
                forbiddenActions.contains("print secret") ||
                approvalRequired) &&
            !validation.isEmpty
    }
}

public struct SeisFullStackCapability: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let state: String
}

public enum SeisFullStackContractSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisFullStackContractSnapshot: Codable, Equatable, Sendable {
    public let schemaVersion: Int
    public let id: String
    public let updated: String
    public let status: String
    public let mode: String
    public let qualityGate: String
    public let runtimeGate: String
    public let fallbackGate: String
    public let coreCredentialRequirement: String
    public let localDemoFirst: Bool
    public let staticDemoFallbackRequired: Bool
    public let securityInvariants: [String]
    public let frontendState: SeisFullStackFrontendState
    public let serverBoundary: SeisFullStackServerBoundary
    public let publicEndpoints: [SeisFullStackEndpoint]
    public let session: SeisFullStackSession
    public let providerStatus: [SeisFullStackProviderStatus]
    public let agentTasks: [SeisFullStackAgentTask]
    public let capabilities: [SeisFullStackCapability]

    public static func validated(from data: Data) throws -> SeisFullStackContractSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisFullStackContractSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisFullStackContractSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if schemaVersion != 1 || id != "seis-fullstack-contract" || status != "validated-contract" || mode != "local-demo-no-key-fullstack-foundation" { issues.append("full-stack contract identity or status is invalid") }
        if qualityGate != "npm run check:seis-fullstack-contract" || runtimeGate != "npm run check:seis-fullstack-server-smoke" || fallbackGate != "npm run check:seis-fullstack-no-server-fallback-smoke" { issues.append("full-stack quality gates are incomplete") }
        if coreCredentialRequirement != "none" || !localDemoFirst || !staticDemoFallbackRequired { issues.append("full-stack credential or fallback boundary is unsafe") }
        if !securityInvariants.contains("Core SEIS must start with zero cloud provider keys.") || !securityInvariants.contains("Provider secrets must never be stored in browser localStorage, IndexedDB, route config, static JSON, or frontend bundles.") || !securityInvariants.contains("Local Demo fallback must remain available when every optional provider key is missing.") { issues.append("full-stack security invariants are incomplete") }
        if !frontendState.forbiddenClientPersistence.contains("API keys") || !frontendState.forbiddenClientPersistence.contains("provider credentials") || !frontendState.fallbackContract.contains("without the server endpoints") { issues.append("full-stack client fallback or secret boundary is incomplete") }
        if serverBoundary.runtime != "node:http static server" || serverBoundary.dependencyPolicy != "no-new-dependencies-first" || serverBoundary.writePolicy != "read-only endpoints for first contract slice" || !serverBoundary.approvalRequiredFor.contains("live AI provider calls") || !serverBoundary.approvalRequiredFor.contains("SSH execution") || !serverBoundary.approvalRequiredFor.contains("deployment") { issues.append("full-stack server boundary is unsafe") }
        let requiredRoutes = ["/_server/session", "/_server/capabilities", "/_server/projects", "/_server/app-installs", "/_server/provider-status", "/_server/audit-log", "/_server/agent-tasks", "/_server/fullstack-contract"]
        if publicEndpoints.count != requiredRoutes.count || Set(publicEndpoints.map(\.route)) != Set(requiredRoutes) || !publicEndpoints.allSatisfy(\.isReadOnlyLocalDemo) { issues.append("full-stack endpoint contract is incomplete or writable") }
        if session.sessionId != "local-demo-session" || session.userMode != "anonymous-local-demo" || session.privacyMode != "local-first" || session.auth.status != "planned" || session.auth.provider != "none" || !session.auth.approvalRequired || session.capabilitySummary["ssh"] != "disabled" || session.capabilitySummary["deployment"] != "disabled" { issues.append("full-stack session boundary is unsafe") }
        let allowedProviderStates = Set(["Available", "Missing Key", "Disabled", "Rate Limited", "Error"])
        if providerStatus.count != 5 || !providerStatus.allSatisfy({ allowedProviderStates.contains($0.status) && $0.respectsSecretBoundary && !($0.expectedEnv.contains(where: { $0.hasPrefix("NEXT_PUBLIC_") || $0.hasPrefix("VITE_") || $0.hasPrefix("PUBLIC_") || $0.hasPrefix("REACT_APP_") })) }) { issues.append("full-stack provider status boundary is unsafe") }
        if providerStatus.filter({ $0.status == "Available" }).contains(where: { !$0.routeEligible }) || providerStatus.filter({ $0.status != "Available" }).contains(where: { $0.routeEligible }) { issues.append("full-stack provider route eligibility is inconsistent") }
        if agentTasks.count != 3 || !agentTasks.allSatisfy(\.isDryRunBounded) { issues.append("full-stack agent tasks are not bounded dry-runs") }
        let requiredCapabilityIDs = Set(["frontend-os-shell", "browser-local-vfs", "server-api-fixtures", "provider-router", "external-database", "ssh-execution", "deployment"])
        if capabilities.count != requiredCapabilityIDs.count || Set(capabilities.map(\.id)) != requiredCapabilityIDs { issues.append("full-stack capability inventory is incomplete") }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            localDemoFirst &&
            staticDemoFallbackRequired &&
            serverBoundary.writePolicy == "read-only endpoints for first contract slice"
    }
}

public struct SeisFullStackFrontendState: Codable, Equatable, Sendable {
    public let forbiddenClientPersistence: [String]
    public let fallbackContract: String
}
