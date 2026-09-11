import SwiftUI

@main
@MainActor
struct SeisFullTechnologyMacApp: App {
    @StateObject private var model = SeisFullTechnologyMacViewModel()

    var body: some Scene {
        WindowGroup("SEIS Full Technology") {
            SeisFullTechnologyRootView(model: model)
        }
        .defaultSize(width: 1180, height: 760)
        .commands {
            CommandGroup(replacing: .newItem) { }
        }
    }
}
