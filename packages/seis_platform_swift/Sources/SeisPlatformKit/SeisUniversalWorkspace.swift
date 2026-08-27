import Foundation

public enum SeisAppleNativeShellRoute: String, CaseIterable, Codable, Sendable {
    case demo
    case platform
    case technologyCenter = "technology-center"
    case universalWorkspace = "universal-workspace"

    public static let defaultRoute: Self = .demo

    public var title: String {
        switch self {
        case .demo: return "Demo"
        case .platform: return "Platform"
        case .technologyCenter: return "Technology Center"
        case .universalWorkspace: return "Universal Workspace"
        }
    }

    public var symbolName: String {
        switch self {
        case .demo: return "sparkles"
        case .platform: return "square.stack.3d.up"
        case .technologyCenter: return "cpu"
        case .universalWorkspace: return "rectangle.split.3x1"
        }
    }
}

public enum SeisUniversalSelectionKind: String, Codable, Sendable {
    case domain
    case capability
    case tool
    case workbench
    case engine
    case system
}

public struct SeisUniversalSelection: Equatable, Sendable {
    public let kind: SeisUniversalSelectionKind
    public let id: String
    public let title: String
    public let subtitle: String
    public let metadata: [String: String]

    public init(
        kind: SeisUniversalSelectionKind,
        id: String,
        title: String,
        subtitle: String,
        metadata: [String: String] = [:]
    ) {
        self.kind = kind
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.metadata = metadata
    }
}

public struct SeisUniversalWorkspaceNode: Equatable, Sendable, Identifiable {
    public let id: String
    public let selection: SeisUniversalSelection
    public let parentID: String?
    public let childIDs: [String]

    public init(
        id: String,
        selection: SeisUniversalSelection,
        parentID: String?,
        childIDs: [String]
    ) {
        self.id = id
        self.selection = selection
        self.parentID = parentID
        self.childIDs = childIDs
    }
}

public struct SeisUniversalWorkspaceDocument: Equatable, Sendable {
    public let rootNodeIDs: [String]
    public let nodes: [SeisUniversalWorkspaceNode]
    private let nodesByID: [String: SeisUniversalWorkspaceNode]

    public init(catalog: SeisFullTechnologyCatalog) {
        var rootNodeIDs: [String] = []
        var nodes: [SeisUniversalWorkspaceNode] = []
        var nodesByID: [String: SeisUniversalWorkspaceNode] = [:]

        for domain in catalog.registry.domains {
            let domainNodeID = "domain:\(domain.id)"
            let capabilityNodeIDs = domain.capabilities.map { capability in
                "capability:\(domain.id):\(capability)"
            }

            let domainNode = SeisUniversalWorkspaceNode(
                id: domainNodeID,
                selection: SeisUniversalSelection(
                    kind: .domain,
                    id: domain.id,
                    title: domain.name,
                    subtitle: "Technology domain",
                    metadata: [
                        "capabilityCount": String(domain.capabilities.count),
                        "network": catalog.registry.safetyBoundary.defaultNetwork,
                        "write": catalog.registry.safetyBoundary.defaultWrite,
                        "externalWrite": "false"
                    ]
                ),
                parentID: nil,
                childIDs: capabilityNodeIDs
            )

            rootNodeIDs.append(domainNodeID)
            nodes.append(domainNode)
            nodesByID[domainNodeID] = domainNode

            for capability in domain.capabilities {
                let capabilityNodeID = "capability:\(domain.id):\(capability)"
                let capabilityNode = SeisUniversalWorkspaceNode(
                    id: capabilityNodeID,
                    selection: SeisUniversalSelection(
                        kind: .capability,
                        id: capability,
                        title: capability,
                        subtitle: domain.name,
                        metadata: [
                            "domain": domain.id,
                            "network": catalog.registry.safetyBoundary.defaultNetwork,
                            "write": catalog.registry.safetyBoundary.defaultWrite,
                            "externalWrite": "false"
                        ]
                    ),
                    parentID: domainNodeID,
                    childIDs: []
                )
                nodes.append(capabilityNode)
                nodesByID[capabilityNodeID] = capabilityNode
            }
        }

        self.rootNodeIDs = rootNodeIDs
        self.nodes = nodes
        self.nodesByID = nodesByID
    }

    public func node(id: String) -> SeisUniversalWorkspaceNode? {
        nodesByID[id]
    }

    public func breadcrumbNodeIDs(for nodeID: String) -> [String] {
        guard nodesByID[nodeID] != nil else { return [] }

        var result: [String] = []
        var currentID: String? = nodeID
        var visited: Set<String> = []

        while let id = currentID, let node = nodesByID[id], visited.insert(id).inserted {
            result.append(id)
            currentID = node.parentID
        }

        return result.reversed()
    }
}

