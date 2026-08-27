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
}
