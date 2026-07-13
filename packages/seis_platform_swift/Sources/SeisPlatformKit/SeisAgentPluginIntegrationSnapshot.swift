import Foundation

public struct SeisAgentCanonicalPlugin: Codable, Equatable, Sendable {
    public let identity: String
    public let pluginRoot: String
    public let repoMarketplace: String
    public let marketplaceName: String
    public let publishedPlugin: String
    public let installMode: String
    public let standaloneLaneInstallMode: String

    public init(identity: String, pluginRoot: String, repoMarketplace: String, marketplaceName: String, publishedPlugin: String, installMode: String, standaloneLaneInstallMode: String) {
        self.identity = identity
        self.pluginRoot = pluginRoot
        self.repoMarketplace = repoMarketplace
        self.marketplaceName = marketplaceName
        self.publishedPlugin = publishedPlugin
        self.installMode = installMode
        self.standaloneLaneInstallMode = standaloneLaneInstallMode
    }

    public var isSafe: Bool {
        identity == "SEIS-Agent" &&
            installMode == "single-agent" &&
            standaloneLaneInstallMode == "disabled"
    }
}

public struct SeisAgentPluginAuditSnapshot: Codable, Equatable, Sendable {
    public let auditedAt: String
    public let sourceCommand: String
    public let installedEnabledCount: Int
    public let notInstalledCount: Int
    public let personalPluginsInstalledEnabled: [String]
    public let notInstalled: [String]
    public let authenticationClaim: String

    public init(auditedAt: String, sourceCommand: String, installedEnabledCount: Int, notInstalledCount: Int, personalPluginsInstalledEnabled: [String], notInstalled: [String], authenticationClaim: String) {
        self.auditedAt = auditedAt
        self.sourceCommand = sourceCommand
        self.installedEnabledCount = installedEnabledCount
        self.notInstalledCount = notInstalledCount
        self.personalPluginsInstalledEnabled = personalPluginsInstalledEnabled
        self.notInstalled = notInstalled
        self.authenticationClaim = authenticationClaim
    }

    public var isSafe: Bool {
        installedEnabledCount == 185 &&
            notInstalledCount == 5 &&
            personalPluginsInstalledEnabled.count == 5 &&
            notInstalled.count == 5 &&
            authenticationClaim == "not-claimed"
    }
}

public struct SeisAgentPluginActivationPolicy: Codable, Equatable, Sendable {
    public let mode: String
    public let rule: String
    public let noBlanketActivation: Bool
    public let noSecretDisclosure: Bool
    public let externalMutationRequiresUserConfirmation: Bool

    public init(mode: String, rule: String, noBlanketActivation: Bool, noSecretDisclosure: Bool, externalMutationRequiresUserConfirmation: Bool) {
        self.mode = mode
        self.rule = rule
        self.noBlanketActivation = noBlanketActivation
        self.noSecretDisclosure = noSecretDisclosure
        self.externalMutationRequiresUserConfirmation = externalMutationRequiresUserConfirmation
    }

    public var isSafe: Bool {
        mode == "task-scoped-lane-activation" &&
            noBlanketActivation &&
            noSecretDisclosure &&
            externalMutationRequiresUserConfirmation
    }
}

public struct SeisAgentPersonalPlugin: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let embeddedAs: String
    public let sourceMirror: String
    public let embeddedSkill: String

    public init(id: String, status: String, embeddedAs: String, sourceMirror: String, embeddedSkill: String) {
        self.id = id
        self.status = status
        self.embeddedAs = embeddedAs
        self.sourceMirror = sourceMirror
        self.embeddedSkill = embeddedSkill
    }

    public var validationIssues: [String] {
        [id, status, embeddedAs, sourceMirror, embeddedSkill].contains { $0.isEmpty }
            ? ["personal plugin \(id) is incomplete"]
            : []
    }
}

