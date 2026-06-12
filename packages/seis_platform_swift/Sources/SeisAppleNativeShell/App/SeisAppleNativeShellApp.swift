import SeisPlatformKit
import SwiftUI

@main
struct SeisAppleNativeShellApp: App {
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
