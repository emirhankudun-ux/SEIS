import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspaceSelectionShelfTests: XCTestCase {
    func testRecentSelectionsAreBoundedDeduplicatedAndNewestFirst() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var shelf = SeisUniversalWorkspaceSelectionShelf(document: document, recentLimit: 2)

        XCTAssertTrue(shelf.recordSelection(nodeID: "domain:graphics"))
        XCTAssertTrue(shelf.recordSelection(nodeID: "capability:graphics:renderer"))
        XCTAssertTrue(shelf.recordSelection(nodeID: "capability:graphics:scene-graph"))
        XCTAssertEqual(
            shelf.recentNodeIDs,
            ["capability:graphics:scene-graph", "capability:graphics:renderer"]
        )

        XCTAssertTrue(shelf.recordSelection(nodeID: "capability:graphics:renderer"))
        XCTAssertEqual(
            shelf.recentNodeIDs,
            ["capability:graphics:renderer", "capability:graphics:scene-graph"]
        )
        XCTAssertFalse(shelf.recordSelection(nodeID: "missing"))
    }

    func testPinnedSelectionsAreStableAndToggleable() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var shelf = SeisUniversalWorkspaceSelectionShelf(document: document)

        XCTAssertTrue(shelf.togglePin(nodeID: "domain:graphics"))
        XCTAssertTrue(shelf.isPinned(nodeID: "domain:graphics"))
        XCTAssertEqual(shelf.pinnedNodeIDs, ["domain:graphics"])

        XCTAssertTrue(shelf.togglePin(nodeID: "capability:graphics:renderer"))
        XCTAssertEqual(
            shelf.pinnedNodeIDs,
            ["domain:graphics", "capability:graphics:renderer"]
        )

        XCTAssertTrue(shelf.togglePin(nodeID: "domain:graphics"))
        XCTAssertFalse(shelf.isPinned(nodeID: "domain:graphics"))
        XCTAssertEqual(shelf.pinnedNodeIDs, ["capability:graphics:renderer"])
        XCTAssertFalse(shelf.togglePin(nodeID: "missing"))
    }

    func testSelectionsResolveBackToDocumentNodes() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var shelf = SeisUniversalWorkspaceSelectionShelf(document: document)
        _ = shelf.recordSelection(nodeID: "capability:graphics:renderer")
        _ = shelf.togglePin(nodeID: "domain:graphics")

        XCTAssertEqual(shelf.recentSelections.map(\.title), ["renderer"])
        XCTAssertEqual(shelf.pinnedSelections.map(\.title), ["Graphics & Reality"])
    }

    private func makeCatalog() throws -> SeisFullTechnologyCatalog {
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
                domainCount: 1,
                capabilityCount: 2,
                implementationClasses: ["native"],
                maturityStates: ["prototype"]
            ),
            domains: [
                SeisFullTechnologyDomain(
                    id: "graphics",
                    name: "Graphics & Reality",
                    capabilities: ["renderer", "scene-graph"]
                )
            ],
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
