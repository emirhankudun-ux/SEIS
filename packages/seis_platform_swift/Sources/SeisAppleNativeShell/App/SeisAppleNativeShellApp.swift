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

    var body: some Scene {
        WindowGroup("SEIS Apple Native") {
            AppleContinuationWindow()
        }
        .commands {
            CommandGroup(after: .appInfo) {
                Button("Focus Apple Native") {
                    NotificationCenter.default.post(name: .seisFocusAppleNative, object: nil)
                }
                .keyboardShortcut("1", modifiers: [.command])
            }
        }
    }
}

extension Notification.Name {
    static let seisFocusAppleNative = Notification.Name("seis.focus.apple-native")
}
