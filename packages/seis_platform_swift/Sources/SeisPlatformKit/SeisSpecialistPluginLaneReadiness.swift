import Foundation

public struct SeisSpecialistPluginLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let category: String
    public let repoMirror: String
    public let localRoot: String
    public let installedCacheRoot: String
    public let skillPath: String
    public let mcpServer: String
    public let tools: [String]
    public let laneProfilePath: String
    public let qualityCommands: [String]

    public init(
        id: String,
        displayName: String,
        category: String,
        repoMirror: String,
        localRoot: String,
        installedCacheRoot: String,
        skillPath: String,
        mcpServer: String,
        tools: [String],
        laneProfilePath: String,
        qualityCommands: [String]
    ) {
        self.id = id
        self.displayName = displayName
        self.category = category
        self.repoMirror = repoMirror
        self.localRoot = localRoot
        self.installedCacheRoot = installedCacheRoot
        self.skillPath = skillPath
        self.mcpServer = mcpServer
        self.tools = tools
        self.laneProfilePath = laneProfilePath
        self.qualityCommands = qualityCommands
    }

    public var isReady: Bool {
        !id.isEmpty &&
            !displayName.isEmpty &&
            !category.isEmpty &&
            repoMirror.hasPrefix("plugins/") &&
            !localRoot.isEmpty &&
            !installedCacheRoot.isEmpty &&
            skillPath.hasSuffix("SKILL.md") &&
            !mcpServer.isEmpty &&
            tools.count >= 2 &&
            laneProfilePath == "assets/lane-profile.json" &&
            !qualityCommands.isEmpty &&
            localInstallationReady
    }

    public var toolSummary: String {
        tools.joined(separator: ", ")
    }

    public var qualityCommandSummary: String {
        "\(qualityCommands.count) checks"
    }

    public var localInstallationReady: Bool {
        let fileManager = FileManager.default
        let requiredRelativePaths = [
            skillPath,
            ".mcp.json",
            laneProfilePath
        ]
        return fileManager.fileExists(atPath: localRoot) &&
            fileManager.fileExists(atPath: installedCacheRoot) &&
            requiredRelativePaths.allSatisfy { relativePath in
                fileManager.fileExists(atPath: "\(localRoot)/\(relativePath)") &&
                    fileManager.fileExists(atPath: "\(installedCacheRoot)/\(relativePath)")
            }
    }
}

public struct SeisSpecialistPluginLaneReadiness: Codable, Equatable, Sendable {
    public let marketplacePath: String
    public let marketplaceName: String
    public let installationPolicy: String
    public let authenticationPolicy: String
    public let centralMcpTools: [String]
    public let centralMcpServerPath: String
    public let lanes: [SeisSpecialistPluginLane]
    public let validationCommands: [String]

    public init(
        marketplacePath: String,
        marketplaceName: String,
        installationPolicy: String,
        authenticationPolicy: String,
        centralMcpTools: [String],
        centralMcpServerPath: String,
        lanes: [SeisSpecialistPluginLane],
        validationCommands: [String]
    ) {
        self.marketplacePath = marketplacePath
        self.marketplaceName = marketplaceName
        self.installationPolicy = installationPolicy
        self.authenticationPolicy = authenticationPolicy
        self.centralMcpTools = centralMcpTools
        self.centralMcpServerPath = centralMcpServerPath
        self.lanes = lanes
        self.validationCommands = validationCommands
    }

    public static var current: SeisSpecialistPluginLaneReadiness {
        let home = homePath
        let repositoryRoot = defaultRepositoryRoot(home: home)
        return SeisSpecialistPluginLaneReadiness(
            marketplacePath: "\(home)/.agents/plugins/marketplace.json",
            marketplaceName: "personal",
            installationPolicy: "AVAILABLE",
            authenticationPolicy: "ON_INSTALL",
            centralMcpTools: Self.expectedCentralMcpTools,
            centralMcpServerPath: "\(repositoryRoot)/mcp/seis-mcp-server.mjs",
            lanes: [
                SeisSpecialistPluginLane(
                    id: "seis-code",
                    displayName: "SEIS-Code",
                    category: "Developer",
                    repoMirror: "plugins/seis-code",
                    localRoot: "\(home)/plugins/seis-code",
                    installedCacheRoot: "\(home)/.codex/plugins/cache/personal/seis-code/0.1.0",
                    skillPath: "skills/seis-code/SKILL.md",
                    mcpServer: "seis-code",
                    tools: ["seis_code_status", "seis_code_plan"],
                    laneProfilePath: "assets/lane-profile.json",
                    qualityCommands: [
                        "npm run seis:check",
                        "npm run check:seis-plugin-bundle",
                        "npm run check:seis-platform-kernel",
                        "npm run check:seis-agi-system"
                    ]
                ),
                SeisSpecialistPluginLane(
                    id: "seis-design",
                    displayName: "SEIS-Design",
                    category: "Design",
                    repoMirror: "plugins/seis-design",
                    localRoot: "\(home)/plugins/seis-design",
                    installedCacheRoot: "\(home)/.codex/plugins/cache/personal/seis-design/0.1.0",
                    skillPath: "skills/seis-design/SKILL.md",
                    mcpServer: "seis-design",
                    tools: ["seis_design_status", "seis_design_plan"],
                    laneProfilePath: "assets/lane-profile.json",
                    qualityCommands: [
                        "npm run check:motion-evidence",
                        "npm run check:mobile-ergonomics",
                        "npm run check:web",
                        "npm run seis:check"
                    ]
                ),
                SeisSpecialistPluginLane(
                    id: "seis-data",
                    displayName: "SEIS-DATA",
                    category: "Data",
                    repoMirror: "plugins/seis-data",
                    localRoot: "\(home)/plugins/seis-data",
                    installedCacheRoot: "\(home)/.codex/plugins/cache/personal/seis-data/0.1.0",
                    skillPath: "skills/seis-data/SKILL.md",
                    mcpServer: "seis-data",
                    tools: ["seis_data_status", "seis_data_plan"],
                    laneProfilePath: "assets/lane-profile.json",
                    qualityCommands: [
                        "npm run check:plugin-capability-lanes",
                        "npm run check:seis-technology-stack",
                        "npm run check:seis-agi-system",
                        "npm run check:universal-capability-kernel",
                        "npm run check:language-distribution"
                    ]
                )
            ],
            validationCommands: [
                "npm run check:seis-specialist-plugins",
                "npm run check:seis-plugin-bundle"
            ]
        )
    }

