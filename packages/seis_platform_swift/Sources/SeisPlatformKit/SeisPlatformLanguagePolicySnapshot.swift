import Foundation

public struct SeisPlatformLanguagePolicySummary: Codable, Equatable, Sendable {
    public let appleLanguageCount: Int
    public let appleNativeFrameworkCount: Int
    public let windowsLanguageCount: Int
    public let windowsRequiredLanguageCount: Int
    public let appleOnlyLanguageSurfaces: [String]
    public let appleNativeFrameworks: [String]
    public let windowsExcludedLanguageSurfaces: [String]
}

public struct SeisAppleLanguagePolicySurface: Codable, Equatable, Sendable {
    public let platforms: [String]
    public let allowedLanguageSurfaces: [String]
    public let prioritizedFrameworks: [String]
    public let allowedSourceRoots: [String]
    public let rule: String
    public let continuationRule: String
}

public struct SeisWindowsLanguagePolicySurface: Codable, Equatable, Sendable {
    public let platforms: [String]
    public let allowedLanguageSurfaces: [String]
    public let requiredLanguageSurfaces: [String]
    public let excludedLanguageSurfaces: [String]
    public let rule: String
}

public enum SeisPlatformLanguagePolicySnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisPlatformLanguagePolicySnapshot: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let mode: String
    public let summary: SeisPlatformLanguagePolicySummary
    public let apple: SeisAppleLanguagePolicySurface
    public let windows: SeisWindowsLanguagePolicySurface
    public let routingRule: String

    public static func validated(from data: Data) throws -> SeisPlatformLanguagePolicySnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisPlatformLanguagePolicySnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisPlatformLanguagePolicySnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if version != 1 || id != "seis-platform-language-policy" || mode != "apple_native_continuation_first_with_windows_polyglot_support" || routingRule.isEmpty { issues.append("platform language policy identity is invalid") }
        if summary.appleLanguageCount != 5 || summary.appleNativeFrameworkCount != 10 || summary.windowsLanguageCount != 41 || summary.windowsRequiredLanguageCount != 18 { issues.append("platform language policy summary counts are invalid") }
        let appleOnly: Set<String> = ["AppleScript", "Objective-C", "Playground", "Swift", "SwiftUI"]
        if Set(summary.appleOnlyLanguageSurfaces) != appleOnly || Set(summary.windowsExcludedLanguageSurfaces) != appleOnly || summary.appleNativeFrameworks.count != 10 { issues.append("Apple-only language policy surfaces are invalid") }
        if apple.platforms != ["macos", "ios"] || Set(apple.allowedLanguageSurfaces) != appleOnly || apple.prioritizedFrameworks.count != 10 || apple.allowedSourceRoots.isEmpty || apple.rule.isEmpty || apple.continuationRule.isEmpty { issues.append("Apple platform continuation policy is incomplete") }
        let requiredWindows: Set<String> = ["C#", "F#", "Visual Basic", "PowerShell", "Batch", "CMD", "C", "C++", "Rust", "Go", "Python", "Java", "Kotlin", "SQL", "R", "Lua", "Ruby", "PHP"]
        if windows.platforms != ["windows"] || windows.requiredLanguageSurfaces.count != 18 || !requiredWindows.isSubset(of: Set(windows.requiredLanguageSurfaces)) || Set(windows.excludedLanguageSurfaces) != appleOnly || Set(windows.allowedLanguageSurfaces).intersection(appleOnly).isEmpty == false || windows.rule.isEmpty { issues.append("Windows polyglot policy is incomplete or includes Apple-only surfaces") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty }
    public var appleLanguageCount: Int { summary.appleLanguageCount }
    public var windowsLanguageCount: Int { summary.windowsLanguageCount }
}
