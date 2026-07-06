# SEIS Five-Year Agency Orchestration Contract

## Purpose

This document explains the public-safe orchestration contract for SEIS five-year development. It translates the owner-selected A/B/C decisions into a supervised agency-style operating model:

- 5-year roadmap and PR cycles.
- 30 rounds per supervised run when owner-selected.
- 50 program steps across provenance, agent orchestration, MCP policy, AI Core, Apple-first work, SEIS Brain, security, and release governance.
- Task-selected skills, installed-tool verification, and documentation-only candidate pools.
- No fake live AI, no uncontrolled autonomy, no credential storage, and no blind MCP activation.

The machine-readable source is `content/development/seis-five-year-agency-orchestration-contract.json`.

## What This Is

This is a thin orchestration index over existing SEIS registries and ledgers. It does not replace:

- The five-year subagent plan.
- The AI Core subagent operating model.
- The MCP runtime contract.
- The installed AI tools registry.
- The plugin integration registry.
- The source provenance intake manifest.

Instead, it binds those sources into one agency-grade handoff so future runs can coordinate strategy, design, engineering, AI Core, data provenance, cloud safety, security, automation, research, and release governance without inventing a new authority model.

## What This Is Not

This contract is not:

- A background worker.
- A live autonomous scheduler.
- A provider execution engine.
- A package installer.
- A license clearance claim.
- A full archive import.
- A replacement for AGENTS.md.

All runtime authority remains bounded by AGENTS.md and by the checked registry files.

## Operating Model

Each supervised execution cycle uses the same rhythm:

1. Inspect current repository state.
2. Assign a small PR-ready slice.
3. Build only the approved slice.
4. Verify with available checks.
5. Document the result.
6. Report honestly.
7. Continue only when useful safe work remains.

The contract defines ten agency departments:

- Strategy Office.
- Creative Studio.
- Engineering Studio.
- AI Core Lab.
- Data Provenance Desk.
- Cloud Operations.
- Security and QA.
- Release Governance.
- Research Intelligence.
- Automation Office.

Each department has assigned agent lanes, tools, feature areas, and a quality gate.

## Source Rules

Kimi and Stitch sources are treated as immutable references first:

- Kimi v7 is the primary reference.
- Kimi v1-v6 remain evolution evidence.
- Kimi v1-v4 remain early lineage evidence.
- Stitch is a UX screen catalog, module idea pool, and read-only code reference.
- Selected assets or implementation ideas require public-safe review before adoption.
- Full archive dumps stay manifest-level until license, size, and security review are complete.

## MCP and Skills Policy

MCP usage follows this order:

- Official or owner-approved MCPs are eligible for activation.
- Installed MCPs are usable only after verification.
- Candidate MCPs remain documentation-only until reviewed.
- Package runners stay disabled or approval-gated.
- Permissions, secrets, mutation risk, and SEIS value must be documented.

Skills are selected by task and re-evaluated per swarm round when the platform safely supports it.

## AI Core Boundary

The contract preserves three states:

- Demo-only: no-key, no fake live AI.
- Local AI-ready: metadata and readiness docs only unless local runtime is verified.
- Cloud provider-ready: keys-free metadata and backend-isolation planning only.

Provider calls are not allowed by this contract.

## Verification

Run the direct checker:

```bash
node scripts/check-seis-five-year-agency-orchestration-contract.mjs
```

When this contract changes, also run relevant adjacent checks:

```bash
node scripts/check-seis-source-provenance-intake.mjs
npm run check:seis-sub-agent-5-year-plan
npm run check:seis-ai-core-subagent-operating-model
npm run check:seis-ai-truth-boundary-language
```

Swift checks are required only when Swift files are touched.

## Security

This contract must not contain:

- Local machine paths.
- Downloads paths.
- API keys.
- Tokens.
- Private keys.
- Real SSH hosts.
- Provider credentials.

The checker enforces local path and secret-pattern guards on the contract file.

## Next Handoff

Next highest-value work is to use this contract as the guide for one of these PR-sized slices:

- MCP permission risk matrix.
- Stitch UX screen catalog.
- Swift model and manifest bridge.
- Web demo agent panel plan.
- SEIS Brain five-year roadmap context pack expansion.
