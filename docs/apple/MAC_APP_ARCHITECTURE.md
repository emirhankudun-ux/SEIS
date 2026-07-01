# Mac App Architecture

SEIS Mac is the primary native Command Center.

## Core Surfaces

- Command Center overview
- SEIS Brain manager
- AI Core and provider metadata
- model router and prompt engine
- SEIS Code and design review
- SEIS Search
- SEIS-SSH safety center
- agents and handoff reports
- GitHub/CI status
- public readiness
- settings

## Window Model

Start with one main workspace window. Add secondary windows only when the
workflow is proven, such as diagnostics, preview, or command review.

## Toolbar

The toolbar should expose search, command palette, current workspace, demo/no-key
state, local AI status, GitHub status, and public-safety state.

## SEIS-SSH

Mac SEIS-SSH begins as metadata and safety review:

- demo profile
- no-credentials mode
- safe command checklist
- deployment readiness
- rollback readiness
- explicit dangerous-command warnings

No live command execution belongs in the first Apple-first PR.

## Local AI

Local AI/Ollama begins as metadata and planned user-configured endpoint support.
Do not make localhost calls until a separate implementation and verification
scope exists.
