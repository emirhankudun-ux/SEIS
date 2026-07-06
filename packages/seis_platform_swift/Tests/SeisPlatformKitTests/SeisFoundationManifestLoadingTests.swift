import Foundation
import Testing
@testable import SeisPlatformKit

@Test func mcpPermissionRiskRecordsLoadFromPublicSafeManifest() throws {
    let matrix: SeisMCPPermissionRiskMatrix = try decodeRepositoryJSON(
        "content/development/seis-mcp-permission-risk-matrix.json"
    )

    #expect(matrix.id == "seis-mcp-permission-risk-matrix")
    #expect(matrix.visibility == "public-safe")
    #expect(matrix.activationPolicy.noBlanketActivation)
    #expect(matrix.activationPolicy.noSecretDisclosure)
    #expect(!matrix.activationPolicy.credentialStorageAllowed)
    #expect(!matrix.activationPolicy.providerCallsAllowedByDefault)
    #expect(matrix.activationPolicy.externalMutationRequiresUserConfirmation)
    #expect(matrix.records.count == 12)

    let candidate = try #require(matrix.record(id: "candidate-mcp-ecosystem-pool"))
    #expect(candidate.isDocumentationOnly)
    #expect(candidate.requiresApprovalBeforeUse)
    #expect(candidate.secretsRequired == .text("unknown"))

    let externalMutationRecords = matrix.records.filter { $0.isExternalMutationCapable }
    #expect(!externalMutationRecords.isEmpty)
    #expect(externalMutationRecords.allSatisfy { $0.requiresApprovalBeforeUse })
}

@Test func mcpPermissionRiskRecordsKeepPackageRunnersApprovalGated() throws {
    let matrix: SeisMCPPermissionRiskMatrix = try decodeRepositoryJSON(
        "content/development/seis-mcp-permission-risk-matrix.json"
    )
    let packageRunner = try #require(matrix.record(id: "package-runner-mcp"))
    let sshCloudDeploy = try #require(matrix.record(id: "ssh-cloud-deploy-mcp"))

    #expect(packageRunner.riskLevel == "high")
    #expect(packageRunner.requiresApprovalBeforeUse)
    #expect(packageRunner.secretsRequired.requiresSecretMaterial)
    #expect(sshCloudDeploy.riskLevel == "blocked")
    #expect(sshCloudDeploy.requiresApprovalBeforeUse)
    #expect(sshCloudDeploy.secretsRequired.requiresSecretMaterial)
}

@Test func stitchModuleFamiliesLoadFromPublicSafeCatalog() throws {
    let catalog: SeisStitchUXScreenCatalog = try decodeRepositoryJSON(
        "content/development/seis-stitch-ux-screen-catalog.json"
    )

    #expect(catalog.id == "seis-stitch-ux-screen-catalog")
    #expect(catalog.visibility == "public-safe")
    #expect(catalog.moduleFamilies.count == 10)
    #expect(catalog.usageBoundary.swiftMayUseAsModuleVocabulary)
    #expect(catalog.usageBoundary.demoMayUseAsDesignReference)
    #expect(!catalog.usageBoundary.originalArchivesMutable)
    #expect(!catalog.usageBoundary.allowsRepositoryAssetImportWithoutReview)

    let commandCenter = try #require(catalog.moduleFamily(id: "command-center"))
    #expect(commandCenter.label == "Command Center")
    #expect(commandCenter.priority == "P0")
    #expect(commandCenter.isFoundationPriority)
    #expect(commandCenter.sourceSignals.contains("seis_command_center"))

    let appleShell = try #require(catalog.moduleFamily(id: "apple-shell"))
    #expect(appleShell.priority == "P1")
    #expect(appleShell.isFoundationPriority)
    #expect(appleShell.allowedNextStep == "Swift model vocabulary")
}

@Test func stitchCatalogKeepsAssetsAndCodeReferenceReviewGated() throws {
    let catalog: SeisStitchUXScreenCatalog = try decodeRepositoryJSON(
        "content/development/seis-stitch-ux-screen-catalog.json"
    )

    #expect(!catalog.usageBoundary.rawArchiveDumpAllowed)
    #expect(!catalog.usageBoundary.codeCopyAllowedWithoutReview)
    #expect(catalog.usageBoundary.selectedAssetsAllowedAfterReview)
    #expect(catalog.usageBoundary.licenseReviewRequired)
    #expect(catalog.usageBoundary.sizeReviewRequired)
    #expect(catalog.usageBoundary.publicSafeReviewRequired)
}

private func decodeRepositoryJSON<T: Decodable>(_ relativePath: String) throws -> T {
    let url = try repositoryRootForFoundationFixtures().appending(path: relativePath)
    let data = try Data(contentsOf: url)
    return try JSONDecoder().decode(T.self, from: data)
}

private func repositoryRootForFoundationFixtures() throws -> URL {
    var candidate = URL(fileURLWithPath: #filePath)
    for _ in 0..<12 {
        candidate.deleteLastPathComponent()
        let marker = candidate.appending(path: "AGENTS.md")
        if FileManager.default.fileExists(atPath: marker.path) {
            return candidate
        }
    }

    throw FoundationFixtureError.repositoryRootNotFound
}

private enum FoundationFixtureError: Error {
    case repositoryRootNotFound
}
