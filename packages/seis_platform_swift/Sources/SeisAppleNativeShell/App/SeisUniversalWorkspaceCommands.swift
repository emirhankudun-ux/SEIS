import SwiftUI

struct SeisUniversalWorkspaceCommandActions {
    let canNavigateBack: Bool
    let canNavigateForward: Bool
    let hasSelection: Bool
    let canCloseTab: Bool
    let navigateBack: () -> Void
    let navigateForward: () -> Void
    let clearSelection: () -> Void
    let focusSearch: () -> Void
    let openCommandPalette: () -> Void
    let newTab: () -> Void
    let closeTab: () -> Void
    let nextTab: () -> Void
    let previousTab: () -> Void
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
            Button("New Workspace Tab") {
                actions?.newTab()
            }
            .keyboardShortcut("t", modifiers: [.command])
            .disabled(actions == nil)

            Button("Close Workspace Tab") {
                actions?.closeTab()
            }
            .keyboardShortcut("w", modifiers: [.command])
            .disabled(actions?.canCloseTab != true)

            Divider()

            Button("Next Workspace Tab") {
                actions?.nextTab()
            }
            .keyboardShortcut(.tab, modifiers: [.control])
            .disabled(actions == nil)

            Button("Previous Workspace Tab") {
                actions?.previousTab()
            }
            .keyboardShortcut(.tab, modifiers: [.control, .shift])
            .disabled(actions == nil)

            Divider()

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
