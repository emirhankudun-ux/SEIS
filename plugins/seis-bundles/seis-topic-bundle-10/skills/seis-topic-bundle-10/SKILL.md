---
name: seis-topic-bundle-10
description: Select and plan with 11 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Cybersecurity 01 of 02

Cybersecurity topic selection bundle with 11 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 11-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Cybersecurity — `seis-topic-cybersecurity` (Cybersecurity)
- SEIS ABAC — `seis-topic-cybersecurity-abac` (Cybersecurity)
- SEIS AI Security — `seis-topic-cybersecurity-ai-security` (Cybersecurity)
- SEIS Application Security — `seis-topic-cybersecurity-application-security` (Cybersecurity)
- SEIS Authentication — `seis-topic-cybersecurity-authentication` (Cybersecurity)
- SEIS Authorization — `seis-topic-cybersecurity-authorization` (Cybersecurity)
- SEIS Compliance — `seis-topic-cybersecurity-compliance` (Cybersecurity)
- SEIS Encryption — `seis-topic-cybersecurity-encryption` (Cybersecurity)
- SEIS Identity Management — `seis-topic-cybersecurity-identity-management` (Cybersecurity)
- SEIS Incident Response — `seis-topic-cybersecurity-incident-response` (Cybersecurity)
- SEIS Information Security — `seis-topic-cybersecurity-information-security` (Cybersecurity)

## MCP tools

- `seis_topic_bundle_10_status` reports package and member-manifest readiness.
- `seis_topic_bundle_10_members` returns the bounded 11-member map.
- `seis_topic_bundle_10_plan` creates a local planning outline without writes.
