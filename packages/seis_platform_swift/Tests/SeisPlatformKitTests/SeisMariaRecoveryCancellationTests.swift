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

    @Test func asyncImportReadsSelectedFileWithoutWriting() async throws {
        try await withFile { file in
            let snapshot = try await SeisMariaRecoveryFileReader.readForImport(file)
            #expect(snapshot.totalCandidates == 0)
            #expect(!snapshot.executionAuthorized)
        }
    }

    @Test func alreadyCancelledImportNeverStartsItsReadOperation() async {
        let started = DispatchSemaphore(value: 0)
        let task = Task {
            withUnsafeCurrentTask { $0?.cancel() }
            return try await SeisMariaRecoveryFileReader.readForImport(
                URL(fileURLWithPath: "/not-read.json"), operation: { _ in
                    started.signal()
                    return try SeisMariaRecoveryDecoder.decode(Self.wire)
                }
            )
        }
        await #expect(throws: CancellationError.self) { try await task.value }
        #expect(started.wait(timeout: .now()) == .timedOut)
    }

    @Test(.timeLimit(.minutes(1)))
    func callerCancellationReachesWorkerAndWaitsForCleanup() async throws {
        let (started, signal) = AsyncStream<Void>.makeStream()
        let release = DispatchSemaphore(value: 0)
        let cleaned = DispatchSemaphore(value: 0)
        let cancellationObserved = DispatchSemaphore(value: 0)
        let task = Task {
            try await SeisMariaRecoveryFileReader.readForImport(
                URL(fileURLWithPath: "/not-read.json"), operation: { _ in
                    defer { cleaned.signal() }
                    signal.yield(())
                    signal.finish()
                    guard release.wait(timeout: .now() + 5) == .success else {
                        throw SeisMariaRecoveryError.unreadableFile
                    }
                    if Task.isCancelled { cancellationObserved.signal() }
                    try Task.checkCancellation()
                    return try SeisMariaRecoveryDecoder.decode(Self.wire)
                }
            )
        }
        defer { task.cancel(); release.signal() }
        for await _ in started { break }
        task.cancel()
        release.signal()
        await #expect(throws: CancellationError.self) { try await task.value }
        #expect(cancellationObserved.wait(timeout: .now()) == .success)
        #expect(cleaned.wait(timeout: .now()) == .success)
    }

    @Test(.timeLimit(.minutes(1)))
    func cancelledCallerRejectsLateSuccessFromUncooperativeWorker() async {
        let (started, signal) = AsyncStream<Void>.makeStream()
        let release = DispatchSemaphore(value: 0)
        let cleaned = DispatchSemaphore(value: 0)
        let task = Task {
            try await SeisMariaRecoveryFileReader.readForImport(
                URL(fileURLWithPath: "/not-read.json"), operation: { _ in
                    defer { cleaned.signal() }
                    signal.yield(())
                    signal.finish()
                    guard release.wait(timeout: .now() + 5) == .success else {
                        throw SeisMariaRecoveryError.unreadableFile
                    }
                    // A blocking API may finish successfully after cancellation.
                    return try SeisMariaRecoveryDecoder.decode(Self.wire)
                }
            )
        }
        defer { task.cancel(); release.signal() }
        for await _ in started { break }
        task.cancel()
        release.signal()
        await #expect(throws: CancellationError.self) { try await task.value }
        #expect(cleaned.wait(timeout: .now()) == .success)
    }

    @Test func asyncImportPreservesTypedErrorsWithoutLeakingDiagnostics() async {
        await #expect(throws: SeisMariaRecoveryError.notRegularFile) {
            try await SeisMariaRecoveryFileReader.readForImport(
                URL(fileURLWithPath: "/not-read.json"), operation: { _ in
                    throw SeisMariaRecoveryError.notRegularFile
                }
            )
        }
    }

    @Test @MainActor
    func readOperationDoesNotRunOnMainThread() async throws {
        let wasMain = DispatchSemaphore(value: 0)
        _ = try await SeisMariaRecoveryFileReader.readForImport(
            URL(fileURLWithPath: "/not-read.json"), operation: { _ in
                if Thread.isMainThread { wasMain.signal() }
                return try SeisMariaRecoveryDecoder.decode(Self.wire)
            }
        )
        #expect(wasMain.wait(timeout: .now()) == .timedOut)
    }
}