    public var readyCount: Int {
        lanes.filter(\.isReady).count + (centralSurfaceReady ? 1 : 0)
    }

    public var checkCount: Int {
        lanes.count + 1
    }

    public var isReady: Bool {
        checkCount > 0 &&
            readyCount == checkCount &&
            marketplaceReady &&
            marketplaceName == "personal" &&
            installationPolicy == "AVAILABLE" &&
            authenticationPolicy == "ON_INSTALL" &&
            centralSurfaceReady
    }

    public var statusLabel: String {
        "\(readyCount)/\(checkCount) specialist plugin surfaces ready"
    }

    public var centralMcpToolSummary: String {
        centralMcpTools.joined(separator: ", ")
    }

    public var laneSummary: String {
        lanes.map(\.id).joined(separator: ", ")
    }

    public var toolCount: Int {
        lanes.reduce(centralMcpTools.count) { partialResult, lane in
            partialResult + lane.tools.count
        }
    }

    public var marketplaceReady: Bool {
        guard
            !marketplacePath.isEmpty,
            let data = FileManager.default.contents(atPath: marketplacePath),
            let marketplace = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            marketplace["name"] as? String == marketplaceName,
            let plugins = marketplace["plugins"] as? [[String: Any]]
        else {
            return false
        }

        return lanes.allSatisfy { lane in
            guard
                let entry = plugins.first(where: { $0["name"] as? String == lane.id }),
                let source = entry["source"] as? [String: Any],
                let policy = entry["policy"] as? [String: Any]
            else {
                return false
            }

            return source["source"] as? String == "local" &&
                source["path"] as? String == "./plugins/\(lane.id)" &&
                policy["installation"] as? String == installationPolicy &&
                policy["authentication"] as? String == authenticationPolicy &&
                entry["category"] as? String == lane.category
        }
    }

    public var centralSurfaceReady: Bool {
        marketplaceReady &&
            centralMcpTools == Self.expectedCentralMcpTools &&
            centralMcpServerReady
    }

    public var centralMcpServerReady: Bool {
        guard
            !centralMcpServerPath.isEmpty,
            let source = try? String(contentsOfFile: centralMcpServerPath, encoding: .utf8)
        else {
            return false
        }

        return Self.expectedCentralMcpTools.allSatisfy { source.contains($0) }
    }

    private static var homePath: String {
        FileManager.default.homeDirectoryForCurrentUser.path
    }

    private static func defaultRepositoryRoot(home: String) -> String {
        let environment = ProcessInfo.processInfo.environment
        if let seisRoot = environment["SEIS_ROOT"], !seisRoot.isEmpty {
            return seisRoot
        }
        if let repositoryRoot = environment["SEIS_REPO_ROOT"], !repositoryRoot.isEmpty {
            return repositoryRoot
        }

        let fileManager = FileManager.default
        var candidate = URL(fileURLWithPath: fileManager.currentDirectoryPath)
        while true {
            let centralMcpPath = candidate.appendingPathComponent("mcp/seis-mcp-server.mjs").path
            if fileManager.fileExists(atPath: centralMcpPath) {
                return candidate.path
            }

            let parent = candidate.deletingLastPathComponent()
            if parent.path == candidate.path {
                break
            }
            candidate = parent
        }

        return "\(home)/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS"
    }

    public static var expectedCentralMcpTools: [String] {
        [
            "seis_specialist_lanes",
            "seis_specialist_lane_status",
            "seis_specialist_lane_plan"
        ]
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisSpecialistPluginLaneReadiness",
            "SEIS-Code",
            "SEIS-Design",
            "SEIS-DATA",
            "homeDirectoryForCurrentUser",
            "currentDirectoryPath",
            "localInstallationReady",
            "marketplaceReady",
            "centralSurfaceReady",
            "centralMcpServerReady",
            "centralMcpServerPath",
            "seis_specialist_lanes",
            "seis_specialist_lane_status",
            "seis_specialist_lane_plan",
            "seis_code_plan",
            "seis_design_plan",
            "seis_data_plan",
            "npm run check:seis-specialist-plugins"
        ]
    }

    public static var expectedDiagnosticsViewTokens: [String] {
        [
            "Specialist Plugin Lanes",
            "specialistPluginReadiness.statusLabel",
            "specialistPluginReadiness.centralMcpToolSummary",
            "specialistPluginReadiness.lanes",
            "lane.toolSummary",
            "lane.qualityCommandSummary"
        ]
    }
}
