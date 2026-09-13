import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspaceCommandNavigationTests: XCTestCase {
    func testNavigationCommandsAreSearchableByIntent() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        let palette = SeisUniversalCommandPalette(document: document)

        XCTAssertEqual(palette.workspaceCommands(matching: "next selection").map(\.id), ["selection.next"])
        XCTAssertEqual(palette.workspaceCommands(matching: "previous selection").map(\.id), ["selection.previous"])
        XCTAssertEqual(palette.workspaceCommands(matching: "clear selection").map(\.id), ["selection.clear"])
        XCTAssertEqual(palette.workspaceCommands(matching: "expand focused").map(\.id), ["hierarchy.expand-focused"])
        XCTAssertEqual(palette.workspaceCommands(matching: "collapse focused").map(\.id), ["hierarchy.collapse-focused"])
        XCTAssertEqual(palette.workspaceCommands(matching: "find workspace").map(\.id), ["search.focus"])
        XCTAssertEqual(palette.workspaceCommands(matching: "clear workspace filter").map(\.id), ["search.clear"])
    }

    func testWorkspaceCommandDispatchUsesSameNavigationStateTransitions() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceState(document: document)

        XCTAssertTrue(state.applyWorkspaceCommand(commandID: "select:domain:graphics"))
        XCTAssertTrue(state.applyWorkspaceCommand(commandID: "hierarchy.expand-focused"))
        XCTAssertEqual(state.expandedNodeIDs, ["domain:graphics"])

        XCTAssertTrue(state.applyWorkspaceCommand(commandID: "selection.next"))
        XCTAssertEqual(state.selectionGraph.focusedNodeID, "capability:graphics:renderer")

        XCTAssertTrue(state.applyWorkspaceCommand(commandID: "selection.next"))
        XCTAssertEqual(state.selectionGraph.focusedNodeID, "capability:graphics:scene-graph")

        XCTAssertTrue(state.applyWorkspaceCommand(commandID: "selection.previous"))
        XCTAssertEqual(state.selectionGraph.focusedNodeID, "capability:graphics:renderer")

        XCTAssertTrue(state.applyWorkspaceCommand(commandID: "selection.clear"))
        XCTAssertTrue(state.selectionGraph.selectedNodeIDs.isEmpty)
        XCTAssertFalse(state.applyWorkspaceCommand(commandID: "selection.clear"))
    }

    func testWorkspaceCommandDispatchFallsBackToExistingInspectorAndHierarchyCommands() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceState(document: document)

        XCTAssertTrue(state.applyWorkspaceCommand(commandID: "inspector.leading"))
        XCTAssertEqual(state.inspectorDock, .leading)
        XCTAssertTrue(state.applyWorkspaceCommand(commandID: "hierarchy.hide"))
        XCTAssertFalse(state.isHierarchyVisible)
        XCTAssertFalse(state.applyWorkspaceCommand(commandID: "unknown.command"))
        XCTAssertFalse(state.allowsExternalMutation)
    }

    private func makeCatalog() throws -> SeisFullTechnologyCatalog {
        let domains = [
            SeisFullTechnologyDomain(
                id: "graphics",
                name: "Graphics & Reality",
                capabilities: ["renderer", "scene-graph"]
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
                domainCount: 1,
                capabilityCount: 2,
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
