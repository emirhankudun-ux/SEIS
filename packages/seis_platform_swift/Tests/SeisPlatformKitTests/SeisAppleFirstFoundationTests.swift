import Testing
@testable import SeisPlatformKit

@Test func appleFirstFoundationCoversRequiredProductSurfaces() {
    let surfaces = Set(SEISAppleFirstFoundation.modules.map(\.surface))

    #expect(surfaces.contains(.macOS))
    #expect(surfaces.contains(.iPadOS))
    #expect(surfaces.contains(.iOS))
    #expect(SEISAppleFirstFoundation.modules.contains { $0.kind == .commandCenter })
    #expect(SEISAppleFirstFoundation.modules.contains { $0.kind == .brain })
}

@Test func appleFirstFoundationKeepsDemoMetadataPublicSafe() {
    #expect(SEISAppleFirstFoundation.hasOnlyPublicSafeDemoMetadata)
    #expect(SEISAppleFirstFoundation.providers.contains { $0.id == "local-demo" && !$0.requiresKey && $0.demoStatus == .noKeyDemo })
    #expect(SEISAppleFirstFoundation.sshProfiles.allSatisfy { !$0.storesCredentials })
    #expect(SEISAppleFirstFoundation.sshProfiles.allSatisfy { $0.status != .liveVerified })
    #expect(SEISAppleFirstFoundation.localDevelopmentTools.allSatisfy { $0.isPublicSafe && $0.status != .liveVerified })
}

@Test func appleFirstFoundationRoadmapMatchesSmallSafePrScope() {
    let roadmap = SEISAppleFirstFoundation.roadmap

    #expect(roadmap.first?.id == "a0")
    #expect(roadmap.first?.status == .implemented)
    #expect(roadmap.contains { $0.id == "a1" && $0.status == .scaffolded })
    #expect(roadmap.contains { $0.id == "a2" && $0.surface == .macOS && $0.status == .planned })
    #expect(roadmap.contains { $0.id == "a3" && $0.surface == .iPadOS && $0.status == .planned })
    #expect(roadmap.contains { $0.id == "a4" && $0.surface == .iOS && $0.status == .planned })
}

@Test func appleFirstFoundationStatusAvoidsFakeLiveClaims() {
    #expect(SEISStatus.implemented.isLiveClaim)
    #expect(!SEISStatus.demo.isLiveClaim)
    #expect(!SEISStatus.scaffolded.isLiveClaim)
    #expect(!SEISStatus.planned.isLiveClaim)
    #expect(!SEISStatus.requiresReview.isLiveClaim)
}

@Test func appleDesignTokensUseSeisAppleDirection() {
    let tokens = SEISAppleFirstFoundation.designTokens

    #expect(tokens.canvas == "deep-black")
    #expect(tokens.surface.contains("graphite"))
    #expect(tokens.accent == "electric-cyan")
    #expect(tokens.warning.contains("amber"))
}

@Test func appleFirstFoundationPublishesPublicSafeBrainAndSSHSnapshot() {
    let brainNoteIDs = Set(SEISAppleFirstFoundation.brainNotes.map(\.id))

    #expect(SEISAppleFirstFoundation.hasPublicSafeBrainAndSSHReadiness)
    #expect(SEISAppleFirstFoundation.brainNotes.count >= 3)
    #expect(SEISAppleFirstFoundation.brainNotes.allSatisfy { $0.visibility == .publicSafe })
    #expect(SEISAppleFirstFoundation.contextPacks.allSatisfy { contextPack in
        Set(contextPack.includedNoteIDs).isSubset(of: brainNoteIDs)
    })
    #expect(SEISAppleFirstFoundation.contextPacks.contains { $0.id == "seis-apple-native-context" && $0.allowedDestinations.contains("Xcode") })
    #expect(SEISAppleFirstFoundation.brainPublicPrivateBoundary.privateLocalCount == 0)
    #expect(SEISAppleFirstFoundation.brainPublicPrivateBoundary.needsReviewCount == 0)
    #expect(SEISAppleFirstFoundation.decisionRecords.allSatisfy { $0.status != .approvedForPublicUse })
    #expect(SEISAppleFirstFoundation.cloudStatuses.allSatisfy { $0.status != .liveVerified })
    #expect(SEISAppleFirstFoundation.safeCommands.contains { $0.commandPreview == "npm run check:seis-second-brain-readiness-contracts" })
    #expect(SEISAppleFirstFoundation.safeCommands.contains { $0.commandPreview == "npm run check:seis-ssh-access-model" && $0.requiresHumanReview })
    #expect(SEISAppleFirstFoundation.forbiddenSSHCommandPatterns.contains("git push --force"))
}

@Test func appleFirstFoundationRecordsXcodeAsPublicSafeTooling() {
    let tools = SEISAppleFirstFoundation.localDevelopmentTools
    let xcode = tools.first { $0.id == "xcode-seis-platform-swift" }
    let contextPackIDs = Set(SEISAppleFirstFoundation.contextPacks.map(\.id))

    #expect(xcode?.name == "Xcode")
    #expect(xcode?.surface == .macOS)
    #expect(xcode?.canWriteRepository == true)
    #expect(xcode?.requiresAPIKey == false)
    #expect(xcode?.observedState.contains("packages/seis_platform_swift") == true)

    #expect(tools.allSatisfy { $0.isPublicSafe })
    #expect(tools.allSatisfy { $0.status != .liveVerified })
    #expect(tools.allSatisfy { !$0.safetyNotes.joined(separator: " ").lowercased().contains("secret marker") })
    #expect(tools.compactMap(\.recommendedContextPackID).allSatisfy { contextPackIDs.contains($0) })
}
