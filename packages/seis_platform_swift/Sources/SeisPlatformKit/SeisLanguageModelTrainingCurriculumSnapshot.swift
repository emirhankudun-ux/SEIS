import Foundation

public struct SeisLanguageModelCurriculumFamilyGate: Codable, Equatable, Sendable {
    public let trainingLane: String
    public let readiness: String

    public init(trainingLane: String, readiness: String) {
        self.trainingLane = trainingLane
        self.readiness = readiness
    }

    public var isSafe: Bool {
        !trainingLane.isEmpty && readiness == "metadata-plan-blocked"
    }
}

public struct SeisLanguageModelCurriculumFamily: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let source: String
    public let representativeClasses: [String]
    public let allowedToday: String
    public let installState: String
    public let trainingUse: String
    public let licenseReviewStatus: String
    public let safetyNotes: [String]
    public let gate: SeisLanguageModelCurriculumFamilyGate
    public let preconditionsForAnyInstall: [String]

    public init(
        id: String,
        displayName: String,
        source: String,
        representativeClasses: [String],
        allowedToday: String,
        installState: String,
        trainingUse: String,
        licenseReviewStatus: String,
        safetyNotes: [String],
        gate: SeisLanguageModelCurriculumFamilyGate,
        preconditionsForAnyInstall: [String]
    ) {
        self.id = id
        self.displayName = displayName
        self.source = source
        self.representativeClasses = representativeClasses
        self.allowedToday = allowedToday
        self.installState = installState
        self.trainingUse = trainingUse
        self.licenseReviewStatus = licenseReviewStatus
        self.safetyNotes = safetyNotes
        self.gate = gate
        self.preconditionsForAnyInstall = preconditionsForAnyInstall
    }

    public var validationIssues: [String] {
        let text = [id, displayName, source, allowedToday, installState, trainingUse, licenseReviewStatus]
        var issues: [String] = []
        if text.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) || representativeClasses.isEmpty || safetyNotes.isEmpty {
            issues.append("curriculum model family \(id) is incomplete")
        }
        if allowedToday != "metadata-only" || installState != "not-installed-by-registry" || trainingUse != "not-authorized" {
            issues.append("curriculum model family \(id) exceeds the metadata-only boundary")
        }
        if !gate.isSafe || preconditionsForAnyInstall.count != 8 {
            issues.append("curriculum model family \(id) is missing install gates")
        }
        return issues
    }
}

public struct SeisLanguageModelCurriculumTrainingLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let allowedToday: Bool
    public let foundationModelTraining: Bool
    public let meaning: String

    public init(id: String, status: String, allowedToday: Bool, foundationModelTraining: Bool, meaning: String) {
        self.id = id
        self.status = status
        self.allowedToday = allowedToday
        self.foundationModelTraining = foundationModelTraining
        self.meaning = meaning
    }

    public var isSafe: Bool {
        (!id.isEmpty && !status.isEmpty && !meaning.isEmpty && !allowedToday && !foundationModelTraining) ||
            (id == "repo-local-seed-models" && allowedToday && !foundationModelTraining)
    }
}

public struct SeisLanguageModelCurriculumHardwareLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let ramClass: String
    public let allowedToday: String
    public let blockedClasses: [String]
    public let candidateModelClass: String

    public init(id: String, ramClass: String, allowedToday: String, blockedClasses: [String], candidateModelClass: String) {
        self.id = id
        self.ramClass = ramClass
        self.allowedToday = allowedToday
        self.blockedClasses = blockedClasses
        self.candidateModelClass = candidateModelClass
    }

    public var validationIssues: [String] {
        let text = [id, ramClass, allowedToday, candidateModelClass]
        if text.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) || blockedClasses.isEmpty {
            return ["curriculum hardware lane \(id) is incomplete"]
        }
        return []
    }
}

public struct SeisLanguageModelCurriculumScalingTarget: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let source: String
    public let status: String
    public let allowedRoute: Bool
    public let trainingStatus: String
    public let runtimeAuthority: Bool
    public let weightsAvailable: Bool?
    public let inferenceAvailable: Bool?
    public let benchmarkEvidenceAvailable: Bool?
    public let gate: String

    public init(
        id: String,
        source: String,
        status: String,
        allowedRoute: Bool,
        trainingStatus: String,
        runtimeAuthority: Bool,
        weightsAvailable: Bool? = nil,
        inferenceAvailable: Bool? = nil,
        benchmarkEvidenceAvailable: Bool? = nil,
        gate: String
    ) {
        self.id = id
        self.source = source
        self.status = status
        self.allowedRoute = allowedRoute
        self.trainingStatus = trainingStatus
        self.runtimeAuthority = runtimeAuthority
        self.weightsAvailable = weightsAvailable
        self.inferenceAvailable = inferenceAvailable
        self.benchmarkEvidenceAvailable = benchmarkEvidenceAvailable
        self.gate = gate
    }

    public var validationIssues: [String] {
        let text = [id, source, status, trainingStatus, gate]
        var issues: [String] = []
        if text.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("curriculum scaling target \(id) is incomplete")
        }
        if allowedRoute || runtimeAuthority || trainingStatus != "not-started" {
            issues.append("curriculum scaling target \(id) exceeds plan-only boundary")
        }
        if weightsAvailable == true || inferenceAvailable == true || benchmarkEvidenceAvailable == true {
            issues.append("curriculum scaling target \(id) claims unavailable evidence")
        }
        return issues
    }
}

public struct SeisLanguageModelCurriculumPhase: Codable, Equatable, Identifiable, Sendable {
    public let phase: String
    public let purpose: String
    public let commands: [String]
    public let status: String

