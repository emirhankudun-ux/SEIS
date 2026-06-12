import SeisPlatformKit
import SwiftUI

struct AppleContinuationWindow: View {
    @StateObject private var model = SeisAppleContinuationModel()
    @State private var request = "SwiftUI macOS and iOS UIKit CloudKit Core Data workflow"

    var body: some View {
        NavigationSplitView {
            List(model.snapshot.focusAreas, id: \.framework) { focus in
                VStack(alignment: .leading, spacing: 2) {
                    Text(focus.framework)
                        .font(.body.weight(.medium))
                    Text(focus.platform.rawValue)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Apple")
        } detail: {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SeisAppleContinuationView(snapshot: model.snapshot)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Route Request")
                            .font(.headline)
                        TextField("Describe an Apple-native SEIS surface", text: $request)
                            .textFieldStyle(.roundedBorder)
                            .onSubmit(focusFromRequest)
                        Button("Apply Focus", action: focusFromRequest)
                    }
                }
                .padding(20)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .navigationTitle(model.snapshot.title)
            .toolbar {
                Button("Apple Native", action: focusAppleNative)
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .seisFocusAppleNative)) { _ in
            focusAppleNative()
        }
    }

    private func focusFromRequest() {
        model.focus(on: request)
    }

    private func focusAppleNative() {
        request = "SwiftUI macOS and iOS UIKit CloudKit Core Data workflow"
        model.focus(on: request)
    }
}
