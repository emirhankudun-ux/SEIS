# SEIS Agent Workforce

## Purpose

SEIS Agent Workforce is the maintained registry of supervised worker agents that
support long-term engineering, documentation, AI safety, and command-center
work. It is a planning and execution model, not an autonomous replacement for
human approval.

## Scope

- architecture and governance guidance
- repository-aware documentation updates
- second-brain maintenance and context transfer
- local AI workflows and prompt hygiene
- SSH/cloud readiness preparation
- plugin/connector awareness

## Workforce model

Agents are bounded, task-scoped, and reviewed. They operate as:

- `SEIS Orchestrator` (route + governance)
- `Architect Agent`
- `SEIS Brain Curator Agent`
- `Obsidian Librarian Agent`
- `SEIS AI Core Agent`
- `GitHub Governance Agent`
- `SSH Agent`
- `Local AI Manager Agent`
- `QA Agent`
- `Security Agent`
- `PR Rescue Agent`
- `Demo Packaging Agent`
- `UI UX Agent`

## Runtime assumptions

- no agent runs with unlimited write scope
- no unbounded command execution
- no claim of live provider routing, live SSH, or deployment without evidence
- no credentials, no private keys, and no real hosts in code-generated outputs
- no direct push to `main`

## Allowed actions

- read scoped files and propose safe changes
- add and review context packs
- update checklists and documentation
- summarize blockers and evidence
- prepare safe PR queue entries

## Forbidden actions

- run destructive commands by default
- claim runtime capabilities as active without validation
- expose secrets in prompts, docs, or logs
- bypass repository governance and branch safety rules

## Task queue pattern

1. Receive bounded objective.
2. Confirm context and constraints.
3. Apply minimal scoped changes.
4. Record verification state and remaining risks.
5. Escalate unresolved blockers to `docs/roadmap/NEXT_PR_QUEUE.md`.

## Source-of-truth mapping

- `SEIS_SUB_AGENTS.md` describes coordination rules.
- `seis-brain/vault/05_Agents/Agent Workforce.md` stores the vault roster.
- `seis-brain/vault/05_Agents/*` stores role-level documentation.
- `docs/roadmap/NEXT_PR_QUEUE.md` tracks unresolved safety or approval blockers.

## Public vs real capabilities

All agent workforce claims are public-safe documentation unless they are
explicitly marked as gated (planned, demo, or blocked). Any live execution
plane requires explicit human approval.
