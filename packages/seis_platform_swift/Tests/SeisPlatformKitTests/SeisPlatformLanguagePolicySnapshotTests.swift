import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Platform Language Policy Snapshot")
struct SeisPlatformLanguagePolicySnapshotTests {
    @Test func appleFirstAndWindowsPolyglotPolicyIsExplicit() throws {
        let snapshot = try SeisPlatformLanguagePolicySnapshot.validated(from: policyData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.appleLanguageCount == 5)
        #expect(snapshot.windowsLanguageCount == 41)
        #expect(snapshot.summary.appleNativeFrameworkCount == 10)
        #expect(snapshot.summary.windowsRequiredLanguageCount == 18)
        #expect(snapshot.apple.platforms == ["macos", "ios"])
    }

    @Test func windowsPolicyExcludesAppleOnlySurfaces() throws {
        let snapshot = try SeisPlatformLanguagePolicySnapshot.validated(from: policyData())
        let appleOnly = Set(["AppleScript", "Objective-C", "Playground", "Swift", "SwiftUI"])

        #expect(Set(snapshot.windows.excludedLanguageSurfaces) == appleOnly)
        #expect(Set(snapshot.windows.allowedLanguageSurfaces).intersection(appleOnly).isEmpty)
        #expect(snapshot.apple.continuationRule.localizedCaseInsensitiveContains("Apple-native"))
    }

    private func policyData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-platform-language-policy.json"))
    }
}
