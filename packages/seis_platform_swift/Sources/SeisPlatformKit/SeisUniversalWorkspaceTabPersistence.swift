import Foundation

public struct SeisUniversalWorkspaceTabSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let scene: SeisUniversalWorkspaceSceneSnapshot
    public let searchQuery: String

    public init(
        id: String,
        scene: SeisUniversalWorkspaceSceneSnapshot,
        searchQuery: String
    ) {
        self.id = id
        self.scene = scene
        self.searchQuery = searchQuery
    }
}

public struct SeisUniversalWorkspaceTabsSnapshot: Codable, Equatable, Sendable {
    public let tabs: [SeisUniversalWorkspaceTabSnapshot]
    public let activeTabID: String?

    public init(tabs: [SeisUniversalWorkspaceTabSnapshot], activeTabID: String?) {
        self.tabs = tabs
        self.activeTabID = activeTabID
    }
}

public extension SeisUniversalWorkspaceTabs {
    var persistenceSnapshot: SeisUniversalWorkspaceTabsSnapshot {
        SeisUniversalWorkspaceTabsSnapshot(
            tabs: tabs.map { tab in
                SeisUniversalWorkspaceTabSnapshot(
                    id: tab.id,
                    scene: tab.session.state.snapshot,
                    searchQuery: tab.searchQuery
                )
            },
            activeTabID: activeTabID
        )
    }

    init(
        document: SeisUniversalWorkspaceDocument,
        restoring snapshot: SeisUniversalWorkspaceTabsSnapshot
    ) {
        var seenTabIDs: Set<String> = []
        let restoredTabs = snapshot.tabs.compactMap { tabSnapshot -> SeisUniversalWorkspaceTab? in
            guard !tabSnapshot.id.isEmpty,
                  seenTabIDs.insert(tabSnapshot.id).inserted
            else {
                return nil
            }

            let state = SeisUniversalWorkspaceState(
                document: document,
                restoring: tabSnapshot.scene
            )
            return SeisUniversalWorkspaceTab(
                id: tabSnapshot.id,
                session: SeisUniversalWorkspaceSession(state: state),
                searchQuery: tabSnapshot.searchQuery
            )
        }

        if restoredTabs.isEmpty {
            self.init(document: document)
            return
        }

        self.init(
            tabs: restoredTabs,
            activeTabID: snapshot.activeTabID
        )
    }
}
