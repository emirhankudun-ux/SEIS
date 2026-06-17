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
            SeisDemoNativeShellView(state: demoShellState)
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
        .commands {
            CommandMenu("SEIS") {
                Button("Open Demo Home") {
                    demoShellState.applyRoute("/")
                }

                Button("Open Demo") {
                    demoShellState.applyRoute("/demo")
                }

                Button("Open Sample Result") {
                    demoShellState.applyRoute("/results/demo-home")
                }

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
}
