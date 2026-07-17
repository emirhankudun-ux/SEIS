# Local Access Boundary QA

Status: public-safe evidence note.

This note documents the public-safe QA boundary for the troubleshooting update that covers iCloud Drive / Full Disk Access local checkout failures.

## Scope

- Document local macOS/iCloud file-provider failures where repo metadata is visible but file reads fail with `Operation not permitted` or `EPERM`.
- Keep recovery guidance public-safe and portable across machines.
- Avoid treating local privacy boundaries as repository corruption.
- Avoid claiming build, validator, SSH, cloud, or deployment failures until the same commands are reproduced from an accessible checkout.

## Evidence

GitHub-side evidence for this PR:

- The branch is based on `main`.
- The troubleshooting update is documentation-only.
- The public guidance avoids personal paths, credentials, hostnames, tokens, private keys, OCIDs, and live-provider claims.
- The guidance prefers narrow probes before broad scans.
- The guidance recommends Full Disk Access, fully downloaded iCloud folders, or a non-iCloud clone/worktree as safe recovery options.

## Non-Claims

- This is not proof that local file access is restored.
- This is not proof that public-readiness validators pass locally.
- This is not proof that live SSH, Oracle, Cloudflare, Codespaces, GitHub automation, or deployment is ready.
- This does not replace running checks from an accessible checkout.

## Verification To Run From An Accessible Checkout

```bash
sed -n '1,80p' docs/TROUBLESHOOTING.md
npm run check:foundation
npm run check:open-source-governance
npm run check:js
git diff --check -- docs/TROUBLESHOOTING.md docs/reviews/LOCAL_ACCESS_BOUNDARY_QA.md
```

If those commands fail before project code runs with `Operation not permitted`, `EPERM`, or cwd errors, treat the result as a local access boundary and retry from an approved or non-iCloud checkout.

## Security

- No secrets are required.
- No SSH private keys are required.
- No API keys are required.
- No real host details are required.
- No live cloud or deployment claim is made.
