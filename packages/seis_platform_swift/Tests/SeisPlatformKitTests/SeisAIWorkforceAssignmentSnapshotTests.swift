import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Workforce Assignment Snapshot")
struct SeisAIWorkforceAssignmentSnapshotTests {
    @Test func canonicalAssignmentRegistryDecodesAsMetadataOnly() throws {
        let snapshot = try SeisAIWorkforceAssignmentSnapshot.validated(from: assignmentData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.assignments.count == 10)
        #expect(snapshot.writerPolicy.primaryWriter == "codex")
        #expect(snapshot.currentLauncherEvidence.command == "npm run ai -- list")
        #expect(snapshot.currentLauncherEvidence.observedDate == "2026-06-23")
        #expect(snapshot.currentLauncherEvidence.notes.count == 3)
        #expect(snapshot.truthBoundary.contains("not live-model"))
        #expect(snapshot.approvalRequiredFor.contains("merge"))
        #expect(snapshot.assignments.contains { $0.id == "claude" && $0.launcherStatus.contains("missing-key") })
        #expect(snapshot.assignments.contains { $0.id == "ollama" && $0.launcherStatus == "installed" })
        #expect(snapshot.assignments.contains { $0.id == "kimi" })
        #expect(snapshot.assignments.allSatisfy { !$0.deniedActions.isEmpty })
    }

    @Test func invalidAssignmentRegistryRejectsDuplicateOrMissingGovernanceFields() {
        let assignment = SeisAIWorkforceAssignment(
            id: "duplicate",
            displayName: "Duplicate",
            route: "duplicate",
            launcherStatus: "installed",
            category: "review",
            coreDuties: ["review"],
            allowedOutputs: ["notes"],
            deniedActions: ["merge"],
            validationDuty: "validate"
        )
        let snapshot = SeisAIWorkforceAssignmentSnapshot(
            id: "seis-ai-workforce-assignments",
            version: "test",
            status: "documented",
            purpose: "test",
            writerPolicy: SeisAIWorkforceWriterPolicy(
                primaryWriter: "codex",
                rule: "one writer",
                handoffRequirement: "review"
            ),
            currentLauncherEvidence: SeisAIWorkforceLauncherEvidence(
                command: "live-provider-call",
                observedDate: "2026-06-23",
                notes: ["unsafe"]
            ),
            truthBoundary: "Live autonomous execution enabled.",
            approvalRequiredFor: ["merge"],
            assignments: [assignment, assignment]
        )

        #expect(!snapshot.isValid)
        #expect(snapshot.validationIssues.contains("duplicate workforce assignment IDs: duplicate"))
        #expect(snapshot.validationIssues.contains("workforce truth boundary must remain source-backed and metadata-only"))
        #expect(snapshot.validationIssues.contains("launcher evidence command must remain local-readiness-only"))
    }

    private func assignmentData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/ai-workforce-assignments.json"))
    }
}
