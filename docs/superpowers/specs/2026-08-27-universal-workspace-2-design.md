# Universal Workspace 2 Design

## Goal

Evolve the existing read-only Universal Workspace into a native macOS desktop workspace with a stable hierarchy, breadcrumb navigation, multi-selection, dockable inspector, command palette, keyboard navigation, and restorable scene state while preserving the current deny-by-default security boundary.

## Scope

This design extends the existing `SeisUniversalWorkspaceDocument`, `SeisUniversalSelectionGraph`, `SeisUniversalWorkspaceState`, and `SeisAppleUniversalWorkspaceView`. It does not introduce tool execution, network access, provider calls, MCP execution, file mutation, scene rendering, or external writes.

## Architecture

The domain layer remains in `SeisPlatformKit` and owns deterministic document, hierarchy, selection, breadcrumb, command, and persistence contracts. SwiftUI remains a presentation consumer only. The macOS shell uses a stable three-pane editor layout: hierarchy on the leading side, Universal Viewport in the center, and the inspector on the configured side when visible.

State is divided into two classes:

- Canonical product state: immutable registry-backed document graph.
- Window/session state: selected node IDs, focused node ID, expanded hierarchy node IDs, inspector dock, and hierarchy visibility.

Persistent scene state is encoded as a small Codable snapshot containing only stable IDs and layout preferences. Restoring invalid IDs is fail-closed: unknown selections are dropped, unknown expanded IDs are ignored, and mutation remains disabled.

## Components

### `SeisUniversalWorkspaceDocument`

Add parent-chain and breadcrumb helpers that resolve stable node paths without mutating the document.

### `SeisUniversalSelectionGraph`

Upgrade from one selected node to ordered multi-selection with one focused node. Normal selection replaces the selection set. Additive selection preserves existing nodes and updates focus. Unknown node IDs never clear valid current state.

### `SeisUniversalWorkspaceSceneSnapshot`

Codable, Equatable, Sendable snapshot for per-window restoration. Contains selected node IDs, focused node ID, expanded node IDs, inspector dock, and hierarchy visibility. Contains no paths, credentials, tool inputs, prompts, or private content.

### `SeisUniversalWorkspaceState`

Own selection graph, inspector dock, hierarchy visibility, and expanded nodes. Expose snapshot/restore helpers and deterministic commands for inspector and hierarchy visibility. `allowsExternalMutation` remains always false.

### Native hierarchy

Add a dedicated SwiftUI hierarchy view using a native sidebar/list density. Domain rows expand into capabilities. Selection is explicit and keyboard reachable. Rows stay lightweight: icon, title, optional secondary line.

### Breadcrumb bar

Show the focused node path (`Domain > Capability`). Each breadcrumb is a button that selects that node. No path is fabricated when no node is focused.

### Universal Viewport

Remain a registry-backed inspection surface, not a renderer. It reflects selection and provides capability/domain summaries. It must not claim scene rendering, simulation, engine execution, or live tool state.

### Inspector

Remain read-only. For multi-selection, show a deterministic multi-selection summary instead of pretending one record owns the full state. Sensitive metadata continues to be redacted.

### Commands

Extend the command palette with hierarchy show/hide commands. Existing inspector docking and node-selection commands remain. All commands are local UI/navigation commands.

## macOS State Ownership

Use view-local/state-store ownership for the active workspace model and `@SceneStorage`-backed encoded snapshot data for per-window restoration. Do not use `@AppStorage` for selection because selection is window-scoped, not a global user preference.

## Accessibility

- Hierarchy is keyboard navigable.
- Breadcrumb buttons expose their record titles.
- Multi-selection count is represented in text, not color only.
- Inspector hidden/visible state has explicit labels.
- Existing reduced-motion behavior is preserved.
- No invisible gesture-only primary action is introduced.

## Error Handling

If canonical registry loading fails, the workspace remains in the existing visible failed state. Snapshot decode failure falls back to a fresh safe state. Invalid snapshot node IDs are ignored. No fallback invents registry records or execution status.

## Testing

Add domain tests for deterministic breadcrumbs, additive and replacement selection, invalid restore behavior, scene snapshot round-trip, hierarchy visibility commands, and multi-selection inspector presentation. Existing native shell build and Full Technology CI remain required.

## Non-goals

- Tool execution.
- Writable inspector.
- Real 3D renderer.
- Scene file mutation.
- Provider/MCP/plugin execution.
- Cloud sync of workspace state.
- Cross-window synchronized selection.

## Rollback

The feature is additive on the existing feature branch. Roll back by reverting the Universal Workspace 2 scoped commits. There are no migrations or external resources.