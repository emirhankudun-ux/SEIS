---
name: seis-evidence-index
description: Summarize bounded SEIS Wave 1 evidence, marketplace counts, program progress, and recorded attention states without changing files.
---

# SEIS Evidence Index

Use this public seis-repo plugin to inspect the checked-in Wave 1 evidence
index and execution program in one concise, local-only view.

## Safety boundary

- Reads only the checked-in Wave 1 evidence index, Wave 1 program, and its
  committed plugin evidence record.
- Never writes files, installs plugins, starts another service, calls a
  provider, uses the network, reads secrets, or changes GitHub state.
- A ready result means the bounded local input is structurally coherent. It
  does not erase any recorded attention state or prove GitHub, browser,
  provider, installation, publication, deployment, or release behavior.

## Commands

    node scripts/seis-evidence-index-mcp-server.mjs --status
    node scripts/seis-evidence-index-mcp-server.mjs --audit --path .
    node scripts/seis-evidence-index-mcp-server.mjs --evidence

## Goal linkage

Use within SEIS-GOAL-021 and SEIS-BL-021. This fills the gap between the
generated Wave 1 evidence record and the focused project-manifest, UI-state,
focus-navigation, distribution, and provenance audits. It does not replace
those underlying validations.

## Interpreting results

- ready: the two bounded input records have the expected structure and contain
  no machine-specific path or secret-like value.
- attention: an input is missing, unsafe, malformed, or internally
  inconsistent; inspect only the concise finding code.
- recordedAttentionContractIds: a safe list of evidence contracts that the
  source record itself still marks for attention. This is information, not a
  plugin failure or a release decision.

Do not change marketplace placement, source ownership, permissions, release
state, or the Wave program from this output alone. Those changes require a
separate scoped decision and the applicable review.
