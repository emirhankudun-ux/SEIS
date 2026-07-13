import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Requested Software Stack Snapshot")
struct SeisRequestedSoftwareStackSnapshotTests {
    @Test func requiredStackAndSubmittedPluginCountsRemainSourceBacked() throws {
        let snapshot = try SeisRequestedSoftwareStackSnapshot.validated(from: stackData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.requiredStack == ["javascript", "nodejs", "mysql", "react", "expressjs", "typescript"])
        #expect(snapshot.requestedTechnologyCount == 6)
        #expect(snapshot.summary.entrypointCount == 10)
        #expect(snapshot.uniqueSubmittedPluginCount == 300)
        #expect(snapshot.capabilityLaneCount == 12)
        #expect(snapshot.summary.polyglotLanguageSurfaces == 117)
    }

    @Test func pluginActivationRemainsScopedAndCredentialFree() throws {
        let snapshot = try SeisRequestedSoftwareStackSnapshot.validated(from: stackData())

        #expect(snapshot.technologies.allSatisfy { $0.activationPolicy == "activate_only_when_relevant_authenticated_scoped_and_user_approved" })
        #expect(snapshot.technologies.flatMap(\.supportingPluginUris).allSatisfy { $0.hasPrefix("plugin://") })
        #expect(snapshot.governance.contains(where: { $0.contains("not blanket connector activation") }))
        #expect(snapshot.governance.contains(where: { $0.contains("credentials and live connector tokens") }))
    }

    private func stackData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/requested-software-stack.json"))
    }
}
