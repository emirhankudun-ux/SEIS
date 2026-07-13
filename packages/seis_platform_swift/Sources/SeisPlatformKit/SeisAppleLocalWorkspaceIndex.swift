import Foundation

public enum SeisAppleLocalWorkspaceEntryKind: String, Codable, Equatable, Sendable {
    case file
    case directory
}

public enum SeisAppleLocalWorkspaceScanState: String, Codable, Equatable, Sendable {
    case ready
    case empty
    case limited
    case rootMissing = "root-missing"
}

public struct SeisAppleLocalWorkspaceEntry: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let relativePath: String
    public let kind: SeisAppleLocalWorkspaceEntryKind
    public let byteCount: Int64

    public init(
        id: String,
        relativePath: String,
        kind: SeisAppleLocalWorkspaceEntryKind,
        byteCount: Int64
    ) {
        self.id = id
        self.relativePath = relativePath
        self.kind = kind
        self.byteCount = byteCount
    }
}

public struct SeisAppleLocalWorkspaceIndex: Codable, Equatable, Sendable {
    public static let allowedRootNames = [
        "README.md",
        "AGENTS.md",
        "ARCHITECTURE.md",
        "ROADMAP.md",
        "SECURITY.md",
        "apps",
        "content",
        "docs",
        "packages"
    ]

    public static let defaultMaximumEntries = 200

    public let rootPath: String
    public let entries: [SeisAppleLocalWorkspaceEntry]
    public let state: SeisAppleLocalWorkspaceScanState
    public let excludedCategories: [String]

    public init(
        rootPath: String,
        entries: [SeisAppleLocalWorkspaceEntry],
        state: SeisAppleLocalWorkspaceScanState,
        excludedCategories: [String] = [
            "secrets",
            "credentials",
            "environment files",
            "hidden directories",
            "symbolic links",
            "node_modules and build output"
        ]
    ) {
        self.rootPath = rootPath
        self.entries = entries
        self.state = state
        self.excludedCategories = excludedCategories
    }

    public static func scan(
        rootURL: URL,
        maximumEntries: Int = defaultMaximumEntries,
        fileManager: FileManager = .default
    ) -> SeisAppleLocalWorkspaceIndex {
        let root = rootURL.standardizedFileURL
        guard fileManager.fileExists(atPath: root.path) else {
            return SeisAppleLocalWorkspaceIndex(rootPath: root.path, entries: [], state: .rootMissing)
        }

        let boundedMaximum = max(1, min(maximumEntries, 1_000))
        let rootComponents = root.pathComponents
        var entries: [SeisAppleLocalWorkspaceEntry] = []
        var reachedLimit = false
        let keys: [URLResourceKey] = [.isDirectoryKey, .isSymbolicLinkKey, .fileSizeKey]
        let options: FileManager.DirectoryEnumerationOptions = [.skipsHiddenFiles, .skipsPackageDescendants]

        guard let enumerator = fileManager.enumerator(
            at: root,
            includingPropertiesForKeys: keys,
            options: options
        ) else {
            return SeisAppleLocalWorkspaceIndex(rootPath: root.path, entries: [], state: .empty)
        }

        for case let url as URL in enumerator {
            let relativeComponents = Array(url.standardizedFileURL.pathComponents.dropFirst(rootComponents.count))
            guard let firstComponent = relativeComponents.first,
                  allowedRootNames.contains(firstComponent)
            else {
                enumerator.skipDescendants()
                continue
            }

            if relativeComponents.contains(where: excludedDirectoryName) {
                enumerator.skipDescendants()
                continue
            }

            guard let values = try? url.resourceValues(forKeys: Set(keys)),
                  values.isSymbolicLink != true
            else {
                enumerator.skipDescendants()
                continue
            }

            let relativePath = relativeComponents.joined(separator: "/")
            guard !containsSensitiveName(relativePath) else {
                if values.isDirectory == true { enumerator.skipDescendants() }
                continue
            }

            let kind: SeisAppleLocalWorkspaceEntryKind = values.isDirectory == true ? .directory : .file
            let byteCount = Int64(values.fileSize ?? 0)
            entries.append(
                SeisAppleLocalWorkspaceEntry(
                    id: relativePath,
                    relativePath: relativePath,
                    kind: kind,
                    byteCount: max(0, byteCount)
                )
            )

            if entries.count >= boundedMaximum {
                reachedLimit = true
                break
            }
        }

        entries.sort { lhs, rhs in
            let left = lhs.relativePath.localizedStandardCompare(rhs.relativePath)
            if left != .orderedSame { return left == .orderedAscending }
            return lhs.kind.rawValue < rhs.kind.rawValue
        }

        let state: SeisAppleLocalWorkspaceScanState
        if entries.isEmpty {
            state = .empty
        } else if reachedLimit {
            state = .limited
        } else {
            state = .ready
        }
        return SeisAppleLocalWorkspaceIndex(rootPath: root.path, entries: entries, state: state)
    }

    private static func excludedDirectoryName(_ name: String) -> Bool {
        [".git", "node_modules", "build", "dist", ".build", ".next", ".turbo", ".cache"].contains(name)
    }

    private static func containsSensitiveName(_ path: String) -> Bool {
        let lowercased = path.lowercased()
        let components = lowercased.split(separator: "/").map(String.init)
        return components.contains { component in
            component == ".env" || component.hasPrefix(".env.") ||
            component.contains("credential") || component.contains("secret") ||
            component.hasSuffix(".pem") || component.hasSuffix(".key") ||
            component.hasSuffix(".p12") || component.hasSuffix(".pfx")
        }
    }
}
