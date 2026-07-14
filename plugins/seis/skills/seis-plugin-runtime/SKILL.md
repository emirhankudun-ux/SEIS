---
name: seis-plugin-runtime
description: Use SEIS Plugin Runtime for controlled plugin discovery, capability lane updates, plugin manifest health checks, release-ready gating, and evidence-first integration planning across SEIS. This skill is for repository-safe plugin work, not ad-hoc marketplace actions.
---

# SEIS Plugin Runtime

## Overview

Use this skill as the SEIS plugin runtime lane. It keeps plugin governance
predictable, visible, and evidence-bound by validating what is installed,
what is enabled, what is gated, and what is safe to route next.

## Workflow

1. Inspect existing plugin contracts, manifest sources, and lane status artifacts.
2. Compare plugin health evidence with the current mission and safety boundary.
3. Plan updates in small, reversible steps with manifest-backed gates.
4. Update capability records, docs, and dashboard-facing evidence only where contract-driven evidence exists.
5. Validate with the corresponding lane checks before any release-facing claim.
6. If a plugin action involves external installers or external permissions, keep it in planned state until explicit approval.

## Runtime Boundaries

- Scope: Plugin registry evidence, lane metadata, manifest sync checks, plugin MCP surface mapping.
- Approval: No auto-installation or unscoped activation.
- Evidence: Keep manifest snapshots, command output, and check command status attached to runtime changes.
- Privacy: Never print or persist credentials, tokens, private keys, or unreviewed secrets.

## Guardrails

- Never mutate plugin state without explicit user intent and corresponding lane ownership.
- Never treat capability inventory as proof of real authentication or production access.
- Never hide unknown plugins or skip dependency mismatch checks.
- Keep installed/enabled lists deterministic and source-controlled.

## Validation

- `npm run check:seis-agent-plugin-integration`
- `npm run check:seis-specialist-plugins`
- `npm run check:plugin-capability-lanes`
- `npm run check:seis-plugin-bundle`
- `npm run sync:seis-plugin-bundle`
