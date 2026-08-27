import Foundation

public enum SeisFullTechnologyRepositoryLoaderError: Error, Equatable, Sendable {
    case registryNotFound(startingAt: String, relativePath: String)
    case registryUnreadable(path: String)
    case registryInvalid(path: String)
}

public struct SeisFullTechnologyRepositoryLoader: Sendable {
    public static let registryRelativePath = "content/development/seis-full-technology-registry.json"

    public init() {}

    public func loadCatalog(startingAt startingURL: URL) throws -> SeisFullTechnologyCatalog {
        let normalizedStart = normalizedDirectory(for: startingURL)
        var candidateRoot = normalizedStart

        while true {
            let registryURL = candidateRoot
                .appendingPathComponent(Self.registryRelativePath, isDirectory: false)

            if FileManager.default.isReadableFile(atPath: registryURL.path) {
                let data: Data
                do {
                    data = try Data(contentsOf: registryURL, options: [.mappedIfSafe])
                } catch {
                    throw SeisFullTechnologyRepositoryLoaderError.registryUnreadable(
                        path: registryURL.standardizedFileURL.path
                    )
                }

                let registry: SeisFullTechnologyRegistry
                do {
                    registry = try JSONDecoder().decode(
                        SeisFullTechnologyRegistry.self,
                        from: data
                    )
                } catch {
                    throw SeisFullTechnologyRepositoryLoaderError.registryInvalid(
                        path: registryURL.standardizedFileURL.path
                    )
                }

                return try SeisFullTechnologyCatalog(validating: registry)
            }

            let parent = candidateRoot.deletingLastPathComponent().standardizedFileURL
            if parent.path == candidateRoot.path {
                throw SeisFullTechnologyRepositoryLoaderError.registryNotFound(
                    startingAt: normalizedStart.path,
                    relativePath: Self.registryRelativePath
                )
            }
            candidateRoot = parent
        }
    }

    private func normalizedDirectory(for startingURL: URL) -> URL {
        let normalized = startingURL.standardizedFileURL
        var isDirectory: ObjCBool = false

        if FileManager.default.fileExists(
            atPath: normalized.path,
            isDirectory: &isDirectory
        ), isDirectory.boolValue {
            return normalized
        }

        return normalized.deletingLastPathComponent().standardizedFileURL
    }
}
