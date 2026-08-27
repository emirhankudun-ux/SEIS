import Foundation

public struct SeisUniversalWorkspaceSelectionShelfSnapshot: Codable, Equatable, Sendable {
    public let recentNodeIDs: [String]
    public let pinnedNodeIDs: [String]

    public init(recentNodeIDs: [String], pinnedNodeIDs: [String]) {
        self.recentNodeIDs = recentNodeIDs
        self.pinnedNodeIDs = pinnedNodeIDs
    }
}

public struct SeisUniversalWorkspacePersistenceSnapshot: Codable, Equatable, Sendable {
    public let tabs: SeisUniversalWorkspaceTabsSnapshot
    public let shelf: SeisUniversalWorkspaceSelectionShelfSnapshot

    public init(
        tabs: SeisUniversalWorkspaceTabsSnapshot,
        shelf: SeisUniversalWorkspaceSelectionShelfSnapshot
    ) {
        self.tabs = tabs
        self.shelf = shelf
    }
}

public struct SeisUniversalWorkspacePersistenceState: Equatable, Sendable {
    public var tabs: SeisUniversalWorkspaceTabs
    public var shelf: SeisUniversalWorkspaceSelectionShelf

    public init(
        tabs: SeisUniversalWorkspaceTabs,
        shelf: SeisUniversalWorkspaceSelectionShelf
    ) {
        self.tabs = tabs
        self.shelf = shelf
    }

    public init(
        document: SeisUniversalWorkspaceDocument,
        restoring snapshot: SeisUniversalWorkspacePersistenceSnapshot
    ) {
        self.tabs = SeisUniversalWorkspaceTabs(
            document: document,
            restoring: snapshot.tabs
        )
        self.shelf = SeisUniversalWorkspaceSelectionShelf(
            document: document,
            recentNodeIDs: snapshot.shelf.recentNodeIDs,
            pinnedNodeIDs: snapshot.shelf.pinnedNodeIDs
        )
    }

    public var snapshot: SeisUniversalWorkspacePersistenceSnapshot {
        SeisUniversalWorkspacePersistenceSnapshot(
            tabs: tabs.persistenceSnapshot,
            shelf: shelf.persistenceSnapshot
        )
    }
}

public extension SeisUniversalWorkspaceSelectionShelf {
    var persistenceSnapshot: SeisUniversalWorkspaceSelectionShelfSnapshot {
        SeisUniversalWorkspaceSelectionShelfSnapshot(
            recentNodeIDs: recentNodeIDs,
            pinnedNodeIDs: pinnedNodeIDs
        )
    }
}
