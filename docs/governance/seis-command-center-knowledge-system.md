# SEIS Command Center Knowledge System

The SEIS Command Center Knowledge System turns memory, research, decisions, reusable patterns, security policy, and AI handoffs into an inspectable operating graph. It exists so SEIS knowledge is not just a note archive; it is a governed surface with owners, freshness, evidence, and relationship contracts.

## Source Surface

- `apps/seis-core/index.html`
- `apps/seis-core/script.js`
- `apps/seis-core/styles.css`
- `apps/seis-core/test/seis-core-static.test.js`
- `content/development/seis-command-center-knowledge-system.json`
- `docs/architecture/seis-command-center.md`
- `scripts/check-seis-command-center-knowledge-system.mjs`

## Required Nodes

| Node | Purpose |
| --- | --- |
| Repository Memory | Workspace defaults, branch governance, repo boundaries, and SEIS operating rules |
| Research Sources | Primary-source notes and compatibility assumptions |
| Decision History | ADR candidates, accepted tradeoffs, rejected shortcuts, and migration triggers |
| Reusable Patterns | Repeatable implementation, validation, rollback, and report-refresh patterns |
| Security Policy | No-secret boundaries, permission scopes, and least-privilege rules |
| AI Agent Handoffs | Model lane handoffs, validation ownership, provenance, and stale-memory warnings |

## Evidence Model

The knowledge system must expose memory evidence and the rest of the operating graph as first-class release evidence:

- Knowledge graph nodes with owner, type, status, signal, and links.
- Relationship contracts that explain how memory, research, policy, automation, and plugins connect.
- Memory evidence with source, scope, freshness, status, and evidence path.
- Decision history with owner, status, evidence, and impact.
- Reusable patterns with reuse rule, status, and evidence.

## Security Boundary

The Knowledge System must not store API keys, tokens, SSH private keys, provider credentials, certificates, provisioning files, or private cloud material. It stores only summaries, evidence paths, freshness notes, owners, decisions, and reusable patterns.

## Quality Gate

```bash
npm run check:seis-command-center-knowledge-system
```
