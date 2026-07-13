import Foundation

public struct SeisRequestedSoftwareStackSourceReference: Codable, Equatable, Sendable {
    public let submittedPluginInventory: String
    public let pluginCapabilityLanes: String
    public let polyglotManifest: String
}

public struct SeisRequestedSoftwareStackSummary: Codable, Equatable, Sendable {
    public let technologyCount: Int
    public let entrypointCount: Int
    public let uniqueSubmittedPlugins: Int
    public let capabilityLaneCount: Int
    public let polyglotLanguageSurfaces: Int
    public let missingEntrypoints: [String]
}

public struct SeisRequestedSoftwareTechnology: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let runtimeRole: String
    public let primaryLane: String
    public let entrypoints: [String]
    public let supportingPlugins: [String]
    public let activationPolicy: String
    public let supportingPluginUris: [String]
    public let supportingPluginLanes: [String]
}

public enum SeisRequestedSoftwareStackSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisRequestedSoftwareStackSnapshot: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let generatedAt: String
    public let mode: String
    public let sourceReferences: SeisRequestedSoftwareStackSourceReference
    public let activationPolicy: String
    public let summary: SeisRequestedSoftwareStackSummary
    public let requiredStack: [String]
    public let technologies: [SeisRequestedSoftwareTechnology]
    public let entrypoints: [String]
    public let governance: [String]

    public static func validated(from data: Data) throws -> SeisRequestedSoftwareStackSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisRequestedSoftwareStackSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisRequestedSoftwareStackSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let expectedStack = ["javascript", "nodejs", "mysql", "react", "expressjs", "typescript"]
        let technologyIDs = technologies.map(\.id)
        let declaredEntrypoints = technologies.flatMap(\.entrypoints)
        if version != 1 || id != "seis-requested-software-stack" || generatedAt.isEmpty || mode != "source_visible_fullstack_polyglot_governance" {
            issues.append("requested software stack identity or mode is invalid")
        }
        if sourceReferences.submittedPluginInventory != "content/development/requested-plugin-inventory.json" ||
            sourceReferences.pluginCapabilityLanes != "content/development/plugin-capability-lanes.json" ||
            sourceReferences.polyglotManifest != "polyglot/manifest.json" {
            issues.append("requested software stack source references are invalid")
        }
        if activationPolicy != "activate_only_when_relevant_authenticated_scoped_and_user_approved" ||
            summary.technologyCount != 6 ||
            summary.entrypointCount != 10 ||
            summary.uniqueSubmittedPlugins != 300 ||
            summary.capabilityLaneCount != 12 ||
            summary.polyglotLanguageSurfaces != 117 ||
            !summary.missingEntrypoints.isEmpty ||
            requiredStack != expectedStack ||
            technologyIDs != expectedStack ||
            Set(technologyIDs).count != technologyIDs.count ||
            technologies.count != summary.technologyCount {
            issues.append("requested software stack summary or required stack is invalid")
        }
        if entrypoints.count != summary.entrypointCount || Set(entrypoints).count != entrypoints.count || Set(entrypoints) != Set(declaredEntrypoints) {
            issues.append("requested software stack entrypoints are incomplete")
        }
        if !technologies.allSatisfy({ technology in
            !technology.id.isEmpty &&
                !technology.label.isEmpty &&
                !technology.runtimeRole.isEmpty &&
                !technology.primaryLane.isEmpty &&
                !technology.entrypoints.isEmpty &&
                technology.activationPolicy == activationPolicy &&
                technology.supportingPlugins.count == technology.supportingPluginUris.count &&
                technology.supportingPlugins.count == technology.supportingPluginLanes.count &&
                technology.supportingPlugins.allSatisfy { !$0.isEmpty } &&
                technology.supportingPluginUris.allSatisfy { $0.hasPrefix("plugin://") } &&
                technology.supportingPluginLanes.allSatisfy { !$0.isEmpty }
        }) {
            issues.append("requested software technology records are incomplete or unsafe")
        }
        if governance.count != 4 ||
            !governance.contains(where: { $0.contains("Do not install runtime dependencies") }) ||
            !governance.contains(where: { $0.contains("not blanket connector activation") }) ||
            !governance.contains(where: { $0.contains("credentials and live connector tokens") }) {
            issues.append("requested software stack governance is incomplete")
        }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            activationPolicy == "activate_only_when_relevant_authenticated_scoped_and_user_approved" &&
            governance.contains(where: { $0.contains("Do not install runtime dependencies") })
    }

    public var requestedTechnologyCount: Int { technologies.count }
    public var uniqueSubmittedPluginCount: Int { summary.uniqueSubmittedPlugins }
    public var capabilityLaneCount: Int { summary.capabilityLaneCount }
}
