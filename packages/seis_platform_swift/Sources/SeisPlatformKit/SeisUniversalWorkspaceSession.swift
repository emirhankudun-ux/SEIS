import Foundation

public struct SeisUniversalSelectionHistoryEntry: Equatable, Sendable {
    public let selectedNodeIDs: [String]
    public let focusedNodeID: String?

    public init(selectedNodeIDs: [String], focusedNodeID: String?) {
        self.selectedNodeIDs = selectedNodeIDs
        self.focusedNodeID = focusedNodeID
    }

    public init(selectionGraph: SeisUniversalSelectionGraph) {
        self.init(
            selectedNodeIDs: selectionGraph.selectedNodeIDs,
            focusedNodeID: selectionGraph.focusedNodeID
        )
    }
}

public struct SeisUniversalWorkspaceSession: Equatable, Sendable {
    public private(set) var state: SeisUniversalWorkspaceState
    public let historyLimit: Int

    private var backHistory: [SeisUniversalSelectionHistoryEntry]
    private var forwardHistory: [SeisUniversalSelectionHistoryEntry]

    public init(
        document: SeisUniversalWorkspaceDocument,
        historyLimit: Int = 50
    ) {
        self.init(
            state: SeisUniversalWorkspaceState(document: document),
            historyLimit: historyLimit
        )
    }

    public init(
        state: SeisUniversalWorkspaceState,
        historyLimit: Int = 50
    ) {
        self.state = state
        self.historyLimit = max(1, historyLimit)
        self.backHistory = []
        self.forwardHistory = []
    }

    public var canNavigateBack: Bool { !backHistory.isEmpty }
    public var canNavigateForward: Bool { !forwardHistory.isEmpty }
    public var backHistoryCount: Int { backHistory.count }
    public var forwardHistoryCount: Int { forwardHistory.count }

    @discardableResult
    public mutating func select(
        nodeID: String,
        mode: SeisUniversalSelectionMode = .replace
    ) -> Bool {
        performSelectionChange { state in
            state.selectionGraph.select(nodeID: nodeID, mode: mode)
        }
    }

    @discardableResult
    public mutating func moveFocus(_ direction: SeisUniversalFocusDirection) -> Bool {
        performSelectionChange { state in
            state.moveFocus(direction)
        }
    }

    @discardableResult
    public mutating func moveFocus(
        _ direction: SeisUniversalFocusDirection,
        within visibleNodeIDs: [String]
    ) -> Bool {
        performSelectionChange { state in
            state.moveFocus(direction, within: visibleNodeIDs)
        }
    }

    @discardableResult
    public mutating func clearSelection() -> Bool {
        performSelectionChange { state in
            state.clearSelection()
        }
    }

    @discardableResult
    public mutating func setExpanded(nodeID: String, isExpanded: Bool) -> Bool {
        state.setExpanded(nodeID: nodeID, isExpanded: isExpanded)
    }

    @discardableResult
    public mutating func setFocusedNodeExpanded(_ isExpanded: Bool) -> Bool {
        state.setFocusedNodeExpanded(isExpanded)
    }

    @discardableResult
    public mutating func navigateBack() -> Bool {
        guard let target = backHistory.popLast() else { return false }

        let current = selectionEntry
        forwardHistory = Self.appending(
            current,
            to: forwardHistory,
            limit: historyLimit
        )
        restoreSelection(target)
        return true
    }

    @discardableResult
    public mutating func navigateForward() -> Bool {
        guard let target = forwardHistory.popLast() else { return false }

        let current = selectionEntry
        backHistory = Self.appending(
            current,
            to: backHistory,
            limit: historyLimit
        )
        restoreSelection(target)
        return true
    }

    @discardableResult
    public mutating func applyWorkspaceCommand(
        commandID: String,
        visibleNodeIDs: [String]? = nil
    ) -> Bool {
        switch commandID {
        case "navigation.back":
            return navigateBack()
        case "navigation.forward":
            return navigateForward()
        case "selection.next":
            if let visibleNodeIDs {
                return moveFocus(.next, within: visibleNodeIDs)
            }
            return moveFocus(.next)
        case "selection.previous":
            if let visibleNodeIDs {
                return moveFocus(.previous, within: visibleNodeIDs)
            }
            return moveFocus(.previous)
        case "selection.clear":
            return clearSelection()
        case "hierarchy.expand-focused":
            return setFocusedNodeExpanded(true)
        case "hierarchy.collapse-focused":
            return setFocusedNodeExpanded(false)
        default:
            let selectionPrefix = "select:"
            if commandID.hasPrefix(selectionPrefix) {
                let nodeID = String(commandID.dropFirst(selectionPrefix.count))
                return select(nodeID: nodeID)
            }
            return state.apply(commandID: commandID)
        }
    }

    private var selectionEntry: SeisUniversalSelectionHistoryEntry {
        SeisUniversalSelectionHistoryEntry(selectionGraph: state.selectionGraph)
    }

    @discardableResult
    private mutating func performSelectionChange(
        _ change: (inout SeisUniversalWorkspaceState) -> Bool
    ) -> Bool {
        let previous = selectionEntry
        guard change(&state) else { return false }

        let current = selectionEntry
        guard previous != current else { return false }

        backHistory = Self.appending(
            previous,
            to: backHistory,
            limit: historyLimit
        )
        forwardHistory.removeAll(keepingCapacity: true)
        return true
    }

    private mutating func restoreSelection(_ entry: SeisUniversalSelectionHistoryEntry) {
        state.selectionGraph = SeisUniversalSelectionGraph(
            document: state.document,
            selectedNodeIDs: entry.selectedNodeIDs,
            focusedNodeID: entry.focusedNodeID
        )
    }

    private static func appending(
        _ entry: SeisUniversalSelectionHistoryEntry,
        to stack: [SeisUniversalSelectionHistoryEntry],
        limit: Int
    ) -> [SeisUniversalSelectionHistoryEntry] {
        var result = stack
        result.append(entry)

        if result.count > limit {
            result.removeFirst(result.count - limit)
        }

        return result
    }
}
