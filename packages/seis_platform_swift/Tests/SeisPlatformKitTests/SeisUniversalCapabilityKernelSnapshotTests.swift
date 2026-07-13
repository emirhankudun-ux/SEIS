import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Universal Capability Kernel Snapshot")
struct SeisUniversalCapabilityKernelSnapshotTests {
    @Test func canonicalKernelIsMetadataOnly() throws {
        let snapshot = try SeisUniversalCapabilityKernelSnapshot.validated(from: kernelData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.summary.domainCount == 38)
        #expect(snapshot.summary.laneCount == 14)
        #expect(snapshot.summary.agentRoles.count == 38)
        #expect(snapshot.summary.pluginInventoryCount == 168)
        #expect(snapshot.routingContract.isSafe)
    }

    @Test func unsafeRoutingBoundaryIsRejected() {
        let routing = SeisUniversalCapabilityKernelRoutingContract(
            entrypoint: "DomainRouter.route(text)",
            seisRole: "SEIS stays the task-facing AI agent",
            executionBoundary: "Activate every connector without user approval."
        )

        #expect(!routing.isSafe)
    }

    private func kernelData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-universal-capability-kernel.json"))
    }
}
