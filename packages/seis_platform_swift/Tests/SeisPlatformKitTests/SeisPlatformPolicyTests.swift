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

@Test func orchestrationPolicyApprovesSeisAgentRemoteAndLocalHelpers() {
    let surfaces = [
        SeisOrchestrationSurface(id: "seis-agent", mode: "remote-orchestrator", gates: ["mcp", "skills", "plugins", "llm-routing", "credential-boundary"], hasCredentialBoundary: true),
        SeisOrchestrationSurface(id: "openai", mode: "local-helper", gates: ["mcp", "skills", "plugins", "llm-routing", "credential-boundary"], hasCredentialBoundary: true),
        SeisOrchestrationSurface(id: "claude", mode: "local-helper", gates: ["mcp", "skills", "plugins", "llm-routing", "credential-boundary"], hasCredentialBoundary: true),
        SeisOrchestrationSurface(id: "ollama", mode: "local-helper", gates: ["mcp", "skills", "plugins", "llm-routing", "credential-boundary"], hasCredentialBoundary: true)
    ]

    let decision = SeisOrchestrationPolicy.evaluate(surfaces: surfaces)
    #expect(decision.approved)
    #expect(decision.remoteOrchestrator == "seis-agent")
    #expect(decision.localHelperCount == 3)
    #expect(decision.blockers.isEmpty)
}

@Test func orchestrationPolicyBlocksRemoteHelperPromotion() {
    let surfaces = [
        SeisOrchestrationSurface(id: "seis-agent", mode: "remote-orchestrator", gates: ["mcp", "skills", "plugins", "llm-routing", "credential-boundary"], hasCredentialBoundary: true),
        SeisOrchestrationSurface(id: "openai", mode: "remote-orchestrator", gates: ["llm-routing"], hasCredentialBoundary: false)
    ]

    let decision = SeisOrchestrationPolicy.evaluate(surfaces: surfaces)
    #expect(!decision.approved)
    #expect(decision.blockers.contains("local_helper_promoted_to_remote:openai"))
    #expect(decision.blockers.contains("credential_boundary_missing:openai"))
    #expect(decision.blockers.contains("missing_required_orchestration_gates:openai"))
    #expect(decision.blockers.contains("remote_orchestrator_must_be_seis_agent_only"))
}

@Test func branchGovernanceBlocksUnmergedAndUnconfirmedBranches() {
    let result = SeisBranchGovernance.evaluate(
        SeisBranchGovernanceInput(
            defaultBranch: "main",
            protectedBranches: ["main"],
            remoteBranches: ["origin/main", "origin/codex/work", "origin/claude/review", "origin/legacy"],
            mergedIntoMainBranches: ["codex/work"],
            confirmedDeleteBranches: []
        )
    )

    #expect(result.mainIsDefault)
    #expect(result.blockers.contains("delete_confirmation_missing:codex/work"))
    #expect(result.blockers.contains("non_main_branch_not_merged_into_main:claude/review"))
    #expect(result.blockers.contains("non_main_branch_requires_manual_review:legacy"))
}

@Test func branchGovernanceRequiresActualDeletionForMainOnlyReadiness() {
    let result = SeisBranchGovernance.evaluate(
        SeisBranchGovernanceInput(
            defaultBranch: "main",
            protectedBranches: ["main"],
            remoteBranches: ["origin/main", "origin/codex/work"],
            mergedIntoMainBranches: ["origin/codex/work"],
            confirmedDeleteBranches: ["codex/work"]
        )
    )

    #expect(result.deletableBranches == ["codex/work"])
    #expect(result.blockers.isEmpty)
    #expect(!result.readyForMainOnlyRepository)
}

@Test func branchGovernanceReadyWhenOnlyMainExists() {
    let result = SeisBranchGovernance.evaluate(
        SeisBranchGovernanceInput(
            defaultBranch: "main",
            protectedBranches: ["main"],
            remoteBranches: ["origin/HEAD -> origin/main", "origin/main"],
            mergedIntoMainBranches: [],
            confirmedDeleteBranches: []
        )
    )

    #expect(result.readyForMainOnlyRepository)
}

