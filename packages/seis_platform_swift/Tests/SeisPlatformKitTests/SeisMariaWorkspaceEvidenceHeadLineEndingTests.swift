import Foundation
import Testing
@testable import SeisPlatformKit

struct SeisMariaWorkspaceEvidenceHeadLineEndingTests {
    private let selectedRevision = String(repeating: "a", count: 40)
    private let otherRevision = String(repeating: "b", count: 40)
    private let observedAt = "2026-09-11T16:00:00Z"

    private func withWorkspace(_ body: (URL) throws -> Void) throws {
        let root = FileManager.default.temporaryDirectory
            .appendingPathComponent("seis-head-line-ending-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }
        try body(root)
    }

    private func writeRef(_ branch: String, revision: String, at root: URL) throws {
        let ref = root.appendingPathComponent(".git/refs/heads/\(branch)")
        try FileManager.default.createDirectory(
            at: ref.deletingLastPathComponent(), withIntermediateDirectories: true
        )
        try Data("\(revision)\n".utf8).write(to: ref)
    }

    private func capture(_ root: URL, head: String) throws -> SeisMariaWorkspaceEvidenceSnapshot {
        try Data(head.utf8).write(to: root.appendingPathComponent(".git/HEAD"))
        return try SeisMariaWorkspaceEvidenceSource.capture(
            root, project: "SEIS", observedAt: observedAt
        )
    }

    @Test func crlfHeadCannotAliasAnExistingShorterBranch() throws {
        try withWorkspace { root in
            let branch = "feature/maria"
            try writeRef(branch, revision: selectedRevision, at: root)
            try writeRef("feature/mari", revision: otherRevision, at: root)
            let snapshot = try capture(root, head: "ref: refs/heads/\(branch)\r\n")
            #expect(snapshot.currentBranch.unicodeScalars.elementsEqual(branch.unicodeScalars))
            #expect(snapshot.repositoryRevision == selectedRevision)
            #expect(!snapshot.executionAuthorized)
        }
    }

    @Test func lfAndUnterminatedHeadRemainExact() throws {
        try withWorkspace { root in
            let branch = "feature/maria"
            try writeRef(branch, revision: selectedRevision, at: root)
            for ending in ["", "\n"] {
                let snapshot = try capture(root, head: "ref: refs/heads/\(branch)\(ending)")
                #expect(snapshot.currentBranch.unicodeScalars.elementsEqual(branch.unicodeScalars))
                #expect(snapshot.repositoryRevision == selectedRevision)
                #expect(!snapshot.executionAuthorized)
            }
        }
    }

    @Test func crlfHeadPreservesTheEntireFinalUnicodeCharacter() throws {
        for branch in ["feature/cafe\u{0301}", "feature/maria\u{00a0}", "feature/maria🧑🏽‍💻", "a"] {
            try withWorkspace { root in
                try writeRef(branch, revision: selectedRevision, at: root)
                let snapshot = try capture(root, head: "ref: refs/heads/\(branch)\r\n")
                #expect(snapshot.currentBranch.unicodeScalars.elementsEqual(branch.unicodeScalars))
                #expect(snapshot.repositoryRevision == selectedRevision)
                #expect(snapshot.observedAt == observedAt)
                #expect(!snapshot.executionAuthorized)
            }
        }
    }

    @Test func extraHeadLineEndingsFailClosed() throws {
        try withWorkspace { root in
            let branch = "feature/maria"
            try writeRef(branch, revision: selectedRevision, at: root)
            for ending in ["\r", "\n\n", "\r\n\r\n", "\r\n\n", "\nref: refs/heads/other\n"] {
                #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
                    try capture(root, head: "ref: refs/heads/\(branch)\(ending)")
                }
            }
        }
    }

    @Test func crlfHeadCannotRepairAnInvalidFinalBranchCharacter() throws {
        try withWorkspace { root in
            for (invalid, shorter) in [
                ("feature/maria.", "feature/maria"),
                ("feature/maria?", "feature/maria"),
                ("feature/maria:", "feature/maria"),
                ("feature/maria*", "feature/maria"),
                ("feature/maria[", "feature/maria"),
                ("feature/maria\\", "feature/maria"),
                ("feature/maria ", "feature/maria"),
                ("feature/maria\u{007f}", "feature/maria"),
                ("feature/maria.lock", "feature/maria.loc"),
            ] {
                try writeRef(shorter, revision: otherRevision, at: root)
                for ending in ["\n", "\r\n"] {
                    #expect(throws: SeisMariaWorkspaceEvidenceError.invalidCurrentBranch) {
                        try capture(root, head: "ref: refs/heads/\(invalid)\(ending)")
                    }
                }
            }
        }
    }

    @Test func crlfHeadResolvesPackedRefWithoutChangingMetadata() throws {
        try withWorkspace { root in
            let git = root.appendingPathComponent(".git", isDirectory: true)
            try FileManager.default.createDirectory(at: git, withIntermediateDirectories: true)
            let branch = "feature/maria"
            let headURL = git.appendingPathComponent("HEAD")
            let packedURL = git.appendingPathComponent("packed-refs")
            let headBytes = Data("ref: refs/heads/\(branch)\r\n".utf8)
            let packedBytes = Data((
                "# pack-refs with: peeled fully-peeled sorted \n" +
                "\(otherRevision) refs/heads/feature/mari\n" +
                "\(selectedRevision) refs/heads/\(branch)\n"
            ).utf8)
            try headBytes.write(to: headURL)
            try packedBytes.write(to: packedURL)
            let entries = try FileManager.default.contentsOfDirectory(atPath: git.path).sorted()

            let snapshot = try SeisMariaWorkspaceEvidenceSource.capture(
                root, project: "SEIS", observedAt: observedAt
            )

            #expect(snapshot.currentBranch.unicodeScalars.elementsEqual(branch.unicodeScalars))
            #expect(snapshot.repositoryRevision == selectedRevision)
            #expect(!snapshot.executionAuthorized)
            #expect(try Data(contentsOf: headURL) == headBytes)
            #expect(try Data(contentsOf: packedURL) == packedBytes)
            #expect(try FileManager.default.contentsOfDirectory(atPath: git.path).sorted() == entries)
        }
    }
}
