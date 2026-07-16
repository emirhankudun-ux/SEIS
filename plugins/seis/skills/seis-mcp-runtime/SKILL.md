---
name: seis-mcp-runtime
description: Use SEIS MCP Runtime for MCP endpoint audits, tool boundary reviews, resource exposure checks, and explicit runtime evidence mapping for secure, scoped, AI-native operations.
---

# SEIS MCP Runtime

## Overview

Use this skill when MCP surfaces are in scope. It focuses on explicit tool
mapping, safe endpoint posture, and compatibility checks between MCP capability,
lane boundaries, and SEIS runtime claims.

## Workflow

1. Read local MCP manifests and connected runtime check scripts.
2. Compare tool availability against declared lane ownership and security boundaries.
3. Validate resource names, tool names, and gate messages for accuracy.
4. Identify drift before publishing any runtime claim in Command Center or AI dashboards.
5. Attach clear remediation next actions when a tool, resource, or endpoint is stale.

## Runtime Boundaries

- Scope: MCP tool inventory, tool-to-lane traceability, resource route visibility.
- Approval: No claim of live external access without explicit verification.
- Evidence: Keep MCP compatibility output and check command history available on the claim surface.
- Privacy: Preserve zero-key principles for default demo mode and avoid secret leakage.

## Guardrails

- Do not expose private tool keys, API tokens, or endpoint secrets in prompt surfaces.
- Do not claim readiness from static manifest copies alone.
- Prefer `planned` when capability exists without active verification.
- Keep MCP compatibility evidence close to the tool that produced it.

## Validation

- `npm run check:plugin-capability-lanes`
- `npm run check:seis-agent-plugin-integration`
- `npm run check:seis-ai-agent`
- `npm run check:seis-specialist-plugins`
