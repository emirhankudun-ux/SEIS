import Foundation

public struct SeisPlatformDevelopmentBoundary: Codable, Equatable, Sendable {
    public let appleOnlyLanguageSurfaces: [String]
    public let appleNativeFrameworks: [String]
    public let windowsExcludedLanguageSurfaces: [String]
    public let javascriptPolicy: String
}

public struct SeisPlatformDevelopmentTracksSummary: Codable, Equatable, Sendable {
    public let trackCount: Int
    public let appleTrackCount: Int
    public let windowsTrackCount: Int
    public let governanceTrackCount: Int
    public let appleLanguageCount: Int
    public let appleNativeFrameworkCount: Int
    public let windowsRequiredLanguageCount: Int
    public let windowsExtendedLanguageCount: Int
    public let windowsLanguageCoverageCount: Int
    public let qualityGateCount: Int
}

public struct SeisPlatformDevelopmentTrack: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let lane: String
    public let platformScope: [String]
    public let relatedPlatforms: [String]?
    public let languages: [String]
    public let frameworks: [String]?
    public let forbiddenLanguages: [String]
    public let sourceRoots: [String]
    public let validationCommands: [String]
    public let agentRoles: [String]
    public let artifacts: [String]
    public let qualityGates: [String]
    public let executionRule: String
    public let continuationBias: String?
    public let boundaryRules: [String]?
}

public enum SeisPlatformDevelopmentTracksSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisPlatformDevelopmentTracksSnapshot: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let mode: String
    public let platformBoundaries: SeisPlatformDevelopmentBoundary
    public let summary: SeisPlatformDevelopmentTracksSummary
    public let tracks: [SeisPlatformDevelopmentTrack]

    public static func validated(from data: Data) throws -> SeisPlatformDevelopmentTracksSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisPlatformDevelopmentTracksSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisPlatformDevelopmentTracksSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let expectedTrackIDs = [
            "apple-native-macos-track",
            "windows-required-polyglot-track",
            "windows-extended-polyglot-track",
            "seis-platform-boundary-governance-track"
        ]
        let appleOnly: Set<String> = ["AppleScript", "Objective-C", "Playground", "Swift", "SwiftUI"]
        let trackIDs = tracks.map(\.id)
        let qualityGates = tracks.flatMap(\.qualityGates)
        if version != 1 || id != "seis-platform-development-tracks" || mode != "apple_native_continuation_and_windows_polyglot_execution_tracks" {
            issues.append("platform development track identity or mode is invalid")
        }
        if summary.trackCount != 4 || tracks.count != summary.trackCount || trackIDs != expectedTrackIDs || Set(trackIDs).count != trackIDs.count {
            issues.append("platform development track inventory is incomplete")
        }
        if platformBoundaries.appleOnlyLanguageSurfaces.count != 5 || Set(platformBoundaries.appleOnlyLanguageSurfaces) != appleOnly ||
            platformBoundaries.windowsExcludedLanguageSurfaces.count != 5 || Set(platformBoundaries.windowsExcludedLanguageSurfaces) != appleOnly ||
            platformBoundaries.appleNativeFrameworks.count != 10 ||
            !platformBoundaries.javascriptPolicy.contains("compatibility_only") {
            issues.append("platform development boundaries are incomplete")
        }
        let apple = tracks.first { $0.lane == "apple_native" }
        let windowsRequired = tracks.first { $0.lane == "windows_required" }
        let windowsExtended = tracks.first { $0.lane == "windows_extended" }
        let governance = tracks.first { $0.lane == "governance" }
        if summary.appleTrackCount != 1 || summary.windowsTrackCount != 2 || summary.governanceTrackCount != 1 ||
            apple?.languages.count != 5 || apple?.frameworks?.count != 10 ||
            windowsRequired?.languages.count != 18 || windowsExtended?.languages.count != 23 ||
            Set(windowsRequired?.forbiddenLanguages ?? []) != appleOnly || Set(windowsExtended?.forbiddenLanguages ?? []) != appleOnly ||
            governance?.languages.isEmpty == false {
            issues.append("platform development lane counts or forbidden surfaces are invalid")
        }
        if summary.appleLanguageCount != 5 || summary.appleNativeFrameworkCount != 10 ||
            summary.windowsRequiredLanguageCount != 18 || summary.windowsExtendedLanguageCount != 23 ||
            summary.windowsLanguageCoverageCount != 41 ||
            summary.qualityGateCount != Set(qualityGates).count || summary.qualityGateCount != 31 {
            issues.append("platform development summary counts are invalid")
        }
        if !tracks.allSatisfy({ track in
            !track.id.isEmpty && !track.label.isEmpty && !track.lane.isEmpty &&
                !track.platformScope.isEmpty && !track.sourceRoots.isEmpty &&
                !track.validationCommands.isEmpty && !track.agentRoles.isEmpty &&
                !track.artifacts.isEmpty && !track.qualityGates.isEmpty &&
                !track.executionRule.isEmpty &&
                track.languages.allSatisfy { !$0.isEmpty } &&
                track.forbiddenLanguages.allSatisfy { !$0.isEmpty }
        }) {
            issues.append("platform development tracks contain incomplete records")
        }
        if apple?.continuationBias?.isEmpty != false ||
            !(governance?.boundaryRules?.contains("runtime installs are requirement-led, never percentage-led") == true) ||
            !(apple?.executionRule.contains("Apple platform work continues through Swift") == true) ||
            !(windowsRequired?.executionRule.contains("must never use Swift") == true) {
            issues.append("platform development execution rules are incomplete")
        }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            mode == "apple_native_continuation_and_windows_polyglot_execution_tracks"
    }

    public var trackCount: Int { tracks.count }
    public var uniqueQualityGateCount: Int { Set(tracks.flatMap(\.qualityGates)).count }
}
