import Foundation

public enum SeisUniversalFocusDirection: String, Codable, Sendable {
    case previous
    case next
}

public extension SeisUniversalWorkspaceDocument {
    func visibleNodeIDs(expandedNodeIDs: [String]) -> [String] {
        let expanded = Set(expandedNodeIDs)
        var result: [String] = []

        for rootID in rootNodeIDs {
            guard let rootNode = node(id: rootID) else { continue }
            result.append(rootID)

            if expanded.contains(rootID) {
                result.append(contentsOf: rootNode.childIDs.filter { node(id: $0) != nil })
            }
        }

        return result
    }
}

public extension SeisUniversalCommandPalette {
    var workspaceHistoryCommands: [SeisUniversalCommand] {
        [
            SeisUniversalCommand(
                id: "navigation.back",
                title: "Go Back",
                subtitle: "Restore the previous Universal Workspace selection.",
                searchTerms: ["go back", "back history", "previous selection history"]
            ),
            SeisUniversalCommand(
                id: "navigation.forward",
                title: "Go Forward",
                subtitle: "Restore the next Universal Workspace selection.",
                searchTerms: ["go forward", "forward history", "next selection history"]
            )
        ]
    }

    var workspaceNavigationCommands: [SeisUniversalCommand] {
        [
            SeisUniversalCommand(
                id: "selection.next",
                title: "Next Selection",
                subtitle: "Move focus to the next visible workspace item.",
                searchTerms: ["next selection", "next item", "move focus", "keyboard navigation"]
            ),
            SeisUniversalCommand(
                id: "selection.previous",
                title: "Previous Selection",
                subtitle: "Move focus to the previous visible workspace item.",
                searchTerms: ["previous selection", "previous item", "move focus", "keyboard navigation"]
            ),
            SeisUniversalCommand(
                id: "selection.clear",
                title: "Clear Selection",
                subtitle: "Clear the current workspace selection.",
                searchTerms: ["clear selection", "deselect", "escape"]
            ),
            SeisUniversalCommand(
                id: "hierarchy.expand-focused",
                title: "Expand Focused Item",
                subtitle: "Expand the focused hierarchy item when it has children.",
                searchTerms: ["expand focused", "expand hierarchy", "open children"]
            ),
            SeisUniversalCommand(
                id: "hierarchy.collapse-focused",
                title: "Collapse Focused Item",
                subtitle: "Collapse the focused hierarchy item when it has children.",
                searchTerms: ["collapse focused", "collapse hierarchy", "close children"]
            )
        ]
    }

    func workspaceCommands(matching query: String) -> [SeisUniversalCommand] {
        let commands = workspaceHistoryCommands + workspaceNavigationCommands + allCommands
        let tokens = query
            .lowercased()
            .split(whereSeparator: \.isWhitespace)
            .map(String.init)

        guard !tokens.isEmpty else { return commands }

        return commands.filter { command in
            let corpus = ([command.id, command.title, command.subtitle] + command.searchTerms)
                .joined(separator: " ")
                .lowercased()
            return tokens.allSatisfy { token in corpus.contains(token) }
        }
    }
}

public extension SeisUniversalWorkspaceState {
    @discardableResult
    mutating func moveFocus(_ direction: SeisUniversalFocusDirection) -> Bool {
        let visibleNodeIDs = document.visibleNodeIDs(expandedNodeIDs: expandedNodeIDs)
        guard !visibleNodeIDs.isEmpty else { return false }

        guard let focusedNodeID = selectionGraph.focusedNodeID,
              let focusedIndex = visibleNodeIDs.firstIndex(of: focusedNodeID)
        else {
            let initialNodeID = direction == .next ? visibleNodeIDs[0] : visibleNodeIDs[visibleNodeIDs.count - 1]
            return selectionGraph.select(nodeID: initialNodeID, mode: .replace)
        }

        let targetIndex: Int
        switch direction {
        case .previous:
            guard focusedIndex > 0 else { return false }
            targetIndex = focusedIndex - 1
        case .next:
            guard focusedIndex + 1 < visibleNodeIDs.count else { return false }
            targetIndex = focusedIndex + 1
        }

        return selectionGraph.select(nodeID: visibleNodeIDs[targetIndex], mode: .replace)
    }

    @discardableResult
    mutating func clearSelection() -> Bool {
        guard !selectionGraph.selectedNodeIDs.isEmpty else { return false }
        selectionGraph.clearSelection()
        return true
    }

    @discardableResult
    mutating func setFocusedNodeExpanded(_ isExpanded: Bool) -> Bool {
        guard let focusedNodeID = selectionGraph.focusedNodeID,
              let focusedNode = document.node(id: focusedNodeID),
              !focusedNode.childIDs.isEmpty
        else {
            return false
        }

        return setExpanded(nodeID: focusedNodeID, isExpanded: isExpanded)
    }

    @discardableResult
    mutating func applyWorkspaceCommand(commandID: String) -> Bool {
        switch commandID {
        case "selection.next":
            return moveFocus(.next)
        case "selection.previous":
            return moveFocus(.previous)
        case "selection.clear":
            return clearSelection()
        case "hierarchy.expand-focused":
            return setFocusedNodeExpanded(true)
        case "hierarchy.collapse-focused":
            return setFocusedNodeExpanded(false)
        default:
            return apply(commandID: commandID)
        }
    }
}
