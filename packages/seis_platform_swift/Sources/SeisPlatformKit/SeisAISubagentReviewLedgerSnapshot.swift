import Foundation

public struct SeisAISubagentReviewCadence: Codable, Equatable, Sendable {
    public let reviewCadence: String
    public let horizonYears: Int
    public let totalQuarterRecords: Int
    public let currentHorizonQuarter: String
    public let nextReviewQuarter: String

    public init(reviewCadence: String, horizonYears: Int, totalQuarterRecords: Int, currentHorizonQuarter: String, nextReviewQuarter: String) {
        self.reviewCadence = reviewCadence
        self.horizonYears = horizonYears
        self.totalQuarterRecords = totalQuarterRecords
        self.currentHorizonQuarter = currentHorizonQuarter
        self.nextReviewQuarter = nextReviewQuarter
    }

    public var isSafe: Bool {
        reviewCadence == "quarterly" &&
            horizonYears == 5 &&
            totalQuarterRecords == 20 &&
            !currentHorizonQuarter.isEmpty &&
            !nextReviewQuarter.isEmpty
    }
}

public struct SeisAISubagentReviewSummary: Codable, Equatable, Sendable {
    public let documentedValidatedQuarterCount: Int
    public let plannedQuarterCount: Int
    public let writeGatedQuarterCountEnabled: Int
    public let externalMutationPerformed: Bool
    public let credentialAccessPerformed: Bool
    public let autonomousMergeOrDeployPerformed: Bool

    public init(
        documentedValidatedQuarterCount: Int,
        plannedQuarterCount: Int,
        writeGatedQuarterCountEnabled: Int,
        externalMutationPerformed: Bool,
        credentialAccessPerformed: Bool,
        autonomousMergeOrDeployPerformed: Bool
    ) {
        self.documentedValidatedQuarterCount = documentedValidatedQuarterCount
        self.plannedQuarterCount = plannedQuarterCount
        self.writeGatedQuarterCountEnabled = writeGatedQuarterCountEnabled
        self.externalMutationPerformed = externalMutationPerformed
        self.credentialAccessPerformed = credentialAccessPerformed
        self.autonomousMergeOrDeployPerformed = autonomousMergeOrDeployPerformed
    }

    public var isSafe: Bool {
        documentedValidatedQuarterCount == 2 &&
            plannedQuarterCount == 18 &&
            writeGatedQuarterCountEnabled == 0 &&
            !externalMutationPerformed &&
            !credentialAccessPerformed &&
            !autonomousMergeOrDeployPerformed
    }
}

public struct SeisAISubagentQuarterReview: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let sourcePlanQuarter: String
    public let primaryLanes: [String]
    public let evidence: [String]
    public let validator: String
    public let externalMutationPerformed: Bool
    public let humanApprovalNeeded: Bool
    public let nextSafeAction: String

    public init(
        id: String,
        status: String,
        sourcePlanQuarter: String,
        primaryLanes: [String],
        evidence: [String],
        validator: String,
        externalMutationPerformed: Bool,
        humanApprovalNeeded: Bool,
        nextSafeAction: String
    ) {
        self.id = id
        self.status = status
        self.sourcePlanQuarter = sourcePlanQuarter
        self.primaryLanes = primaryLanes
        self.evidence = evidence
        self.validator = validator
        self.externalMutationPerformed = externalMutationPerformed
        self.humanApprovalNeeded = humanApprovalNeeded
        self.nextSafeAction = nextSafeAction
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let states = ["documented-validated", "planned", "blocked-human-approval", "deferred", "archived"]
        if id.isEmpty || sourcePlanQuarter.isEmpty || primaryLanes.isEmpty || validator.isEmpty || nextSafeAction.isEmpty {
            issues.append("quarter \(id) has incomplete review fields")
        }
        if !states.contains(status) { issues.append("quarter \(id) has an unknown review state") }
        if externalMutationPerformed { issues.append("quarter \(id) records external mutation") }
        return issues
    }
}

public enum SeisAISubagentReviewLedgerSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAISubagentReviewLedgerSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let qualityGate: String
    public let sourceOfTruth: [String: String]
    public let cadence: SeisAISubagentReviewCadence
    public let runtimeBoundary: [String: String]
    public let summary: SeisAISubagentReviewSummary
    public let reviewStates: [String]
    public let requiredEvidencePerReview: [String]
    public let quarters: [SeisAISubagentQuarterReview]
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: String,
        status: String,
        purpose: String,
        qualityGate: String,
        sourceOfTruth: [String: String],
        cadence: SeisAISubagentReviewCadence,
        runtimeBoundary: [String: String],
        summary: SeisAISubagentReviewSummary,
        reviewStates: [String],
        requiredEvidencePerReview: [String],
        quarters: [SeisAISubagentQuarterReview],
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.sourceOfTruth = sourceOfTruth
        self.cadence = cadence
        self.runtimeBoundary = runtimeBoundary
        self.summary = summary
        self.reviewStates = reviewStates
        self.requiredEvidencePerReview = requiredEvidencePerReview
        self.quarters = quarters
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisAISubagentReviewLedgerSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAISubagentReviewLedgerSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAISubagentReviewLedgerSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-core-subagent-review-ledger" { issues.append("review ledger id must identify the canonical ledger") }
        if [version, status, purpose, qualityGate].contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("review ledger identity fields must not be empty")
        }
        if !cadence.isSafe { issues.append("review ledger cadence is unsafe") }
        if !summary.isSafe { issues.append("review ledger summary is unsafe") }
        if runtimeBoundary["currentLevel"] != "status-and-plan-only" ||
            runtimeBoundary["backgroundAutomation"] != "disabled" ||
            runtimeBoundary["writeExecution"] != "disabled" ||
            runtimeBoundary["externalMutation"] != "requires-explicit-human-approval" ||
            runtimeBoundary["credentialAccess"] != "forbidden" {
            issues.append("review ledger runtime boundary is unsafe")
        }
        if reviewStates.count != 5 { issues.append("review ledger must contain five review states") }
        if requiredEvidencePerReview.count != 8 { issues.append("review ledger must contain eight required evidence fields") }
        if quarters.count != 20 { issues.append("review ledger must contain twenty quarter records") }
        for quarter in quarters { issues.append(contentsOf: quarter.validationIssues) }
        let quarterIDs = quarters.map(\.id)
        if Set(quarterIDs).count != quarterIDs.count { issues.append("review ledger quarter IDs must be unique") }
        if nextSafeActions.isEmpty { issues.append("review ledger next safe actions must not be empty") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            cadence.isSafe &&
            summary.isSafe &&
            quarters.allSatisfy { !$0.externalMutationPerformed }
    }
}
