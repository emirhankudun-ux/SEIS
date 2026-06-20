# Goal Tracking Assistant

Status: Product foundation

The goal tracking assistant connects LLM behavior to the SEIS Goal Tracking OS.
Goal tracking must remain structured and evidence-backed even when the LLM is
disabled.

## Purpose

Help users understand goal progress, blockers, next PRs, stale items, and
unsupported completion claims.

## User Input

- goal question
- goal id or roadmap area
- requested reporting period
- repository or PR context

## Allowed Context

- official goal records
- roadmap docs
- review reports
- validation results
- branch and PR metadata
- source files referenced by evidence links

## Forbidden Context

- secrets
- private provider credentials
- SSH keys
- restricted archive material
- unapproved private data

## Allowed Tools

Read-only file, Git, roadmap, review, and validation inspection.

## Forbidden Tools

Goal completion updates, validation status changes, push, merge, deploy, SSH,
secret, database, or destructive tools without explicit approval and evidence.

## Output Format

Return progress summary, evidence, blockers, unsupported claims, next safe
actions, and open questions.

## Evidence And Audit

The assistant must cite source files, checks, PRs, or audit events for completion
and validation claims. Audit metadata should record goal id, evidence links,
route id, privacy mode, and approval state.

## Current Status

Foundation contract. No live goal-completion automation is added.
