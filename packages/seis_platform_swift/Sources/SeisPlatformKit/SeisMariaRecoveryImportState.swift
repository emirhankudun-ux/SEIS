import Foundation

/// Explicit UI state; an imported snapshot never proves freshness or authenticity.
/// Request identities prevent late reads from restoring cleared or replaced data.
public struct SeisMariaRecoveryImportState: Sendable {
    public enum Phase: Equatable, Sendable {
        case unloaded
        case loading
        case loaded(SeisMariaRecoverySnapshot)
        case invalid(SeisMariaRecoveryError)
    }

    public private(set) var phase: Phase = .unloaded
    private var activeRequest: UUID?
    public var isLive: Bool { false }
    public var executionAuthorized: Bool { false }

    public init() {}

    public mutating func beginImport() -> UUID {
        let token = UUID()
        activeRequest = token
        phase = .loading
        return token
    }

    public mutating func finishImport(
        token: UUID,
        result: Result<SeisMariaRecoverySnapshot, SeisMariaRecoveryError>
    ) {
        guard activeRequest == token else { return }
        activeRequest = nil
        switch result {
        case .success(let snapshot): phase = .loaded(snapshot)
        case .failure(let error): phase = .invalid(error)
        }
    }

    public mutating func clear() {
        activeRequest = nil
        phase = .unloaded
    }
}
