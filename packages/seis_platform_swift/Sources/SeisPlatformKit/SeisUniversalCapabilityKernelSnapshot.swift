import Foundation

public struct SeisUniversalCapabilityKernelSummary: Codable, Equatable, Sendable {
    public let domainCount: Int
    public let laneCount: Int
    public let requiredDomainCount: Int
    public let agentRoles: [String]
    public let lanes: [String: Int]
    public let pluginGroupCount: Int
    public let pluginInventoryCount: Int
    public let coveredPluginCount: Int
    public let minimumDomainPluginCount: Int
    public let platformCount: Int
    public let appleLanguageCount: Int
    public let windowsLanguageCount: Int
    public let windowsPolicyLanguageCount: Int
    public let platformDevelopmentTrackCount: Int

    public var isComplete: Bool {
        domainCount > 0 && laneCount > 0 && requiredDomainCount > 0 && !agentRoles.isEmpty && !lanes.isEmpty
    }
}

public struct SeisUniversalCapabilityKernelSourceReferences: Codable, Equatable, Sendable {
    public let kernelCode: String
    public let polyglotManifest: String
    public let llmRoutingPolicy: String
    public let pluginSources: String
}

public struct SeisUniversalCapabilityKernelRoutingContract: Codable, Equatable, Sendable {
    public let entrypoint: String
    public let seisRole: String
    public let executionBoundary: String

    public var isSafe: Bool {
        entrypoint == "DomainRouter.route(text)" &&
            seisRole.localizedCaseInsensitiveContains("task-facing AI agent") &&
            executionBoundary.localizedCaseInsensitiveContains("user approval") &&
            executionBoundary.localizedCaseInsensitiveContains("not activated")
    }
}

public enum SeisUniversalCapabilityKernelSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisUniversalCapabilityKernelSnapshot: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let mode: String
    public let summary: SeisUniversalCapabilityKernelSummary
    public let sourceReferences: SeisUniversalCapabilityKernelSourceReferences
    public let routingContract: SeisUniversalCapabilityKernelRoutingContract

    public init(
        version: Int,
        id: String,
        mode: String,
        summary: SeisUniversalCapabilityKernelSummary,
        sourceReferences: SeisUniversalCapabilityKernelSourceReferences,
        routingContract: SeisUniversalCapabilityKernelRoutingContract
    ) {
        self.version = version
        self.id = id
        self.mode = mode
        self.summary = summary
        self.sourceReferences = sourceReferences
        self.routingContract = routingContract
    }

    public static func validated(from data: Data) throws -> SeisUniversalCapabilityKernelSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisUniversalCapabilityKernelSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisUniversalCapabilityKernelSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let requiredLanes = 14

        if version != 1 || id != "seis-universal-capability-kernel" || mode != "ai_agent_mcp_skill_plugin_llm_capability_coverage" { issues.append("universal capability kernel identity is invalid") }
        if !summary.isComplete || summary.domainCount != 38 || summary.requiredDomainCount != 38 || summary.laneCount != requiredLanes || summary.lanes.count != requiredLanes { issues.append("universal capability kernel domain or lane coverage is incomplete") }
        if summary.agentRoles.count != 38 || summary.pluginGroupCount != 6 || summary.pluginInventoryCount != 168 || summary.coveredPluginCount != 69 || summary.minimumDomainPluginCount != 3 { issues.append("universal capability kernel agent or plugin coverage is incomplete") }
        if summary.platformCount != 3 || summary.appleLanguageCount != 5 || summary.windowsLanguageCount != 18 || summary.windowsPolicyLanguageCount != 41 || summary.platformDevelopmentTrackCount != 4 { issues.append("universal capability kernel platform coverage is incomplete") }
        if [sourceReferences.kernelCode, sourceReferences.polyglotManifest, sourceReferences.llmRoutingPolicy, sourceReferences.pluginSources].contains(where: { $0.isEmpty }) { issues.append("universal capability kernel source references are incomplete") }
        if sourceReferences.kernelCode != "packages/seis_kernel/capabilities.py" || !routingContract.isSafe { issues.append("universal capability kernel routing boundary is unsafe") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty }
    public var laneIDs: [String] { summary.lanes.keys.sorted() }
}
