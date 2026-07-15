---
name: seis-source-provenance
description: Create a bounded local SHA-256 and classification report for SEIS source files without uploading or modifying them.
---

# SEIS Source Provenance

Use this skill before reviewing, migrating, packaging, or proposing public import of local code and assets.

## Procedure

1. Confirm ownership and public/private boundaries from repository sources.
2. Run `node scripts/seis-source-provenance-mcp-server.mjs --status`.
3. Run `node scripts/seis-source-provenance-mcp-server.mjs --scan --path <workspace> --max-files 250`.
4. Treat hashes as scan-time identity evidence, not proof of ownership or license compatibility.
5. Require provenance, license, secret, dependency, and rollback review before public migration.

## Scope and guardrails

- Hash at most 250 regular files under an explicit workspace, with a 5 MiB per-file limit.
- Relative paths, sizes, SHA-256 hashes, broad source classes, and rights-risk states are emitted.
- Private-risk filenames and sensitive directories are skipped without opening them.
- No uploads, network, writes, deletes, commits, or external tool calls.
- Unknown, asset, generated, and private-risk material remains review-required.

## MCP

- `seis_source_provenance_status`
- `seis_source_provenance_scan`

## Handoff

Report files hashed, skipped reasons, rights-review count, exact command, root name, and the distinction between identity evidence and ownership/license evidence.
