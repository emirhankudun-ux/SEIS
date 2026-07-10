# SEIS Sub-Agent System

## Purpose

SEIS uses a bounded, supervised **sub-autonomous** runtime where each assistant has a
defined role, explicit permission set, and review contract.

## Supervision model

- Human objective defines scope.
- No autonomous repository-wide writes.
- No production or deployment action without explicit review.
- Every non-trivial task includes verification and uncertainty reporting.

## Agent hierarchy

- SEIS Orchestrator
- Architect Agent
- SEIS Brain Curator Agent
- SEIS AI Core Agent
- Obsidian Librarian Agent
- Local AI Manager Agent
- GitHub Governance Agent
- QA Agent
- Security Agent
- PR Rescue Agent
- Public Readiness Agent
- DevOps Agent
- Cloud Agent
- Automation Agent
- Documentation Agent
- Search Agent
- Design Agent
- Code Agent
- Demo Packaging Agent
- UI UX Agent
- Research Agent
- SSH Agent

## Responsibilities

- Preserve user work and repo safety boundaries.
- Keep decision/context records current.
- Provide traceable handoff outputs with assumptions and risk flags.

## Agent operating contract

- Each active agent has:
  - a narrow purpose,
  - bounded input/output scope,
  - documented allowed actions,
  - forbidden actions,
  - evidence-aware outputs.
- All outputs must list objective, touched scope, command evidence, and blockers.
- Agents must use `public`/`planned`/`mock`/`disabled` state labels for runtime claims.
- No agent may imply live provider, SSH, deployment, or repository mutation unless explicit approval is present.

## Allowed actions

- inspect files
- produce scoped recommendations
- create or edit docs within approved scope
- create reports and short task notes

## Forbidden actions

- force push or branch override
- delete unrelated files
- execute destructive or remote commands without explicit approval
- claim production or live capabilities without evidence
- expose keys, tokens, credentials, or private data
- push directly to main

## Agent output contract

Each report must include:

- objective and scope
- files inspected/changed
- action result
- verification evidence
- risks and blockers
- next safe step

## Task queue model

Tasks are queued with:

- priority (`P0`/`P1`/`P2`)
- status (`queued`/`in_progress`/`done`/`blocked`)
- expected verification command
- handoff owner
- explicit review deadline
- blocker reason and unblock condition

## Task queue schema

Each task should follow:

- `id` (short stable)
- `agent` (owner)
- `priority` (`P0`, `P1`, `P2`)
- `status` (`queued`, `in_progress`, `done`, `blocked`)
- `scope`
- `verification`
- `risk`
- `next_step`

## Handoff rules

Each handoff includes:

- context summary
- expected output format
- review checklist
- owner/approver
- explicit rollback path

## Output format

- Task objective
- Inputs inspected
- Actions performed
- Evidence produced
- Risks identified
- Blockers and required approval

## Review rules

- no task is final without explicit risk and blocker callout
- unsafe claims require evidence or explicit `mock`/`planned`/`disabled` labels
- blocked tasks must stay visible in `docs/roadmap/NEXT_PR_QUEUE.md` until resolved

## Safety rules

- never delete user files unless requested
- never commit secrets or private vault content
- never run unauthorized SSH
- no fake completion claims
- no direct publish to main without explicit maintainer release decision.

## Runtime policy markers

- `mock`: behavior is simulated or scaffolded
- `planned`: behavior documented, not yet running
- `real`: behavior has passing evidence gates
- `disabled`: feature intentionally not enabled
- `blocked`: explicit gate or approval missing

## Required evidence

- `git status --short` for current local deltas
- `npm run check:seis-second-brain` for second-brain baseline
- `npm run check:desktop-os` for desktop demo stability
- `npm run check:seis-public-demo-go-no-go -- --run-fast-checks` for release blockers
