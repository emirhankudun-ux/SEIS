import Foundation
import Testing
@testable import SeisPlatformKit

struct SeisMariaRecoveryCancellationTests {
    private static let wire = Data(#"{"schema_version":1,"project_id":"SEIS","rows":[],"total_candidates":0,"replan_required":0,"drift_detected":0,"evidence_required":0,"anchor_missing":0,"aligned_replan_required":0,"complete":0,"execution_authorized":false}"#.utf8)

    private func withFile(_ body: (URL) async throws -> Void) async throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        let file = directory.appendingPathComponent("snapshot.json")
        try Self.wire.write(to: file)
        try await body(file)
        #expect(try Data(contentsOf: file) == Self.wire)
    }

    @Test func ordinaryReadStillSucceedsWithoutWriting() async throws {
        try await withFile { file in
            let snapshot = try SeisMariaRecoveryFileReader.read(file)
            #expect(snapshot.projectID == "SEIS")
            #expect(snapshot.totalCandidates == 0)
            #expect(!snapshot.executionAuthorized)
        }
    }

    @Test func cancelledSynchronousReadDoesNotReturnSnapshot() async throws {
        try await withFile { file in
            let task = Task {
                withUnsafeCurrentTask { $0?.cancel() }
                return try SeisMariaRecoveryFileReader.read(file)
            }
            await #expect(throws: CancellationError.self) { try await task.value }
        }
    }

    @Test func cancellationIsCheckedBeforeOpeningMissingFile() async {
        let missing = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let task = Task {
            withUnsafeCurrentTask { $0?.cancel() }
            return try SeisMariaRecoveryFileReader.read(missing)
        }
        await #expect(throws: CancellationError.self) { try await task.value }
        #expect(!FileManager.default.fileExists(atPath: missing.path))
    }
}
