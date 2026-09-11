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
}
