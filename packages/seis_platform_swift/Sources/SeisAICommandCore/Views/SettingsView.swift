import SwiftUI

struct SettingsView: View {
    @Binding var lowMotion: Bool
    @Binding var compactInspector: Bool

    var body: some View {
        Form {
            Toggle("Prefer low motion", isOn: $lowMotion)
            Toggle("Compact inspector", isOn: $compactInspector)
            Text("Settings are local to the demo and do not connect to provider accounts.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(20)
        .frame(width: 420)
    }
}
