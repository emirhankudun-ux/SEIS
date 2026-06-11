import Foundation

public struct SeisUniversalDomainProfile: Codable, Equatable, Sendable {
    public let id: String
    public let lane: String
    public let agentRole: String
    public let algorithms: [String]
    public let flow: String
    public let qualityGates: [String]
    public let platformBoundaries: [String]
    public let integrationSurfaces: [String]

    public init(
        id: String,
        lane: String,
        agentRole: String,
        algorithms: [String],
        flow: String,
        qualityGates: [String],
        platformBoundaries: [String],
        integrationSurfaces: [String]
    ) {
        self.id = id
        self.lane = lane
        self.agentRole = agentRole
        self.algorithms = algorithms
        self.flow = flow
        self.qualityGates = qualityGates
        self.platformBoundaries = platformBoundaries
        self.integrationSurfaces = integrationSurfaces
    }
}

public struct SeisUniversalDomainCoverageResult: Codable, Equatable, Sendable {
    public let ready: Bool
    public let domainCount: Int
    public let requiredDomainCount: Int
    public let laneCount: Int
    public let coveragePercent: Double
    public let blockers: [String]
}

public enum SeisUniversalDomainCoverageGate {
    public static let requiredQualityGates = [
        "security",
        "maintainability",
        "testability",
        "platform-boundary",
        "rollback"
    ]

    public static let requiredPlatformBoundaries = [
        "apple-only-apple-languages",
        "windows-android-non-apple-polyglot",
        "runtime-install-requirement-led"
    ]

    public static let defaultProfiles: [SeisUniversalDomainProfile] =
        SeisCapabilityDomainSet.required.map { profile(for: $0) }

    public static func evaluate(
        profiles: [SeisUniversalDomainProfile] = defaultProfiles
    ) -> SeisUniversalDomainCoverageResult {
        var blockers: [String] = []
        let profileByID = Dictionary(uniqueKeysWithValues: profiles.map { ($0.id, $0) })

        for domain in SeisCapabilityDomainSet.required where profileByID[domain] == nil {
            blockers.append("missing_domain:\(domain)")
        }

        for profile in profiles {
            if profile.lane.isEmpty {
                blockers.append("domain_lane_missing:\(profile.id)")
            }
            if profile.agentRole.isEmpty {
                blockers.append("domain_agent_missing:\(profile.id)")
            }
            if profile.algorithms.count < 2 {
                blockers.append("domain_algorithms_insufficient:\(profile.id)")
            }
            if profile.flow.isEmpty {
                blockers.append("domain_flow_missing:\(profile.id)")
            }
            for gate in requiredQualityGates where !profile.qualityGates.contains(gate) {
                blockers.append("domain_quality_gate_missing:\(profile.id):\(gate)")
            }
            for boundary in requiredPlatformBoundaries where !profile.platformBoundaries.contains(boundary) {
                blockers.append("domain_platform_boundary_missing:\(profile.id):\(boundary)")
            }
            if profile.integrationSurfaces.isEmpty {
                blockers.append("domain_integration_surface_missing:\(profile.id)")
            }
        }

        let laneCount = Set(profiles.map(\.lane).filter { !$0.isEmpty }).count
        if laneCount < 10 {
            blockers.append("domain_lane_coverage_too_narrow")
        }

        blockers.sort()
        let requiredCount = SeisCapabilityDomainSet.required.count
        let coverage = requiredCount == 0 ? 100.0 : Double(profiles.count) / Double(requiredCount) * 100.0
        return SeisUniversalDomainCoverageResult(
            ready: blockers.isEmpty,
            domainCount: profiles.count,
            requiredDomainCount: requiredCount,
            laneCount: laneCount,
            coveragePercent: coverage,
            blockers: blockers
        )
    }

    private static func profile(for domain: String) -> SeisUniversalDomainProfile {
        let lane = lane(for: domain)
        return SeisUniversalDomainProfile(
            id: domain,
            lane: lane,
            agentRole: agentRole(for: domain),
            algorithms: algorithms(for: lane),
            flow: "intake -> classify -> route -> implement -> validate -> report",
            qualityGates: requiredQualityGates,
            platformBoundaries: requiredPlatformBoundaries,
            integrationSurfaces: integrationSurfaces(for: lane)
        )
    }

    private static func lane(for domain: String) -> String {
        switch domain {
        case "ai-agent", "mcp", "skills", "plugins", "llm-routing", "machine-learning", "nlp", "computer-vision":
            return "ai-intelligence"
        case "algorithms", "flowcharts", "mathematics", "computer-science", "compiler-design", "formal-methods":
            return "core-computing"
        case "web-development", "mobile-development", "low-code-no-code":
            return "product-engineering"
        case "game-development", "robotics":
            return "interactive-systems"
        case "data-science":
            return "data-intelligence"
        case "database-management", "big-data", "data-governance":
            return "data-platform"
        case "version-control", "requirements-engineering", "agile-delivery", "sdlc-metrics":
            return "product-governance"
        case "cloud-computing", "devops", "system-administration", "sre":
            return "cloud-ops"
        case "cybersecurity", "reverse-engineering":
            return "security-governance"
        case "software-architecture", "design-patterns", "refactoring":
            return "architecture"
        case "ux-ui-engineering":
            return "design-systems"
        case "quantum-programming":
            return "research-lab"
        case "sustainable-software", "ai-ethics":
            return "governance"
        default:
            return "general-engineering"
        }
    }

    private static func agentRole(for domain: String) -> String {
        "\(domain)-agent"
    }

    private static func algorithms(for lane: String) -> [String] {
        switch lane {
        case "ai-intelligence":
            return ["intent-routing", "provider-fallback", "policy-gating"]
        case "core-computing":
            return ["graph-search", "dynamic-programming", "constraint-solving"]
        case "product-engineering":
            return ["request-routing", "state-reduction", "cache-invalidation"]
        case "interactive-systems":
            return ["event-loop", "path-planning", "collision-detection"]
        case "data-intelligence", "data-platform":
            return ["query-planning", "semantic-aggregation", "lineage-checking"]
        case "cloud-ops":
            return ["rollback-sequencing", "health-checking", "capacity-budgeting"]
        case "security-governance":
            return ["threat-modeling", "secret-detection", "attack-path-analysis"]
        case "architecture":
            return ["dependency-inversion", "behavior-characterization", "adapter-selection"]
        case "design-systems":
            return ["information-architecture", "interaction-state-modeling", "accessibility-heuristics"]
        case "research-lab":
            return ["simulation", "symbolic-analysis", "experiment-routing"]
        case "governance", "product-governance":
            return ["traceability-mapping", "risk-scoring", "stage-gating"]
        default:
            return ["classification", "routing", "validation"]
        }
    }

    private static func integrationSurfaces(for lane: String) -> [String] {
        switch lane {
        case "ai-intelligence":
            return ["seis-agent", "mcp", "skills", "plugins", "llm-routing"]
        case "design-systems":
            return ["design-review", "accessibility-review", "asset-governance"]
        case "cloud-ops":
            return ["deployment-gate", "observability", "rollback-plan"]
        case "security-governance":
            return ["security-scan", "threat-model", "credential-boundary"]
        default:
            return ["agent-role", "quality-gates", "reporting"]
        }
    }
}