@Test func capabilityActivationApprovesSmallRelevantSet() {
    let decision = SeisCapabilityActivationGate.evaluate([
        SeisCapabilityActivationSurface(
            id: "github",
            family: "repository",
            mode: "local-cli",
            missionMatched: true,
            authReady: true,
            targetKnown: true,
            rollbackReady: true,
            qualityGatePassed: true,
            credentialBoundary: true,
            writeCapable: true,
            approvedForWrite: true
        ),
        SeisCapabilityActivationSurface(
            id: "swiftpm",
            family: "apple",
            mode: "local-cli",
            missionMatched: true,
            authReady: true,
            targetKnown: true,
            rollbackReady: true,
            qualityGatePassed: true,
            credentialBoundary: true,
            writeCapable: false,
            approvedForWrite: false
        )
    ])

    #expect(decision.ready)
    #expect(decision.approvedSurfaceIDs == ["github", "swiftpm"])
    #expect(decision.blockedSurfaceIDs.isEmpty)
}

@Test func capabilityActivationBlocksUnsafeBroadUse() {
    let decision = SeisCapabilityActivationGate.evaluate([
        SeisCapabilityActivationSurface(
            id: "slack",
            family: "collaboration",
            mode: "connector",
            missionMatched: false,
            authReady: false,
            targetKnown: false,
            rollbackReady: false,
            qualityGatePassed: false,
            credentialBoundary: false,
            writeCapable: true,
            approvedForWrite: false
        )
    ])

    #expect(!decision.ready)
    #expect(decision.blockedSurfaceIDs == ["slack"])
    #expect(decision.blockers.contains("mission_not_matched:slack"))
    #expect(decision.blockers.contains("auth_not_ready:slack"))
    #expect(decision.blockers.contains("target_unknown:slack"))
    #expect(decision.blockers.contains("rollback_missing:slack"))
    #expect(decision.blockers.contains("quality_gate_failed:slack"))
    #expect(decision.blockers.contains("credential_boundary_missing:slack"))
    #expect(decision.blockers.contains("write_approval_missing:slack"))
}

@Test func aiProviderRouterSelectsOnlineHelpersWithSeisRemoteAgent() {
    let decision = SeisAIProviderRouter.evaluate(networkOnline: true)

    #expect(decision.ready)
    #expect(decision.remoteOrchestrator == "seis-agent")
    #expect(decision.selectedLocalHelpers == ["openai", "claude", "gemini"])
    #expect(decision.offlineFallback == "ollama-standby")
    #expect(decision.blockers.isEmpty)
}

@Test func aiProviderRouterUsesOllamaWhenOffline() {
    let decision = SeisAIProviderRouter.evaluate(networkOnline: false)

    #expect(decision.ready)
    #expect(decision.remoteOrchestrator == "seis-agent")
    #expect(decision.selectedLocalHelpers == ["ollama"])
    #expect(decision.offlineFallback == "ollama")
    #expect(decision.blockers.isEmpty)
}

@Test func aiProviderRouterBlocksRemoteHelperPromotion() {
    var providers = SeisAIProviderRouter.defaultProviders
    providers[1] = SeisAIProviderSurface(
        id: "openai",
        role: "remote-orchestrator",
        runtime: "remote-api",
        onlineCapable: true,
        offlineCapable: false,
        authReady: true,
        credentialBoundary: false,
        priority: 10
    )

    let decision = SeisAIProviderRouter.evaluate(networkOnline: true, providers: providers)

    #expect(!decision.ready)
    #expect(decision.blockers.contains("local_helper_promoted_to_remote:openai"))
    #expect(decision.blockers.contains("credential_boundary_missing:openai"))
    #expect(decision.blockers.contains("remote_orchestrator_must_be_seis_agent_only"))
}

