# SEIS AI Workforce Assignments

## Purpose

Define how SEIS uses installed or available AI assistants as a supervised
engineering workforce without giving any assistant uncontrolled repository,
credential, deployment, or merge authority.

This document turns the informal "hire the installed AIs for their specialist
lanes" plan into a reviewable operating contract.

## Scope

This applies to Codex, Claude, Qwen, Gemini, CodeRabbit, Ollama/local models,
OpenDesign, GitHub Actions, Kimi/Kimi Code when available, and OpenCode.

It does not prove that every route is currently configured, authenticated, or
runtime verified. Availability must be checked before each execution.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Assignment matrix | Documented | `content/development/ai-workforce-assignments.json` | Not wired into a package script yet. | Run `node scripts/check-ai-workforce-assignments.mjs`. |
| Local route inventory | Observed | `npm run ai -- list` on 2026-06-23 | This is route readiness only, not live provider verification. | Re-run before using a secondary assistant. |
| Writer policy | Documented | `AGENTS.md`, `docs/ai/agent-runtime.md`, this document | No runtime enforcement layer yet. | Keep Codex as the only writer for the next change package. |
| Credential boundary | Documented | `SECURITY.md`, `docs/ai/seis-ai-core.md`, this document | No live provider use in this pass. | Keep provider keys server-side and out of prompts/logs. |

## Rules / Policy

- Codex is the primary writer and final integration owner.
- Exactly one assistant may hold writer role for a change package.
- Claude, Qwen, Gemini, OpenDesign, Ollama, Kimi, OpenCode, and CodeRabbit
  operate as scoped reviewers, researchers, designers, or draft helpers unless
  explicitly handed off.
- API keys may exist in the operator environment, but keys are never copied into
  prompts, docs, commits, browser storage, logs, handoff files, or review
  artifacts.
- Secondary assistants receive only the minimum file ranges and context needed
  for their task.
- AI-generated output is untrusted until Codex checks it against repository
  evidence.
- Public-readiness, release-readiness, architecture, model, and security claims
  require validation evidence.
- Push, merge, deploy, SSH, secret rotation, repository settings, public
  visibility changes, model training, dataset downloads, and paid provider
  smoke tests require explicit human approval.

## Assignment Matrix

| Assistant | Role | Primary Duties | Default Authority | Output |
| --- | --- | --- | --- | --- |
| Codex | Primary writer and validator | Repo inspection, focused edits, bug fixes, docs updates, validation, commit/PR prep | Local repository edits only within task scope | Patch, validation log, status report, PR description |
| Claude | Architecture and strategy reviewer | Product strategy, architecture, AGENTS/SECURITY/ARCHITECTURE alignment, high-risk PR review | Review only by default | Architecture review, risk notes |
| Qwen | Contradiction and archive reviewer | Conflict detection, duplicate prompt/archive cleanup, stale-risk analysis | Review only by default | Contradiction report, risk matrix |
| Gemini | Public readiness and UX reviewer | Public readiness, accessibility, UX, documentation clarity, Google ecosystem source comparison when authorized | Review only by default | Readiness notes, UX/accessibility findings |
| CodeRabbit | PR reviewer | Review pull-request diffs after a PR exists | GitHub PR comments only | Review comments |
| Ollama / local model | Private draft and offline helper | Sensitive summaries, offline drafts, no-key local analysis | Draft only by default | Local/private draft |
| OpenDesign | Visual-system reviewer | Command Center, SEIS Desktop, SEIS Code, Video Hero, and Mythic Gacha visual proposals | Design proposal only | Visual-system brief |
| GitHub Actions | Automated validation | Tests, lint, build, docs checks, provider audit, secret scan where configured | Configured CI only | Check run, logs, annotations |
| Kimi / Kimi Code | Conditional code and localization reviewer | Localization, multilingual copy, bounded code second opinion when configured | Review only by default | Copy/code review notes |
| OpenCode | Bounded terminal coding helper | Narrow terminal coding suggestions and debug hypotheses | Patch suggestion only | Suggested patch or debug note |

## Standard Workflow

1. Codex creates the bounded objective, affected paths, risk class, and
   validation target.
2. Claude reviews architecture, product, and governance alignment when the
   change is cross-layer or high-risk.
3. Qwen checks contradictions, duplicate archive material, stale prompts, and
   weak assumptions.
4. Gemini reviews public readiness, UX/accessibility, and documentation clarity
   when user-facing quality matters.
5. OpenDesign proposes visual-system improvements for product surfaces when
   design quality is in scope.
6. Ollama/local model handles private or offline draft work when repository
   sensitivity makes cloud routing inappropriate.
7. Codex applies only evidence-backed changes, validates them, and prepares the
   reviewable diff.
8. GitHub Actions validates configured checks after push/PR.
9. CodeRabbit reviews the PR after it exists.
10. Codex triages review findings, applies fixes, and leaves a final handoff for
    human approval.

## Handoff Package

Every assistant handoff should include:

- objective
- affected paths
- included context
- excluded context
- requested output format
- forbidden actions
- risk class
- validation command
- approval boundary
- expected Codex follow-up

## Evidence Requirements

Before an assistant output becomes repository direction, it needs one of:

- local repository evidence
- passing validation command
- linked source-of-truth document
- review note accepted by Codex with a concrete file/path change
- CI check output after a PR exists

Provider availability, installed CLI routes, and API keys are not evidence that
an integration is live, safe, or production-ready.

## Related Documents

- [AI CLI Stack](../ai-cli-stack.md)
- [SEIS Agent Runtime](../../ai/agent-runtime.md)
- [SEIS AI Core](../../ai/seis-ai-core.md)
- [SEIS Agent Lane Status](../../governance/seis-agent-lane-status.md)
- [Security Policy](../../../SECURITY.md)
- [Root Agent Instructions](../../../AGENTS.md)

## Next Safe Action

Use this matrix to prepare bounded review prompts for Claude, Qwen, Gemini, and
OpenDesign while keeping Codex as the only repository writer.
