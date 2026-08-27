import SwiftUI

struct SeisUniversalWorkspaceCommandActions {
    let canNavigateBack: Bool
    let canNavigateForward: Bool
    let hasSelection: Bool
    let navigateBack: () -> Void
    let navigateForward: () -> Void
    let clearSelection: () -> Void
    let focusSearch: () -> Void
    let openCommandPalette: () -> Void
}

private struct SeisUniversalWorkspaceCommandActionsKey: FocusedValueKey {
    typealias Value = SeisUniversalWorkspaceCommandActions
}

extension FocusedValues {
    var seisUniversalWorkspaceCommandActions: SeisUniversalWorkspaceCommandActions? {
        get { self[SeisUniversalWorkspaceCommandActionsKey.self] }
        set { self[SeisUniversalWorkspaceCommandActionsKey.self] = newValue }
    }
}

struct SeisUniversalWorkspaceCommands: Commands {
    @FocusedValue(\.seisUniversalWorkspaceCommandActions)
    private var actions

    var body: some Commands {
        CommandMenu("Workspace") {
            Button("Back") {
                actions?.navigateBack()
            }
            .keyboardShortcut("[", modifiers: [.command])
            .disabled(actions?.canNavigateBack != true)

            Button("Forward") {
                actions?.navigateForward()
            }
            .keyboardShortcut("]", modifiers: [.command])
            .disabled(actions?.canNavigateForward != true)

            Divider()

            Button("Find in Workspace") {
                actions?.focusSearch()
            }
            .keyboardShortcut("f", modifiers: [.command])
            .disabled(actions == nil)

            Button("Open Command Palette") {
                actions?.openCommandPalette()
            }
            .keyboardShortcut("k", modifiers: [.command])
            .disabled(actions == nil)

            Button("Clear Selection") {
                actions?.clearSelection()
            }
            .keyboardShortcut(.cancelAction)
            .disabled(actions?.hasSelection != true)
        }
    }
}
