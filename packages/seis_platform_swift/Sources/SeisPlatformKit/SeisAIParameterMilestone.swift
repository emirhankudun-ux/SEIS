import Foundation

public struct SEISAIParameterMilestone: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let parameterClass: String
    public let title: String
    public let cadence: String
    public let routeEligibleToday: Bool
    public let evidenceGates: [String]
    public let forbiddenClaims: [String]
    public let verificationCommands: [String]

    public init(
        id: String,
        parameterClass: String,
        title: String,
        cadence: String,
        routeEligibleToday: Bool,
        evidenceGates: [String],
        forbiddenClaims: [String],
        verificationCommands: [String]
    ) {
        self.id = id
        self.parameterClass = parameterClass
        self.title = title
        self.cadence = cadence
        self.routeEligibleToday = routeEligibleToday
        self.evidenceGates = evidenceGates
        self.forbiddenClaims = forbiddenClaims
        self.verificationCommands = verificationCommands
    }
}

public extension SEISAppleFirstFoundation {
    static let aiScaleRoadmapSummary = "Plan-only local model scaling ladder. No trained weights, no live inference, and no route eligibility are claimed."

    static let aiScaleRoadmap: [SEISAIParameterMilestone] = [
        SEISAIParameterMilestone(
            id: "scale-20b",
            parameterClass: "20B",
            title: "Local compatibility floor",
            cadence: "Evidence collection before runtime work",
            routeEligibleToday: false,
            evidenceGates: ["model card", "dataset card", "memory benchmark"],
            forbiddenClaims: ["trained weights", "live inference", "AGI proof"],
            verificationCommands: ["npm run check:seis-model-scaling-hardware-profile", "npm run check:seis-model-parameter-ladder"]
        ),
        SEISAIParameterMilestone(
            id: "scale-70b",
            parameterClass: "70B",
            title: "Research ladder",
            cadence: "Blocked until 20B evidence exists",
            routeEligibleToday: false,
            evidenceGates: ["quantization plan", "hardware budget", "safety eval plan"],
            forbiddenClaims: ["downloaded checkpoint", "production route", "benchmark pass"],
            verificationCommands: ["npm run check:seis-model-parameter-ladder"]
        ),
        SEISAIParameterMilestone(
            id: "scale-150b",
            parameterClass: "150B",
            title: "Frontier program lane",
            cadence: "Plan-only frontier review",
            routeEligibleToday: false,
            evidenceGates: ["distributed runtime plan", "cost-stop gate", "human approval"],
            forbiddenClaims: ["cloud provisioning", "training run", "provider access"],
            verificationCommands: ["npm run check:seis-150b-frontier-model-program"]
        ),
        SEISAIParameterMilestone(
            id: "scale-300b-plus",
            parameterClass: "300B+",
            title: "Apex preparation band",
            cadence: "Long-horizon research boundary",
            routeEligibleToday: false,
            evidenceGates: ["independent review", "provenance plan", "rollback plan"],
            forbiddenClaims: ["runtime authority", "autonomous promotion", "deployment readiness"],
            verificationCommands: ["npm run check:seis-model-parameter-ladder"]
        ),
        SEISAIParameterMilestone(
            id: "scale-512b",
            parameterClass: "512B",
            title: "Apex model program",
            cadence: "AGI-readiness definition only",
            routeEligibleToday: false,
            evidenceGates: ["AGI eval protocol", "safety review", "public readiness evidence"],
            forbiddenClaims: ["AGI", "trained foundation model", "live benchmark"],
            verificationCommands: ["npm run check:seis-512b-apex-model-program"]
        ),
        SEISAIParameterMilestone(
            id: "scale-520b",
            parameterClass: "520B",
            title: "Upper public boundary",
            cadence: "Boundary label for UI and governance",
            routeEligibleToday: false,
            evidenceGates: ["governance signoff", "security review", "human approval"],
            forbiddenClaims: ["available model", "downloaded weights", "production AI system"],
            verificationCommands: ["npm run check:seis-520b-next-frontier-boundary"]
        )
    ]
}
