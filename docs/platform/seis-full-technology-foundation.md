# SEIS Full Technology Center

Requested Goal: `SEIS-GOAL-021` — Build SEIS AI Desktop Platform Fusion.

Canonical Goal binding: unresolved. The repository does not currently contain a canonical `SEIS-GOAL-021` record, so this slice preserves the requested identifier without fabricating ownership or lifecycle state.

Maturity: validated browser-local prototype.

## What this slice is

This is the first coherent, locally runnable Full Technology product slice inside the existing SEIS Command Center application family. It turns the earlier technology taxonomy into a source-backed browser interface with deterministic behavior and explicit evidence boundaries.

The implemented route is:

```text
apps/seis-core/full-technology.html
```

The surface reads canonical JSON records from the repository and does not hard-code domain, capability, tool, engine or Workbench counts into the controller.

## Implemented experience

### Technology Atlas

- Reads 16 top-level domains and 96 first-wave capabilities from the canonical Full Technology Registry.
- Reads 48 first-wave tool records from the Tool Catalog.
- Supports text search and domain filtering.
- Exposes implementation class, maturity, permissions and validation state through a contextual inspector.
- Keeps proposed tools distinct from contract-validated records.

### Cube Navigator

- Projects all 16 canonical domains onto six technology faces.
- Covers every canonical domain exactly once.
- Supports pointer and Left/Right keyboard navigation.
- Opens a selected Cube domain in the Technology Atlas.
- Uses an accessible HTML/CSS renderer rather than presenting decorative 3D as runtime evidence.
- Preserves reduced-motion behavior.

### Workbench Composer

- Loads one of 12 source-backed Workbench presets.
- Caps visible primary tools according to the canonical Composer rules.
- Restores the active Workbench, Cube face, selected record and section from browser-local state.
- Never executes a displayed tool automatically.
- Requires a future capability adapter and permission resolution before any external action.

### Review snapshot

- Exports a local JSON review artifact.
- Records canonical sources, selected Cube face, active Workbench and zero-execution truth.
- Records zero tools executed, zero external writes, zero provider calls and zero credential reads.
- Does not upload the artifact or publish it remotely.

### Offline-first boundary

- Registers a service worker only when service workers are supported and the page is not opened through `file:`.
- Caches only same-origin `GET` requests.
- Uses network-first with cache fallback for canonical JSON records.
- Uses cache-first for the application shell.
- Rejects cross-origin requests and does not intercept write methods.
- Deletes stale Full Technology cache versions during activation.
- Does not cache credentials or external provider responses.

### PWA access

`apps/seis-core/manifest.webmanifest` exposes Full Technology Center as an explicit application shortcut.

## Architecture

The browser controller is intentionally thin. Deterministic product rules live in:

```text
apps/seis-core/full-technology-runtime.js
```

The runtime provides:

- canonical projection validation;
- six-face Cube projection;
- bounded Workbench composition;
- persisted-state normalization;
- deterministic review-snapshot creation.

This keeps the browser UI separate from product truth and allows the same rules to be ported later into Swift and other platform adapters.

## Foundation layers

1. `SEIS Kernel` — execution, storage, events, permissions and platform contracts.
2. `SEIS Fabric` — compute, data, asset and knowledge resource movement.
3. `SEIS Universal Runtime` — shared runtime boundaries and platform adapters.
4. `SEIS Nexus` — typed relationships across objects and registries.
5. `SEIS Brain` — local-first knowledge and memory surfaces.
6. `SEIS Atlas` — technology and capability discovery.
7. `SEIS Forge` — governed creation pipelines.
8. `SEIS Reality` — game, 3D, digital-life and simulation foundations.
9. `SEIS Cube` — architecture, runtime, security, evidence and history visualization.
10. `SEIS Proof` — validation and evidence before completion claims.

## Canonical records

- `content/development/seis-full-technology-registry.json`
- `content/development/seis-technology-tool-catalog.json`
- `content/development/seis-engine-capability-registry.json`
- `content/development/seis-workbench-composer.json`
- `content/development/seis-cube-runtime-contract.json`
- `content/development/seis-full-technology-command-center.json`
- `content/development/seis-full-technology-demo-acceptance.json`

Generated UI state and exported review snapshots are projections. They are not competing sources of truth.

## Implementation classes

Every capability must remain classified as one of:

- Native Core
- Native Tool
- Adapter
- Plugin
- Research

Maturity is separate from implementation class. A registry entry marked `research`, `concept` or `prototype` must not be presented as stable runtime behavior.

## Security and permission boundary

- Default network: deny.
- Default write: deny.
- No credentials belong in capability registries.
- External mutation requires explicit approval.
- The service worker ignores non-GET and cross-origin requests.
- Workbench loading is local composition, not tool activation.
- Review export is local-only.
- Provider, plugin, MCP, SSH, deployment and publishing operations remain unavailable or approval-gated.

## Validation

Run the complete focused validation package from the repository root:

```bash
node scripts/check-seis-full-technology-foundation.mjs
node --test test/seis-full-technology-foundation.test.mjs
node --test apps/seis-core/test/full-technology-runtime.test.js
node --test apps/seis-core/test/full-technology-center.test.js apps/seis-core/test/full-technology-experience.test.js
node --test apps/seis-core/test/full-technology-offline.test.js
```

The read-only GitHub Actions workflow is:

```text
.github/workflows/seis-full-technology-foundation.yml
```

It requests `contents: read`, uses SHA-pinned actions and executes the full focused validation package.

## Accepted scope

Machine-readable acceptance is recorded in:

```text
content/development/seis-full-technology-demo-acceptance.json
```

The accepted scope is limited to the registry-backed browser-local prototype. It includes Atlas, Cube, Workbench composition, local state, local review export, accessibility contracts, visible failure behavior and same-origin offline caching.

## Explicitly not completed

The following remain blocked and are not claimed by this slice:

- a native AAA Game Engine runtime;
- a native 3D modeling/rendering engine;
- a MetaHuman-equivalent Digital Human implementation;
- native macOS, Windows or Linux packages;
- installer, code-signing or notarization artifacts;
- live provider, plugin or MCP connectivity;
- production deployment or release readiness.

The engine registries are architecture and capability contracts. They are not evidence that those engines have been built.

## Next safe implementation order

1. Port deterministic Full Technology runtime contracts into a reusable Swift package.
2. Add a native macOS inspection surface for the 16 domains, 48 tools, six Cube faces and 12 Workbenches.
3. Define Universal Viewport and Universal Inspector typed contracts.
4. Implement one bounded Digital Human inspection prototype using original SEIS assets only.
5. Implement one small Game/Reality scene prototype with measured renderer and input evidence.
6. Add current-platform build evidence before claiming a native application.
7. Keep Windows and Linux as separate platform evidence tracks rather than inferred parity.

## Rollback

Before merge, close the draft pull request. After an approved merge, revert the scoped Full Technology commits. This slice has no database migration, external resource creation, secret rotation, deployment or irreversible operation.
