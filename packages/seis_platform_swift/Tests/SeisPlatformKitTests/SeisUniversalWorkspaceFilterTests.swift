import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspaceFilterTests: XCTestCase {
    func testEmptyQueryUsesExpansionStateForVisibleHierarchy() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        let collapsed = document.hierarchyProjection(
            expandedNodeIDs: [],
            query: ""
        )
        XCTAssertEqual(collapsed.rootNodeIDs, ["domain:graphics", "domain:audio"])
        XCTAssertEqual(collapsed.childNodeIDs(for: "domain:graphics"), [])

        let expanded = document.hierarchyProjection(
            expandedNodeIDs: ["domain:graphics"],
            query: ""
        )
        XCTAssertEqual(
            expanded.childNodeIDs(for: "domain:graphics"),
            ["capability:graphics:renderer", "capability:graphics:scene-graph"]
        )
        XCTAssertEqual(expanded.childNodeIDs(for: "domain:audio"), [])
    }

    func testCapabilityMatchKeepsParentContextAndIgnoresCollapsedState() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        let projection = document.hierarchyProjection(
            expandedNodeIDs: [],
            query: "scene graph"
        )

        XCTAssertEqual(projection.rootNodeIDs, ["domain:graphics"])
        XCTAssertEqual(
            projection.childNodeIDs(for: "domain:graphics"),
            ["capability:graphics:scene-graph"]
        )
        XCTAssertTrue(projection.isFiltering)
        XCTAssertEqual(projection.matchCount, 1)
    }

    func testDomainMatchIncludesAllChildrenForExploration() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        let projection = document.hierarchyProjection(
            expandedNodeIDs: [],
            query: "graphics reality"
        )

        XCTAssertEqual(projection.rootNodeIDs, ["domain:graphics"])
        XCTAssertEqual(
            projection.childNodeIDs(for: "domain:graphics"),
            ["capability:graphics:renderer", "capability:graphics:scene-graph"]
        )
        XCTAssertEqual(projection.matchCount, 1)
    }

    func testFilteringIsCaseInsensitiveTokenizedAndDeterministic() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        let projection = document.hierarchyProjection(
            expandedNodeIDs: ["domain:graphics", "domain:audio"],
            query: "  AUDIO   mixer  "
        )

        XCTAssertEqual(projection.rootNodeIDs, ["domain:audio"])
        XCTAssertEqual(
            projection.childNodeIDs(for: "domain:audio"),
            ["capability:audio:audio-mixer"]
        )
        XCTAssertEqual(projection.matchCount, 1)
    }

    func testNoMatchProducesExplicitEmptyProjection() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        let projection = document.hierarchyProjection(
            expandedNodeIDs: ["domain:graphics"],
            query: "quantum compiler"
        )

        XCTAssertTrue(projection.rootNodeIDs.isEmpty)
        XCTAssertEqual(projection.matchCount, 0)
        XCTAssertTrue(projection.isFiltering)
    }

    func testSearchCorpusDoesNotIncludeSensitiveMetadataValues() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        XCTAssertFalse(document.node(id: "domain:graphics")?.matchesHierarchyQuery("deny") ?? true)
        XCTAssertFalse(document.node(id: "domain:graphics")?.matchesHierarchyQuery("externalWrite") ?? true)
        XCTAssertTrue(document.node(id: "capability:graphics:renderer")?.matchesHierarchyQuery("renderer") ?? false)
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
