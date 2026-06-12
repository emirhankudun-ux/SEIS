import Testing
@testable import SeisPlatformKit

@Test func macOSPolicyUsesAppleLanguages() {
    let policy = SeisPlatformPolicy.macOS
    #expect(policy.languages.contains("Swift"))
    #expect(policy.languages.contains("SwiftUI"))
    #expect(policy.languages.contains("Objective-C"))
    #expect(policy.languages.contains("Playground"))
    #expect(policy.languages.contains("AppleScript"))
    #expect(!policy.languages.contains("Python"))
    #expect(policy.frameworks.contains("SwiftUI"))
    #expect(policy.frameworks.contains("AppKit"))
    #expect(policy.frameworks.contains("Metal"))
    #expect(policy.frameworks.contains("Core Data"))
    #expect(policy.frameworks.contains("CloudKit"))
    #expect(policy.isReadyForSEISAgent)
}

@Test func iOSPolicyUsesAppleNativeFrameworks() {
    let policy = SeisPlatformPolicy.iOS
    #expect(policy.languages == ["Swift", "SwiftUI", "Objective-C"])
    #expect(policy.frameworks.contains("UIKit"))
    #expect(policy.frameworks.contains("Metal"))
    #expect(policy.frameworks.contains("Combine"))
    #expect(policy.frameworks.contains("Core Data"))
    #expect(policy.frameworks.contains("CloudKit"))
    #expect(!policy.languages.contains("Kotlin"))
    #expect(policy.isReadyForSEISAgent)
}

@Test func windowsPolicyUsesWindowsLanguages() {
    let policy = SeisPlatformPolicy.windows
    #expect(policy.languages.contains("C#"))
    #expect(policy.languages.contains("F#"))
    #expect(policy.languages.contains("Visual Basic"))
    #expect(policy.languages.contains("PowerShell"))
    #expect(policy.languages.contains("CMD"))
    #expect(policy.languages.contains("C"))
    #expect(policy.languages.contains("C++"))
    #expect(policy.languages.contains("Java"))
    #expect(policy.languages.contains("Kotlin"))
    #expect(!policy.languages.contains("Swift"))
    #expect(policy.languages.count >= 12)
    #expect(policy.isReadyForSEISAgent)
}

@Test func routingFindsBothPlatformFamilies() {
    let result = SeisPlatformPolicy.route(request: "SwiftUI macOS playground and Windows WinUI PowerShell support")
    #expect(result.contains(.macOS))
    #expect(result.contains(.windows))
}

@Test func routingFindsIOSAppleSurface() {
    let result = SeisPlatformPolicy.route(request: "iOS UIKit CloudKit Core Data workflow")
    #expect(result.contains(.iOS))
}

@Test func developmentTracksKeepAppleAndWindowsBoundaries() {
    let tracks = SeisPlatformPolicy.developmentTracks
    let appleTrack = tracks.first { $0.id == "apple-native-macos-track" }
    let iOSTrack = tracks.first { $0.id == "apple-native-ios-track" }
    let windowsTrack = tracks.first { $0.id == "windows-required-polyglot-track" }

    #expect(appleTrack?.languages == ["Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"])
    #expect(appleTrack?.forbiddenLanguages.contains("AppleScript") == false)
    #expect(appleTrack?.qualityGates.contains("coredata_cloudkit_sync_review") == true)
    #expect(iOSTrack?.languages == ["Swift", "SwiftUI", "Objective-C"])
    #expect(iOSTrack?.qualityGates.contains("uikit_accessibility") == true)
    #expect(windowsTrack?.languages.contains("PowerShell") == true)
    #expect(windowsTrack?.languages.contains("CMD") == true)
    #expect(windowsTrack?.languages.contains("Swift") == false)
    #expect(windowsTrack?.forbiddenLanguages.contains("SwiftUI") == true)
    #expect(windowsTrack?.forbiddenLanguages.contains("AppleScript") == true)
}
