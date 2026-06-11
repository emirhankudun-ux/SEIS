import Foundation

public struct SeisToolchainProfile: Codable, Equatable, Sendable {
    public let activeAIAssistants: [String]
    public let activeIDEs: [String]
    public let appleLanguages: [String]
    public let websiteIsFinalSurface: Bool
    public let runtimeInstallPolicy: String

    public init(
        activeAIAssistants: [String],
        activeIDEs: [String],
        appleLanguages: [String],
        websiteIsFinalSurface: Bool,
        runtimeInstallPolicy: String
    ) {
        self.activeAIAssistants = activeAIAssistants
        self.activeIDEs = activeIDEs
        self.appleLanguages = appleLanguages
        self.websiteIsFinalSurface = websiteIsFinalSurface
        self.runtimeInstallPolicy = runtimeInstallPolicy
    }

    public var isAppleNativeReady: Bool {
        Set(appleLanguages) == Set(["Swift", "SwiftUI", "Playground", "Objective-C", "AppleScript"]) &&
            activeIDEs.contains("Xcode") &&
            websiteIsFinalSurface &&
            runtimeInstallPolicy == "requirement_led_only"
    }

    public var collaborationSummary: String {
        let assistants = activeAIAssistants.joined(separator: " + ")
        let ides = activeIDEs.joined(separator: ", ")
        return "\(assistants) via \(ides)"
    }
}

public enum SeisActiveToolchain {
    public static let current = SeisToolchainProfile(
        activeAIAssistants: ["OpenAI Codex", "Claude"],
        activeIDEs: ["Antigravity IDE", "Cursor", "Xcode", "Android Studio"],
        appleLanguages: ["Swift", "SwiftUI", "Playground", "Objective-C", "AppleScript"],
        websiteIsFinalSurface: true,
        runtimeInstallPolicy: "requirement_led_only"
    )
}
