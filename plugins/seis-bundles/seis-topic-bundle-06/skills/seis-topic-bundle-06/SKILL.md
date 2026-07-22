---
name: seis-topic-bundle-06
description: Select and plan with 13 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Cloud Computing 01 of 02

Cloud Computing topic selection bundle with 13 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 13-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Cloud Computing — `seis-topic-cloud-computing` (Cloud Computing)
- SEIS CI/CD — `seis-topic-cloud-computing-ci-cd` (Cloud Computing)
- SEIS Cloud Native — `seis-topic-cloud-computing-cloud-native` (Cloud Computing)
- SEIS Containers — `seis-topic-cloud-computing-containers` (Cloud Computing)
- SEIS DevOps — `seis-topic-cloud-computing-devops` (Cloud Computing)
- SEIS DevSecOps — `seis-topic-cloud-computing-devsecops` (Cloud Computing)
- SEIS Docker — `seis-topic-cloud-computing-docker` (Cloud Computing)
- SEIS Edge Computing — `seis-topic-cloud-computing-edge-computing` (Cloud Computing)
- SEIS Hybrid Cloud — `seis-topic-cloud-computing-hybrid-cloud` (Cloud Computing)
- SEIS Infrastructure — `seis-topic-cloud-computing-infrastructure` (Cloud Computing)
- SEIS Infrastructure as Code — `seis-topic-cloud-computing-infrastructure-as-code` (Cloud Computing)
- SEIS Kubernetes — `seis-topic-cloud-computing-kubernetes` (Cloud Computing)
- SEIS Logging — `seis-topic-cloud-computing-logging` (Cloud Computing)

## MCP tools

- `seis_topic_bundle_06_status` reports package and member-manifest readiness.
- `seis_topic_bundle_06_members` returns the bounded 13-member map.
- `seis_topic_bundle_06_plan` creates a local planning outline without writes.
