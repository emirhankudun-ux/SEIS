import Foundation
import SwiftUI

struct SeisAppleNativeShellZeroToDemoView: View {
    @ObservedObject var demoShellState: SeisDemoNativeShellState
    let repositoryPath: String
    @Binding var activePanel: SeisAppleNativeShellPanel

    var body: some View {
        #if os(macOS)
        SeisAppleNativeShellFreshDemoHomeView(
            demoShellState: demoShellState,
            repositoryPath: repositoryPath,
            activePanel: $activePanel
        )
        #else
        TabView {
            SeisDemoNativeShellView(state: demoShellState)
                .tabItem {
                    Label("Demo", systemImage: "play.rectangle")
                }

            SeisAppleConversationContinuityView()
                .tabItem {
                    Label("Süreklilik", systemImage: "bubble.left.and.bubble.right")
                }
        }
        #endif
    }
}
