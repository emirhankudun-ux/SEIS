import Foundation

public struct SeisFullTechnologyExplorerState: Equatable, Sendable {
    public let catalog: SeisFullTechnologyCatalog
    public private(set) var query: String
    public private(set) var selectedDomainID: String?

    public init(catalog: SeisFullTechnologyCatalog) {
        self.catalog = catalog
        self.query = ""
        self.selectedDomainID = catalog.registry.domains.first?.id
    }

    public var visibleDomains: [SeisFullTechnologyDomain] {
        let normalizedQuery = Self.normalized(query)
        guard normalizedQuery.isEmpty == false else {
            return catalog.registry.domains
        }

        return catalog.registry.domains.filter { domain in
            let searchableValues = [domain.id, domain.name] + domain.capabilities
            return searchableValues.contains { value in
                Self.normalized(value).contains(normalizedQuery)
            }
        }
    }

    public var selectedDomain: SeisFullTechnologyDomain? {
        guard let selectedDomainID else {
            return nil
        }
        return visibleDomains.first { $0.id == selectedDomainID }
    }

    public var resultSummary: String {
        let domains = visibleDomains
        guard domains.isEmpty == false else {
            return "No matching domains"
        }

        let capabilityCount = domains.reduce(into: 0) { count, domain in
            count += domain.capabilities.count
        }
        let domainLabel = domains.count == 1 ? "domain" : "domains"
        let capabilityLabel = capabilityCount == 1 ? "capability" : "capabilities"
        return "\(domains.count) \(domainLabel) · \(capabilityCount) \(capabilityLabel)"
    }

    public mutating func updateQuery(_ newQuery: String) {
        query = newQuery
        reconcileSelection()
    }

    @discardableResult
    public mutating func selectDomain(id: String) -> Bool {
        guard visibleDomains.contains(where: { $0.id == id }) else {
            return false
        }

        selectedDomainID = id
        return true
    }

    private mutating func reconcileSelection() {
        let domains = visibleDomains
        guard domains.isEmpty == false else {
            selectedDomainID = nil
            return
        }

        if let selectedDomainID,
           domains.contains(where: { $0.id == selectedDomainID }) {
            return
        }

        selectedDomainID = domains[0].id
    }

    private static func normalized(_ value: String) -> String {
        value
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .folding(
                options: [.caseInsensitive, .diacriticInsensitive],
                locale: Locale(identifier: "en_US_POSIX")
            )
            .lowercased()
    }
}
