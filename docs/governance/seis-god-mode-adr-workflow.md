# SEIS God Mode ADR Workflow

God Mode development requires architectural decisions to be explicit when a change affects system boundaries, governance, agent behavior, security, release readiness, or long-term maintainability.

## Workflow

| Step | Rule |
| --- | --- |
| Scope | Define affected modules, layers, and user outcomes before editing. |
| Decision | Record architecture decisions when the change affects governance, platform, agents, security, release, or maintainability. |
| Implementation | Use bounded, reversible slices with source-controlled contracts, docs, scripts, and UI when user-visible. |
| Validation | Run or request the relevant validation plan commands before completion, commit, push, or release claims. |
| Handoff | Report changes, validation status, risks, rollback, and next steps without hiding unverified work. |

## ADR requirement

Use [seis-adr-template.md](./seis-adr-template.md) for decisions that change SEIS operating rules or durable architecture.

## Example ADR

The first active example is:

```text
docs/adr/0001-seis-god-mode-operating-system.md
```

## Quality gate

```bash
npm run check:seis-god-mode-adr-workflow
```