public enum SeisUniversalSelectionMode: String, Codable, Sendable {
    case replace
    case additive
}

public struct SeisUniversalSelectionGraph: Equatable, Sendable {
    public let document: SeisUniversalWorkspaceDocument
    public private(set) var selectedNodeIDs: [String]
    public private(set) var focusedNodeID: String?

    public init(document: SeisUniversalWorkspaceDocument, selectedNodeID: String? = nil) {
        self.document = document
        if let selectedNodeID, document.node(id: selectedNodeID) != nil {
            self.selectedNodeIDs = [selectedNodeID]
            self.focusedNodeID = selectedNodeID
        } else {
            self.selectedNodeIDs = []
            self.focusedNodeID = nil
        }
    }

    public init(
        document: SeisUniversalWorkspaceDocument,
        selectedNodeIDs: [String],
        focusedNodeID: String?
    ) {
        self.document = document

        var seen: Set<String> = []
        let validIDs = selectedNodeIDs.filter { id in
            document.node(id: id) != nil && seen.insert(id).inserted
        }
        self.selectedNodeIDs = validIDs

        if let focusedNodeID, validIDs.contains(focusedNodeID) {
            self.focusedNodeID = focusedNodeID
        } else {
            self.focusedNodeID = validIDs.last
        }
    }

    public var selectedNodeID: String? {
        focusedNodeID
    }

    public var selectedSelection: SeisUniversalSelection? {
        guard let focusedNodeID else { return nil }
        return document.node(id: focusedNodeID)?.selection
    }

    public var selectedSelections: [SeisUniversalSelection] {
        selectedNodeIDs.compactMap { document.node(id: $0)?.selection }
    }

    @discardableResult
    public mutating func select(nodeID: String) -> Bool {
        select(nodeID: nodeID, mode: .replace)
    }

    @discardableResult
    public mutating func select(nodeID: String, mode: SeisUniversalSelectionMode) -> Bool {
        guard document.node(id: nodeID) != nil else { return false }

        switch mode {
        case .replace:
            selectedNodeIDs = [nodeID]
        case .additive:
            if !selectedNodeIDs.contains(nodeID) {
                selectedNodeIDs.append(nodeID)
            }
        }

        focusedNodeID = nodeID
        return true
    }

    public mutating func clearSelection() {
        selectedNodeIDs = []
        focusedNodeID = nil
    }
}

public enum SeisUniversalInspectorDock: String, CaseIterable, Codable, Equatable, Sendable {
    case trailing
    case leading
    case hidden
}

public struct SeisUniversalWorkspaceSceneSnapshot: Codable, Equatable, Sendable {
    public let selectedNodeIDs: [String]
    public let focusedNodeID: String?
    public let expandedNodeIDs: [String]
    public let inspectorDock: SeisUniversalInspectorDock
    public let isHierarchyVisible: Bool

    public init(
        selectedNodeIDs: [String],
        focusedNodeID: String?,
        expandedNodeIDs: [String],
        inspectorDock: SeisUniversalInspectorDock,
        isHierarchyVisible: Bool
    ) {
        self.selectedNodeIDs = selectedNodeIDs
        self.focusedNodeID = focusedNodeID
        self.expandedNodeIDs = expandedNodeIDs
        self.inspectorDock = inspectorDock
        self.isHierarchyVisible = isHierarchyVisible
    }
}

public struct SeisUniversalCommand: Equatable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public let subtitle: String
    public let searchTerms: [String]

    public init(id: String, title: String, subtitle: String, searchTerms: [String] = []) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.searchTerms = searchTerms
    }

    fileprivate var searchCorpus: String {
        ([id, title, subtitle] + searchTerms)
            .joined(separator: " ")
            .lowercased()
    }
}

public struct SeisUniversalCommandPalette: Equatable, Sendable {
    public let document: SeisUniversalWorkspaceDocument
    public let allCommands: [SeisUniversalCommand]

