import SeisPlatformKit
import SwiftUI

struct SeisAppleLocalSearchView: View {
    private let index: SeisAppleLocalSearchIndex
    @SceneStorage("seis.apple.local-search.query") private var query = ""
    @SceneStorage("seis.apple.local-search.scope") private var scopeRawValue = SeisAppleLocalSearchScope.all.rawValue
    @State private var selectedResultID: String?

    init(index: SeisAppleLocalSearchIndex = .defaultIndex) {
        self.index = index
    }

    private var scope: SeisAppleLocalSearchScope {
        SeisAppleLocalSearchScope(rawValue: scopeRawValue) ?? .all
    }

    private var results: [SeisAppleLocalSearchResult] {
        index.search(query, scope: scope)
    }

    private var selectedResult: SeisAppleLocalSearchResult? {
        guard let selectedResultID else { return nil }
        return results.first { $0.id == selectedResultID }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "magnifyingglass.circle")
                    .font(.title2)
                    .foregroundStyle(.tint)
                VStack(alignment: .leading, spacing: 3) {
                    Text("SEIS Local Search").font(.headline)
                    Text("Searches typed product and runtime evidence metadata only; no external index is used.")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer(minLength: 8)
                Text("\(results.count) results").font(.caption2.monospaced()).foregroundStyle(.tertiary)
            }

            TextField("Search SEIS products, agents, providers, MCP, or evidence", text: $query)
                .textFieldStyle(.roundedBorder)

            Picker("Search scope", selection: $scopeRawValue) {
                ForEach(SeisAppleLocalSearchScope.allCases, id: \.rawValue) { option in
                    Text(option.displayLabel).tag(option.rawValue)
                }
            }
            .pickerStyle(.segmented)

            if results.isEmpty {
                Text(query.isEmpty ? "Enter a term to search the local SEIS index." : "No local results for this query.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 12)
            } else {
                ForEach(results) { result in
                    Button {
                        selectedResultID = result.id
                    } label: {
                        resultRow(result)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Inspect search result \(result.title), score \(result.score)")
                }
            }

            if let selectedResult {
                detail(selectedResult)
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("SEIS Local Search. Typed local product and runtime evidence index.")
    }

    private func resultRow(_ result: SeisAppleLocalSearchResult) -> some View {
        HStack(alignment: .top, spacing: 9) {
            Image(systemName: result.kind == .productSurface ? "square.grid.2x2" : "checkmark.seal")
                .foregroundStyle(result.kind == .productSurface ? .tint : .green)
                .frame(width: 20)
            VStack(alignment: .leading, spacing: 3) {
                Text(result.title).font(.caption.weight(.semibold)).foregroundStyle(.primary)
                Text("\(result.state) · score \(result.score) · \(result.matchedTerms.joined(separator: ", "))")
                    .font(.caption2.monospaced()).foregroundStyle(.secondary)
                Text(result.summary).font(.caption2).foregroundStyle(.tertiary).lineLimit(2)
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right").font(.caption2).foregroundStyle(.tertiary)
        }
        .padding(9)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
    }

    private func detail(_ result: SeisAppleLocalSearchResult) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(result.title).font(.subheadline.weight(.semibold))
            Text("Boundary: \(result.boundary)").font(.caption2.monospaced()).foregroundStyle(.secondary)
            Text("Evidence: \(result.evidence)").font(.caption2).foregroundStyle(.tertiary)
            Text("Inspection only. This result does not execute an app, provider, MCP server, SSH command, or external search.")
                .font(.caption2).foregroundStyle(.orange)
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(result.title). Boundary: \(result.boundary). Evidence: \(result.evidence). Inspection only; no execution.")
    }
}
