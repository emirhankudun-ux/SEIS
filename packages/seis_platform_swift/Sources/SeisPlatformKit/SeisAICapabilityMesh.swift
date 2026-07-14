import Foundation

/// A read-only projection of the source-backed plugin and MCP mesh for native surfaces.
/// It intentionally contains no executable tool handle, credential, prompt body, or transport.
public struct SeisAICapabilityMesh: Codable, Equatable, Sendable {
    public let pluginID: String
    public let pluginStatus: String
    public let activationPolicy: String
    public let installedEnabledCount: Int
    public let notInstalledCount: Int
    public let helperUniquePlugins: Int
    public let helperCapabilityLaneCount: Int
    public let personalLanes: [SeisAICorePersonalLane]
    public let mcpCounts: SeisAICoreMCPCounts
    public let mcpSurfaces: [SeisAICoreMCPSurface]
    public let pluginMcpServerCount: Int
    public let pluginMcpVerifiedServerCount: Int
    public let pluginMcpSafeToolProbeCount: Int
    public let pluginMcpSafeToolNames: [String]
    public let pluginMcpBoundarySafe: Bool
    public let runtimeBoundarySafe: Bool
    public let humanApprovalRequiredForLiveActions: Bool

    public init(snapshot: SeisAICoreRuntimeSnapshotContract) {
        let pluginMesh = snapshot.pluginMesh
        self.pluginID = pluginMesh.id
        self.pluginStatus = pluginMesh.status
        self.activationPolicy = pluginMesh.activationPolicy
        self.installedEnabledCount = pluginMesh.installedEnabledCount
        self.notInstalledCount = pluginMesh.notInstalledCount
        self.helperUniquePlugins = pluginMesh.helperUniquePlugins
        self.helperCapabilityLaneCount = pluginMesh.helperCapabilityLaneCount
        self.personalLanes = pluginMesh.personalLanes
        self.mcpCounts = snapshot.mcpRuntime.counts
        self.mcpSurfaces = snapshot.mcpRuntime.surfaces
        let pluginMcpMesh = pluginMesh.mcpMesh
        self.pluginMcpServerCount = pluginMcpMesh.serverCount
        self.pluginMcpVerifiedServerCount = pluginMcpMesh.probe.verifiedServerCount
        self.pluginMcpSafeToolProbeCount = pluginMcpMesh.probe.safeToolProbeCount
        self.pluginMcpSafeToolNames = pluginMcpMesh.servers
            .filter { $0.safeToolProbe.isVerified }
            .map { $0.safeToolProbe.requestedTool }
            .sorted()
        self.pluginMcpBoundarySafe = pluginMcpMesh.boundary.liveSessionStarted == false &&
            pluginMcpMesh.boundary.shell == false &&
            pluginMcpMesh.boundary.credentialsRead == false &&
            pluginMcpMesh.boundary.networkCalled == false &&
            pluginMcpMesh.boundary.externalMutationPerformed == false &&
            pluginMcpMesh.boundary.humanApprovalRequiredForExternalMutation &&
            pluginMcpMesh.probe.safeToolCallsPerformed &&
            pluginMcpMesh.probe.failedServerCount == 0 &&
            pluginMcpMesh.servers.allSatisfy { $0.safeToolProbe.isVerified }
        self.runtimeBoundarySafe = snapshot.runtimeBoundary.isSafe && snapshot.agentRegistry.isReadOnlySafe
        self.humanApprovalRequiredForLiveActions = snapshot.runtimeBoundary.humanApprovalRequiredForLiveActions
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if pluginID != "seis-agent-plugin-integration" { issues.append("plugin mesh identity is not source-backed") }
        if pluginStatus != "active" { issues.append("plugin mesh is not active") }
        if activationPolicy.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("plugin activation policy is empty") }
        if installedEnabledCount < 0 || notInstalledCount < 0 { issues.append("plugin counts must not be negative") }
        if personalLanes.isEmpty { issues.append("personal plugin lanes are missing") }
        if mcpCounts.tools < 0 || mcpCounts.resources < 0 || mcpCounts.prompts < 0 { issues.append("MCP counts must not be negative") }
        if mcpSurfaces.isEmpty { issues.append("MCP surfaces are missing") }
        if pluginMcpServerCount != 6 || pluginMcpVerifiedServerCount != pluginMcpServerCount { issues.append("plugin MCP mesh must verify all six local servers") }
        if pluginMcpSafeToolProbeCount != pluginMcpServerCount || pluginMcpSafeToolNames.count != pluginMcpServerCount { issues.append("plugin MCP mesh must expose one safe status probe per server") }
        if !pluginMcpBoundarySafe { issues.append("plugin MCP mesh boundary is not read-only safe") }
        if !runtimeBoundarySafe { issues.append("runtime boundary is not read-only safe") }
        if !humanApprovalRequiredForLiveActions { issues.append("live actions are missing human approval") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }

    public var pluginStatusLabel: String {
        "\(installedEnabledCount) installed/enabled · \(notInstalledCount) not installed · \(helperUniquePlugins) helper plugins"
    }

    public var mcpStatusLabel: String {
        "\(mcpCounts.tools) tools · \(mcpCounts.resources) resources · \(mcpCounts.prompts) prompts"
    }

    public var pluginMcpStatusLabel: String {
        "Plugin MCP: \(pluginMcpVerifiedServerCount)/\(pluginMcpServerCount) servers · \(pluginMcpSafeToolProbeCount)/\(pluginMcpServerCount) safe status probes · \(pluginMcpBoundarySafe ? "read-only" : "watch")"
    }

    public var laneIDs: [String] {
        personalLanes.map(\.id)
    }
}
