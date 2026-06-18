import SeisPlatformKit
import Foundation
import SwiftUI

#if os(macOS)
import AppKit

final class SeisAppleNativeShellAppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}
#endif

@main
struct SeisAppleNativeShellApp: App {
    @StateObject private var demoShellState = SeisDemoNativeShellState()
    @State private var activePanel: SeisAppleNativeShellPanel = .demo
    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.lowMotionKey)
    private var lowMotion = SeisAppleShellSettingsContract.appleNativeShell.defaultLowMotion
    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.preferredFocusKey)
    private var preferredFocus = SeisAppleShellSettingsContract.appleNativeShell.defaultPreferredFocus.rawValue
    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.showsQualityGatesKey)
    private var showsQualityGates = SeisAppleShellSettingsContract.appleNativeShell.defaultShowsQualityGates

    #if os(macOS)
    @NSApplicationDelegateAdaptor(SeisAppleNativeShellAppDelegate.self) private var appDelegate
    #endif

    var body: some Scene {
        WindowGroup("SEIS Apple Native") {
            SeisAppleNativeShellZeroToDemoView(
                demoShellState: demoShellState,
                repositoryPath: repositoryRoot,
                activePanel: $activePanel
            )
            .onOpenURL { url in
                demoShellState.handleDeepLink(url)
            }
            .onAppear {
                let args = CommandLine.arguments
                if let index = args.firstIndex(of: "--open-demo-url"),
                   index + 1 < args.count,
                   let url = URL(string: args[index + 1]) {
                    demoShellState.handleDeepLink(url)
                }
            }
        }

        #if os(macOS)
        .defaultSize(width: 1280, height: 860)
        #endif

        #if os(macOS)
        .commands {
            CommandMenu("SEIS") {
                Button("Open Demo Home") {
                    demoShellState.applyRoute("/")
                }
                .keyboardShortcut("1", modifiers: [.command])

                Button("Open SEIS Website") {
                    if let url = URL(string: "https://github.com/emirhankudun-ux/SEIS#readme") {
                        NSWorkspace.shared.open(url)
                    }
                }
                .keyboardShortcut("w", modifiers: [.command])

                Button("Show Demo") {
                    activePanel = .demo
                }
                .keyboardShortcut("2", modifiers: [.command])

                Button("Show Platform") {
                    activePanel = .applePlatform
                }
                .keyboardShortcut("3", modifiers: [.command])

                Button("Open Demo") {
                    demoShellState.applyRoute("/demo")
                }
                .keyboardShortcut("4", modifiers: [.command])

                Button("Open Sample Result") {
                    demoShellState.applyRoute("/results/demo-home")
                }
                .keyboardShortcut("5", modifiers: [.command])

                Button("Run First Scenario") {
                    if let firstScenario = demoShellState.contract.scenarios.first {
                        activePanel = .demo
                        demoShellState.startScenario(firstScenario.id)
                    }
                }
                .keyboardShortcut("6", modifiers: [.command])

                Button("Open Active Result") {
                    if let activeRun = demoShellState.activeRun {
                        activePanel = .demo
                        demoShellState.applyRoute("/results/\(activeRun.id)")
                    }
                }
                .keyboardShortcut("7", modifiers: [.command])
                .disabled(demoShellState.activeRun == nil)

                Button("Clear Recent Runs") {
                    demoShellState.clearRuns()
                }
                .keyboardShortcut("8", modifiers: [.command])
                .disabled(demoShellState.runs.isEmpty)

                Divider()

                Button("Retry Demo") {
                    demoShellState.reset(reason: "menu_retry")
                }

                Divider()

                Toggle("Low Motion", isOn: $lowMotion)
                    .keyboardShortcut("m", modifiers: [.command, .shift])
                Toggle("Quality Gates", isOn: $showsQualityGates)
                    .keyboardShortcut("g", modifiers: [.command, .shift])
                Divider()
                Button("Refresh Diagnostics") {
                    NotificationCenter.default.post(name: .seisRefreshAppleDiagnostics, object: nil)
                }
                .keyboardShortcut("r", modifiers: [.command, .shift])
                .help("Refresh all Apple diagnostics and runtime readiness snapshots.")
            }
        }
        #endif
        #if os(macOS)
        Settings {
            AppleShellSettingsView()
        }
        #endif
    }

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
}
