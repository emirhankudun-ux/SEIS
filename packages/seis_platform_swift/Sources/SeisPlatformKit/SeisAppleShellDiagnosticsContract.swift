import Foundation

public enum SeisAppleShellDiagnosticState: String, Codable, Sendable {
    case ready
    case watch

    public var label: String {
        switch self {
        case .ready:
            "Ready"
        case .watch:
            "Watch"
        }
    }
}

public struct SeisAppleShellDiagnosticItem: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let state: SeisAppleShellDiagnosticState
    public let evidence: String
    public let qualityGate: String

    public init(
        id: String,
        title: String,
        state: SeisAppleShellDiagnosticState,
        evidence: String,
        qualityGate: String
    ) {
        self.id = id
        self.title = title
        self.state = state
        self.evidence = evidence
        self.qualityGate = qualityGate
    }
}

public struct SeisAppleShellDiagnosticsContract: Codable, Equatable, Sendable {
    public let title: String
    public let summary: String
    public let items: [SeisAppleShellDiagnosticItem]
    public let validationCommands: [String]

    public init(
        title: String,
        summary: String,
        items: [SeisAppleShellDiagnosticItem],
        validationCommands: [String]
    ) {
        self.title = title
        self.summary = summary
        self.items = items
        self.validationCommands = validationCommands
    }

    public static let appleNativeShell = SeisAppleShellDiagnosticsContract(
        title: "Apple Shell Diagnostics",
        summary: "SwiftPM, run handoff, settings, and Apple quality-gate readiness for the SEIS Apple-native shell.",
        items: [
            SeisAppleShellDiagnosticItem(
                id: "swiftpm-package",
                title: "SwiftPM Package",
                state: .ready,
                evidence: "Package.swift exposes the SeisPlatformKit library and SeisAppleNativeShell executable.",
                qualityGate: "swift_test"
            ),
            SeisAppleShellDiagnosticItem(
                id: "run-handoff",
                title: "Run Handoff",
                state: .ready,
                evidence: "script/build_and_run.sh builds, stages, launches, and verifies the SwiftUI app bundle.",
                qualityGate: "offline_fallback"
            ),
            SeisAppleShellDiagnosticItem(
                id: "settings-flow",
                title: "Settings Flow",
                state: .ready,
                evidence: "Preferred focus, low motion, and quality-gate visibility are backed by AppStorage.",
                qualityGate: "accessibility_when_ui"
            ),
            SeisAppleShellDiagnosticItem(
                id: "apple-framework-policy",
                title: "Apple Framework Policy",
                state: .ready,
                evidence: "SwiftUI, AppKit, UIKit, Metal, Combine, Core Data, and CloudKit remain first-class surfaces.",
                qualityGate: "coredata_cloudkit_sync_review"
            )
        ],
        validationCommands: [
            "swift test --package-path packages/seis_platform_swift",
            "./script/build_and_run.sh --verify",
            "npm run check:seis-platform-kernel",
            "npm run check:seis-nonjs-kernel"
        ]
    )

    public var readyCount: Int {
        items.filter { $0.state == .ready }.count
    }

    public var isReady: Bool {
        !items.isEmpty && readyCount == items.count
    }

    public var accessibilitySummary: String {
        "\(title). \(readyCount) of \(items.count) checks ready. \(summary)"
    }

    public var expectedDiagnosticsViewTokens: [String] {
        [
            "AppleShellDiagnosticsView",
            "Diagnostics",
            "diagnostics.items",
            "item.title",
            "item.evidence",
            "item.qualityGate",
            "validationCommands",
            "accessibilityLabel"
        ]
    }
}
