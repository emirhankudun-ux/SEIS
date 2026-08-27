import Foundation

public enum SeisAppleNativeShellRoute: String, CaseIterable, Codable, Sendable {
    case demo
    case platform
    case technologyCenter = "technology-center"
    case universalWorkspace = "universal-workspace"

    public static let defaultRoute: Self = .demo

    public var title: String {
        switch self {
        case .demo: return "Demo"
        case .platform: return "Platform"
        case .technologyCenter: return "Technology Center"
        case .universalWorkspace: return "Universal Workspace"
        }
    }

    public var symbolName: String {
        switch self {
        case .demo: return "sparkles"
        case .platform: return "square.stack.3d.up"
        case .technologyCenter: return "cpu"
        case .universalWorkspace: return "rectangle.split.3x1"
        }
    }
}

public enum SeisUniversalSelectionKind: String, Codable, Sendable {
    case domain
    case capability
    case tool
    case workbench
    case engine
    case system
}

public struct SeisUniversalSelection: Equatable, Sendable {
    public let kind: SeisUniversalSelectionKind
    public let id: String
    public let title: String
    public let subtitle: String
    public let metadata: [String: String]

    public init(
        kind: SeisUniversalSelectionKind,
        id: String,
        title: String,
        subtitle: String,
        metadata: [String: String] = [:]
    ) {
        self.kind = kind
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.metadata = metadata
    }
}

public struct SeisUniversalInspectorRow: Equatable, Sendable, Identifiable {
    public let label: String
    public let value: String

    public var id: String { label }

    public init(label: String, value: String) {
        self.label = label
        self.value = value
    }
}

public struct SeisUniversalInspectorSection: Equatable, Sendable, Identifiable {
    public let title: String
    public let rows: [SeisUniversalInspectorRow]

    public var id: String { title }

    public init(title: String, rows: [SeisUniversalInspectorRow]) {
        self.title = title
        self.rows = rows
    }
}

public struct SeisUniversalInspectorPresentation: Equatable, Sendable {
    public let title: String
    public let subtitle: String
    public let sections: [SeisUniversalInspectorSection]
    public let allowsMutation: Bool

    public init(selection: SeisUniversalSelection?) {
        guard let selection else {
            self.title = "Nothing selected"
            self.subtitle = "Select an item in the Universal Viewport to inspect it."
            self.sections = []
            self.allowsMutation = false
            return
        }

        self.title = selection.title
        self.subtitle = selection.subtitle
        self.allowsMutation = false

        let identityRows = [
            SeisUniversalInspectorRow(label: "Kind", value: selection.kind.rawValue),
            SeisUniversalInspectorRow(label: "Identifier", value: selection.id)
        ]

        var metadataRows: [SeisUniversalInspectorRow] = []
        var safetyRows: [SeisUniversalInspectorRow] = []

        for key in selection.metadata.keys.sorted() {
            let value = selection.metadata[key] ?? ""
            let row = SeisUniversalInspectorRow(
                label: Self.displayLabel(for: key),
                value: Self.safeValue(value, for: key)
            )

            if Self.isSafetyKey(key) {
                safetyRows.append(row)
            } else {
                metadataRows.append(row)
            }
        }

        self.sections = [
            SeisUniversalInspectorSection(title: "Identity", rows: identityRows),
            SeisUniversalInspectorSection(title: "Metadata", rows: metadataRows),
            SeisUniversalInspectorSection(title: "Safety", rows: safetyRows)
        ]
    }

    private static func isSafetyKey(_ key: String) -> Bool {
        let normalized = key.lowercased()
        return normalized == "network"
            || normalized == "write"
            || normalized == "externalwrite"
            || normalized == "filesystem"
            || normalized == "secrets"
            || normalized.contains("permission")
    }

    private static func safeValue(_ value: String, for key: String) -> String {
        let normalizedKey = key.lowercased()
        let sensitiveKeyFragments = ["token", "secret", "password", "credential", "repositorypath", "filepath"]
        if sensitiveKeyFragments.contains(where: normalizedKey.contains) {
            return "[redacted]"
        }

        if value.contains("/Users/") || value.contains("\\Users\\") {
            return "[redacted]"
        }

        return value
    }

    private static func displayLabel(for key: String) -> String {
        var result = ""
        for character in key {
            if character.isUppercase, !result.isEmpty {
                result.append(" ")
            }
            result.append(character)
        }
        return result
            .replacingOccurrences(of: "_", with: " ")
            .replacingOccurrences(of: "-", with: " ")
            .split(separator: " ")
            .map { $0.prefix(1).uppercased() + $0.dropFirst() }
            .joined(separator: " ")
    }
}
