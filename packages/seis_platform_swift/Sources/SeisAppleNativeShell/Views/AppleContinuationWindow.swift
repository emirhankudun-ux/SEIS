import SeisPlatformKit
import SwiftUI

struct AppleContinuationWindow: View {
    private let settings = SeisAppleShellSettingsContract.appleNativeShell
    private let telemetry = SeisAppleShellTelemetryLogger()

    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.lowMotionKey)
    private var lowMotion = SeisAppleShellSettingsContract.appleNativeShell.defaultLowMotion

    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.preferredFocusKey)
    private var preferredFocusRawValue = SeisAppleShellSettingsContract.appleNativeShell.defaultPreferredFocus.rawValue

    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.showsQualityGatesKey)
    private var showsQualityGates = SeisAppleShellSettingsContract.appleNativeShell.defaultShowsQualityGates

    @StateObject private var model = SeisAppleContinuationModel()
    @State private var request = SeisAppleShellSettingsContract.appleNativeShell.defaultPreferredFocus.request

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

                    AppleShellDiagnosticsView(snapshot: model.snapshot)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Route Request")
                            .font(.headline)
                        TextField("Describe an Apple-native SEIS surface", text: $request)
                            .textFieldStyle(.roundedBorder)
                            .onSubmit(focusFromRequest)
                        Button("Apply Focus", action: focusFromRequest)
                    }

                    if showsQualityGates {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Quality Gates")
                                .font(.headline)
                            ForEach(model.snapshot.qualityGates, id: \.self) { gate in
                                Text(gate)
                                    .font(.caption.monospaced())
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("Quality gates: \(model.snapshot.qualityGates.joined(separator: ", "))")
                    }
                }
                .padding(20)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .navigationTitle(model.snapshot.title)
            .toolbar {
                Button("Preferred Focus", action: focusPreferred)
            }
        }
        .onAppear {
            telemetry.record(.focusPreferenceChanged, detail: "initial=\(preferredFocusRawValue)")
            focusPreferred()
        }
        .onChange(of: preferredFocusRawValue) { _ in
            telemetry.record(.focusPreferenceChanged, detail: "preferredFocus=\(preferredFocusRawValue)")
            focusPreferred()
        }
        .onReceive(NotificationCenter.default.publisher(for: .seisFocusAppleNative)) { _ in
            telemetry.record(.focusCommandReceived, detail: "command=seisFocusAppleNative")
            focusPreferred()
        }
    }

    private func focusFromRequest() {
        applyFocus(request)
    }

    private func focusPreferred() {
        applyFocus(settings.request(for: preferredFocusRawValue))
    }

    private func applyFocus(_ nextRequest: String) {
        let routeSource = nextRequest == settings.request(for: preferredFocusRawValue)
            ? "preferred:\(settings.focusPreference(for: preferredFocusRawValue).rawValue)"
            : "manual"
        request = nextRequest
        if lowMotion {
            model.focus(on: nextRequest)
        } else {
            withAnimation(.easeInOut(duration: 0.2)) {
                model.focus(on: nextRequest)
            }
        }
        telemetry.record(
            .focusRouteApplied,
            detail: "source=\(routeSource) platforms=\(model.snapshot.platforms.count) qualityGates=\(model.snapshot.qualityGates.count)"
        )
    }
}
