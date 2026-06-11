import Foundation

public struct SeisCapabilityActivationSurface: Codable, Equatable, Sendable {
    public let id: String
    public let family: String
    public let mode: String
    public let missionMatched: Bool
    public let authReady: Bool
    public let targetKnown: Bool
    public let rollbackReady: Bool
    public let qualityGatePassed: Bool
    public let credentialBoundary: Bool
    public let writeCapable: Bool
    public let approvedForWrite: Bool

    public init(
        id: String,
        family: String,
        mode: String,
        missionMatched: Bool,
        authReady: Bool,
        targetKnown: Bool,
        rollbackReady: Bool,
        qualityGatePassed: Bool,
        credentialBoundary: Bool,
        writeCapable: Bool,
        approvedForWrite: Bool
    ) {
        self.id = id
        self.family = family
        self.mode = mode
        self.missionMatched = missionMatched
        self.authReady = authReady
        self.targetKnown = targetKnown
        self.rollbackReady = rollbackReady
        self.qualityGatePassed = qualityGatePassed
        self.credentialBoundary = credentialBoundary
        self.writeCapable = writeCapable
        self.approvedForWrite = approvedForWrite
    }
}

public struct SeisCapabilityActivationDecision: Codable, Equatable, Sendable {
    public let approvedSurfaceIDs: [String]
    public let blockedSurfaceIDs: [String]
    public let blockers: [String]

    public var ready: Bool {
        blockers.isEmpty
    }
}

public enum SeisCapabilityActivationGate {
    public static func evaluate(_ surfaces: [SeisCapabilityActivationSurface]) -> SeisCapabilityActivationDecision {
        var approved: [String] = []
        var blocked: [String] = []
        var blockers: [String] = []

        for surface in surfaces {
            var surfaceBlockers: [String] = []
            if !surface.missionMatched {
                surfaceBlockers.append("mission_not_matched:\(surface.id)")
            }
            if !surface.authReady {
                surfaceBlockers.append("auth_not_ready:\(surface.id)")
            }
            if !surface.targetKnown {
                surfaceBlockers.append("target_unknown:\(surface.id)")
            }
            if !surface.rollbackReady {
                surfaceBlockers.append("rollback_missing:\(surface.id)")
            }
            if !surface.qualityGatePassed {
                surfaceBlockers.append("quality_gate_failed:\(surface.id)")
            }
            if !surface.credentialBoundary {
                surfaceBlockers.append("credential_boundary_missing:\(surface.id)")
            }
            if surface.writeCapable && !surface.approvedForWrite {
                surfaceBlockers.append("write_approval_missing:\(surface.id)")
            }

            if surfaceBlockers.isEmpty {
                approved.append(surface.id)
            } else {
                blocked.append(surface.id)
                blockers.append(contentsOf: surfaceBlockers)
            }
        }

        approved.sort()
        blocked.sort()
        blockers.sort()
        return SeisCapabilityActivationDecision(
            approvedSurfaceIDs: approved,
            blockedSurfaceIDs: blocked,
            blockers: blockers
        )
    }
}
