# SEIS Agent Workforce

## Purpose

This file tracks the active bounded agent workforce required for SEIS long-horizon
development and release safety.

## Active workflow

- All agents operate under supervision contracts in `SEIS_SUB_AGENTS.md`.
- Sub-agents are sub-autonomous: scoped, bounded, reviewable, and evidence-driven.
- PR-level and runtime-level actions remain separate by default.

## Workspace roles

- `SEIS Orchestrator`
- `Architect Agent`
- `SEIS Brain Curator Agent`
- `SEIS AI Core Agent`
- `Obsidian Librarian Agent`
- `Local AI Manager Agent`
- `GitHub Governance Agent`
- `QA Agent`
- `Security Agent`
- `PR Rescue Agent`
- `Public Readiness Agent`
- `DevOps Agent`
- `Cloud Agent`
- `Automation Agent`
- `Documentation Agent`
- `Search Agent`
- `Research Agent`
- `Code Agent`
- `Design Agent`
- `Demo Packaging Agent`
- `UI UX Agent`
- `SSH Agent`

## Evidence contract

- New tasks must include objective, scope, output, command evidence, and risks.
- Sensitive actions (SSH, deployment, merge, publication) remain approval-gated.
- Real-time behavior claims must map to passing checks and documented artifacts.

## Required core files

- `SEIS_SUB_AGENTS.md`
- `SEIS_AGENT_WORKFORCE.md`
- `SEIS_SECOND_BRAIN.md`
- `SEIS_OBSIDIAN_VAULT.md`
- `seis-brain/vault/09_Decisions`
- `seis-brain/vault/05_Agents`

## Next action

- Keep this workforce aligned with `docs/roadmap/MASTER_BACKLOG.md` and
  `docs/roadmap/NEXT_PR_QUEUE.md` before release claims.
