# Main-Only Branch Consolidation

SEIS should look simple from the outside: one durable branch, `main`.

This document records the safe consolidation path. It does not delete branches
by itself.

## Current Intent

- `main` is the canonical public branch.
- AI-generated branches are temporary implementation records.
- Valuable code from temporary branches must land in `main` before deletion.
- Branch deletion is allowed only after the maintainer confirms the exact list.

## Safe Review Commands

```bash
git fetch --prune
git branch -r --sort=refname
git branch -r --merged origin/main
git branch -r --no-merged origin/main
```

## Deletion Command Template

Use only after manual confirmation:

```bash
git push origin --delete <branch-name>
```

Do not run broad deletion loops. Do not delete branches based only on naming.
Do not delete a branch that has unmerged work, unclear ownership, or historical
value.

## PR Strategy

For new work:

1. Build on a short-lived branch.
2. Validate locally.
3. Push the branch.
4. Merge through a reviewed PR.
5. Delete the branch after `main` contains the accepted code.

## Contributor Signal

README and release notes should make the active collaboration model clear:

- Human maintainer: `emirhankudun-ux`
- AI collaboration: OpenAI Codex and Claude
- IDE surfaces: Antigravity IDE, Cursor, Xcode, Android Studio
