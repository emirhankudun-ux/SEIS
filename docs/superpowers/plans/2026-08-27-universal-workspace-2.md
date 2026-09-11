# Universal Workspace 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native macOS Universal Workspace with hierarchy, breadcrumbs, multi-selection, dockable inspector, command navigation, and safe per-window state restoration.

**Architecture:** Extend the deterministic `SeisPlatformKit` workspace contracts first, then adapt SwiftUI to those contracts. Keep canonical registry data immutable and keep window state as a compact safe snapshot. Preserve the existing read-only/no-execution boundary.

**Tech Stack:** Swift 6 / SwiftPM, SwiftUI on macOS 13+, XCTest, GitHub Actions, existing SEIS Full Technology registries.

**Spec:** `docs/superpowers/specs/2026-08-27-universal-workspace-2-design.md`

## Global Constraints

- macOS deployment floor remains 13.0.
- No new third-party dependency.
- Network and write permissions remain deny-by-default.
- `allowsExternalMutation` remains false.
- Snapshot data contains stable IDs/layout preferences only; no credentials, private paths, prompts, or tool inputs.
- Unknown restored IDs must fail closed and never fabricate records.
- The Universal Viewport remains an inspection surface and must not claim renderer or simulation execution.

---

### Task 1: Multi-selection, breadcrumbs, and snapshot contracts

**Files:**
- Modify: `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspace.swift`
- Test: `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisUniversalWorkspaceTests.swift`

**Interfaces:**
- Consumes: `SeisUniversalWorkspaceDocument`, `SeisUniversalWorkspaceNode`, `SeisUniversalInspectorDock`.
- Produces: `breadcrumbNodeIDs(for:) -> [String]`, ordered `selectedNodeIDs`, `focusedNodeID`, `select(nodeID:mode:)`, `SeisUniversalWorkspaceSceneSnapshot`, `snapshot`, and restoring initializer.

- [ ] **Step 1: Write failing tests** for breadcrumb order, replacement selection, additive selection, invalid selection preservation, snapshot round-trip, and invalid-ID restore filtering.
- [ ] **Step 2: Run** `swift test --package-path packages/seis_platform_swift --filter SeisUniversalWorkspaceTests` and verify the new tests fail because the interfaces do not exist.
- [ ] **Step 3: Implement minimal deterministic contracts** in `SeisUniversalWorkspace.swift`.
- [ ] **Step 4: Re-run** the focused test command and require PASS.
- [ ] **Step 5: Commit** with `feat(workspace): add multi-selection and scene snapshot contracts`.

### Task 2: Hierarchy and workspace navigation commands

**Files:**
- Modify: `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspace.swift`
- Test: `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisUniversalWorkspaceTests.swift`

**Interfaces:**
- Consumes: Task 1 selection/snapshot contracts.
- Produces: `isHierarchyVisible`, `expandedNodeIDs`, hierarchy commands `hierarchy.show` / `hierarchy.hide`, expansion helpers, and breadcrumb selections.

- [ ] **Step 1: Write failing tests** proving hierarchy show/hide commands work, expansion ignores unknown nodes, and snapshots preserve hierarchy state.
- [ ] **Step 2: Run** the focused workspace tests and verify RED.
- [ ] **Step 3: Implement** hierarchy state and commands without introducing mutation authority.
- [ ] **Step 4: Re-run** focused tests and require PASS.
- [ ] **Step 5: Commit** with `feat(workspace): add hierarchy state and navigation commands`.

### Task 3: Multi-selection inspector presentation

**Files:**
- Modify: `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspace.swift`
- Test: `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisUniversalWorkspaceTests.swift`

**Interfaces:**
- Consumes: ordered selections from Task 1.
- Produces: `SeisUniversalInspectorPresentation(selections:)` that shows the existing single-record detail for one selection and a deterministic summary for multiple records.

