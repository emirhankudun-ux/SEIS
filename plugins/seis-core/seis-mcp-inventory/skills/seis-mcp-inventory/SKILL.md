---
name: seis-mcp-inventory
description: Inventory bounded local MCP manifests without starting servers or claiming connectivity.
---

# SEIS MCP Inventory

Use this skill to summarize local MCP manifest identities, transports, declared
tools and permission fields.

## Safety boundary

- Read-only and local-only.
- Never starts MCP servers, calls tools, authenticates or contacts vendors.
- Declared permissions are metadata, not verified effective permissions.

## Command

    node scripts/seis-mcp-inventory-mcp-server.mjs --inventory --path /path/to/repository

The MCP tools are seis_mcp_inventory_status and seis_mcp_inventory.

## Goal linkage

Use within SEIS-GOAL-021 and send findings to the MCP permission and provenance
review before any integration is enabled.
