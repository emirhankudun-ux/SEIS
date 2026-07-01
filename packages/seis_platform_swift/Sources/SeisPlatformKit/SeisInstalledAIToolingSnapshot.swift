import Foundation

public struct SEISInstalledAIToolSnapshot: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let status: SEISDemoStatus
    public let requiresAccount: Bool
    public let requiresAPIKey: Bool
    public let canWriteRepository: Bool
    public let observedState: String
    public let boundary: String

    public init(
        id: String,
        name: String,
        status: SEISDemoStatus,
        requiresAccount: Bool,
        requiresAPIKey: Bool,
        canWriteRepository: Bool,
        observedState: String,
        boundary: String
    ) {
        self.id = id
        self.name = name
        self.status = status
        self.requiresAccount = requiresAccount
        self.requiresAPIKey = requiresAPIKey
        self.canWriteRepository = canWriteRepository
        self.observedState = observedState
        self.boundary = boundary
    }
}

public extension SEISAppleFirstFoundation {
    static let installedAIToolSnapshots: [SEISInstalledAIToolSnapshot] = [
        SEISInstalledAIToolSnapshot(
            id: "claude-code-cli-auth-gated",
            name: "Claude Code CLI",
            status: .metadataOnly,
            requiresAccount: true,
            requiresAPIKey: false,
            canWriteRepository: false,
            observedState: "Claude Code CLI local auth reports loggedIn true and sanitized smoke returned CLAUDE_OK.",
            boundary: "Local Claude Code auth is review-only metadata, not product AI implementation."
        ),
        SEISInstalledAIToolSnapshot(
            id: "hermes-desktop-auth-gated",
            name: "Hermes",
            status: .metadataOnly,
            requiresAccount: true,
            requiresAPIKey: false,
            canWriteRepository: false,
            observedState: "Hermes local OpenAI Codex provider route returned HERMES_OK; Nous Portal remains not logged in.",
            boundary: "Hermes receives sanitized review context only and must not become a repository writer."
        )
    ]
}
