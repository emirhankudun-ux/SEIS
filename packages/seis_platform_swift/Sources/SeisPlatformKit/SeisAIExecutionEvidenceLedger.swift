import Foundation

public enum SeisAIExecutionEvidenceKind: String, CaseIterable, Codable, Equatable, Sendable {
    case agentPlan = "agent-plan"
    case personalLanePlan = "personal-lane-plan"
    case providerExecution = "provider-execution"
}

public enum SeisAIExecutionEvidenceOutcome: String, CaseIterable, Codable, Equatable, Sendable {
    case planned
    case blocked
    case completedLocalDemo = "completed-local-demo"
    case completedApprovedProvider = "completed-approved-provider"
    case approvalRequired = "approval-required"
    case failed
}

/// A redacted, deterministic audit envelope. It intentionally has no prompt or output field.
public struct SeisAIExecutionEvidence: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let sequence: Int
    public let kind: SeisAIExecutionEvidenceKind
    public let subjectID: String
    public let outcome: SeisAIExecutionEvidenceOutcome
    public let routeOutcome: SeisAIRouteOutcome?
    public let providerID: String?
    public let modelIdentifier: String?
    public let plannedActionIDs: [String]
    public let blockedActionIDs: [String]
    public let requiredApprovalCount: Int
    public let inputReferenceCount: Int
    public let localOnly: Bool
    public let executionPerformed: Bool
    public let adapterInvocationPerformed: Bool
    public let providerCallPerformed: Bool
    public let networkCallPerformed: Bool
    public let clientCredentialRead: Bool
    public let blockedReasonCount: Int

    init(
        sequence: Int,
        kind: SeisAIExecutionEvidenceKind,
        subjectID: String,
        outcome: SeisAIExecutionEvidenceOutcome,
        routeOutcome: SeisAIRouteOutcome?,
        providerID: String?,
        modelIdentifier: String?,
        plannedActionIDs: [String],
        blockedActionIDs: [String],
        requiredApprovalCount: Int,
        inputReferenceCount: Int,
        localOnly: Bool,
        executionPerformed: Bool,
        adapterInvocationPerformed: Bool,
        providerCallPerformed: Bool,
        networkCallPerformed: Bool,
        clientCredentialRead: Bool,
        blockedReasonCount: Int
    ) {
        self.id = "evidence:\(sequence):\(subjectID)"
        self.sequence = sequence
        self.kind = kind
        self.subjectID = subjectID
        self.outcome = outcome
        self.routeOutcome = routeOutcome
        self.providerID = providerID
        self.modelIdentifier = modelIdentifier
        self.plannedActionIDs = plannedActionIDs
        self.blockedActionIDs = blockedActionIDs
        self.requiredApprovalCount = requiredApprovalCount
        self.inputReferenceCount = inputReferenceCount
        self.localOnly = localOnly
        self.executionPerformed = executionPerformed
        self.adapterInvocationPerformed = adapterInvocationPerformed
        self.providerCallPerformed = providerCallPerformed
        self.networkCallPerformed = networkCallPerformed
        self.clientCredentialRead = clientCredentialRead
        self.blockedReasonCount = blockedReasonCount
    }

    public var respectsSecretBoundary: Bool {
        !clientCredentialRead
    }

    public var isReadOnly: Bool {
        !executionPerformed && !adapterInvocationPerformed && !providerCallPerformed && !networkCallPerformed
    }
}

