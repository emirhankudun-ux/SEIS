# Branch Policy

## Main-Only Operating Model

`main` is the only permanent branch for SEIS.

All accepted work must converge back into `main`. Temporary branches may be used
for pull requests, experiments, migration staging, AI-agent review, or risky
worktree isolation, but they are not long-lived product branches.

## Rules

- Keep `main` protected, reviewable, and rollback-safe.
- Prefer small commits grouped by purpose: governance, docs, feature, test, fix,
  or release.
- Do not delete local or remote branches without verifying merge state,
  ownership, and rollback requirements.
- Do not let generated code, migrated archives, or AI-agent output bypass review.
- Keep GitHub Actions, README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, LICENSE,
  and CONTRIBUTORS aligned with the current open source platform direction.

## Temporary Branch Naming

Temporary branch names should make their purpose obvious:

- `feature/<short-scope>`
- `fix/<short-scope>`
- `docs/<short-scope>`
- `chore/<short-scope>`
- `experiment/<short-scope>`
- AI-managed branches such as `codex/*` or `claude/*`

These branches should be merged, closed, or explicitly retained with a reason.

## Validation

Run the governance gate before publishing branch-policy changes:

```bash
npm run check:open-source-governance
```
