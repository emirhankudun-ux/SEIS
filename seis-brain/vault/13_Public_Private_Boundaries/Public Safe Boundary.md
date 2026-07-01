---
type: boundary
module: public-private-boundary
status: active-public-safe
priority: critical
visibility: public
owner: SEIS
---

# Public Safe Boundary

SEIS Brain may contain public-safe architecture, strategy, roadmap, tool
registry, context-pack, validation, and handoff notes. It must not contain
private memory, credentials, private vault note bodies, real SSH host details,
or live provider secrets.

## Allowed

- Public SEIS identity and module descriptions.
- Apple-first strategy and Swift Package notes.
- Public-safe tool registry metadata.
- Demo/local-only boundaries.
- Validation commands and expected checks.
- Human-review and approval requirements.

## Forbidden

- Real API keys.
- Access tokens.
- SSH private keys.
- Private Obsidian note bodies.
- Real host credentials.
- Private personal data.
- Unreviewed assistant output promoted as truth.

## Review Rule

If a note might contain private or credential-bearing material, keep it out of
this public vault. Use only sanitized summaries and record the boundary instead
of the private content.
