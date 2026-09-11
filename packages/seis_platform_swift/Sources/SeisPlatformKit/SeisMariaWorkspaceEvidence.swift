import Foundation
#if canImport(Darwin)
import Darwin
#else
import Glibc
#endif

/// Fixed public-safe error vocabulary for selected-workspace identity capture.
/// Errors never expose local paths, ref payloads, repository contents or credentials.
public enum SeisMariaWorkspaceEvidenceError: String, Error, Sendable {
    case invalidProject
    case invalidCurrentBranch
    case invalidRepositoryRevision
    case invalidObservedAt
    case invalidWorkspaceRoot
    case invalidGitDirectory
    case invalidWorkspaceHead
    case unsafeMetadata
    case invalidMetadataSize
    case invalidMetadataEncoding
    case missingBranchRef
    case malformedPackedRefs
    case duplicatePackedRef
    case workspaceIdentityChanged
}

/// Minimal current Git identity for one explicitly host-selected workspace.
/// This is evidence only and never grants resume or execution authority.
public struct SeisMariaWorkspaceEvidenceSnapshot: Equatable, Sendable {
    public let project: String
    public let currentBranch: String
    public let repositoryRevision: String
    public let observedAt: String

    public var executionAuthorized: Bool { false }

    public init(
        project: String,
        currentBranch: String,
        repositoryRevision: String,
        observedAt: String
    ) throws {
        guard SeisMariaWorkspaceEvidenceSource.isValidProject(project) else {
            throw SeisMariaWorkspaceEvidenceError.invalidProject
        }
        guard SeisMariaWorkspaceEvidenceSource.isSafeBranch(currentBranch) else {
            throw SeisMariaWorkspaceEvidenceError.invalidCurrentBranch
        }
        guard SeisMariaWorkspaceEvidenceSource.isRevision(repositoryRevision) else {
            throw SeisMariaWorkspaceEvidenceError.invalidRepositoryRevision
        }
        guard SeisMariaWorkspaceEvidenceSource.isObservedAt(observedAt) else {
            throw SeisMariaWorkspaceEvidenceError.invalidObservedAt
        }
        self.project = project
        self.currentBranch = currentBranch
        self.repositoryRevision = repositoryRevision.lowercased()
        self.observedAt = observedAt
    }
}

/// Reads only bounded Git identity metadata from one explicitly selected workspace.
///
/// V1 supports an ordinary `.git` directory with symbolic `HEAD`, loose refs, or
/// bounded `packed-refs`. It does not run Git, enumerate repositories, read config,
/// inspect the work tree/history/remotes, access credentials, write back, watch in
/// the background, or authorize execution. A future host/UI owns security-scoped
/// access around this synchronous source.
public enum SeisMariaWorkspaceEvidenceSource {
    public static let maximumHeadBytes = 4 * 1024
    public static let maximumRefBytes = 4 * 1024
    public static let maximumPackedRefsBytes = 256 * 1024

    public static func capture(
        _ workspaceRoot: URL,
        project: String,
        observedAt: String
    ) throws -> SeisMariaWorkspaceEvidenceSnapshot {
        guard workspaceRoot.isFileURL,
              workspaceRoot.host == nil || workspaceRoot.host == "" || workspaceRoot.host == "localhost",
              isValidProject(project),
              isObservedAt(observedAt) else {
            if !isValidProject(project) {
                throw SeisMariaWorkspaceEvidenceError.invalidProject
            }
            if !isObservedAt(observedAt) {
                throw SeisMariaWorkspaceEvidenceError.invalidObservedAt
            }
            throw SeisMariaWorkspaceEvidenceError.invalidWorkspaceRoot
        }
        try requireOrdinaryDirectory(workspaceRoot, error: .invalidWorkspaceRoot)

        let gitDirectory = workspaceRoot.appendingPathComponent(".git", isDirectory: true)
        try requireOrdinaryDirectory(gitDirectory, error: .invalidGitDirectory)

        let first = try sample(gitDirectory)
        let second = try sample(gitDirectory)
        guard first.refName == second.refName,
              scalarEqual(first.branch, second.branch),
              first.revision == second.revision else {
            throw SeisMariaWorkspaceEvidenceError.workspaceIdentityChanged
        }

        return try SeisMariaWorkspaceEvidenceSnapshot(
            project: project,
            currentBranch: second.branch,
            repositoryRevision: second.revision,
            observedAt: observedAt
        )
    }

    private struct IdentitySample {
        let refName: String
        let branch: String
        let revision: String
    }

    private static func sample(_ gitDirectory: URL) throws -> IdentitySample {
        guard let rawHead = try readRegularFile(
            gitDirectory.appendingPathComponent("HEAD"),
            maximumBytes: maximumHeadBytes,
            encoding: .utf8,
            allowMissing: false
        ) else {
            throw SeisMariaWorkspaceEvidenceError.invalidWorkspaceHead
        }
        let parsed = try parseSymbolicHead(rawHead)
        let revision = try resolveRef(gitDirectory, refName: parsed.refName)
        return IdentitySample(refName: parsed.refName, branch: parsed.branch, revision: revision)
    }

