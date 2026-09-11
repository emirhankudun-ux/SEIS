import Testing
@testable import SeisPlatformKit

struct SeisMariaWorkspaceEvidenceTimestampTests {
    private let project = "SEIS"
    private let branch = "feature/maria-native-workspace-evidence-v1"
    private let revision = "0123456789abcdef0123456789abcdef01234567"

    @Test func acceptsCommonObservationFormsAlreadyAdmittedByMariaContext() throws {
        // Python ContextFact uses datetime.fromisoformat and treats a timezone-less
        // timestamp as UTC. The native evidence boundary must not reject that same
        // public evidence before a future bridge can hand it to MARIA context.
        let accepted = [
            "2026-09-11T15:00:00",
            "2026-09-11T18:00:00+03:00",
            "2026-09-11T15:00:00Z",
            "2026-09-11T15:00:00.123456Z",
        ]

        for observedAt in accepted {
            let snapshot = try SeisMariaWorkspaceEvidenceSnapshot(
                project: project,
                currentBranch: branch,
                repositoryRevision: revision,
                observedAt: observedAt
            )
            #expect(snapshot.observedAt == observedAt)
            #expect(!snapshot.executionAuthorized)
        }
    }

    @Test func stillRejectsAmbiguousOrNonIsoObservationText() {
        for observedAt in ["", "   ", "September 11 2026", "2026/09/11 15:00:00"] {
            #expect(throws: SeisMariaWorkspaceEvidenceError.self) {
                try SeisMariaWorkspaceEvidenceSnapshot(
                    project: project,
                    currentBranch: branch,
                    repositoryRevision: revision,
                    observedAt: observedAt
                )
            }
        }
    }
}
