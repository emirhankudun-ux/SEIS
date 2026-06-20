import SwiftUI

struct ApprovalsView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        SurfaceCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 5) {
                        Text("Approval gate")
                            .font(.title2.weight(.semibold))
                        Text(approvalMessage)
                            .font(.callout)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer()
                    StatusPill(label: store.approved ? "Approved" : store.approvalRequired ? "Waiting" : "Not required", kind: store.approved ? .ready : .attention)
                }

                HStack {
                    Toggle("Require approval", isOn: $store.approvalRequired)
                    Toggle("Redact secrets", isOn: $store.redactSecrets)
                    Spacer()
                }
                .onChange(of: store.approvalRequired) { _ in store.updateRiskControls() }
                .onChange(of: store.redactSecrets) { _ in store.updateRiskControls() }

                Button {
                    store.approveRun()
                } label: {
                    Label("Approve run", systemImage: "checkmark.shield")
                }
                .buttonStyle(.borderedProminent)
                .disabled(!store.canApprove)
            }
        }
    }

    private var approvalMessage: String {
        if store.approved {
            return "Human approval is recorded. This demo still will not execute privileged actions."
        }
        if !store.approvalRequired {
            return "Approval is disabled only inside the local demo. Provider calls and privileged operations remain disconnected."
        }
        return "No privileged action, deployment, SSH mutation, credential access, or destructive command can run before human approval."
    }
}