    private static func resolveRef(_ gitDirectory: URL, refName: String) throws -> String {
        if let looseURL = try looseRefURL(gitDirectory, refName: refName),
           let rawRevision = try readRegularFile(
               looseURL,
               maximumBytes: maximumRefBytes,
               encoding: .ascii,
               allowMissing: true
           ) {
            if let first = rawRevision.unicodeScalars.first,
               CharacterSet.whitespacesAndNewlines.contains(first) {
                throw SeisMariaWorkspaceEvidenceError.invalidRepositoryRevision
            }
            let revision = rawRevision.trimmingCharacters(in: .whitespacesAndNewlines)
            guard isRevision(revision) else {
                throw SeisMariaWorkspaceEvidenceError.invalidRepositoryRevision
            }
            return revision.lowercased()
        }
        return try resolvePackedRef(gitDirectory, refName: refName)
    }

    private static func looseRefURL(_ gitDirectory: URL, refName: String) throws -> URL? {
        let components = refName.split(separator: "/", omittingEmptySubsequences: false)
        guard components.count >= 3 else {
            throw SeisMariaWorkspaceEvidenceError.invalidCurrentBranch
        }
        var current = gitDirectory
        for component in components.dropLast() {
            current.appendPathComponent(String(component), isDirectory: true)
            let state = try ordinaryDirectoryState(current)
            switch state {
            case .ordinary:
                continue
            case .missing:
                return nil
            case .unsafe:
                throw SeisMariaWorkspaceEvidenceError.unsafeMetadata
            }
        }
        return current.appendingPathComponent(String(components.last!))
    }

    private static func resolvePackedRef(_ gitDirectory: URL, refName: String) throws -> String {
        guard let raw = try readRegularFile(
            gitDirectory.appendingPathComponent("packed-refs"),
            maximumBytes: maximumPackedRefsBytes,
            encoding: .utf8,
            allowMissing: true
        ) else {
            throw SeisMariaWorkspaceEvidenceError.missingBranchRef
        }

        var match: String?
        for line in raw.components(separatedBy: .newlines) {
            if line.isEmpty || line.hasPrefix("#") || line.hasPrefix("^") {
                continue
            }
            guard let separator = line.firstIndex(of: " ") else {
                throw SeisMariaWorkspaceEvidenceError.malformedPackedRefs
            }
            let revision = String(line[..<separator])
            let nameStart = line.index(after: separator)
            let name = String(line[nameStart...])
            guard !revision.isEmpty, !name.isEmpty else {
                throw SeisMariaWorkspaceEvidenceError.malformedPackedRefs
            }
            if name == refName {
                guard match == nil else {
                    throw SeisMariaWorkspaceEvidenceError.duplicatePackedRef
                }
                match = revision
            }
        }
        guard let match else {
            throw SeisMariaWorkspaceEvidenceError.missingBranchRef
        }
        guard isRevision(match) else {
            throw SeisMariaWorkspaceEvidenceError.invalidRepositoryRevision
        }
        return match.lowercased()
    }

    private static func parseSymbolicHead(_ raw: String) throws -> (refName: String, branch: String) {
        let value: String
        if raw.hasSuffix("\r\n") {
            value = String(raw.dropLast(2))
        } else if raw.hasSuffix("\n") {
            value = String(raw.dropLast())
        } else {
            value = raw
        }
        guard !value.contains("\n"), !value.contains("\r") else {
            throw SeisMariaWorkspaceEvidenceError.invalidWorkspaceHead
        }

        let prefix = "ref: refs/heads/"
        guard value.hasPrefix(prefix) else {
            throw SeisMariaWorkspaceEvidenceError.invalidWorkspaceHead
        }
        let branch = String(value.dropFirst(prefix.count))
        guard isSafeBranch(branch) else {
            throw SeisMariaWorkspaceEvidenceError.invalidCurrentBranch
        }
        return ("refs/heads/\(branch)", branch)
    }

    static func isValidProject(_ project: String) -> Bool {
        !project.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && project.unicodeScalars.count <= 512
    }

    static func isSafeBranch(_ branch: String) -> Bool {
        if branch.isEmpty
            || branch.unicodeScalars.count > 512
            || branch == "@"
            || branch.hasPrefix("/")
            || branch.hasSuffix("/")
            || branch.hasSuffix(".")
            || branch.contains("\\")
            || branch.contains("..")
            || branch.contains("@{")
            || branch.contains("//") {
            return false
        }

        let parts = branch.split(separator: "/", omittingEmptySubsequences: false)
        if parts.contains(where: { part in
            part.isEmpty
                || part == "."
                || part == ".."
                || part.hasPrefix(".")
                || part.hasSuffix(".lock")
        }) {
            return false
        }

        for scalar in branch.unicodeScalars {
            switch scalar.value {
            case 0..<32, 32, 42, 58, 63, 91, 92, 94, 126, 127:
                return false
            default:
                continue
            }
        }
        return true
    }

