import Foundation
import Testing
#if canImport(Darwin)
import Darwin
#else
import Glibc
#endif
@testable import SeisPlatformKit

struct SeisMariaRecoveryFileReaderTests {
    private func withFixture(_ body: (URL, URL) throws -> Void) throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        let fixtureData = try Data(contentsOf: root.appendingPathComponent("test/fixtures/maria-recovery-swift-v1.json"))
        let fixture = try #require(JSONSerialization.jsonObject(with: fixtureData) as? [String: Any])
        let wire = Data(try #require(fixture["wire"] as? String).utf8)
        let file = directory.appendingPathComponent("snapshot.json")
        try wire.write(to: file)
        try body(directory, file)
    }

    @Test func readsExplicitSnapshotWithoutChangingBytes() throws {
        try withFixture { _, file in
            let before = try Data(contentsOf: file)
            let snapshot = try SeisMariaRecoveryFileReader.read(file)
            #expect(snapshot.totalCandidates == 5)
            #expect(!snapshot.executionAuthorized)
            #expect(try Data(contentsOf: file) == before)
        }
    }

    @Test func rejectsNonFileAndMissingURLs() throws {
        #expect(throws: SeisMariaRecoveryError.self) {
            try SeisMariaRecoveryFileReader.read(URL(string: "https://example.invalid/snapshot.json")!)
        }
        try withFixture { directory, _ in
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryFileReader.read(directory.appendingPathComponent("missing.json")) }
        }
    }

    @Test func rejectsSymlinksDirectoriesAndFifosWithoutBlocking() throws {
        try withFixture { directory, file in
            let link = directory.appendingPathComponent("link.json")
            try FileManager.default.createSymbolicLink(at: link, withDestinationURL: file)
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryFileReader.read(link) }
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryFileReader.read(directory) }
            let fifo = directory.appendingPathComponent("pipe.json")
            #expect(mkfifo(fifo.path, 0o600) == 0)
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryFileReader.read(fifo) }
        }
    }

    @Test func enforcesSizeAndStrictDecodeWithoutRepairingFile() throws {
        try withFixture { _, file in
            for data in [Data(), Data(repeating: 32, count: 65537), Data("{bad-json".utf8), Data([0xff])] {
                try data.write(to: file)
                #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryFileReader.read(file) }
                #expect(try Data(contentsOf: file) == data)
            }
        }
    }
}
