# SEIS Second Brain MCP Quickstart

## Purpose

This guide exposes the SEIS Second Brain as a local, zero-key MCP context
surface. It is designed for a checked-out SEIS repository and an MCP client
that can start a local stdio server.

The current implementation is Local Demo and read-only. It provides
repo-owned contract metadata, installed-AI status context, nine managed agent
lanes, and the 13-agent roster. It does not connect to a model provider or
access a private Obsidian vault.

## Prerequisites

- A local checkout of this repository.
- Node.js available on `PATH`.
- An MCP client that supports a local stdio server configuration.

No provider key, SSH key, cloud account, or GitHub token is required for this
local context surface.

## Verify The Checkout

Run these commands from the repository root before adding the MCP client
configuration:

```bash
node --test packages/seis-ai/test/mcp-smoke.test.mjs
npm run check:seis-second-brain
```

The smoke test verifies the MCP resource list and a read of
`seis://brain/second-brain-system.json`.

## Generic MCP Client Configuration

MCP clients use different configuration file locations and schemas. Adapt this
generic entry to the client you use, replacing `/absolute/path/to/SEIS` with
your local checkout path:

```json
{
  "mcpServers": {
    "seis-second-brain": {
      "command": "node",
      "args": [
        "/absolute/path/to/SEIS/packages/seis-ai/bin/seis-mcp.mjs"
      ]
    }
  }
}
```

The entrypoint is `packages/seis-ai/bin/seis-mcp.mjs`. It starts the same local
stdio runtime covered by the repository smoke test; it does not install
dependencies or call a remote MCP server.

## Read The Second Brain Contract

After the client starts the server, use its `resources/list` capability and
read this resource:

```text
seis://brain/second-brain-system.json
```

The resource is the canonical public-safe contract for:

- Six installed AI profiles recorded as Local Demo, Missing Key, Disabled, or
  review-context states.
- Nine managed lanes: SEIS Hub, SEIS Cloud, SEIS-Code, SEIS-Design, SEIS-DATA,
  SEIS Security, SEIS Research, SEIS Automation, and SEIS Product.
- The 13-agent autonomous roster, whose current statuses remain
  status/plan-only or blocking review gate.
- The repo-owned Obsidian context pack at
  `seis-brain/vault/12_Context_Packs/SEIS Obsidian Context.md`.

The companion resources `seis://agent/plugin-integration.json` and
`seis://ai/mcp-runtime-contract.json` describe plugin integration and the
local MCP runtime boundary.

## Optional Review Prompt

Use `prompts/get` with `second_brain_review` when an MCP client needs a
structured, evidence-backed proposal. The prompt requires the client to read
the canonical Second Brain contract first, select only relevant lanes, and
list validation plus human-approval requirements. It does not authorize a
provider call, private vault read, SSH, deployment, GitHub mutation, or
autonomous write.

## Managed Lane Tools

The following tool pairs return status or plans only. They do not grant write,
provider, SSH, deployment, or GitHub authority.

| Lane | Status tool | Plan tool |
| --- | --- | --- |
| SEIS Hub | `seis_hub_status` | `seis_hub_plan` |
| SEIS Cloud | `seis_cloud_status` | `seis_cloud_plan` |
| SEIS-Code | `seis_code_status` | `seis_code_plan` |
| SEIS-Design | `seis_design_status` | `seis_design_plan` |
| SEIS-DATA | `seis_data_status` | `seis_data_plan` |
| SEIS Security | `seis_security_status` | `seis_security_plan` |
| SEIS Research | `seis_research_status` | `seis_research_plan` |
| SEIS Automation | `seis_automation_status` | `seis_automation_plan` |
| SEIS Product | `seis_product_status` | `seis_product_plan` |

## Local Context Profiles

The Second Brain resource also contains nine Local Context Profiles. Each ties
a lane to its status/plan tools, related autonomous agents, repo-owned
Obsidian context, and an allowed review/plan output. The profiles keep
`@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`
explicit while keeping Security, Research, Automation, and Product as
SEIS-Agent embedded lanes. They do not grant private-vault, provider, SSH,
GitHub, deployment, or autonomous-write authority.

## Safety Boundary

- No private Obsidian vault is imported or read.
- No prompt body, credential, API key, cookie, or private key is exposed.
- No provider call, SSH execution, deployment, GitHub mutation, or autonomous
  write is performed.
- The context pack is repo-owned metadata, not model-weight training,
  fine-tuning, or a claim that SEIS owns a foundation model.
- Remove the MCP client entry to stop the local integration; it does not change
  repository state or any external system.

## Next Safe Step

Use the resource and status/plan tools to prepare a reviewable task proposal.
Keep any private vault import, live provider route, connector authentication,
GitHub publication, or external mutation behind explicit user approval.