public actor SeisAIExecutionEvidenceLedger {
    public static let defaultCapacity = 256

    public let capacity: Int
    private var nextSequence = 1
    private var records: [SeisAIExecutionEvidence] = []

    public init(capacity: Int = Self.defaultCapacity) {
        self.capacity = max(1, capacity)
    }

    @discardableResult
    public func recordAgentPlan(
        _ plan: SeisAIAgentTaskPlan,
        inputReferenceCount: Int
    ) -> SeisAIExecutionEvidence {
        append(
            kind: .agentPlan,
            subjectID: "agent:\(plan.agentID)",
            outcome: plan.outcome == .planned ? .planned : .blocked,
            routeOutcome: nil,
            providerID: nil,
            modelIdentifier: nil,
            plannedActionIDs: plan.plannedActions.map(\.rawValue),
            blockedActionIDs: plan.blockedActions.map(\.rawValue),
            requiredApprovalCount: plan.requiredApprovals.count,
            inputReferenceCount: max(0, inputReferenceCount),
            localOnly: true,
            executionPerformed: !plan.isPlanOnly,
            adapterInvocationPerformed: false,
            providerCallPerformed: false,
            networkCallPerformed: false,
            clientCredentialRead: false,
            blockedReasonCount: plan.blockedReasons.count
        )
    }

    @discardableResult
    public func recordPersonalLanePlan(
        _ plan: SeisAIPersonalLaneTaskPlan,
        inputReferenceCount: Int
    ) -> SeisAIExecutionEvidence {
        append(
            kind: .personalLanePlan,
            subjectID: "lane:\(plan.laneID)",
            outcome: plan.outcome == .planned ? .planned : .blocked,
            routeOutcome: nil,
            providerID: nil,
            modelIdentifier: nil,
            plannedActionIDs: plan.plannedActions.map(\.rawValue),
            blockedActionIDs: plan.blockedActions.map(\.rawValue),
            requiredApprovalCount: plan.requiredApprovals.count,
            inputReferenceCount: max(0, inputReferenceCount),
            localOnly: true,
            executionPerformed: plan.executionPerformed,
            adapterInvocationPerformed: false,
            providerCallPerformed: false,
            networkCallPerformed: false,
            clientCredentialRead: false,
            blockedReasonCount: plan.blockedReasons.count
        )
    }

    @discardableResult
    public func recordExecution(_ result: SeisAIExecutionResult) -> SeisAIExecutionEvidence {
        append(
            kind: .providerExecution,
            subjectID: "provider:\(result.providerID ?? "unresolved")",
            outcome: SeisAIExecutionEvidenceOutcome(rawValue: result.outcome.rawValue) ?? .failed,
            routeOutcome: result.routeDecision.outcome,
            providerID: result.providerID,
            modelIdentifier: result.modelIdentifier,
            plannedActionIDs: [],
            blockedActionIDs: [],
            requiredApprovalCount: result.routeDecision.requiresHumanApproval ? 1 : 0,
            inputReferenceCount: 0,
            localOnly: !result.providerCallPerformed && !result.networkCallPerformed,
            executionPerformed: result.executionCompleted,
            adapterInvocationPerformed: result.adapterInvocationPerformed,
            providerCallPerformed: result.providerCallPerformed,
            networkCallPerformed: result.networkCallPerformed,
            clientCredentialRead: result.clientCredentialRead,
            blockedReasonCount: result.blockedReasons.count
        )
    }

    public func snapshot(limit: Int = 64) -> [SeisAIExecutionEvidence] {
        let normalizedLimit = min(max(0, limit), capacity)
        guard normalizedLimit > 0 else { return [] }
        return Array(records.suffix(normalizedLimit))
    }

    public func count() -> Int {
        records.count
    }

    public func clear() {
        records.removeAll(keepingCapacity: true)
    }

    @discardableResult
    private func append(
        kind: SeisAIExecutionEvidenceKind,
        subjectID: String,
        outcome: SeisAIExecutionEvidenceOutcome,
        routeOutcome: SeisAIRouteOutcome?,
        providerID: String?,
        modelIdentifier: String?,
        plannedActionIDs: [String],
        blockedActionIDs: [String],
        requiredApprovalCount: Int,
        inputReferenceCount: Int,
        localOnly: Bool,
        executionPerformed: Bool,
        adapterInvocationPerformed: Bool,
        providerCallPerformed: Bool,
        networkCallPerformed: Bool,
        clientCredentialRead: Bool,
        blockedReasonCount: Int
    ) -> SeisAIExecutionEvidence {
        let evidence = SeisAIExecutionEvidence(
            sequence: nextSequence,
            kind: kind,
            subjectID: subjectID,
            outcome: outcome,
            routeOutcome: routeOutcome,
            providerID: providerID,
            modelIdentifier: modelIdentifier,
            plannedActionIDs: plannedActionIDs,
            blockedActionIDs: blockedActionIDs,
            requiredApprovalCount: max(0, requiredApprovalCount),
            inputReferenceCount: max(0, inputReferenceCount),
            localOnly: localOnly,
            executionPerformed: executionPerformed,
            adapterInvocationPerformed: adapterInvocationPerformed,
            providerCallPerformed: providerCallPerformed,
            networkCallPerformed: networkCallPerformed,
            clientCredentialRead: clientCredentialRead,
            blockedReasonCount: max(0, blockedReasonCount)
        )
        nextSequence += 1
        records.append(evidence)
        if records.count > capacity {
            records.removeFirst(records.count - capacity)
        }
        return evidence
    }
}
