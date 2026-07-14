import Foundation

public struct SeisAIInstalledCapabilityToolProfile: Codable, Equatable, Identifiable, Sendable {
    public let vendor: String
    public let name: String
    public let status: String
    public let providerState: String

    public var id: String { name }

    public init(vendor: String, name: String, status: String, providerState: String) {
        self.vendor = vendor
        self.name = name
        self.status = status
        self.providerState = providerState
    }
}

public struct SeisAIInstalledCapabilityMCPConfiguration: Codable, Equatable, Identifiable, Sendable {
    public let path: String
    public let client: String
    public let serverIDs: [String]
    public let status: String

    public var id: String { path }

    public init(path: String, client: String, serverIDs: [String], status: String) {
        self.path = path
        self.client = client
        self.serverIDs = serverIDs
        self.status = status
    }
}

public enum SeisAIInstalledCapabilityInventorySnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAIInstalledCapabilityInventorySnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let sourcePaths: [String]
    public let bigTechInventoryStatus: String
    public let installedSkillCount: Int
    public let installedSkillIDs: [String]
    public let cliToolProfiles: [SeisAIInstalledCapabilityToolProfile]
    public let projectMCPConfigurations: [SeisAIInstalledCapabilityMCPConfiguration]
    public let currentSessionMCPSurfaceCount: Int
    public let localAppCount: Int
    public let pendingConnectorInstallCount: Int
    public let nvidiaSkillManifestCount: Int
    public let nvidiaIntegrationIDs: [String]
    public let nvidiaRuntimeBlockedCount: Int
    public let runtimeAuthority: Bool
    public let credentialsRead: Bool
    public let networkCalled: Bool
    public let externalMutationPerformed: Bool
    public let humanApprovalRequiredForActivation: Bool
    public let truthBoundary: String

    public init(
        id: String,
        sourcePaths: [String],
        bigTechInventoryStatus: String,
        installedSkillCount: Int,
        installedSkillIDs: [String],
        cliToolProfiles: [SeisAIInstalledCapabilityToolProfile],
        projectMCPConfigurations: [SeisAIInstalledCapabilityMCPConfiguration],
        currentSessionMCPSurfaceCount: Int,
        localAppCount: Int,
        pendingConnectorInstallCount: Int,
        nvidiaSkillManifestCount: Int,
        nvidiaIntegrationIDs: [String],
        nvidiaRuntimeBlockedCount: Int,
        runtimeAuthority: Bool,
        credentialsRead: Bool,
        networkCalled: Bool,
        externalMutationPerformed: Bool,
        humanApprovalRequiredForActivation: Bool,
        truthBoundary: String
    ) {
        self.id = id
        self.sourcePaths = sourcePaths
        self.bigTechInventoryStatus = bigTechInventoryStatus
        self.installedSkillCount = installedSkillCount
        self.installedSkillIDs = installedSkillIDs
        self.cliToolProfiles = cliToolProfiles
        self.projectMCPConfigurations = projectMCPConfigurations
        self.currentSessionMCPSurfaceCount = currentSessionMCPSurfaceCount
        self.localAppCount = localAppCount
        self.pendingConnectorInstallCount = pendingConnectorInstallCount
        self.nvidiaSkillManifestCount = nvidiaSkillManifestCount
        self.nvidiaIntegrationIDs = nvidiaIntegrationIDs
        self.nvidiaRuntimeBlockedCount = nvidiaRuntimeBlockedCount
        self.runtimeAuthority = runtimeAuthority
        self.credentialsRead = credentialsRead
        self.networkCalled = networkCalled
        self.externalMutationPerformed = externalMutationPerformed
        self.humanApprovalRequiredForActivation = humanApprovalRequiredForActivation
        self.truthBoundary = truthBoundary
    }

    public static func validated(bigTechData: Data, nvidiaData: Data) throws -> Self {
        let decoder = JSONDecoder()
        guard
            let bigTech = try? decoder.decode(BigTechInventorySource.self, from: bigTechData),
            let nvidia = try? decoder.decode(NVIDIAInstalledIntegrationsSource.self, from: nvidiaData)
        else {
            throw SeisAIInstalledCapabilityInventorySnapshotError.invalidData
        }

        let snapshot = Self(
            id: "seis-installed-capability-inventory",
            sourcePaths: [
                "content/development/seis-big-tech-mcp-skill-inventory.json",
                "content/development/seis-nvidia-installed-integrations.json"
            ],
            bigTechInventoryStatus: bigTech.status,
            installedSkillCount: bigTech.installedSkillPass.installedSkillCount,
            installedSkillIDs: bigTech.installedSkillPass.skills,
            cliToolProfiles: bigTech.cliInstallations.map {
                SeisAIInstalledCapabilityToolProfile(
                    vendor: $0.vendor,
                    name: $0.name,
                    status: $0.status,
                    providerState: $0.providerState
                )
            },
            projectMCPConfigurations: bigTech.projectMCPAndSkillConfigs.map {
                SeisAIInstalledCapabilityMCPConfiguration(
                    path: $0.path,
                    client: $0.client,
                    serverIDs: $0.servers ?? [],
                    status: $0.status
                )
            },
            currentSessionMCPSurfaceCount: bigTech.currentSessionMCPSurfaces.count,
            localAppCount: bigTech.localAppsDetected.count,
            pendingConnectorInstallCount: bigTech.connectorInstallAttempts.filter {
                !$0.completed && !$0.userConfirmed
            }.count,
            nvidiaSkillManifestCount: nvidia.installPolicy.localSkillManifestCount,
            nvidiaIntegrationIDs: nvidia.installedIntegrations.map(\.id),
            nvidiaRuntimeBlockedCount: nvidia.runtimeBlockedUntilApproved.count,
            runtimeAuthority: false,
            credentialsRead: false,
            networkCalled: false,
            externalMutationPerformed: false,
            humanApprovalRequiredForActivation: true,
            truthBoundary: "Installed AI, MCP, skill, CLI, and NVIDIA surfaces are source-backed metadata only. Activation, provider authentication, credential access, network calls, runtime execution, and external mutation remain blocked or human-approval gated."
        )
        let issues = snapshot.validationIssues + snapshot.sourceValidationIssues(bigTech: bigTech, nvidia: nvidia)
        guard issues.isEmpty else {
            throw SeisAIInstalledCapabilityInventorySnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-installed-capability-inventory" {
            issues.append("installed capability inventory id is invalid")
        }
        if sourcePaths != [
            "content/development/seis-big-tech-mcp-skill-inventory.json",
            "content/development/seis-nvidia-installed-integrations.json"
        ] {
            issues.append("installed capability inventory source paths are invalid")
        }
        if bigTechInventoryStatus.isEmpty || truthBoundary.isEmpty {
            issues.append("installed capability inventory status and truth boundary must not be empty")
        }
        if installedSkillCount != 38 || installedSkillIDs.count != installedSkillCount || installedSkillIDs.contains(where: { $0.isEmpty }) {
            issues.append("installed curated skill count must remain source-backed at 38")
        }
        if cliToolProfiles.count != 3 || cliToolProfiles.contains(where: {
            $0.vendor.isEmpty || $0.name.isEmpty || $0.status.isEmpty || $0.providerState.isEmpty
        }) {
            issues.append("three installed CLI/tool profiles with provider state are required")
        }
        if projectMCPConfigurations.count != 3 || projectMCPConfigurations.contains(where: {
            $0.path.isEmpty || $0.client.isEmpty || $0.status.isEmpty || $0.serverIDs.contains(where: { $0.isEmpty })
        }) {
            issues.append("three project MCP/skill configurations with scoped status are required")
        }
        if currentSessionMCPSurfaceCount != 17 || localAppCount != 8 || pendingConnectorInstallCount != 1 {
            issues.append("Big Tech MCP, local app, and connector counts do not match the source inventory")
        }
        if nvidiaSkillManifestCount != 11 || nvidiaIntegrationIDs.count != nvidiaSkillManifestCount || nvidiaRuntimeBlockedCount != 8 {
            issues.append("NVIDIA installed and blocked counts do not match the source inventory")
        }
        let uniqueSkillIDs = Set(installedSkillIDs)
        let uniqueNVIDIAIDs = Set(nvidiaIntegrationIDs)
        if uniqueSkillIDs.count != installedSkillIDs.count || uniqueNVIDIAIDs.count != nvidiaIntegrationIDs.count {
            issues.append("installed skill and NVIDIA integration IDs must be unique")
        }
        if runtimeAuthority || credentialsRead || networkCalled || externalMutationPerformed || !humanApprovalRequiredForActivation {
            issues.append("installed capability inventory must remain metadata-only and approval-gated")
        }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            !runtimeAuthority &&
            !credentialsRead &&
            !networkCalled &&
            !externalMutationPerformed &&
            humanApprovalRequiredForActivation
    }

    private func sourceValidationIssues(bigTech: BigTechInventorySource, nvidia: NVIDIAInstalledIntegrationsSource) -> [String] {
        var issues: [String] = []
        if bigTech.id != "seis-big-tech-mcp-skill-inventory" {
            issues.append("Big Tech inventory id is invalid")
        }
        if bigTech.installedSkillPass.requiresCodexRestart != true {
            issues.append("Big Tech inventory must preserve its explicit restart notice")
        }
        if bigTech.securityBoundary.noSecretsStored != true ||
            bigTech.securityBoundary.noProviderCalls != true ||
            bigTech.securityBoundary.noSSH != true ||
            bigTech.securityBoundary.noDeployment != true ||
            bigTech.securityBoundary.noGitPushOrMerge != true {
            issues.append("Big Tech inventory security boundary is unsafe")
        }
        if nvidia.id != "seis-nvidia-installed-integrations" || nvidia.version != 1 ||
            nvidia.status != "installed-local-skill-registry-runtime-gated" {
            issues.append("NVIDIA installed integration identity or status is invalid")
        }
        if nvidia.source.plugin != "nvidia" ||
            nvidia.source.registryMode != "metadata-only-no-runtime-execution" {
            issues.append("NVIDIA source must remain local and metadata-only")
        }
        let policy = nvidia.installPolicy
        if !policy.installedIntoSeis ||
            policy.executeSkillCommandsAllowed ||
            policy.networkInstallAllowed ||
            policy.repoCloneAllowed ||
            policy.modelDownloadAllowed ||
            policy.nimAPICallAllowed ||
            policy.dockerAllowed ||
            policy.kubernetesAllowed ||
            policy.terraformAllowed ||
            policy.azureAllowed ||
            policy.gpuRuntimeAllowed ||
            policy.sshAllowed ||
            policy.secretReadAllowed ||
            policy.credentialRequiredForCoreDemo ||
            !policy.approvalRequiredForRuntime ||
            policy.truthBoundary.isEmpty {
            issues.append("NVIDIA runtime policy must remain blocked and approval-gated")
        }
        if nvidia.installedIntegrations.contains(where: { $0.id.isEmpty || $0.status != "installed-gated" }) {
            issues.append("NVIDIA integrations must remain installed-gated records")
        }
        return issues
    }
}

