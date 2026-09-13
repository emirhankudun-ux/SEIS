import Foundation

public struct SeisUniversalHierarchyProjection: Equatable, Sendable {
    public let rootNodeIDs: [String]
    public let matchCount: Int
    public let isFiltering: Bool

    private let childNodeIDsByRootID: [String: [String]]

    public init(
        rootNodeIDs: [String],
        childNodeIDsByRootID: [String: [String]],
        matchCount: Int,
        isFiltering: Bool
    ) {
        self.rootNodeIDs = rootNodeIDs
        self.childNodeIDsByRootID = childNodeIDsByRootID
        self.matchCount = matchCount
        self.isFiltering = isFiltering
    }

    public func childNodeIDs(for rootNodeID: String) -> [String] {
        childNodeIDsByRootID[rootNodeID] ?? []
    }
}

public extension SeisUniversalWorkspaceNode {
    func matchesHierarchyQuery(_ query: String) -> Bool {
        let tokens = Self.hierarchyQueryTokens(query)
        guard !tokens.isEmpty else { return true }

        let corpus = [
            id,
            selection.id,
            selection.title,
            selection.subtitle,
            selection.kind.rawValue
        ]
        .joined(separator: " ")
        .lowercased()

        return tokens.allSatisfy(corpus.contains)
    }

    private static func hierarchyQueryTokens(_ query: String) -> [String] {
        query
            .lowercased()
            .split(whereSeparator: \.isWhitespace)
            .map(String.init)
    }
}

public extension SeisUniversalWorkspaceDocument {
    func hierarchyProjection(
        expandedNodeIDs: [String],
        query: String
    ) -> SeisUniversalHierarchyProjection {
        let isFiltering = !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        let expanded = Set(expandedNodeIDs)
        var visibleRootNodeIDs: [String] = []
        var visibleChildNodeIDs: [String: [String]] = [:]
        var matchCount = 0

        for rootNodeID in rootNodeIDs {
            guard let rootNode = node(id: rootNodeID) else { continue }
            let validChildNodeIDs = rootNode.childIDs.filter { node(id: $0) != nil }

            if !isFiltering {
                visibleRootNodeIDs.append(rootNodeID)
                visibleChildNodeIDs[rootNodeID] = expanded.contains(rootNodeID)
                    ? validChildNodeIDs
                    : []
                continue
            }

            if rootNode.matchesHierarchyQuery(query) {
                visibleRootNodeIDs.append(rootNodeID)
                visibleChildNodeIDs[rootNodeID] = validChildNodeIDs
                matchCount += 1
                continue
            }

            let matchingChildNodeIDs = validChildNodeIDs.filter { childNodeID in
                node(id: childNodeID)?.matchesHierarchyQuery(query) == true
            }

            if !matchingChildNodeIDs.isEmpty {
                visibleRootNodeIDs.append(rootNodeID)
                visibleChildNodeIDs[rootNodeID] = matchingChildNodeIDs
                matchCount += matchingChildNodeIDs.count
            }
        }

        return SeisUniversalHierarchyProjection(
            rootNodeIDs: visibleRootNodeIDs,
            childNodeIDsByRootID: visibleChildNodeIDs,
            matchCount: matchCount,
            isFiltering: isFiltering
        )
    }
}
