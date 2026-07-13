import Foundation

public struct SeisAISubagentFixtureReference: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let path: String
    public let summary: String

    public init(id: String, path: String, summary: String) {
        self.id = id
        self.path = path
        self.summary = summary
    }

    public var validationIssues: [String] {
        [id, path, summary].contains { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
            ? ["runtime fixture \(id) is incomplete"]
            : []
    }
}

public struct SeisAISubagentFixtureRoleSchema: Codable, Equatable, Sendable {
    public let path: String
    public let requiredRoleIds: [String]
    public let requiredLaneIds: [String]
    public let authority: String
    public let maxDelegationDepth: Int

    public init(path: String, requiredRoleIds: [String], requiredLaneIds: [String], authority: String, maxDelegationDepth: Int) {
        self.path = path
        self.requiredRoleIds = requiredRoleIds
        self.requiredLaneIds = requiredLaneIds
        self.authority = authority
        self.maxDelegationDepth = maxDelegationDepth
    }

    public var isSafe: Bool {
        requiredRoleIds.count == 5 &&
            requiredLaneIds == ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"] &&
            authority == "plan-only" &&
            maxDelegationDepth == 1
    }
}

public struct SeisAISubagentPermissionMatrixFixture: Codable, Equatable, Sendable {
    public let path: String
    public let requiredLevels: [String]
    public let enabledNow: [String]
    public let approvalGated: [String]

    public init(path: String, requiredLevels: [String], enabledNow: [String], approvalGated: [String]) {
        self.path = path
        self.requiredLevels = requiredLevels
        self.enabledNow = enabledNow
        self.approvalGated = approvalGated
    }

    public var isSafe: Bool {
        requiredLevels == ["read-only", "plan-only", "write-gated", "external-gated", "forbidden"] &&
            enabledNow == ["read-only", "plan-only"] &&
            approvalGated == ["write-gated", "external-gated"]
    }
}

public struct SeisAISubagentTaskQueueFixture: Codable, Equatable, Sendable {
    public let path: String
    public let mode: String
    public let writerPolicy: String
    public let states: [String]
    public let approvalStateRequired: Bool

    public init(path: String, mode: String, writerPolicy: String, states: [String], approvalStateRequired: Bool) {
        self.path = path
        self.mode = mode
        self.writerPolicy = writerPolicy
        self.states = states
        self.approvalStateRequired = approvalStateRequired
    }

    public var isSafe: Bool {
        mode == "dry-run-only" &&
            writerPolicy == "single-writer" &&
            states.contains("awaiting-approval") &&
            states.contains("cancelled") &&
            states.contains("validated") &&
            approvalStateRequired
    }
}

public struct SeisAISubagentCancellationFixture: Codable, Equatable, Sendable {
    public let path: String
    public let cancellationTokenRequired: Bool
    public let supportedSignals: [String]

    public init(path: String, cancellationTokenRequired: Bool, supportedSignals: [String]) {
        self.path = path
        self.cancellationTokenRequired = cancellationTokenRequired
        self.supportedSignals = supportedSignals
    }

    public var isSafe: Bool {
        cancellationTokenRequired &&
            ["operator-cancel", "timeout", "policy-deny", "validation-failure"].allSatisfy(supportedSignals.contains)
    }
}

public struct SeisAISubagentApprovalFixture: Codable, Equatable, Sendable {
    public let path: String
    public let approvalRequiredFor: [String]
    public let blanketApprovalAllowed: Bool

    public init(path: String, approvalRequiredFor: [String], blanketApprovalAllowed: Bool) {
        self.path = path
        self.approvalRequiredFor = approvalRequiredFor
        self.blanketApprovalAllowed = blanketApprovalAllowed
    }

    public var isSafe: Bool {
        approvalRequiredFor.count == 5 && !blanketApprovalAllowed
    }
}

public struct SeisAISubagentRedactionFixture: Codable, Equatable, Sendable {
    public let path: String
    public let sampleOutputContainsSecretValue: Bool
    public let rawProviderErrorsExposed: Bool
    public let promptAndResponseLoggingDefault: String
    public let requiredBeforePromotion: Bool

    public init(
        path: String,
        sampleOutputContainsSecretValue: Bool,
        rawProviderErrorsExposed: Bool,
        promptAndResponseLoggingDefault: String,
        requiredBeforePromotion: Bool
    ) {
        self.path = path
        self.sampleOutputContainsSecretValue = sampleOutputContainsSecretValue
        self.rawProviderErrorsExposed = rawProviderErrorsExposed
        self.promptAndResponseLoggingDefault = promptAndResponseLoggingDefault
        self.requiredBeforePromotion = requiredBeforePromotion
    }

    public var isSafe: Bool {
        !sampleOutputContainsSecretValue &&
            !rawProviderErrorsExposed &&
            promptAndResponseLoggingDefault == "disabled" &&
            requiredBeforePromotion
    }
}

public struct SeisAISubagentExecutionLedgerSample: Codable, Equatable, Sendable {
    public let id: String
    public let secretValuesStored: Bool
    public let externalMutationPerformed: Bool
    public let status: String

