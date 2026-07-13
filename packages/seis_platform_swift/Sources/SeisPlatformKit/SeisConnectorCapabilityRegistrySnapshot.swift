import Foundation

public struct SeisConnectorCapabilityPolicy: Codable, Equatable, Sendable {
    public let defaultAction: String
    public let secretHandling: String
    public let execution: String
    public let mcp: String
    public let plugins: String
    public let skills: String

    private enum CodingKeys: String, CodingKey {
        case defaultAction = "default"
        case secretHandling, execution, mcp, plugins, skills
    }
}

public struct SeisConnectorEcosystemActivation: Codable, Equatable, Sendable {
    public let intent: String
    public let defaultMode: String
    public let pluginCatalog: String
    public let routingOrder: [String]
    public let blockedByDefault: [String]
}

public struct SeisConnectorCapabilityEntry: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let surface: String
    public let status: String
    public let activationPolicy: String
    public let blockedWithout: [String]
    public let qualityCommands: [String]
}

public struct SeisCapabilityFamilyEntry: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let includes: [String]
    public let defaultAction: String
    public let liveWriteGate: String
}

public enum SeisConnectorCapabilityRegistrySnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisConnectorCapabilityRegistrySnapshot: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let mode: String
    public let policy: SeisConnectorCapabilityPolicy
    public let ecosystemActivation: SeisConnectorEcosystemActivation
    public let connectors: [SeisConnectorCapabilityEntry]
    public let skills: [String]
    public let capabilityFamilies: [SeisCapabilityFamilyEntry]
    public let automationRules: [String]

    public static func validated(from data: Data) throws -> Self {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisConnectorCapabilityRegistrySnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisConnectorCapabilityRegistrySnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if version != 1 || id != "seis-connector-capability-registry" || mode != "explicit-auth-only" {
            issues.append("connector registry identity or activation mode is invalid")
        }
        if policy.defaultAction != "available_when_authenticated" ||
            policy.secretHandling != "never_commit_tokens" ||
            policy.execution != "use_only_when_relevant_to_the_current_task" ||
            policy.mcp != "prefer_official_or_project_configured_servers" ||
            policy.plugins != "route_by_capability_family_before_live_use" ||
            policy.skills != "load_only_the_minimal_skill_set_for_the_current_task" {
            issues.append("connector registry policy is not explicit-auth and task scoped")
        }
        let expectedRoutingOrder = ["task_intent", "repo_surface", "capability_family", "auth_and_target", "quality_gate", "live_action"]
        let expectedBlockedByDefault = [
            "credentialed_writes",
            "blanket_oauth_calls",
            "broad_scans_without_scope",
            "unreviewed_remote_mutations",
            "unbounded_browser_or_indexing_runs"
        ]
        if ecosystemActivation.defaultMode != "registry-first" ||
            ecosystemActivation.pluginCatalog != "content/development/plugin-capability-catalog.json" ||
            ecosystemActivation.routingOrder != expectedRoutingOrder ||
            ecosystemActivation.blockedByDefault != expectedBlockedByDefault ||
            ecosystemActivation.intent.isEmpty {
            issues.append("connector activation hub is not registry-first or fail-closed")
        }
        if connectors.count != 21 || skills.count != 50 || capabilityFamilies.count != 7 || automationRules.count != 5 {
            issues.append("connector registry counts do not match the source contract")
        }
        let connectorIDs = connectors.map(\.id)
        let familyIDs = capabilityFamilies.map(\.id)
        if Set(connectorIDs).count != connectorIDs.count || Set(familyIDs).count != familyIDs.count {
            issues.append("connector and capability-family IDs must be unique")
        }
        if connectors.contains(where: {
            $0.id.isEmpty || $0.surface.isEmpty || $0.status.isEmpty || $0.activationPolicy.isEmpty ||
                $0.blockedWithout.isEmpty || $0.qualityCommands.isEmpty
        }) {
            issues.append("every connector must declare status, activation policy, blockers, and quality commands")
        }
        if capabilityFamilies.contains(where: {
            $0.id.isEmpty || $0.includes.isEmpty || $0.defaultAction.isEmpty || $0.liveWriteGate.isEmpty
        }) {
            issues.append("every capability family must declare included capabilities and its write gate")
        }
        if skills.contains(where: { $0.isEmpty }) || automationRules.contains(where: { $0.isEmpty }) {
            issues.append("skills and automation rules must remain explicit")
        }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            mode == "explicit-auth-only" &&
            ecosystemActivation.defaultMode == "registry-first" &&
            policy.secretHandling == "never_commit_tokens" &&
            ecosystemActivation.blockedByDefault.count == 5
    }

    public var connectorCount: Int { connectors.count }
    public var skillCount: Int { skills.count }
    public var capabilityFamilyCount: Int { capabilityFamilies.count }
    public var readyConnectorCount: Int { connectors.filter { $0.status == "ready-if-authenticated" }.count }
    public var candidateConnectorCount: Int { connectors.filter { $0.status == "candidate" }.count }
    public var requestedBlockedConnectorCount: Int { connectors.filter { $0.status == "requested-blocked" }.count }
    public var registryReadyConnectorCount: Int { connectors.filter { $0.status == "registry-ready" }.count }
}
