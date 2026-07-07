# Full Usage Operating Mode

Date: 2026-07-07

## Scope

This is the full-usage operating mode for SEIS. It turns "use all useful
AI/helpers" into a practical loop across Design, Developer, DevOps, Coding,
LLM, Software Engineering, and AI while keeping repo truth, public-safe
boundaries, and provider identity honest.

## Repository Roles

| Workspace | Role | Current Rule |
| --- | --- | --- |
| canonical SEIS checkout | Primary governance and AI routing source of truth | Codex single writer; Hermes protocol and provider registry validators must pass. |
| Eleni-Neferi selected repo | Creative intelligence atelier with its own orchestration | Read its `AGENTS.md`; use its tool registry, connector permission, agent swarm, and oracle truth-ledger checks only when selected. |
| SEIS-ssh selected repo | Cloud/SSH center worktree | Treat as separate; do not touch unless explicitly selected. |
| iCloud `Github 2` worktrees | Adjacent repo inventory | Discover read-only first; edit only the exact selected `.git` root. |

## Operating Domains

| Domain | Subdomains | Next Gap |
| --- | --- | --- |
| Design | Design system, DesignOps, token governance, brand governance, interaction, motion, accessibility, AI experience design, DevOps/cloud state language, visual QA, UX research, asset provenance, design-to-engineering handoff | Add a domain scorecard that separates visual inspiration, approved assets, generated references, production-ready design decisions, design artifact state, and token ownership. |
| Developer | Developer experience, repository governance, code review, local tooling, per-task helper packets, docs, debugging, CI/runtime depth, dependency governance, package scripts, agent handoff | Create a developer-lane packet with owner, helper role, validator, rollback, runtime depth, dependency policy, and handoff evidence. |
| DevOps | CI/CD, release engineering, observability, SLI/SLOs, incident response, audit logs, public readiness, cloud readiness, SSH safety, IaC planning, promotion matrix, rollback, restore drills, environment parity | Add readiness levels for local-only, dry-run, PR-ready, release-candidate, production-gated, incident, restore-drill, IaC-plan, and IaC-apply states. |
| Coding | Frontend, Swift package models, backend contracts, fixture loading, test fixtures, static checkers, browser smoke, visual baselines, refactoring, code-generation boundaries | Keep Swift model foundation, static web data, governance checkers, browser-smoke evidence, and visual-baseline work as separate PRs. |
| LLM | Provider registry, current-run provider readiness, model router, prompt engine, retention policy, context packs, evaluation, fallback policy, routing ledgers, local model intake, Ollama no-key proof, redacted ledgers | Add current-run provider readiness snapshots, redacted routing decision ledger, prompt/output retention policy, and no-key local startup proof before live LLM routing claims. |
| Software Engineering | Architecture, domain modeling, quality gates, security review, performance budget, accessibility implementation, testing strategy, release readiness, technical debt, architecture scorecard, maintainability | Turn broad quality expectations into tracked architecture, testing, release-readiness, maintainability, and technical-debt scorecards. |
| AI | AI Core, agent swarm, MCP permissioning, installed AI tools, official vendor MCP research, provider readiness snapshots, local AI, cloud AI boundaries, cost/rate-limit incident state, model-scaling research, safety evals, AI safety | Keep automation supervised until runtime, credentials, rate limits, cost state, incident logs, safety evals, provider readiness, and rollback are proven. |

## Full Usage Loop

1. Inspect the current repo truth with `git status --short --untracked-files=all`.
2. Select exactly one repo and one work item.
3. Keep Codex as the only writer.
4. Read the MCP binding resource when MCP help is relevant:
   `seis://ai/full-usage-mcp-binding.json`.
5. Use Hermes, Eleni-Neferi oracle/tool layers, Cursor, Kimi, LM Studio, Ollama,
   or cloud helpers only as bounded reviewers unless a future explicit writer
   handoff exists.
6. Keep prompts tiny, public-safe, and bounded.
7. If a model/provider limit appears, mark that route `Rate Limited` or blocked
   for the decision and visibly move to the next eligible helper.
8. Never pretend the fallback provider is the original provider.
9. Record a repo-only ledger when helper output is used.
10. Run the smallest validator that actually covers the changed contract.
11. Push only verified feature-branch commits after a dry-run and explicit
    approval; protected branches still require PR governance.

## MCP Binding

The full-usage mode is connected to the repo-owned `seis` MCP server through
`content/development/seis-full-usage-mcp-binding.json` and the resource
`seis://ai/full-usage-mcp-binding.json`.

The active local MCP surface is 35 tools, 33 resources, and 3 prompts over
stdio JSON-RPC. Use it for source-of-truth resources, status tools, bounded
checks, and public-safe prompt rendering. External MCPs stay candidate,
verified-task-scoped, or blocked according to the MCP permission risk matrix.

Credentialed provider MCPs, external mutation MCPs, authenticated browser
automation, SSH/cloud/deploy MCPs, and package-runner MCP activation require a
separate owner-approved runbook before use.

## Current Evidence

- SEIS: `npm run check:seis-hermes-computer-use-protocol` passed in the
  current SEIS slice.
- SEIS: `npm run check:seis-ai-core-provider-registry` passed in the current
  SEIS slice.
- Eleni-Neferi: candidate external lane; not current-run verified in this SEIS
  slice.
- SEIS-ssh: candidate external lane; not current-run verified in this SEIS
  slice.
- Owner-reported provider connection: providers are reported connected by the
  owner, so they can be considered candidate routes. This is not by itself proof
  of `credentialed`, `quotaReady`, `verified`, private-data-safe, or
  external-mutation-approved status.

## Boundaries

- No credentials, tokens, private keys, private note bodies, SSH execution,
  deployment, GitHub push/merge, external connector writes, billing actions, or
  destructive operations without explicit owner approval. Feature-branch push
  still requires dry-run evidence and approval.
- No invisible model output is repository evidence.
- Deterministic validators outrank uncaptured model output.
- Provider use requires redacted provider identity, visible route selection,
  owner-approved scope, captured output or deterministic validation, and a
  repo-only ledger. Codex must not read provider credentials.
- MCP use requires server identity, risk record id, selected tool/resource,
  allowed mode, auth boundary, captured output, and validator evidence when the
  output shapes a repo decision.
