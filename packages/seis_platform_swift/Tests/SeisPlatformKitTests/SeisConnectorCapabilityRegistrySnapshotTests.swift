import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Connector Capability Registry Snapshot")
struct SeisConnectorCapabilityRegistrySnapshotTests {
    @Test func canonicalRegistryIsMetadataOnlyAndCountsAreSourceBacked() throws {
        let snapshot = try SeisConnectorCapabilityRegistrySnapshot.validated(from: sourceData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.connectorCount == 21)
        #expect(snapshot.skillCount == 50)
        #expect(snapshot.capabilityFamilyCount == 7)
        #expect(snapshot.automationRules.count == 5)
        #expect(snapshot.readyConnectorCount == 1)
        #expect(snapshot.registryReadyConnectorCount == 3)
        #expect(snapshot.policy.secretHandling == "never_commit_tokens")
        #expect(snapshot.ecosystemActivation.defaultMode == "registry-first")
        #expect(snapshot.ecosystemActivation.blockedByDefault.count == 5)
    }

    @Test func unsafeActivationModeIsRejected() throws {
        var root = try #require(JSONSerialization.jsonObject(with: sourceData()) as? [String: Any])
        root["mode"] = "blanket-live-access"

        #expect(throws: SeisConnectorCapabilityRegistrySnapshotError.self) {
            try SeisConnectorCapabilityRegistrySnapshot.validated(from: JSONSerialization.data(withJSONObject: root))
        }
    }

    @Test func connectorWithoutScopeBlockersIsRejected() throws {
        var root = try #require(JSONSerialization.jsonObject(with: sourceData()) as? [String: Any])
        var connectors = try #require(root["connectors"] as? [[String: Any]])
        connectors[0]["blockedWithout"] = []
        root["connectors"] = connectors

        #expect(throws: SeisConnectorCapabilityRegistrySnapshotError.self) {
            try SeisConnectorCapabilityRegistrySnapshot.validated(from: JSONSerialization.data(withJSONObject: root))
        }
    }

    private func sourceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/connector-capability-registry.json"))
    }
}
