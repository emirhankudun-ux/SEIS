import Foundation

public struct SeisOrchestrationSurface: Codable, Equatable, Sendable {
    public let id: String
    public let mode: String
    public let gates: [String]
    public let hasCredentialBoundary: Bool

    public init(id: String, mode: String, gates: [String], hasCredentialBoundary: Bool) {
        self.id = id
        self.mode = mode
        self.gates = gates
        self.hasCredentialBoundary = hasCredentialBoundary
    }
}

public struct SeisOrchestrationDecision: Codable, Equatable, Sendable {
    public let approved: Bool
    public let remoteOrchestrator: String
    public let localHelperCount: Int
    public let blockers: [String]
}

public enum SeisOrchestrationPolicy {
    public static let requiredGates = Set(["mcp", "skills", "plugins", "llm-routing", "credential-boundary"])

    public static func evaluate(surfaces: [SeisOrchestrationSurface]) -> SeisOrchestrationDecision {
        var blockers: [String] = []
        let remote = surfaces.filter { $0.mode == "remote-orchestrator" }
        if remote.map(\.id) != ["seis-agent"] {
            blockers.append("remote_orchestrator_must_be_seis_agent_only")
        }

        for surface in surfaces {
            let gates = Set(surface.gates)
            if !requiredGates.isSubset(of: gates) {
                blockers.append("missing_required_orchestration_gates:\(surface.id)")
            }
            if !surface.hasCredentialBoundary {
                blockers.append("credential_boundary_missing:\(surface.id)")
            }
            if surface.id != "seis-agent" && surface.mode == "remote-orchestrator" {
                blockers.append("local_helper_promoted_to_remote:\(surface.id)")
            }
        }

        blockers.sort()
        return SeisOrchestrationDecision(
            approved: blockers.isEmpty,
            remoteOrchestrator: remote.first?.id ?? "",
            localHelperCount: surfaces.filter { $0.mode == "local-helper" }.count,
            blockers: blockers
        )
    }
}
