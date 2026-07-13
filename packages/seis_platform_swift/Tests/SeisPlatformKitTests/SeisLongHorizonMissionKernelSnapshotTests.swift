import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Long-Horizon Mission Kernel Snapshot")
struct SeisLongHorizonMissionKernelSnapshotTests {
    @Test func canonicalKernelIsMetadataOnly() throws {
        let snapshot = try SeisLongHorizonMissionKernelSnapshot.validated(from: kernelData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.duration.weeks == 52)
        #expect(snapshot.summary.waveCount == 12)
        #expect(snapshot.summary.missionCount == 120)
        #expect(snapshot.summary.domainCoverageCount == 38)
        #expect(snapshot.summary.languageCoverageCount == 35)
        #expect(snapshot.firstMissions.count == 3)
    }

    @Test func runtimeInstallPolicyStaysBounded() throws {
        let snapshot = try SeisLongHorizonMissionKernelSnapshot.validated(from: kernelData())

        #expect(snapshot.installPolicy.default == "do_not_install_new_runtime_for_language_percentage")
        #expect(snapshot.missions.allSatisfy { $0.status == "planned" })
        #expect(snapshot.missions.allSatisfy { !$0.dependencies.contains("runtime-install") })
    }

    private func kernelData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-long-horizon-missions.json"))
    }
}