    public init(id: String, secretValuesStored: Bool, externalMutationPerformed: Bool, status: String) {
        self.id = id
        self.secretValuesStored = secretValuesStored
        self.externalMutationPerformed = externalMutationPerformed
        self.status = status
    }

    public var isSafe: Bool {
        !secretValuesStored && !externalMutationPerformed && status == "cancelled"
    }
}

public struct SeisAISubagentExecutionLedgerFixture: Codable, Equatable, Sendable {
    public let path: String
    public let mode: String
    public let reviewLedger: String
    public let recordsForbidden: [String]
    public let sampleRecord: SeisAISubagentExecutionLedgerSample

    public init(path: String, mode: String, reviewLedger: String, recordsForbidden: [String], sampleRecord: SeisAISubagentExecutionLedgerSample) {
        self.path = path
        self.mode = mode
        self.reviewLedger = reviewLedger
        self.recordsForbidden = recordsForbidden
        self.sampleRecord = sampleRecord
    }

    public var isSafe: Bool {
        mode == "append-only-planned" &&
            recordsForbidden.count == 3 &&
            sampleRecord.isSafe
    }
}

public enum SeisAISubagentRuntimeFixturesSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAISubagentRuntimeFixturesSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let qualityGate: String
    public let sourceOfTruth: [String: String]
    public let runtimeBoundary: [String: String]
    public let fixtures: [SeisAISubagentFixtureReference]
    public let roleSchema: SeisAISubagentFixtureRoleSchema
    public let permissionMatrixFixture: SeisAISubagentPermissionMatrixFixture
    public let taskQueueFixture: SeisAISubagentTaskQueueFixture
    public let cancellationFixture: SeisAISubagentCancellationFixture
    public let approvalFixture: SeisAISubagentApprovalFixture
    public let redactionFixture: SeisAISubagentRedactionFixture
    public let executionLedgerFixture: SeisAISubagentExecutionLedgerFixture

    public init(
        id: String,
        version: String,
        status: String,
        purpose: String,
        qualityGate: String,
        sourceOfTruth: [String: String],
        runtimeBoundary: [String: String],
        fixtures: [SeisAISubagentFixtureReference],
        roleSchema: SeisAISubagentFixtureRoleSchema,
        permissionMatrixFixture: SeisAISubagentPermissionMatrixFixture,
        taskQueueFixture: SeisAISubagentTaskQueueFixture,
        cancellationFixture: SeisAISubagentCancellationFixture,
        approvalFixture: SeisAISubagentApprovalFixture,
        redactionFixture: SeisAISubagentRedactionFixture,
        executionLedgerFixture: SeisAISubagentExecutionLedgerFixture
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.sourceOfTruth = sourceOfTruth
        self.runtimeBoundary = runtimeBoundary
        self.fixtures = fixtures
        self.roleSchema = roleSchema
        self.permissionMatrixFixture = permissionMatrixFixture
        self.taskQueueFixture = taskQueueFixture
        self.cancellationFixture = cancellationFixture
        self.approvalFixture = approvalFixture
        self.redactionFixture = redactionFixture
        self.executionLedgerFixture = executionLedgerFixture
    }

    public static func validated(from data: Data) throws -> SeisAISubagentRuntimeFixturesSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAISubagentRuntimeFixturesSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAISubagentRuntimeFixturesSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-core-subagent-runtime-fixtures" { issues.append("runtime fixture snapshot id must identify the canonical pack") }
        if [version, status, purpose, qualityGate].contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("runtime fixture snapshot identity fields must not be empty")
        }
        if runtimeBoundary["currentLevel"] != "status-and-plan-only" ||
            runtimeBoundary["backgroundAutomation"] != "disabled" ||
            runtimeBoundary["writeExecution"] != "disabled" ||
            runtimeBoundary["credentialAccess"] != "forbidden" ||
            runtimeBoundary["externalMutation"] != "requires-explicit-human-approval" {
            issues.append("runtime fixture boundary is unsafe")
        }
        if fixtures.count != 7 { issues.append("runtime fixture pack must contain seven fixture references") }
        for fixture in fixtures { issues.append(contentsOf: fixture.validationIssues) }
        if !roleSchema.isSafe { issues.append("runtime fixture role schema is unsafe") }
        if !permissionMatrixFixture.isSafe { issues.append("runtime fixture permission matrix is unsafe") }
        if !taskQueueFixture.isSafe { issues.append("runtime fixture task queue is unsafe") }
        if !cancellationFixture.isSafe { issues.append("runtime fixture cancellation contract is unsafe") }
        if !approvalFixture.isSafe { issues.append("runtime fixture approval contract is unsafe") }
        if !redactionFixture.isSafe { issues.append("runtime fixture redaction contract is unsafe") }
        if !executionLedgerFixture.isSafe { issues.append("runtime fixture execution ledger is unsafe") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            roleSchema.isSafe &&
            permissionMatrixFixture.isSafe &&
            taskQueueFixture.isSafe &&
            cancellationFixture.isSafe &&
            approvalFixture.isSafe &&
            redactionFixture.isSafe &&
            executionLedgerFixture.isSafe
    }
}
