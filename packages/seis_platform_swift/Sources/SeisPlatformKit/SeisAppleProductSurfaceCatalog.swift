import Foundation

public enum SeisAppleProductSurfaceID: String, CaseIterable, Codable, Equatable, Identifiable, Sendable {
    case desktopOS = "desktop-os"
    case aiCore = "ai-core"
    case search
    case code
    case design
    case cloud
    case store
    case music
    case launchpad
    case files
    case terminal
    case website
    case agents
    case plugins
    case commandCenter = "command-center"

    public var id: String { rawValue }
}

public enum SeisAppleProductSurfaceState: String, CaseIterable, Codable, Equatable, Sendable {
    case nativeLocalDemo = "native-local-demo"
    case browserLocalDemo = "browser-local-demo"
    case planned
    case approvalRequired = "approval-required"

    public var displayLabel: String {
        switch self {
        case .nativeLocalDemo: "Native Local Demo"
        case .browserLocalDemo: "Browser Local Demo"
        case .planned: "Planned"
        case .approvalRequired: "Approval Needed"
        }
    }

    public var isExecutable: Bool { false }
}

public struct SeisAppleProductSurface: Codable, Equatable, Identifiable, Sendable {
    public let id: SeisAppleProductSurfaceID
    public let title: String
    public let subtitle: String
    public let systemImage: String
    public let state: SeisAppleProductSurfaceState
    public let boundary: String
    public let evidence: String

    public init(
        id: SeisAppleProductSurfaceID,
        title: String,
        subtitle: String,
        systemImage: String,
        state: SeisAppleProductSurfaceState,
        boundary: String,
        evidence: String
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.systemImage = systemImage
        self.state = state
        self.boundary = boundary
        self.evidence = evidence
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("surface title must not be empty") }
        if subtitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("surface subtitle must not be empty") }
        if systemImage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("surface systemImage must not be empty") }
        if boundary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("surface boundary must not be empty") }
        if evidence.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("surface evidence must not be empty") }
        return issues
    }
}

public enum SeisAppleProductSurfaceCatalogError: Error, Equatable, Sendable {
    case duplicateSurfaceIDs([String])
    case invalidSurface(id: String, issues: [String])
}

public struct SeisAppleProductSurfaceCatalog: Codable, Equatable, Sendable {
    public static let expectedSurfaceIDs: [SeisAppleProductSurfaceID] = [
        .desktopOS, .aiCore, .search, .code, .design, .cloud, .store, .music,
        .launchpad, .files, .terminal, .website, .agents, .plugins, .commandCenter
    ]

