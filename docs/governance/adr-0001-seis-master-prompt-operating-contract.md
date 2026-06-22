# ADR 0001: SEIS Master Prompt as Operating Contract

Status: Accepted

## Context

SEIS needs one durable operating contract that can align architecture, security, documentation, AI, cloud, product, design, and repository governance.

## Decision

SEIS treats the Master Prompt as an active repository operating contract. It is stored at docs/governance/seis-master-prompt.md and enforced through generated reports, CODEOWNERS, plugin skills, data manifests, and npm quality gates.

## Consequences

Governance changes must update the implementation map, acceptance criteria, objective coverage, operational tracker, generated reports, and relevant documentation. npm run check:seis-master-prompt is the dedicated quality gate.

Validation must not be claimed unless these commands are actually run or explicitly waived by the maintainer.
