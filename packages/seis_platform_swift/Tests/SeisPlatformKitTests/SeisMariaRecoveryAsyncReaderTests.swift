import Foundation
import Testing
#if canImport(Darwin)
import Darwin
#else
import Glibc
#endif
@testable import SeisPlatformKit

/// Exercise the public async path against real, synthetic local files, not only
/// the internal cancellation seam. No user files or external services are read.
struct SeisMariaRecoveryAsyncReaderTests {
    private static let wire = Data(#"{"schema_version":1,"project_id":"SEIS","rows":[],"total_candidates":0,"replan_required":0,"drift_detected":0,"evidence_required":0,"anchor_missing":0,"aligned_replan_required":0,"complete":0,"execution_authorized":false}"#.utf8)

    private func withDirectory(_ body: (URL) async throws -> Void) async throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        try await body(directory)
    }

    @Test func asyncPathPreservesExactByteCeiling() async throws {
        try await withDirectory { directory in
            let file = directory.appendingPathComponent("snapshot.json")
            var bytes = Self.wire
            bytes.append(Data(repeating: 32, count: SeisMariaRecoveryDecoder.maximumBytes - bytes.count))
            try bytes.write(to: file)
            let snapshot = try await SeisMariaRecoveryFileReader.readForImport(file)
            #expect(snapshot.totalCandidates == 0)
            #expect(try Data(contentsOf: file) == bytes)
            bytes.append(32)
            try bytes.write(to: file)
            await #expect(throws: SeisMariaRecoveryError.invalidPayloadSize) {
                try await SeisMariaRecoveryFileReader.readForImport(file)
            }
            #expect(try Data(contentsOf: file) == bytes)
        }
    }

    @Test func malformedAndUnauthorizedPayloadsAreNotRepairedOrImported() async throws {
        try await withDirectory { directory in
            let file = directory.appendingPathComponent("snapshot.json")
            let valid = String(decoding: Self.wire, as: UTF8.self)
            let cases = [
                Data(), Data([0xff]), Data("{bad-json".utf8),
                Data(valid.replacingOccurrences(of: "\"execution_authorized\":false", with: "\"execution_authorized\":true").utf8),
                Data(valid.replacingOccurrences(of: "\"total_candidates\":0", with: "\"total_candidates\":1").utf8)
            ]
            for bytes in cases {
                try bytes.write(to: file)
                await #expect(throws: SeisMariaRecoveryError.self) {
                    try await SeisMariaRecoveryFileReader.readForImport(file)
                }
                #expect(try Data(contentsOf: file) == bytes)
            }
        }
    }

    @Test(.timeLimit(.minutes(1)))
    func asyncPathRejectsSymlinkDirectoryFIFOAndMissingFile() async throws {
        try await withDirectory { directory in
            let file = directory.appendingPathComponent("snapshot.json")
            try Self.wire.write(to: file)
            let link = directory.appendingPathComponent("link.json")
            try FileManager.default.createSymbolicLink(at: link, withDestinationURL: file)
            let fifo = directory.appendingPathComponent("pipe.json")
            #expect(mkfifo(fifo.path, 0o600) == 0)
            let missing = directory.appendingPathComponent("missing.json")
            for selected in [link, directory, fifo, missing] {
                await #expect(throws: SeisMariaRecoveryError.self) {
                    try await SeisMariaRecoveryFileReader.readForImport(selected)
                }
            }
            #expect(try Data(contentsOf: file) == Self.wire)
            #expect(!FileManager.default.fileExists(atPath: missing.path))
        }
    }

    @Test func rejectsNonLocalURLsBeforeCallingReadOperation() async throws {
        let called = SeisMariaRecoveryTestObservation()
        for value in ["https://example.invalid/snapshot.json", "file://remote.invalid/snapshot.json"] {
            let selected = try #require(URL(string: value))
            await #expect(throws: SeisMariaRecoveryError.unreadableFile) {
                try await SeisMariaRecoveryFileReader.readForImport(selected, operation: { _ in
                    called.record()
                    return try SeisMariaRecoveryDecoder.decode(Self.wire)
                })
            }
        }
        #expect(!called.wasRecorded)
    }

    @Test func selectedUnicodePathWorksWithoutCreatingSiblingFiles() async throws {
        try await withDirectory { directory in
            let file = directory.appendingPathComponent("Örnek kaydı – α.json")
            try Self.wire.write(to: file)
            let before = try FileManager.default.contentsOfDirectory(atPath: directory.path)
            let snapshot = try await SeisMariaRecoveryFileReader.readForImport(file)
            #expect(snapshot.projectID == "SEIS")
            #expect(!snapshot.executionAuthorized)
            #expect(try FileManager.default.contentsOfDirectory(atPath: directory.path) == before)
            #expect(try Data(contentsOf: file) == Self.wire)
        }
    }

    @Test func cancellationOfOneImportDoesNotCancelIndependentImports() async throws {
        try await withDirectory { directory in
            let file = directory.appendingPathComponent("snapshot.json")
            try Self.wire.write(to: file)
            let outcomes = try await withThrowingTaskGroup(of: Bool.self) { group in
                for index in 0..<24 {
                    group.addTask {
                        let cancelled = index.isMultiple(of: 2)
                        if cancelled { withUnsafeCurrentTask { $0?.cancel() } }
                        do {
                            let snapshot = try await SeisMariaRecoveryFileReader.readForImport(file)
                            return !cancelled && snapshot.projectID == "SEIS" && !snapshot.executionAuthorized
                        } catch is CancellationError {
                            return cancelled
                        }
                    }
                }
                var outcomes: [Bool] = []
                for try await outcome in group { outcomes.append(outcome) }
                return outcomes
            }
            #expect(outcomes.count == 24)
            #expect(outcomes.allSatisfy { $0 })
            #expect(try Data(contentsOf: file) == Self.wire)
        }
    }
}
