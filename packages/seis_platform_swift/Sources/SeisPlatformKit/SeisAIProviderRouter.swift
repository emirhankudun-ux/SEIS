import Foundation

public struct SeisAIProviderSurface: Codable, Equatable, Sendable {
    public let id: String
    public let role: String
    public let runtime: String
    public let onlineCapable: Bool
    public let offlineCapable: Bool
    public let authReady: Bool
    public let credentialBoundary: Bool
    public let priority: Int

    public init(
        id: String,
        role: String,
        runtime: String,
        onlineCapable: Bool,
        offlineCapable: Bool,
        authReady: Bool,
        credentialBoundary: Bool,
        priority: Int
    ) {
        self.id = id
        self.role = role
        self.runtime = runtime
        self.onlineCapable = onlineCapable
        self.offlineCapable = offlineCapable
        self.authReady = authReady
        self.credentialBoundary = credentialBoundary
        self.priority = priority
    }
}

public struct SeisAIProviderRoutingDecision: Codable, Equatable, Sendable {
    public let ready: Bool
    public let remoteOrchestrator: String
    public let selectedLocalHelpers: [String]
    public let offlineFallback: String
    public let blockers: [String]
}

public enum SeisAIProviderRouter {
    public static let defaultProviders: [SeisAIProviderSurface] = [
        SeisAIProviderSurface(
            id: "seis-agent",
            role: "remote-orchestrator",
            runtime: "seis",
            onlineCapable: true,
            offlineCapable: false,
            authReady: true,
            credentialBoundary: true,
            priority: 0
        ),
        SeisAIProviderSurface(
            id: "openai",
            role: "local-helper",
            runtime: "remote-api",
            onlineCapable: true,
            offlineCapable: false,
            authReady: true,
            credentialBoundary: true,
            priority: 10
        ),
        SeisAIProviderSurface(
            id: "claude",
            role: "local-helper",
            runtime: "remote-api",
            onlineCapable: true,
            offlineCapable: false,
            authReady: true,
            credentialBoundary: true,
            priority: 20
        ),
        SeisAIProviderSurface(
            id: "gemini",
            role: "local-helper",
            runtime: "remote-api",
            onlineCapable: true,
            offlineCapable: false,
            authReady: true,
            credentialBoundary: true,
            priority: 30
        ),
        SeisAIProviderSurface(
            id: "ollama",
            role: "offline-helper",
            runtime: "local-model",
            onlineCapable: false,
            offlineCapable: true,
            authReady: true,
            credentialBoundary: true,
            priority: 100
        )
    ]

    public static func evaluate(
        networkOnline: Bool,
        providers: [SeisAIProviderSurface] = defaultProviders
    ) -> SeisAIProviderRoutingDecision {
        var blockers: [String] = []
        let remote = providers.filter { $0.role == "remote-orchestrator" }

        if remote.map(\.id) != ["seis-agent"] {
            blockers.append("remote_orchestrator_must_be_seis_agent_only")
        }

        for provider in providers {
            if provider.role == "remote-orchestrator" && provider.id != "seis-agent" {
                blockers.append("local_helper_promoted_to_remote:\(provider.id)")
            }
            if !provider.credentialBoundary {
                blockers.append("credential_boundary_missing:\(provider.id)")
            }
            if !provider.authReady && provider.onlineCapable {
                blockers.append("auth_not_ready:\(provider.id)")
            }
        }

        let candidates = providers
            .filter { provider in
                if networkOnline {
                    return provider.role == "local-helper" &&
                        provider.onlineCapable &&
                        provider.authReady &&
                        provider.credentialBoundary
                }
                return provider.role == "offline-helper" &&
                    provider.id == "ollama" &&
                    provider.offlineCapable &&
                    provider.authReady &&
                    provider.credentialBoundary
            }
            .sorted { left, right in
                left.priority == right.priority ? left.id < right.id : left.priority < right.priority
            }

        if networkOnline && candidates.isEmpty {
            blockers.append("online_ai_helper_missing")
        }
        if !networkOnline && candidates.first?.id != "ollama" {
            blockers.append("offline_ollama_fallback_missing")
        }

        blockers.sort()
        return SeisAIProviderRoutingDecision(
            ready: blockers.isEmpty,
            remoteOrchestrator: remote.first?.id ?? "",
            selectedLocalHelpers: candidates.map(\.id),
            offlineFallback: networkOnline ? "ollama-standby" : (candidates.first?.id ?? ""),
            blockers: blockers
        )
    }
}