@Test func repositoryShowcaseGateRequiresGithubMarketSignals() {
    let result = SeisRepositoryShowcaseGate.evaluate(
        SeisRepositoryShowcaseInput(
            readmeSections: SeisRepositoryShowcaseGate.requiredReadmeSections,
            communityFiles: SeisRepositoryShowcaseGate.requiredCommunityFiles,
            contributorSignals: SeisRepositoryShowcaseGate.requiredContributorSignals,
            platformSignals: SeisRepositoryShowcaseGate.requiredPlatformSignals,
            validationSignals: SeisRepositoryShowcaseGate.requiredValidationSignals,
            aiRoutingSignals: SeisRepositoryShowcaseGate.requiredAIRoutingSignals,
            branchPolicy: "main-centered",
            websiteIsFinalSurface: true,
            dependencyPolicy: "requirement-led",
            addsNewJavaScript: false,
            addsNewPython: false
        )
    )

    #expect(result.ready)
    #expect(result.score == 100)
    #expect(result.verifiedSignalCount >= 28)
    #expect(result.blockers.isEmpty)
}

@Test func repositoryShowcaseGateBlocksWeakPublicSurface() {
    let result = SeisRepositoryShowcaseGate.evaluate(
        SeisRepositoryShowcaseInput(
            readmeSections: ["Active Collaboration Stack", "Contributors"],
            communityFiles: ["LICENSE"],
            contributorSignals: ["emirhankudun-ux", "OpenAI Codex"],
            platformSignals: ["apple-only-languages"],
            validationSignals: ["swift-test"],
            aiRoutingSignals: ["online-ai-local-helpers"],
            branchPolicy: "branch-sprawl",
            websiteIsFinalSurface: false,
            dependencyPolicy: "install-everything",
            addsNewJavaScript: true,
            addsNewPython: true
        )
    )

    #expect(!result.ready)
    #expect(result.blockers.contains("contributor_signal_missing:Claude"))
    #expect(result.blockers.contains("community_file_missing:CONTRIBUTING.md"))
    #expect(result.blockers.contains("readme_section_missing:Repository Governance"))
    #expect(result.blockers.contains("platform_signal_missing:windows-non-apple-polyglot"))
    #expect(result.blockers.contains("ai_routing_signal_missing:ollama-offline-fallback"))
    #expect(result.blockers.contains("branch_policy_must_be_main_centered"))
    #expect(result.blockers.contains("dependency_policy_must_be_requirement_led"))
    #expect(result.blockers.contains("javascript_growth_frozen_for_current_phase"))
    #expect(result.blockers.contains("python_growth_frozen_for_current_phase"))
}

@Test func universalDomainCoverageGateCoversAllRequestedDomains() {
    let result = SeisUniversalDomainCoverageGate.evaluate()

    #expect(result.ready)
    #expect(result.domainCount == 41)
    #expect(result.requiredDomainCount == 41)
    #expect(result.laneCount >= 10)
    #expect(result.coveragePercent == 100)
    #expect(result.blockers.isEmpty)
}

@Test func universalDomainCoverageGateBlocksWeakDomainCoverage() {
    let result = SeisUniversalDomainCoverageGate.evaluate(profiles: [
        SeisUniversalDomainProfile(
            id: "ai-agent",
            lane: "ai-intelligence",
            agentRole: "",
            algorithms: ["intent-routing"],
            flow: "",
            qualityGates: ["security"],
            platformBoundaries: ["apple-only-apple-languages"],
            integrationSurfaces: []
        )
    ])

    #expect(!result.ready)
    #expect(result.blockers.contains("missing_domain:mcp"))
    #expect(result.blockers.contains("domain_agent_missing:ai-agent"))
    #expect(result.blockers.contains("domain_algorithms_insufficient:ai-agent"))
    #expect(result.blockers.contains("domain_flow_missing:ai-agent"))
    #expect(result.blockers.contains("domain_quality_gate_missing:ai-agent:maintainability"))
    #expect(result.blockers.contains("domain_platform_boundary_missing:ai-agent:windows-android-non-apple-polyglot"))
    #expect(result.blockers.contains("domain_integration_surface_missing:ai-agent"))
    #expect(result.blockers.contains("domain_lane_coverage_too_narrow"))
}
