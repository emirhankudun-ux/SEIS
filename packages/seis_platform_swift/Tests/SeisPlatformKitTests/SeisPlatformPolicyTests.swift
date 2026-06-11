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
    #expect(!policy.languages.contains("Python"))
    #expect(policy.languages.count >= 12)
    #expect(policy.isReadyForSEISAgent)
}

@Test func routingFindsBothPlatformFamilies() {
    let result = SeisPlatformPolicy.route(request: "SwiftUI macOS playground and Windows WinUI PowerShell support")
    #expect(result.contains(.macOS))
    #expect(result.contains(.windows))
}

@Test func developmentTracksKeepAppleAndWindowsBoundaries() {
    let tracks = SeisPlatformPolicy.developmentTracks
    let appleTrack = tracks.first { $0.id == "apple-native-macos-track" }
    let windowsTrack = tracks.first { $0.id == "windows-required-polyglot-track" }

    #expect(appleTrack?.languages == ["Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"])
    #expect(appleTrack?.forbiddenLanguages.contains("AppleScript") == false)
    #expect(windowsTrack?.languages.contains("PowerShell") == true)
    #expect(windowsTrack?.languages.contains("CMD") == true)
    #expect(windowsTrack?.languages.contains("Swift") == false)
    #expect(windowsTrack?.forbiddenLanguages.contains("SwiftUI") == true)
    #expect(windowsTrack?.forbiddenLanguages.contains("AppleScript") == true)
}

@Test func activeToolchainNamesCodexClaudeAndAppleLanguages() {
    let profile = SeisActiveToolchain.current
    #expect(profile.activeAIAssistants == ["OpenAI Codex", "Claude"])
    #expect(profile.activeIDEs.contains("Antigravity IDE"))
    #expect(profile.activeIDEs.contains("Cursor"))
    #expect(profile.activeIDEs.contains("Xcode"))
    #expect(profile.activeIDEs.contains("Android Studio"))
    #expect(profile.isAppleNativeReady)
    #expect(profile.collaborationSummary.contains("OpenAI Codex + Claude"))
}

@Test func marketReadinessLocksMainCodexClaudeAndDomainCoverage() {
    let input = SeisMarketReadinessInput(
        domains: SeisCapabilityDomainSet.required,
        contributorSignals: ["emirhankudun-ux", "OpenAI Codex", "Claude"],
        primaryBranch: "main",
        longLivedBranches: ["main"],
        websiteIsFinalSurface: true,
        appleLanguages: ["Swift", "SwiftUI", "Playground", "Objective-C", "AppleScript"],
        windowsAndroidLanguages: ["C#", "PowerShell", "C++", "Rust", "Go", "Java", "Kotlin", "SQL"],
        runtimeInstallPolicy: "requirement_led_only",
        addsNewJavaScript: false,
        addsNewPython: false,
        hasMITLicense: true,
        hasSecurityPolicy: true,
        hasContributingGuide: true,
        hasCodeOfConduct: true
    )

    let result = SeisMarketReadiness.evaluate(input)
    #expect(result.ready)
    #expect(result.score == 100)
    #expect(result.domainCount == 41)
    #expect(result.mainOnlyPolicy)
    #expect(result.codexClaudeVisible)
    #expect(result.blockers.isEmpty)
}

@Test func marketReadinessFailsWithoutClaudeAndMainPolicy() {
    let input = SeisMarketReadinessInput(
        domains: SeisCapabilityDomainSet.required,
        contributorSignals: ["emirhankudun-ux", "OpenAI Codex"],
        primaryBranch: "codex/seis-platform-polyglot-kernel",
        longLivedBranches: ["main", "codex/seis-platform-polyglot-kernel"],
        websiteIsFinalSurface: true,
        appleLanguages: ["Swift", "SwiftUI", "Playground", "Objective-C", "AppleScript"],
        windowsAndroidLanguages: ["C#", "PowerShell", "C++", "Rust", "Go", "Java", "Kotlin", "SQL"],
        runtimeInstallPolicy: "requirement_led_only",
        addsNewJavaScript: false,
        addsNewPython: false,
        hasMITLicense: true,
        hasSecurityPolicy: true,
        hasContributingGuide: true,
        hasCodeOfConduct: true
    )

    let result = SeisMarketReadiness.evaluate(input)
    #expect(!result.ready)
    #expect(result.blockers.contains("codex_claude_contributor_signal_missing"))
    #expect(result.blockers.contains("main_only_branch_policy_not_enforced"))
}

@Test func marketReadinessBlocksNewJavaScriptAndPythonGrowth() {
    let input = SeisMarketReadinessInput(
        domains: SeisCapabilityDomainSet.required,
        contributorSignals: ["emirhankudun-ux", "OpenAI Codex", "Claude"],
        primaryBranch: "main",
        longLivedBranches: ["main"],
        websiteIsFinalSurface: true,
        appleLanguages: ["Swift", "SwiftUI", "Playground", "Objective-C", "AppleScript"],
        windowsAndroidLanguages: ["C#", "PowerShell", "C++", "Rust", "Go", "Java", "Kotlin", "SQL"],
        runtimeInstallPolicy: "requirement_led_only",
        addsNewJavaScript: true,
        addsNewPython: true,
        hasMITLicense: true,
        hasSecurityPolicy: true,
        hasContributingGuide: true,
        hasCodeOfConduct: true
    )

    let result = SeisMarketReadiness.evaluate(input)
    #expect(!result.ready)
    #expect(result.blockers.contains("javascript_growth_frozen_for_current_phase"))
    #expect(result.blockers.contains("python_growth_frozen_for_current_phase"))
}
