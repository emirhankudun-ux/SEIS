import Foundation

public struct SeisUniversalWorkspaceSelectionShelf: Equatable, Sendable {
    public let document: SeisUniversalWorkspaceDocument
    public let recentLimit: Int
    public private(set) var recentNodeIDs: [String]
    public private(set) var pinnedNodeIDs: [String]

    public init(
        document: SeisUniversalWorkspaceDocument,
        recentLimit: Int = 12,
        recentNodeIDs: [String] = [],
        pinnedNodeIDs: [String] = []
    ) {
        self.document = document
        self.recentLimit = max(1, recentLimit)
        self.recentNodeIDs = Self.sanitized(
            recentNodeIDs,
            document: document,
            limit: max(1, recentLimit)
        )
        self.pinnedNodeIDs = Self.sanitized(
            pinnedNodeIDs,
            document: document,
            limit: nil
        )
    }

    public var recentSelections: [SeisUniversalSelection] {
        recentNodeIDs.compactMap { document.node(id: $0)?.selection }
    }

    public var pinnedSelections: [SeisUniversalSelection] {
        pinnedNodeIDs.compactMap { document.node(id: $0)?.selection }
    }

    @discardableResult
    public mutating func recordSelection(nodeID: String) -> Bool {
        guard document.node(id: nodeID) != nil else { return false }

        recentNodeIDs.removeAll { $0 == nodeID }
        recentNodeIDs.insert(nodeID, at: 0)

        if recentNodeIDs.count > recentLimit {
            recentNodeIDs.removeLast(recentNodeIDs.count - recentLimit)
        }

        return true
    }

    @discardableResult
    public mutating func togglePin(nodeID: String) -> Bool {
        guard document.node(id: nodeID) != nil else { return false }

        if let index = pinnedNodeIDs.firstIndex(of: nodeID) {
            pinnedNodeIDs.remove(at: index)
        } else {
            pinnedNodeIDs.append(nodeID)
        }

        return true
    }

    public func isPinned(nodeID: String) -> Bool {
        pinnedNodeIDs.contains(nodeID)
    }

    private static func sanitized(
        _ nodeIDs: [String],
        document: SeisUniversalWorkspaceDocument,
        limit: Int?
    ) -> [String] {
        var seen: Set<String> = []
        var result = nodeIDs.filter { nodeID in
            document.node(id: nodeID) != nil && seen.insert(nodeID).inserted
        }

        if let limit, result.count > limit {
            result = Array(result.prefix(limit))
        }

        return result
    }
}
