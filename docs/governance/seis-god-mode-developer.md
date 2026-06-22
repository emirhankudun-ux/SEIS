# SEIS God Mode Developer

Status: Active governance lane

God Mode Developer is the SEIS operating mode for high-leverage development
that spans more than one repository layer. It is not permission to make broad,
unreviewable rewrites. It is a stricter mode for producing integrated progress
with explicit evidence.

## Definition

God Mode work must connect implementation, documentation, validation, and
handoff. A change is only God Mode when it improves the system as a whole
instead of adding an isolated artifact.

## Required Discipline

- Inspect repository state before editing.
- Keep user work and unrelated dirty files intact.
- Choose a narrow slice with visible value.
- Improve at least two SEIS layers directly.
- Leave evidence for affected layers.
- Update documentation when behavior or operating rules change.
- State validation honestly.
- Do not claim GitHub, cloud, security, or release readiness without checks.

## Layer Lift

Every God Mode slice should name which layers it touches:

| Layer | Evidence Examples |
| --- | --- |
| Product experience | Command Center behavior, demo surface, user workflow, UX note |
| Repository governance | `AGENTS.md`, roadmap, architecture, issue/PR rules, changelog |
| Agent orchestration | skill, MCP, routing policy, prompt contract, agent lane |
| Automation and quality | check script, generated report, CI workflow, test command |
| Cloud and security | SSH/VPN rule, secret boundary, deploy gate, rollback path |
| Knowledge system | decision record, prompt library, operations note, run-state doc |

Two-layer minimum is required for the implementation. The remaining affected
layers must be acknowledged in the handoff when they are not changed.

## Hard Gates

- No secrets, tokens, private keys, private endpoints, or credentials may be
  added to the repository.
- No generated readiness claim is valid without the matching command or manual
  evidence.
- No broad deletion, restore, rebase, or branch cleanup is allowed without a
  clear owner decision.
- No framework, dependency, MCP surface, or plugin should be added without a
  specific reason.
- No God Mode package should hide unrelated worktree changes.

## Recommended Workflow

1. Inspect `git status`, branch, and remotes.
2. Identify the highest-value narrow slice.
3. Write the intended files before editing.
4. Implement the slice.
5. Update the relevant operating docs.
6. Run the smallest meaningful check when appropriate.
7. Summarize findings, changes, validation, risks, and the next best step.

## Current Quality Gate

Use this lightweight check for the God Mode governance surface:

```bash
npm run check:seis-god-mode-developer
```

This check does not replace the full governance quality suite. It confirms that
the God Mode development lane has a discoverable architecture, governance doc,
run-state doc, changelog entry, and package script.

## Completion Standard

A God Mode change is complete only when the repository is easier to operate
after the change than before it. If the worktree has unrelated or risky pending
changes, the correct output is a narrow improvement plus a clear no-push or
no-commit note.
