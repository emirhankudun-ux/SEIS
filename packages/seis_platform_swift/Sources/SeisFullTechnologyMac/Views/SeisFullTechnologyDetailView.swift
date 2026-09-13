import SeisPlatformKit
import SwiftUI

struct SeisFullTechnologyDetailView: View {
    let domain: SeisFullTechnologyDomain
    let registry: SeisFullTechnologyRegistry

    private let columns = [
        GridItem(.adaptive(minimum: 210), spacing: 12)
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                header
                capabilities
                safetyBoundary
                executionBoundary
            }
            .frame(maxWidth: 920, alignment: .leading)
            .padding(32)
        }
        .navigationTitle(domain.name)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(domain.name)
                .font(.largeTitle.weight(.semibold))
            Text(domain.id)
                .font(.callout.monospaced())
                .foregroundStyle(.secondary)
            Text("Source-backed domain inspection from the canonical Full Technology registry.")
                .foregroundStyle(.secondary)
        }
    }

    private var capabilities: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Capabilities")
                .font(.title2.weight(.semibold))

            LazyVGrid(columns: columns, alignment: .leading, spacing: 12) {
                ForEach(domain.capabilities, id: \.self) { capability in
                    HStack(spacing: 10) {
                        Image(systemName: "diamond")
                            .foregroundStyle(.cyan)
                        Text(capability)
                            .font(.body.monospaced())
                        Spacer(minLength: 0)
                    }
                    .padding(12)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                }
            }
        }
    }

    private var safetyBoundary: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Safety boundary")
                .font(.title2.weight(.semibold))

            Grid(alignment: .leading, horizontalSpacing: 24, verticalSpacing: 10) {
                GridRow {
                    Text("Default network")
                        .foregroundStyle(.secondary)
                    Text(registry.safetyBoundary.defaultNetwork)
                        .font(.body.monospaced())
                }
                GridRow {
                    Text("Default write")
                        .foregroundStyle(.secondary)
                    Text(registry.safetyBoundary.defaultWrite)
                        .font(.body.monospaced())
                }
                GridRow {
                    Text("Credentials in registry")
                        .foregroundStyle(.secondary)
                    Text(registry.safetyBoundary.credentialsInRegistry ? "yes" : "no")
                        .font(.body.monospaced())
                }
                GridRow {
                    Text("External mutation")
                        .foregroundStyle(.secondary)
                    Text(registry.safetyBoundary.externalMutationRequiresApproval ? "approval required" : "not gated")
                        .font(.body.monospaced())
                }
            }
            .padding(16)
            .background(.quaternary, in: RoundedRectangle(cornerRadius: 12))
        }
    }

    private var executionBoundary: some View {
        Label(
            "No tools execute from this surface",
            systemImage: "lock.shield"
        )
        .font(.callout.weight(.medium))
        .foregroundStyle(.secondary)
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}
