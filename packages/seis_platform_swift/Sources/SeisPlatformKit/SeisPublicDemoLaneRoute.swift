import Foundation

public struct SeisPublicDemoLaneQueryItem: Codable, Equatable, Sendable {
    public let name: String
    public let value: String

    public init(name: String, value: String) {
        self.name = name
        self.value = value
    }
}

public enum SeisPublicDemoLaneSource: String, Codable, CaseIterable, Sendable {
    case website
    case ubuntu

    public var visibleTitle: String {
        switch self {
        case .website:
            return "Website Lane"
        case .ubuntu:
            return "Ubuntu Desktop"
        }
    }

    public var archiveID: String {
        switch self {
        case .website:
            return "stitch_yapay_zeka_web_platformu"
        case .ubuntu:
            return "stitch_web_based_linux_desktop"
        }
    }

    public var moduleCount: Int {
        switch self {
        case .website:
            return 71
        case .ubuntu:
            return 148
        }
    }

    public var shortCode: String {
        switch self {
        case .website:
            return "WEB"
        case .ubuntu:
            return "UBU"
        }
    }

    public var systemImageName: String {
        switch self {
        case .website:
            return "globe"
        case .ubuntu:
            return "display"
        }
    }
}

public enum SeisAppLibrarySurfaceKind: String, Codable, CaseIterable, Sendable {
    case library
    case sourceLane
    case aiChat
    case codeAI
    case agiControl
    case sshControl
}

public struct SeisAppLibrarySurface: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let shortCode: String
    public let kind: SeisAppLibrarySurfaceKind
    public let laneSource: SeisPublicDemoLaneSource?
    public let systemImageName: String
    public let summary: String
    public let deepLink: String?
    public let status: SEISDemoStatus
    public let requiresBackend: Bool
    public let requiresHumanApproval: Bool
    public let isPublicDemoSafe: Bool
    public let forbiddenLiveClaims: [String]

    public init(
        id: String,
        title: String,
        shortCode: String,
        kind: SeisAppLibrarySurfaceKind,
        laneSource: SeisPublicDemoLaneSource? = nil,
        systemImageName: String,
        summary: String,
        deepLink: String? = nil,
        status: SEISDemoStatus,
        requiresBackend: Bool,
        requiresHumanApproval: Bool,
        isPublicDemoSafe: Bool,
        forbiddenLiveClaims: [String] = []
    ) {
        self.id = id
        self.title = title
        self.shortCode = shortCode
        self.kind = kind
        self.laneSource = laneSource
        self.systemImageName = systemImageName
        self.summary = summary
        self.deepLink = deepLink
        self.status = status
        self.requiresBackend = requiresBackend
        self.requiresHumanApproval = requiresHumanApproval
        self.isPublicDemoSafe = isPublicDemoSafe
        self.forbiddenLiveClaims = forbiddenLiveClaims
    }
}

public enum SeisAppLibraryContract {
    public static let visibleTitle = "SEIS App Library"
    public static let hiddenSourcePolicy = "Website and Ubuntu source archives remain hidden inputs; visible system UI presents SEIS App surfaces only."

    public static let surfaces: [SeisAppLibrarySurface] = [
        SeisAppLibrarySurface(
            id: "seis-app-library",
            title: visibleTitle,
            shortCode: "LIB",
            kind: .library,
            systemImageName: "square.grid.2x2",
            summary: "Native contract for the browser-local SEIS App Library that routes Website and Ubuntu app surfaces without exposing raw source folders.",
            status: .noKeyDemo,
            requiresBackend: false,
            requiresHumanApproval: false,
            isPublicDemoSafe: true,
            forbiddenLiveClaims: ["raw source folder UI", "provider call", "host shell"]
        ),
        SeisAppLibrarySurface(
            id: "website-lane",
            title: SeisPublicDemoLaneSource.website.visibleTitle,
            shortCode: SeisPublicDemoLaneSource.website.shortCode,
            kind: .sourceLane,
            laneSource: .website,
            systemImageName: SeisPublicDemoLaneSource.website.systemImageName,
            summary: "SEIS-visible Website / AI Platform lane backed by the supplied web platform archive.",
            deepLink: "apps/web/seis-linux-replica.html?demo=live&source=website",
            status: .noKeyDemo,
            requiresBackend: false,
            requiresHumanApproval: false,
            isPublicDemoSafe: true
        ),
        SeisAppLibrarySurface(
            id: "ubuntu-desktop-lane",
            title: SeisPublicDemoLaneSource.ubuntu.visibleTitle,
            shortCode: SeisPublicDemoLaneSource.ubuntu.shortCode,
            kind: .sourceLane,
            laneSource: .ubuntu,
            systemImageName: SeisPublicDemoLaneSource.ubuntu.systemImageName,
            summary: "SEIS-visible Ubuntu Desktop lane backed by the supplied browser desktop archive.",
            deepLink: "apps/web/seis-linux-replica.html?demo=live&source=ubuntu",
            status: .noKeyDemo,
            requiresBackend: false,
            requiresHumanApproval: false,
            isPublicDemoSafe: true
        ),
        SeisAppLibrarySurface(
            id: "seis-ai-chat",
            title: "SEIS AI Chat",
            shortCode: "AI",
            kind: .aiChat,
            systemImageName: "bubble.left.and.bubble.right",
            summary: "Dedicated conversation lane; live AI requires backend provider isolation and verified routing.",
            status: .metadataOnly,
            requiresBackend: true,
            requiresHumanApproval: true,
            isPublicDemoSafe: true,
            forbiddenLiveClaims: ["frontend provider key", "unverified live AI", "host process call"]
        ),
        SeisAppLibrarySurface(
            id: "seis-code-ai",
            title: "SEIS Code AI",
            shortCode: "IDE",
            kind: .codeAI,
            systemImageName: "curlybraces.square",
            summary: "Dedicated coding lane separate from chat; live code agents require repo policy, backend runtime, checks, and human review.",
            status: .metadataOnly,
            requiresBackend: true,
            requiresHumanApproval: true,
            isPublicDemoSafe: true,
            forbiddenLiveClaims: ["unreviewed patch execution", "frontend filesystem secret access", "direct push"]
        ),
        SeisAppLibrarySurface(
            id: "seis-agi-control",
            title: "SEIS AGI Control",
            shortCode: "AGI",
            kind: .agiControl,
            systemImageName: "sparkles",
            summary: "Evidence-gated AGI readiness surface; the public demo does not claim AGI capability.",
            status: .metadataOnly,
            requiresBackend: true,
            requiresHumanApproval: true,
            isPublicDemoSafe: true,
            forbiddenLiveClaims: ["AGI proof", "autonomous deployment", "unverified model capability"]
        ),
        SeisAppLibrarySurface(
            id: "seis-ssh-control",
            title: "SEIS SSH Control",
            shortCode: "SSH",
            kind: .sshControl,
            systemImageName: "lock.shield",
            summary: "Credential-free SSH readiness surface; live SSH requires private local configuration and explicit human approval.",
            status: .metadataOnly,
            requiresBackend: true,
            requiresHumanApproval: true,
            isPublicDemoSafe: true,
            forbiddenLiveClaims: ["stored private key", "host shell access", "remote destructive cleanup"]
        )
    ]

