# SEIS Repository Federation Design

## Goal

Make SEIS the Mac-first personal intelligence hub that can discover, index and present Emirhan's GitHub repositories one by one while keeping every repository independently owned and reviewable.

## Key rule

Repository federation is not blind source-code absorption. SEIS may index repository metadata, project context, capabilities, health and links. Source import requires an explicit compatibility and license decision per repository.

## Surfaces

- `RepositoryRegistry` stores independent repository records.
- `RepositoryFederation` groups repositories into owned projects, external references and future integrations.
- Each repository is visible individually with owner, visibility, role, project family, status and source policy.
- External inspiration repositories such as `alpunlu12-commits/jarvis` and `alpunlu12-commits/dinamik-ada` remain references unless their source license is explicitly verified compatible with the intended reuse.
- MARIA consumes a compact repository brief instead of loading entire repositories into every prompt.

## Mac-first product target

MARIA should ultimately expose the federation in a native macOS surface:

- compact Dynamic-Island-like ambient presence, adapted to macOS rather than copied;
- current project chip;
- repository switcher;
- health / CI / branch state;
- context-aware continuation;
- approval cards for writes;
- result cards for verified outcomes.

The UI must preserve SEIS design language: Apple-like clarity, quiet luxury, European editorial restraint and Mediterranean warmth. Avoid Iron-Man HUD styling and visual noise.

## Repository source policy

`owned` — Emirhan-owned repositories. SEIS may index and, when explicitly authorized, operate on them through project permissions.

`external-reference` — third-party repositories used for research, compatibility or inspiration. No code copying by default.

`vendored` — source copied into SEIS only after license, attribution, update and security policy is explicitly recorded.

`submodule` — linked source with separate history and ownership. Use only when technically justified.

`adapter` — SEIS-native implementation inspired by a capability, with no source copying.

## Initial external references

- `alpunlu12-commits/jarvis`: public Mac/Windows assistant reference; voice/text assistant ideas, screen analysis and desktop actions are useful capability references.
- `alpunlu12-commits/dinamik-ada`: public Dynamic-Island-style UI reference for compact ambient interaction research.

These do not become SEIS-owned code merely because they are public on GitHub.

## Acceptance criteria

1. Every repository record is individually addressable.
2. Owned repositories and third-party references are visually and semantically distinct.
3. The registry can resolve a project family and preferred work mode without merging repository histories.
4. External code cannot be marked `vendored` without an explicit license decision.
5. MARIA can request a compact list and a selected-repository context brief.
6. No GitHub mutation, clone, source import or visibility change occurs in the foundation slice.
