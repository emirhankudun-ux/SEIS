import Foundation
import OSLog

public enum SeisAppleShellTelemetryEvent: String, Codable, CaseIterable, Sendable {
    case focusCommandReceived = "focus_command_received"
    case focusPreferenceChanged = "focus_preference_changed"
    case focusRouteApplied = "focus_route_applied"
    case diagnosticsRefreshRequested = "diagnostics_refresh_requested"
    case diagnosticsRefreshed = "diagnostics_refreshed"
    case runtimeProbeSnapshot = "runtime_probe_snapshot"
}

public struct SeisAppleShellTelemetryContract: Codable, Equatable, Sendable {
    public let subsystem: String
    public let focusCategory: String
    public let diagnosticsCategory: String
    public let verificationCommand: String
    public let events: [SeisAppleShellTelemetryEvent]

    public init(
        subsystem: String,
        focusCategory: String,
        diagnosticsCategory: String,
        verificationCommand: String,
        events: [SeisAppleShellTelemetryEvent]
    ) {
        self.subsystem = subsystem
        self.focusCategory = focusCategory
        self.diagnosticsCategory = diagnosticsCategory
        self.verificationCommand = verificationCommand
        self.events = events
    }

    public static let appleNativeShell = SeisAppleShellTelemetryContract(
        subsystem: "com.seis.apple-native-shell",
        focusCategory: "Focus",
        diagnosticsCategory: "Diagnostics",
        verificationCommand: "./script/build_and_run.sh --telemetry",
        events: SeisAppleShellTelemetryEvent.allCases
    )

    public func category(for event: SeisAppleShellTelemetryEvent) -> String {
        switch event {
        case .focusCommandReceived, .focusPreferenceChanged, .focusRouteApplied:
            focusCategory
        case .diagnosticsRefreshRequested, .diagnosticsRefreshed, .runtimeProbeSnapshot:
            diagnosticsCategory
        }
    }

    public var expectedTelemetrySourceTokens: [String] {
        [
            "import OSLog",
            "Logger",
            "focus_route_applied",
            "diagnostics_refresh_requested",
            "diagnostics_refreshed",
            "runtime_probe_snapshot",
            "privacy: .public"
        ]
    }

    public var expectedFocusTelemetryTokens: [String] {
        [
            "SeisAppleShellTelemetryLogger",
            "telemetry.record(.focusCommandReceived",
            "telemetry.record(.focusPreferenceChanged",
            ".focusRouteApplied"
        ]
    }

    public var expectedDiagnosticsTelemetryTokens: [String] {
        [
            "SeisAppleShellTelemetryLogger",
            ".diagnosticsRefreshRequested",
            ".diagnosticsRefreshed",
            ".runtimeProbeSnapshot"
        ]
    }

    public var expectedCommandTelemetryTokens: [String] {
        [
            "CommandMenu(\"SEIS\")",
            "Refresh Diagnostics",
            "seisRefreshAppleDiagnostics",
            "NotificationCenter.default.post",
            ".keyboardShortcut(\"r\", modifiers: [.command, .shift])"
        ]
    }
}

public struct SeisAppleShellTelemetryLogger {
    private let focusLogger: Logger
    private let diagnosticsLogger: Logger
    private let contract: SeisAppleShellTelemetryContract

    public init(contract: SeisAppleShellTelemetryContract = .appleNativeShell) {
        self.contract = contract
        self.focusLogger = Logger(subsystem: contract.subsystem, category: contract.focusCategory)
        self.diagnosticsLogger = Logger(subsystem: contract.subsystem, category: contract.diagnosticsCategory)
    }

    public func record(_ event: SeisAppleShellTelemetryEvent, detail: String) {
        let safeDetail = detail
            .replacingOccurrences(of: "\n", with: " ")
            .replacingOccurrences(of: "\r", with: " ")
        logger(for: event).info("event=\(event.rawValue, privacy: .public) detail=\(safeDetail, privacy: .public)")
    }

    private func logger(for event: SeisAppleShellTelemetryEvent) -> Logger {
        if contract.category(for: event) == contract.focusCategory {
            focusLogger
        } else {
            diagnosticsLogger
        }
    }
}
