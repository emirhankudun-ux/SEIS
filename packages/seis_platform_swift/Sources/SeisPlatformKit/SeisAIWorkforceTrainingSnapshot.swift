import Foundation

public struct SeisAIWorkforceTrainingSourceOfTruth: Codable, Equatable, Sendable {
    public let aiCoreDoc: String
    public let trainingDoc: String
    public let workforceAssignments: String
    public let providerRegistry: String
    public let modelFamilyRegistry: String
    public let modelPromotionPolicy: String
    public let modelBenchmarkSuite: String
    public let languageModelIntakeRegistry: String

    public init(
        aiCoreDoc: String,
        trainingDoc: String,
        workforceAssignments: String,
        providerRegistry: String,
        modelFamilyRegistry: String,
        modelPromotionPolicy: String,
        modelBenchmarkSuite: String,
        languageModelIntakeRegistry: String
    ) {
        self.aiCoreDoc = aiCoreDoc
        self.trainingDoc = trainingDoc
        self.workforceAssignments = workforceAssignments
        self.providerRegistry = providerRegistry
        self.modelFamilyRegistry = modelFamilyRegistry
        self.modelPromotionPolicy = modelPromotionPolicy
        self.modelBenchmarkSuite = modelBenchmarkSuite
        self.languageModelIntakeRegistry = languageModelIntakeRegistry
    }
}

public struct SeisAIWorkforceTrainingMeaning: Codable, Equatable, Sendable {
    public let currentMeaning: String
    public let notMeaning: [String]

    public init(currentMeaning: String, notMeaning: [String]) {
        self.currentMeaning = currentMeaning
        self.notMeaning = notMeaning
    }
}

public struct SeisAIWorkforceTrainingLauncherEvidence: Codable, Equatable, Sendable {
    public let command: String
    public let observedDate: String
    public let notes: [String]
    public let installedRoutes: [String]
    public let missingOrDisabledRoutes: [String]

    public init(
        command: String,
        observedDate: String,
        notes: [String],
        installedRoutes: [String],
        missingOrDisabledRoutes: [String]
    ) {
        self.command = command
        self.observedDate = observedDate
        self.notes = notes
        self.installedRoutes = installedRoutes
        self.missingOrDisabledRoutes = missingOrDisabledRoutes
    }
}

public struct SeisAIWorkforceTrainingTrainerRole: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let routeStatus: String
    public let trainingRole: String
    public let allowedContribution: String
    public let secretAccessAllowed: Bool
    public let liveProviderCallAllowed: Bool
    public let externalTrainingAllowed: Bool
    public let outputStatus: String

    public init(
        id: String,
        displayName: String,
        routeStatus: String,
        trainingRole: String,
        allowedContribution: String,
        secretAccessAllowed: Bool,
        liveProviderCallAllowed: Bool,
        externalTrainingAllowed: Bool,
        outputStatus: String
    ) {
        self.id = id
        self.displayName = displayName
        self.routeStatus = routeStatus
        self.trainingRole = trainingRole
        self.allowedContribution = allowedContribution
        self.secretAccessAllowed = secretAccessAllowed
        self.liveProviderCallAllowed = liveProviderCallAllowed
        self.externalTrainingAllowed = externalTrainingAllowed
        self.outputStatus = outputStatus
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("trainer role id must not be empty") }
        if displayName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("trainer role displayName must not be empty") }
        if routeStatus.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("trainer role routeStatus must not be empty") }
        if trainingRole.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("trainer role trainingRole must not be empty") }
        if allowedContribution.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("trainer role allowedContribution must not be empty") }
        if outputStatus.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("trainer role outputStatus must not be empty") }
        if secretAccessAllowed || liveProviderCallAllowed || externalTrainingAllowed {
            issues.append("trainer role (id) must remain local and credential-free")
        }
        return issues
    }
}

public struct SeisAIWorkforceTrainingLoop: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let owner: String
    public let input: String
    public let output: String
    public let acceptanceGate: String

    public init(id: String, owner: String, input: String, output: String, acceptanceGate: String) {
        self.id = id
        self.owner = owner
        self.input = input
        self.output = output
        self.acceptanceGate = acceptanceGate
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("training loop id must not be empty") }
        if owner.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("training loop owner must not be empty") }
        if input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("training loop input must not be empty") }
        if output.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("training loop output must not be empty") }
        if acceptanceGate.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("training loop acceptanceGate must not be empty") }
        return issues
    }
}

public struct SeisAIWorkforceTrainingModelTarget: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let purpose: String
    public let datasetPath: String
    public let artifactPath: String
    public let trainingCommand: String
    public let validationCommand: String
    public let runtimeAuthority: Bool

    public init(
        id: String,
        purpose: String,
        datasetPath: String,
        artifactPath: String,
        trainingCommand: String,
        validationCommand: String,
        runtimeAuthority: Bool
    ) {
        self.id = id
        self.purpose = purpose
        self.datasetPath = datasetPath
        self.artifactPath = artifactPath
        self.trainingCommand = trainingCommand
        self.validationCommand = validationCommand
        self.runtimeAuthority = runtimeAuthority
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model target id must not be empty") }
        if purpose.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model target purpose must not be empty") }
        if datasetPath.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model target datasetPath must not be empty") }
        if artifactPath.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model target artifactPath must not be empty") }
        if trainingCommand.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model target trainingCommand must not be empty") }
        if validationCommand.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model target validationCommand must not be empty") }
        if runtimeAuthority { issues.append("model target (id) must keep runtimeAuthority false") }
        return issues
    }
}

public enum SeisAIWorkforceTrainingSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAIWorkforceTrainingSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let updatedAt: String
    public let purpose: String
    public let qualityGate: String
    public let automationCommand: String
    public let sourceOfTruth: SeisAIWorkforceTrainingSourceOfTruth
    public let truthBoundary: String
    public let trainingMeaning: SeisAIWorkforceTrainingMeaning
    public let currentLauncherEvidence: SeisAIWorkforceTrainingLauncherEvidence
    public let trainerRoles: [SeisAIWorkforceTrainingTrainerRole]
    public let trainingLoops: [SeisAIWorkforceTrainingLoop]
    public let modelTargets: [SeisAIWorkforceTrainingModelTarget]
    public let safetyRules: [String]
    public let acceptanceGates: [String]

    public init(
        id: String,
        version: String,
        status: String,
        updatedAt: String,
        purpose: String,
        qualityGate: String,
        automationCommand: String,
        sourceOfTruth: SeisAIWorkforceTrainingSourceOfTruth,
        truthBoundary: String,
        trainingMeaning: SeisAIWorkforceTrainingMeaning,
        currentLauncherEvidence: SeisAIWorkforceTrainingLauncherEvidence,
        trainerRoles: [SeisAIWorkforceTrainingTrainerRole],
        trainingLoops: [SeisAIWorkforceTrainingLoop],
        modelTargets: [SeisAIWorkforceTrainingModelTarget],
        safetyRules: [String],
        acceptanceGates: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.updatedAt = updatedAt
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.automationCommand = automationCommand
        self.sourceOfTruth = sourceOfTruth
        self.truthBoundary = truthBoundary
        self.trainingMeaning = trainingMeaning
        self.currentLauncherEvidence = currentLauncherEvidence
        self.trainerRoles = trainerRoles
        self.trainingLoops = trainingLoops
        self.modelTargets = modelTargets
        self.safetyRules = safetyRules
        self.acceptanceGates = acceptanceGates
    }

    public static func validated(from data: Data) throws -> SeisAIWorkforceTrainingSnapshot {
        guard let snapshot = try? JSONDecoder().decode(SeisAIWorkforceTrainingSnapshot.self, from: data) else {
            throw SeisAIWorkforceTrainingSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAIWorkforceTrainingSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let requiredText: [(String, String)] = [
            (id, "training snapshot id"),
            (version, "training snapshot version"),
            (status, "training snapshot status"),
            (updatedAt, "training snapshot updatedAt"),
            (purpose, "training snapshot purpose"),
            (qualityGate, "training quality gate"),
            (automationCommand, "training automation command"),
            (truthBoundary, "training truth boundary")
        ]
        for (value, label) in requiredText where value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("\(label) must not be empty")
        }
        if id != "seis-ai-workforce-training-plan" { issues.append("training snapshot id must identify the canonical plan") }
        if !qualityGate.hasPrefix("npm run check:") { issues.append("training quality gate must be a local npm check") }
        if !automationCommand.hasPrefix("npm run automation:") { issues.append("training automation must be a local npm automation command") }
        let boundaryTerms = ["no live provider calls", "no credential validation", "no SSH", "no deployment", "no external dataset download", "no cloud fine-tuning"]
        for term in boundaryTerms where !truthBoundary.localizedCaseInsensitiveContains(term) {
            issues.append("training truth boundary must state: \(term)")
        }
        if trainingMeaning.notMeaning.isEmpty { issues.append("training meaning must include explicit notMeaning terms") }
        if currentLauncherEvidence.installedRoutes.isEmpty { issues.append("launcher evidence must include installed routes") }
        if currentLauncherEvidence.missingOrDisabledRoutes.isEmpty { issues.append("launcher evidence must include missing or disabled routes") }
        if trainerRoles.isEmpty { issues.append("trainer roles must not be empty") }
        if trainingLoops.isEmpty { issues.append("training loops must not be empty") }
        if modelTargets.isEmpty { issues.append("model targets must not be empty") }
        if safetyRules.isEmpty { issues.append("training safety rules must not be empty") }
        if acceptanceGates.isEmpty { issues.append("training acceptance gates must not be empty") }

        issues.append(contentsOf: duplicateIssues(trainerRoles.map(\.id), label: "trainer role"))
        issues.append(contentsOf: duplicateIssues(trainingLoops.map(\.id), label: "training loop"))
        issues.append(contentsOf: duplicateIssues(modelTargets.map(\.id), label: "model target"))
        for role in trainerRoles { issues.append(contentsOf: role.validationIssues.map { "\(role.id): \($0)" }) }
        for loop in trainingLoops { issues.append(contentsOf: loop.validationIssues.map { "\(loop.id): \($0)" }) }
        for target in modelTargets { issues.append(contentsOf: target.validationIssues.map { "\(target.id): \($0)" }) }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }

    public var isMetadataOnly: Bool {
        isValid &&
            trainerRoles.count == 10 &&
            trainingLoops.count == 7 &&
            modelTargets.count == 4 &&
            trainerRoles.allSatisfy { !$0.secretAccessAllowed && !$0.liveProviderCallAllowed && !$0.externalTrainingAllowed } &&
            modelTargets.allSatisfy { !$0.runtimeAuthority }
    }

    private func duplicateIssues(_ ids: [String], label: String) -> [String] {
        let duplicates = ids.reduce(into: [String: Int]()) { counts, id in counts[id, default: 0] += 1 }
            .filter { $0.value > 1 }
            .map(\.key)
            .sorted()
        guard !duplicates.isEmpty else { return [] }
        return ["duplicate \(label) IDs: \(duplicates.joined(separator: ", "))"]
    }
}
