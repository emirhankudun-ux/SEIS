# SEIS Plugin/MCP Ten-Year Continuity Map

## Purpose

This document is the repo-backed planning map for using installed AI profiles, plugin capability records, connector policy, and MCP runtime surfaces over a ten-year SEIS development horizon.

## Current State

Planning-only. The current artifact is generated from repo-owned contracts and does not activate live connectors, remote MCP servers, provider credentials, plugin publishing, SSH, deployment, billing, cloud spend, or GitHub mutation.

## Evidence Counts

- Horizon years: 10
- Six-month review windows: 20
- MCP tools: 34
- MCP resources: 29
- MCP prompts: 3
- Installed AI profiles: 24
- Managed sub-agent lanes: 6
- Local AI runtime rows: 9
- Local AI hardware lanes: 5
- Fresh-clone readiness checks: 6
- Fresh-clone everyone-ready blockers: 4
- Connector records: 21

## Hard Stops

- connector_write
- remote_mcp_trust
- provider_credential_use
- external_ai_prompt_or_file_send
- plugin_install_or_marketplace_publish
- ssh_or_deployment
- billing_or_cloud_spend
- github_push_merge_tag_release

## Validation

- npm run check:seis-plugin-mcp-ten-year-continuity-map
- npm run report:seis-plugin-mcp-ten-year-continuity-map
- npm run check:desktop-os
- npm run check:seis-public-ai-readiness
- npm run check:seis-ai-github-readiness-chain

## Next Actions

- Keep the Command Center panel, Desktop validator, Second Brain agent registry, MCP runtime contract, connector registry, and status docs synchronized.
- Promote one live integration at a time only after explicit human approval, credentials review, rollback plan, and security owner signoff.
