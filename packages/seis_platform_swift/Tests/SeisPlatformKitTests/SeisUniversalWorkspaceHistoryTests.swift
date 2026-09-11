import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspaceHistoryTests: XCTestCase {
    func testSessionNavigatesBackAndForwardThroughSelectionHistory() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var session = SeisUniversalWorkspaceSession(document: document)

        XCTAssertFalse(session.canNavigateBack)
        XCTAssertFalse(session.canNavigateForward)

        XCTAssertTrue(session.select(nodeID: "domain:graphics"))
        XCTAssertTrue(session.select(nodeID: "capability:graphics:renderer"))
        XCTAssertTrue(session.select(nodeID: "capability:graphics:scene-graph"))
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "capability:graphics:scene-graph")
        XCTAssertTrue(session.canNavigateBack)
        XCTAssertFalse(session.canNavigateForward)

        XCTAssertTrue(session.navigateBack())
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "capability:graphics:renderer")
        XCTAssertTrue(session.canNavigateForward)

        XCTAssertTrue(session.navigateBack())
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "domain:graphics")

        XCTAssertTrue(session.navigateForward())
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "capability:graphics:renderer")
    }

    func testNewSelectionAfterBackClearsForwardHistory() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var session = SeisUniversalWorkspaceSession(document: document)

        XCTAssertTrue(session.select(nodeID: "domain:graphics"))
        XCTAssertTrue(session.select(nodeID: "capability:graphics:renderer"))
        XCTAssertTrue(session.navigateBack())
        XCTAssertTrue(session.canNavigateForward)

        XCTAssertTrue(session.select(nodeID: "capability:graphics:scene-graph"))
        XCTAssertFalse(session.canNavigateForward)
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "capability:graphics:scene-graph")
    }

    func testHistoryPreservesAdditiveSelectionAndRestoresItExactly() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var session = SeisUniversalWorkspaceSession(document: document)

        XCTAssertTrue(session.select(nodeID: "domain:graphics"))
        XCTAssertTrue(session.select(nodeID: "capability:graphics:renderer", mode: .additive))
        XCTAssertEqual(
            session.state.selectionGraph.selectedNodeIDs,
            ["domain:graphics", "capability:graphics:renderer"]
        )

        XCTAssertTrue(session.select(nodeID: "capability:graphics:scene-graph"))
        XCTAssertTrue(session.navigateBack())
        XCTAssertEqual(
            session.state.selectionGraph.selectedNodeIDs,
            ["domain:graphics", "capability:graphics:renderer"]
        )
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "capability:graphics:renderer")
    }

    func testHistoryIsBoundedAndIgnoresLayoutOnlyCommands() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var session = SeisUniversalWorkspaceSession(document: document, historyLimit: 2)

        XCTAssertTrue(session.applyWorkspaceCommand(commandID: "inspector.leading"))
        XCTAssertTrue(session.applyWorkspaceCommand(commandID: "hierarchy.hide"))
        XCTAssertFalse(session.canNavigateBack)

        XCTAssertTrue(session.select(nodeID: "domain:graphics"))
        XCTAssertTrue(session.select(nodeID: "capability:graphics:renderer"))
        XCTAssertTrue(session.select(nodeID: "capability:graphics:scene-graph"))

        XCTAssertEqual(session.backHistoryCount, 2)
        XCTAssertTrue(session.navigateBack())
        XCTAssertTrue(session.navigateBack())
        XCTAssertFalse(session.navigateBack())
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "domain:graphics")
    }

    func testWorkspaceCommandDispatcherIncludesHistoryCommands() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        let palette = SeisUniversalCommandPalette(document: document)
        var session = SeisUniversalWorkspaceSession(document: document)

        XCTAssertEqual(palette.workspaceCommands(matching: "go back").map(\.id), ["navigation.back"])
        XCTAssertEqual(palette.workspaceCommands(matching: "go forward").map(\.id), ["navigation.forward"])

        XCTAssertTrue(session.applyWorkspaceCommand(commandID: "select:domain:graphics"))
        XCTAssertTrue(session.applyWorkspaceCommand(commandID: "select:capability:graphics:renderer"))
        XCTAssertTrue(session.applyWorkspaceCommand(commandID: "navigation.back"))
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "domain:graphics")
        XCTAssertTrue(session.applyWorkspaceCommand(commandID: "navigation.forward"))
        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "capability:graphics:renderer")
        XCTAssertFalse(session.state.allowsExternalMutation)
    }

    func testRestoredSessionStartsWithCleanEphemeralHistory() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceState(document: document)
        XCTAssertTrue(state.selectionGraph.select(nodeID: "capability:graphics:renderer"))

        let session = SeisUniversalWorkspaceSession(state: state)

        XCTAssertEqual(session.state.selectionGraph.focusedNodeID, "capability:graphics:renderer")
        XCTAssertFalse(session.canNavigateBack)
        XCTAssertFalse(session.canNavigateForward)
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
