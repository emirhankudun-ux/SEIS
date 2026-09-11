import Foundation

public struct SeisUniversalWorkspaceTab: Equatable, Sendable, Identifiable {
    public let id: String
    public private(set) var session: SeisUniversalWorkspaceSession
    public private(set) var searchQuery: String

    public init(
        id: String = UUID().uuidString,
        document: SeisUniversalWorkspaceDocument,
        searchQuery: String = ""
    ) {
        self.id = id
        self.session = SeisUniversalWorkspaceSession(document: document)
        self.searchQuery = searchQuery
    }

    public init(
        id: String = UUID().uuidString,
        session: SeisUniversalWorkspaceSession,
        searchQuery: String = ""
    ) {
        self.id = id
        self.session = session
        self.searchQuery = searchQuery
    }

    public var title: String {
        session.state.selectionGraph.selectedSelection?.title ?? "Workspace"
    }

    @discardableResult
    public mutating func updateSession(
        _ update: (inout SeisUniversalWorkspaceSession) -> Bool
    ) -> Bool {
        update(&session)
    }

    public mutating func updateSearchQuery(_ query: String) {
        searchQuery = query
    }
}

public struct SeisUniversalWorkspaceTabs: Equatable, Sendable {
    public private(set) var tabs: [SeisUniversalWorkspaceTab]
    public private(set) var activeTabID: String?

    public init(document: SeisUniversalWorkspaceDocument) {
        let tab = SeisUniversalWorkspaceTab(document: document)
        self.tabs = [tab]
        self.activeTabID = tab.id
    }

    public init(tabs: [SeisUniversalWorkspaceTab], activeTabID: String?) {
        if tabs.isEmpty {
            self.tabs = []
            self.activeTabID = nil
            return
        }

        self.tabs = tabs
        if let activeTabID, tabs.contains(where: { $0.id == activeTabID }) {
            self.activeTabID = activeTabID
        } else {
            self.activeTabID = tabs.first?.id
        }
    }

    public var activeTab: SeisUniversalWorkspaceTab? {
        guard let activeTabID else { return nil }
        return tabs.first(where: { $0.id == activeTabID })
    }

    @discardableResult
    public mutating func openTab(document: SeisUniversalWorkspaceDocument) -> String {
        let tab = SeisUniversalWorkspaceTab(document: document)
        tabs.append(tab)
        activeTabID = tab.id
        return tab.id
    }

    @discardableResult
    public mutating func activateTab(id: String) -> Bool {
        guard tabs.contains(where: { $0.id == id }) else { return false }
        activeTabID = id
        return true
    }

    @discardableResult
    public mutating func closeTab(id: String) -> Bool {
        guard tabs.count > 1,
              let index = tabs.firstIndex(where: { $0.id == id })
        else {
            return false
        }

        let wasActive = activeTabID == id
        tabs.remove(at: index)

        if wasActive {
            let replacementIndex = min(index, tabs.count - 1)
            activeTabID = tabs[replacementIndex].id
        }

        return true
    }

    @discardableResult
    public mutating func activateNextTab() -> Bool {
        cycleTab(offset: 1)
    }

    @discardableResult
    public mutating func activatePreviousTab() -> Bool {
        cycleTab(offset: -1)
    }

    @discardableResult
    public mutating func updateActiveSession(
        _ update: (inout SeisUniversalWorkspaceSession) -> Bool
    ) -> Bool {
        guard let activeIndex else { return false }
        return tabs[activeIndex].updateSession(update)
    }

    public mutating func updateActiveSearchQuery(_ query: String) {
        guard let activeIndex else { return }
        tabs[activeIndex].updateSearchQuery(query)
    }

    private var activeIndex: Int? {
        guard let activeTabID else { return nil }
        return tabs.firstIndex(where: { $0.id == activeTabID })
    }

    @discardableResult
    private mutating func cycleTab(offset: Int) -> Bool {
        guard tabs.count > 1,
              let activeIndex
        else {
            return false
        }

        let count = tabs.count
        let nextIndex = (activeIndex + offset + count) % count
        activeTabID = tabs[nextIndex].id
        return true
    }
}
