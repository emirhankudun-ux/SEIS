import SeisPlatformKit
import Foundation
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
    @SceneStorage("seis.apple.shell.selectedFocusFramework")
    private var selectedFocusFramework: String?
    private var repositoryRoot: String {
        #if os(macOS)
        FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library")
            .appendingPathComponent("Mobile Documents")
            .appendingPathComponent("com~apple~CloudDocs")
            .appendingPathComponent("Github")
            .appendingPathComponent("SEIS")
            .path
        #else
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
            .first?.path ?? ""
        #endif
    }

    var body: some View {
        NavigationSplitView {
            List(selection: $selectedFocusFramework) {
                ForEach(model.snapshot.focusAreas, id: \.framework) { focus in
                    HStack(spacing: 10) {
                        Image(systemName: systemImage(for: focus))
                            .foregroundStyle(.secondary)
                            .frame(width: 16)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(focus.framework)
                                .lineLimit(1)
                            Text(focus.platform.rawValue)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                        }
                    }
                    .tag(focus.framework)
                }
            }
            .listStyle(.sidebar)
            .navigationTitle("Apple")
        } detail: {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SeisAppleContinuationView(snapshot: model.snapshot)

                    if let selectedFocus {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Selected Framework")
                                .font(.headline)
                            Text(selectedFocus.framework)
                                .font(.subheadline.weight(.semibold))
                            Text(selectedFocus.purpose)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            HStack {
                                Text(selectedFocus.platform.rawValue)
                                Text(selectedFocus.qualityGate)
                            }
                            .font(.caption2.monospaced())
                            .foregroundStyle(.tertiary)
                        }
                        .padding()
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("\(selectedFocus.framework). \(selectedFocus.purpose). Quality gate \(selectedFocus.qualityGate).")
                    }

                    #if os(macOS)
                    SeisDesktopDemoCommandCenterView(workspacePath: repositoryRoot)
                    #endif

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
            ensureSelectedFocus()
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

    private var selectedFocus: SeisAppleFrameworkFocus? {
        if let selectedFocusFramework,
           let focus = model.snapshot.focusAreas.first(where: { $0.framework == selectedFocusFramework }) {
            return focus
        }
        return model.snapshot.focusAreas.first
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
            ensureSelectedFocus()
        } else {
            withAnimation(.easeInOut(duration: 0.2)) {
                model.focus(on: nextRequest)
                ensureSelectedFocus()
            }
        }
        telemetry.record(
            .focusRouteApplied,
            detail: "source=\(routeSource) platforms=\(model.snapshot.platforms.count) qualityGates=\(model.snapshot.qualityGates.count)"
        )
    }

    private func ensureSelectedFocus() {
        let frameworks = model.snapshot.focusAreas.map(\.framework)
        if let selectedFocusFramework,
           frameworks.contains(selectedFocusFramework) {
            return
        }
        selectedFocusFramework = frameworks.first
    }

    private func systemImage(for focus: SeisAppleFrameworkFocus) -> String {
        switch focus.framework {
        case "AppKit":
            "macwindow"
        case "UIKit":
            "iphone"
        case "Metal":
            "sparkles"
        case "Combine":
            "arrow.triangle.2.circlepath"
        case "Core Data + CloudKit":
            "icloud"
        default:
            "apple.logo"
        }
    }
}
