import Foundation

public enum SeisAppleShellFocusPreference: String, Codable, CaseIterable, Sendable {
    case appleNative = "apple-native"
    case macOS = "macos"
    case iOS = "ios"

    public var request: String {
        switch self {
        case .appleNative:
            "SwiftUI macOS and iOS UIKit CloudKit Core Data workflow"
        case .macOS:
            "SwiftUI macOS AppKit Metal Combine Core Data CloudKit workflow"
        case .iOS:
            "iOS UIKit CloudKit Core Data workflow"
        }
    }
}

public struct SeisAppleShellSettingsContract: Codable, Equatable, Sendable {
    public let lowMotionKey: String
    public let preferredFocusKey: String
    public let showsQualityGatesKey: String
    public let defaultLowMotion: Bool
    public let defaultPreferredFocus: SeisAppleShellFocusPreference
    public let defaultShowsQualityGates: Bool

    public init(
        lowMotionKey: String,
        preferredFocusKey: String,
        showsQualityGatesKey: String,
        defaultLowMotion: Bool,
        defaultPreferredFocus: SeisAppleShellFocusPreference,
        defaultShowsQualityGates: Bool
    ) {
        self.lowMotionKey = lowMotionKey
        self.preferredFocusKey = preferredFocusKey
        self.showsQualityGatesKey = showsQualityGatesKey
        self.defaultLowMotion = defaultLowMotion
        self.defaultPreferredFocus = defaultPreferredFocus
        self.defaultShowsQualityGates = defaultShowsQualityGates
    }

    public static let appleNativeShell = SeisAppleShellSettingsContract(
        lowMotionKey: "seis.apple.shell.lowMotion",
        preferredFocusKey: "seis.apple.shell.preferredFocus",
        showsQualityGatesKey: "seis.apple.shell.showsQualityGates",
        defaultLowMotion: true,
        defaultPreferredFocus: .appleNative,
        defaultShowsQualityGates: true
    )

    public var appStorageKeys: [String] {
        [lowMotionKey, preferredFocusKey, showsQualityGatesKey]
    }

    public func focusPreference(for rawValue: String) -> SeisAppleShellFocusPreference {
        SeisAppleShellFocusPreference(rawValue: rawValue) ?? defaultPreferredFocus
    }

    public func request(for rawValue: String) -> String {
        focusPreference(for: rawValue).request
    }

    public var expectedSettingsViewTokens: [String] {
        [
            "lowMotionKey",
            "preferredFocusKey",
            "showsQualityGatesKey",
            "Settings",
            "TabView",
            "Toggle",
            "Picker",
            "Low Motion",
            "Quality Gates",
            "Preferred Focus"
        ]
    }

    public var expectedContinuationWindowTokens: [String] {
        [
            "@AppStorage",
            "lowMotionKey",
            "preferredFocusKey",
            "showsQualityGatesKey",
            "Quality Gates",
            "withAnimation",
            "onChange"
        ]
    }

    public var expectedSettingsCommandTokens: [String] {
        [
            "@AppStorage",
            "lowMotionKey",
            "showsQualityGatesKey",
            "CommandMenu(\"SEIS\")",
            "Toggle(\"Low Motion\"",
            "Toggle(\"Quality Gates\"",
            ".keyboardShortcut(\"m\", modifiers: [.command, .shift])",
            ".keyboardShortcut(\"g\", modifiers: [.command, .shift])"
        ]
    }
}