public struct SeisAgentPluginLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let role: String
    public let embeddedSkill: String
    public let sourceMirror: String
    public let mcpTools: [String]
    public let defaultGate: String

    public init(id: String, displayName: String, role: String, embeddedSkill: String, sourceMirror: String, mcpTools: [String], defaultGate: String) {
        self.id = id
        self.displayName = displayName
        self.role = role
        self.embeddedSkill = embeddedSkill
        self.sourceMirror = sourceMirror
        self.mcpTools = mcpTools
        self.defaultGate = defaultGate
    }

    public var validationIssues: [String] {
        if [id, displayName, role, embeddedSkill, sourceMirror, defaultGate].contains(where: { $0.isEmpty }) || mcpTools.count != 2 {
            return ["plugin lane \(id) is incomplete"]
        }
        return []
    }
}

public struct SeisAgentHelperPluginUniverse: Codable, Equatable, Sendable {
    public let sourceRegistry: String
    public let capabilityLanes: String
    public let uniquePlugins: Int
    public let totalLinks: Int
    public let laneCount: Int
    public let activationPolicy: String

    public init(sourceRegistry: String, capabilityLanes: String, uniquePlugins: Int, totalLinks: Int, laneCount: Int, activationPolicy: String) {
        self.sourceRegistry = sourceRegistry
        self.capabilityLanes = capabilityLanes
        self.uniquePlugins = uniquePlugins
        self.totalLinks = totalLinks
        self.laneCount = laneCount
        self.activationPolicy = activationPolicy
    }

    public var isSafe: Bool {
        uniquePlugins == 300 &&
            totalLinks == 301 &&
            laneCount == 12 &&
            activationPolicy == "activate_only_when_relevant_authenticated_scoped_and_user_approved"
    }
}

public struct SeisAgentSSHTransportBinding: Codable, Equatable, Sendable {
    public let alias: String
    public let contract: String
    public let readinessEvidence: String
    public let statusSurface: String
    public let planSurface: String
    public let serverAndPortPolicy: String
    public let runtimeBoundary: String

    public init(alias: String, contract: String, readinessEvidence: String, statusSurface: String, planSurface: String, serverAndPortPolicy: String, runtimeBoundary: String) {
        self.alias = alias
        self.contract = contract
        self.readinessEvidence = readinessEvidence
        self.statusSurface = statusSurface
        self.planSurface = planSurface
        self.serverAndPortPolicy = serverAndPortPolicy
        self.runtimeBoundary = runtimeBoundary
    }

    public var isSafe: Bool {
        alias == "SEIS-SSH" &&
            serverAndPortPolicy == "preserve-existing-server-and-port" &&
            runtimeBoundary == "status-and-plan-only"
    }
}

public struct SeisAgentPluginRuntimeIntegration: Codable, Equatable, Sendable {
    public let aiPackage: String
    public let toolLoopTool: String
    public let readOnlyRouterTool: String
    public let providerRegistryTool: String
    public let modelScalingTool: String
    public let versionRegistryTool: String
    public let versionPromotionTool: String
    public let subagentOperatingModelTool: String
    public let sshTransportBinding: SeisAgentSSHTransportBinding
    public let mcpTool: String
    public let mcpResource: String
    public let mcpResources: [String]

    public init(
        aiPackage: String,
        toolLoopTool: String,
        readOnlyRouterTool: String,
        providerRegistryTool: String,
        modelScalingTool: String,
        versionRegistryTool: String,
        versionPromotionTool: String,
        subagentOperatingModelTool: String,
        sshTransportBinding: SeisAgentSSHTransportBinding,
        mcpTool: String,
        mcpResource: String,
        mcpResources: [String]
    ) {
        self.aiPackage = aiPackage
        self.toolLoopTool = toolLoopTool
        self.readOnlyRouterTool = readOnlyRouterTool
        self.providerRegistryTool = providerRegistryTool
        self.modelScalingTool = modelScalingTool
        self.versionRegistryTool = versionRegistryTool
        self.versionPromotionTool = versionPromotionTool
        self.subagentOperatingModelTool = subagentOperatingModelTool
        self.sshTransportBinding = sshTransportBinding
        self.mcpTool = mcpTool
        self.mcpResource = mcpResource
        self.mcpResources = mcpResources
    }