    public init(document: SeisUniversalWorkspaceDocument) {
        self.document = document

        let inspectorCommands = [
            SeisUniversalCommand(
                id: "inspector.trailing",
                title: "Dock Inspector Right",
                subtitle: "Place the read-only inspector on the trailing side.",
                searchTerms: ["right", "trailing", "dock inspector"]
            ),
            SeisUniversalCommand(
                id: "inspector.leading",
                title: "Dock Inspector Left",
                subtitle: "Place the read-only inspector on the leading side.",
                searchTerms: ["left", "leading", "dock inspector"]
            ),
            SeisUniversalCommand(
                id: "inspector.hidden",
                title: "Hide Inspector",
                subtitle: "Hide the inspector without clearing selection.",
                searchTerms: ["close", "hide", "dock inspector"]
            )
        ]

        let hierarchyCommands = [
            SeisUniversalCommand(
                id: "hierarchy.show",
                title: "Show Hierarchy",
                subtitle: "Show the local document hierarchy.",
                searchTerms: ["show hierarchy", "sidebar", "navigator"]
            ),
            SeisUniversalCommand(
                id: "hierarchy.hide",
                title: "Hide Hierarchy",
                subtitle: "Hide the hierarchy without clearing selection.",
                searchTerms: ["hide hierarchy", "sidebar", "navigator"]
            )
        ]

        let selectionCommands = document.nodes.map { node in
            SeisUniversalCommand(
                id: "select:\(node.id)",
                title: "Select \(node.selection.title)",
                subtitle: node.selection.subtitle,
                searchTerms: [node.selection.id, node.selection.kind.rawValue, node.id]
            )
        }

        self.allCommands = inspectorCommands + hierarchyCommands + selectionCommands
    }

    public func commands(matching query: String) -> [SeisUniversalCommand] {
        let tokens = query
            .lowercased()
            .split(whereSeparator: \.isWhitespace)
            .map(String.init)

        guard !tokens.isEmpty else { return allCommands }

        return allCommands.filter { command in
            tokens.allSatisfy { token in command.searchCorpus.contains(token) }
        }
    }
}

public struct SeisUniversalWorkspaceState: Equatable, Sendable {
    public var selectionGraph: SeisUniversalSelectionGraph
    public private(set) var inspectorDock: SeisUniversalInspectorDock
    public private(set) var isHierarchyVisible: Bool
    public private(set) var expandedNodeIDs: [String]

    public init(
        document: SeisUniversalWorkspaceDocument,
        inspectorDock: SeisUniversalInspectorDock = .trailing,
        isHierarchyVisible: Bool = true,
        expandedNodeIDs: [String] = []
    ) {
        self.selectionGraph = SeisUniversalSelectionGraph(document: document)
        self.inspectorDock = inspectorDock
        self.isHierarchyVisible = isHierarchyVisible
        self.expandedNodeIDs = Self.sanitizedNodeIDs(expandedNodeIDs, document: document)
    }

    public init(
        document: SeisUniversalWorkspaceDocument,
        restoring snapshot: SeisUniversalWorkspaceSceneSnapshot
    ) {
        self.selectionGraph = SeisUniversalSelectionGraph(
            document: document,
            selectedNodeIDs: snapshot.selectedNodeIDs,
            focusedNodeID: snapshot.focusedNodeID
        )
        self.inspectorDock = snapshot.inspectorDock
        self.isHierarchyVisible = snapshot.isHierarchyVisible
        self.expandedNodeIDs = Self.sanitizedNodeIDs(snapshot.expandedNodeIDs, document: document)
    }

    public var document: SeisUniversalWorkspaceDocument {
        selectionGraph.document
    }

    public var allowsExternalMutation: Bool { false }

    public var snapshot: SeisUniversalWorkspaceSceneSnapshot {
        SeisUniversalWorkspaceSceneSnapshot(
            selectedNodeIDs: selectionGraph.selectedNodeIDs,
            focusedNodeID: selectionGraph.focusedNodeID,
            expandedNodeIDs: expandedNodeIDs,
            inspectorDock: inspectorDock,
            isHierarchyVisible: isHierarchyVisible
        )
    }

    @discardableResult
    public mutating func setExpanded(nodeID: String, isExpanded: Bool) -> Bool {
        guard document.node(id: nodeID) != nil else { return false }

        if isExpanded {
            if !expandedNodeIDs.contains(nodeID) {
                expandedNodeIDs.append(nodeID)
            }
        } else {
            expandedNodeIDs.removeAll { $0 == nodeID }
        }
        return true
    }

    @discardableResult
    public mutating func apply(commandID: String) -> Bool {
        switch commandID {
        case "inspector.trailing":
            inspectorDock = .trailing
            return true
        case "inspector.leading":
            inspectorDock = .leading
            return true
        case "inspector.hidden":
            inspectorDock = .hidden
            return true
        case "hierarchy.show":
            isHierarchyVisible = true
            return true
        case "hierarchy.hide":
            isHierarchyVisible = false
            return true
        default:
            let prefix = "select:"
            guard commandID.hasPrefix(prefix) else { return false }
            let nodeID = String(commandID.dropFirst(prefix.count))
            return selectionGraph.select(nodeID: nodeID)
        }
    }