private struct BigTechInventorySource: Decodable {
    let id: String
    let status: String
    let installedSkillPass: InstalledSkillPass
    let cliInstallations: [CLIInstallation]
    let projectMCPAndSkillConfigs: [ProjectMCPAndSkillConfig]
    let connectorInstallAttempts: [ConnectorInstallAttempt]
    let localAppsDetected: [LocalApp]
    let currentSessionMCPSurfaces: [MCPSurface]
    let securityBoundary: SecurityBoundary

    enum CodingKeys: String, CodingKey {
        case id, status
        case installedSkillPass = "installed_skill_pass"
        case cliInstallations = "cli_installations"
        case projectMCPAndSkillConfigs = "project_mcp_and_skill_configs"
        case connectorInstallAttempts = "connector_install_attempts"
        case localAppsDetected = "local_apps_detected"
        case currentSessionMCPSurfaces = "current_session_mcp_surfaces"
        case securityBoundary = "security_boundary"
    }

    struct InstalledSkillPass: Decodable {
        let installedSkillCount: Int
        let skills: [String]
        let requiresCodexRestart: Bool

        enum CodingKeys: String, CodingKey {
            case installedSkillCount = "installed_skill_count"
            case skills
            case requiresCodexRestart = "requires_codex_restart"
        }
    }