    public var isSafe: Bool {
        !mcpResources.isEmpty &&
            sshTransportBinding.isSafe &&
            ![aiPackage, toolLoopTool, readOnlyRouterTool, providerRegistryTool, modelScalingTool, versionRegistryTool, versionPromotionTool, subagentOperatingModelTool, mcpTool, mcpResource].contains(where: { $0.isEmpty })
    }
}

public enum SeisAgentPluginIntegrationSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAgentPluginIntegrationSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let updatedAt: String
    public let purpose: String
    public let primaryInstallId: String
    public let canonicalAgent: SeisAgentCanonicalPlugin
    public let auditedSnapshot: SeisAgentPluginAuditSnapshot
    public let activationPolicy: SeisAgentPluginActivationPolicy
    public let personalPlugins: [SeisAgentPersonalPlugin]
    public let lanes: [SeisAgentPluginLane]
    public let helperPluginUniverse: SeisAgentHelperPluginUniverse
    public let runtimeIntegration: SeisAgentPluginRuntimeIntegration
    public let qualityCommands: [String]
    public let completionRule: String

    public init(
        id: String,
        version: String,
        status: String,
        updatedAt: String,
        purpose: String,
        primaryInstallId: String,
        canonicalAgent: SeisAgentCanonicalPlugin,
        auditedSnapshot: SeisAgentPluginAuditSnapshot,
        activationPolicy: SeisAgentPluginActivationPolicy,
        personalPlugins: [SeisAgentPersonalPlugin],
        lanes: [SeisAgentPluginLane],
        helperPluginUniverse: SeisAgentHelperPluginUniverse,
        runtimeIntegration: SeisAgentPluginRuntimeIntegration,
        qualityCommands: [String],
        completionRule: String
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.updatedAt = updatedAt
        self.purpose = purpose
        self.primaryInstallId = primaryInstallId
        self.canonicalAgent = canonicalAgent
        self.auditedSnapshot = auditedSnapshot
        self.activationPolicy = activationPolicy
        self.personalPlugins = personalPlugins
        self.lanes = lanes
        self.helperPluginUniverse = helperPluginUniverse
        self.runtimeIntegration = runtimeIntegration
        self.qualityCommands = qualityCommands
        self.completionRule = completionRule
    }

    public static func validated(from data: Data) throws -> SeisAgentPluginIntegrationSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAgentPluginIntegrationSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAgentPluginIntegrationSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-agent-plugin-integration" { issues.append("plugin integration id must identify the canonical manifest") }
        if [version, status, updatedAt, purpose, primaryInstallId, completionRule].contains(where: { $0.isEmpty }) {
            issues.append("plugin integration identity fields must not be empty")
        }
        if !canonicalAgent.isSafe { issues.append("canonical plugin agent binding is unsafe") }
        if !auditedSnapshot.isSafe { issues.append("audited plugin snapshot is unsafe") }
        if !activationPolicy.isSafe { issues.append("plugin activation policy is unsafe") }
        if personalPlugins.count != 5 { issues.append("plugin integration must contain five personal plugins") }
        if lanes.count != 10 { issues.append("plugin integration must contain ten specialist lanes") }
        if !helperPluginUniverse.isSafe { issues.append("helper plugin universe is unsafe") }
        if !runtimeIntegration.isSafe { issues.append("plugin runtime integration is incomplete") }
        if qualityCommands.count != 21 { issues.append("plugin integration must contain twenty-one quality commands") }
        for plugin in personalPlugins { issues.append(contentsOf: plugin.validationIssues) }
        for lane in lanes { issues.append(contentsOf: lane.validationIssues) }
        if Set(lanes.map(\.id)).count != lanes.count { issues.append("plugin lane IDs must be unique") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            activationPolicy.isSafe &&
            auditedSnapshot.authenticationClaim == "not-claimed" &&
            lanes.allSatisfy { !$0.mcpTools.isEmpty }
    }
}
