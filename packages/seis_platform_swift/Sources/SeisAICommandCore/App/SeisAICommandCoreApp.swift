import SeisPlatformKit
import SwiftUI

#if os(macOS)
import AppKit

final class SeisAICommandCoreAppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}
#endif

@main
struct SeisAICommandCoreApp: App {
    @StateObject private var store = SeisAICommandCoreStore()
    @AppStorage("seis.ai.commandCore.lowMotion") private var lowMotion = true
    @AppStorage("seis.ai.commandCore.compactInspector") private var compactInspector = false

    #if os(macOS)
    @NSApplicationDelegateAdaptor(SeisAICommandCoreAppDelegate.self) private var appDelegate
    #endif

    var body: some Scene {
        WindowGroup("SEIS AI Command Core") {
            ContentView(store: store)
                .onOpenURL { url in
                    store.applyBridgeURL(url)
                }
        }
        #if os(macOS)
        .defaultSize(width: 1360, height: 880)
        .commands {
            CommandMenu("SEIS AI") {
                Button("Generate Plan") {
                    store.generatePlan()
                }
                .keyboardShortcut(.return, modifiers: [.command])

                Button("Run Evaluation") {
                    store.runEvaluation()
                }
                .keyboardShortcut("e", modifiers: [.command])

                Button("Approve Run") {
                    store.approveRun()
                }
                .keyboardShortcut("a", modifiers: [.command, .shift])
                .disabled(!store.canApprove)

                Divider()

                Button("Show Router") {
                    store.selectedSection = .router
                }
                .keyboardShortcut("2", modifiers: [.command])

                Button("Show Audit") {
                    store.selectedSection = .audit
                }
                .keyboardShortcut("8", modifiers: [.command])

                Divider()

                Button("Reset Demo") {
                    store.reset()
                }
                .keyboardShortcut("r", modifiers: [.command, .shift])
            }
        }
        #endif

        #if os(macOS)
        Settings {
            SettingsView(lowMotion: $lowMotion, compactInspector: $compactInspector)
        }
        #endif
    }
}
