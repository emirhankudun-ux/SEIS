import Foundation

public struct SeisAICoreMCPSurface: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let count: Int
    public let state: String
    public let method: String
    public let evidence: String
    public let duty: String

    public init(id: String, label: String, count: Int, state: String, method: String, evidence: String, duty: String) {
        self.id = id
        self.label = label
        self.count = count
        self.state = state
        self.method = method
        self.evidence = evidence
        self.duty = duty
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.isEmpty || label.isEmpty || method.isEmpty || evidence.isEmpty || duty.isEmpty {
            issues.append("MCP surface \(id) has incomplete fields")
        }
        if count < 0 { issues.append("MCP surface \(id) count must not be negative") }
        if state != "verified" { issues.append("MCP surface \(id) must remain verified") }
        return issues
    }
}

public enum SeisAICoreMCPRuntimeContractSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAICoreMCPRuntimeContractSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: Int
    public let status: String
    public let sourcePath: String
    public let resourceUri: String
    public let transport: String
    public let lifecycle: String
    public let fallbackRuntime: String
    public let fallback: String
    public let officialSdk: String
    public let toolCount: Int
    public let resourceCount: Int
    public let promptCount: Int
    public let smokeTest: String
    public let pluginGate: String
    public let resourceRead: String
    public let pluginIntegrationResource: String
    public let boundary: String
    public let credentialBoundary: String
    public let surfaces: [SeisAICoreMCPSurface]

    public init(
        id: String,
        version: Int,
        status: String,
        sourcePath: String,
        resourceUri: String,
        transport: String,
        lifecycle: String,
        fallbackRuntime: String,
        fallback: String,
        officialSdk: String,
        toolCount: Int,
        resourceCount: Int,
        promptCount: Int,
        smokeTest: String,
        pluginGate: String,
        resourceRead: String,
        pluginIntegrationResource: String,
        boundary: String,
        credentialBoundary: String,
        surfaces: [SeisAICoreMCPSurface]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.sourcePath = sourcePath
        self.resourceUri = resourceUri
        self.transport = transport
        self.lifecycle = lifecycle
        self.fallbackRuntime = fallbackRuntime
        self.fallback = fallback
        self.officialSdk = officialSdk
        self.toolCount = toolCount
        self.resourceCount = resourceCount
        self.promptCount = promptCount
        self.smokeTest = smokeTest
        self.pluginGate = pluginGate
        self.resourceRead = resourceRead
        self.pluginIntegrationResource = pluginIntegrationResource
        self.boundary = boundary
        self.credentialBoundary = credentialBoundary
        self.surfaces = surfaces
    }

    public static func validated(from data: Data) throws -> SeisAICoreMCPRuntimeContractSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAICoreMCPRuntimeContractSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAICoreMCPRuntimeContractSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-core-mcp-runtime-contract" { issues.append("MCP contract id must identify the canonical runtime contract") }
        if version != 1 || status != "local-smoke-verified" { issues.append("MCP contract version/status is not the verified local fixture") }
        let textValues = [sourcePath, resourceUri, transport, lifecycle, fallbackRuntime, fallback, officialSdk, smokeTest, pluginGate, resourceRead, pluginIntegrationResource, boundary, credentialBoundary]
        if textValues.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("MCP contract identity fields must not be empty")
        }
        if toolCount != 37 || resourceCount != 30 || promptCount != 3 { issues.append("MCP contract inventory counts are not the expected local fixture counts") }
        if transport != "stdio newline-delimited JSON-RPC" { issues.append("MCP transport must remain newline-delimited local stdio JSON-RPC") }
        if lifecycle != "initialize -> notifications/initialized -> tools/list" { issues.append("MCP lifecycle must remain initialize -> notifications/initialized -> tools/list") }
        if surfaces.count != 4 { issues.append("MCP contract must expose four verified surfaces") }
        let expectedSurfaceIDs = ["tools", "resources", "prompts", "transport"]
        if surfaces.map(\.id) != expectedSurfaceIDs { issues.append("MCP surface IDs must remain ordered and canonical") }
        for surface in surfaces { issues.append(contentsOf: surface.validationIssues) }
        let forbiddenTerms = ["remote MCP servers", "credentials", "SSH", "deploy", "GitHub", "unrestricted shell"]
        for term in forbiddenTerms where !boundary.localizedCaseInsensitiveContains(term) {
            issues.append("MCP boundary must state \(term)")
        }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            surfaces.allSatisfy { $0.state == "verified" } &&
            transport == "stdio newline-delimited JSON-RPC" &&
            lifecycle == "initialize -> notifications/initialized -> tools/list" &&
            credentialBoundary.localizedCaseInsensitiveContains("No provider keys")
    }
}
