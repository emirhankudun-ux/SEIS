# SEIS Sub-Agent System

## Purpose

Sub-agents are bounded, supervised workers that accelerate SEIS work without replacing human approval.

Each sub-agent follows explicit ownership, permission, and review constraints.

## Supervision model

- Human review for all non-trivial decisions.
- Bounded tasks only; no unrestricted command execution.
- No push to main branch by sub-agents.
- No secrets in any handoff or output.

## Agent hierarchy

- SEIS Orchestrator (top-level coordinator)
- SEIS Architect Agent
- SEIS Brain Curator Agent
- Obsidian Librarian Agent
- Local AI Manager Agent
- SSH Agent
- QA / Security Agents

## Agent responsibilities

- Architect Agent: architecture boundaries, module seams, complexity control.
- Brain Curator Agent: second brain structure, memory hygiene, decision logs.
- Obsidian Librarian Agent: note consistency, links, frontmatter, index maintenance.
- Local AI Manager Agent: local AI setup docs, draft policy, continuation protocol.
- SSH Agent: safe rollout notes, host safety boundaries, rollback-first plans.
- QA Agent: smallest-scope fixes, check evidence, blocker tracking.
- Security Agent: secret patterns, private boundary checks, no-key demo safety.

## Allowed actions

- read/write scoped project docs
- propose small code or docs diffs
- create context packs and agent summaries
- flag blockers without hiding failures

## Forbidden actions

- push directly to `main`
- claim real AI capability without evidence
- generate destructive commands by default
- expose credentials in outputs, logs, or docs
- create fake completions or false status claims

## Agent output contract

Each output should include:

- task objective
- files changed
- verification attempted
- remaining risk
- next safe action

## Task queue model

- one narrow scope per task
- smallest safe next action preferred
- escalate when blocked by approval/safety constraints

## Handoff rules

- every handoff must include context, constraints, and next command(s)
- each handoff should declare what changed and what remains uncertain
- unresolved items go to `docs/roadmap/NEXT_PR_QUEUE.md`

## Review rules

- all non-trivial changes go through manual review.
- evidence requirements must be explicit.
- unknown claims must be marked `planned` until confirmed.

## Safety rules

- no secrets
- no private keys
- no private host names
- no live SSH execution without explicit approval

## Example tasks

- Update `PUBLIC_READINESS` blockers
- Create Obsidian starter notes
- Run and summarize lightweight check commands
- Prepare release-readiness status notes

## Future automation

- keep this runtime as supervised and traceable.
- avoid unlimited delegation loops.
- keep escalation clear to human review.
