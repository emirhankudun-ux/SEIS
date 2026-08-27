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

    func testDocumentBuildsBreadcrumbsFromRootToFocusedNode() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())

        XCTAssertEqual(
            document.breadcrumbNodeIDs(for: "capability:graphics:renderer"),
            ["domain:graphics", "capability:graphics:renderer"]
        )
        XCTAssertEqual(document.breadcrumbNodeIDs(for: "domain:graphics"), ["domain:graphics"])
        XCTAssertEqual(document.breadcrumbNodeIDs(for: "missing"), [])
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

    func testSelectionGraphSupportsReplacementAndAdditiveSelection() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var graph = SeisUniversalSelectionGraph(document: document)

        XCTAssertTrue(graph.select(nodeID: "domain:graphics", mode: .replace))
        XCTAssertEqual(graph.selectedNodeIDs, ["domain:graphics"])
        XCTAssertEqual(graph.focusedNodeID, "domain:graphics")

        XCTAssertTrue(graph.select(nodeID: "capability:graphics:renderer", mode: .additive))
        XCTAssertEqual(graph.selectedNodeIDs, ["domain:graphics", "capability:graphics:renderer"])
        XCTAssertEqual(graph.focusedNodeID, "capability:graphics:renderer")
        XCTAssertEqual(graph.selectedSelections.map(\.id), ["graphics", "renderer"])

        XCTAssertTrue(graph.select(nodeID: "capability:graphics:scene-graph", mode: .replace))
        XCTAssertEqual(graph.selectedNodeIDs, ["capability:graphics:scene-graph"])
        XCTAssertEqual(graph.focusedNodeID, "capability:graphics:scene-graph")
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
        XCTAssertEqual(palette.commands(matching: "show hierarchy").map(\.id), ["hierarchy.show"])
        XCTAssertEqual(palette.commands(matching: "hide hierarchy").map(\.id), ["hierarchy.hide"])
    }

    func testWorkspaceStateAppliesInspectorDockAndSelectionCommandsWithoutMutationCapability() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceState(document: document)

        XCTAssertEqual(state.inspectorDock, .trailing)
        XCTAssertTrue(state.isHierarchyVisible)
        XCTAssertFalse(state.allowsExternalMutation)

        XCTAssertTrue(state.apply(commandID: "inspector.leading"))
        XCTAssertEqual(state.inspectorDock, .leading)

        XCTAssertTrue(state.apply(commandID: "select:capability:graphics:scene-graph"))
        XCTAssertEqual(state.selectionGraph.selectedSelection?.id, "scene-graph")

        XCTAssertTrue(state.apply(commandID: "hierarchy.hide"))
        XCTAssertFalse(state.isHierarchyVisible)
        XCTAssertTrue(state.apply(commandID: "hierarchy.show"))
        XCTAssertTrue(state.isHierarchyVisible)

        XCTAssertTrue(state.apply(commandID: "inspector.hidden"))
        XCTAssertEqual(state.inspectorDock, .hidden)
        XCTAssertFalse(state.allowsExternalMutation)
    }

    func testHierarchyExpansionIgnoresUnknownNodes() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceState(document: document)

        XCTAssertTrue(state.setExpanded(nodeID: "domain:graphics", isExpanded: true))
        XCTAssertEqual(state.expandedNodeIDs, ["domain:graphics"])
        XCTAssertFalse(state.setExpanded(nodeID: "missing", isExpanded: true))
        XCTAssertEqual(state.expandedNodeIDs, ["domain:graphics"])
    }

    func testSceneSnapshotRoundTripsAndSanitizesUnknownNodeIDs() throws {
        let document = SeisUniversalWorkspaceDocument(catalog: try makeCatalog())
        var state = SeisUniversalWorkspaceState(document: document)
        XCTAssertTrue(state.selectionGraph.select(nodeID: "domain:graphics", mode: .replace))
        XCTAssertTrue(state.selectionGraph.select(nodeID: "capability:graphics:renderer", mode: .additive))
        XCTAssertTrue(state.setExpanded(nodeID: "domain:graphics", isExpanded: true))
        XCTAssertTrue(state.apply(commandID: "inspector.leading"))

        let encoded = try JSONEncoder().encode(state.snapshot)
        let decoded = try JSONDecoder().decode(SeisUniversalWorkspaceSceneSnapshot.self, from: encoded)
        let restored = SeisUniversalWorkspaceState(document: document, restoring: decoded)

        XCTAssertEqual(restored.selectionGraph.selectedNodeIDs, ["domain:graphics", "capability:graphics:renderer"])
        XCTAssertEqual(restored.selectionGraph.focusedNodeID, "capability:graphics:renderer")
        XCTAssertEqual(restored.expandedNodeIDs, ["domain:graphics"])
        XCTAssertEqual(restored.inspectorDock, .leading)
        XCTAssertTrue(restored.isHierarchyVisible)

        let unsafe = SeisUniversalWorkspaceSceneSnapshot(
            selectedNodeIDs: ["missing", "capability:graphics:scene-graph"],
            focusedNodeID: "missing",
            expandedNodeIDs: ["missing", "domain:graphics"],
            inspectorDock: .trailing,
            isHierarchyVisible: false
        )
        let sanitized = SeisUniversalWorkspaceState(document: document, restoring: unsafe)

        XCTAssertEqual(sanitized.selectionGraph.selectedNodeIDs, ["capability:graphics:scene-graph"])
        XCTAssertEqual(sanitized.selectionGraph.focusedNodeID, "capability:graphics:scene-graph")
        XCTAssertEqual(sanitized.expandedNodeIDs, ["domain:graphics"])
        XCTAssertFalse(sanitized.isHierarchyVisible)
        XCTAssertFalse(sanitized.allowsExternalMutation)
    }

    func testMultiSelectionInspectorSummarizesWithoutLeakingMetadata() {
        let selections = [
            SeisUniversalSelection(
                kind: .domain,
                id: "graphics",
                title: "Graphics & Reality",
                subtitle: "Technology domain",
                metadata: ["repositoryPath": "/Users/private/SEIS"]
            ),
            SeisUniversalSelection(
                kind: .capability,
                id: "renderer",
                title: "renderer",
                subtitle: "Graphics & Reality",
                metadata: ["token": "secret-value"]
            )
        ]

        let inspector = SeisUniversalInspectorPresentation(selections: selections)
        let rows = inspector.sections.flatMap(\.rows)

        XCTAssertEqual(inspector.title, "2 items selected")
        XCTAssertTrue(rows.contains { $0.label == "Selection Count" && $0.value == "2" })
        XCTAssertFalse(rows.contains { $0.value.contains("/Users/") || $0.value == "secret-value" })
        XCTAssertFalse(inspector.allowsMutation)
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