---
name: seis-topic-bundle-07
description: Select and plan with 12 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Cloud Computing 02 of 02

Cloud Computing topic selection bundle with 12 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 12-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Metrics — `seis-topic-cloud-computing-metrics` (Cloud Computing)
- SEIS Monitoring — `seis-topic-cloud-computing-monitoring` (Cloud Computing)
- SEIS Networking — `seis-topic-cloud-computing-networking` (Cloud Computing)
- SEIS Observability — `seis-topic-cloud-computing-observability` (Cloud Computing)
- SEIS Platform Engineering — `seis-topic-cloud-computing-platform-engineering` (Cloud Computing)
- SEIS Private Cloud — `seis-topic-cloud-computing-private-cloud` (Cloud Computing)
- SEIS Public Cloud — `seis-topic-cloud-computing-public-cloud` (Cloud Computing)
- SEIS Serverless — `seis-topic-cloud-computing-serverless` (Cloud Computing)
- SEIS Site Reliability Engineering — `seis-topic-cloud-computing-site-reliability-engineering` (Cloud Computing)
- SEIS Telemetry — `seis-topic-cloud-computing-telemetry` (Cloud Computing)
- SEIS Tracing — `seis-topic-cloud-computing-tracing` (Cloud Computing)
- SEIS Virtualization — `seis-topic-cloud-computing-virtualization` (Cloud Computing)

## MCP tools

- `seis_topic_bundle_07_status` reports package and member-manifest readiness.
- `seis_topic_bundle_07_members` returns the bounded 12-member map.
- `seis_topic_bundle_07_plan` creates a local planning outline without writes.
