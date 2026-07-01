# SEIS Mac App

SEIS Mac is the primary native Command Center for the ecosystem.

## Purpose

The macOS app should become the serious desktop workspace for SEIS:

- Command Center overview
- AI Core status and provider metadata
- SEIS Brain manager
- SEIS-SSH center
- GitHub/CI status
- agent workforce monitor
- local AI/Ollama monitor
- public readiness checklist
- next safe PR recommendation

## Command Center Shape

The long-term native Command Center should use:

- a clear sidebar for modules
- a toolbar with search, command palette, workspace, sync/demo status, local AI
  status, GitHub status, and no-key badge
- a module grid for Command Center, Brain, AI Core, Providers, Model Router,
  Prompt Engine, SEIS Code, SEIS Design, Search, SEIS-SSH, Agents, GitHub, and
  Public Readiness
- a right inspector for selected module details, risks, linked notes, context
  packs, next actions, and verification commands
- a bottom activity area for agent reports, CI/build events, and safe warnings

## Current Repo Path

Current macOS notes live in `apps/macos`. The active Swift Package and native
shell live in `packages/seis_platform_swift`.

## Local AI Direction

Local AI/Ollama should be macOS-first and optional. The native app may later
show local endpoint metadata, model availability, no-key demo responses, and
context-pack copy workflows. This first foundation does not add live localhost
calls.

## SEIS-SSH Direction

SEIS-SSH should be macOS-first because remote/cloud control is desktop-oriented
and needs careful review. Native SEIS-SSH surfaces must use demo profiles,
readiness metadata, safe command checklists, rollback readiness, and explicit
warnings before any real connection behavior exists.

## Boundaries

- Do not store real keys.
- Do not print credentials.
- Do not run remote commands by default.
- Do not claim live status for demo-only metadata.
- Keep destructive deployment commands behind human review.
