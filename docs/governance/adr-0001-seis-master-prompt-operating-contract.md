# ADR 0001: SEIS Master Prompt as Operating Contract

Status: Superseded

## Context

SEIS needs one durable operating contract that can align architecture, security, documentation, AI, cloud, product, design, and repository governance.

## Decision

Root `AGENTS.md` Enterprise v4.0 is the active repository operating
constitution. `docs/governance/seis-master-prompt.md` remains a compatibility
companion enforced through generated reports, CODEOWNERS, plugin skills, data
manifests, and npm quality gates.

## Consequences

Constitutional governance changes must update the root authority, implementation
map, acceptance criteria, objective coverage, operational tracker, generated
reports, and relevant documentation. `npm run check:seis-master-prompt` remains
the dedicated compatibility and drift gate.

Validation must not be claimed unless these commands are actually run or explicitly waived by the maintainer.
