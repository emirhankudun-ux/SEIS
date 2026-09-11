import Foundation
import Testing
@testable import SeisPlatformKit

struct SeisMariaWorkspaceEvidencePackedRefUnicodeTests {
    private let project = "SEIS"
    private let revision = "0123456789abcdef0123456789abcdef01234567"
    private let observedAt = "2026-09-11T18:55:00+03:00"

    private func capturePacked(_ branch: String) throws -> SeisMariaWorkspaceEvidenceSnapshot {
        let root = FileManager.default.temporaryDirectory
            .appendingPathComponent("seis-packed-unicode-\(UUID().uuidString)", isDirectory: true)
        let git = root.appendingPathComponent(".git", isDirectory: true)
        try FileManager.default.createDirectory(at: git, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }

        try Data("ref: refs/heads/\(branch)\n".utf8)
            .write(to: git.appendingPathComponent("HEAD"))
        try Data(
            (
                "# pack-refs with: peeled fully-peeled sorted \n" +
                "\(revision) refs/heads/\(branch)\n"
            ).utf8
        ).write(to: git.appendingPathComponent("packed-refs"))

        return try SeisMariaWorkspaceEvidenceSource.capture(
            root,
            project: project,
            observedAt: observedAt
        )
    }

    @Test func unicodeBranchSurvivesPackedRefFallback() throws {
        let branch = "özellik/maria-doğrulama"
        let snapshot = try capturePacked(branch)
        #expect(snapshot.currentBranch == branch)
        #expect(snapshot.repositoryRevision == revision)
        #expect(!snapshot.executionAuthorized)
    }

    @Test func gitValidUnicodeLineSeparatorIsNotARecordBoundary() throws {
        // Git accepts U+2028 inside a ref name. CharacterSet.newlines treats it
        // as a separator, so packed metadata must split on ASCII LF/CRLF only.
        let branch = "feature/maria-\u{2028}-identity"
        let snapshot = try capturePacked(branch)
        #expect(snapshot.currentBranch == branch)
        #expect(snapshot.repositoryRevision == revision)
        #expect(!snapshot.executionAuthorized)
    }
}
