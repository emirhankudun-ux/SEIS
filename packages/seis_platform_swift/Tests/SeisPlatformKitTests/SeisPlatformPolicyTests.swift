import Testing
@testable import SeisPlatformKit

@Test func macOSPolicyUsesAppleLanguages() {
    let policy = SeisPlatformPolicy.macOS
    #expect(policy.languages.contains("Swift"))
    #expect(policy.languages.contains("Objective-C"))
    #expect(policy.languages.contains("AppleScript"))
    #expect(policy.frameworks.contains("SwiftUI"))
    #expect(policy.isReadyForSEISAgent)
}

@Test func windowsPolicyUsesWindowsLanguages() {
    let policy = SeisPlatformPolicy.windows
    #expect(policy.languages.contains("C#"))
    #expect(policy.languages.contains("F#"))
    #expect(policy.languages.contains("Visual Basic"))
    #expect(policy.languages.contains("PowerShell"))
    #expect(policy.languages.contains("C++"))
    #expect(policy.languages.contains("Java"))
    #expect(policy.languages.contains("Kotlin"))
    #expect(policy.languages.count >= 12)
    #expect(policy.isReadyForSEISAgent)
}

@Test func routingFindsBothPlatformFamilies() {
    let result = SeisPlatformPolicy.route(request: "SwiftUI macOS playground and Windows WinUI PowerShell support")
    #expect(result.contains(.macOS))
    #expect(result.contains(.windows))
}
