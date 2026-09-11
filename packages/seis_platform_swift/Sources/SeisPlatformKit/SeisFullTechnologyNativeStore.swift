import Foundation

public enum SeisFullTechnologyNativeFailureKind: String, Equatable, Sendable {
    case registryUnavailable
    case registryUnreadable
    case registryInvalid
    case registryRejected
    case unknown
}

public struct SeisFullTechnologyNativeFailure: Equatable, Sendable {
    public let kind: SeisFullTechnologyNativeFailureKind
    public let title: String
    public let detail: String
    public let recovery: String

    public init(
        kind: SeisFullTechnologyNativeFailureKind,
        title: String,
        detail: String,
        recovery: String
    ) {
        self.kind = kind
        self.title = title
        self.detail = detail
        self.recovery = recovery
    }

    public static func message(for kind: SeisFullTechnologyNativeFailureKind) -> Self {
        switch kind {
        case .registryUnavailable:
            return Self(
                kind: kind,
                title: "Registry unavailable",
                detail: "The canonical Full Technology registry could not be found from the selected repository location.",
                recovery: "Choose the SEIS repository root and try again."
            )
        case .registryUnreadable:
            return Self(
                kind: kind,
                title: "Registry unreadable",
                detail: "The canonical Full Technology registry exists but could not be read safely.",
                recovery: "Check local file permissions, then try again."
            )
        case .registryInvalid:
            return Self(
                kind: kind,
                title: "Registry invalid",
                detail: "The canonical Full Technology registry is not valid JSON for the current native contract.",
                recovery: "Validate the registry and contract version before reloading."
            )
        case .registryRejected:
            return Self(
                kind: kind,
                title: "Registry rejected",
                detail: "The registry was decoded but failed canonical count or safety-boundary validation.",
                recovery: "Repair the canonical registry instead of bypassing validation."
            )
        case .unknown:
            return Self(
                kind: kind,
                title: "Technology Center unavailable",
                detail: "The native Technology Center could not load the canonical registry.",
                recovery: "Review the local validation evidence and try again."
            )
        }
    }
}

public enum SeisFullTechnologyNativeStorePhase: Equatable, Sendable {
    case idle
    case loading
    case loaded(SeisFullTechnologyExplorerState)
    case failed(SeisFullTechnologyNativeFailureKind)
}

public struct SeisFullTechnologyNativeStore: Equatable, Sendable {
    public private(set) var phase: SeisFullTechnologyNativeStorePhase

    public init(phase: SeisFullTechnologyNativeStorePhase = .idle) {
        self.phase = phase
    }

    public var explorerState: SeisFullTechnologyExplorerState? {
        guard case .loaded(let explorerState) = phase else {
            return nil
        }
        return explorerState
    }

    public var failure: SeisFullTechnologyNativeFailure? {
        guard case .failed(let kind) = phase else {
            return nil
        }
        return .message(for: kind)
    }

    public mutating func load(
        startingAt repositoryURL: URL,
        using loader: (URL) throws -> SeisFullTechnologyCatalog = {
            try SeisFullTechnologyRepositoryLoader().loadCatalog(startingAt: $0)
        }
    ) {
        phase = .loading

        do {
            let catalog = try loader(repositoryURL)
            phase = .loaded(SeisFullTechnologyExplorerState(catalog: catalog))
        } catch let error as SeisFullTechnologyRepositoryLoaderError {
            phase = .failed(Self.failureKind(for: error))
        } catch is SeisFullTechnologyValidationError {
            phase = .failed(.registryRejected)
        } catch {
            phase = .failed(.unknown)
        }
    }

    public mutating func updateQuery(_ query: String) {
        guard case .loaded(var explorerState) = phase else {
            return
        }
        explorerState.updateQuery(query)
        phase = .loaded(explorerState)
    }

    @discardableResult
    public mutating func selectDomain(id: String) -> Bool {
        guard case .loaded(var explorerState) = phase else {
            return false
        }

        let didSelect = explorerState.selectDomain(id: id)
        phase = .loaded(explorerState)
        return didSelect
    }

    private static func failureKind(
        for error: SeisFullTechnologyRepositoryLoaderError
    ) -> SeisFullTechnologyNativeFailureKind {
        switch error {
        case .registryNotFound:
            return .registryUnavailable
        case .registryUnreadable:
            return .registryUnreadable
        case .registryInvalid:
            return .registryInvalid
        }
    }
}
