import XCTest
@testable import SeisPlatformKit

final class SeisUniversalWorkspaceTests: XCTestCase {
    func testShellRouteCatalogExposesTechnologyCenterAndUniversalWorkspace() {
        XCTAssertEqual(
            SeisAppleNativeShellRoute.allCases.map(\.rawValue),
            ["demo", "platform", "technology-center", "universal-workspace"]
        )
        XCTAssertEqual(SeisAppleNativeShellRoute.defaultRoute, .demo)
    }

    func testUniversalWorkspaceSelectionProducesStableInspectorSections() {
        let selection = SeisUniversalSelection(
            kind: .capability,
            id: "renderer",
            title: "Renderer",
            subtitle: "Graphics & Reality",
            metadata: [
                "maturity": "prototype",
                "network": "deny",
                "owner": "@seis-platform"
            ]
        )

        let inspector = SeisUniversalInspectorPresentation(selection: selection)

        XCTAssertEqual(inspector.title, "Renderer")
        XCTAssertEqual(inspector.subtitle, "Graphics & Reality")
        XCTAssertEqual(inspector.sections.map(\.title), ["Identity", "Metadata", "Safety"])
        XCTAssertEqual(inspector.sections[0].rows.first?.value, "capability")
        XCTAssertTrue(inspector.sections[2].rows.contains { $0.label == "Network" && $0.value == "deny" })
        XCTAssertFalse(inspector.allowsMutation)
    }

    func testUniversalInspectorHasExplicitEmptyState() {
        let inspector = SeisUniversalInspectorPresentation(selection: nil)

        XCTAssertEqual(inspector.title, "Nothing selected")
        XCTAssertEqual(inspector.subtitle, "Select an item in the Universal Viewport to inspect it.")
        XCTAssertTrue(inspector.sections.isEmpty)
        XCTAssertFalse(inspector.allowsMutation)
    }

    func testInspectorRedactsSensitiveMetadataAndNeverEnablesMutation() {
        let selection = SeisUniversalSelection(
            kind: .tool,
            id: "local-tool",
            title: "Local Tool",
            subtitle: "Read-only",
            metadata: [
                "repositoryPath": "/Users/emirhan/private/SEIS",
                "token": "secret-value",
                "externalWrite": "true"
            ]
        )

        let inspector = SeisUniversalInspectorPresentation(selection: selection)
        let values = inspector.sections.flatMap(\.rows).map(\.value)

        XCTAssertFalse(values.contains { $0.contains("/Users/") })
        XCTAssertFalse(values.contains("secret-value"))
        XCTAssertFalse(inspector.allowsMutation)
    }

    func testWorkspaceDocumentBuildsDeterministicDomainCapabilityTree() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        XCTAssertEqual(document.rootNodeIDs, ["domain:graphics"])
        XCTAssertEqual(document.nodes.map(\.id), [
            "domain:graphics",
            "capability:graphics:renderer",
            "capability:graphics:scene-graph"
        ])

        let domain = try XCTUnwrap(document.node(id: "domain:graphics"))
        XCTAssertEqual(domain.parentID, nil)
        XCTAssertEqual(domain.childIDs, [
            "capability:graphics:renderer",
            "capability:graphics:scene-graph"
        ])

        let renderer = try XCTUnwrap(document.node(id: "capability:graphics:renderer"))
        XCTAssertEqual(renderer.parentID, "domain:graphics")
        XCTAssertEqual(renderer.selection.kind, .capability)
        XCTAssertEqual(renderer.selection.id, "renderer")
        XCTAssertEqual(renderer.selection.metadata["domain"], "graphics")
    }

    func testSelectionGraphKeepsPreviousSelectionWhenUnknownNodeIsRequested() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var graph = SeisUniversalSelectionGraph(document: document)

        XCTAssertTrue(graph.select(nodeID: "capability:graphics:renderer"))
        XCTAssertEqual(graph.selectedNodeID, "capability:graphics:renderer")
        XCTAssertEqual(graph.selectedSelection?.title, "renderer")

        XCTAssertFalse(graph.select(nodeID: "missing-node"))
        XCTAssertEqual(graph.selectedNodeID, "capability:graphics:renderer")
    }

    func testCommandPaletteFiltersNavigationAndInspectorCommandsDeterministically() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        let palette = SeisUniversalCommandPalette(document: document)

        XCTAssertEqual(
            palette.commands(matching: "dock inspector left").map(\.id),
            ["inspector.leading"]
        )
        XCTAssertEqual(
            palette.commands(matching: "renderer").map(\.id),
            ["select:capability:graphics:renderer"]
        )
        XCTAssertEqual(
            palette.commands(matching: "").prefix(3).map(\.id),
            ["inspector.trailing", "inspector.leading", "inspector.hidden"]
        )
    }

    func testWorkspaceStateAppliesInspectorDockAndSelectionCommandsWithoutMutationCapability() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceState(document: document)

        XCTAssertEqual(state.inspectorDock, .trailing)
        XCTAssertFalse(state.allowsExternalMutation)

        XCTAssertTrue(state.apply(commandID: "inspector.leading"))
        XCTAssertEqual(state.inspectorDock, .leading)

        XCTAssertTrue(state.apply(commandID: "select:capability:graphics:scene-graph"))
        XCTAssertEqual(state.selectionGraph.selectedSelection?.id, "scene-graph")

        XCTAssertTrue(state.apply(commandID: "inspector.hidden"))
        XCTAssertEqual(state.inspectorDock, .hidden)
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