    public var id: String { phase }

    public init(phase: String, purpose: String, commands: [String], status: String) {
        self.phase = phase
        self.purpose = purpose
        self.commands = commands
        self.status = status
    }

    public var validationIssues: [String] {
        let text = [phase, purpose, status]
        if text.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) || commands.isEmpty || !commands.allSatisfy({ $0.hasPrefix("npm run ") }) {
            return ["curriculum phase \(phase) is incomplete or not local"]
        }
        return []
    }
}

public enum SeisLanguageModelTrainingCurriculumSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisLanguageModelTrainingCurriculumSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let generatedAt: String
    public let status: String
    public let truthBoundary: [String]
    public let sourceOfTruth: [String: String]
    public let targetHardwareFloor: String
    public let familyCandidates: [SeisLanguageModelCurriculumFamily]
    public let trainingLanes: [SeisLanguageModelCurriculumTrainingLane]
    public let hardwareLanes: [SeisLanguageModelCurriculumHardwareLane]
    public let scalingTargets: [SeisLanguageModelCurriculumScalingTarget]
    public let curriculum: [SeisLanguageModelCurriculumPhase]
    public let safeControls: [String]
    public let nextApprovalNeeded: [String]
    public let evidenceArtifacts: [String]
    public let commandArtifacts: [String: String]

    public init(
        id: String,
        version: String,
        generatedAt: String,
        status: String,
        truthBoundary: [String],
        sourceOfTruth: [String: String],
        targetHardwareFloor: String,
        familyCandidates: [SeisLanguageModelCurriculumFamily],
        trainingLanes: [SeisLanguageModelCurriculumTrainingLane],
        hardwareLanes: [SeisLanguageModelCurriculumHardwareLane],
        scalingTargets: [SeisLanguageModelCurriculumScalingTarget],
        curriculum: [SeisLanguageModelCurriculumPhase],
        safeControls: [String],
        nextApprovalNeeded: [String],
        evidenceArtifacts: [String],
        commandArtifacts: [String: String]
    ) {
        self.id = id
        self.version = version
        self.generatedAt = generatedAt
        self.status = status
        self.truthBoundary = truthBoundary
        self.sourceOfTruth = sourceOfTruth
        self.targetHardwareFloor = targetHardwareFloor
        self.familyCandidates = familyCandidates
        self.trainingLanes = trainingLanes
        self.hardwareLanes = hardwareLanes
        self.scalingTargets = scalingTargets
        self.curriculum = curriculum
        self.safeControls = safeControls
        self.nextApprovalNeeded = nextApprovalNeeded
        self.evidenceArtifacts = evidenceArtifacts
        self.commandArtifacts = commandArtifacts
    }

    public static func validated(from data: Data) throws -> SeisLanguageModelTrainingCurriculumSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisLanguageModelTrainingCurriculumSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisLanguageModelTrainingCurriculumSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-language-model-training-curriculum" { issues.append("training curriculum id must identify the canonical record") }
        if status != "planned-training-contract" { issues.append("training curriculum must remain planned") }
        if [version, generatedAt, targetHardwareFloor].contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) { issues.append("training curriculum identity is incomplete") }
        if sourceOfTruth.count != 4 || !sourceOfTruth.keys.contains("registry") || !sourceOfTruth.keys.contains("workforcePlan") || !sourceOfTruth.keys.contains("modelScalingHardwareProfile") || !sourceOfTruth.keys.contains("modelParameterLadder") { issues.append("training curriculum source-of-truth map is incomplete") }
        let boundaryTerms = ["planning-only", "No model is installed, downloaded, or imported", "No cloud or local model training", "No provider keys", "No benchmark"]
        for term in boundaryTerms where !truthBoundary.contains(where: { $0.localizedCaseInsensitiveContains(term) }) { issues.append("training curriculum truth boundary must state \(term)") }
        if familyCandidates.count != 8 || trainingLanes.count != 5 || hardwareLanes.count != 3 || scalingTargets.count != 4 || curriculum.count != 4 || safeControls.count != 8 || nextApprovalNeeded.count != 4 || evidenceArtifacts.count != 7 || commandArtifacts.count != 3 { issues.append("training curriculum counts are not canonical") }
        for family in familyCandidates { issues.append(contentsOf: family.validationIssues) }
        for lane in hardwareLanes { issues.append(contentsOf: lane.validationIssues) }
        for target in scalingTargets { issues.append(contentsOf: target.validationIssues) }
        for phase in curriculum { issues.append(contentsOf: phase.validationIssues) }
        if !trainingLanes.allSatisfy(\.isSafe) { issues.append("training curriculum training lane is unsafe") }
        let expectedControls = ["No bulk install", "No checkpoint download", "No foundation pretraining", "No provider call authorization", "No dataset download", "No fine-tuning", "No adapter training in current contract", "Local-seed model only"]
        if !expectedControls.allSatisfy(safeControls.contains) { issues.append("training curriculum safe controls are incomplete") }
        if commandArtifacts["contract"] != "content/development/seis-language-model-training-curriculum.json" || commandArtifacts["report"] == nil || commandArtifacts["reportMarkdown"] == nil { issues.append("training curriculum command artifacts are incomplete") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            familyCandidates.allSatisfy { $0.allowedToday == "metadata-only" && $0.installState == "not-installed-by-registry" && $0.trainingUse == "not-authorized" } &&
            trainingLanes.allSatisfy { !$0.foundationModelTraining || !$0.allowedToday } &&
            scalingTargets.allSatisfy { !$0.allowedRoute && !$0.runtimeAuthority }
    }
}
