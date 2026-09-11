# MARIA × SEIS v2: Product Intent to Verified Implementation

Status: scoped alignment record, not a replacement constitution or a live-capability claim.
Source: owner-supplied Personal Intelligence Operating System v2.0 architecture.

## Responsibility split

MARIA owns the human-facing language, voice/presence and explanations. SEIS owns
context, planning, routing, tools, permissions and verification. A prompt describing
these roles does not install a subsystem, authenticate a service or grant OS permissions.
The repository's AGENTS.md, existing governance and public/private boundaries remain
unchanged. Private conversation history and canonical personal imagery are not imported.

## This development checkpoint

Work package: `maria-swift-recovery-reader-v1`.
Base: PR #223, `eb447acf6b08e461f4e10901b7427e8abf522aa2`.
Output: draft PR #225, extending the existing Swift package and shell.
No canonical goal ID or program-completion state is created or changed by this record.

The selected slice advances the owner's desktop experience, failure-recovery,
verification and MARIA/SEIS separation requirements without inventing another runtime.
The Python recovery stack already existed at the base; this work consumes its wire
contract in native Swift and adds explicit, read-only presentation.

| v2 concern | Existing or delivered boundary | Claim deliberately not made |
| --- | --- | --- |
| Context and continuity | Existing project-context, anchor reconciliation and durable recovery stack | Old or imported context is automatically current |
| Native experience | New on-demand SwiftUI inspection window, Turkish status labels, explicit unloaded/error states | The whole MARIA desktop or voice interface is complete |
| Verification | Real Python fixture parity, Swift decoder/import-state/file-reader tests, macOS build and rendering lane | Generated code alone is a working personal intelligence OS |
| Human authority | No actions in display models; execution authority stays false | Aligned or complete rows authorize resume |
| Privacy | Only a deliberately selected local snapshot is read; no new background capture | Structural field validation detects every secret hidden in identifiers |
| Models and MCP | Existing routing/adapters remain untouched | A provider or editor integration is installed, authenticated or healthy on the owner's device |
| Voice, vision, ambient context | Out of this slice | Microphone, wake word, screen capture or camera is active |
| Computer/game/creative operation | Existing tool boundaries remain separate | Unreal, Blender, Figma or Adobe was operated during this session |
| Automation | Only PR-triggered bounded CI added | A nightly, always-on or uncontrolled agent swarm was activated |

## Acceptance boundary

The native consumer must build inside the real existing package, agree with the shared
Python fixture, reject malformed/ambiguous presentation records and preserve the
non-execution invariant. Imported snapshots must never be labelled live or authenticated.
Tests must prevent stale asynchronous completion from restoring cleared data.

Off-screen renders are useful visual evidence, not interactive app acceptance. The
remaining device review includes menu/window opening, actual picker interaction,
VoiceOver/keyboard navigation, appearance, cancellation and invalid-file behavior.
Successful checkpoint completion must never be presented as evidence that every
underlying task succeeded.

## Additional native limitations

The decoder is a bounded wire-schema reader, not a general-purpose JSON library.
It requires integers fitting Swift Int, valid Unicode scalars and bounded nesting.
A shared valid fixture plus adversarial tests is not exhaustive equivalence over every
possible Python JSON input. Schema validation is structural: trusted producers must
not hide sensitive data inside identifier strings. Unknown UI detail-field names use
a generic label. The explicit file reader protects the final symlink component only;
it is not a sandbox for ancestor aliases or hostile concurrent writers. File reads are
byte-bounded and off the main actor, but have no hard deadline for kernel filesystem
stalls. Clearing invalidates presentation, not an already-running kernel read.

## Next safe action

Complete the target-Mac acceptance of this small native slice before adding live host
transport. Then bind fresh host evidence to the existing contract without moving
permission or execution logic into SwiftUI. Voice, vision and computer-control pilots
require their own discovered capabilities, explicit permissions and verification.

See [MARIA Swift Recovery Inspection](MARIA_SWIFT_RECOVERY_INSPECTION.md) for exact
interfaces, verification commands, trust boundaries and rollback. The draft PR records
commit-specific hosted results; the architecture prompt alone is never completion evidence.
