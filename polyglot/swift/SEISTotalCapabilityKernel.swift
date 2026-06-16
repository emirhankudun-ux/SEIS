import Foundation

public enum SEISPlatform: String, CaseIterable {
    case apple
    case android
    case windows
    case web
    case data
    case policy
}

public struct SEISCapability: Hashable {
    public let name: String
    public let platform: SEISPlatform
    public let languageFamilies: [String]
    public let requiresRuntimeInstall: Bool
    public let marketReady: Bool

    public init(
        name: String,
        platform: SEISPlatform,
        languageFamilies: [String],
        requiresRuntimeInstall: Bool = false,
        marketReady: Bool = false
    ) {
        self.name = name
        self.platform = platform
        self.languageFamilies = languageFamilies
        self.requiresRuntimeInstall = requiresRuntimeInstall
        self.marketReady = marketReady
    }
}

public enum SEISTotalCapabilityKernel {
    public static let appleOnlyLanguages = [
        "Swift",
        "SwiftUI",
        "Objective-C",
        "Objective-C++",
        "AppleScript",
        "Metal Shading Language",
        "Core ML metadata"
    ]

    public static func accepts(_ capability: SEISCapability) -> Bool {
        guard capability.requiresRuntimeInstall == false else { return false }
        guard capability.platform == .apple else { return true }
        return capability.languageFamilies.allSatisfy { appleOnlyLanguages.contains($0) }
    }

    public static func nextGate(for capability: SEISCapability) -> String {
        if !accepts(capability) { return "record product need, owner, cost, validation, and rollback before runtime expansion" }
        if !capability.marketReady { return "complete privacy, accessibility, low-motion, security, support, and release-note readiness" }
        return "eligible for reviewed main-branch release planning"
    }
}
