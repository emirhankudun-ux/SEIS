# Universal Workspace Keyboard Navigation Design

## Goal

Extend the existing SEIS Universal Workspace with deterministic keyboard-first navigation without adding tool execution, external mutation, network access, or a second workspace state model.

## Existing foundation

The current branch already provides a registry-backed document graph, hierarchy, breadcrumbs, multi-selection, command palette, dockable read-only inspector, scene snapshot restoration, and local SceneStorage persistence. This slice builds on those contracts rather than replacing them.

## Scope

Add keyboard-safe navigation contracts to `SeisPlatformKit` and wire them into the native macOS Universal Workspace.

The workspace must support:

- deterministic visible-node ordering derived from current hierarchy expansion;
- move focus to previous/next visible node;
- replace selection while moving focus;
- preserve additive multi-selection semantics for pointer/Command-click interactions;
- clear the selection without mutating canonical registry data;
- expand/collapse the focused domain when applicable;
- expose the same behaviors through command-palette commands;
- provide macOS keyboard shortcuts for the navigation actions;
- persist the resulting selection/expanded state through the existing scene snapshot mechanism.

## Non-goals

- no file editing;
- no tool execution;
- no MCP/provider/agent invocation;
- no external writes;
- no renderer or simulation claim;
- no global keyboard hooks;
- no replacement of AppKit/SwiftUI navigation infrastructure.

## Architecture

`SeisUniversalWorkspaceDocument` remains the canonical local projection of the technology registry. It gains a pure visible-order helper that returns root nodes plus expanded children in stable registry order.

`SeisUniversalWorkspaceState` remains the single mutable local interaction state. It gains small deterministic navigation methods: move focus, clear selection, expand/collapse focused node. These methods only transform local state and never mutate the document.

`SeisUniversalCommandPalette` exposes navigation commands so mouse, keyboard shortcut, and palette use the same command IDs and state transition path.

The SwiftUI workspace view wires shortcuts to `state.apply(commandID:)`, preserving one execution path and existing snapshot persistence.

## Accessibility

Keyboard navigation must be available without pointer input. Selection and focus remain visible in the hierarchy and inspector. Shortcuts must not hide state changes from assistive technologies; the existing semantic labels remain the source of accessibility names.

## Persistence

No new persistence store is introduced. The existing `SeisUniversalWorkspaceSceneSnapshot` remains sufficient because navigation changes only selected/focused/expanded node IDs already represented in the snapshot.

## Validation

TDD order:

1. Add failing unit tests for visible-node ordering, next/previous navigation, clear selection, and focused expansion/collapse.
2. Implement pure document/state behavior.
3. Add command-palette assertions.
4. Wire macOS keyboard shortcuts.
5. Run focused Swift tests, full Swift package tests, `SeisAppleNativeShell` build, and Full Technology CI.

## Rollback

Revert the scoped keyboard-navigation commits. No migration, schema, external resource, credential, or irreversible state is introduced.
