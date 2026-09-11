import Foundation
#if canImport(Darwin)
import Darwin
#else
import Glibc
#endif

/// Reads only the explicitly supplied local file. The UI owns security-scoped
/// access. No directory discovery, credentials, repair, write-back or execution.
public enum SeisMariaRecoveryFileReader {
    public static func read(_ url: URL) throws -> SeisMariaRecoverySnapshot {
        guard url.isFileURL, url.host == nil || url.host == "" || url.host == "localhost",
              !url.path.utf8.contains(0) else { throw SeisMariaRecoveryError.unreadableFile }
        // NONBLOCK prevents a selected FIFO from blocking before fstat rejects
        // it. NOFOLLOW protects the final component; this is not a filesystem sandbox.
        let fd = open(url.path, O_RDONLY | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC)
        guard fd >= 0 else { throw SeisMariaRecoveryError.unreadableFile }
        defer { _ = close(fd) }
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
            let remaining = SeisMariaRecoveryDecoder.maximumBytes + 1 - bytes.count
            let count = buffer.withUnsafeMutableBytes { raw in
                #if canImport(Darwin)
                Darwin.read(fd, raw.baseAddress!, min(raw.count, remaining))
                #else
                Glibc.read(fd, raw.baseAddress!, min(raw.count, remaining))
                #endif
            }
            guard count >= 0 else { throw SeisMariaRecoveryError.unreadableFile }
            if count == 0 { break }
            bytes.append(contentsOf: buffer.prefix(count))
        }
        return try SeisMariaRecoveryDecoder.decode(bytes)
    }
}
