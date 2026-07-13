import Foundation

public enum SeisAIExecutionEvidenceKind: String, CaseIterable, Codable, Equatable, Sendable {
    case agentPlan = "agent-plan"
    case personalLanePlan = "personal-lane-plan"
    case providerExecution = "provider-execution"
    case routeInspection = "route-inspection"
}

public enum SeisAIExecutionEvidenceOutcome: String, CaseIterable, Codable, Equatable, Sendable {
    case planned
    case blocked
    case routeInspection = "route-inspection"
    case completedLocalDemo = "completed-local-demo"
    case completedApprovedProvider = "completed-approved-provider"
    case approvalRequired = "approval-required"
    case failed
}

public enum SeisAIExecutionEvidencePersistenceState: String, CaseIterable, Codable, Equatable, Sendable {
    case memoryOnly = "memory-only"
    case localFile = "local-file"
    case localFileUnavailable = "local-file-unavailable"

    public var displayLabel: String {
        switch self {
        case .memoryOnly:
            "memory only"
        case .localFile:
            "local file"
        case .localFileUnavailable:
            "local file unavailable"
        }
    }

    public var isPersistent: Bool {
        self == .localFile
    }
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
    public private(set) var persistenceState: SeisAIExecutionEvidencePersistenceState
    private let storageURL: URL?
    private var nextSequence = 1
    private var records: [SeisAIExecutionEvidence] = []

    public init(capacity: Int = Self.defaultCapacity, storageURL: URL? = nil) {
        let resolvedCapacity = max(1, capacity)
        var loadedRecords: [SeisAIExecutionEvidence] = []
        var resolvedPersistenceState: SeisAIExecutionEvidencePersistenceState = storageURL == nil
            ? .memoryOnly
            : .localFile

        if let storageURL {
            do {
                try FileManager.default.createDirectory(
                    at: storageURL.deletingLastPathComponent(),
                    withIntermediateDirectories: true
                )
                if FileManager.default.fileExists(atPath: storageURL.path) {
                    let data = try Data(contentsOf: storageURL)
                    loadedRecords = try JSONDecoder().decode([SeisAIExecutionEvidence].self, from: data)
                }
            } catch {
                resolvedPersistenceState = .localFileUnavailable
            }
        }

        let boundedRecords = Array(loadedRecords.sorted { $0.sequence < $1.sequence }.suffix(resolvedCapacity))
        let resolvedNextSequence = (boundedRecords.map(\.sequence).max() ?? 0) + 1
        self.capacity = resolvedCapacity
        self.storageURL = storageURL
        self.persistenceState = resolvedPersistenceState
        self.records = boundedRecords
        self.nextSequence = resolvedNextSequence
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

    @discardableResult
    public func recordRouteInspection(
        _ decision: SeisAIRouteDecision
    ) -> SeisAIExecutionEvidence {
        append(
            kind: .routeInspection,
            subjectID: "route-inspection",
            outcome: .routeInspection,
            routeOutcome: decision.outcome,
            providerID: decision.selectedProviderID,
            modelIdentifier: decision.selectedModelIdentifier,
            plannedActionIDs: [],
            blockedActionIDs: [],
            requiredApprovalCount: decision.requiresHumanApproval ? 1 : 0,
            inputReferenceCount: 0,
            localOnly: true,
            executionPerformed: decision.executionPerformed,
            adapterInvocationPerformed: false,
            providerCallPerformed: decision.providerCallPerformed,
            networkCallPerformed: decision.networkCallPerformed,
            clientCredentialRead: false,
            blockedReasonCount: decision.blockedReasons.count
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
        persist()
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
        persist()
        return evidence
    }

    private func persist() {
        guard let storageURL, persistenceState == .localFile else { return }

        do {
            let data = try JSONEncoder().encode(records)
            try data.write(to: storageURL, options: [.atomic])
        } catch {
            persistenceState = .localFileUnavailable
        }
    }
}
