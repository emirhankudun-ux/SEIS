import Foundation

public struct SeisObsidianSafeImportRuntime: Codable, Equatable, Sendable {
    public let obsidianPluginInstalled: Bool
    public let hostVaultReadEnabled: Bool
    public let privateVaultImportEnabled: Bool
    public let externalMutationEnabled: Bool
    public let githubPublicationEnabled: Bool
}

public struct SeisObsidianSafeOutputPolicy: Codable, Equatable, Sendable {
    public let repoCommittedByDefault: Bool
    public let defaultOutput: String
    public let publicFixtureAllowed: String
    public let redactionRequired: Bool
    public let hashPrivatePaths: Bool
    public let storeSecrets: Bool
}

public struct SeisObsidianDryRunManifestSchema: Codable, Equatable, Sendable {
    public let requiredFields: [String]
    public let bodyImportPolicy: String
    public let privatePathPolicy: String
    public let approvalStateValues: [String]
}

public struct SeisObsidianImportPhase: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let requiredApproval: String
    public let output: String
}

public enum SeisObsidianSafeImportSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisObsidianSafeImportSnapshot: Codable, Equatable, Sendable {
    public let version: String
    public let id: String
    public let title: String
    public let status: String
    public let mode: String
    public let ownerSurface: String
    public let qualityGate: String
    public let allowedFileTypes: [String]
    public let allowedToday: [String]
    public let blockedFileTypes: [String]
    public let blockedPaths: [String]
    public let currentRuntime: SeisObsidianSafeImportRuntime
    public let dryRunManifestSchema: SeisObsidianDryRunManifestSchema
    public let forbiddenActions: [String]
    public let futureImportPhases: [SeisObsidianImportPhase]
    public let importDecisionLabels: [String]
    public let requiredGates: [String]
    public let reviewPacketRequirements: [String]
    public let safeOutputPolicy: SeisObsidianSafeOutputPolicy

    public static func validated(from data: Data) throws -> SeisObsidianSafeImportSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisObsidianSafeImportSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisObsidianSafeImportSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let expectedAllowedTypes = [".md", ".markdown", ".txt", ".json"]
        let expectedBlockedTypes = [".env", ".pem", ".key", ".p12", ".pfx", ".sqlite", ".db", ".zip", ".7z", ".tar", ".gz", ".png", ".jpg", ".jpeg", ".webp", ".pdf"]
        let expectedBlockedPaths = [".obsidian/", ".trash/", ".git/", "node_modules/", "secrets/", ".secrets/", "credentials.local.json", "service-account", ".env"]
        let expectedLabels = ["public-safe-metadata-only", "needs-redaction", "needs-provenance-review", "blocked-private", "blocked-secret-risk", "blocked-attachment-risk"]
        if version != "2026-06-24" || id != "seis-obsidian-bridge-safe-import-contract" ||
            title.isEmpty || status != "planned-gated" || mode != "explicit-user-selected-import-only" ||
            ownerSurface != "SEIS Second Brain" || qualityGate != "npm run check:seis-second-brain-readiness-contracts" {
            issues.append("Obsidian safe-import identity or planned gate is invalid")
        }
        if allowedFileTypes != expectedAllowedTypes || allowedToday.count != 5 ||
            blockedFileTypes != expectedBlockedTypes || blockedPaths != expectedBlockedPaths ||
            importDecisionLabels != expectedLabels || requiredGates.count != 8 || reviewPacketRequirements.count != 7 ||
            forbiddenActions.count != 8 || futureImportPhases.count != 5 {
            issues.append("Obsidian safe-import lists or phase counts are incomplete")
        }
        if currentRuntime.obsidianPluginInstalled || currentRuntime.hostVaultReadEnabled || currentRuntime.privateVaultImportEnabled ||
            currentRuntime.externalMutationEnabled || currentRuntime.githubPublicationEnabled {
            issues.append("Obsidian safe-import runtime boundary is unsafe")
        }
        if !requiredGates.contains("explicit user-selected source path") ||
            !requiredGates.contains("dry-run manifest before any import") ||
            !requiredGates.contains("no private note body committed") ||
            !requiredGates.contains("human approval before GitHub publication") ||
            !forbiddenActions.contains("automatic home-directory vault discovery") ||
            !forbiddenActions.contains("sending imported note content to AI providers") {
            issues.append("Obsidian safe-import approval or privacy gates are incomplete")
        }
        if dryRunManifestSchema.bodyImportPolicy != "metadata-only-by-default" ||
            dryRunManifestSchema.privatePathPolicy != "hash-or-redact" ||
            dryRunManifestSchema.requiredFields.count != 12 ||
            !dryRunManifestSchema.approvalStateValues.contains("blocked") {
            issues.append("Obsidian dry-run manifest schema is unsafe or incomplete")
        }
        if safeOutputPolicy.repoCommittedByDefault || safeOutputPolicy.defaultOutput != "local dry-run report only" ||
            !safeOutputPolicy.redactionRequired || !safeOutputPolicy.hashPrivatePaths || safeOutputPolicy.storeSecrets ||
            !safeOutputPolicy.publicFixtureAllowed.contains("no-secret") {
            issues.append("Obsidian safe output policy is unsafe")
        }
        let phaseIDs = futureImportPhases.map(\.id)
        let expectedPhaseIDs = ["select-vault", "preflight-scan", "provenance-review", "sanitized-import-preview", "public-sync"]
        if phaseIDs != expectedPhaseIDs ||
            futureImportPhases.prefix(4).contains(where: { $0.status != "planned" }) ||
            futureImportPhases.last?.status != "blocked" ||
            !futureImportPhases.allSatisfy({ !$0.requiredApproval.isEmpty && !$0.output.isEmpty }) {
            issues.append("Obsidian future import phases are not approval-gated")
        }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            mode == "explicit-user-selected-import-only" &&
            dryRunManifestSchema.bodyImportPolicy == "metadata-only-by-default" &&
            !currentRuntime.privateVaultImportEnabled &&
            !currentRuntime.githubPublicationEnabled
    }

    public var blockedActionCount: Int { forbiddenActions.count }
    public var importPhaseCount: Int { futureImportPhases.count }
}
