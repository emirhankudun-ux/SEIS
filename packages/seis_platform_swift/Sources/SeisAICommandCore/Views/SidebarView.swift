import SwiftUI

struct SidebarView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        List(selection: $store.selectedSection) {
            Section {
                ForEach(store.searchableSections) { section in
                    NavigationLink(value: section) {
                        Label {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(section.title)
                                    .font(.body.weight(.medium))
                                Text(section.subtitle)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        } icon: {
                            Image(systemName: section.systemImage)
                        }
                    }
                }
            } header: {
                Text("Command Core")
            }

            Section {
                VStack(alignment: .leading, spacing: 7) {
                    Text("Execution plane")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text("Local deterministic")
                        .font(.callout.weight(.semibold))
                    Text("Provider calls, secrets, SSH, deploys, and destructive actions are disconnected in this demo.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 6)
            }
        }
        .listStyle(.sidebar)
    }
}
