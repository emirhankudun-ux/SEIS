import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Apple Local Workspace Index")
struct SeisAppleLocalWorkspaceIndexTests {
    @Test func scanKeepsAllowlistedMetadataAndExcludesSensitiveOrBuildPaths() throws {
        let root = try makeFixture()
        defer { try? FileManager.default.removeItem(at: root) }

        let index = SeisAppleLocalWorkspaceIndex.scan(rootURL: root)

        #expect(index.state == .ready)
        #expect(index.entries.contains { $0.relativePath == "README.md" })
        #expect(index.entries.contains { $0.relativePath == "apps/seis-core" })
        #expect(index.entries.contains { $0.relativePath == "apps/seis-core/index.html" })
        #expect(index.entries.contains { $0.relativePath == "docs" })
        #expect(index.entries.contains { $0.relativePath == "packages/seis_platform_swift" })
        #expect(index.entries.allSatisfy { !$0.relativePath.contains(".env") })
        #expect(index.entries.allSatisfy { !$0.relativePath.contains("node_modules") })
        #expect(index.entries.allSatisfy { !$0.relativePath.contains("credentials") })
    }

    @Test func scanIsDeterministicAndBounded() throws {
        let root = try makeFixture()
        defer { try? FileManager.default.removeItem(at: root) }

        let index = SeisAppleLocalWorkspaceIndex.scan(rootURL: root, maximumEntries: 2)

        #expect(index.entries.count == 2)
        #expect(index.state == .limited)
        #expect(index.entries.map(\.relativePath) == index.entries.map(\.relativePath).sorted())
    }

    @Test func missingRootIsExplicitAndEmpty() {
        let root = URL(fileURLWithPath: "/tmp/seis-local-workspace-index-missing-(UUID().uuidString)")
        let index = SeisAppleLocalWorkspaceIndex.scan(rootURL: root)

        #expect(index.state == .rootMissing)
        #expect(index.entries.isEmpty)
    }

    private func makeFixture() throws -> URL {
        let root = FileManager.default.temporaryDirectory
            .appendingPathComponent("seis-local-workspace-index-(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        try Data("README".utf8).write(to: root.appendingPathComponent("README.md"))
        try Data("SECRET".utf8).write(to: root.appendingPathComponent(".env"))
        try Data("KEY".utf8).write(to: root.appendingPathComponent("credentials.local.json"))

        for path in [
            "apps/seis-core",
            "apps/seis-core/node_modules/ignored",
            "docs",
            "packages/seis_platform_swift",
            "node_modules/ignored"
        ] {
            try FileManager.default.createDirectory(
                at: root.appendingPathComponent(path),
                withIntermediateDirectories: true
            )
        }
        try Data("index".utf8).write(to: root.appendingPathComponent("apps/seis-core/index.html"))
        return root
    }
}