    public static var sourceLaneSurfaces: [SeisAppLibrarySurface] {
        surfaces.filter { $0.kind == .sourceLane }
    }

    public static var guardedLiveSurfaces: [SeisAppLibrarySurface] {
        surfaces.filter { $0.requiresBackend || $0.requiresHumanApproval }
    }

    public static var moduleCount: Int {
        SeisPublicDemoLaneSource.allCases.map(\.moduleCount).reduce(0, +)
    }

    public static var isPublicDemoSafe: Bool {
        surfaces.allSatisfy { surface in
            surface.isPublicDemoSafe
                && surface.status != .liveVerified
                && !surface.title.lowercased().contains("stitch_")
                && !surface.summary.lowercased().contains("stitch_")
        }
    }

    public static func surface(id: String) -> SeisAppLibrarySurface? {
        surfaces.first { $0.id == id }
    }
}

public struct SeisPublicDemoLaneRoute: Codable, Equatable, Sendable {
    public static let expectedRelativePath = "apps/web/seis-linux-replica.html"
    public static let allowedSources: Set<String> = Set(SeisPublicDemoLaneSource.allCases.map(\.rawValue))
    public static let allowedQueryNames: Set<String> = ["demo", "source"]

    public let relativePath: String
    public let queryItems: [SeisPublicDemoLaneQueryItem]

    public init?(deepLink: String) {
        let trimmedDeepLink = deepLink.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedDeepLink.isEmpty,
              !trimmedDeepLink.hasPrefix("/"),
              !trimmedDeepLink.contains("://") else {
            return nil
        }

        let routeParts = trimmedDeepLink.split(
            separator: "?",
            maxSplits: 1,
            omittingEmptySubsequences: false
        )
        guard let pathPart = routeParts.first else {
            return nil
        }

        let relativePath = String(pathPart)
        guard relativePath == Self.expectedRelativePath else {
            return nil
        }

        self.relativePath = relativePath
        self.queryItems = routeParts.count > 1
            ? Self.parseQueryItems(String(routeParts[1]))
            : []
    }

    public var isAllowedPublicDemoLane: Bool {
        guard queryValue(for: "demo") == "live",
              let source = queryValue(for: "source"),
              Self.allowedSources.contains(source) else {
            return false
        }

        return Set(queryItems.map(\.name)).isSubset(of: Self.allowedQueryNames)
    }

    public func queryValue(for name: String) -> String? {
        queryItems.first { $0.name == name }?.value
    }

    public var source: SeisPublicDemoLaneSource? {
        queryValue(for: "source").flatMap(SeisPublicDemoLaneSource.init(rawValue:))
    }

    public var appLibrarySurface: SeisAppLibrarySurface? {
        guard let source else {
            return nil
        }

        switch source {
        case .website:
            return SeisAppLibraryContract.surface(id: "website-lane")
        case .ubuntu:
            return SeisAppLibraryContract.surface(id: "ubuntu-desktop-lane")
        }
    }

    public func fileURL(repositoryRoot: URL) -> URL? {
        guard isAllowedPublicDemoLane else {
            return nil
        }

        let fileURL = repositoryRoot.appendingPathComponent(relativePath)
        guard !queryItems.isEmpty else {
            return fileURL
        }

        var components = URLComponents(url: fileURL, resolvingAgainstBaseURL: false)
        components?.queryItems = queryItems.map { item in
            URLQueryItem(name: item.name, value: item.value)
        }
        return components?.url ?? fileURL
    }

    public static func fileURL(repositoryRoot: URL, deepLink: String) -> URL? {
        SeisPublicDemoLaneRoute(deepLink: deepLink)?.fileURL(repositoryRoot: repositoryRoot)
    }

    private static func parseQueryItems(_ query: String) -> [SeisPublicDemoLaneQueryItem] {
        guard !query.isEmpty else {
            return []
        }

        var components = URLComponents()
        components.percentEncodedQuery = query
        return (components.queryItems ?? []).map { item in
            SeisPublicDemoLaneQueryItem(name: item.name, value: item.value ?? "")
        }
    }
}
