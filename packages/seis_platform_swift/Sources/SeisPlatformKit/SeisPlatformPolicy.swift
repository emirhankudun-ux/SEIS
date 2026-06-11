import Foundation

public enum SeisPlatform: String, Codable, CaseIterable, Sendable {
    case macOS = "macos"
    case windows = "windows"
}

public struct SeisPlatformCapability: Codable, Equatable, Sendable {
    public let platform: SeisPlatform
    public let languages: [String]
    public let agentRoles: [String]
    public let localHelpers: [String]
    public let remoteHelpers: [String]
    public let qualityGates: [String]
    public let frameworks: [String]
    public let supportsOfflineHelper: Bool
    public let supportsRemoteLLMBridge: Bool

    public init(
        platform: SeisPlatform,
        languages: [String],
        agentRoles: [String],
        localHelpers: [String],
        remoteHelpers: [String],
        qualityGates: [String],
        frameworks: [String] = [],
        supportsOfflineHelper: Bool,
        supportsRemoteLLMBridge: Bool
    ) {
        self.platform = platform
        self.languages = languages
        self.agentRoles = agentRoles
        self.localHelpers = localHelpers
        self.remoteHelpers = remoteHelpers
        self.qualityGates = qualityGates
        self.frameworks = frameworks
        self.supportsOfflineHelper = supportsOfflineHelper
        self.supportsRemoteLLMBridge = supportsRemoteLLMBridge
    }

    public var isReadyForSEISAgent: Bool {
        languages.count >= 2 &&
            !agentRoles.isEmpty &&
            qualityGates.count >= 5 &&
            supportsRemoteLLMBridge
    }
}

public struct SeisPlatformReadiness: Codable, Equatable, Sendable {
    public let platform: SeisPlatform
    public let ready: Bool
    public let qualityGateCount: Int
    public let languageCount: Int
    public let requiredActions: [String]
}

public struct SeisDevelopmentTrack: Codable, Equatable, Sendable {
    public let id: String
    public let platforms: [SeisPlatform]
    public let languages: [String]
    public let forbiddenLanguages: [String]
    public let validationCommands: [String]
    public let qualityGates: [String]
    public let executionRule: String
}

public enum SeisPlatformPolicy {
    public static let macOS = SeisPlatformCapability(
        platform: .macOS,
        languages: ["Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"],
        agentRoles: ["macos-agent", "apple-platform-agent", "local-helper-agent"],
        localHelpers: ["SwiftPM", "xcodebuild", "xcrun", "osascript", "osacompile"],
        remoteHelpers: ["SEIS Agent", "OpenAI", "Claude", "Gemini"],
        qualityGates: [
            "swift_test",
            "swiftui_playground_surface",
            "objective_c_syntax",
            "applescript_syntax_when_available",
            "permission_scope",
            "offline_fallback",
            "notarization_awareness",
            "accessibility_when_ui"
        ],
        frameworks: ["SwiftUI", "PlaygroundSupport", "Foundation", "AppleScript"],
        supportsOfflineHelper: true,
        supportsRemoteLLMBridge: true
    )

    public static let windows = SeisPlatformCapability(
        platform: .windows,
        languages: [
            "C#",
            "F#",
            "Visual Basic",
            "PowerShell",
            "Batch",
            "CMD",
            "C",
            "C++",
            "Rust",
            "Go",
            "Python",
            "Java",
            "Kotlin",
            "SQL",
            "R",
            "Lua",
            "Ruby",
            "PHP"
        ],
        agentRoles: ["windows-agent", "powershell-ops-agent", "dotnet-agent", "polyglot-runtime-agent"],
        localHelpers: ["PowerShell", "dotnet", "winget", "python", "go", "rustc", "javac", "clang++"],
        remoteHelpers: ["SEIS Agent", "OpenAI", "Claude", "Gemini"],
        qualityGates: [
            "powershell_policy",
            "dotnet_readiness",
            "windows_multilang_source_surface",
            "native_cpp_syntax_when_available",
            "jvm_syntax_when_available",
            "permission_scope",
            "offline_fallback",
            "windows_path_safety",
            "event_log_awareness",
            "no_swift_windows_surface"
        ],
        frameworks: [".NET", "WinUI", "WPF", "Windows Terminal", "WSL-aware CLI"],
        supportsOfflineHelper: true,
        supportsRemoteLLMBridge: true
    )

    public static let all: [SeisPlatformCapability] = [macOS, windows]

    public static let developmentTracks: [SeisDevelopmentTrack] = [
        SeisDevelopmentTrack(
            id: "apple-native-macos-track",
            platforms: [.macOS],
            languages: ["Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"],
            forbiddenLanguages: [],
            validationCommands: ["swift test", "xcrun swift --version", "xcodebuild -version", "osacompile -o /tmp/seis-platform-automation.scpt polyglot/applescript/seis_platform_automation.applescript"],
            qualityGates: ["swift_test", "swiftui_playground_surface", "objective_c_syntax", "applescript_syntax_when_available", "xcode_toolchain_verified"],
            executionRule: "Apple platform work may only use Swift, SwiftUI, Objective-C, Playground, and AppleScript surfaces."
        ),
        SeisDevelopmentTrack(
            id: "windows-required-polyglot-track",
            platforms: [.windows],
            languages: windows.languages,
            forbiddenLanguages: ["Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"],
            validationCommands: ["dotnet --info", "pwsh --version", "python3 --version"],
            qualityGates: ["no_swift_windows_surface", "dotnet_readiness_when_available", "powershell_policy"],
            executionRule: "Windows work is broad polyglot and excludes Apple-only language surfaces."
        )
    ]

    public static func readiness(for capability: SeisPlatformCapability) -> SeisPlatformReadiness {
        var actions: [String] = []
        if capability.languages.count < 2 {
            actions.append("add at least two native or cross-platform languages")
        }
        if capability.qualityGates.count < 5 {
            actions.append("add at least five platform quality gates")
        }
        if !capability.supportsOfflineHelper {
            actions.append("define offline local helper behavior")
        }
        if !capability.supportsRemoteLLMBridge {
            actions.append("define remote LLM bridge behavior")
        }

        return SeisPlatformReadiness(
            platform: capability.platform,
            ready: actions.isEmpty && capability.isReadyForSEISAgent,
            qualityGateCount: capability.qualityGates.count,
            languageCount: capability.languages.count,
            requiredActions: actions
        )
    }

    public static func route(request: String) -> [SeisPlatform] {
        let normalized = request.lowercased()
        var platforms: [SeisPlatform] = []
        if normalized.contains("mac") ||
            normalized.contains("ios") ||
            normalized.contains("swift") ||
            normalized.contains("apple") {
            platforms.append(.macOS)
        }
        if normalized.contains("windows") ||
            normalized.contains("powershell") ||
            normalized.contains("c#") ||
            normalized.contains("dotnet") ||
            normalized.contains("winui") {
            platforms.append(.windows)
        }
        return platforms.isEmpty ? SeisPlatform.allCases : platforms
    }
}
