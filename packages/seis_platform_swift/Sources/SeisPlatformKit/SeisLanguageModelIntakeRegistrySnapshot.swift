import Foundation

public struct SeisLanguageModelSourceResearch: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let url: String
    public let observedDate: String
    public let usedFor: String

    public init(id: String, url: String, observedDate: String, usedFor: String) {
        self.id = id
        self.url = url
        self.observedDate = observedDate
        self.usedFor = usedFor
    }
}

public struct SeisLanguageModelInstallPolicy: Codable, Equatable, Sendable {
    public let bulkInstallAllowed: Bool
    public let defaultInstallState: String
    public let downloadAuthorized: Bool
    public let runtimeAuthorityGranted: Bool
    public let providerCallAuthorized: Bool
    public let trainingAuthorized: Bool
    public let fineTuningAuthorized: Bool
    public let adapterTrainingAuthorized: Bool
    public let datasetDownloadAuthorized: Bool
    public let secretReadAllowed: Bool
    public let browserSecretAllowed: Bool
    public let reason: String

    public init(
        bulkInstallAllowed: Bool,
        defaultInstallState: String,
        downloadAuthorized: Bool,
        runtimeAuthorityGranted: Bool,
        providerCallAuthorized: Bool,
        trainingAuthorized: Bool,
        fineTuningAuthorized: Bool,
        adapterTrainingAuthorized: Bool,
        datasetDownloadAuthorized: Bool,
        secretReadAllowed: Bool,
        browserSecretAllowed: Bool,
        reason: String
    ) {
        self.bulkInstallAllowed = bulkInstallAllowed
        self.defaultInstallState = defaultInstallState
        self.downloadAuthorized = downloadAuthorized
        self.runtimeAuthorityGranted = runtimeAuthorityGranted
        self.providerCallAuthorized = providerCallAuthorized
        self.trainingAuthorized = trainingAuthorized
        self.fineTuningAuthorized = fineTuningAuthorized
        self.adapterTrainingAuthorized = adapterTrainingAuthorized
        self.datasetDownloadAuthorized = datasetDownloadAuthorized
        self.secretReadAllowed = secretReadAllowed
        self.browserSecretAllowed = browserSecretAllowed
        self.reason = reason
    }

    public var isSafe: Bool {
        !bulkInstallAllowed &&
            defaultInstallState == "not-installed" &&
            !downloadAuthorized &&
            !runtimeAuthorityGranted &&
            !providerCallAuthorized &&
            !trainingAuthorized &&
            !fineTuningAuthorized &&
            !adapterTrainingAuthorized &&
            !datasetDownloadAuthorized &&
            !secretReadAllowed &&
            !browserSecretAllowed &&
            !reason.isEmpty
    }
}

public struct SeisLanguageModelCandidateFamily: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let representativeClasses: [String]
    public let source: String
    public let licenseReviewStatus: String
    public let allowedToday: String
    public let installState: String
    public let trainingUse: String
    public let notes: [String]

    public init(id: String, displayName: String, representativeClasses: [String], source: String, licenseReviewStatus: String, allowedToday: String, installState: String, trainingUse: String, notes: [String]) {
        self.id = id
        self.displayName = displayName
        self.representativeClasses = representativeClasses
        self.source = source
        self.licenseReviewStatus = licenseReviewStatus
        self.allowedToday = allowedToday
        self.installState = installState
        self.trainingUse = trainingUse
        self.notes = notes
    }

    public var validationIssues: [String] {
        if [id, displayName, source, licenseReviewStatus, allowedToday, installState, trainingUse].contains(where: { $0.isEmpty }) || representativeClasses.isEmpty || notes.isEmpty {
            return ["model family \(id) is incomplete"]
        }
        if allowedToday != "metadata-only" || installState != "not-installed-by-registry" || trainingUse != "not-authorized" {
            return ["model family \(id) exceeds metadata-only intake boundary"]
        }
        return []
    }
}

public struct SeisLanguageModelHardwareInstallLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let ramClass: String
    public let allowedToday: String
    public let candidateModelClass: String
    public let blockedClasses: [String]

    public init(id: String, ramClass: String, allowedToday: String, candidateModelClass: String, blockedClasses: [String]) {
        self.id = id
        self.ramClass = ramClass
        self.allowedToday = allowedToday
        self.candidateModelClass = candidateModelClass
        self.blockedClasses = blockedClasses
    }

    public var validationIssues: [String] {
        if [id, ramClass, allowedToday, candidateModelClass].contains(where: { $0.isEmpty }) || blockedClasses.isEmpty {
            return ["hardware intake lane \(id) is incomplete"]
        }
        return []
    }
}

public struct SeisLanguageModelTrainingLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let meaning: String
    public let allowedToday: Bool
    public let foundationModelTraining: Bool

    public init(id: String, status: String, meaning: String, allowedToday: Bool, foundationModelTraining: Bool) {
        self.id = id
        self.status = status
        self.meaning = meaning
        self.allowedToday = allowedToday
        self.foundationModelTraining = foundationModelTraining
    }

    public var isSafe: Bool {
        (!id.isEmpty && !status.isEmpty && !meaning.isEmpty && !allowedToday && !foundationModelTraining) ||
            (id == "repo-local-seed-models" && allowedToday && !foundationModelTraining)
    }
}

public struct SeisLanguageModelKnowledgeStrategy: Codable, Equatable, Sendable {
    public let goal: String
    public let preferredOrder: [String]
    public let forbiddenShortcut: String

    public init(goal: String, preferredOrder: [String], forbiddenShortcut: String) {
        self.goal = goal
        self.preferredOrder = preferredOrder
        self.forbiddenShortcut = forbiddenShortcut
    }

    public var isSafe: Bool {
        !goal.isEmpty && preferredOrder.count == 6 && forbiddenShortcut.contains("Do not scrape")
    }
}

public enum SeisLanguageModelIntakeRegistrySnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisLanguageModelIntakeRegistrySnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let updatedAt: String
    public let purpose: String
    public let qualityGate: String
    public let truthBoundary: String
    public let sourceResearch: [SeisLanguageModelSourceResearch]
    public let installPolicy: SeisLanguageModelInstallPolicy
    public let requiredBeforeAnyModelInstall: [String]
    public let requiredBeforeAnyTraining: [String]
    public let candidateModelFamilies: [SeisLanguageModelCandidateFamily]
    public let hardwareInstallLanes: [SeisLanguageModelHardwareInstallLane]
    public let trainingLanes: [SeisLanguageModelTrainingLane]
    public let knowledgeStrategy: SeisLanguageModelKnowledgeStrategy
    public let forbiddenClaims: [String]
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: String,
        status: String,
        updatedAt: String,
        purpose: String,
        qualityGate: String,
        truthBoundary: String,
        sourceResearch: [SeisLanguageModelSourceResearch],
        installPolicy: SeisLanguageModelInstallPolicy,
        requiredBeforeAnyModelInstall: [String],
        requiredBeforeAnyTraining: [String],
        candidateModelFamilies: [SeisLanguageModelCandidateFamily],
        hardwareInstallLanes: [SeisLanguageModelHardwareInstallLane],
        trainingLanes: [SeisLanguageModelTrainingLane],
        knowledgeStrategy: SeisLanguageModelKnowledgeStrategy,
        forbiddenClaims: [String],
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.updatedAt = updatedAt
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.truthBoundary = truthBoundary
        self.sourceResearch = sourceResearch
        self.installPolicy = installPolicy
        self.requiredBeforeAnyModelInstall = requiredBeforeAnyModelInstall
        self.requiredBeforeAnyTraining = requiredBeforeAnyTraining
        self.candidateModelFamilies = candidateModelFamilies
        self.hardwareInstallLanes = hardwareInstallLanes
        self.trainingLanes = trainingLanes
        self.knowledgeStrategy = knowledgeStrategy
        self.forbiddenClaims = forbiddenClaims
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisLanguageModelIntakeRegistrySnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisLanguageModelIntakeRegistrySnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisLanguageModelIntakeRegistrySnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-language-model-intake-registry" { issues.append("model intake registry id must identify the canonical registry") }
        if [version, status, updatedAt, purpose, qualityGate, truthBoundary].contains(where: { $0.isEmpty }) { issues.append("model intake registry identity is incomplete") }
        let boundaryTerms = ["installs no models", "downloads no weights", "trains no foundation model", "runs no inference", "calls no providers", "reads no credentials"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) { issues.append("model intake truth boundary must state \(term)") }
        if sourceResearch.count != 3 || requiredBeforeAnyModelInstall.count != 8 || requiredBeforeAnyTraining.count != 9 || candidateModelFamilies.count != 8 || hardwareInstallLanes.count != 3 || trainingLanes.count != 5 || forbiddenClaims.count != 7 || nextSafeActions.count != 4 {
            issues.append("model intake registry counts are not canonical")
        }
        if !installPolicy.isSafe || !knowledgeStrategy.isSafe { issues.append("model intake install or knowledge policy is unsafe") }
        for family in candidateModelFamilies { issues.append(contentsOf: family.validationIssues) }
        for lane in hardwareInstallLanes { issues.append(contentsOf: lane.validationIssues) }
        if !trainingLanes.allSatisfy(\.isSafe) { issues.append("model intake training lane is unsafe") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            installPolicy.isSafe &&
            candidateModelFamilies.allSatisfy { $0.allowedToday == "metadata-only" && $0.installState == "not-installed-by-registry" && $0.trainingUse == "not-authorized" } &&
            trainingLanes.allSatisfy { !$0.foundationModelTraining || !$0.allowedToday }
    }
}
