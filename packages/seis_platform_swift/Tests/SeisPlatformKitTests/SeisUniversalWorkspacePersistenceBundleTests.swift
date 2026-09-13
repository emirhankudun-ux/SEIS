import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspacePersistenceBundleTests: XCTestCase {
    func testBundleRoundTripRestoresTabsAndSelectionShelf() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var tabs = SeisUniversalWorkspaceTabs(document: document)
        XCTAssertTrue(tabs.updateActiveSession { session in
            session.select(nodeID: "domain:graphics")
        })
        tabs.updateActiveSearchQuery("render")
        _ = tabs.openTab(document: document)
        XCTAssertTrue(tabs.updateActiveSession { session in
            session.select(nodeID: "capability:graphics:renderer")
        })

        var shelf = SeisUniversalWorkspaceSelectionShelf(document: document)
        XCTAssertTrue(shelf.recordSelection(nodeID: "domain:graphics"))
        XCTAssertTrue(shelf.recordSelection(nodeID: "capability:graphics:renderer"))
        XCTAssertTrue(shelf.togglePin(nodeID: "domain:graphics"))

        let snapshot = SeisUniversalWorkspacePersistenceSnapshot(
            tabs: tabs.persistenceSnapshot,
            shelf: shelf.persistenceSnapshot
        )
        let data = try JSONEncoder().encode(snapshot)
        let decoded = try JSONDecoder().decode(SeisUniversalWorkspacePersistenceSnapshot.self, from: data)
        let restored = SeisUniversalWorkspacePersistenceState(
            document: document,
            restoring: decoded
        )

        XCTAssertEqual(restored.tabs.tabs.count, 2)
        XCTAssertEqual(restored.tabs.activeTab?.session.state.selectionGraph.focusedNodeID, "capability:graphics:renderer")
        XCTAssertEqual(restored.shelf.recentNodeIDs, ["capability:graphics:renderer", "domain:graphics"])
        XCTAssertEqual(restored.shelf.pinnedNodeIDs, ["domain:graphics"])
    }

    func testRestoreSanitizesStaleShelfEntriesWithoutAffectingTabs() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        let tabs = SeisUniversalWorkspaceTabs(document: document)
        let snapshot = SeisUniversalWorkspacePersistenceSnapshot(
            tabs: tabs.persistenceSnapshot,
            shelf: SeisUniversalWorkspaceSelectionShelfSnapshot(
                recentNodeIDs: ["missing", "domain:graphics"],
                pinnedNodeIDs: ["missing", "capability:graphics:renderer"]
            )
        )

        let restored = SeisUniversalWorkspacePersistenceState(
            document: document,
            restoring: snapshot
        )

        XCTAssertEqual(restored.tabs.tabs.count, 1)
        XCTAssertEqual(restored.shelf.recentNodeIDs, ["domain:graphics"])
        XCTAssertEqual(restored.shelf.pinnedNodeIDs, ["capability:graphics:renderer"])
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
