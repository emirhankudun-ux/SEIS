import Foundation

public struct SEISDevelopmentLane: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let label: String
    public let surface: String
    public let status: String
    public let route: String
    public let validator: String
    public let detail: String

    public init(
        id: String,
        label: String,
        surface: String,
        status: String,
        route: String,
        validator: String,
        detail: String
    ) {
        self.id = id
        self.label = label
        self.surface = surface
        self.status = status
        self.route = route
        self.validator = validator
        self.detail = detail
    }
}

public extension SEISAppleFirstFoundation {
    static let developmentLaneBridgeSummary =
        "Cross-lane bridge for Desktop OS, Linux Replica, SEIS Code, Apple Swift, and AI Core with plan-only model ladder boundaries."

    static let developmentLanes: [SEISDevelopmentLane] = [
        SEISDevelopmentLane(
            id: "desktop-os",
            label: "SEIS Desktop OS",
            surface: "Browser shell",
            status: "Working",
            route: "./desktop.html",
            validator: "npm run check:desktop-os",
            detail: "Single-entry demo with virtual workspaces, Control Center, and browser-local VFS."
        ),
        SEISDevelopmentLane(
            id: "linux-replica",
            label: "SEIS Linux Replica",
            surface: "Web Linux route",
            status: "Working",
            route: "./seis-linux-replica.html",
            validator: "npm run check:seis-linux-replica-browser-smoke",
            detail: "291 launcher targets, contained Apple Native Shell capsule, functional workflows, and no-host boundary."
        ),
        SEISDevelopmentLane(
            id: "seis-code",
            label: "SEIS Code IDE",
            surface: "Browser IDE",
            status: "Working",
            route: "./seis-code.html",
            validator: "npm run check:seis-code",
            detail: "Monaco editor, Command Lens, Design Handoff, and Local Demo REPL."
        ),
        SEISDevelopmentLane(
            id: "apple-swift",
            label: "Apple Swift Native",
            surface: "SwiftPM package",
            status: "Validated",
            route: "packages/seis_platform_swift",
            validator: "swift test --package-path packages/seis_platform_swift",
            detail: "SeisPlatformKit and SeisAppleNativeShell with public-safe tooling metadata."
        ),
        SEISDevelopmentLane(
            id: "ai-core",
            label: "SEIS AI Core",
            surface: "Governance + Local Demo",
            status: "Plan-only ladder",
            route: "./desktop.html#ai-assistant",
            validator: "npm run check:seis-model-parameter-ladder",
            detail: "Provider-neutral registry and 20B to 520B parameter ladder without live inference."
        )
    ]

    static let developmentLaneValidators: [String] = [
        "npm run check:desktop-os",
        "npm run check:seis-code",
        "npm run check:seis-model-parameter-ladder",
        "npm run check:seis-ai-core-provider-registry",
        "npm run check:seis-installed-ai-tools-registry",
        "swift test --package-path packages/seis_platform_swift"
    ]
}
