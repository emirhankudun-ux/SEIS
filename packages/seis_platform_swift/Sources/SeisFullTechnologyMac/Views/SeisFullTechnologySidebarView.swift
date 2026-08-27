import SeisPlatformKit
import SwiftUI

struct SeisFullTechnologySidebarView: View {
    let explorer: SeisFullTechnologyExplorerState
    let onSelect: (String) -> Void

    var body: some View {
        VStack(spacing: 0) {
            Text(explorer.resultSummary)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)

            List(
                selection: Binding<String?>(
                    get: { explorer.selectedDomainID },
                    set: { newValue in
                        if let newValue {
                            onSelect(newValue)
                        }
                    }
                )
            ) {
                ForEach(explorer.visibleDomains) { domain in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(domain.name)
                            .font(.body.weight(.medium))
                        Text("\(domain.capabilities.count) capabilities")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .tag(domain.id)
                    .accessibilityLabel("\(domain.name), \(domain.capabilities.count) capabilities")
                }
            }
            .listStyle(.sidebar)
        }
    }
}
