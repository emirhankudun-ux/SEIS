# Universal Workspace Keyboard Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic keyboard-first navigation to the native SEIS Universal Workspace while preserving its read-only, registry-backed safety boundary.

**Architecture:** Extend the existing pure `SeisUniversalWorkspaceDocument` and `SeisUniversalWorkspaceState` contracts rather than adding a second navigation model. Route command palette actions and macOS keyboard shortcuts through the same `apply(commandID:)` transition path so persistence and validation remain centralized.

**Tech Stack:** Swift 6 / SwiftPM, SwiftUI, AppKit modifier semantics already used by the hierarchy, XCTest, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-27-universal-workspace-keyboard-navigation-design.md`

## Global Constraints

- macOS deployment floor remains macOS 13.
- No network access, provider call, MCP invocation, agent execution, or external mutation is added.
- Canonical Full Technology registry remains read-only.
- Scene persistence continues to use the existing `SeisUniversalWorkspaceSceneSnapshot`.
- All new navigation behavior must be deterministic and testable without SwiftUI.

---

### Task 1: Visible navigation order and state transitions

**Files:**
- Modify: `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisUniversalWorkspaceTests.swift`
- Modify: `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspace.swift`

**Interfaces:**
- Produces: `SeisUniversalWorkspaceDocument.visibleNodeIDs(expandedNodeIDs:) -> [String]`
- Produces: `SeisUniversalWorkspaceState.moveFocus(_:) -> Bool`
- Produces: `SeisUniversalWorkspaceState.clearSelection() -> Bool`
- Produces: `SeisUniversalWorkspaceState.setFocusedNodeExpanded(_:) -> Bool`

- [ ] **Step 1: Write failing tests**

Add tests asserting collapsed order is roots only, expanded order inserts children directly after their parent, next/previous navigation replaces selection deterministically, boundary movement returns false, clear selection empties focus, and focused-domain expansion/collapse changes only valid expandable nodes.

- [ ] **Step 2: Run focused tests to verify RED**

Run:

```bash
swift test --package-path packages/seis_platform_swift --filter SeisUniversalWorkspaceTests
```

Expected: FAIL because the visible-order and navigation APIs do not exist.

- [ ] **Step 3: Implement minimal pure state behavior**

Add:

```swift
public enum SeisUniversalFocusDirection: Sendable {
    case previous
    case next
}
```

`visibleNodeIDs(expandedNodeIDs:)` must preserve canonical root/child order and ignore unknown expansion IDs.

`moveFocus(_:)` must use visible node IDs, replace the current selection, and stop at boundaries without wrapping.

`clearSelection()` must return false when already empty and true when it changes state.

`setFocusedNodeExpanded(_:)` must only succeed for a focused node that actually has children.

- [ ] **Step 4: Run focused tests to verify GREEN**

```bash
swift test --package-path packages/seis_platform_swift --filter SeisUniversalWorkspaceTests
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisUniversalWorkspaceTests.swift packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspace.swift
git commit -m "feat(workspace): add deterministic keyboard navigation state"
```

### Task 2: Command palette navigation commands

**Files:**
- Modify: `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisUniversalWorkspaceTests.swift`
- Modify: `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspace.swift`

**Interfaces:**
- Produces command IDs: `selection.previous`, `selection.next`, `selection.clear`, `hierarchy.expand-focused`, `hierarchy.collapse-focused`.

- [ ] **Step 1: Write failing command tests**

Assert the palette finds the navigation commands and `SeisUniversalWorkspaceState.apply(commandID:)` performs the same transitions as direct state methods.

- [ ] **Step 2: Verify RED**

```bash
swift test --package-path packages/seis_platform_swift --filter SeisUniversalWorkspaceTests
```

Expected: FAIL on missing command IDs/handling.

- [ ] **Step 3: Implement commands**

Append navigation commands before generated selection commands and route command IDs through the pure state methods.

- [ ] **Step 4: Verify GREEN**

```bash
swift test --package-path packages/seis_platform_swift --filter SeisUniversalWorkspaceTests
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisUniversalWorkspaceTests.swift packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspace.swift
git commit -m "feat(workspace): expose navigation commands"
```

### Task 3: Native macOS keyboard shortcuts

**Files:**
- Modify: `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisAppleUniversalWorkspaceView.swift`

**Interfaces:**
- Consumes command IDs from Task 2.

- [ ] **Step 1: Add shortcut surfaces through the existing command path**

Add invisible SwiftUI shortcut buttons scoped to the Universal Workspace:

- `⌘⌥↑` → `selection.previous`
- `⌘⌥↓` → `selection.next`
- `⌘⌥←` → `hierarchy.collapse-focused`
- `⌘⌥→` → `hierarchy.expand-focused`
- `⌘⌥⌫` → `selection.clear`

Each shortcut must call `apply(commandID:)` so the existing `commit(_:)` snapshot persistence remains authoritative.

- [ ] **Step 2: Build the native shell**

```bash
swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell
```

Expected: PASS on macOS 13-compatible APIs.

- [ ] **Step 3: Run full Swift tests**

```bash
swift test --package-path packages/seis_platform_swift
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisAppleUniversalWorkspaceView.swift
git commit -m "feat(workspace): wire native keyboard navigation"
```

### Task 4: Verification and review

**Files:**
- Review: `.github/workflows/seis-full-technology-foundation.yml`
- Review: PR #201 changed files

- [ ] **Step 1: Run focused and full gates**

```bash
swift test --package-path packages/seis_platform_swift --filter SeisUniversalWorkspaceTests
swift test --package-path packages/seis_platform_swift
swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell
swift build --package-path packages/seis_platform_swift --product SeisFullTechnologyMac
```

- [ ] **Step 2: Run repository whitespace check**

```bash
git diff --check
```

- [ ] **Step 3: Confirm GitHub Actions result on the final head**

Require the Full Technology contract job and native Swift/macOS job to complete successfully before claiming the slice validated.

- [ ] **Step 4: Perform scoped code review**

Review only this slice for mutation leaks, duplicate state models, macOS 14+ accidental API use, keyboard conflicts, persistence regressions, and unnecessary architectural expansion.