    struct CLIInstallation: Decodable {
        let vendor: String
        let name: String
        let status: String
        let providerState: String

        enum CodingKeys: String, CodingKey {
            case vendor, name, status
            case providerState = "provider_state"
        }
    }

    struct ProjectMCPAndSkillConfig: Decodable {
        let path: String
        let client: String
        let servers: [String]?
        let status: String
    }

    struct ConnectorInstallAttempt: Decodable {
        let completed: Bool
        let userConfirmed: Bool

        enum CodingKeys: String, CodingKey {
            case completed
            case userConfirmed = "user_confirmed"
        }
    }

    struct LocalApp: Decodable {}
    struct MCPSurface: Decodable {}

    struct SecurityBoundary: Decodable {
        let noSecretsStored: Bool
        let noProviderCalls: Bool
        let noSSH: Bool
        let noDeployment: Bool
        let noGitPushOrMerge: Bool

        enum CodingKeys: String, CodingKey {
            case noSecretsStored = "no_secrets_stored"
            case noProviderCalls = "no_provider_calls"
            case noSSH = "no_ssh"
            case noDeployment = "no_deployment"
            case noGitPushOrMerge = "no_git_push_or_merge"
        }
    }
}

private struct NVIDIAInstalledIntegrationsSource: Decodable {
    let id: String
    let version: Int
    let status: String
    let source: Source
    let installPolicy: InstallPolicy
    let installedIntegrations: [InstalledIntegration]
    let runtimeBlockedUntilApproved: [String]

    enum CodingKeys: String, CodingKey {
        case id, version, status, source
        case installPolicy = "installPolicy"
        case installedIntegrations = "installedIntegrations"
        case runtimeBlockedUntilApproved = "runtimeBlockedUntilApproved"
    }

    struct Source: Decodable {
        let plugin: String
        let registryMode: String

        enum CodingKeys: String, CodingKey {
            case plugin
            case registryMode = "registryMode"
        }
    }

    struct InstallPolicy: Decodable {
        let installedIntoSeis: Bool
        let localSkillManifestCount: Int
        let executeSkillCommandsAllowed: Bool
        let networkInstallAllowed: Bool
        let repoCloneAllowed: Bool
        let modelDownloadAllowed: Bool
        let nimAPICallAllowed: Bool
        let dockerAllowed: Bool
        let kubernetesAllowed: Bool
        let terraformAllowed: Bool
        let azureAllowed: Bool
        let gpuRuntimeAllowed: Bool
        let sshAllowed: Bool
        let secretReadAllowed: Bool
        let credentialRequiredForCoreDemo: Bool
        let approvalRequiredForRuntime: Bool
        let truthBoundary: String
    }

    struct InstalledIntegration: Decodable {
        let id: String
        let status: String
    }
}
