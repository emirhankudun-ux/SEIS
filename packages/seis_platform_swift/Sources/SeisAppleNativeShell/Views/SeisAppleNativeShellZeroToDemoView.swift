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
        SeisDemoNativeShellView(state: demoShellState)
        #endif
    }
}