    static func isRevision(_ value: String) -> Bool {
        guard value.count == 40 || value.count == 64 else { return false }
        return value.unicodeScalars.allSatisfy { scalar in
            switch scalar.value {
            case 48...57, 65...70, 97...102: true
            default: false
            }
        }
    }

    static func isObservedAt(_ value: String) -> Bool {
        guard !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              value.unicodeScalars.count <= 128 else {
            return false
        }

        let wholeSeconds = ISO8601DateFormatter()
        let fractional = ISO8601DateFormatter()
        fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        // MARIA's Python ContextFact accepts ISO timestamps without an explicit
        // timezone and interprets them as UTC. Preserve the original evidence
        // string, but validate that same common form by testing an equivalent Z
        // suffix rather than silently rewriting the stored observation.
        for candidate in [value, value + "Z"] {
            if wholeSeconds.date(from: candidate) != nil
                || fractional.date(from: candidate) != nil {
                return true
            }
        }
        return false
    }

    private static func scalarEqual(_ lhs: String, _ rhs: String) -> Bool {
        lhs.unicodeScalars.elementsEqual(rhs.unicodeScalars)
    }

    private enum DirectoryState {
        case ordinary
        case missing
        case unsafe
    }

    private static func ordinaryDirectoryState(_ url: URL) throws -> DirectoryState {
        var metadata = stat()
        if lstat(url.path, &metadata) != 0 {
            if errno == ENOENT { return .missing }
            throw SeisMariaWorkspaceEvidenceError.unsafeMetadata
        }
        let type = metadata.st_mode & mode_t(S_IFMT)
        if type == mode_t(S_IFDIR) { return .ordinary }
        return .unsafe
    }

    private static func requireOrdinaryDirectory(
        _ url: URL,
        error: SeisMariaWorkspaceEvidenceError
    ) throws {
        switch try ordinaryDirectoryState(url) {
        case .ordinary:
            return
        case .missing, .unsafe:
            throw error
        }
    }

    private static func readRegularFile(
        _ url: URL,
        maximumBytes: Int,
        encoding: String.Encoding,
        allowMissing: Bool
    ) throws -> String? {
        var metadata = stat()
        if lstat(url.path, &metadata) != 0 {
            if errno == ENOENT && allowMissing { return nil }
            throw SeisMariaWorkspaceEvidenceError.unsafeMetadata
        }
        guard metadata.st_mode & mode_t(S_IFMT) == mode_t(S_IFREG) else {
            throw SeisMariaWorkspaceEvidenceError.unsafeMetadata
        }
        guard metadata.st_size > 0, metadata.st_size <= maximumBytes else {
            throw SeisMariaWorkspaceEvidenceError.invalidMetadataSize
        }

        let descriptor = open(url.path, O_RDONLY | O_NOFOLLOW | O_CLOEXEC)
        if descriptor < 0 {
            if errno == ENOENT && allowMissing { return nil }
            throw SeisMariaWorkspaceEvidenceError.unsafeMetadata
        }
        defer { _ = close(descriptor) }

        var opened = stat()
        guard fstat(descriptor, &opened) == 0,
              opened.st_mode & mode_t(S_IFMT) == mode_t(S_IFREG),
              opened.st_size > 0,
              opened.st_size <= maximumBytes else {
            throw SeisMariaWorkspaceEvidenceError.invalidMetadataSize
        }

        var bytes = Data()
        var buffer = [UInt8](repeating: 0, count: 8192)
        while bytes.count <= maximumBytes {
            let remaining = maximumBytes + 1 - bytes.count
            let count = buffer.withUnsafeMutableBytes { raw -> Int in
                #if canImport(Darwin)
                Darwin.read(descriptor, raw.baseAddress!, min(raw.count, remaining))
                #else
                Glibc.read(descriptor, raw.baseAddress!, min(raw.count, remaining))
                #endif
            }
            guard count >= 0 else {
                throw SeisMariaWorkspaceEvidenceError.unsafeMetadata
            }
            if count == 0 { break }
            bytes.append(contentsOf: buffer.prefix(count))
        }
        guard !bytes.isEmpty, bytes.count <= maximumBytes else {
            throw SeisMariaWorkspaceEvidenceError.invalidMetadataSize
        }
        guard let decoded = String(data: bytes, encoding: encoding) else {
            throw SeisMariaWorkspaceEvidenceError.invalidMetadataEncoding
        }
        return decoded
    }
}
