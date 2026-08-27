import Foundation

public struct SeisUniversalWorkspaceSearchState: Equatable, Sendable {
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
        if projection.rootNodeIDs.contains(nodeID) {
            return true
        }

        return projection.rootNodeIDs.contains { rootNodeID in
            projection.childNodeIDs(for: rootNodeID).contains(nodeID)
        }
    }
}
