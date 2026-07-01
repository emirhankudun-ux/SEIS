import Foundation
import Testing
@testable import SeisPlatformKit

@Test func publicDemoLaneRouteBuildsWebsiteFileURL() throws {
    let root = URL(fileURLWithPath: "/tmp/SEIS")
    let route = try #require(SeisPublicDemoLaneRoute(
        deepLink: "apps/web/seis-linux-replica.html?demo=live&source=website"
    ))

    #expect(route.relativePath == SeisPublicDemoLaneRoute.expectedRelativePath)
    #expect(route.queryValue(for: "source") == "website")
    #expect(route.source == .website)
    #expect(route.appLibrarySurface?.id == "website-lane")
    #expect(route.appLibrarySurface?.shortCode == "WEB")
    #expect(route.isAllowedPublicDemoLane)

    let url = try #require(route.fileURL(repositoryRoot: root))
    #expect(url.isFileURL)
    #expect(url.path == "/tmp/SEIS/apps/web/seis-linux-replica.html")
    #expect(url.query == "demo=live&source=website")
}

@Test func publicDemoLaneRouteBuildsUbuntuFileURLWithQueryOrderFlexibility() throws {
    let root = URL(fileURLWithPath: "/tmp/SEIS")
    let route = try #require(SeisPublicDemoLaneRoute(
        deepLink: "apps/web/seis-linux-replica.html?source=ubuntu&demo=live"
    ))

    #expect(route.queryValue(for: "source") == "ubuntu")
    #expect(route.source == .ubuntu)
    #expect(route.appLibrarySurface?.id == "ubuntu-desktop-lane")
    #expect(route.appLibrarySurface?.shortCode == "UBU")
    #expect(route.isAllowedPublicDemoLane)

    let url = try #require(SeisPublicDemoLaneRoute.fileURL(
        repositoryRoot: root,
        deepLink: "apps/web/seis-linux-replica.html?source=ubuntu&demo=live"
    ))
    #expect(url.path == "/tmp/SEIS/apps/web/seis-linux-replica.html")
    #expect(url.query == "source=ubuntu&demo=live")
}

@Test func publicDemoLaneRouteRejectsNonPublicDemoDestinations() {
    let root = URL(fileURLWithPath: "/tmp/SEIS")
    let rejectedDeepLinks = [
        "https://example.com/seis-linux-replica.html?demo=live&source=website",
        "/tmp/seis-linux-replica.html?demo=live&source=website",
        "apps/web/seis-linux-replica.html?demo=live&source=prod",
        "apps/web/seis-linux-replica.html?demo=live&source=website&token=secret",
        "apps/web/index.html?demo=live&source=website",
        "apps/web/seis-linux-replica.html?source=website"
    ]

    for deepLink in rejectedDeepLinks {
        #expect(SeisPublicDemoLaneRoute.fileURL(repositoryRoot: root, deepLink: deepLink) == nil)
    }
}

@Test func appLibraryContractKeepsWebsiteAndUbuntuAsSeisSurfaces() throws {
    let library = try #require(SeisAppLibraryContract.surface(id: "seis-app-library"))
    let website = try #require(SeisAppLibraryContract.surface(id: "website-lane"))
    let ubuntu = try #require(SeisAppLibraryContract.surface(id: "ubuntu-desktop-lane"))

    #expect(library.title == "SEIS App Library")
    #expect(library.shortCode == "LIB")
    #expect(SeisAppLibraryContract.hiddenSourcePolicy.contains("hidden inputs"))
    #expect(SeisAppLibraryContract.sourceLaneSurfaces.count == 2)
    #expect(SeisAppLibraryContract.moduleCount == 219)

    #expect(website.laneSource == .website)
    #expect(website.title == "Website Lane")
    #expect(website.deepLink == "apps/web/seis-linux-replica.html?demo=live&source=website")
    #expect(website.status == .noKeyDemo)

    #expect(ubuntu.laneSource == .ubuntu)
    #expect(ubuntu.title == "Ubuntu Desktop")
    #expect(ubuntu.deepLink == "apps/web/seis-linux-replica.html?demo=live&source=ubuntu")
    #expect(ubuntu.status == .noKeyDemo)

    #expect(SeisPublicDemoLaneSource.website.archiveID == "stitch_yapay_zeka_web_platformu")
    #expect(SeisPublicDemoLaneSource.ubuntu.archiveID == "stitch_web_based_linux_desktop")
}

@Test func appLibraryContractSeparatesChatCodeAgiAndSSHWithoutLiveClaims() throws {
    let nativeShell = try #require(SeisAppLibraryContract.surface(id: "apple-native-shell"))
    let aiChat = try #require(SeisAppLibraryContract.surface(id: "seis-ai-chat"))
    let codeAI = try #require(SeisAppLibraryContract.surface(id: "seis-code-ai"))
    let agi = try #require(SeisAppLibraryContract.surface(id: "seis-agi-control"))
    let ssh = try #require(SeisAppLibraryContract.surface(id: "seis-ssh-control"))

    #expect(nativeShell.kind == .nativeShell)
    #expect(nativeShell.shortCode == "APL")
    #expect(nativeShell.summary.contains("Linux Replica"))
    #expect(nativeShell.summary.contains("contained"))
    #expect(nativeShell.summary.contains("browser sandbox"))
    #expect(nativeShell.status == .metadataOnly)
    #expect(!nativeShell.requiresBackend)
    #expect(!nativeShell.requiresHumanApproval)
    #expect(nativeShell.forbiddenLiveClaims.contains("host shell bridge"))

    #expect(aiChat.kind == .aiChat)
    #expect(codeAI.kind == .codeAI)
    #expect(aiChat.id != codeAI.id)
    #expect(aiChat.shortCode == "AI")
    #expect(codeAI.shortCode == "IDE")

    #expect([aiChat, codeAI, agi, ssh].allSatisfy { $0.requiresBackend })
    #expect([aiChat, codeAI, agi, ssh].allSatisfy { $0.requiresHumanApproval })
    #expect([aiChat, codeAI, agi, ssh].allSatisfy { $0.status == .metadataOnly })
    #expect([aiChat, codeAI, agi, ssh].allSatisfy { !$0.forbiddenLiveClaims.isEmpty })

    #expect(SeisAppLibraryContract.guardedLiveSurfaces.map(\.id).contains("seis-ssh-control"))
    #expect(SeisAppLibraryContract.isPublicDemoSafe)
}
