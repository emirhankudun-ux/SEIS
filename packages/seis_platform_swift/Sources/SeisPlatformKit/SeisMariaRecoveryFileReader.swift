import Foundation
#if canImport(Darwin)
import Darwin
#else
import Glibc
#endif

/// Reads only the explicitly supplied local file. No directory discovery,
/// credentials, repair, write-back or execution. Cancellation is cooperative: an
/// operating-system read already in progress cannot be forcibly interrupted here.
public enum SeisMariaRecoveryFileReader {
    /// Synchronous bounded read. The caller owns any security-scoped access.
    /// Throws CancellationError before opening and at read/decode boundaries.
    public static func read(_ url: URL) throws -> SeisMariaRecoverySnapshot {
        try Task.checkCancellation()
        try validateLocation(url)
        // NONBLOCK prevents a selected FIFO from blocking before fstat rejects
        // it. NOFOLLOW protects the final component; this is not a filesystem sandbox.
        let fd = open(url.path, O_RDONLY | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC)
        guard fd >= 0 else { throw SeisMariaRecoveryError.unreadableFile }
        defer { _ = close(fd) }
        try Task.checkCancellation()
        var metadata = stat()
        guard fstat(fd, &metadata) == 0 else { throw SeisMariaRecoveryError.unreadableFile }
        guard metadata.st_mode & mode_t(S_IFMT) == mode_t(S_IFREG) else {
            throw SeisMariaRecoveryError.notRegularFile
        }
        guard metadata.st_size > 0, metadata.st_size <= SeisMariaRecoveryDecoder.maximumBytes else {
            throw SeisMariaRecoveryError.invalidPayloadSize
        }
        var bytes = Data()
        var buffer = [UInt8](repeating: 0, count: 8192)
        while bytes.count <= SeisMariaRecoveryDecoder.maximumBytes {
            try Task.checkCancellation()
            let remaining = SeisMariaRecoveryDecoder.maximumBytes + 1 - bytes.count
            let count = buffer.withUnsafeMutableBytes { raw in
                #if canImport(Darwin)
                Darwin.read(fd, raw.baseAddress!, min(raw.count, remaining))
                #else
                Glibc.read(fd, raw.baseAddress!, min(raw.count, remaining))
                #endif
            }
            try Task.checkCancellation()
            guard count >= 0 else { throw SeisMariaRecoveryError.unreadableFile }
            if count == 0 { break }
            bytes.append(contentsOf: buffer.prefix(count))
        }
        try Task.checkCancellation()
        let snapshot = try SeisMariaRecoveryDecoder.decode(bytes)
        try Task.checkCancellation()
        return snapshot
    }

    /// Off-main import with a structured child task. Cancellation reaches the
    /// child; the caller does not finish until the child has released resources.
    public static func readForImport(_ url: URL) async throws -> SeisMariaRecoverySnapshot {
        try await readForImport(url, operation: { selectedURL in
            #if canImport(Darwin)
            let scoped = selectedURL.startAccessingSecurityScopedResource()
            defer { if scoped { selectedURL.stopAccessingSecurityScopedResource() } }
            #endif
            return try read(selectedURL)
        })
    }

    // Internal synchronous-operation seam for deterministic cancellation tests.
    // Public callers cannot inject an operation or expand selected-file access.
    static func readForImport(
        _ url: URL,
        operation: @escaping @Sendable (URL) throws -> SeisMariaRecoverySnapshot
    ) async throws -> SeisMariaRecoverySnapshot {
        try Task.checkCancellation()
        try validateLocation(url)
        return try await withThrowingTaskGroup(of: SeisMariaRecoverySnapshot.self) { group in
            group.addTask {
                try Task.checkCancellation()
                return try operation(url)
            }
            guard let snapshot = try await group.next() else {
                throw SeisMariaRecoveryError.unreadableFile
            }
            // Even a synchronous API that ignores cancellation must not publish
            // a late successful result to a cancelled importing task.
            try Task.checkCancellation()
            return snapshot
        }
    }

    private static func validateLocation(_ url: URL) throws {
        guard url.isFileURL, url.host == nil || url.host == "" || url.host == "localhost",
              !url.path.utf8.contains(0) else { throw SeisMariaRecoveryError.unreadableFile }
    }
}
