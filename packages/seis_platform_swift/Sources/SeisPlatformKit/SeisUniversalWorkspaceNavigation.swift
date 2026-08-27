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
}
