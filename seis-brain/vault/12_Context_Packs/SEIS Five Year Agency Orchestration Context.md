---
type: context-pack
module: seis
status: draft
visibility: public
---

# SEIS Five Year Agency Orchestration Context

## Purpose

Use this context pack when continuing SEIS with the five-year supervised agency model. It binds the owner-selected A/B/C decisions into a public-safe run format that future agents can follow without private context.

## SEIS Identity

SEIS is an Apple-first, Swift-first, AI-native Creative Engineering Operating System. The web demo remains public-safe and no-key. The long-term direction remains native Apple quality, SEIS Brain memory, honest AI infrastructure, supervised agent collaboration, and reviewable GitHub evolution.

## Relevant Modules

- `AGENTS.md`
- `content/development/seis-five-year-agency-orchestration-contract.json`
- `content/development/seis-source-provenance-intake.json`
- `content/development/seis-sub-agent-5-year-plan.json`
- `content/development/seis-ai-core-subagent-operating-model.json`
- `content/development/seis-agent-plugin-integration.json`
- `content/development/seis-installed-ai-tools-registry.json`
- `content/development/seis-ai-core-mcp-runtime-contract.json`
- `content/development/seis-ai-core-provider-registry.json`
- `docs/development/seis-five-year-agency-orchestration-contract.md`
- `docs/decisions/adr-0006-seis-five-year-agency-orchestration-contract.md`
- `scripts/check-seis-five-year-agency-orchestration-contract.mjs`

## Allowed Actions

- Run a 30-round supervised cycle when the owner requests it.
- Use subagents for read-only inspection and bounded reports.
- Use Codex as the primary writer.
- Use installed tools only when their status and required evidence are verified.
- Treat candidate MCPs as documentation-only until approved.
- Use Kimi and Stitch packages as provenance and design reference inputs.
- Add small PR-ready changes with direct validation.
- Update SEIS Brain, ADRs, and docs when the change affects architecture.

## Forbidden Actions

- Do not claim live AI unless it was actually verified.
- Do not store credentials, keys, tokens, private hosts, or private paths.
- Do not enable MCPs blindly.
- Do not run package runners without approval when they mutate external state.
- Do not import full archive dumps before license, size, and security review.
- Do not let subagents write files unless a later owner-approved policy explicitly allows it.
- Do not rewrite the web demo as a shortcut.
- Do not create Swift files only for language statistics.

## Public / Private Boundary

Public-safe outputs may include manifest metadata, checksums, public-safe source roles, docs, ADRs, context packs, placeholder configs, and validation scripts.

Private or blocked outputs include raw secrets, real credentials, private SSH hosts, private notes, unreviewed archive dumps, and provider keys.

## Verification Commands

Use the direct contract checker:

```bash
node scripts/check-seis-five-year-agency-orchestration-contract.mjs
```

Use adjacent checks when their sources are touched:

```bash
node scripts/check-seis-source-provenance-intake.mjs
npm run check:seis-sub-agent-5-year-plan
npm run check:seis-ai-core-subagent-operating-model
npm run check:seis-ai-truth-boundary-language
```

Run Swift checks only when Swift files are touched.

## Output Format

Final reports should follow the SEIS Lead Architect report structure:

- Task.
- Scope.
- Actions Taken.
- Files Changed.
- Verification.
- Security.
- MCP / Skills Status.
- Agent-Swarm Rounds.
- Risks.
- Blockers.
- Suggested PR Title.
- Suggested PR Body.
- Suggested Next PR.
- Remaining Gaps.
- Next Highest-Value Work.
- Next Handoff.

## Next Handoff

Use the orchestration contract to choose one PR-sized next slice:

- MCP permission risk matrix.
- Stitch UX screen catalog.
- Swift manifest/model bridge.
- Web demo agent panel plan.
- 30-round supervised run ledger.
