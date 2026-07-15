---
name: seis-changelog-validator
description: Validate bounded local changelog structure without publishing or editing release notes.
---

# SEIS Changelog Validator

Use this skill to inspect local changelog-like Markdown or text files for
version headings and change entries.

## Safety boundary

- Read-only and local-only.
- Never publish, edit, tag or declare a release.
- Missing changelog evidence remains not-verified.

## Command

    node scripts/seis-changelog-validator-mcp-server.mjs --validate --path /path/to/repository

The MCP tools are seis_changelog_validator_status and
seis_changelog_validate.

## Goal linkage

Use within SEIS-GOAL-021 and route findings to release/documentation review.
