import Foundation

enum SeisRepositoryRootResolver {
    static func displayPath(preferredPath: String? = nil) -> String {
        preferredPath.nonEmptyValue
            ?? argumentValue(after: "--repository-root")
            ?? ProcessInfo.processInfo.environment["SEIS_REPOSITORY_ROOT"].nonEmptyValue
            ?? FileManager.default.currentDirectoryPath
    }

    static func resolve(preferredPath: String? = nil) -> String {
        candidateURLs(preferredPath: preferredPath).first(where: isSEISRepositoryRoot)?.path
            ?? preferredPath
            ?? FileManager.default.currentDirectoryPath
    }

    static func repositorySnapshotURL() -> URL? {
        let snapshotPath = argumentValue(after: "--repository-snapshot")
            ?? ProcessInfo.processInfo.environment["SEIS_REPOSITORY_SNAPSHOT"]

        guard let snapshotPath = snapshotPath.nonEmptyValue else {
            return nil
        }

        return URL(fileURLWithPath: snapshotPath)
    }

    private static func candidateURLs(preferredPath: String?) -> [URL] {
        var candidates: [URL] = []

        if let preferredPath, !preferredPath.isEmpty {
            candidates.append(URL(fileURLWithPath: preferredPath))
        }

        if let argumentPath = argumentValue(after: "--repository-root") {
            candidates.append(URL(fileURLWithPath: argumentPath))
        }

        if let environmentPath = ProcessInfo.processInfo.environment["SEIS_REPOSITORY_ROOT"],
           !environmentPath.isEmpty {
            candidates.append(URL(fileURLWithPath: environmentPath))
        }

        let currentDirectory = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        candidates.append(currentDirectory)

        let bundleURL = Bundle.main.bundleURL
        candidates.append(bundleURL.deletingLastPathComponent().deletingLastPathComponent())
        candidates.append(bundleURL.deletingLastPathComponent())

        #if os(macOS)
        let iCloudRoot = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library")
            .appendingPathComponent("Mobile Documents")
            .appendingPathComponent("com~apple~CloudDocs")
        candidates.append(iCloudRoot.appendingPathComponent("Github 2").appendingPathComponent("SEIS"))
        candidates.append(iCloudRoot.appendingPathComponent("Github").appendingPathComponent("SEIS"))
        #endif

        return uniqueURLs(candidates)
    }

    private static func argumentValue(after flag: String) -> String? {
        let arguments = CommandLine.arguments
        guard let index = arguments.firstIndex(of: flag),
              index + 1 < arguments.count else {
            return nil
        }
        return arguments[index + 1]
    }

    private static func isSEISRepositoryRoot(_ url: URL) -> Bool {
        let packageURL = url.appendingPathComponent("package.json")
        let swiftPackageURL = url.appendingPathComponent("packages/seis_platform_swift/Package.swift")
        let agentsURL = url.appendingPathComponent("AGENTS.md")

        return FileManager.default.fileExists(atPath: packageURL.path)
            && FileManager.default.fileExists(atPath: swiftPackageURL.path)
            && FileManager.default.fileExists(atPath: agentsURL.path)
    }

    private static func uniqueURLs(_ urls: [URL]) -> [URL] {
        var seenPaths: Set<String> = []
        return urls.compactMap { url in
            let path = url.standardizedFileURL.path
            guard !seenPaths.contains(path) else {
                return nil
            }
            seenPaths.insert(path)
            return URL(fileURLWithPath: path)
        }
    }
}

private extension Optional where Wrapped == String {
    var nonEmptyValue: String? {
        guard let value = self, !value.isEmpty else {
            return nil
        }
        return value
    }
}
