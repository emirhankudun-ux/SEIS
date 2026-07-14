import Foundation

public protocol SeisAILocalLoopbackHTTPClient: Sendable {
    func data(for request: URLRequest) async throws -> (Data, URLResponse)
}

private final class SeisAILocalLoopbackURLSessionDelegate: NSObject, URLSessionTaskDelegate, @unchecked Sendable {
    func urlSession(
        _ session: URLSession,
        task: URLSessionTask,
        willPerformHTTPRedirection response: HTTPURLResponse,
        newRequest request: URLRequest,
        completionHandler: @escaping (URLRequest?) -> Void
    ) {
        completionHandler(nil)
    }
}

public struct SeisAIURLSessionHTTPClient: SeisAILocalLoopbackHTTPClient, Sendable {
    public init() {}

    public func data(for request: URLRequest) async throws -> (Data, URLResponse) {
        let session = URLSession(
            configuration: .ephemeral,
            delegate: SeisAILocalLoopbackURLSessionDelegate(),
            delegateQueue: nil
        )
        defer { session.invalidateAndCancel() }
        return try await session.data(for: request)
    }
}

public enum SeisAILocalLoopbackProviderError: Error, Equatable, Sendable {
    case invalidEndpoint(String)
    case invalidRequest([String])
    case invalidResponse(String)
    case unexpectedStatusCode(Int)
    case outputTooLarge
}

/// Opt-in Ollama-compatible adapter. It never reads credentials and only accepts loopback hosts.
public struct SeisAILocalLoopbackProviderAdapter: SeisAIProviderAdapter, Sendable {
    private struct GenerateRequest: Encodable {
        let model: String
        let prompt: String
        let stream: Bool
    }

    private struct GenerateResponse: Decodable {
        let model: String?
        let response: String?
        let error: String?
    }

    public let descriptor: SeisAIProviderDescriptor
    public let endpoint: URL
    private let httpClient: any SeisAILocalLoopbackHTTPClient

    public init(
        endpoint: URL = URL(string: "http://127.0.0.1:11434/api/generate")!,
        modelIdentifier: String = "ollama-local",
        httpClient: any SeisAILocalLoopbackHTTPClient = SeisAIURLSessionHTTPClient()
    ) throws {
        guard Self.isAllowedLoopbackEndpoint(endpoint) else {
            throw SeisAILocalLoopbackProviderError.invalidEndpoint(
                "Only http loopback endpoints are allowed: 127.0.0.1, localhost, or ::1."
            )
        }

        let descriptor = SeisAIProviderDescriptor.localLoopback(modelIdentifier: modelIdentifier)
        guard descriptor.validationIssues.isEmpty else {
            throw SeisAILocalLoopbackProviderError.invalidResponse("local loopback provider descriptor is invalid")
        }

        self.endpoint = endpoint
        self.descriptor = descriptor
        self.httpClient = httpClient
    }

    public func execute(_ request: SeisAIProviderExecutionRequest) async throws -> SeisAIProviderResponse {
        let requestIssues = request.validationIssues
        guard requestIssues.isEmpty else {
            throw SeisAILocalLoopbackProviderError.invalidRequest(requestIssues)
        }

        let prompt = request.input?.trimmingCharacters(in: .whitespacesAndNewlines)
            ?? "Task: \(request.routing.taskType)\nCapabilities: \(request.routing.requiredCapabilities.sorted().joined(separator: ", "))"
        guard !prompt.isEmpty else {
            throw SeisAILocalLoopbackProviderError.invalidResponse("loopback prompt must not be empty")
        }

        var urlRequest = URLRequest(url: endpoint)
        urlRequest.httpMethod = "POST"
        urlRequest.timeoutInterval = 30
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(
            GenerateRequest(model: descriptor.modelIdentifier, prompt: prompt, stream: false)
        )

        let (data, response) = try await httpClient.data(for: urlRequest)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SeisAILocalLoopbackProviderError.invalidResponse("loopback response was not HTTP")
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            throw SeisAILocalLoopbackProviderError.unexpectedStatusCode(httpResponse.statusCode)
        }

        let payload = try JSONDecoder().decode(GenerateResponse.self, from: data)
        if let error = payload.error?.trimmingCharacters(in: .whitespacesAndNewlines), !error.isEmpty {
            throw SeisAILocalLoopbackProviderError.invalidResponse("loopback provider returned an error")
        }
        guard let output = payload.response?.trimmingCharacters(in: .whitespacesAndNewlines), !output.isEmpty else {
            throw SeisAILocalLoopbackProviderError.invalidResponse("loopback provider returned no response text")
        }
        guard output.count <= SeisAIProviderResponse.maximumOutputLength else {
            throw SeisAILocalLoopbackProviderError.outputTooLarge
        }

        return SeisAIProviderResponse(
            providerID: descriptor.id,
            modelIdentifier: payload.model?.isEmpty == false ? payload.model! : descriptor.modelIdentifier,
            output: output,
            modelGenerated: true,
            providerCallPerformed: true,
            networkCallPerformed: true,
            clientCredentialRead: false
        )
    }

    private static func isAllowedLoopbackEndpoint(_ endpoint: URL) -> Bool {
        guard endpoint.scheme?.lowercased() == "http",
              let host = endpoint.host?.lowercased(),
              ["127.0.0.1", "localhost", "::1"].contains(host)
        else {
            return false
        }
        return endpoint.user == nil && endpoint.password == nil
    }
}
