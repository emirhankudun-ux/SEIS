# SEIS Apple-First Direction

SEIS is now Apple-first in long-term product direction while remaining a
public, no-key web demo and a GitHub-friendly open source showcase.

Apple-first does not mean copying Apple apps, creating fake macOS windows,
inflating Swift language statistics, or replacing the existing web demo. It
means Apple platforms are the primary native product target and Apple-quality
interaction discipline is the benchmark for clarity, hierarchy, accessibility,
and restraint.

## Meaning

- macOS is the primary native Command Center platform.
- iPadOS is the primary SEIS Brain, design review, prompt library, and creative
  planning platform.
- iOS is a companion surface for status, notes, agent reports, GitHub/CI, and
  SEIS Brain search.
- Swift and SwiftUI are the preferred native implementation path.
- The web app remains the public demo, browser showcase, and fast preview.
- SEIS keeps its own cinematic, premium, AI-native creative engineering OS
  identity.

## Non-Goals

- Do not replace `apps/web` with native code.
- Do not create a generic Apple-themed dashboard.
- Do not add meaningless Swift files.
- Do not include real API keys, SSH private keys, tokens, host credentials, or
  provider secrets.
- Do not claim live AI, live SSH, or live provider routing unless it is actually
  implemented and verified.

## First Apple-First PR Scope

This first scoped change is intentionally foundation-level:

- document the Apple-first platform model
- add public-safe Apple documentation under `docs/apple`
- add an `apps/apple` coordination surface
- connect Apple-native work to the existing `packages/seis_platform_swift`
  Swift Package
- add small, real shared models for Apple-first roles and public-safety
  metadata
- preserve the web demo and no-key mode

## Product Standard

SEIS should feel like a premium macOS creative engineering app and an AI-native
Command Center, not a fake platform clone. The standard is Apple discipline plus
SEIS identity: calm surfaces, strong hierarchy, native-feeling controls,
keyboard-first workflows, restrained motion, and honest status.

## Public-Safe Rule

Public documentation and demo metadata may describe future local AI, SEIS-SSH,
GitHub, and provider integrations, but must mark them as planned, scaffolded,
demo, or implemented. Public files must never include secrets or credentials.
