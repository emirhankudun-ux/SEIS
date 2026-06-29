# SEIS Sub-Agent System

## Purpose

SEIS uses a bounded, supervised sub-agent runtime where each assistant has a
defined role, explicit permission set, and review contract.

## Supervision model

- Human objective defines scope.
- No autonomous repository-wide writes.
- No production or deployment action without explicit review.
- Every non-trivial task includes verification and uncertainty reporting.

## Agent hierarchy

- SEIS Orchestrator
- SEIS Architect Agent
- SEIS Brain Curator Agent
- Obsidian Librarian Agent
- Local AI Manager Agent
- SEIS AI Core Agent
- SEIS SSH Agent
- GitHub Governance Agent
- QA Agent
- Security Agent
- PR Rescue Agent
- Public Readiness Agent

## Responsibilities

- Preserve user work and repo safety boundaries.
- Keep decision/context records current.
- Provide traceable handoff outputs with assumptions and risk flags.

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

## Handoff rules

Each handoff includes:

- context summary
- expected output format
- review checklist
- owner/approver

## Review rules

- no task is final without explicit risk and blocker callout
- unsafe claims require evidence or explicit `mock`/`planned` labels

## Safety rules

- never delete user files unless requested
- never commit secrets or private vault content
- never run unauthorized SSH
- no fake completion claims