    public static let defaultCatalog = SeisAppleProductSurfaceCatalog(surfaces: [
        .init(id: .desktopOS, title: "SEIS Desktop OS", subtitle: "Windowed operating surface, shell navigation, diagnostics, and demo routing.", systemImage: "macwindow.on.rectangle", state: .nativeLocalDemo, boundary: "Local shell only; no remote execution.", evidence: "SEIS Apple Native Shell and Demo Studio are connected."),
        .init(id: .aiCore, title: "SEIS AI Core", subtitle: "Provider-neutral planning, model routing, lanes, agents, and redacted evidence.", systemImage: "brain.head.profile", state: .nativeLocalDemo, boundary: "Plan-only; Local Demo provider; no credentials.", evidence: "Typed runtime snapshot and SwiftUI Local Demo panel."),
        .init(id: .search, title: "SEIS Search", subtitle: "AI, web, code, design, cloud, apps, plugins, and files discovery.", systemImage: "magnifyingglass", state: .browserLocalDemo, boundary: "Local catalog; live web search is not claimed.", evidence: "Browser Desktop Search routes and source-backed catalogs."),
        .init(id: .code, title: "SEIS Code", subtitle: "Repository-aware IDE, files, preview, terminal, and safe AI assistance.", systemImage: "curlybraces.square", state: .browserLocalDemo, boundary: "Browser local demo; writes and provider calls are gated.", evidence: "Desktop Code workspace and shared local VFS contract."),
        .init(id: .design, title: "SEIS Design", subtitle: "Canvas, tokens, components, prototype preview, and design assistant boundary.", systemImage: "paintpalette", state: .browserLocalDemo, boundary: "Browser local demo; export and remote storage are not live.", evidence: "Desktop Design workspace and design-system contracts."),
        .init(id: .cloud, title: "SEIS Cloud", subtitle: "Sync, repositories, deployments, SSH status, logs, backups, and health.", systemImage: "cloud", state: .browserLocalDemo, boundary: "Status and plan only; no live SSH or deployment.", evidence: "Cloud Center and SEIS-SSH safe boundary contracts."),
        .init(id: .store, title: "SEIS Store", subtitle: "Apps, plugins, agents, themes, and developer tools catalog.", systemImage: "bag", state: .browserLocalDemo, boundary: "Catalog only; installation is not silently performed.", evidence: "Plugin and capability marketplace surfaces."),
        .init(id: .music, title: "SEIS Music", subtitle: "Player, playlists, visualizer, and safe recommendation state.", systemImage: "music.note.list", state: .browserLocalDemo, boundary: "Local demo media only; no external streaming claim.", evidence: "Desktop Music workspace interaction surface."),
        .init(id: .launchpad, title: "SEIS Launchpad", subtitle: "Unified app grid for the connected SEIS ecosystem.", systemImage: "square.grid.3x3", state: .browserLocalDemo, boundary: "Allow-listed local routes only.", evidence: "Desktop app launcher and deep-link route contracts."),
        .init(id: .files, title: "SEIS Files", subtitle: "Local folders, files, recent items, search, and preview.", systemImage: "folder", state: .browserLocalDemo, boundary: "Browser local VFS; real filesystem mutation is not claimed.", evidence: "Shared VFS and Files workspace tests."),
        .init(id: .terminal, title: "SEIS Terminal / SSH Center", subtitle: "Local demo commands, history, safe logs, and remote status concepts.", systemImage: "terminal", state: .browserLocalDemo, boundary: "No real SSH or destructive command execution.", evidence: "Terminal and SEIS-SSH read-only readiness contracts."),
        .init(id: .website, title: "SEIS Website", subtitle: "Product pages for AI, OS, Code, Design, Search, Cloud, Store, and Agents.", systemImage: "globe", state: .browserLocalDemo, boundary: "Static public demo; publication remains gated.", evidence: "Website route inventory and static demo checks."),
        .init(id: .agents, title: "SEIS Agents", subtitle: "Architect, Code, Design, UI/UX, Research, Security, DevOps, QA, and more.", systemImage: "person.3", state: .nativeLocalDemo, boundary: "Status-and-plan-only; mutation requires human approval.", evidence: "13-agent typed registry and native plan controls."),
        .init(id: .plugins, title: "SEIS Plugins", subtitle: "Specialist lanes, skills, MCP metadata, and capability governance.", systemImage: "puzzlepiece.extension", state: .nativeLocalDemo, boundary: "Metadata and plan only; no blanket activation.", evidence: "Plugin integration and specialist lane validators."),
        .init(id: .commandCenter, title: "SEIS Command Center", subtitle: "Goals, operations, architecture, security, automation, and repository control.", systemImage: "rectangle.3.group", state: .nativeLocalDemo, boundary: "Local control plane; external mutations require approval.", evidence: "Native Demo Studio and Command Center checks.")
    ])

    public let surfaces: [SeisAppleProductSurface]

    public init(surfaces: [SeisAppleProductSurface]) {
        self.surfaces = surfaces
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let duplicateIDs = surfaces.reduce(into: [String: Int]()) { counts, surface in
            counts[surface.id.rawValue, default: 0] += 1
        }.filter { $0.value > 1 }.map(\.key).sorted()
        if !duplicateIDs.isEmpty { issues.append("duplicate surface IDs: \(duplicateIDs.joined(separator: ", "))") }
        for surface in surfaces where !surface.validationIssues.isEmpty {
            issues.append(contentsOf: surface.validationIssues.map { "\(surface.id.rawValue): \($0)" })
        }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }

    public func filtered(by query: String) -> [SeisAppleProductSurface] {
        let normalizedQuery = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !normalizedQuery.isEmpty else { return surfaces }
        return surfaces.filter {
            "\($0.id.rawValue) \($0.title) \($0.subtitle) \($0.state.displayLabel)".lowercased().contains(normalizedQuery)
        }
    }
}
