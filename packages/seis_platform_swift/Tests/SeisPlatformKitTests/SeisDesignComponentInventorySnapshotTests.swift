import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS-Design Component Inventory Snapshot")
struct SeisDesignComponentInventorySnapshotTests {
    @Test func canonicalInventoryIsMetadataOnly() throws {
        let snapshot = try SeisDesignComponentInventorySnapshot.validated(from: inventoryData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.components.count == 12)
        #expect(snapshot.surfaceIDs.count >= 4)
        #expect(snapshot.validatedComponentCount == 12)
        #expect(snapshot.selectorCount >= 12)
    }

    @Test func absoluteSourcePathIsRejected() {
        let record = SeisDesignComponentInventoryRecord(
            id: "component",
            surface: "native",
            status: "validated",
            sourceFiles: ["/private/component.swift"],
            selectors: [".component"],
            accessibility: "A complete accessibility note for the component.",
            motionPolicy: "No required animation.",
            validationCommands: ["npm run check:workspace"]
        )

        #expect(!record.isMetadataOnly)
    }

    private func inventoryData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-design-component-inventory.json"))
    }
}
