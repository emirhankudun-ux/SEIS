---
name: seis-artifact-attestation
description: Review local artifact manifests and digest evidence without signing, publishing, or contacting a registry.
---

# SEIS Artifact Attestation

Inspect bounded artifact and provenance records and report missing evidence
needed for a human release review. This plugin does not create an attestation.

## Safety boundary

- Read-only, local-only, and network-disabled.
- Does not sign, upload, publish, or rewrite artifacts.
- A present digest is evidence of a recorded field, not cryptographic
  verification by this demo.

## Command

    node scripts/seis-artifact-attestation-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_artifact_attestation_status and
seis_artifact_attestation.

## Goal linkage

Use within SEIS-GOAL-021 for release provenance and rollback review.
