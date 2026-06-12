import SeisPlatformKit
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
    #if os(macOS)
    @NSApplicationDelegateAdaptor(SeisAppleNativeShellAppDelegate.self) private var appDelegate
    #endif

    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.lowMotionKey)
    private var lowMotion = SeisAppleShellSettingsContract.appleNativeShell.defaultLowMotion

    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.showsQualityGatesKey)
    private var showsQualityGates = SeisAppleShellSettingsContract.appleNativeShell.defaultShowsQualityGates

    var body: some Scene {
        WindowGroup("SEIS Apple Native") {
            AppleContinuationWindow()
        }
        .commands {
            CommandMenu("SEIS") {
                Button("Focus Apple Native") {
                    NotificationCenter.default.post(name: .seisFocusAppleNative, object: nil)
                }
                .keyboardShortcut("1", modifiers: [.command])

                Button("Refresh Diagnostics") {
                    NotificationCenter.default.post(name: .seisRefreshAppleDiagnostics, object: nil)
                }
                .keyboardShortcut("r", modifiers: [.command, .shift])

                Divider()

                Toggle("Low Motion", isOn: $lowMotion)
                    .keyboardShortcut("m", modifiers: [.command, .shift])
                Toggle("Quality Gates", isOn: $showsQualityGates)
                    .keyboardShortcut("g", modifiers: [.command, .shift])
            }
        }

        Settings {
            AppleShellSettingsView()
        }
    }
}

extension Notification.Name {
    static let seisFocusAppleNative = Notification.Name("seis.focus.apple-native")
    static let seisRefreshAppleDiagnostics = Notification.Name("seis.refresh.apple-diagnostics")
}
