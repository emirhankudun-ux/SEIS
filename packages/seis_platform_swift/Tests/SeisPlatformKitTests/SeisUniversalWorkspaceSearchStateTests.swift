import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspaceSearchStateTests: XCTestCase {
    func testSearchStateProjectsHierarchyAndTracksFocusedSelectionVisibility() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceSearchState(document: document)

        XCTAssertFalse(state.isFiltering)
        XCTAssertEqual(state.projection.rootNodeIDs, ["domain:graphics", "domain:audio"])

        state.updateQuery("scene graph", expandedNodeIDs: [])

        XCTAssertTrue(state.isFiltering)
        XCTAssertEqual(state.projection.rootNodeIDs, ["domain:graphics"])
        XCTAssertEqual(
            state.projection.childNodeIDs(for: "domain:graphics"),
            ["capability:graphics:scene-graph"]
        )
        XCTAssertTrue(state.contains(nodeID: "capability:graphics:scene-graph"))
        XCTAssertFalse(state.contains(nodeID: "capability:audio:audio-mixer"))
        XCTAssertEqual(
            state.visibleNodeIDs,
            ["domain:graphics", "capability:graphics:scene-graph"]
        )
    }

    func testClearingSearchRestoresExpansionDrivenProjection() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceSearchState(document: document)

        state.updateQuery("audio mixer", expandedNodeIDs: [])
        XCTAssertEqual(state.projection.rootNodeIDs, ["domain:audio"])

        state.updateQuery("", expandedNodeIDs: ["domain:graphics"])

        XCTAssertFalse(state.isFiltering)
        XCTAssertEqual(state.projection.rootNodeIDs, ["domain:graphics", "domain:audio"])
        XCTAssertEqual(
            state.projection.childNodeIDs(for: "domain:graphics"),
            ["capability:graphics:renderer", "capability:graphics:scene-graph"]
        )
        XCTAssertEqual(state.projection.childNodeIDs(for: "domain:audio"), [])
        XCTAssertEqual(
            state.visibleNodeIDs,
            [
                "domain:graphics",
                "capability:graphics:renderer",
                "capability:graphics:scene-graph",
                "domain:audio"
            ]
        )
    }

    func testFilteredNavigationStaysInsideVisibleSearchProjection() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var search = SeisUniversalWorkspaceSearchState(document: document)
        var workspace = SeisUniversalWorkspaceState(document: document)

        search.updateQuery("scene graph", expandedNodeIDs: [])

        XCTAssertTrue(workspace.moveFocus(.next, within: search.visibleNodeIDs))
        XCTAssertEqual(workspace.selectionGraph.focusedNodeID, "domain:graphics")
        XCTAssertTrue(workspace.moveFocus(.next, within: search.visibleNodeIDs))
        XCTAssertEqual(workspace.selectionGraph.focusedNodeID, "capability:graphics:scene-graph")
        XCTAssertFalse(workspace.moveFocus(.next, within: search.visibleNodeIDs))
        XCTAssertEqual(workspace.selectionGraph.focusedNodeID, "capability:graphics:scene-graph")
    }

    func testSearchStateNeverIncludesSensitiveMetadataInMatching() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceSearchState(document: document)

        state.updateQuery("deny externalWrite", expandedNodeIDs: [])

        XCTAssertTrue(state.projection.rootNodeIDs.isEmpty)
        XCTAssertEqual(state.projection.matchCount, 0)
    }

    private func makeCatalog() throws -> SeisFullTechnologyCatalog {
        let domains = [
            SeisFullTechnologyDomain(
                id: "graphics",
                name: "Graphics & Reality",
                capabilities: ["renderer", "scene-graph"]
            ),
            SeisFullTechnologyDomain(
                id: "audio",
                name: "Audio Technology",
                capabilities: ["audio-mixer", "spatial-audio"]
            )
        ]

        let registry = SeisFullTechnologyRegistry(
            version: 1,
            id: "test-registry",
            requestedGoalID: "test-goal",
            canonicalGoalBinding: SeisCanonicalGoalBinding(
                status: .resolved,
                reason: "test",
                source: "unit-test"
            ),
            mode: "local",
            status: "prototype",
            summary: SeisFullTechnologySummary(
                domainCount: 2,
                capabilityCount: 4,
                implementationClasses: ["native"],
                maturityStates: ["prototype"]
            ),
            domains: domains,
            universalFrameworks: [],
            coreSystems: [],
            safetyBoundary: SeisFullTechnologySafetyBoundary(
                defaultNetwork: "deny",
                defaultWrite: "deny",
                externalMutationRequiresApproval: true,
                credentialsInRegistry: false,
                demoClaimsMustBeExplicit: true,
                unverifiedCapabilitiesMustRemainUnavailableOrProposed: true
            )
        )

        return try SeisFullTechnologyCatalog(validating: registry)
    }
}
