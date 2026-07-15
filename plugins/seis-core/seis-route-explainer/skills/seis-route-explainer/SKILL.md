---
name: seis-route-explainer
description: Explain a deterministic local demo route for a SEIS task without calling models or providers.
---

# SEIS Route Explainer

Use this skill to inspect the explainable routing contract for a task and
return a deterministic local/offline-safe demo route.

## Safety boundary

- This is a local demo, not a live provider router.
- Never call a model, provider, network service, or credential store.
- Never present the route as a connected integration or production decision.

## Commands

    node scripts/seis-route-explainer-mcp-server.mjs --status
    node scripts/seis-route-explainer-mcp-server.mjs --explain --taskClass architecture --privacyClass private --offline true

The MCP tools are seis_route_explainer_status and seis_route_explain.
Keep the returned reasons, constraints, and mode in any evidence record.

## Goal linkage

Use this within SEIS-GOAL-021. The output is suitable for contract and UI
prototyping only; it does not replace router evaluation.