- [ ] **Step 1: Write failing tests** for two-record summary, selection count text, no private metadata disclosure, and `allowsMutation == false`.
- [ ] **Step 2: Run** focused tests and verify RED.
- [ ] **Step 3: Implement** the multi-selection presentation while preserving existing `init(selection:)` compatibility.
- [ ] **Step 4: Re-run** focused tests and require PASS.
- [ ] **Step 5: Commit** with `feat(workspace): add safe multi-selection inspector summary`.

### Task 4: Split the native Universal Workspace UI and add hierarchy/breadcrumbs

**Files:**
- Modify: `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellWorkspaceRouter.swift`
- Create: `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisUniversalHierarchyView.swift`
- Create: `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisUniversalBreadcrumbView.swift`
- Create: `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisUniversalInspectorView.swift`
- Create: `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisUniversalCommandPaletteView.swift`

**Interfaces:**
- Consumes: `SeisUniversalWorkspaceState`, scene snapshot, breadcrumb helper, multi-selection inspector presentation.
- Produces: stable hierarchy-detail-inspector desktop composition with explicit callbacks; no domain mutation.

- [ ] **Step 1: Refactor the oversized router** so workspace feature sections live in focused view files, keeping app behavior unchanged before adding new UI.
- [ ] **Step 2: Add native hierarchy** with domain/capability rows, explicit expansion, replacement selection, Command-modified additive selection, and keyboard-accessible buttons.
- [ ] **Step 3: Add breadcrumb bar** from the focused selection parent chain.
- [ ] **Step 4: Wire multi-selection inspector** and existing inspector docking.
- [ ] **Step 5: Wire command palette** to hierarchy and selection commands.
- [ ] **Step 6: Build** `swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell` and require PASS.
- [ ] **Step 7: Commit** with `feat(macos): add native Universal Workspace hierarchy and breadcrumbs`.

### Task 5: Per-window restoration

**Files:**
- Modify: `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellWorkspaceRouter.swift`
- Test: `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisUniversalWorkspaceTests.swift`

**Interfaces:**
- Consumes: Codable `SeisUniversalWorkspaceSceneSnapshot`.
- Produces: scene-scoped encoded snapshot persistence and safe restore.

- [ ] **Step 1: Add tests** for JSON encode/decode and invalid snapshot sanitization if not already covered.
- [ ] **Step 2: Use `@SceneStorage`** for encoded snapshot data; decode only after canonical document load, then sanitize against that document.
- [ ] **Step 3: Persist** snapshot after selection/layout changes using a deterministic JSON encoder; persistence failure must not change working state.
- [ ] **Step 4: Build** both `SeisAppleNativeShell` and `SeisFullTechnologyMac`.
- [ ] **Step 5: Commit** with `feat(macos): restore Universal Workspace scene state safely`.

### Task 6: Verification, performance review, and code review

**Files:**
- Modify only if verification exposes a concrete defect.

**Interfaces:**
- Consumes: all tasks.
- Produces: evidence that the scoped feature compiles/tests and preserves repository boundaries.

- [ ] **Step 1: Run** `swift test --package-path packages/seis_platform_swift --filter SeisUniversalWorkspaceTests`.
- [ ] **Step 2: Run** `swift test --package-path packages/seis_platform_swift`.
- [ ] **Step 3: Run** `swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell`.
- [ ] **Step 4: Run** `swift build --package-path packages/seis_platform_swift --product SeisFullTechnologyMac`.
- [ ] **Step 5: Run** existing Full Technology Node validator/tests and `git diff --check` through CI.
- [ ] **Step 6: Review SwiftUI structure** for unnecessary recomputation, oversized view bodies, unstable IDs, and avoidable AppKit usage.
- [ ] **Step 7: Run CodeRabbit review** on the scoped PR diff; address only verified findings that preserve the approved design.
- [ ] **Step 8: Inspect GitHub Actions** for the exact head SHA and record passed/failed/skipped jobs honestly.
