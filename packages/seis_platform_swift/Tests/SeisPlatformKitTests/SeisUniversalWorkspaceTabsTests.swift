import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspaceTabsTests: XCTestCase {
    func testTabsKeepIndependentSessionAndSearchState() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var tabs = SeisUniversalWorkspaceTabs(document: document)

        XCTAssertEqual(tabs.tabs.count, 1)
        XCTAssertEqual(tabs.activeTab?.title, "Workspace")

        XCTAssertTrue(tabs.updateActiveSession { session in
            session.select(nodeID: "domain:graphics")
        })
        tabs.updateActiveSearchQuery("render")

        let firstTabID = try XCTUnwrap(tabs.activeTabID)
        let secondTabID = tabs.openTab(document: document)

        XCTAssertNotEqual(firstTabID, secondTabID)
        XCTAssertEqual(tabs.activeTabID, secondTabID)
        XCTAssertEqual(tabs.activeTab?.searchQuery, "")
        XCTAssertEqual(tabs.activeTab?.session.state.selectionGraph.focusedNodeID, nil)

        XCTAssertTrue(tabs.updateActiveSession { session in
            session.select(nodeID: "capability:graphics:renderer")
        })
        tabs.updateActiveSearchQuery("scene")

        XCTAssertTrue(tabs.activateTab(id: firstTabID))
        XCTAssertEqual(tabs.activeTab?.searchQuery, "render")
        XCTAssertEqual(tabs.activeTab?.session.state.selectionGraph.focusedNodeID, "domain:graphics")
        XCTAssertEqual(tabs.activeTab?.title, "Graphics & Reality")

        XCTAssertTrue(tabs.activateTab(id: secondTabID))
        XCTAssertEqual(tabs.activeTab?.searchQuery, "scene")
        XCTAssertEqual(tabs.activeTab?.session.state.selectionGraph.focusedNodeID, "capability:graphics:renderer")
        XCTAssertEqual(tabs.activeTab?.title, "renderer")
    }

    func testClosingActiveTabSelectsRemainingTabAndNeverLeavesWorkspaceEmpty() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var tabs = SeisUniversalWorkspaceTabs(document: document)
        let firstTabID = try XCTUnwrap(tabs.activeTabID)
        let secondTabID = tabs.openTab(document: document)

        XCTAssertTrue(tabs.closeTab(id: secondTabID))
        XCTAssertEqual(tabs.tabs.map(\.id), [firstTabID])
        XCTAssertEqual(tabs.activeTabID, firstTabID)

        XCTAssertFalse(tabs.closeTab(id: firstTabID))
        XCTAssertEqual(tabs.tabs.count, 1)
        XCTAssertEqual(tabs.activeTabID, firstTabID)
    }

    func testCyclingTabsWrapsInBothDirections() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var tabs = SeisUniversalWorkspaceTabs(document: document)
        let first = try XCTUnwrap(tabs.activeTabID)
        let second = tabs.openTab(document: document)
        let third = tabs.openTab(document: document)

        XCTAssertEqual(tabs.activeTabID, third)
        XCTAssertTrue(tabs.activateNextTab())
        XCTAssertEqual(tabs.activeTabID, first)
        XCTAssertTrue(tabs.activatePreviousTab())
        XCTAssertEqual(tabs.activeTabID, third)
        XCTAssertTrue(tabs.activatePreviousTab())
        XCTAssertEqual(tabs.activeTabID, second)
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
