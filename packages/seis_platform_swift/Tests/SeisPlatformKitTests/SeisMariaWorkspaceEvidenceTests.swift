import Foundation
import Testing
@testable import SeisPlatformKit

struct SeisMariaWorkspaceEvidenceTests {
    private let project = "SEIS"
    private let revision40 = "0123456789abcdef0123456789abcdef01234567"
    private let revision64 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    private let observedAt = "2026-09-11T15:00:00Z"

    private func withWorkspace<T>(_ body: (URL) throws -> T) throws -> T {
        let root = FileManager.default.temporaryDirectory
            .appendingPathComponent("seis-workspace-evidence-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }
        return try body(root)
    }

    private func writeLooseBranch(_ branch: String, revision: String? = nil, at root: URL) throws {
        let git = root.appendingPathComponent(".git", isDirectory: true)
        let heads = git.appendingPathComponent("refs/heads", isDirectory: true)
        try FileManager.default.createDirectory(at: heads, withIntermediateDirectories: true)
        try Data("ref: refs/heads/\(branch)\n".utf8)
            .write(to: git.appendingPathComponent("HEAD"))
        let ref = git.appendingPathComponent("refs/heads/\(branch)")
        try FileManager.default.createDirectory(
            at: ref.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try Data("\(revision ?? revision40)\n".utf8).write(to: ref)
    }

    @Test func directSnapshotUsesTheSameConservativeGitBranchContract() throws {
        let valid = [
            "feature/maria-native-workspace-v1",
            "özellik/maria-doğrulama",
            "feature/maria-unicode\u{00a0}",
        ]
        for branch in valid {
            let snapshot = try SeisMariaWorkspaceEvidenceSnapshot(
                project: project,
                currentBranch: branch,
                repositoryRevision: revision40,
                observedAt: observedAt
            )
            #expect(snapshot.currentBranch == branch)
            #expect(!snapshot.executionAuthorized)
        }

        let invalid = [
            "../escape",
            "@",
            "bad\u{007f}ref",
            "release.lock/hotfix",
            ".hidden",
            "feature//double",
            "feature/with space",
            "feature/question?",
            "feature/ends.",
            "feature/@{bad",
        ]
        for branch in invalid {
            #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
                try SeisMariaWorkspaceEvidenceSnapshot(
                    project: project,
                    currentBranch: branch,
                    repositoryRevision: revision40,
                    observedAt: observedAt
                )
            }
        }
    }

    @Test func capturesUnicodeLooseRefWithoutNormalizingIdentity() throws {
        try withWorkspace { root in
            let branch = "feature/maria-unicode\u{00a0}"
            try writeLooseBranch(branch, at: root)
            let snapshot = try SeisMariaWorkspaceEvidenceSource.capture(
                root,
                project: project,
                observedAt: observedAt
            )
            #expect(snapshot.currentBranch == branch)
            #expect(snapshot.repositoryRevision == revision40)
            #expect(snapshot.observedAt == observedAt)
            #expect(!snapshot.executionAuthorized)
        }
    }

    @Test func looseRefRejectsLeadingWhitespaceButKeepsGitAcceptedTrailingWhitespace() throws {
        try withWorkspace { root in
            let branch = "feature/maria-ref-whitespace"
            try writeLooseBranch(branch, at: root)
            let ref = root.appendingPathComponent(".git/refs/heads/\(branch)")

            try Data(" \(revision40)\n".utf8).write(to: ref)
            #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
                try SeisMariaWorkspaceEvidenceSource.capture(
                    root,
                    project: project,
                    observedAt: observedAt
                )
            }

            try Data("\(revision40)   \n\n".utf8).write(to: ref)
            let snapshot = try SeisMariaWorkspaceEvidenceSource.capture(
                root,
                project: project,
                observedAt: observedAt
            )
            #expect(snapshot.repositoryRevision == revision40)
        }
    }

    @Test func fallsBackToPackedRefsAndAcceptsSha256ObjectID() throws {
        try withWorkspace { root in
            let git = root.appendingPathComponent(".git", isDirectory: true)
            try FileManager.default.createDirectory(at: git, withIntermediateDirectories: true)
            let branch = "feature/maria-packed"
            try Data("ref: refs/heads/\(branch)\n".utf8)
                .write(to: git.appendingPathComponent("HEAD"))
            try Data("# pack-refs with: peeled fully-peeled\n\(revision64) refs/heads/\(branch)\n".utf8)
                .write(to: git.appendingPathComponent("packed-refs"))

            let snapshot = try SeisMariaWorkspaceEvidenceSource.capture(
                root,
                project: project,
                observedAt: observedAt
            )
            #expect(snapshot.currentBranch == branch)
            #expect(snapshot.repositoryRevision == revision64)
        }
    }

    @Test func rejectsDetachedHeadAndSymlinkedGitMetadata() throws {
        try withWorkspace { root in
            let git = root.appendingPathComponent(".git", isDirectory: true)
            try FileManager.default.createDirectory(at: git, withIntermediateDirectories: true)
            try Data("\(revision40)\n".utf8).write(to: git.appendingPathComponent("HEAD"))
            #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
                try SeisMariaWorkspaceEvidenceSource.capture(
                    root,
                    project: project,
                    observedAt: observedAt
                )
            }
        }

        try withWorkspace { root in
            let target = root.appendingPathComponent("git-target", isDirectory: true)
            try FileManager.default.createDirectory(at: target, withIntermediateDirectories: true)
            try FileManager.default.createSymbolicLink(
                at: root.appendingPathComponent(".git"),
                withDestinationURL: target
            )
            #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
                try SeisMariaWorkspaceEvidenceSource.capture(
                    root,
                    project: project,
                    observedAt: observedAt
                )
            }
        }
    }

    @Test func rejectsSymlinkedLooseRefParent() throws {
        try withWorkspace { root in
            let git = root.appendingPathComponent(".git", isDirectory: true)
            try FileManager.default.createDirectory(at: git, withIntermediateDirectories: true)
            let branch = "feature/nested/maria"
            try Data("ref: refs/heads/\(branch)\n".utf8)
                .write(to: git.appendingPathComponent("HEAD"))
            let real = root.appendingPathComponent("real-heads", isDirectory: true)
            try FileManager.default.createDirectory(
                at: real.appendingPathComponent("nested", isDirectory: true),
                withIntermediateDirectories: true
            )
            try Data("\(revision40)\n".utf8)
                .write(to: real.appendingPathComponent("nested/maria"))
            try FileManager.default.createDirectory(
                at: git.appendingPathComponent("refs", isDirectory: true),
                withIntermediateDirectories: true
            )
            try FileManager.default.createSymbolicLink(
                at: git.appendingPathComponent("refs/heads"),
                withDestinationURL: real
            )

            #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
                try SeisMariaWorkspaceEvidenceSource.capture(
                    root,
                    project: project,
                    observedAt: observedAt
                )
            }
        }
    }

    @Test func rejectsInvalidProjectRevisionAndObservationTimestamp() throws {
        #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
            try SeisMariaWorkspaceEvidenceSnapshot(
                project: " ",
                currentBranch: "feature/maria",
                repositoryRevision: revision40,
                observedAt: observedAt
            )
        }
        #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
            try SeisMariaWorkspaceEvidenceSnapshot(
                project: project,
                currentBranch: "feature/maria",
                repositoryRevision: "not-a-revision",
                observedAt: observedAt
            )
        }
        #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
            try SeisMariaWorkspaceEvidenceSnapshot(
                project: project,
                currentBranch: "feature/maria",
                repositoryRevision: revision40,
                observedAt: "not-a-time"
            )
        }
    }
}
