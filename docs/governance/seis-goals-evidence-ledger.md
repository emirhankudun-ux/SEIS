# SEIS Goals Evidence Ledger

The goals ledger prevents God Mode work from becoming vague activity. Every active objective must declare module ownership, five-layer coverage, acceptance evidence, validation commands, evidence links, and rollback posture.

## Required goal fields

| Field | Purpose |
| --- | --- |
| `id` | Stable objective identifier. |
| `module` | One of Dashboard, Goals, Repos, Docs, or Agents. |
| `title` | User-readable outcome. |
| `status` | Current delivery state. |
| `layers` | Product, platform, AI, security, and quality coverage. |
| `acceptanceCriteria` | Concrete evidence required before completion. |
| `validationCommands` | Commands that prove the goal-specific gate. |
| `rollbackPlan` | Reversible path if the slice is unsafe or incorrect. |
| `evidenceLinks` | Source-controlled files that support the claim. |

## Operating rule

No SEIS goal may be marked complete unless the ledger contains acceptance evidence and the relevant validation command has been run successfully.

## Current source of truth

```text
content/development/seis-goals-evidence-ledger.json
```

## Quality gate

```bash
npm run check:seis-goals-evidence-ledger
```
