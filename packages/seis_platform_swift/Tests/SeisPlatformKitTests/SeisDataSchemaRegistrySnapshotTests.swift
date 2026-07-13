import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS-Data Schema Registry Snapshot")
struct SeisDataSchemaRegistrySnapshotTests {
    @Test func canonicalRegistryIsMetadataOnly() throws {
        let snapshot = try SeisDataSchemaRegistrySnapshot.validated(from: registryData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.records.count == 18)
        #expect(snapshot.laneIDs.count == 5)
        #expect(snapshot.validatedRecordCount == 16)
        #expect(snapshot.scaffoldedRecordCount == 2)
    }

    @Test func incompleteRecordIsRejected() {
        let record = SeisDataSchemaRegistryRecord(
            id: "record",
            path: "content/development/record.json",
            lane: "@seis-data",
            currentStatus: "validated",
            sourceType: "registry",
            expectedShape: "object",
            requiredTopLevelKeys: [],
            validationCommands: [],
            freshness: "review",
            secretPolicy: "must not contain secrets"
        )

        #expect(!record.isComplete)
        #expect(!record.isMetadataOnly)
    }

    private func registryData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-data-schema-registry.json"))
    }
}
