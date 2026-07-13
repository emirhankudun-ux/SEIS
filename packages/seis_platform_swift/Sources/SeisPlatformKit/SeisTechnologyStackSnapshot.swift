import Foundation

public struct SeisTechnologyStackSourceReference: Codable, Equatable, Sendable {
    public let languageDistribution: String
    public let fullstackLanguageMatrix: String
    public let requestedSoftwareStack: String
}

public struct SeisTechnologyStackSummary: Codable, Equatable, Sendable {
    public let sourceLanguageCount: Int
    public let ecosystemGroupCount: Int
    public let ecosystemTechnologyCount: Int
    public let requestedCoreStackCount: Int
    public let githubFocusedPanels: [String]
    public let githubLanguagePolicy: String
}

public struct SeisTechnologyStackSourceLanguage: Codable, Equatable, Identifiable, Sendable {
    public let order: Int
    public let id: String
    public let label: String
    public let kind: String
    public let githubLanguageSurface: Bool
    public let githubBytes: Int
    public let layer: String
    public let entrypoints: [String]

    public var isSourceLanguage: Bool {
        kind == "source-language" && githubLanguageSurface
    }
}

public struct SeisTechnologyStackTechnology: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let order: Int
}

public struct SeisTechnologyStackGroup: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let kind: String
    public let technologies: [SeisTechnologyStackTechnology]
}

public enum SeisTechnologyStackSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisTechnologyStackSnapshot: Codable, Equatable, Sendable {
    public let version: Int
    public let id: String
    public let generatedAt: String
    public let mode: String
    public let sourceReferences: SeisTechnologyStackSourceReference
    public let summary: SeisTechnologyStackSummary
    public let sourceLanguageCatalog: [SeisTechnologyStackSourceLanguage]
    public let ecosystemGroups: [SeisTechnologyStackGroup]
    public let governance: [String]

    public static func validated(from data: Data) throws -> SeisTechnologyStackSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisTechnologyStackSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisTechnologyStackSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if version != 1 || id != "seis-technology-stack" || generatedAt.isEmpty || mode != "source_languages_plus_ecosystem_stack" {
            issues.append("technology stack identity or mode is invalid")
        }
        if sourceReferences.languageDistribution != "reports/language-distribution.json" ||
            sourceReferences.fullstackLanguageMatrix != "content/development/fullstack-language-matrix.json" ||
            sourceReferences.requestedSoftwareStack != "content/development/requested-software-stack.json" {
            issues.append("technology stack source references are invalid")
        }
        let languageIDs = sourceLanguageCatalog.map(\.id)
        let languageOrders = sourceLanguageCatalog.map(\.order)
        if summary.sourceLanguageCount != 60 ||
            sourceLanguageCatalog.count != summary.sourceLanguageCount ||
            Set(languageIDs).count != languageIDs.count ||
            Set(languageOrders).count != languageOrders.count ||
            languageOrders != Array(1...60) ||
            !sourceLanguageCatalog.allSatisfy({ $0.isSourceLanguage && !$0.id.isEmpty && !$0.label.isEmpty && !$0.layer.isEmpty && !$0.entrypoints.isEmpty && $0.githubBytes >= 0 }) {
            issues.append("source language catalog is incomplete or not GitHub-honest")
        }
        let groupIDs = ecosystemGroups.map(\.id)
        let technologies = ecosystemGroups.flatMap(\.technologies)
        let technologyIDs = technologies.map(\.id)
        if summary.ecosystemGroupCount != 7 ||
            ecosystemGroups.count != summary.ecosystemGroupCount ||
            Set(groupIDs).count != groupIDs.count ||
            !ecosystemGroups.allSatisfy({ !$0.id.isEmpty && !$0.label.isEmpty && !$0.kind.isEmpty && !$0.technologies.isEmpty && $0.technologies.map(\.order) == Array(1...$0.technologies.count) }) ||
            summary.ecosystemTechnologyCount != 143 ||
            technologies.count != summary.ecosystemTechnologyCount ||
            Set(technologyIDs).count != technologyIDs.count ||
            !technologies.allSatisfy({ !$0.id.isEmpty && !$0.label.isEmpty }) {
            issues.append("ecosystem technology catalog is incomplete")
        }
        let requiredPanels = ["JavaScript", "TypeScript", "Objective-C", "Other"]
        if summary.requestedCoreStackCount != 6 || summary.githubFocusedPanels != requiredPanels || !summary.githubLanguagePolicy.contains("Only real source languages belong") {
            issues.append("GitHub language and requested-stack policy is incomplete")
        }
        if governance.count != 4 || !governance.contains(where: { $0.contains("Do not add placeholder code") }) || !governance.contains(where: { $0.contains("frameworks, SDKs, cloud providers") }) {
            issues.append("technology stack governance is incomplete")
        }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            mode == "source_languages_plus_ecosystem_stack" &&
            governance.contains(where: { $0.contains("Do not install runtime dependencies") })
    }

    public var sourceLanguageCount: Int { sourceLanguageCatalog.count }
    public var ecosystemTechnologyCount: Int { ecosystemGroups.flatMap(\.technologies).count }
}