    private static func sanitizedNodeIDs(
        _ nodeIDs: [String],
        document: SeisUniversalWorkspaceDocument
    ) -> [String] {
        var seen: Set<String> = []
        return nodeIDs.filter { id in
            document.node(id: id) != nil && seen.insert(id).inserted
        }
    }
}

public struct SeisUniversalInspectorRow: Equatable, Sendable, Identifiable {
    public let label: String
    public let value: String

    public var id: String { label }

    public init(label: String, value: String) {
        self.label = label
        self.value = value
    }
}

public struct SeisUniversalInspectorSection: Equatable, Sendable, Identifiable {
    public let title: String
    public let rows: [SeisUniversalInspectorRow]

    public var id: String { title }

    public init(title: String, rows: [SeisUniversalInspectorRow]) {
        self.title = title
        self.rows = rows
    }
}

public struct SeisUniversalInspectorPresentation: Equatable, Sendable {
    public let title: String
    public let subtitle: String
    public let sections: [SeisUniversalInspectorSection]
    public let allowsMutation: Bool

    public init(selection: SeisUniversalSelection?) {
        guard let selection else {
            self.title = "Nothing selected"
            self.subtitle = "Select an item in the Universal Viewport to inspect it."
            self.sections = []
            self.allowsMutation = false
            return
        }

        self.init(singleSelection: selection)
    }

    public init(selections: [SeisUniversalSelection]) {
        switch selections.count {
        case 0:
            self.init(selection: nil)
        case 1:
            self.init(singleSelection: selections[0])
        default:
            let kinds = Array(Set(selections.map { $0.kind.rawValue })).sorted().joined(separator: ", ")
            self.title = "\(selections.count) items selected"
            self.subtitle = "Universal Workspace selection"
            self.sections = [
                SeisUniversalInspectorSection(
                    title: "Identity",
                    rows: [
                        SeisUniversalInspectorRow(label: "Selection Count", value: String(selections.count)),
                        SeisUniversalInspectorRow(label: "Kinds", value: kinds)
                    ]
                ),
                SeisUniversalInspectorSection(
                    title: "Safety",
                    rows: [
                        SeisUniversalInspectorRow(label: "Mutation", value: "disabled")
                    ]
                )
            ]
            self.allowsMutation = false
        }
    }

    private init(singleSelection selection: SeisUniversalSelection) {
        self.title = selection.title
        self.subtitle = selection.subtitle
        self.allowsMutation = false

        let identityRows = [
            SeisUniversalInspectorRow(label: "Kind", value: selection.kind.rawValue),
            SeisUniversalInspectorRow(label: "Identifier", value: selection.id)
        ]

        var metadataRows: [SeisUniversalInspectorRow] = []
        var safetyRows: [SeisUniversalInspectorRow] = []

        for key in selection.metadata.keys.sorted() {
            let value = selection.metadata[key] ?? ""
            let row = SeisUniversalInspectorRow(
                label: Self.displayLabel(for: key),
                value: Self.safeValue(value, for: key)
            )

            if Self.isSafetyKey(key) {
                safetyRows.append(row)
            } else {
                metadataRows.append(row)
            }
        }

        self.sections = [
            SeisUniversalInspectorSection(title: "Identity", rows: identityRows),
            SeisUniversalInspectorSection(title: "Metadata", rows: metadataRows),
            SeisUniversalInspectorSection(title: "Safety", rows: safetyRows)
        ]
    }

    private static func isSafetyKey(_ key: String) -> Bool {
        let normalized = key.lowercased()
        return normalized == "network"
            || normalized == "write"
            || normalized == "externalwrite"
            || normalized == "filesystem"
            || normalized == "secrets"
            || normalized.contains("permission")
    }

    private static func safeValue(_ value: String, for key: String) -> String {
        let normalizedKey = key.lowercased()
        let sensitiveKeyFragments = ["token", "secret", "password", "credential", "repositorypath", "filepath"]
        if sensitiveKeyFragments.contains(where: normalizedKey.contains) {
            return "[redacted]"
        }

        if value.contains("/Users/") || value.contains("\\Users\\") {
            return "[redacted]"
        }

        return value
    }

    private static func displayLabel(for key: String) -> String {
        var result = ""
        for character in key {
            if character.isUppercase, !result.isEmpty {
                result.append(" ")
            }
            result.append(character)
        }
        return result
            .replacingOccurrences(of: "_", with: " ")
            .replacingOccurrences(of: "-", with: " ")
            .split(separator: " ")
            .map { $0.prefix(1).uppercased() + $0.dropFirst() }
            .joined(separator: " ")
    }
}