# SEIS MCP Registry

This is the canonical MCP governance entry point. It records what an MCP is
allowed to do; it does not install, authenticate, or activate external
servers.

## Status Model

Use `proposed`, `approved`, `experimental`, `blocked`, `rejected`, or
`deprecated`. External MCPs start read-only and remain blocked from mutation
until source, maintenance, license, permissions, secrets, data exposure,
rollback, and validation are reviewed.

## Current Records

| Record                                                             | Purpose                                      | Current boundary                                                        |
| ------------------------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------- |
| `content/development/seis-mcp-permission-risk-matrix.json`         | Permission and mutation risk model           | Public-safe metadata; write paths are approval-gated                    |
| `content/development/seis-full-usage-mcp-binding.json`             | Repo-owned MCP binding and candidate servers | Local/read-only evidence; external candidates are not runtime authority |
| `docs/platform/seis-official-vendor-mcp-integration-candidates.md` | Official/vendor-owned candidate review       | Documentation-only until individually approved                          |
| `packages/seis-ai/src/mcp/server.mjs`                              | Local stdio protocol surface                 | Runtime schema validation and default-deny mutation                     |

## Permission Rules

- Prefer official or vendor-owned sources and least privilege.
- Validate tool and prompt arguments at runtime, not only in descriptive
  schemas.
- Keep repository paths confined to the repository root.
- Require explicit owner approval for mutation, remote access, deploy, or
  credential-bearing actions.
- Do not print or commit secrets, tokens, private keys, or private MCP context.
- Record failed or unavailable checks instead of inferring readiness.

## Rollback

Disable the affected MCP entry, remove its activation configuration, restore
the prior manifest, and rerun the direct checker and relevant smoke tests.
External activation requires a separate owner-approved change and is outside
this registry document.
