import Foundation
import Testing
@testable import SeisPlatformKit

struct SeisMariaRecoveryImportStateTests {
    private func emptySnapshot() throws -> SeisMariaRecoverySnapshot {
        let json = #"{"schema_version":1,"project_id":"SEIS","rows":[],"total_candidates":0,"replan_required":0,"drift_detected":0,"evidence_required":0,"anchor_missing":0,"aligned_replan_required":0,"complete":0,"execution_authorized":false}"#
        return try SeisMariaRecoveryDecoder.decode(Data(json.utf8))
    }

    @Test func noSourceAndAnImportedEmptySnapshotAreDifferent() throws {
        var state = SeisMariaRecoveryImportState()
        #expect(state.phase == .unloaded)
        let token = state.beginImport()
        #expect(state.phase == .loading)
        state.finishImport(token: token, result: .success(try emptySnapshot()))
        guard case .loaded(let snapshot) = state.phase else { Issue.record("Expected imported snapshot"); return }
        #expect(snapshot.rows.isEmpty)
        #expect(!state.isLive)
        #expect(!state.executionAuthorized)
    }

    @Test func newImportAndFailureNeverRetainOldSuccessfulSnapshot() throws {
        var state = SeisMariaRecoveryImportState()
        let first = state.beginImport()
        state.finishImport(token: first, result: .success(try emptySnapshot()))
        let second = state.beginImport()
        #expect(state.phase == .loading)
        state.finishImport(token: second, result: .failure(.invalidJSON))
        #expect(state.phase == .invalid(.invalidJSON))
        #expect(!state.isLive)
        #expect(!state.executionAuthorized)
    }

    @Test func staleCompletionCannotOverwriteANewerImport() throws {
        var state = SeisMariaRecoveryImportState()
        let old = state.beginImport()
        let current = state.beginImport()
        state.finishImport(token: old, result: .success(try emptySnapshot()))
        #expect(state.phase == .loading)
        state.finishImport(token: current, result: .failure(.wrongProject))
        state.finishImport(token: old, result: .success(try emptySnapshot()))
        #expect(state.phase == .invalid(.wrongProject))
    }

    @Test func clearInvalidatesAnInFlightReadAndOnlyClearsPresentation() throws {
        var state = SeisMariaRecoveryImportState()
        let token = state.beginImport()
        state.clear()
        state.finishImport(token: token, result: .success(try emptySnapshot()))
        #expect(state.phase == .unloaded)
        #expect(!state.executionAuthorized)
    }
}
