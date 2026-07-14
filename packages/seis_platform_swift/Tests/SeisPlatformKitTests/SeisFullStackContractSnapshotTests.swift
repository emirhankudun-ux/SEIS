import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Full-Stack Contract Snapshot")
struct SeisFullStackContractSnapshotTests {
    @Test func canonicalContractRemainsMetadataOnly() throws {
        let snapshot = try SeisFullStackContractSnapshot.validated(from: contractData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.publicEndpoints.count == 8)
        #expect(snapshot.providerStatus.count == 5)
        #expect(snapshot.providerEnvironmentValidation.isSafe)
        #expect(snapshot.providerEnvironmentValidation.networkCalled == false)
        #expect(snapshot.providerEnvironmentValidation.credentialAuthenticationPerformed == false)
        #expect(snapshot.agentTasks.count == 3)
        #expect(snapshot.capabilities.count == 7)
        #expect(snapshot.session.capabilitySummary["aiCore"] == "local-demo")
    }

    @Test func noServerFallbackAndSecretBoundariesStayExplicit() throws {
        let snapshot = try SeisFullStackContractSnapshot.validated(from: contractData())

        #expect(snapshot.localDemoFirst)
        #expect(snapshot.staticDemoFallbackRequired)
        #expect(snapshot.serverBoundary.writePolicy == "read-only endpoints for first contract slice")
        #expect(snapshot.frontendState.forbiddenClientPersistence.contains("API keys"))
        #expect(snapshot.frontendState.forbiddenClientPersistence.contains("provider credentials"))
        #expect(snapshot.providerStatus.allSatisfy(\.respectsSecretBoundary))
        #expect(snapshot.agentTasks.allSatisfy(\.isDryRunBounded))
    }

    @Test func unsafeProviderEnvironmentEvidenceIsRejected() throws {
        var root = try #require(JSONSerialization.jsonObject(with: contractData()) as? [String: Any])
        var validation = try #require(root["providerEnvironmentValidation"] as? [String: Any])
        validation["networkCalled"] = true
        root["providerEnvironmentValidation"] = validation
        let invalidData = try JSONSerialization.data(withJSONObject: root)

        do {
            _ = try SeisFullStackContractSnapshot.validated(from: invalidData)
            Issue.record("An unsafe provider environment validation was accepted")
        } catch let error as SeisFullStackContractSnapshotError {
            guard case let .invalidSnapshot(issues) = error else {
                Issue.record("Unexpected full-stack contract error: \(error)")
                return
            }
            #expect(issues.contains("full-stack provider environment validation boundary is unsafe"))
        }
    }

    private func contractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-fullstack-contract.json"))
    }
}
