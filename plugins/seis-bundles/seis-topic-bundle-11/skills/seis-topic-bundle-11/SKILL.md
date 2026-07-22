---
name: seis-topic-bundle-11
description: Select and plan with 10 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Cybersecurity 02 of 02

Cybersecurity topic selection bundle with 10 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 10-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Network Security — `seis-topic-cybersecurity-network-security` (Cybersecurity)
- SEIS Privacy — `seis-topic-cybersecurity-privacy` (Cybersecurity)
- SEIS RBAC — `seis-topic-cybersecurity-rbac` (Cybersecurity)
- SEIS Risk Management — `seis-topic-cybersecurity-risk-management` (Cybersecurity)
- SEIS Secrets Management — `seis-topic-cybersecurity-secrets-management` (Cybersecurity)
- SEIS Security Auditing — `seis-topic-cybersecurity-security-auditing` (Cybersecurity)
- SEIS Supply Chain Security — `seis-topic-cybersecurity-supply-chain-security` (Cybersecurity)
- SEIS Threat Intelligence — `seis-topic-cybersecurity-threat-intelligence` (Cybersecurity)
- SEIS Threat Modeling — `seis-topic-cybersecurity-threat-modeling` (Cybersecurity)
- SEIS Zero Trust — `seis-topic-cybersecurity-zero-trust` (Cybersecurity)

## MCP tools

- `seis_topic_bundle_11_status` reports package and member-manifest readiness.
- `seis_topic_bundle_11_members` returns the bounded 10-member map.
- `seis_topic_bundle_11_plan` creates a local planning outline without writes.
