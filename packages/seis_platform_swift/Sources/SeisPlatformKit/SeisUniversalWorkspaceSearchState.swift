import Foundation

public struct SeisUniversalWorkspaceSearchState: Sendable {
    public let document: SeisUniversalWorkspaceDocument
    public private(set) var query: String
    public private(set) var projection: SeisUniversalHierarchyProjection

    public init(
        document: SeisUniversalWorkspaceDocument,
        expandedNodeIDs: [String] = []
    ) {
        self.document = document
        self.query = ""
        self.projection = document.hierarchyProjection(
            expandedNodeIDs: expandedNodeIDs,
            query: ""
        )
    }

    public var isFiltering: Bool {
        projection.isFiltering
    }

    public var visibleNodeIDs: [String] {
        projection.rootNodeIDs.flatMap { rootNodeID in
            [rootNodeID] + projection.childNodeIDs(for: rootNodeID)
        }
    }

    public mutating func updateQuery(
        _ query: String,
        expandedNodeIDs: [String]
    ) {
        self.query = query
        self.projection = document.hierarchyProjection(
            expandedNodeIDs: expandedNodeIDs,
            query: query
        )
    }

    public func contains(nodeID: String) -> Bool {
        visibleNodeIDs.contains(nodeID)
    }
}
