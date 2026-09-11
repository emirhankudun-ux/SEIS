import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspaceTabPersistenceTests: XCTestCase {
    func testSnapshotRoundTripRestoresIndependentTabsAndActiveIdentity() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var tabs = SeisUniversalWorkspaceTabs(document: document)
        let firstTabID = try XCTUnwrap(tabs.activeTabID)

        XCTAssertTrue(tabs.updateActiveSession { session in
            session.select(nodeID: "domain:graphics")
        })
        tabs.updateActiveSearchQuery("render")

        let secondTabID = tabs.openTab(document: document)
        XCTAssertTrue(tabs.updateActiveSession { session in
            session.select(nodeID: "capability:graphics:renderer")
        })
        tabs.updateActiveSearchQuery("scene")

        let snapshot = tabs.persistenceSnapshot
        let data = try JSONEncoder().encode(snapshot)
        let decoded = try JSONDecoder().decode(SeisUniversalWorkspaceTabsSnapshot.self, from: data)
        let restored = SeisUniversalWorkspaceTabs(document: document, restoring: decoded)

        XCTAssertEqual(restored.tabs.count, 2)
        XCTAssertEqual(restored.activeTabID, secondTabID)

        let first = try XCTUnwrap(restored.tabs.first(where: { $0.id == firstTabID }))
        XCTAssertEqual(first.searchQuery, "render")
        XCTAssertEqual(first.session.state.selectionGraph.focusedNodeID, "domain:graphics")

        let second = try XCTUnwrap(restored.tabs.first(where: { $0.id == secondTabID }))
        XCTAssertEqual(second.searchQuery, "scene")
        XCTAssertEqual(second.session.state.selectionGraph.focusedNodeID, "capability:graphics:renderer")
    }

    func testRestoreSanitizesStaleNodeIDsAndFallsBackToValidActiveTab() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        let snapshot = SeisUniversalWorkspaceTabsSnapshot(
            tabs: [
                SeisUniversalWorkspaceTabSnapshot(
                    id: "first",
                    scene: SeisUniversalWorkspaceSceneSnapshot(
                        selectedNodeIDs: ["missing", "domain:graphics"],
                        focusedNodeID: "missing",
                        expandedNodeIDs: ["missing", "domain:graphics"],
                        inspectorDock: .leading,
                        isHierarchyVisible: false
                    ),
                    searchQuery: "graphics"
                )
            ],
            activeTabID: "missing-tab"
        )

        let restored = SeisUniversalWorkspaceTabs(document: document, restoring: snapshot)
        let tab = try XCTUnwrap(restored.activeTab)

        XCTAssertEqual(restored.activeTabID, "first")
        XCTAssertEqual(tab.session.state.selectionGraph.selectedNodeIDs, ["domain:graphics"])
        XCTAssertEqual(tab.session.state.selectionGraph.focusedNodeID, "domain:graphics")
        XCTAssertEqual(tab.session.state.expandedNodeIDs, ["domain:graphics"])
        XCTAssertEqual(tab.session.state.inspectorDock, .leading)
        XCTAssertFalse(tab.session.state.isHierarchyVisible)
        XCTAssertEqual(tab.searchQuery, "graphics")
    }

    func testEmptyOrDuplicateSnapshotNeverLeavesWorkspaceWithoutATab() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        let empty = SeisUniversalWorkspaceTabs(
            document: document,
            restoring: SeisUniversalWorkspaceTabsSnapshot(tabs: [], activeTabID: nil)
        )
        XCTAssertEqual(empty.tabs.count, 1)
        XCTAssertNotNil(empty.activeTabID)

        let scene = SeisUniversalWorkspaceState(document: document).snapshot
        let duplicate = SeisUniversalWorkspaceTabs(
            document: document,
            restoring: SeisUniversalWorkspaceTabsSnapshot(
                tabs: [
                    SeisUniversalWorkspaceTabSnapshot(id: "same", scene: scene, searchQuery: "one"),
                    SeisUniversalWorkspaceTabSnapshot(id: "same", scene: scene, searchQuery: "two")
                ],
                activeTabID: "same"
            )
        )

        XCTAssertEqual(duplicate.tabs.count, 1)
        XCTAssertEqual(duplicate.activeTab?.searchQuery, "one")
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
